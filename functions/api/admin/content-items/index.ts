import {
  contentItemFromRow,
  getDatabase,
  json,
  requireAdmin,
  type ContentItemRow,
  type Env
} from "../../../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const db = await getDatabase(env);
    const url = new URL(request.url);
    const sourceId = url.searchParams.get("sourceId") ?? "";
    const conditions: string[] = [];
    const params: string[] = [];

    if (sourceId) {
      conditions.push("content_items.source_id = ?");
      params.push(sourceId);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const result = await db.prepare(
      `SELECT content_items.*, content_sources.title AS source_title,
              content_sources.url AS source_url,
              articles.id AS linked_article_id,
              articles.slug AS linked_article_slug,
              articles.title AS linked_article_title,
              articles.content AS linked_article_content,
              articles.published AS linked_article_published
       FROM content_items
       JOIN content_sources ON content_sources.id = content_items.source_id
       LEFT JOIN articles ON articles.id = content_items.article_id
       ${whereClause}
       ORDER BY COALESCE(content_items.published_at, content_items.updated_at, content_items.created_at) DESC
       LIMIT 300`
    )
      .bind(...params)
      .all<ContentItemRow>();

    return json({
      items: result.results.map(contentItemFromRow)
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load content items.";
    return json({ error: message }, { status: 500 });
  }
};
