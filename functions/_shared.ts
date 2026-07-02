export type Env = {
  DB: D1Database;
  ADMIN_PASSWORD?: string;
};

export type GitHubSettings = {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  owner: string;
  repo: string;
  labels: string[];
};

export type GitHubSettingsInput = {
  enabled?: unknown;
  clientId?: unknown;
  clientSecret?: unknown;
  owner?: unknown;
  repo?: unknown;
  labels?: unknown;
};

export type GitHubSessionRow = {
  token: string;
  github_id: number;
  github_login: string;
  github_name: string | null;
  avatar_url: string;
  html_url: string;
  access_token: string;
  created_at: string;
  expires_at: string;
};

export type GitHubToolMetadata = {
  owner: string;
  repo: string;
  fullName: string;
  name: string;
  description: string;
  url: string;
  demoUrl: string;
  image: string;
  stars: number;
  forks: number;
  language: string;
  license: string;
  topics: string[];
  updatedAt: string;
};

type GitHubRepoResponse = {
  full_name?: string;
  name?: string;
  owner?: {
    login?: string;
  };
  html_url?: string;
  description?: string | null;
  homepage?: string | null;
  language?: string | null;
  license?: {
    spdx_id?: string | null;
    name?: string | null;
  } | null;
  topics?: unknown;
  stargazers_count?: number;
  forks_count?: number;
  updated_at?: string;
};

export type ToolRow = {
  id: string;
  name: string;
  description: string;
  url: string;
  demo_url?: string;
  image: string;
  category: string;
  tags: string;
  github_language?: string;
  github_license?: string;
  featured: number;
  created_at: string;
  updated_at: string;
};

export type ToolPayload = {
  name?: unknown;
  description?: unknown;
  url?: unknown;
  demoUrl?: unknown;
  demo_url?: unknown;
  image?: unknown;
  category?: unknown;
  tags?: unknown;
  githubLanguage?: unknown;
  github_language?: unknown;
  githubLicense?: unknown;
  github_license?: unknown;
  featured?: unknown;
};

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string;
  published: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ArticlePayload = {
  title?: unknown;
  slug?: unknown;
  summary?: unknown;
  content?: unknown;
  coverImage?: unknown;
  cover_image?: unknown;
  category?: unknown;
  tags?: unknown;
  published?: unknown;
  publishedAt?: unknown;
  published_at?: unknown;
};

export type ContentSourceRow = {
  id: string;
  title: string;
  url: string;
  site_url: string;
  description: string;
  category: string;
  tags: string;
  enabled: number;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
};

export type ContentItemRow = {
  id: string;
  source_id: string;
  source_title?: string;
  source_url?: string;
  external_id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  author: string;
  cover_image: string;
  category: string;
  tags: string;
  published_at: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
  article_id: string | null;
  linked_article_id?: string | null;
  linked_article_slug?: string | null;
  linked_article_title?: string | null;
  linked_article_content?: string | null;
  linked_article_published?: number | null;
};

export type ContentSourcePayload = {
  title?: unknown;
  url?: unknown;
  siteUrl?: unknown;
  site_url?: unknown;
  description?: unknown;
  category?: unknown;
  tags?: unknown;
  enabled?: unknown;
};

export type ParsedFeedItem = {
  externalId: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  author: string;
  coverImage: string;
  tags: string[];
  publishedAt: string | null;
};

export type ParsedFeed = {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  items: ParsedFeedItem[];
};

export type AdminCategoryScope = "tools" | "articles" | "content";

export type AdminCategorySettings = Record<AdminCategoryScope, string[]>;

export type AdminPasswordSettings = {
  algorithm: "PBKDF2-SHA256";
  iterations: number;
  salt: string;
  hash: string;
  updatedAt: string;
};

export type ProxySettings = {
  enabled: boolean;
  baseUrl: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

export type FooterSettings = {
  description: string;
  authorName: string;
  authorUrl: string;
  copyright: string;
  sponsorLabel: string;
  sponsorUrl: string;
  socialLinks: FooterLink[];
  groups: FooterLinkGroup[];
};

export type SiteSettings = {
  name: string;
  subtitle: string;
  iconUrl: string;
  aboutContent: string;
  footer?: FooterSettings;
};

const encoder = new TextEncoder();
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const ADMIN_PASSWORD_KEY = "admin_password";
const ADMIN_PASSWORD_ITERATIONS = 100000;
const DATABASE_NOT_BOUND_MESSAGE = "请检查您的项目是否已正确绑定数据库。";
const GITHUB_SETTINGS_KEY = "github_settings";
const GITHUB_SESSION_COOKIE = "htools_github_session";
const GITHUB_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PROXY_SETTINGS_KEY = "proxy_settings";
const SITE_SETTINGS_KEY = "site_settings";
const ADMIN_CATEGORY_SETTINGS_KEY = "admin_category_settings";
const SITE_ICON_DATA_URL_MAX_LENGTH = 1500 * 1024;
const SITE_ICON_DATA_URL_PATTERN =
  /^data:image\/(?:png|jpe?g|webp|gif|x-icon|vnd\.microsoft\.icon);base64,[a-z0-9+/]+=*$/i;
const DEFAULT_ABOUT_CONTENT = `# 关于我

大家好，我是**周润发**（网名），也是 [blog.zrf.me](https://blog.zrf.me/) 的博主。

一直以来我就一个爱好：作为一枚小白，致力于折腾并 **收录各种开源、好用的互联网项目** 。分享实用资源嘛，好用就完事了！

但在写博客的过程中，我遇到个痛点：网上好玩的工具实在太多了，但并不是每个项目都适合正儿八经地水一篇长博文。有些小工具明明极其优秀，却因为体量小，找不到合适的渠道去展示和分享，最后只能默默躺在我的收藏夹里吃灰。

### 一直想做这样一个工具导航站，所以，**HTools** 诞生了。

把这些宝藏项目全收录进去。市面上类似的能使用 “赛博大善人” cloudflare 部署，且适合我用于收集的开源导航程序我翻了个底朝天，说实话，UI 外观没几个长在我的审美上的。

但我自己又没啥建站和前端技术，怎么办？**遇事不决，AI 解决！**

我直接“天才程序员上线”，至于 UI 嘛，全靠“抄”也确实是抄，然后加上我自己的想法构思。一通折腾下来，居然真的实现了！现在这个项目的基本使用体验，已经和我脑海中完美的工具站一模一样了。为了方便大家自己部署，我还给项目设置了非常多的自定义选项。

当然，毕竟代码是靠 AI 搓出来的，如果哪位开发大佬路过，愿意提交 PR 来帮我进一步完善优化这个项目，那就再好不过了（抱大腿）。

---

我希望 HTools 不是一个冷冰冰的链接列表，而是一个能持续沉淀好东西的小仓库。看到不错的项目，就顺手放进来；哪天真要用，也不用再翻聊天记录、收藏夹和浏览器历史。

这里更适合收录这些内容：

- **开源项目** - 有意思、能部署、值得研究的仓库
- **在线工具** - 打开就能用，解决一个具体问题
- **部署方案** - 适合 Cloudflare、轻量服务器、自建环境的实践
- **效率资源** - 能省时间、少踩坑、让工作流更顺手的小东西

当然，这些是我感兴趣的内容，如果你也发现了好用的工具和感兴趣的内容，欢迎通过网站提交给我。只要它确实有用、介绍清楚、链接可靠，我都会认真看看。这个项目本身也会继续更新，目标很简单：把零散的好项目收拾得更清楚，让需要的人更快找到。

**如果 HTools 对你有帮助，也欢迎给项目点个 Star：[shaoyouvip/htools](https://github.com/shaoyouvip/htools)**

慢慢收集，慢慢打磨。能帮到一个人，就不算白折腾。

::links
## 产品链接

- [作者](https://github.com/shaoyouvip/)
- [主页](https://zrf.me/)
- [博客](https://blog.zrf.me/)
- [Github](https://github.com/shaoyouvip/htools)
- [Telegram](https://d.zrf.me/tgq)
::`;
const LEGACY_DEFAULT_FOOTER_DESCRIPTION =
  "探索精选工具和资源，加速您的独立开发之旅";
const PREVIOUS_DEFAULT_FOOTER_DESCRIPTION = "收录各种开源、好用的互联网项目";
const TEMP_DEFAULT_FOOTER_DESCRIPTION = "整理开源项目与实用工具";
const DEFAULT_FOOTER_DESCRIPTION = "致力于收录各种开源、好用的互联网项目";
const FOOTER_PROJECT_URL = "https://github.com/shaoyouvip/htools";
const LEGACY_DEFAULT_SPONSOR_URL = "https://www.buymeacoffee.com/";
const LEGACY_DEFAULT_AUTHOR_URL = "https://zrf.me/";
const DEFAULT_SPONSOR_URL = "https://example.com";
const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  description: DEFAULT_FOOTER_DESCRIPTION,
  authorName: "HTools",
  authorUrl: FOOTER_PROJECT_URL,
  copyright: "© 2026 HTools 版权所有，保留所有权利。",
  sponsorLabel: "Buy me a coffee",
  sponsorUrl: DEFAULT_SPONSOR_URL,
  socialLinks: [
    { label: "GitHub", href: "https://github.com/shaoyouvip/htools" },
    { label: "Email", href: "mailto:admin@zrf.me" },
    { label: "Telegram", href: "https://d.zrf.me/tgq" }
  ],
  groups: [
    {
      title: "产品",
      links: [
        { label: "工具", href: "/tools" },
        { label: "文章", href: "/articles" },
        { label: "提交工具", href: "/submit" }
      ]
    },
    {
      title: "支持",
      links: [
        { label: "电子邮件", href: "mailto:admin@zrf.me" },
        { label: "GitHub", href: "https://github.com/shaoyouvip/htools" },
        { label: "Telegram", href: "https://d.zrf.me/tgq" }
      ]
    },
    {
      title: "其他",
      links: [
        { label: "主页", href: "https://zrf.me/" },
        { label: "博客", href: "https://blog.zrf.me" }
      ]
    },
    {
      title: "更多",
      links: [
        { label: "关于我们", href: "/about" },
        { label: "隐私政策", href: "/privacy" },
        { label: "服务条款", href: "/terms" }
      ]
    }
  ]
};
const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: "HTools",
  subtitle: "工具导航站",
  iconUrl: "",
  aboutContent: DEFAULT_ABOUT_CONTENT
};
const ADMIN_CATEGORY_SCOPES = ["tools", "articles", "content"] as const;
const DEFAULT_ADMIN_CATEGORY_SETTINGS: AdminCategorySettings = {
  tools: [],
  articles: [],
  content: []
};
const initializedDatabases = new WeakSet<D1Database>();
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    demo_url TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    github_language TEXT NOT NULL DEFAULT '',
    github_license TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  "CREATE INDEX IF NOT EXISTS idx_tools_category ON tools (category)",
  "CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools (featured)",
  `CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT
  )`,
  "CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published, published_at)",
  "CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug)",
  "CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category, published_at)",
  `CREATE TABLE IF NOT EXISTS content_sources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    site_url TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TEXT
  )`,
  "CREATE INDEX IF NOT EXISTS idx_content_sources_category ON content_sources (category)",
  `CREATE TABLE IF NOT EXISTS content_items (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    published_at TEXT,
    synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    article_id TEXT,
    UNIQUE(source_id, external_id)
  )`,
  "CREATE INDEX IF NOT EXISTS idx_content_items_source ON content_items (source_id)",
  "CREATE INDEX IF NOT EXISTS idx_content_items_category ON content_items (category, published_at)",
  `CREATE TABLE IF NOT EXISTS github_oauth_states (
    state TEXT PRIMARY KEY,
    return_to TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_github_oauth_states_expires_at
    ON github_oauth_states (expires_at)`,
  `CREATE TABLE IF NOT EXISTS github_sessions (
    token TEXT PRIMARY KEY,
    github_id INTEGER NOT NULL,
    github_login TEXT NOT NULL,
    github_name TEXT,
    avatar_url TEXT NOT NULL,
    html_url TEXT NOT NULL,
    access_token TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_github_sessions_expires_at
    ON github_sessions (expires_at)`
];

