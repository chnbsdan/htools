import {
  articleFromRow,
  createArticleId,
  getDatabase,
  json,
  normalizeFeedItemTags,
  normalizeFeedItemSummary,
  normalizeFeedItemTitle,
  requireAdmin,
  type ArticleRow,
  type ContentItemRow,
  type Env
} from "../../../../_shared";

export const onRequestPost: PagesFunction<Env> = async ({
  request,
  env,
  params
}) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const id = String(params.id ?? "");
    const db = await getDatabase(env);
    const item = await db.prepare(
      `SELECT content_items.*, content_sources.title AS source_title,
              content_sources.url AS source_url
       FROM content_items
       JOIN content_sources ON content_sources.id = content_items.source_id
       WHERE content_items.id = ?`
    )
      .bind(id)
      .first<ContentItemRow>();

    if (!item) {
      return json({ error: "Content item not found." }, { status: 404 });
    }

    const payload = await request.json().catch(() => ({}));
    const category =
      typeof (payload as { category?: unknown }).category === "string"
        ? (payload as { category: string }).category.trim().slice(0, 48)
        : "";
    const published = (payload as { published?: unknown }).published === true;

    if (
      !category ||
      category === "全部" ||
      category === "精选" ||
      category.toLowerCase() === "all" ||
      category.toLowerCase() === "featured"
    ) {
      return json(
        { error: "Article category is required." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const articleTitle = normalizeFeedItemTitle(
      item.title,
      item.content || item.summary,
      item.summary
    );
    const articleSummary = normalizeFeedItemSummary(
      item.summary,
      item.content || item.summary,
      articleTitle
    );
    const articleTags = normalizeFeedItemTags(
      safelyParseTags(item.tags),
      item.title,
      item.summary,
      item.content
    );

    if (item.article_id) {
      const existingArticle = await db.prepare("SELECT * FROM articles WHERE id = ?")
        .bind(item.article_id)
        .first<ArticleRow>();

      if (
        existingArticle &&
        isContentItemLinkedArticle(item, existingArticle, articleTitle)
      ) {
        return json({ article: articleFromRow(existingArticle) });
      }

      await db.prepare(
        `UPDATE content_items
         SET article_id = NULL, updated_at = ?
         WHERE id = ?`
      )
        .bind(now, id)
        .run();
    }

    const existingArticle = await db.prepare(
      `SELECT * FROM articles
       WHERE instr(content, ?) > 0
       ORDER BY updated_at DESC
       LIMIT 1`
    )
      .bind(createContentItemMarker(item.id))
      .first<ArticleRow>();

    if (existingArticle) {
      await db.prepare(
        `UPDATE content_items
         SET article_id = ?, updated_at = ?
         WHERE id = ?`
      )
        .bind(existingArticle.id, now, id)
        .run();

      return json({ article: articleFromRow(existingArticle) });
    }

    const articleId = createArticleId();
    const slug = await createUniqueContentArticleSlug(db, item);
    const contentBody = item.content || item.summary || item.title;
    const content = `${contentBody}\n\n${createContentItemMarker(item.id)}\n\n## \u539f\u6587\u94fe\u63a5\n\n[\u9605\u8bfb\u539f\u6587](${item.url})`;
    const publishedAt = item.published_at ?? (published ? now : null);

    await db.prepare(
      `INSERT INTO articles
        (id, slug, title, summary, content, cover_image, category, tags,
         published, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        articleId,
        slug,
        articleTitle,
        articleSummary || articleTitle,
        content,
        item.cover_image,
        category,
        JSON.stringify(articleTags),
        published ? 1 : 0,
        now,
        now,
        publishedAt
      )
      .run();

    await db.prepare(
      `UPDATE content_items
       SET article_id = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(articleId, now, id)
      .run();

    const article = await db.prepare("SELECT * FROM articles WHERE id = ?")
      .bind(articleId)
      .first<ArticleRow>();

    return json({ article: article ? articleFromRow(article) : null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to convert content item.";
    return json({ error: message }, { status: 400 });
  }
};

async function createUniqueContentArticleSlug(
  db: D1Database,
  item: ContentItemRow
) {
  const baseDate = getContentSlugDate(item);

  for (let index = 0; index < 1000; index += 1) {
    const candidate = formatContentTimestampSlug(
      new Date(baseDate.getTime() + index)
    );
    const row = await db.prepare("SELECT id FROM articles WHERE slug = ?")
      .bind(candidate)
      .first<{ id: string }>();

    if (!row) {
      return candidate;
    }
  }

  return formatContentTimestampSlug(new Date());
}

function getContentSlugDate(item: ContentItemRow) {
  const date = new Date(
    item.published_at ?? item.created_at ?? new Date().toISOString()
  );
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;

  if (validDate.getUTCMilliseconds() === 0) {
    validDate.setUTCMilliseconds(
      createStableMillisecond(
        `${item.external_id || ""}|${item.url || ""}|${item.title || ""}`
      )
    );
  }

  return validDate;
}

function formatContentTimestampSlug(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0"),
    String(date.getUTCMilliseconds()).padStart(3, "0")
  ].join("");
}

function createContentItemMarker(id: string) {
  return `<!-- htools:content-item:${id} -->`;
}

function isContentItemLinkedArticle(
  item: ContentItemRow,
  article: ArticleRow,
  articleTitle: string
) {
  if (article.content.includes(createContentItemMarker(item.id))) {
    return true;
  }

  if (article.title.trim() !== articleTitle.trim()) {
    return false;
  }

  const itemUrl = item.url.trim();

  return !itemUrl || article.content.includes(itemUrl);
}

function createStableMillisecond(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) % 1000;
}

function safelyParseTags(value: string) {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
}
