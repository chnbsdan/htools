export type Tool = {
  id: string;
  name: string;
  description: string;
  url: string;
  demoUrl: string;
  image: string;
  category: string;
  tags: string[];
  githubLanguage: string;
  githubLicense: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ToolInput = Omit<Tool, "id" | "created_at" | "updated_at">;

export type ToolSourceItem = {
  updatedAt: string;
  id: string;
  name: string;
  description: string;
  url: string;
  demoUrl: string;
  image: string;
  category: string;
  tags: string[];
  featured: boolean;
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

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  published: boolean;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  publishedAt?: string | null;
};

export type ArticleInput = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
};

export type ContentSource = {
  id: string;
  title: string;
  url: string;
  siteUrl: string;
  description: string;
  category: string;
  tags: string[];
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
  lastSyncedAt?: string | null;
};

export type ContentSourceInput = {
  title: string;
  url: string;
  category: string;
  tags: string[];
  enabled: boolean;
};

export type ContentItem = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  external_id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  author: string;
  coverImage: string;
  category: string;
  tags: string[];
  published_at?: string | null;
  synced_at?: string;
  created_at?: string;
  updated_at?: string;
  articleId?: string | null;
  articleSlug?: string | null;
  articlePublished?: boolean | null;
};

export type FeedPreview = {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  items: Array<{
    externalId: string;
    title: string;
    summary: string;
    content: string;
    url: string;
    author: string;
    coverImage: string;
    tags: string[];
    publishedAt: string | null;
  }>;
};

export type ContentSyncResponse = {
  imported: number;
  updated: number;
  total: number;
  items: ContentItem[];
};

export type AdminCategoryScope = "tools" | "articles" | "content";

export type AdminCategorySettings = Record<AdminCategoryScope, string[]>;

export type AdminCategoryAction = "migrate" | "delete";

export type AdminCategoryActionResult = {
  affected: number;
  settings: AdminCategorySettings;
};

export type ToolImportMode = "skip" | "upsert";

export type ToolImportError = {
  index: number;
  message: string;
};

export type ToolImportResponse = {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ToolImportError[];
};

export type SourceSettings = {
  enabled: boolean;
  sourceUrl: string;
  sourcePath: string;
};

export type ProxyMode = "prefix" | "edgeone-proxy" | "edgeone-advanced";

export type ProxySettings = {
  enabled: boolean;
  baseUrl: string;
  mode: ProxyMode;
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

export type AdminSecuritySettings = {
  passwordConfigured: boolean;
  updatedAt: string | null;
};

export type AdminPasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type BackupCounts = {
  tools: number;
  articles: number;
  contentSources: number;
  contentItems: number;
  settings: number;
};

export type HtoolsBackup = {
  source: "htools-backup";
  version: string;
  exportedAt: string;
  counts: BackupCounts;
  data: unknown;
};

export type BackupRestoreResponse = {
  restored: boolean;
  counts: BackupCounts;
};

export type FactoryResetResponse = {
  deleted: number;
  counts: BackupCounts;
};

export type LinkCheckKind = "url" | "demoUrl";

export type LinkCheckTarget = {
  id: string;
  name: string;
  kind: LinkCheckKind;
  url: string;
};

export type LinkCheckResult = LinkCheckTarget & {
  status: number;
  ok: boolean;
  duration: number;
  checkedAt: string;
  finalUrl?: string;
  error?: string;
};

export type LinkCheckResponse = {
  results: LinkCheckResult[];
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
};

export type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
};

export type GitHubAuthState = {
  configured: boolean;
  authenticated: boolean;
  user: GitHubUser | null;
};

export type GitHubSettings = {
  enabled: boolean;
  clientId: string;
  owner: string;
  repo: string;
  labels: string[];
  hasClientSecret: boolean;
  callbackUrl: string;
};

export type GitHubSettingsInput = Omit<
  GitHubSettings,
  "hasClientSecret" | "callbackUrl"
> & {
  clientSecret?: string;
};

export type SubmissionInput = {
  name: string;
  description: string;
  url: string;
  category: string;
  locale?: "zh" | "en";
  tags: string[];
};

export type SubmissionResult = {
  issueUrl: string;
  issueNumber: number;
};