const TOOL_COLUMN_STATEMENTS = [
  {
    name: "github_language",
    statement: "ALTER TABLE tools ADD COLUMN github_language TEXT NOT NULL DEFAULT ''"
  },
  {
    name: "github_license",
    statement: "ALTER TABLE tools ADD COLUMN github_license TEXT NOT NULL DEFAULT ''"
  }
];
export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...init.headers
    }
  });
}

export function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

export function toolFromRow(row: ToolRow) {
  const { demo_url, github_language, github_license, ...tool } = row;

  return {
    ...tool,
    demoUrl: demo_url ?? "",
    githubLanguage: github_language ?? "",
    githubLicense: github_license ?? "",
    tags: safelyParseTags(row.tags),
    featured: row.featured === 1
  };
}

export function articleFromRow(row: ArticleRow) {
  const { cover_image, ...article } = row;

  return {
    ...article,
    coverImage: cover_image ?? "",
    publishedAt: row.published_at,
    tags: normalizeFeedItemTags(
      safelyParseTags(row.tags),
      row.title,
      row.summary,
      row.content
    ),
    published: row.published === 1
  };
}

export function contentSourceFromRow(row: ContentSourceRow) {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    siteUrl: row.site_url ?? "",
    description: row.description,
    category: row.category,
    tags: safelyParseTags(row.tags),
    enabled: row.enabled === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
    lastSyncedAt: row.last_synced_at
  };
}

export function contentItemFromRow(row: ContentItemRow) {
  const title = normalizeFeedItemTitle(row.title, row.content, row.summary);
  const summary = normalizeFeedItemSummary(row.summary, row.content, title);
  const tags = normalizeFeedItemTags(
    safelyParseTags(row.tags),
    row.title,
    row.summary,
    row.content
  );
  const hasLinkedArticle = isValidLinkedContentItemArticle(row, title);
  const articleId =
    row.linked_article_id === undefined
      ? row.article_id
      : hasLinkedArticle
        ? row.linked_article_id
        : null;
  const articleSlug = hasLinkedArticle ? (row.linked_article_slug ?? "") : "";
  const articlePublished =
    hasLinkedArticle && row.linked_article_published !== undefined
      ? row.linked_article_published === 1
      : null;

  return {
    id: row.id,
    sourceId: row.source_id,
    sourceTitle: row.source_title ?? "",
    sourceUrl: row.source_url ?? "",
    external_id: row.external_id,
    title,
    summary,
    content: row.content,
    url: row.url,
    author: row.author,
    coverImage: row.cover_image ?? "",
    category: row.category,
    tags,
    published_at: row.published_at,
    synced_at: row.synced_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    articleId,
    articleSlug,
    articlePublished
  };
}

function isValidLinkedContentItemArticle(row: ContentItemRow, title: string) {
  if (row.linked_article_id === undefined) {
    return Boolean(row.article_id);
  }

  if (!row.linked_article_id || !row.linked_article_slug) {
    return false;
  }

  const articleContent = row.linked_article_content ?? "";

  if (articleContent.includes(createContentItemMarker(row.id))) {
    return true;
  }

  if ((row.linked_article_title ?? "").trim() !== title.trim()) {
    return false;
  }

  const itemUrl = row.url.trim();

  return !itemUrl || articleContent.includes(itemUrl);
}

function createContentItemMarker(id: string) {
  return `<!-- htools:content-item:${id} -->`;
}

export async function getDatabase(env: Env) {
  if (!env.DB) {
    throw new Error(DATABASE_NOT_BOUND_MESSAGE);
  }

  await ensureDatabaseSchema(env.DB);
  return env.DB;
}

async function ensureDatabaseSchema(db: D1Database) {
  if (initializedDatabases.has(db)) {
    return;
  }

  await db.batch(SCHEMA_STATEMENTS.map((statement) => db.prepare(statement)));
  await ensureToolColumns(db);
  initializedDatabases.add(db);
}

async function ensureToolColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(tools)").all<{ name: string }>();
  const existing = new Set(columns.results.map((column) => column.name));
  const statements = TOOL_COLUMN_STATEMENTS
    .filter((column) => !existing.has(column.name))
    .map((column) => db.prepare(column.statement));

  if (statements.length) {
    await db.batch(statements);
  }
}

export function validateToolPayload(payload: ToolPayload) {
  const name = readRequiredString(payload.name, "name");
  const description = readRequiredString(payload.description, "description");
  const url = readRequiredString(payload.url, "url");
  const demoUrl =
    typeof payload.demoUrl === "string" && payload.demoUrl.trim()
      ? payload.demoUrl.trim()
      : typeof payload.demo_url === "string" && payload.demo_url.trim()
        ? payload.demo_url.trim()
        : "";
  const category = readRequiredString(payload.category, "category");
  const image =
    typeof payload.image === "string" && payload.image.trim()
      ? payload.image.trim()
      : createPreviewUrl(url);
  const tags = Array.isArray(payload.tags)
    ? payload.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];
  const featured = payload.featured === true;
  const isGitHubTool = Boolean(getGitHubRepoPath(url));
  const githubLanguage = isGitHubTool
    ? readOptionalString(
        typeof payload.githubLanguage === "string"
          ? payload.githubLanguage
          : payload.github_language
      ).slice(0, 48)
    : "";
  const githubLicense = isGitHubTool
    ? readOptionalString(
        typeof payload.githubLicense === "string"
          ? payload.githubLicense
          : payload.github_license
      ).slice(0, 64)
    : "";

  try {
    new URL(url);
  } catch {
    throw new Error("url must be a valid URL.");
  }

  if (image) {
    try {
      new URL(image);
    } catch {
      throw new Error("image must be a valid URL.");
    }
  }

  if (demoUrl) {
    try {
      new URL(demoUrl);
    } catch {
      throw new Error("demoUrl must be a valid URL.");
    }
  }

  return {
    name,
    description,
    url,
    demoUrl,
    image,
    category,
    tags,
    githubLanguage,
    githubLicense,
    featured
  };
}

export function validateArticlePayload(payload: ArticlePayload) {
  const title = readRequiredString(payload.title, "title").slice(0, 140);
  const summary = readRequiredString(payload.summary, "summary").slice(0, 260);
  const content = readRequiredString(payload.content, "content").slice(0, 60000);
  const slug =
    typeof payload.slug === "string" && payload.slug.trim()
      ? createArticleSlug(payload.slug)
      : createArticleSlug(title);
  const category = readRequiredString(payload.category, "category").slice(0, 48);

  if (
    category === "全部" ||
    category === "精选" ||
    category.toLowerCase() === "all" ||
    category.toLowerCase() === "featured"
  ) {
    throw new Error("category must be an article category.");
  }

  const coverImage =
    typeof payload.coverImage === "string" && payload.coverImage.trim()
      ? payload.coverImage.trim()
      : typeof payload.cover_image === "string" && payload.cover_image.trim()
        ? payload.cover_image.trim()
        : "";
  const tagValues = Array.isArray(payload.tags)
    ? payload.tags
    : typeof payload.tags === "string"
      ? parseArticleTagString(payload.tags)
      : [];
  const tags = tagValues
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 24);
  const published = payload.published !== false;
  const publishedAt = readOptionalDateString(
    payload.publishedAt ?? payload.published_at,
    "publishedAt"
  );

  if (coverImage) {
    try {
      const url = new URL(coverImage);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error();
      }
    } catch {
      throw new Error("coverImage must be a valid URL.");
    }
  }

  return {
    title,
    slug: slug || createArticleSlug("article"),
    summary,
    content,
    coverImage,
    category,
    tags,
    published,
    publishedAt
  };
}

export function validateContentSourcePayload(
  payload: ContentSourcePayload,
  options: { requireCategory?: boolean } = {}
) {
  const { requireCategory = true } = options;
  const rawUrl = readRequiredString(payload.url, "url");
  const url = normalizeHttpUrl(rawUrl);

  if (!url) {
    throw new Error("url must be a valid URL.");
  }

  const title = readOptionalString(payload.title).slice(0, 120);
  const description = readOptionalString(payload.description).slice(0, 260);
  const siteUrl = normalizeHttpUrl(
    readOptionalString(payload.siteUrl ?? payload.site_url)
  );
  const category = requireCategory
    ? readRequiredString(payload.category, "category").slice(0, 48)
    : readOptionalString(payload.category).slice(0, 48);

  if (
    requireCategory &&
    (category === "全部" ||
      category === "精选" ||
      category.toLowerCase() === "all" ||
      category.toLowerCase() === "featured")
  ) {
    throw new Error("category must be a content category.");
  }
  const tagValues = Array.isArray(payload.tags)
    ? payload.tags
    : typeof payload.tags === "string"
      ? parseArticleTagString(payload.tags)
      : [];
  const tags = tagValues
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 24);
  const enabled = payload.enabled !== false;

  return {
    title,
    url,
    siteUrl,
    description,
    category,
    tags,
    enabled
  };
}

export async function fetchFeedPreview(feedUrl: string): Promise<ParsedFeed> {
  const url = normalizeHttpUrl(feedUrl);

  if (!url) {
    throw new Error("Feed URL must be a valid URL.");
  }

  const response = await fetch(url, {
    headers: {
      Accept:
        "application/atom+xml, application/rss+xml, application/xml, text/xml, */*"
    }
  });

  if (!response.ok) {
    throw new Error(`Feed request failed with status ${response.status}.`);
  }

  const xml = await response.text();
  const parsed = parseFeedXml(xml, url);

  if (!parsed.items.length) {
    throw new Error("No feed items found.");
  }

  return parsed;
}

export async function syncContentSource(db: D1Database, sourceId: string) {
  const source = await db.prepare("SELECT * FROM content_sources WHERE id = ?")
    .bind(sourceId)
    .first<ContentSourceRow>();

  if (!source) {
    throw new Error("Content source not found.");
  }

  if (!source.category.trim()) {
    throw new Error("Content source category is required.");
  }

  const feed = await fetchFeedPreview(source.url);
  const now = new Date().toISOString();
  let imported = 0;
  let updated = 0;
  const sourceTags = safelyParseTags(source.tags);

  await db.prepare(
    `UPDATE content_sources
     SET site_url = ?, description = ?, updated_at = ?, last_synced_at = ?
     WHERE id = ?`
  )
    .bind(
      source.site_url || feed.siteUrl,
      source.description || feed.description,
      now,
      now,
      source.id
    )
    .run();

  for (const item of feed.items.slice(0, 50)) {
    const existing = await db.prepare(
      "SELECT id FROM content_items WHERE source_id = ? AND external_id = ?"
    )
      .bind(source.id, item.externalId)
      .first<{ id: string }>();
    const tags = normalizeContentTags([...sourceTags, ...item.tags]);

    if (existing) {
      await db.prepare(
        `UPDATE content_items
         SET title = ?, summary = ?, content = ?, url = ?, author = ?,
             cover_image = ?, category = ?, tags = ?,
             published_at = ?, synced_at = ?, updated_at = ?
         WHERE id = ?`
      )
        .bind(
          item.title,
          item.summary,
          item.content,
          item.url,
          item.author,
          item.coverImage,
          source.category,
          JSON.stringify(tags),
          item.publishedAt,
          now,
          now,
          existing.id
        )
        .run();
      updated += 1;
    } else {
      await db.prepare(
        `INSERT INTO content_items
          (id, source_id, external_id, title, summary, content, url, author,
           cover_image, category, tags, published_at, synced_at,
           created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          createContentItemId(),
          source.id,
          item.externalId,
          item.title,
          item.summary,
          item.content,
          item.url,
          item.author,
          item.coverImage,
          source.category,
          JSON.stringify(tags),
          item.publishedAt,
          now,
          now,
          now
        )
        .run();
      imported += 1;
    }
  }

  const rows = await db.prepare(
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
     WHERE source_id = ?
     ORDER BY COALESCE(content_items.published_at, content_items.updated_at, content_items.created_at) DESC
     LIMIT 50`
  )
    .bind(source.id)
    .all<ContentItemRow>();

  return {
    imported,
    updated,
    total: feed.items.length,
    items: rows.results.map(contentItemFromRow)
  };
}

function readOptionalDateString(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const timestamp = Date.parse(trimmed);

  if (!Number.isFinite(timestamp)) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return new Date(timestamp).toISOString();
}

function parseArticleTagString(value: string) {
  const lines = value.replace(/\r\n?/g, "\n").split("\n");
  const tagKeyIndex = lines.findIndex((line) => /^\s*tags\s*:/i.test(line));
  const tags: string[] = [];

  function cleanTag(tag: string) {
    return tag
      .trim()
      .replace(/^[-*]\s*/, "")
      .replace(/^["']|["']$/g, "")
      .trim();
  }

  function pushSegment(segment: string) {
    const normalized = segment
      .trim()
      .replace(/^tags\s*:\s*/i, "")
      .replace(/^\[(.*)\]$/, "$1");

    normalized
      .split(/[,，、]/)
      .map(cleanTag)
      .filter(Boolean)
      .forEach((tag) => tags.push(tag));
  }

  if (tagKeyIndex >= 0) {
    pushSegment(lines[tagKeyIndex].replace(/^\s*tags\s*:\s*/i, ""));

    for (let index = tagKeyIndex + 1; index < lines.length; index += 1) {
      const line = lines[index];
      const trimmed = line.trim();

      if (!trimmed) {
        continue;
      }

      if (/^\s*[A-Za-z0-9_-]+\s*:/.test(line) && !trimmed.startsWith("-")) {
        break;
      }

      if (trimmed.startsWith("-")) {
        tags.push(cleanTag(trimmed));
      }
    }
  } else {
    lines.forEach(pushSegment);
  }

  return Array.from(new Set(tags.map(cleanTag).filter(Boolean)));
}

function parseFeedXml(xml: string, feedUrl: string): ParsedFeed {
  const isAtom = /<feed[\s>]/i.test(xml);
  const blocks = isAtom
    ? matchXmlBlocks(xml, "entry")
    : matchXmlBlocks(xml, "item");
  const feedTitle = cleanDisplayText(readXmlTag(xml, ["title"]));
  const siteUrl =
    resolveUrl(readAtomLink(xml) || readXmlTag(xml, ["link"]), feedUrl) ||
    new URL(feedUrl).origin;
  const description = cleanDisplayText(
    readXmlTag(xml, ["subtitle", "description"])
  );

  return {
    title: feedTitle || new URL(feedUrl).hostname,
    description,
    siteUrl,
    feedUrl,
    items: blocks.map((block) => parseFeedItem(block, feedUrl, isAtom))
  };
}

function parseFeedItem(block: string, feedUrl: string, isAtom: boolean): ParsedFeedItem {
  const rawTitle = cleanDisplayText(readXmlTag(block, ["title"]));
  const link = resolveUrl(
    isAtom ? readAtomLink(block) : readXmlTag(block, ["link"]),
    feedUrl
  );
  const id = cleanDisplayText(readXmlTag(block, ["id", "guid"])) || link || rawTitle;
  const rawContent =
    readXmlTag(block, ["content:encoded", "content"]) ||
    readXmlTag(block, ["description", "summary"]);
  const rawSummary = readXmlTag(block, ["summary", "description"]) || rawContent;
  const publishedAt = normalizeFeedDate(
    readXmlTag(block, ["published", "pubDate", "dc:date", "updated"])
  );
  const content = htmlToMarkdown(rawContent, link || feedUrl);
  const title = normalizeFeedItemTitle(rawTitle, content, rawSummary);
  const summary = normalizeFeedItemSummary(rawSummary, content, title);
  const tags = normalizeFeedItemTags(
    readFeedCategories(block),
    rawTitle,
    rawSummary,
    content
  );
  const author = cleanDisplayText(
    readXmlTag(block, ["author", "dc:creator", "name"])
  );
  const coverImage = resolveUrl(readFeedCoverImage(block, rawContent), link || feedUrl);

  return {
    externalId: id,
    title,
    summary,
    content,
    url: link || feedUrl,
    author,
    coverImage,
    tags,
    publishedAt
  };
}

function matchXmlBlocks(xml: string, tag: string) {
  const pattern = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi");
  return Array.from(xml.matchAll(pattern), (match) => match[0]);
}

function readXmlTag(xml: string, tags: string[]) {
  for (const tag of tags) {
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
      "i"
    );
    const match = xml.match(pattern);

    if (match?.[1]) {
      return cleanXmlValue(match[1]);
    }
  }

  return "";
}

function readAtomLink(xml: string) {
  const links = Array.from(xml.matchAll(/<link\b([^>]*)\/?>/gi));
  const preferred =
    links.find((match) => {
      const rel = readXmlAttribute(match[1], "rel");
      return !rel || rel === "alternate";
    }) ?? links[0];

  return preferred ? readXmlAttribute(preferred[1], "href") : "";
}

function readXmlAttribute(source: string, name: string) {
  const pattern = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i");
  return cleanXmlValue(source.match(pattern)?.[1] ?? "");
}

function readFeedCategories(block: string) {
  const categories = new Set<string>();

  for (const match of block.matchAll(/<category\b([^>]*)\/?>/gi)) {
    const term = cleanContentTag(readXmlAttribute(match[1], "term"));

    if (term) {
      categories.add(term);
    }
  }

  for (const categoryBlock of matchXmlBlocks(block, "category")) {
    const value = cleanContentTag(
      cleanDisplayText(
        categoryBlock.replace(/^<category\b[^>]*>/i, "").replace(/<\/category>$/i, "")
      )
    );

    if (value) {
      categories.add(value);
    }
  }

  return Array.from(categories).filter(Boolean).slice(0, 24);
}

function readFeedCoverImage(block: string, rawContent: string) {
  const mediaThumbnail = block.match(/<media:thumbnail\b([^>]*)\/?>/i);
  const mediaContent = block.match(/<media:content\b([^>]*)\/?>/i);
  const enclosure = block.match(/<enclosure\b([^>]*)\/?>/i);
  const contentImage = rawContent.match(/<img\b[^>]*src=["']([^"']+)["']/i);

  return (
    readXmlAttribute(mediaThumbnail?.[1] ?? "", "url") ||
    readXmlAttribute(mediaContent?.[1] ?? "", "url") ||
    readXmlAttribute(enclosure?.[1] ?? "", "url") ||
    cleanXmlValue(contentImage?.[1] ?? "")
  );
}

function cleanXmlValue(value: string) {
  return decodeXmlEntities(
    value
      .replace(/^\s*<!\[CDATA\[/, "")
      .replace(/\]\]>\s*$/, "")
      .trim()
  );
}

function cleanDisplayText(value: string) {
  return decodeXmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<a\b[^>]*(?:class=["'][^"']*\bheaderlink\b[^"']*["']|href=["']#[^"']*["'])[^>]*>\s*<\/a>/gi, "")
    .replace(/<a\b[^>\n]*(?:class=["'][^"'\n]*\bheaderlink\b[^"'\n]*["']?|href=["']#[^"'\n]*["']?)[^>\n]*$/gi, "")
    .replace(/\[\]\(#[^)]+\)/g, "")
    .replace(/!\[([^\]]*)\]\((?:[^)(]|\([^)]*\))*\)/g, "$1")
    .replace(/\[([^\]]+)\]\((?:[^)(]|\([^)]*\))*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/(?:^|\s)[×✕✖](?=\s|$)/g, " ")
    .replace(/[*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeFeedItemTitle(
  title: string,
  content: string,
  summary = ""
) {
  const cleanedTitle = truncateFeedTitle(cleanDisplayText(title));
  const contentText = markdownToDisplayText(content);
  const cleanedSummary = cleanDisplayText(summary);

  if (shouldDeriveFeedTitle(cleanedTitle, contentText, cleanedSummary)) {
    const derivedTitle =
      deriveFeedTitleFromMarkdown(content) || deriveFeedTitleFromText(contentText);

    if (derivedTitle) {
      return truncateFeedTitle(derivedTitle, 96);
    }
  }

  return cleanedTitle || "Untitled";
}

export function normalizeFeedItemSummary(
  summary: string,
  content: string,
  title: string
) {
  const contentText = markdownToDisplayText(content);
  const cleanedSummary = stripFeedHashTagText(
    stripLeadingRepeatedText(cleanDisplayText(summary), title)
  );
  const fallbackSummary = stripFeedHashTagText(
    stripLeadingRepeatedText(contentText, title)
  );

  return (cleanedSummary || fallbackSummary).slice(0, 260).trim();
}

export function normalizeFeedItemTags(
  tags: string[],
  ...sources: string[]
) {
  return normalizeContentTags([
    ...tags,
    ...sources.flatMap((source) => extractFeedHashTags(source))
  ]);
}

function shouldDeriveFeedTitle(
  title: string,
  contentText: string,
  summary: string
) {
  if (!title) {
    return true;
  }

  if (title.length <= 88) {
    return false;
  }

  const comparableTitle = normalizeComparableText(title);
  const titleHead = comparableTitle.slice(0, 42);

  if (!titleHead) {
    return false;
  }

  return (
    normalizeComparableText(contentText).startsWith(titleHead) ||
    normalizeComparableText(summary).startsWith(titleHead)
  );
}

function deriveFeedTitleFromMarkdown(content: string) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");

  for (const line of lines) {
    const text = cleanMarkdownDisplayLine(line);

    if (!text) {
      continue;
    }

    const heading = text.match(/^#{1,6}\s+(.+)$/);

    if (heading) {
      return cleanFeedTitleCandidate(heading[1]);
    }

    const strong = text.match(/^\*\*(.+?)\*\*$/) ?? text.match(/^\*\*(.+?)\*\*/);

    if (strong) {
      return cleanFeedTitleCandidate(strong[1]);
    }

    if (text.length >= 6 && !isMarkdownImageLine(text)) {
      return cleanFeedTitleCandidate(text);
    }
  }

  return "";
}

function deriveFeedTitleFromText(value: string) {
  return cleanFeedTitleCandidate(value);
}

function cleanFeedTitleCandidate(value: string) {
  const cleaned = cleanDisplayText(value)
    .replace(/^[-*]\s+/, "")
    .replace(/^#+\s+/, "")
    .replace(/^\*+|\*+$/g, "")
    .trim();
  const sentence = cleaned.match(/^.{6,}?[。！？!?](?=\s|$)/)?.[0] ?? "";
  const split = (sentence || cleaned).split(
    /\s+(?=(?:流量|时间|注册方式|节点位置|开业|网页注册|注册链接|优惠券|五折活动|#)\s*[：:]?)/
  )[0];

  return truncateFeedTitle(split || cleaned, 96);
}

function truncateFeedTitle(value: string, maxLength = 140) {
  const cleaned = cleanDisplayText(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).replace(/[，,、:：；;\s]+$/g, "")}...`;
}

function stripLeadingRepeatedText(value: string, title: string) {
  const cleaned = cleanDisplayText(value);
  const cleanedTitle = cleanDisplayText(title);

  if (!cleaned || !cleanedTitle) {
    return cleaned;
  }

  if (cleaned === cleanedTitle) {
    return "";
  }

  if (cleaned.startsWith(cleanedTitle)) {
    return cleaned
      .slice(cleanedTitle.length)
      .replace(/^[\s，,。.:：；;|-]+/, "")
      .trim();
  }

  return cleaned;
}

function markdownToDisplayText(value: string) {
  return cleanDisplayText(
    value
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`{3,}[\s\S]*?`{3,}/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^>\s?/gm, "")
      .replace(/^[-*]\s+/gm, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[*_~]+/g, " ")
  );
}

function cleanMarkdownDisplayLine(value: string) {
  return value
    .trim()
    .replace(/^[> \t]+/, "")
    .replace(/^(?:×|✕|✖)$/u, "")
    .trim();
}

function isMarkdownImageLine(value: string) {
  return (
    /^!\[[^\]]*\]\([^)]+\)$/.test(value) ||
    /^\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)$/.test(value)
  );
}

function normalizeComparableText(value: string) {
  return cleanDisplayText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function convertHtmlCodeBlocks(value: string) {
  return convertHtmlPreCodeBlocks(convertHtmlCodeFigures(value));
}

function convertHtmlImages(value: string, baseUrl: string) {
  const withLinkedImages = value.replace(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>\s*(<img\b[^>]*>)\s*<\/a>/gi,
    (_, href: string, imageTag: string) => {
      const imageMarkdown = createMarkdownImage(imageTag, baseUrl);

      if (!imageMarkdown) {
        return "";
      }

      const link = resolveUrl(href.trim(), baseUrl) || href.trim();

      if (!link || isSearchTagHref(link)) {
        return imageMarkdown;
      }

      return `\n\n[${imageMarkdown.trim()}](${link})\n\n`;
    }
  );

  return withLinkedImages.replace(/<img\b[^>]*>/gi, (imageTag) =>
    createMarkdownImage(imageTag, baseUrl)
  );
}

function createMarkdownImage(imageTag: string, baseUrl: string) {
  const attrs = imageTag.match(/^<img\b([^>]*)>/i)?.[1] ?? "";
  const rawSrc =
    readXmlAttribute(attrs, "src") ||
    readXmlAttribute(attrs, "data-src") ||
    readXmlAttribute(attrs, "data-original") ||
    readXmlAttribute(attrs, "data-lazy-src");
  const src = resolveUrl(rawSrc, baseUrl) || rawSrc.trim();

  if (!src || /^(?:javascript|vbscript):/i.test(src)) {
    return "";
  }

  const alt = cleanMarkdownImageAlt(
    readXmlAttribute(attrs, "alt") || readXmlAttribute(attrs, "title")
  );

  return `\n\n![${alt}](${src})\n\n`;
}

function cleanMarkdownImageAlt(value: string) {
  const cleaned = cleanDisplayText(value)
    .replace(/[[\]\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 80 ? "" : cleaned;
}

function convertHtmlTables(value: string) {
  return value.replace(
    /<table\b[^>]*>([\s\S]*?)<\/table>/gi,
    (_, tableHtml: string) => {
      const rows = Array.from(
        tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi),
        (rowMatch) =>
          Array.from(
            rowMatch[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi),
            (cellMatch) => cleanMarkdownTableCell(cellMatch[1])
          )
      ).filter((row) => row.some((cell) => cell.length > 0));

      if (!rows.length) {
        return "";
      }

      const columnCount = Math.max(...rows.map((row) => row.length));
      const normalizedRows = rows.map((row) =>
        Array.from({ length: columnCount }, (_, index) => row[index] ?? "")
      );
      const header = normalizedRows[0];
      const body = normalizedRows.slice(1);
      const separator = header.map(() => "---");
      const tableLines = [
        createMarkdownTableRow(header),
        createMarkdownTableRow(separator),
        ...body.map(createMarkdownTableRow)
      ];

      return `\n\n${tableLines.join("\n")}\n\n`;
    }
  );
}

function createMarkdownTableRow(cells: string[]) {
  return `| ${cells.join(" | ")} |`;
}

function cleanMarkdownTableCell(value: string) {
  return decodeXmlEntities(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(
        /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
        (_, href: string, label: string) => {
          const text = cleanDisplayText(label);
          const link = href.trim();

          if (!text) {
            return "";
          }

          if (!link || isSearchTagHref(link)) {
            return text;
          }

          return `[${text}](${link})`;
        }
      )
      .replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
      .replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
      .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function convertHtmlCodeFigures(value: string) {
  return value.replace(
    /<figure\b([^>]*)>([\s\S]*?)<\/figure>/gi,
    (match, attrs: string, inner: string) => {
      const className = readXmlAttribute(attrs, "class");

      if (!/\bhighlight\b/i.test(className)) {
        return match;
      }

      const codeCell =
        inner.match(
          /<td\b[^>]*class=["'][^"']*\bcode\b[^"']*["'][^>]*>\s*<pre\b[^>]*>([\s\S]*?)<\/pre>\s*<\/td>/i
        )?.[1] ??
        inner.match(
          /<td\b[^>]*class=["'][^"']*\bcode\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i
        )?.[1] ??
        inner.match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/i)?.[1] ??
        "";
      const code = htmlCodeToText(codeCell);

      if (!code.trim()) {
        return "";
      }

      return createMarkdownCodeBlock(code, getHighlightLanguage(className));
    }
  );
}

function convertHtmlPreCodeBlocks(value: string) {
  return value
    .replace(
      /<pre\b[^>]*>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi,
      (_, attrs: string, codeHtml: string) =>
        createMarkdownCodeBlock(
          htmlCodeToText(codeHtml),
          getHighlightLanguage(readXmlAttribute(attrs, "class"))
        )
    )
    .replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_, codeHtml: string) =>
      createMarkdownCodeBlock(htmlCodeToText(codeHtml), "")
    );
}

function htmlCodeToText(value: string) {
  return decodeXmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/span>\s*<span\b[^>]*class=["'][^"']*\bline\b[^"']*["'][^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n+$/g, "");
}

function getHighlightLanguage(className: string) {
  const token = className
    .split(/\s+/)
    .map((item) => item.trim().replace(/^language-/, ""))
    .find(
      (item) =>
        item &&
        !["highlight", "code", "source", "plain", "text", "plaintext"].includes(
          item.toLowerCase()
        )
    );

  return token?.replace(/[^\w-]/g, "") ?? "";
}

function createMarkdownCodeBlock(code: string, language: string) {
  const cleanedCode = code.replace(/\n+$/g, "");
  const fence = cleanedCode.includes("```") ? "````" : "```";
  const normalizedLanguage = language ? language.toLowerCase() : "";

  return `\n\n${fence}${normalizedLanguage}\n${cleanedCode}\n${fence}\n\n`;
}

function htmlToMarkdown(value: string, baseUrl: string) {
  const cleaned = convertHtmlImages(
    convertHtmlTables(convertHtmlCodeBlocks(cleanXmlValue(value))),
    baseUrl
  )
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<a\b[^>]*class=["'][^"']*\bheaderlink\b[^"']*["'][^>]*>\s*<\/a>/gi, "")
    .replace(/<a\b[^>]*href=["']#[^"']*["'][^>]*>\s*<\/a>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n\n")
    .replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n\n")
    .replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n\n")
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
    .replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n> $1\n\n")
    .replace(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href: string, label: string) => {
        const text = cleanDisplayText(label);
        const link = href.trim();

        if (!text) {
          return "";
        }

        if (isSearchTagHref(link)) {
          return text;
        }

        return `[${text}](${link})`;
      }
    )
    .replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalizeMarkdownSpacing(decodeXmlEntities(cleaned))
    .trim()
    .slice(0, 60000);
}

function normalizeMarkdownSpacing(value: string) {
  const codeBlocks: string[] = [];
  const protectedValue = value.replace(
    /(`{3,})[^\n]*\n[\s\S]*?\n\1/g,
    (block) => {
      const index = codeBlocks.push(block) - 1;
      return `@@HTOOLS_CODE_BLOCK_${index}@@`;
    }
  );

  return protectedValue
    .replace(
      /\[\s*\n+\s*(!\[[^\]]*\]\([^)]+\))\s*\n+\s*\]\(([^)\s]+)\)/g,
      "\n\n[$1]($2)\n\n"
    )
    .replace(/(?:^|\n)[ \t]*(?:×|✕|✖)[ \t]*(?=\n|$)/gu, "\n")
    .replace(/(?:^|\n)[ \t]*(?:#[\p{L}\p{N}_-]+[ \t]*){1,24}(?=\n|$)/gu, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/@@HTOOLS_CODE_BLOCK_(\d+)@@/g, (_, index: string) => {
      return codeBlocks[Number(index)] ?? "";
    });
}

function isSearchTagHref(value: string) {
  return /^(?:https?:\/\/[^/]+)?\/search\/result\b/i.test(value.trim());
}

function normalizeContentTags(tags: string[]) {
  return Array.from(new Set(tags.map(cleanContentTag).filter(Boolean))).slice(0, 24);
}

function extractFeedHashTags(value: string) {
  const normalized = decodeXmlEntities(value)
    .replace(/`{3,}[\s\S]*?`{3,}/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const tags = new Set<string>();

  for (const match of normalized.matchAll(
    /(^|[\s([{（【「『，。！？、；;:：])#([\p{L}\p{N}_-]{1,32})(?=$|[\s)\]}）】」』，。！？、；;:：])/gu
  )) {
    const tag = cleanContentTag(match[2]);

    if (tag) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function stripFeedHashTagText(value: string) {
  return value
    .replace(/(?:^|\n)[ \t]*(?:#[\p{L}\p{N}_-]+[ \t]*){1,24}(?=\n|$)/gu, "\n")
    .replace(/\s+(?:#[\p{L}\p{N}_-]+\s*){2,}(?:频道\s*[|｜]\s*聊天)?\s*$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanContentTag(value: string) {
  const cleaned = cleanDisplayText(value)
    .replace(/^#/, "")
    .replace(/\uFFFD/g, "")
    .trim();

  if (!cleaned || /^\?+$/.test(cleaned)) {
    return "";
  }

  return cleaned;
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
}

function normalizeFeedDate(value: string) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function resolveUrl(value: string, baseUrl: string) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

export async function requireAdmin(request: Request, env: Env) {
  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token || !(await verifyToken(token, env))) {
    return json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

export async function getGitHubSettings(env: Env): Promise<GitHubSettings> {
  const db = await getDatabase(env);
  const row = await db.prepare("SELECT value FROM app_settings WHERE key = ?")
    .bind(GITHUB_SETTINGS_KEY)
    .first<{ value: string }>();

  if (!row) {
    return {
      enabled: false,
      clientId: "",
      clientSecret: "",
      owner: "",
      repo: "",
      labels: ["tool-submission"]
    };
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<GitHubSettings>;
    return {
      enabled: parsed.enabled === true,
      clientId: typeof parsed.clientId === "string" ? parsed.clientId : "",
      clientSecret:
        typeof parsed.clientSecret === "string" ? parsed.clientSecret : "",
      owner: typeof parsed.owner === "string" ? parsed.owner : "",
      repo: typeof parsed.repo === "string" ? parsed.repo : "",
      labels: Array.isArray(parsed.labels)
        ? parsed.labels.filter((label): label is string => typeof label === "string")
        : ["tool-submission"]
    };
  } catch {
    return {
      enabled: false,
      clientId: "",
      clientSecret: "",
      owner: "",
      repo: "",
      labels: ["tool-submission"]
    };
  }
}

export async function getAdminCategorySettings(
  env: Env
): Promise<AdminCategorySettings> {
  const db = await getDatabase(env);
  const row = await db.prepare("SELECT value FROM app_settings WHERE key = ?")
    .bind(ADMIN_CATEGORY_SETTINGS_KEY)
    .first<{ value: string }>();

  if (!row) {
    return { ...DEFAULT_ADMIN_CATEGORY_SETTINGS };
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<
      Record<AdminCategoryScope, unknown>
    >;

    return normalizeAdminCategorySettings(parsed);
  } catch {
    return { ...DEFAULT_ADMIN_CATEGORY_SETTINGS };
  }
}

export async function saveAdminCategorySettings(
  env: Env,
  payload: Partial<Record<AdminCategoryScope, unknown>>
) {
  const db = await getDatabase(env);
  const current = await getAdminCategorySettings(env);
  const next: AdminCategorySettings = { ...current };

  for (const scope of ADMIN_CATEGORY_SCOPES) {
    if (Object.prototype.hasOwnProperty.call(payload, scope)) {
      next[scope] = normalizeAdminCategoryList(payload[scope]);
    }
  }

  await db.prepare(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  )
    .bind(ADMIN_CATEGORY_SETTINGS_KEY, JSON.stringify(next))
    .run();

  return next;
}

function normalizeAdminCategorySettings(
  value: Partial<Record<AdminCategoryScope, unknown>>
): AdminCategorySettings {
  return {
    tools: normalizeAdminCategoryList(value.tools),
    articles: normalizeAdminCategoryList(value.articles),
    content: normalizeAdminCategoryList(value.content)
  };
}

function normalizeAdminCategoryList(value: unknown) {
  const values = Array.isArray(value) ? value : [];
  const categories = values
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 48))
    .filter((item) => item && !isReservedAdminCategory(item));

  return Array.from(new Set(categories)).slice(0, 120);
}

function isReservedAdminCategory(category: string) {
  const normalized = category.toLowerCase();

  return (
    category === "全部" ||
    category === "精选" ||
    normalized === "all" ||
    normalized === "featured"
  );
}

export async function saveGitHubSettings(
  env: Env,
  current: GitHubSettings,
  payload: GitHubSettingsInput
) {
  const db = await getDatabase(env);
  const next: GitHubSettings = {
    enabled: payload.enabled === true,
    clientId: readOptionalString(payload.clientId),
    clientSecret:
      typeof payload.clientSecret === "string" && payload.clientSecret.trim()
        ? payload.clientSecret.trim()
        : current.clientSecret,
    owner: readOptionalString(payload.owner),
    repo: readOptionalString(payload.repo),
    labels: Array.isArray(payload.labels)
      ? payload.labels
          .filter((label): label is string => typeof label === "string")
          .map((label) => label.trim())
          .filter(Boolean)
          .slice(0, 10)
      : []
  };

  if (next.enabled) {
    if (!next.clientId || !next.clientSecret || !next.owner || !next.repo) {
      throw new Error(
        "clientId, clientSecret, owner, and repo are required when GitHub submissions are enabled."
      );
    }
  }

  await db.prepare(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  )
    .bind(GITHUB_SETTINGS_KEY, JSON.stringify(next))
    .run();

  return next;
}

export function toGitHubSettingsResponse(settings: GitHubSettings, request: Request) {
  const callbackUrl = new URL("/api/github/callback", request.url).toString();

  return {
    enabled: settings.enabled,
    clientId: settings.clientId,
    owner: settings.owner,
    repo: settings.repo,
    labels: settings.labels,
    hasClientSecret: Boolean(settings.clientSecret),
    callbackUrl
  };
}

export function isGitHubConfigured(settings: GitHubSettings) {
  return Boolean(
    settings.enabled &&
      settings.clientId &&
      settings.clientSecret &&
      settings.owner &&
      settings.repo
  );
}

export async function getGitHubSession(request: Request, env: Env) {
  const token = readCookie(request, GITHUB_SESSION_COOKIE);

  if (!token) {
    return null;
  }

  const db = await getDatabase(env);
  const row = await db.prepare(
    "SELECT * FROM github_sessions WHERE token = ? AND expires_at > ?"
  )
    .bind(token, new Date().toISOString())
    .first<GitHubSessionRow>();

  return row ?? null;
}

export function buildGitHubSessionCookie(request: Request, token: string) {
  return buildCookie(request, GITHUB_SESSION_COOKIE, token, GITHUB_SESSION_TTL_SECONDS);
}

export function buildClearGitHubSessionCookie(request: Request) {
  return buildCookie(request, GITHUB_SESSION_COOKIE, "", 0);
}

export async function createToken(env: Env) {
  const secret = getSecret(env);
  const issuedAt = Date.now().toString();
  const signature = await sign(issuedAt, secret);
  return `${issuedAt}.${signature}`;
}

export async function verifyPassword(password: string, env: Env) {
  const settings = await getAdminPasswordSettings(env);

  if (settings) {
    return verifyAdminPasswordHash(password, settings);
  }

  const secret = getSecret(env);
  return timingSafeEqual(password, secret);
}

export async function getAdminSecuritySettings(env: Env) {
  const settings = await getAdminPasswordSettings(env);

  return {
    passwordConfigured: Boolean(settings),
    updatedAt: settings?.updatedAt ?? null
  };
}

export async function saveAdminPassword(env: Env, password: string) {
  const db = await getDatabase(env);
  const settings = await createAdminPasswordSettings(password);

  await db.prepare(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  )
    .bind(ADMIN_PASSWORD_KEY, JSON.stringify(settings))
    .run();

  return settings;
}

export async function getProxySettings(env: Env): Promise<ProxySettings> {
  const db = await getDatabase(env);
  const row = await db.prepare("SELECT value FROM app_settings WHERE key = ?")
    .bind(PROXY_SETTINGS_KEY)
    .first<{ value: string }>();

  if (!row) {
    return {
      enabled: false,
      baseUrl: ""
    };
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<ProxySettings>;
    return {
      enabled: parsed.enabled === true,
      baseUrl:
        typeof parsed.baseUrl === "string"
          ? normalizeProxyBaseUrl(parsed.baseUrl)
          : ""
    };
  } catch {
    return {
      enabled: false,
      baseUrl: ""
    };
  }
}

export async function saveProxySettings(
  env: Env,
  payload: { enabled?: unknown; baseUrl?: unknown }
) {
  const db = await getDatabase(env);
  const enabled = payload.enabled === true;
  const baseUrl =
    typeof payload.baseUrl === "string"
      ? normalizeProxyBaseUrl(payload.baseUrl)
      : "";

  if (enabled && !baseUrl) {
    throw new Error("proxy base URL is required when proxy is enabled.");
  }

  const settings = {
    enabled,
    baseUrl
  } satisfies ProxySettings;

  await db.prepare(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  )
    .bind(PROXY_SETTINGS_KEY, JSON.stringify(settings))
    .run();

  return settings;
}

export async function getSiteSettings(env: Env): Promise<SiteSettings> {
  const db = await getDatabase(env);
  const row = await db.prepare("SELECT value FROM app_settings WHERE key = ?")
    .bind(SITE_SETTINGS_KEY)
    .first<{ value: string }>();

  if (!row) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<SiteSettings>;
    return normalizeSiteSettings(parsed);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(
  env: Env,
  payload: {
    name?: unknown;
    subtitle?: unknown;
    iconUrl?: unknown;
    aboutContent?: unknown;
    footer?: unknown;
  }
) {
  const db = await getDatabase(env);
  const settings = normalizeSiteSettings({
    name: typeof payload.name === "string" ? payload.name : "",
    subtitle: typeof payload.subtitle === "string" ? payload.subtitle : "",
    iconUrl: typeof payload.iconUrl === "string" ? payload.iconUrl : "",
    aboutContent:
      typeof payload.aboutContent === "string" ? payload.aboutContent : undefined,
    footer:
      typeof payload.footer === "object" && payload.footer !== null
        ? (payload.footer as Partial<FooterSettings>)
        : undefined
  });

  if (typeof payload.iconUrl === "string" && payload.iconUrl.trim() && !settings.iconUrl) {
    throw new Error("site icon must be a valid http/https URL or supported image data.");
  }

  await db.prepare(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  )
    .bind(SITE_SETTINGS_KEY, JSON.stringify(settings))
    .run();

  return settings;
}

export function proxifyUrl(value: string, settings: ProxySettings) {
  const targetUrl = normalizeHttpUrl(value);

  if (!targetUrl || !settings.enabled || !settings.baseUrl) {
    return targetUrl;
  }

  return `${settings.baseUrl}${targetUrl}`;
}

function normalizeSiteSettings(value: {
  name?: unknown;
  subtitle?: unknown;
  iconUrl?: unknown;
  aboutContent?: unknown;
  footer?: unknown;
}): SiteSettings {
  const name =
    typeof value.name === "string" && value.name.trim()
      ? value.name.trim().slice(0, 40)
      : DEFAULT_SITE_SETTINGS.name;
  const subtitle =
    typeof value.subtitle === "string" && value.subtitle.trim()
      ? value.subtitle.trim().slice(0, 60)
      : DEFAULT_SITE_SETTINGS.subtitle;
  const iconUrl =
    typeof value.iconUrl === "string" && value.iconUrl.trim()
      ? normalizeSiteIconUrl(value.iconUrl)
      : "";

  return {
    name,
    subtitle,
    iconUrl,
    aboutContent:
      typeof value.aboutContent === "string" && value.aboutContent.trim()
        ? value.aboutContent.trim().slice(0, 60000)
        : DEFAULT_SITE_SETTINGS.aboutContent,
    footer: normalizeFooterSettings(value.footer)
  };
}

function normalizeFooterSettings(value: unknown): FooterSettings {
  const source =
    typeof value === "object" && value !== null
      ? (value as Partial<FooterSettings>)
      : {};

  return {
    description: normalizeFooterDescription(source.description),
    authorName: DEFAULT_FOOTER_SETTINGS.authorName,
    authorUrl: DEFAULT_FOOTER_SETTINGS.authorUrl,
    copyright: DEFAULT_FOOTER_SETTINGS.copyright,
    sponsorLabel: normalizeFooterText(
      source.sponsorLabel,
      DEFAULT_FOOTER_SETTINGS.sponsorLabel,
      48
    ),
    sponsorUrl:
      normalizeFooterSponsorUrl(source.sponsorUrl),
    socialLinks: normalizeFooterLinks(source.socialLinks, DEFAULT_FOOTER_SETTINGS.socialLinks, 4),
    groups: normalizeFooterGroups(source.groups, DEFAULT_FOOTER_SETTINGS.groups)
  };
}

function normalizeFooterSponsorUrl(value: unknown) {
  const sponsorUrl = normalizeFooterHref(value);

  if (!sponsorUrl) {
    return DEFAULT_FOOTER_SETTINGS.sponsorUrl;
  }

  return sponsorUrl.replace(/\/$/, "").toLowerCase() ===
    LEGACY_DEFAULT_SPONSOR_URL.replace(/\/$/, "").toLowerCase()
    ? DEFAULT_FOOTER_SETTINGS.sponsorUrl
    : sponsorUrl;
}

function normalizeFooterDescription(value: unknown) {
  const description = normalizeFooterText(
    value,
    DEFAULT_FOOTER_SETTINGS.description,
    180
  );

  return [
    LEGACY_DEFAULT_FOOTER_DESCRIPTION,
    PREVIOUS_DEFAULT_FOOTER_DESCRIPTION,
    TEMP_DEFAULT_FOOTER_DESCRIPTION
  ].includes(description)
    ? DEFAULT_FOOTER_SETTINGS.description
    : description;
}

function normalizeFooterText(value: unknown, fallback: string, maxLength: number) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : fallback;
}

function normalizeFooterHref(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim().slice(0, 256);

  if (!trimmed) {
    return "";
  }

  if (trimmed.toLowerCase() === "mailto:hello@zrf.me") {
    return "mailto:admin@zrf.me";
  }

  if (/^https:\/\/t\.me\/?$/i.test(trimmed)) {
    return "https://d.zrf.me/tgq";
  }

  if (isDefaultAuthorLegalHref(trimmed, "/privacy")) {
    return "/privacy";
  }

  if (isDefaultAuthorLegalHref(trimmed, "/terms")) {
    return "/terms";
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  if (/^(mailto|tel):[^\s]+$/i.test(trimmed)) {
    return trimmed;
  }

  return normalizeHttpUrl(trimmed);
}

function isDefaultAuthorLegalHref(href: string, pathname: "/privacy" | "/terms") {
  try {
    const url = new URL(href);
    const defaultAuthorUrls = [
      DEFAULT_FOOTER_SETTINGS.authorUrl,
      LEGACY_DEFAULT_AUTHOR_URL
    ].map((value) => new URL(value));

    return defaultAuthorUrls.some(
      (defaultAuthorUrl) =>
        url.hostname.toLowerCase() === defaultAuthorUrl.hostname.toLowerCase() &&
        url.pathname.replace(/\/$/, "") === pathname
    );
  } catch {
    return false;
  }
}

function normalizeFooterLinks(
  value: unknown,
  fallback: FooterLink[],
  maxLinks: number
) {
  const items = Array.isArray(value) ? value : fallback;
  const links = items
    .slice(0, maxLinks)
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const source = item as Partial<FooterLink>;
      const label =
        typeof source.label === "string" ? source.label.trim().slice(0, 48) : "";
      const href = normalizeFooterHref(source.href);

      return label && href ? { label, href } : null;
    })
    .filter((item): item is FooterLink => Boolean(item));

  return links.length ? links : fallback;
}

function normalizeFooterGroups(value: unknown, fallback: FooterLinkGroup[]) {
  const items = Array.isArray(value) ? value : fallback;
  const groups = items
    .slice(0, 6)
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const source = item as Partial<FooterLinkGroup>;
      const title =
        typeof source.title === "string" ? source.title.trim().slice(0, 48) : "";
      const links = normalizeFooterLinks(source.links, [], 8);

      return title && links.length ? { title, links } : null;
    })
    .filter((item): item is FooterLinkGroup => Boolean(item));

  return groups.length ? groups : fallback;
}

function normalizeSiteIconUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.length <= SITE_ICON_DATA_URL_MAX_LENGTH &&
    SITE_ICON_DATA_URL_PATTERN.test(trimmed)
  ) {
    return trimmed;
  }

  return normalizeHttpUrl(trimmed);
}

export function createId(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${slug || "tool"}-${crypto.randomUUID().slice(0, 8)}`;
}

export function createArticleId() {
  return `article-${crypto.randomUUID().slice(0, 10)}`;
}

export function createContentSourceId() {
  return `source-${crypto.randomUUID().slice(0, 10)}`;
}

export function createContentItemId() {
  return `item-${crypto.randomUUID().slice(0, 10)}`;
}

export function createArticleSlug(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return slug || `article-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createUniqueArticleSlug(
  db: D1Database,
  slug: string,
  excludeId = ""
) {
  const base = createArticleSlug(slug);

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const row = await db.prepare(
      "SELECT id FROM articles WHERE slug = ? AND id != ?"
    )
      .bind(candidate, excludeId)
      .first<{ id: string }>();

    if (!row) {
      return candidate;
    }
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }

  return value.trim();
}

function readOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

function createPreviewUrl(url: string) {
  const githubPreview = createGitHubOpenGraphImageUrl(url);

  if (githubPreview) {
    return githubPreview;
  }

  return `https://image.thum.io/get/width/1200/crop/720/${url}`;
}

function createGitHubOpenGraphImageUrl(url: string) {
  const repoPath = getGitHubRepoPath(url);

  return repoPath ? `https://opengraph.githubassets.com/htools/${repoPath}` : "";
}

export async function loadGitHubToolMetadata(url: string): Promise<GitHubToolMetadata> {
  const repoPath = getGitHubRepoPath(url);

  if (!repoPath) {
    throw new Error("URL must be a GitHub repository.");
  }

  const [owner, repo] = repoPath.split("/");
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "HTools GitHub Metadata"
      }
    }
  );

  if (response.status === 404) {
    throw new Error("GitHub repository not found.");
  }

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    throw new Error(
      remaining === "0"
        ? "GitHub API rate limit reached. Try again later."
        : `GitHub API request failed with status ${response.status}.`
    );
  }

  const repoData = (await response.json()) as GitHubRepoResponse;
  const fullName = readOptionalString(repoData.full_name) || repoPath;
  const repoName = readOptionalString(repoData.name) || repo;
  const repoOwner = readOptionalString(repoData.owner?.login) || owner;
  const htmlUrl =
    normalizeLooseHttpUrl(readOptionalString(repoData.html_url)) ||
    `https://github.com/${repoPath}`;
  const homepage = normalizeLooseHttpUrl(readOptionalString(repoData.homepage));
  const language = readOptionalString(repoData.language);
  const license = normalizeGitHubLicense(repoData.license);
  const topics = normalizeGitHubTopics(repoData.topics);

  return {
    owner: repoOwner,
    repo: repoName,
    fullName,
    name: repoName,
    description: readOptionalString(repoData.description) || fullName,
    url: htmlUrl,
    demoUrl: homepage,
    image: `https://opengraph.githubassets.com/htools/${repoPath}`,
    stars:
      typeof repoData.stargazers_count === "number"
        ? repoData.stargazers_count
        : 0,
    forks: typeof repoData.forks_count === "number" ? repoData.forks_count : 0,
    language,
    license,
    topics,
    updatedAt: readOptionalString(repoData.updated_at)
  };
}

export function getGitHubRepoPath(url: string) {
  const normalized = normalizeGitHubUrlInput(url);

  if (!normalized) {
    return "";
  }

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();

    if (host !== "github.com" && host !== "www.github.com") {
      return "";
    }

    const [owner, repo] = parsed.pathname
      .split("/")
      .filter(Boolean)
      .slice(0, 2);

    if (!owner || !repo) {
      return "";
    }

    return `${owner}/${repo.replace(/\.git$/i, "")}`;
  } catch {
    return "";
  }
}

function normalizeGitHubUrlInput(value: string) {
  return normalizeLooseHttpUrl(value);
}

function normalizeLooseHttpUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function normalizeGitHubLicense(value: GitHubRepoResponse["license"]) {
  const spdxId = readOptionalString(value?.spdx_id);

  if (spdxId && spdxId.toUpperCase() !== "NOASSERTION") {
    return spdxId;
  }

  return readOptionalString(value?.name);
}

function normalizeGitHubTopics(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((topic): topic is string => typeof topic === "string")
        .map((topic) => topic.trim())
        .filter(Boolean)
    )
  ).slice(0, 12);
}

function normalizeProxyBaseUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return `${url.origin}${url.pathname.replace(/\/?$/, "/")}`;
  } catch {
    return "";
  }
}

function normalizeHttpUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function getSecret(env: Env) {
  if (!env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  return env.ADMIN_PASSWORD;
}

async function getAdminPasswordSettings(env: Env) {
  const db = await getDatabase(env);
  const row = await db.prepare("SELECT value FROM app_settings WHERE key = ?")
    .bind(ADMIN_PASSWORD_KEY)
    .first<{ value: string }>();

  if (!row) {
    return null;
  }

  try {
    const parsed = JSON.parse(row.value) as Partial<AdminPasswordSettings>;

    if (
      parsed.algorithm !== "PBKDF2-SHA256" ||
      typeof parsed.salt !== "string" ||
      typeof parsed.hash !== "string" ||
      typeof parsed.iterations !== "number"
    ) {
      return null;
    }

    return {
      algorithm: "PBKDF2-SHA256",
      iterations: parsed.iterations,
      salt: parsed.salt,
      hash: parsed.hash,
      updatedAt:
        typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString()
    } satisfies AdminPasswordSettings;
  } catch {
    return null;
  }
}

async function createAdminPasswordSettings(password: string): Promise<AdminPasswordSettings> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt, ADMIN_PASSWORD_ITERATIONS);

  return {
    algorithm: "PBKDF2-SHA256",
    iterations: ADMIN_PASSWORD_ITERATIONS,
    salt: bytesToBase64Url(salt),
    hash,
    updatedAt: new Date().toISOString()
  };
}

async function verifyAdminPasswordHash(
  password: string,
  settings: AdminPasswordSettings
) {
  const hash = await derivePasswordHash(
    password,
    base64UrlToBytes(settings.salt),
    settings.iterations
  );

  return timingSafeEqual(hash, settings.hash);
}

async function derivePasswordHash(
  password: string,
  salt: Uint8Array,
  iterations: number
) {
  const saltBuffer = new Uint8Array(salt).buffer;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBuffer,
      iterations
    },
    key,
    256
  );

  return bytesToBase64Url(new Uint8Array(bits));
}

function bytesToBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const prefix = `${name}=`;
  const cookie = cookies.find((item) => item.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : "";
}

function buildCookie(request: Request, name: string, value: string, maxAgeSeconds: number) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`;
}

async function verifyToken(token: string, env: Env) {
  const secret = getSecret(env);
  const [issuedAt, signature] = token.split(".");
  const timestamp = Number(issuedAt);

  if (!issuedAt || !signature || !Number.isFinite(timestamp)) {
    return false;
  }

  if (Date.now() - timestamp > TOKEN_TTL_MS) {
    return false;
  }

  const expected = await sign(issuedAt, secret);
  return timingSafeEqual(signature, expected);
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function timingSafeEqual(a: string, b: string) {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const length = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;

  for (let index = 0; index < length; index += 1) {
    diff |= (aBytes[index] ?? 0) ^ (bBytes[index] ?? 0);
  }

  return diff === 0;
}
