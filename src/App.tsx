import {
  Activity,
  ArrowDownUp,
  ArrowUp,
  ArrowUpRight,
  AtSign,
  BarChart3,
  BadgeCheck,
  Boxes,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  CircleAlert,
  Clock3,
  Code2,
  Coffee,
  Copy,
  Database,
  Download,
  Eraser,
  FileImage,
  FileText,
  ExternalLink,
  Facebook,
  Github,
  Globe2,
  House,
  Instagram,
  LayoutDashboard,
  Languages,
  Link2,
  Linkedin,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  PackagePlus,
  PanelLeft,
  Plus,
  RefreshCw,
  Rss,
  Search,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  SquarePen,
  Sun,
  Tags,
  Trash2,
  Twitter,
  UserRound,
  Upload,
  Wand2,
  Wrench,
  X,
  Youtube
} from "lucide-react";
import {
  ChangeEvent,
  CSSProperties,
  DragEvent as ReactDragEvent,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  Suspense,
  createContext,
  lazy,
  useCallback,
  useEffect,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import {
  applyAdminCategoryAction,
  checkLinks,
  createArticle,
  createContentSource,
  createTool,
  deleteArticle,
  deleteContentSource,
  deleteTool,
  exportBackupData,
  exportToolSourceData,
  importTools,
  loadAdminArticles,
  loadArticle,
  loadArticlePreview,
  loadArticles,
  loadAdminCategorySettings,
  loadCategorySettings,
  loadAdminSecuritySettings,
  loadContentItems,
  loadContentSources,
  loadContentItemArticlePreview,
  loadGitHubAuthState,
  loadGitHubSettings,
  loadGitHubToolMetadata,
  loadProxySettings,
  loadSiteSettings,
  loadSourceSettings,
  loadTools,
  login,
  logoutGitHub,
  resetFactorySettings,
  restoreBackupData,
  saveGitHubSettings,
  saveAdminCategorySettings,
  saveProxySettings,
  saveSiteSettings,
  saveSourceSettings,
  submitTool,
  syncContentSource,
  updateArticle,
  updateAdminPassword,
  updateContentSource,
  convertContentItemToArticle,
  previewContentSource,
  updateTool
} from "./api";
import {
  getLocaleOption,
  localeOptions,
  resolveLocale,
  translations,
  type Locale,
  type Messages
} from "./i18n";
import {
  DEFAULT_PROXY_MODE,
  normalizeProxyBaseUrl,
  normalizeProxyMode,
  proxifyUrl
} from "./proxy";
import type {
  AdminCategoryAction,
  AdminCategoryScope,
  AdminCategorySettings,
  AdminSecuritySettings,
  Article,
  ArticleInput,
  BackupCounts,
  BackupRestoreResponse,
  ContentItem,
  ContentSource,
  ContentSourceInput,
  FactoryResetResponse,
  FeedPreview,
  FooterLinkGroup,
  FooterSettings,
  GitHubToolMetadata,
  LinkCheckResult,
  LinkCheckTarget,
  ProxySettings,
  HtoolsBackup,
  SiteSettings,
  SourceSettings,
  Tool,
  ToolImportMode,
  ToolImportResponse,
  ToolInput
} from "./types";
import type {
  GitHubAuthState,
  GitHubSettings,
  GitHubSettingsInput,
  SubmissionInput
} from "./types";

const MarkdownContent = lazy(() => import("./components/MarkdownContent"));

type ConvertPublishMode = "draft" | "published";

type AppliedGitHubMetadata = {
  metadata: GitHubToolMetadata;
  url: string;
};

type ToastTone = "success" | "error" | "info";

type GlobalToast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastInput = Omit<GlobalToast, "id">;

const initialForm: ToolInput = {
  name: "",
  description: "",
  url: "",
  demoUrl: "",
  image: "",
  category: "Web Framework",
  tags: [],
  githubLanguage: "",
  githubLicense: "",
  featured: false
};

const initialArticleForm: ArticleInput = {
  slug: "",
  title: "",
  summary: "",
  content: "",
  coverImage: "",
  category: "",
  tags: [],
  published: true,
  publishedAt: ""
};

function preventCardDrag(event: ReactDragEvent<HTMLElement>) {
  event.preventDefault();
}

function blurActivatedLink(event: ReactMouseEvent<HTMLAnchorElement>) {
  event.currentTarget.blur();
}

const initialContentSourceForm: ContentSourceInput = {
  title: "",
  url: "",
  category: "",
  tags: [],
  enabled: true
};

const initialAdminCategorySettings: AdminCategorySettings = {
  tools: [],
  articles: [],
  content: []
};

type PendingAdminCategoryAction = {
  category: string;
  contentCount: number;
  scope: AdminCategoryScope;
};

const ADMIN_FEATURED_CATEGORY = "__admin_featured__";
const SITE_SETTINGS_CACHE_KEY = "htools_site_settings_cache";
const DEFAULT_FAVICON_LINKS: {
  key: string;
  href: string;
  sizes?: string;
  type?: string;
}[] = [
  {
    key: "ico",
    href: "/favicon.ico",
    sizes: "any"
  },
  {
    key: "svg",
    href: "/favicon.svg",
    type: "image/svg+xml"
  }
];

function readCachedSiteSettings() {
  try {
    const value = localStorage.getItem(SITE_SETTINGS_CACHE_KEY);

    if (!value) {
      return null;
    }

    return getEditableSiteSettings(JSON.parse(value) as SiteSettings);
  } catch {
    return null;
  }
}

function writeCachedSiteSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(
      SITE_SETTINGS_CACHE_KEY,
      JSON.stringify(getEditableSiteSettings(settings))
    );
  } catch {
    // Cache is only used to prevent first-paint layout jumps.
  }
}

const categoryIcons = {
  All: Boxes,
  [ADMIN_FEATURED_CATEGORY]: Star,
  Backend: Server,
  Database,
  "Web Framework": Code2,
  "UI Framework": LayoutDashboard,
  "API Tools": Globe2,
  Productivity: BadgeCheck,
  "Short Link": Link2,
  Analytics: BarChart3,
  Blog: FileText,
  "Image Hosting": FileImage,
  Email: Mail,
  "File Sharing": PackagePlus,
  Tunnel: Server,
  Acceleration: Sparkles,
  "Speed Test": BarChart3,
  Monitoring: LayoutDashboard,
  "Developer Tools": Code2,
  "AI Tools": BrainCircuit,
  "SEO Opt": Sparkles,
  "Other Tools": Tags
};

const submissionCategories = [
  "Web Framework",
  "Browser Extension",
  "Database",
  "UI Framework",
  "Prototype",
  "Authentication",
  "Payment",
  "Ideas Creativity",
  "SEO Opt",
  "Ads",
  "I18N",
  "AI Tools",
  "Image Hosting",
  "Email",
  "Analytics",
  "Tunnel",
  "Acceleration",
  "Speed Test",
  "Monitoring",
  "Developer Tools",
  "Customer Support",
  "Docs Tools",
  "Deploy Service",
  "Domain Service",
  "Project Management",
  "Product Launch",
  "Other Tools"
];

const CATEGORY_PAGE_SIZE = 16;
const DEFAULT_SOURCE_URL =
  "https://raw.githubusercontent.com/shaoyouvip/htools/refs/heads/main/public/htools.json";
const SOURCE_PREVIEW_ERROR_LIMIT = 5;
const NAV_BURST_PARTICLE_COUNT = 12;
const NAV_BURST_NAVIGATION_DELAY_MS = 220;
const MOBILE_NAV_EXIT_MS = 240;
const SITE_ICON_UPLOAD_MAX_BYTES = 1024 * 1024;
const SITE_ICON_UPLOAD_ACCEPT =
  ".png,.jpg,.jpeg,.webp,.gif,.ico,image/png,image/jpeg,image/webp,image/gif,image/x-icon,image/vnd.microsoft.icon";
const SITE_ICON_UPLOAD_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon"
]);
const SITE_ICON_EXTENSION_TYPES: Record<string, string> = {
  gif: "image/gif",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};
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
  "\u63a2\u7d22\u7cbe\u9009\u5de5\u5177\u548c\u8d44\u6e90\uff0c\u52a0\u901f\u60a8\u7684\u72ec\u7acb\u5f00\u53d1\u4e4b\u65c5";
const PREVIOUS_DEFAULT_FOOTER_DESCRIPTION =
  "\u6536\u5f55\u5404\u79cd\u5f00\u6e90\u3001\u597d\u7528\u7684\u4e92\u8054\u7f51\u9879\u76ee";
const TEMP_DEFAULT_FOOTER_DESCRIPTION =
  "\u6574\u7406\u5f00\u6e90\u9879\u76ee\u4e0e\u5b9e\u7528\u5de5\u5177";
const DEFAULT_FOOTER_DESCRIPTION =
  "\u81f4\u529b\u4e8e\u6536\u5f55\u5404\u79cd\u5f00\u6e90\u3001\u597d\u7528\u7684\u4e92\u8054\u7f51\u9879\u76ee";
const FOOTER_PROJECT_URL = "https://github.com/shaoyouvip/htools";
const LEGACY_DEFAULT_SPONSOR_URL = "https://www.buymeacoffee.com/";
const LEGACY_DEFAULT_AUTHOR_URL = "https://zrf.me/";
const LEGACY_DEFAULT_FOOTER_MORE_TITLE = "\u66f4\u591a\u7684";
const DEFAULT_SPONSOR_URL = "https://example.com";
const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  description: DEFAULT_FOOTER_DESCRIPTION,
  authorName: "HTools",
  authorUrl: FOOTER_PROJECT_URL,
  copyright: "\u00a9 2026 HTools \u7248\u6743\u6240\u6709\uff0c\u4fdd\u7559\u6240\u6709\u6743\u5229\u3002",
  sponsorLabel: "Buy me a coffee",
  sponsorUrl: DEFAULT_SPONSOR_URL,
  socialLinks: [
    { label: "GitHub", href: "https://github.com/shaoyouvip/htools" },
    { label: "Email", href: "mailto:admin@zrf.me" },
    { label: "Telegram", href: "https://d.zrf.me/tgq" }
  ],
  groups: [
    {
      title: "\u4ea7\u54c1",
      links: [
        { label: "\u5de5\u5177", href: "/tools" },
        { label: "\u6587\u7ae0", href: "/articles" },
        { label: "\u63d0\u4ea4\u5de5\u5177", href: "/submit" }
      ]
    },
    {
      title: "\u652f\u6301",
      links: [
        { label: "\u7535\u5b50\u90ae\u4ef6", href: "mailto:admin@zrf.me" },
        { label: "GitHub", href: "https://github.com/shaoyouvip/htools" },
        { label: "Telegram", href: "https://d.zrf.me/tgq" }
      ]
    },
    {
      title: "\u5176\u4ed6",
      links: [
        { label: "\u4e3b\u9875", href: "https://zrf.me/" },
        { label: "\u535a\u5ba2", href: "https://blog.zrf.me" }
      ]
    },
    {
      title: "\u66f4\u591a",
      links: [
        { label: "\u5173\u4e8e\u6211\u4eec", href: "/about" },
        { label: "\u9690\u79c1\u653f\u7b56", href: "/privacy" },
        { label: "\u670d\u52a1\u6761\u6b3e", href: "/terms" }
      ]
    }
  ]
};
const DEFAULT_FOOTER_GROUP_SIGNATURES = new Set(
  [
    DEFAULT_FOOTER_SETTINGS.groups,
    getLegacyDefaultFooterGroups(),
    getLocalizedDefaultFooterGroups(translations.zh),
    getLocalizedDefaultFooterGroups(translations.en)
  ].map(createFooterGroupSignature)
);
const DEFAULT_PROXY_SETTINGS: ProxySettings = {
  enabled: false,
  baseUrl: "",
  mode: DEFAULT_PROXY_MODE
};
const EDGEONE_PROXY_PROJECT_URL = "https://github.com/shaoyouvip/Edgeone-proxy";
const DEFAULT_SITE_SETTINGS: SiteSettings = {
  name: "HTools",
  subtitle: "\u5de5\u5177\u5bfc\u822a\u7ad9",
  iconUrl: "",
  aboutContent: DEFAULT_ABOUT_CONTENT,
  footer: DEFAULT_FOOTER_SETTINGS
};
const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SITE_SETTINGS);
const ProxySettingsContext = createContext<ProxySettings>(DEFAULT_PROXY_SETTINGS);

function getSiteDisplayName(settings: SiteSettings) {
  return settings.name.trim() || DEFAULT_SITE_SETTINGS.name;
}

function getSiteSubtitle(settings: SiteSettings) {
  return settings.subtitle.trim() || DEFAULT_SITE_SETTINGS.subtitle;
}

function getSiteDocumentTitle(settings: SiteSettings) {
  const name = getSiteDisplayName(settings);
  const subtitle = getSiteSubtitle(settings);

  return subtitle ? `${name} - ${subtitle}` : name;
}

function getSiteFooterSettings(settings: SiteSettings): FooterSettings {
  const footer: Partial<FooterSettings> = settings.footer ?? {};

  return {
    ...DEFAULT_FOOTER_SETTINGS,
    ...footer,
    description: normalizeFooterDescription(footer.description),
    authorName: DEFAULT_FOOTER_SETTINGS.authorName,
    authorUrl: DEFAULT_FOOTER_SETTINGS.authorUrl,
    copyright: DEFAULT_FOOTER_SETTINGS.copyright,
    sponsorLabel:
      footer.sponsorLabel?.trim() || DEFAULT_FOOTER_SETTINGS.sponsorLabel,
    sponsorUrl: normalizeFooterSponsorUrl(footer.sponsorUrl),
    socialLinks: footer.socialLinks?.length
      ? footer.socialLinks.map(normalizeLegacyDefaultFooterLink)
      : DEFAULT_FOOTER_SETTINGS.socialLinks,
    groups: footer.groups?.length
      ? normalizeFooterNavigationLabels(footer.groups)
      : DEFAULT_FOOTER_SETTINGS.groups
  };
}

function getLocalizedFooterSettings(
  settings: SiteSettings,
  t: Messages
): FooterSettings {
  const footerSettings = getSiteFooterSettings(settings);
  const footer: Partial<FooterSettings> = settings.footer ?? {};

  return {
    ...footerSettings,
    description: isDefaultFooterDescription(footer.description)
      ? t.home.footerDescription
      : footerSettings.description,
    groups: isDefaultFooterGroups(footer.groups)
      ? getLocalizedDefaultFooterGroups(t)
      : footerSettings.groups
  };
}

function getLocalizedDefaultFooterGroups(t: Messages): FooterLinkGroup[] {
  return [
    {
      title: t.home.footerProduct,
      links: [
        { label: t.nav.tools, href: "/tools" },
        { label: t.nav.articles, href: "/articles" },
        { label: t.actions.submitTool, href: "/submit" }
      ]
    },
    {
      title: t.home.footerSupport,
      links: [
        { label: t.home.email, href: "mailto:admin@zrf.me" },
        { label: "GitHub", href: FOOTER_PROJECT_URL },
        { label: "Telegram", href: "https://d.zrf.me/tgq" }
      ]
    },
    {
      title: t.home.footerOther,
      links: [
        { label: t.home.countdown, href: "https://zrf.me/" },
        { label: t.home.blog, href: "https://blog.zrf.me" }
      ]
    },
    {
      title: t.home.footerMore,
      links: [
        { label: t.home.about, href: "/about" },
        { label: t.home.privacy, href: "/privacy" },
        { label: t.home.terms, href: "/terms" }
      ]
    }
  ];
}

function getLegacyDefaultFooterGroups(): FooterLinkGroup[] {
  return DEFAULT_FOOTER_SETTINGS.groups.map((group) =>
    group.title === translations.zh.home.footerMore
      ? { ...group, title: LEGACY_DEFAULT_FOOTER_MORE_TITLE }
      : group
  );
}

function isDefaultFooterDescription(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return true;
  }

  return [
    DEFAULT_FOOTER_DESCRIPTION,
    LEGACY_DEFAULT_FOOTER_DESCRIPTION,
    PREVIOUS_DEFAULT_FOOTER_DESCRIPTION,
    TEMP_DEFAULT_FOOTER_DESCRIPTION,
    translations.zh.home.footerDescription,
    translations.en.home.footerDescription
  ].includes(value.trim());
}

function isDefaultFooterGroups(groups: FooterLinkGroup[] | undefined) {
  if (!groups?.length) {
    return true;
  }

  return DEFAULT_FOOTER_GROUP_SIGNATURES.has(createFooterGroupSignature(groups));
}

function createFooterGroupSignature(groups: FooterLinkGroup[]) {
  return JSON.stringify(
    normalizeFooterNavigationLabels(groups).map((group) => ({
      title: group.title.trim().toLowerCase(),
      links: group.links.map((link) => ({
        label: link.label.trim().toLowerCase(),
        href: link.href.trim().replace(/\/$/, "").toLowerCase()
      }))
    }))
  );
}

function normalizeFooterSponsorUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return DEFAULT_FOOTER_SETTINGS.sponsorUrl;
  }

  const sponsorUrl = value.trim();

  return sponsorUrl.replace(/\/$/, "").toLowerCase() ===
    LEGACY_DEFAULT_SPONSOR_URL.replace(/\/$/, "").toLowerCase()
    ? DEFAULT_FOOTER_SETTINGS.sponsorUrl
    : sponsorUrl;
}

function normalizeFooterDescription(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return DEFAULT_FOOTER_SETTINGS.description;
  }

  const description = value.trim();

  return [
    LEGACY_DEFAULT_FOOTER_DESCRIPTION,
    PREVIOUS_DEFAULT_FOOTER_DESCRIPTION,
    TEMP_DEFAULT_FOOTER_DESCRIPTION
  ].includes(description)
    ? DEFAULT_FOOTER_SETTINGS.description
    : description;
}

function normalizeFooterNavigationLabels(groups: FooterLinkGroup[]) {
  return groups.map((group) => ({
    ...group,
    links: group.links.map(normalizeFooterNavigationLink)
  }));
}

function normalizeFooterNavigationLink(link: FooterLink): FooterLink {
  if (link.href === "/category") {
    return {
      ...link,
      href: "/tools",
      label:
        link.label === "\u5206\u7c7b" || link.label.toLowerCase() === "category"
          ? link.label === "\u5206\u7c7b"
            ? "\u5de5\u5177"
            : "Tools"
          : link.label
    };
  }

  const normalizedLegacyLink = normalizeLegacyDefaultFooterLink(link);

  if (normalizedLegacyLink !== link) {
    return normalizedLegacyLink;
  }

  if (isDefaultAuthorLegalHref(link.href, "/privacy")) {
    return {
      ...link,
      href: "/privacy"
    };
  }

  if (isDefaultAuthorLegalHref(link.href, "/terms")) {
    return {
      ...link,
      href: "/terms"
    };
  }

  return link;
}

function normalizeLegacyDefaultFooterLink(link: FooterLink): FooterLink {
  if (link.href.toLowerCase() === "mailto:hello@zrf.me") {
    return {
      ...link,
      href: "mailto:admin@zrf.me"
    };
  }

  if (/^https:\/\/t\.me\/?$/i.test(link.href)) {
    return {
      ...link,
      href: "https://d.zrf.me/tgq"
    };
  }

  return link;
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

function getFooterFormValues(settings: SiteSettings): FooterSettings {
  return {
    ...DEFAULT_FOOTER_SETTINGS,
    ...(settings.footer ?? {}),
    authorName: DEFAULT_FOOTER_SETTINGS.authorName,
    authorUrl: DEFAULT_FOOTER_SETTINGS.authorUrl,
    copyright: DEFAULT_FOOTER_SETTINGS.copyright,
    sponsorUrl: normalizeFooterSponsorUrl(settings.footer?.sponsorUrl)
  };
}

function getEditableSiteSettings(settings: SiteSettings): SiteSettings {
  const footer = getSiteFooterSettings(settings);

  return {
    ...settings,
    name: settings.name.trim() || DEFAULT_SITE_SETTINGS.name,
    subtitle: settings.subtitle.trim() || DEFAULT_SITE_SETTINGS.subtitle,
    aboutContent: settings.aboutContent ?? DEFAULT_SITE_SETTINGS.aboutContent,
    footer
  };
}

function formatFooterJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function isSiteIconDataUrl(value: string) {
  return /^data:image\/(?:png|jpe?g|webp|gif|x-icon|vnd\.microsoft\.icon);base64,/i.test(
    value.trim()
  );
}

function addSiteIconRetryParam(value: string, retryToken: number) {
  if (!retryToken || isSiteIconDataUrl(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    url.searchParams.set("htools_icon_retry", String(retryToken));
    return url.toString();
  } catch {
    return value;
  }
}

function ensureFaviconLink(key: string) {
  const selector = `link[data-htools-favicon="${key}"]`;
  const existingLink = document.head.querySelector<HTMLLinkElement>(selector);

  if (existingLink) {
    return existingLink;
  }

  const link = document.createElement("link");
  link.rel = "icon";
  link.dataset.htoolsFavicon = key;
  document.head.appendChild(link);

  return link;
}

function syncSiteFavicon(iconUrl: string) {
  const customIconUrl = iconUrl.trim();

  DEFAULT_FAVICON_LINKS.forEach((favicon) => {
    const link = ensureFaviconLink(favicon.key);
    link.rel = "icon";

    if (customIconUrl) {
      link.href = customIconUrl;
      link.removeAttribute("sizes");
      link.removeAttribute("type");
      return;
    }

    link.href = favicon.href;

    if (favicon.sizes) {
      link.setAttribute("sizes", favicon.sizes);
    } else {
      link.removeAttribute("sizes");
    }

    if (favicon.type) {
      link.type = favicon.type;
    } else {
      link.removeAttribute("type");
    }
  });
}

function getSiteIconFileType(file: File) {
  if (SITE_ICON_UPLOAD_TYPES.has(file.type)) {
    return file.type;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return SITE_ICON_EXTENSION_TYPES[extension] ?? "";
}

async function readSiteIconFile(file: File) {
  const mediaType = getSiteIconFileType(file);

  if (!mediaType) {
    throw new Error("site icon file type is not supported.");
  }

  if (file.size > SITE_ICON_UPLOAD_MAX_BYTES) {
    throw new Error("site icon file is too large.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }

  return `data:${mediaType};base64,${window.btoa(binary)}`;
}

function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

function useProxySettings() {
  return useContext(ProxySettingsContext);
}

function SiteBrandMark({
  className = "",
  iconSize = 25,
  strokeWidth = 2.2
}: {
  className?: string;
  iconSize?: number;
  strokeWidth?: number;
}) {
  const settings = useSiteSettings();
  const iconUrl = settings.iconUrl.trim();
  const [imageFailed, setImageFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const iconSrc = useMemo(
    () => addSiteIconRetryParam(iconUrl, retryToken),
    [iconUrl, retryToken]
  );

  useEffect(() => {
    setImageFailed(false);
    setRetryToken(0);
  }, [iconUrl]);

  function handleImageError() {
    if (!retryToken && !isSiteIconDataUrl(iconUrl)) {
      setRetryToken(Date.now());
      return;
    }

    setImageFailed(true);
  }

  return (
    <span
      className={`brand-mark ${className} ${
        iconUrl && !imageFailed ? "has-site-icon" : ""
      }`.trim()}
    >
      {iconUrl && !imageFailed ? (
        <img
          className="site-brand-icon"
          src={iconSrc}
          alt=""
          onError={handleImageError}
        />
      ) : (
        <Wand2 size={iconSize} strokeWidth={strokeWidth} />
      )}
    </span>
  );
}

type PublicPage = "home" | "category" | "articles" | "submit" | "about";
type ThemeMode = "light" | "dark" | "system";
type AdminView = "tools" | "articles" | "content" | "check" | "system";
type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

const adminViews: AdminView[] = [
  "tools",
  "articles",
  "content",
  "check",
  "system"
];
const adminViewPaths: Record<AdminView, string> = {
  tools: "tools",
  articles: "articles",
  content: "content",
  check: "check",
  system: "settings"
};

function isAdminView(value: string | null): value is AdminView {
  return value !== null && adminViews.includes(value as AdminView);
}

function getAdminPath(view: AdminView) {
  return `/admin/${adminViewPaths[view]}`;
}

function getAdminViewFromPath(pathname: string) {
  const segment = pathname.match(/^\/admin(?:\/([^/?#]+))?\/?$/)?.[1] ?? null;

  return (
    Object.entries(adminViewPaths).find(([, path]) => path === segment)?.[0] as
      | AdminView
      | undefined
  ) ?? null;
}

function getInitialAdminView(): AdminView {
  if (typeof window === "undefined") {
    return "tools";
  }

  const pathView = getAdminViewFromPath(window.location.pathname);
  if (pathView) {
    return pathView;
  }

  return "tools";
}

function resolveThemeMode(mode: ThemeMode) {
  if (mode !== "system") {
    return mode;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveStoredThemeMode(value?: string | null): ThemeMode {
  return value === "dark" || value === "system" ? value : "light";
}

function getAdminImportText(locale: Locale) {
  if (locale === "zh") {
    return {
      action: "\u5bfc\u5165",
      title: "\u5bfc\u5165\u5de5\u5177",
      description: "\u9009\u62e9 JSON \u6587\u4ef6\u6216\u76f4\u63a5\u7c98\u8d34\u5de5\u5177\u6570\u636e\u3002\u652f\u6301\u6570\u7ec4\u683c\u5f0f\uff0c\u4e5f\u652f\u6301\u5305\u542b tools \u6570\u7ec4\u7684\u5bf9\u8c61\u3002",
      chooseFile: "\u9009\u62e9 JSON \u6587\u4ef6",
      jsonLabel: "\u5bfc\u5165\u6570\u636e",
      jsonPlaceholder: "[\n  {\n    \"name\": \"Example Tool\",\n    \"description\": \"\u5de5\u5177\u7b80\u4ecb\",\n    \"url\": \"https://example.com\",\n    \"category\": \"Other Tools\",\n    \"tags\": [\"Other Tools\"]\n  }\n]",
      overwrite: "\u8986\u76d6\u5df2\u5b58\u5728\u7684\u76f8\u540c URL \u5de5\u5177",
      importButton: "\u5bfc\u5165\u5de5\u5177",
      importing: "\u5bfc\u5165\u4e2d...",
      empty: "\u8bf7\u5148\u9009\u62e9\u6587\u4ef6\u6216\u7c98\u8d34 JSON \u6570\u636e\u3002",
      invalid: "JSON \u5fc5\u987b\u662f\u6570\u7ec4\uff0c\u6216\u5305\u542b tools \u6570\u7ec4\u7684\u5bf9\u8c61\u3002",
      fileLoaded: (name: string) => `\u5df2\u8bfb\u53d6 ${name}`,
      summary: (result: ToolImportResponse) =>
        `\u5bfc\u5165\u5b8c\u6210\uff1a\u65b0\u589e ${result.imported}\uff0c\u8986\u76d6 ${result.updated}\uff0c\u8df3\u8fc7 ${result.skipped}\uff0c\u5931\u8d25 ${result.failed}\u3002`
    };
  }

  return {
    action: "Import",
    title: "Import Tools",
    description:
      "Choose a JSON file or paste tool data. Both an array and an object with a tools array are supported.",
    chooseFile: "Choose JSON file",
    jsonLabel: "Import data",
    jsonPlaceholder:
      '[\n  {\n    "name": "Example Tool",\n    "description": "What it does",\n    "url": "https://example.com",\n    "category": "Other Tools",\n    "tags": ["Other Tools"]\n  }\n]',
    overwrite: "Overwrite existing tools with the same URL",
    importButton: "Import Tools",
    importing: "Importing...",
    empty: "Choose a file or paste JSON data first.",
    invalid: "JSON must be an array or an object with a tools array.",
    fileLoaded: (name: string) => `Loaded ${name}`,
    summary: (result: ToolImportResponse) =>
      `Import complete: ${result.imported} created, ${result.updated} updated, ${result.skipped} skipped, ${result.failed} failed.`
  };
}

function getAdminMaintenanceText(locale: Locale) {
  if (locale === "zh") {
    const siteText = {
      siteTitle: "\u7ad9\u70b9\u4fe1\u606f",
      siteDescription: "\u4fee\u6539\u524d\u53f0\u548c\u540e\u53f0\u663e\u793a\u7684\u7f51\u7ad9\u540d\u79f0\u4e0e\u56fe\u6807\u3002\u4e0d\u586b\u5199\u5219\u4f7f\u7528\u9ed8\u8ba4\u7ad9\u70b9\u4fe1\u606f\u3002",
      siteNameLabel: "\u7f51\u7ad9\u540d\u79f0",
      siteSubtitleLabel: "\u7f51\u7ad9\u526f\u6807\u9898",
      siteIconLabel: "\u7f51\u7ad9\u56fe\u6807 URL",
      siteIconChoiceHelp: "\u53ef\u586b\u5199\u56fe\u6807\u94fe\u63a5\uff0c\u4e5f\u53ef\u9009\u62e9\u672c\u5730\u56fe\u7247\u4e0a\u4f20\uff0c\u4e8c\u9009\u4e00\u5373\u53ef\u3002",
      siteIconPlaceholder: "https://example.com/icon.png",
      siteIconUpload: "\u9009\u62e9\u672c\u5730\u56fe\u7247",
      siteIconUploaded: "\u5df2\u4f7f\u7528\u672c\u5730\u4e0a\u4f20\u56fe\u6807",
      siteIconUploadHint: "\u652f\u6301 PNG\u3001WEBP\u3001JPG\u3001GIF\u3001ICO\uff0c\u6700\u5927 1MB\u3002",
      siteIconUploadInvalid: "\u8bf7\u9009\u62e9\u652f\u6301\u7684\u56fe\u7247\u683c\u5f0f\u3002",
      siteIconUploadTooLarge: "\u56fe\u7247\u8bf7\u63a7\u5236\u5728 1MB \u4ee5\u5185\u3002",
      siteSave: "\u4fdd\u5b58\u7ad9\u70b9\u4fe1\u606f",
      siteSaving: "\u4fdd\u5b58\u4e2d...",
      siteUpdated: "\u7ad9\u70b9\u4fe1\u606f\u5df2\u66f4\u65b0\u3002",
      siteReset: "\u6062\u590d\u9ed8\u8ba4",
      siteResetting: "\u6062\u590d\u4e2d...",
      siteResetDone: "\u7ad9\u70b9\u4fe1\u606f\u5df2\u6062\u590d\u9ed8\u8ba4\u3002",
      siteIconInvalid: "\u7f51\u7ad9\u56fe\u6807\u5fc5\u987b\u662f\u6709\u6548\u7684 http/https \u5730\u5740\uff0c\u6216\u652f\u6301\u7684\u56fe\u7247\u6587\u4ef6\u3002",
      aboutSettingsTitle: "\u5173\u4e8e\u9875\u9762",
      aboutSettingsDescription: "\u7528 Markdown \u7f16\u5199\u524d\u53f0\u5173\u4e8e\u9875\u5185\u5bb9\u3002\u7559\u7a7a\u5219\u4f7f\u7528\u9ed8\u8ba4\u5173\u4e8e\u9875\u3002",
      aboutContentLabel: "\u5173\u4e8e\u9875 Markdown",
      aboutContentPlaceholder: "# \u5173\u4e8e\u6211\u4eec\n\n\u5728\u8fd9\u91cc\u7f16\u5199\u4f60\u7684\u7ad9\u70b9\u4ecb\u7ecd\u3001\u9879\u76ee\u80cc\u666f\u548c\u8054\u7cfb\u65b9\u5f0f\u3002",
      aboutSave: "\u4fdd\u5b58\u5173\u4e8e\u9875",
      aboutReset: "\u6062\u590d\u9ed8\u8ba4",
      aboutResetting: "\u6062\u590d\u4e2d...",
      aboutResetDone: "\u5173\u4e8e\u9875\u5df2\u6062\u590d\u9ed8\u8ba4\u3002",
      footerTitle: "\u9875\u811a\u8bbe\u7f6e",
      footerDescription: "\u81ea\u5b9a\u4e49\u524d\u53f0\u5e95\u90e8\u7684\u4ecb\u7ecd\u3001\u8d5e\u52a9\u6309\u94ae\u548c\u94fe\u63a5\u680f\u76ee\u3002\u4e0d\u586b\u5199\u5219\u4f7f\u7528\u9ed8\u8ba4\u9875\u811a\u914d\u7f6e\u3002",
      footerIntroLabel: "\u9875\u811a\u4ecb\u7ecd",
      footerSponsorLabel: "\u8d5e\u52a9\u6309\u94ae\u6587\u5b57",
      footerSponsorUrl: "\u8d5e\u52a9\u6309\u94ae\u94fe\u63a5",
      footerSocialLinks: "\u793e\u4ea4\u56fe\u6807\u94fe\u63a5 JSON",
      footerGroups: "\u9875\u811a\u680f\u76ee JSON",
      footerJsonHelp: "\u793e\u4ea4\u94fe\u63a5\u4f7f\u7528 [{\"label\":\"GitHub\",\"href\":\"https://...\"}]\uff1b\u680f\u76ee\u4f7f\u7528 [{\"title\":\"\u4ea7\u54c1\",\"links\":[{\"label\":\"\u5de5\u5177\",\"href\":\"/tools\"}]}]\u3002",
      footerSave: "\u4fdd\u5b58\u9875\u811a\u8bbe\u7f6e",
      footerReset: "\u6062\u590d\u9ed8\u8ba4",
      footerResetting: "\u6062\u590d\u4e2d...",
      footerResetDone: "\u9875\u811a\u8bbe\u7f6e\u5df2\u6062\u590d\u9ed8\u8ba4\u3002",
      footerJsonInvalid: "\u9875\u811a JSON \u683c\u5f0f\u4e0d\u6b63\u786e\u3002",
    };

    return {
      ...siteText,
      title: "\u68c0\u6d4b / \u5bfc\u5165",
      sourceTitle: "\u8ba2\u9605\u6e90\u5bfc\u5165",
      sourceDescription: "\u4ece\u517c\u5bb9\u7684 JSON \u8ba2\u9605\u6e90\u8bfb\u53d6\u5de5\u5177\u6570\u636e\u3002\u9ed8\u8ba4\u5730\u5740\u6307\u5411 HTools \u4e3b\u4ed3\u5e93\u7684\u5728\u7ebf\u6570\u636e\u6e90\uff0c\u4e5f\u53ef\u4ee5\u586b\u5199\u5176\u4ed6\u516c\u5f00\u6e90\uff0c\u4f8b\u5982\u5176\u4ed6\u7ad9\u70b9\u516c\u5f00\u7684 /api/htools.json\u3002\u68c0\u6d4b\u53ea\u6821\u9a8c\u683c\u5f0f\u548c\u6570\u91cf\uff0c\u5bfc\u5165\u624d\u4f1a\u5199\u5165 D1\u3002",
      sourceUrl: "\u8ba2\u9605\u6e90 URL",
      sourcePlaceholder: DEFAULT_SOURCE_URL,
      sourceDetect: "\u68c0\u6d4b\u8ba2\u9605\u6e90",
      sourceChecking: "\u68c0\u6d4b\u4e2d...",
      sourceImport: "\u5bfc\u5165\u8ba2\u9605\u6e90",
      sourceImporting: "\u5bfc\u5165\u4e2d...",
      sourceExport: "\u5bfc\u51fa\u8ba2\u9605\u6e90",
      sourceExporting: "\u5bfc\u51fa\u4e2d...",
      sourceMode: "\u5bfc\u5165\u65b9\u5f0f",
      sourceModeSkip: "\u8df3\u8fc7\u91cd\u590d",
      sourceModeUpsert: "\u8986\u76d6\u540c URL",
      sourceModeHelp: "\u9ed8\u8ba4\u8df3\u8fc7\u5df2\u5b58\u5728 URL\uff1b\u9700\u8981\u540c\u6b65\u66f4\u65b0\u65f6\u518d\u9009\u62e9\u8986\u76d6\u3002",
      sourceEmpty: "\u8ba2\u9605\u6e90\u6ca1\u6709\u53ef\u8bfb\u53d6\u7684\u5de5\u5177\u6570\u636e\u3002",
      sourceInvalid: "JSON \u5fc5\u987b\u662f\u6570\u7ec4\uff0c\u6216\u5305\u542b tools \u6570\u7ec4\u7684\u5bf9\u8c61\u3002",
      sourceTotal: "\u603b\u6570",
      sourceValid: "\u6709\u6548",
      sourceDuplicate: "\u8ba2\u9605\u6e90\u5185\u91cd\u590d",
      sourceExisting: "\u672c\u7ad9\u91cd\u590d",
      sourceMissing: "\u7f3a\u5b57\u6bb5",
      sourceWillCreate: "\u5c06\u65b0\u589e",
      sourceWillUpdate: "\u5c06\u66f4\u65b0",
      sourceWillSkip: "\u5c06\u8df3\u8fc7",
      sourceErrors: "\u683c\u5f0f\u95ee\u9898",
      sourceItemObject: "\u8be5\u6761\u76ee\u5fc5\u987b\u662f\u5bf9\u8c61\u3002",
      sourceUrlInvalid: "url \u5fc5\u987b\u662f\u6709\u6548\u7f51\u5740\u3002",
      sourceDemoUrlInvalid: "demoUrl \u5fc5\u987b\u662f\u6709\u6548\u7f51\u5740\u3002",
      sourceImageInvalid: "image \u5fc5\u987b\u662f\u6709\u6548\u7f51\u5740\u3002",
      sourceOperationFailed: "\u8ba2\u9605\u6e90\u64cd\u4f5c\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5\u5730\u5740\u6216\u7a0d\u540e\u91cd\u8bd5\u3002",
      systemTitle: "\u7cfb\u7edf\u8bbe\u7f6e",
      systemDescription: "\u7ba1\u7406\u7ad9\u70b9\u7ea7\u5f00\u5173\u548c\u516c\u5f00\u80fd\u529b\u3002",
      oauthTitle: "GitHub \u63d0\u4ea4\u8bbe\u7f6e",
      oauthDescription: "\u5f00\u542f\u7528\u6237\u901a\u8fc7 GitHub \u767b\u5f55\u5e76\u63d0\u4ea4\u5de5\u5177\uff0c\u63d0\u4ea4\u540e\u4f1a\u5728\u76ee\u6807\u4ed3\u5e93\u521b\u5efa Issue\u3002",
      securityTitle: "\u7ba1\u7406\u5458\u5b89\u5168\u8bbe\u7f6e",
      securityDescription: "\u7edf\u4e00\u7ba1\u7406\u540e\u53f0\u767b\u5f55\u5bc6\u7801\uff0c\u5efa\u8bae\u5b9a\u671f\u66f4\u65b0\u5e76\u907f\u514d\u4f7f\u7528\u5f31\u5bc6\u7801\u3002",
      securityCurrent: "\u5f53\u524d\u5bc6\u7801",
      securityNew: "\u65b0\u5bc6\u7801",
      securityConfirm: "\u786e\u8ba4\u65b0\u5bc6\u7801",
      securitySave: "\u66f4\u65b0\u5bc6\u7801",
      securitySaving: "\u66f4\u65b0\u4e2d...",
      securityConfigured: "\u5df2\u8bbe\u7f6e D1 \u5bc6\u7801",
      securityUsingEnv: "\u6b63\u5728\u4f7f\u7528\u73af\u5883\u53d8\u91cf\u5bc6\u7801",
      securityCurrentRequired: "\u8bf7\u8f93\u5165\u5f53\u524d\u5bc6\u7801\u3002",
      securityNewRequired: "\u8bf7\u8f93\u5165\u65b0\u5bc6\u7801\u3002",
      securityConfirmRequired: "\u8bf7\u786e\u8ba4\u65b0\u5bc6\u7801\u3002",
      securityMismatch: "\u4e24\u6b21\u8f93\u5165\u7684\u65b0\u5bc6\u7801\u4e0d\u4e00\u81f4\u3002",
      securityCurrentIncorrect: "\u5f53\u524d\u5bc6\u7801\u4e0d\u6b63\u786e\u3002",
      securityUpdated: "\u7ba1\u7406\u5458\u5bc6\u7801\u5df2\u66f4\u65b0\u3002",
      backupTitle: "\u5907\u4efd\u4e0e\u6062\u590d",
      backupDescription: "\u5728\u53d8\u66f4\u524d\u5bfc\u51fa\u5f53\u524d\u6570\u636e\uff0c\u5fc5\u8981\u65f6\u518d\u5bfc\u5165\u6062\u590d\uff0c\u51cf\u5c11\u8bef\u64cd\u4f5c\u98ce\u9669\u3002",
      backupHelp:
        "完整备份包含工具库、文章、内容流、分类和站点设置；不会导出管理员密码、GitHub 提交密钥或登录会话。恢复会覆盖当前站点内容，建议先导出备份。",
      backupExport: "\u5bfc\u51fa\u5907\u4efd",
      backupExporting: "\u5bfc\u51fa\u4e2d...",
      backupChoose: "\u9009\u62e9\u5907\u4efd\u6587\u4ef6",
      backupRestore: "\u6062\u590d\u5907\u4efd",
      backupRestoring: "\u6062\u590d\u4e2d...",
      backupEmpty: "\u8bf7\u5148\u9009\u62e9\u5907\u4efd JSON \u6587\u4ef6\u3002",
      backupInvalid: "请选择 HTools 完整备份 JSON 文件。",
      backupRestoreConfirm:
        "确定要恢复这个备份吗？当前工具、文章、内容流、分类和站点设置会被备份内容覆盖。",
      publicTitle: "\u6211\u7684\u7ad9\u70b9\u6e90",
      publicDescription: "\u9ed8\u8ba4\u5173\u95ed\u3002\u5f00\u542f\u540e\uff0c\u522b\u4eba\u53ef\u4ee5\u901a\u8fc7\u4e0b\u65b9\u5730\u5740\u8bfb\u53d6\u5f53\u524d\u5de5\u5177\u5217\u8868\u3002",
      publicEnabled: "\u5df2\u5f00\u542f",
      publicDisabled: "\u5df2\u5173\u95ed",
      publicSourceUrlLabel: "\u5f53\u524d\u7ad9\u70b9\u6e90\u5730\u5740",
      publicEnable: "\u5f00\u542f\u7ad9\u70b9\u6e90",
      publicDisable: "\u5173\u95ed\u7ad9\u70b9\u6e90",
      publicOpening: "\u4fdd\u5b58\u4e2d...",
      publicOpen: "\u6253\u5f00\u7ad9\u70b9\u6e90",
      publicCopy: "\u590d\u5236\u5730\u5740",
      publicCopied: "\u7ad9\u70b9\u6e90\u5730\u5740\u5df2\u590d\u5236\u3002",
      publicUpdated: "\u7ad9\u70b9\u6e90\u8bbe\u7f6e\u5df2\u66f4\u65b0\u3002",
      publicEnabledMessage: "\u7ad9\u70b9\u6e90\u5df2\u5f00\u542f\u3002",
      publicDisabledMessage: "\u7ad9\u70b9\u6e90\u5df2\u5173\u95ed\u3002",
      proxyTitle: "代理访问",
      proxyDescription: "\u53ef\u7528\u4e8e\u89e3\u51b3\u90e8\u5206\u56fe\u7247\u6216\u94fe\u63a5\u8bbf\u95ee\u5f02\u5e38\u3002\u5f00\u542f\u540e\uff0c\u7ad9\u5185\u5916\u90e8\u94fe\u63a5\u548c\u5916\u90e8\u56fe\u7247\u8d44\u6e90\u4f1a\u901a\u8fc7\u4f60\u586b\u5199\u7684\u4ee3\u7406\u670d\u52a1\u8bbf\u95ee\uff0c\u7ad9\u5185\u529f\u80fd\u3001API \u548c\u7ad9\u70b9\u56fe\u6807\u4e0d\u4f1a\u88ab\u4ee3\u7406\u3002",
      proxyEnabled: "\u5df2\u5f00\u542f",
      proxyDisabled: "\u5df2\u5173\u95ed",
      proxyUrlLabel: "\u4ee3\u7406\u670d\u52a1\u5730\u5740",
      proxyPlaceholder: "https://your-proxy.example.com/",
      proxyModeLabel: "\u4ee3\u7406\u8bbf\u95ee\u89c4\u5219",
      proxyModePrefix: "\u76f4\u63a5\u62fc\u63a5",
      proxyModeEdgeOneProxy: "Edgeone-Proxy \u6807\u51c6",
      proxyModeEdgeOneAdvanced: "Edgeone-Proxy \u9ad8\u7ea7",
      proxyHelp: "\u76f4\u63a5\u62fc\u63a5\u4f7f\u7528\u201c\u4ee3\u7406\u5730\u5740 + \u76ee\u6807\u5730\u5740\u201d\uff1bEdgeone-Proxy \u6807\u51c6\u4f7f\u7528 `/proxy?url=`\uff1bEdgeone-Proxy \u9ad8\u7ea7\u4f7f\u7528 `/advanced-proxy?url=`\u3002",
      proxyWarning: "提示：请谨慎开启。部分站点、图片防盗链或登录跳转可能与代理不兼容，如果开启后页面显示异常，请先关闭代理或更换代理服务。",
      proxyProjectNote: "HTools 不内置代理服务，如需使用，可自行部署代理项目后填写部署地址。",
      proxyProjectLink: "Edgeone-Proxy \u9879\u76ee\u5730\u5740",
      proxyEnable: "\u5f00\u542f\u4ee3\u7406",
      proxyDisable: "\u5173\u95ed\u4ee3\u7406",
      proxySave: "\u4fdd\u5b58\u4ee3\u7406\u8bbe\u7f6e",
      proxySaving: "\u4fdd\u5b58\u4e2d...",
      proxyRequired: "\u5f00\u542f\u4ee3\u7406\u524d\u8bf7\u586b\u5199\u4ee3\u7406\u670d\u52a1\u5730\u5740\u3002",
      proxyInvalid: "\u4ee3\u7406\u670d\u52a1\u5730\u5740\u5fc5\u987b\u662f\u6709\u6548\u7684 http/https \u5730\u5740\u3002",
      proxyUpdated: "\u4ee3\u7406\u8bbe\u7f6e\u5df2\u66f4\u65b0\u3002",
      resetTitle: "\u6062\u590d\u9ed8\u8ba4\u8bbe\u7f6e",
      resetDescription:
        "\u6e05\u7a7a\u5f53\u524d\u5de5\u5177\u3001\u6587\u7ae0\u3001\u5185\u5bb9\u6d41\u548c\u9884\u5efa\u5206\u7c7b\uff0c\u5e76\u5173\u95ed\u7ad9\u70b9\u6e90\u3002\u7ba1\u7406\u5458\u5bc6\u7801\u548c GitHub \u63d0\u4ea4\u8bbe\u7f6e\u4e0d\u4f1a\u88ab\u6e05\u9664\u3002",
      resetWarning:
        "\u6b64\u64cd\u4f5c\u5c06\u5220\u9664\u6240\u6709\u5bfc\u5165\u6570\u636e\uff0c\u5efa\u8bae\u5148\u5bfc\u51fa\u5b8c\u6574\u5907\u4efd\u3002",
      resetButton: "\u6062\u590d\u9ed8\u8ba4\u8bbe\u7f6e",
      resetting: "\u6b63\u5728\u6062\u590d...",
      resetConfirm:
        "\u786e\u5b9a\u8981\u6062\u590d\u9ed8\u8ba4\u8bbe\u7f6e\u5417\uff1f\u8fd9\u5c06\u5220\u9664\u5de5\u5177\u3001\u6587\u7ae0\u3001\u5185\u5bb9\u6d41\u548c\u9884\u5efa\u5206\u7c7b\uff0c\u5e76\u5173\u95ed\u7ad9\u70b9\u6e90\u3002",
      linkModuleTitle: "\u672c\u7ad9\u94fe\u63a5\u68c0\u6d4b",
      linkModuleDescription: "\u68c0\u6d4b\u5df2\u4fdd\u5b58\u5de5\u5177\u7684\u9879\u76ee\u5730\u5740\u548c\u6f14\u793a\u7ad9\u70b9\u662f\u5426\u53ef\u8bbf\u95ee\uff0c\u7ed3\u679c\u53ea\u5c55\u793a\uff0c\u4e0d\u4f1a\u4fee\u6539\u94fe\u63a5\u3002",
      urlLabel: "\u9879\u76ee\u5730\u5740",
      demoUrlLabel: "\u6f14\u793a\u7ad9\u70b9",
      sourceChecked: (count: number) => `\u8ba2\u9605\u6e90\u68c0\u6d4b\u5b8c\u6210\uff1a\u5171 ${count} \u6761\u3002`,
      sourceImportSummary: (result: ToolImportResponse) =>
        `\u5bfc\u5165\u5b8c\u6210\uff1a\u65b0\u589e ${result.imported}\uff0c\u66f4\u65b0 ${result.updated}\uff0c\u8df3\u8fc7 ${result.skipped}\uff0c\u5931\u8d25 ${result.failed}\u3002`,
      sourceExported: (count: number) => `已导出订阅源：${count} 条。`,
      sourceErrorItem: (index: number, message: string) =>
        `\u7b2c ${index + 1} \u6761\uff1a${message}`,
      sourceRequestFailed: (status: number) => `\u8ba2\u9605\u6e90\u8bf7\u6c42\u5931\u8d25\uff1a${status}`,
      sourceRequired: (fields: string) => `${fields} \u4e3a\u5fc5\u586b\u5b57\u6bb5\u3002`,
      securityUpdatedAt: (date: string) => `\u4e0a\u6b21\u66f4\u65b0\uff1a${date}`,
      backupExported: (counts: BackupCounts) =>
        `已导出完整备份：工具 ${counts.tools}，文章 ${counts.articles}，内容源 ${counts.contentSources}，内容 ${counts.contentItems}。`,
      backupReady: (name: string, counts: BackupCounts) =>
        `已读取 ${name}：工具 ${counts.tools}，文章 ${counts.articles}，内容源 ${counts.contentSources}，内容 ${counts.contentItems}。`,
      backupRestoreSummary: (result: BackupRestoreResponse) =>
        `恢复完成：工具 ${result.counts.tools}，文章 ${result.counts.articles}，内容源 ${result.counts.contentSources}，内容 ${result.counts.contentItems}。`,
      resetDone: (result: FactoryResetResponse) =>
        `\u5df2\u6062\u590d\u9ed8\u8ba4\u8bbe\u7f6e\uff1a\u5220\u9664\u5de5\u5177 ${result.counts.tools}\uff0c\u6587\u7ae0 ${result.counts.articles}\uff0c\u5185\u5bb9\u6e90 ${result.counts.contentSources}\uff0c\u5185\u5bb9 ${result.counts.contentItems}\u3002`
    };
  }

  return {
    title: "Check / Import",
    sourceTitle: "Subscription Source Import",
    sourceDescription:
      "Read tool data from a compatible JSON subscription source. The default URL points to the online source in the HTools main repository; you can also use other public sources, such as another site's /api/htools.json. Check only validates the source; import writes to D1.",
    sourceUrl: "Subscription source URL",
    sourcePlaceholder: DEFAULT_SOURCE_URL,
    sourceDetect: "Check Subscription",
    sourceChecking: "Checking...",
    sourceImport: "Import Subscription",
    sourceImporting: "Importing...",
    sourceExport: "Export Subscription",
    sourceExporting: "Exporting...",
    sourceMode: "Import mode",
    sourceModeSkip: "Skip duplicates",
    sourceModeUpsert: "Overwrite same URL",
    sourceModeHelp:
      "Duplicate URLs are skipped by default; choose overwrite when you want to sync updates.",
    sourceEmpty: "The source did not include readable tool data.",
    sourceInvalid: "JSON must be an array or an object with a tools array.",
    sourceChecked: (count: number) => `Subscription check complete: ${count} items.`,
    sourceImportSummary: (result: ToolImportResponse) =>
      `Import complete: ${result.imported} created, ${result.updated} updated, ${result.skipped} skipped, ${result.failed} failed.`,
    sourceExported: (count: number) => `Exported subscription source: ${count} items.`,
    sourceTotal: "Total",
    sourceValid: "Valid",
    sourceDuplicate: "Subscription dupes",
    sourceExisting: "Existing",
    sourceMissing: "Missing",
    sourceWillCreate: "Will create",
    sourceWillUpdate: "Will update",
    sourceWillSkip: "Will skip",
    sourceErrors: "Format issues",
    sourceErrorItem: (index: number, message: string) =>
      `Item ${index + 1}: ${message}`,
    sourceRequestFailed: (status: number) => `Source request failed: ${status}`,
    sourceItemObject: "Item must be an object.",
    sourceRequired: (fields: string) => `${fields} is required.`,
    sourceUrlInvalid: "url must be a valid URL.",
    sourceDemoUrlInvalid: "demoUrl must be a valid URL.",
    sourceImageInvalid: "image must be a valid URL.",
    sourceOperationFailed:
      "Subscription source operation failed. Check the URL or try again later.",
    systemTitle: "System Settings",
    systemDescription: "Manage site-level switches and public capabilities.",
    siteTitle: "Site Identity",
    siteDescription:
      "Change the site name and icon shown in the frontend and admin area. Leave blank to use the default site identity.",
    siteNameLabel: "Site name",
    siteSubtitleLabel: "Site subtitle",
    siteIconLabel: "Site icon URL",
    siteIconChoiceHelp:
      "Enter an icon URL or upload a local image. Use one method at a time.",
    siteIconPlaceholder: "https://example.com/icon.png",
    siteIconUpload: "Choose Local Image",
    siteIconUploaded: "Using uploaded local icon",
    siteIconUploadHint: "Supports PNG, WEBP, JPG, GIF, and ICO up to 1MB.",
    siteIconUploadInvalid: "Choose a supported image format.",
    siteIconUploadTooLarge: "Keep the image under 1MB.",
    siteSave: "Save Site Identity",
    siteSaving: "Saving...",
    siteUpdated: "Site identity updated.",
    siteReset: "Restore Defaults",
    siteResetting: "Restoring...",
    siteResetDone: "Site identity restored to defaults.",
    siteIconInvalid:
      "Site icon must be a valid http/https URL or a supported image file.",
    aboutSettingsTitle: "About Page",
    aboutSettingsDescription:
      "Write the public About page in Markdown. Leave it empty to use the default About page.",
    aboutContentLabel: "About page Markdown",
    aboutContentPlaceholder:
      "# About Us\n\nWrite your site introduction, project background, and contact information here.",
    aboutSave: "Save About Page",
    aboutReset: "Restore Defaults",
    aboutResetting: "Restoring...",
    aboutResetDone: "About page restored to defaults.",
    footerTitle: "Footer Settings",
    footerDescription:
      "Customize the frontend footer description, sponsor button, and link columns. Leave blank to use the default footer settings.",
    footerIntroLabel: "Footer description",
    footerSponsorLabel: "Sponsor button text",
    footerSponsorUrl: "Sponsor button URL",
    footerSocialLinks: "Social icon links JSON",
    footerGroups: "Footer columns JSON",
    footerJsonHelp:
      'Social links use [{"label":"GitHub","href":"https://..."}]; columns use [{"title":"Product","links":[{"label":"Tools","href":"/tools"}]}].',
    footerSave: "Save Footer Settings",
    footerReset: "Restore Defaults",
    footerResetting: "Restoring...",
    footerResetDone: "Footer settings restored to defaults.",
    footerJsonInvalid: "Footer JSON is not valid.",
    oauthTitle: "GitHub Submission Settings",
    oauthDescription:
      "Allow users to sign in with GitHub and submit tools. Submissions create issues in the target repository.",
    securityTitle: "Admin Security Settings",
    securityDescription:
      "Manage the admin login password in one place. Update it regularly and avoid weak passwords.",
    securityCurrent: "Current password",
    securityNew: "New password",
    securityConfirm: "Confirm new password",
    securitySave: "Update Password",
    securitySaving: "Updating...",
    securityConfigured: "D1 password configured",
    securityUsingEnv: "Using environment password",
    securityUpdatedAt: (date: string) => `Last updated: ${date}`,
    securityCurrentRequired: "Current password is required.",
    securityNewRequired: "New password is required.",
    securityConfirmRequired: "Confirm the new password.",
    securityMismatch: "The new passwords do not match.",
    securityCurrentIncorrect: "Current password is incorrect.",
    securityUpdated: "Admin password updated.",
    backupTitle: "Backup and Restore",
    backupDescription:
      "Export the current data before changes, then import it back if needed to reduce accidental-operation risk.",
    backupHelp:
      "A full backup includes tools, articles, content flows, categories, and site settings. Admin passwords, GitHub submission secrets, and login sessions are not exported. Restore overwrites the current site content.",
    backupExport: "Export Backup",
    backupExporting: "Exporting...",
    backupChoose: "Choose Backup File",
    backupRestore: "Restore Backup",
    backupRestoring: "Restoring...",
    backupEmpty: "Choose a backup JSON file first.",
    backupInvalid: "Choose an HTools full backup JSON file.",
    backupRestoreConfirm:
      "Restore this backup? Current tools, articles, content flows, categories, and site settings will be overwritten.",
    backupExported: (counts: BackupCounts) =>
      `Exported full backup: ${counts.tools} tools, ${counts.articles} articles, ${counts.contentSources} sources, ${counts.contentItems} items.`,
    backupReady: (name: string, counts: BackupCounts) =>
      `Loaded ${name}: ${counts.tools} tools, ${counts.articles} articles, ${counts.contentSources} sources, ${counts.contentItems} items.`,
    backupRestoreSummary: (result: BackupRestoreResponse) =>
      `Restore complete: ${result.counts.tools} tools, ${result.counts.articles} articles, ${result.counts.contentSources} sources, ${result.counts.contentItems} items.`,
    publicTitle: "My Site Source",
    publicDescription:
      "Off by default. Once enabled, others can read the current tool list from the address below.",
    publicEnabled: "Enabled",
    publicDisabled: "Disabled",
    publicSourceUrlLabel: "Current site source URL",
    publicEnable: "Enable Site Source",
    publicDisable: "Disable Site Source",
    publicOpening: "Saving...",
    publicOpen: "Open Site Source",
    publicCopy: "Copy URL",
    publicCopied: "Site source URL copied.",
    publicUpdated: "Site source setting updated.",
    publicEnabledMessage: "Site source enabled.",
    publicDisabledMessage: "Site source disabled.",
    proxyTitle: "Proxy Access",
    proxyDescription:
      "Can help with image or link access failures. When enabled, external links and external image resources use the proxy service you provide, while internal site features, APIs, and the site icon stay direct.",
    proxyEnabled: "Enabled",
    proxyDisabled: "Disabled",
    proxyUrlLabel: "Proxy service URL",
    proxyPlaceholder: "https://your-proxy.example.com/",
    proxyModeLabel: "Proxy access rule",
    proxyModePrefix: "Direct prefix",
    proxyModeEdgeOneProxy: "Edgeone-Proxy Standard",
    proxyModeEdgeOneAdvanced: "Edgeone-Proxy Advanced",
    proxyHelp:
      "Direct prefix uses proxy URL + target URL; Edgeone-Proxy Standard uses /proxy?url=; Edgeone-Proxy Advanced uses /advanced-proxy?url=.",
    proxyWarning:
      "Tip: enable with care. Some sites, hotlink-protected images, or login redirects may not work through a proxy. If the site displays incorrectly, disable the proxy or change the proxy service first.",
    proxyProjectNote:
      "HTools does not include a proxy service. Deploy your own proxy project, then paste its deployment URL here.",
    proxyProjectLink: "Edgeone-Proxy project",
    proxyEnable: "Enable Proxy",
    proxyDisable: "Disable Proxy",
    proxySave: "Save Proxy Settings",
    proxySaving: "Saving...",
    proxyRequired: "Enter a proxy service URL before enabling proxy fallback.",
    proxyInvalid: "Proxy service URL must be a valid http/https URL.",
    proxyUpdated: "Proxy settings updated.",
    resetTitle: "Restore Defaults",
    resetDescription:
      "Clear tools, articles, content flows, and saved categories, then disable the site source. Admin password and GitHub submission settings are kept.",
    resetWarning: "This will delete all imported data. Export a full backup first if needed.",
    resetButton: "Restore Defaults",
    resetting: "Restoring...",
    resetConfirm:
      "Restore defaults? This will delete tools, articles, content flows, saved categories, and disable the site source.",
    resetDone: (result: FactoryResetResponse) =>
      `Restored defaults: deleted ${result.counts.tools} tools, ${result.counts.articles} articles, ${result.counts.contentSources} sources, and ${result.counts.contentItems} items.`,
    linkModuleTitle: "Site Link Check",
    linkModuleDescription:
      "Check whether stored project URLs and demo sites are reachable. Results are display-only and do not modify URLs.",
    urlLabel: "Project URL",
    demoUrlLabel: "Demo site"
  };
}

function getArticleText(locale: Locale) {
  if (locale === "zh") {
    return {
      adminNav: "文章管理",
      adminTitle: "管理文章",
      adminDescription:
        "管理前台文章内容，可用于发布教程、公告、资源整理和更新记录。",
      addArticle: "添加文章",
      editArticle: "编辑文章",
      deleteArticle: "删除文章",
      searchPlaceholder: "搜索文章...",
      emptyTitle: "还没有文章",
      emptyDescription: "可以先添加一篇文章，用来发布教程、公告或资源整理。",
      noMatchTitle: "没有匹配的文章",
      noMatchDescription: "换个搜索词，或者清空筛选后再试。",
      titleLabel: "标题",
      slugLabel: "Slug",
      slugPlaceholder: "自动根据标题生成",
      slugHelp: "用于文章访问地址，留空会自动生成。",
      summaryLabel: "摘要",
      summaryPlaceholder: "用 1-2 句话说明这篇文章的内容。",
      contentLabel: "正文 Markdown",
      contentPlaceholder: "支持常用 Markdown：标题、列表、引用、代码块和链接。",
      coverImageLabel: "封面图 URL",
      coverImagePlaceholder: "可选，填写 http/https 图片地址。",
      categoryLabel: "分类",
      categoryPlaceholder: "选择或新建分类",
      categoryEmptyLabel: "选择分类",
      categoryRequired: "请先选择文章分类。",
      tagsLabel: "标签",
      tagsPlaceholder: "教程, Cloudflare, D1",
      publishedLabel: "发布文章",
      publishModeLabel: "发布方式",
      publishDirectLabel: "直接发布",
      publishTimeLabel: "发布时间",
      publishTimeHelp:
        "不填写则使用当前时间；填写后会按该时间显示和排序。",
      draftLabel: "保存为草稿",
      statusPublished: "已发布",
      statusDraft: "草稿",
      saveArticle: "保存文章",
      created: "文章已创建。",
      updated: "文章已更新。",
      deleted: "文章已删除。",
      publishedDone: "文章已发布。",
      draftedDone: "文章已设为草稿。",
      publishDraftEnabled: "已切换为已发布，请保存。",
      publishDraftDisabled: "已切换为草稿，请保存。",
      deleteConfirmTitle: "确定要删除这篇文章吗？",
      deleteConfirmDescription:
        "此操作无法撤销。这将从服务器中永久删除这篇文章。",
      readMore: "阅读文章",
      backToArticles: "返回文章列表",
      publishedOn: (date: string) => `发布于 ${date}`,
      loading: "文章加载中...",
      notFoundTitle: "文章不存在",
      notFoundDescription: "这篇文章可能尚未发布，或已经被删除。",
      publicEmptyTitle: "当前还没有文章",
      publicEmptyDescription: "可在此处发布教程、公告和资源整理。",
      openArticle: "打开文章"
    };
  }

  return {
    adminNav: "Articles",
    adminTitle: "Manage Articles",
    adminDescription:
      "Manage frontend articles for tutorials, announcements, resource roundups, and update notes.",
    addArticle: "Add Article",
    editArticle: "Edit Article",
    deleteArticle: "Delete Article",
    searchPlaceholder: "Search articles...",
    emptyTitle: "No articles yet",
    emptyDescription:
      "Add your first article to publish tutorials, announcements, or resource roundups.",
    noMatchTitle: "No matching articles",
    noMatchDescription: "Try another search term or clear the filter.",
    titleLabel: "Title",
    slugLabel: "Slug",
    slugPlaceholder: "Generated from title",
    slugHelp: "Used in the article URL. Leave empty to generate automatically.",
    summaryLabel: "Summary",
    summaryPlaceholder: "Use 1-2 sentences to describe this article.",
    contentLabel: "Markdown Content",
    contentPlaceholder:
      "Supports common Markdown: headings, lists, quotes, code blocks, and links.",
    coverImageLabel: "Cover image URL",
    coverImagePlaceholder: "Optional http/https image URL.",
    categoryLabel: "Category",
    categoryPlaceholder: "Select or create a category",
    categoryEmptyLabel: "Select category",
    categoryRequired: "Select an article category first.",
    tagsLabel: "Tags",
    tagsPlaceholder: "Tutorial, Cloudflare, D1",
    publishedLabel: "Publish article",
    publishModeLabel: "Publish mode",
    publishDirectLabel: "Publish now",
    publishTimeLabel: "Publish time",
    publishTimeHelp:
      "Leave blank to use the current time. Fill it to display and sort by that time.",
    draftLabel: "Save as draft",
    statusPublished: "Published",
    statusDraft: "Draft",
    saveArticle: "Save Article",
    created: "Article created.",
    updated: "Article updated.",
    deleted: "Article deleted.",
    publishedDone: "Article published.",
    draftedDone: "Article moved to draft.",
    publishDraftEnabled:
      "Switched to published. Save to apply.",
    publishDraftDisabled:
      "Switched to draft. Save to apply.",
    deleteConfirmTitle: "Delete this article?",
    deleteConfirmDescription:
      "This action cannot be undone. This will permanently delete the article from the server.",
    readMore: "Read Article",
    backToArticles: "Back to Articles",
    publishedOn: (date: string) => `Published on ${date}`,
    loading: "Loading articles...",
    notFoundTitle: "Article not found",
    notFoundDescription: "This article may be unpublished or deleted.",
    publicEmptyTitle: "No articles yet",
    publicEmptyDescription:
      "Publish tutorials, announcements, and resource roundups here.",
    openArticle: "Open article"
  };
}

function getContentFlowText(locale: Locale) {
  if (locale === "zh") {
    return {
      nav: "内容流",
      title: "内容流",
      description: "从 RSS / Atom 源同步外部内容，筛选后可转为站内文章草稿。",
      addSource: "添加内容源",
      editSource: "编辑内容源",
      deleteSource: "删除内容源",
      syncSource: "同步",
      syncing: "同步中...",
      preview: "预览",
      previewing: "预览中...",
      saveSource: "保存内容源",
      sourceTitleLabel: "标题",
      sourceTitlePlaceholder: "留空则使用订阅源标题",
      sourceUrlLabel: "RSS / Atom 地址",
      sourceUrlPlaceholder: "https://blog.zrf.me/atom.xml",
      categoryLabel: "分类",
      categoryPlaceholder: "选择或新建分类",
      categoryEmptyLabel: "选择分类",
      categoryRequired: "请先选择内容源分类。",
      tagsLabel: "默认标签",
      tagsPlaceholder: "科技, 博客, 开源",
      enabledLabel: "启用内容源",
      enabledStatus: "已启用",
      disabledStatus: "已停用",
      enabledDraftEnabled: "内容源状态已改为启用，请点击保存内容源生效。",
      enabledDraftDisabled: "内容源状态已改为停用，请点击保存内容源生效。",
      searchPlaceholder: "搜索内容...",
      sourceEmptyTitle: "还没有内容源",
      sourceEmptyDescription: "添加 RSS / Atom 地址后，可以同步外部文章、视频或社交内容。",
      itemEmptyTitle: "还没有内容",
      itemEmptyDescription: "添加内容源并点击同步后，内容会显示在这里。",
      noMatchTitle: "没有匹配内容",
      noMatchDescription: "换个分类、来源或搜索词再试。",
      previewTitle: "预览结果",
      convert: "转为文章",
      converted: "已转文章",
      convertCategoryTitle: "选择文章分类",
      convertCategoryDescription:
        "请选择文章管理中的分类；也可以输入新分类，转换后会用于前台文章分流。",
      convertCategoryAction: "确认转为文章",
      convertCategoryRequired: "请先选择文章分类。",
      convertPublishLabel: "发布方式",
      convertAsDraft: "存为草稿",
      convertAsPublished: "直接发布",
      convertPublishDraftTip: "已切换为草稿，请确认。",
      convertPublishPublishedTip: "已切换为直接发布，请确认。",
      openOriginal: "打开原文",
      browseArticle: "本站浏览",
      saved: "内容源已保存。",
      deleted: "内容源已删除。",
      synced: (imported: number, updated: number) =>
        `同步完成：新增 ${imported} 条，刷新 ${updated} 条。`,
      convertedDone: "已转为文章并存为草稿，可在文章管理中继续编辑或发布。",
      convertedDraftDone: "已转为文章并存为草稿，可在文章管理中继续编辑或发布。",
      convertedPublishedDone: "已转为文章并直接发布，前台文章页可直接访问。",
      deleteConfirmTitle: "删除这个内容源吗？",
      deleteConfirmDescription: "删除后，此内容源下已同步的内容条目也会一起删除。",
      sourceCount: (count: number) => `${count} 条`
    };
  }

  return {
    nav: "Content Flow",
    title: "Content Flow",
    description:
      "Sync external RSS / Atom feeds, filter entries, and convert selected items into article drafts.",
    addSource: "Add Source",
    editSource: "Edit Source",
    deleteSource: "Delete Source",
    syncSource: "Sync",
    syncing: "Syncing...",
    preview: "Preview",
    previewing: "Previewing...",
    saveSource: "Save Source",
    sourceTitleLabel: "Title",
    sourceTitlePlaceholder: "Leave blank to use the feed title",
    sourceUrlLabel: "RSS / Atom URL",
    sourceUrlPlaceholder: "https://blog.zrf.me/atom.xml",
    categoryLabel: "Category",
    categoryPlaceholder: "Select or create a category",
    categoryEmptyLabel: "Select category",
    categoryRequired: "Select a content source category first.",
    tagsLabel: "Default tags",
    tagsPlaceholder: "Tech, Blog, Open Source",
    enabledLabel: "Enable source",
    enabledStatus: "Enabled",
    disabledStatus: "Disabled",
    enabledDraftEnabled: "Source status changed to enabled. Save the source to apply it.",
    enabledDraftDisabled: "Source status changed to disabled. Save the source to apply it.",
    searchPlaceholder: "Search content...",
    sourceEmptyTitle: "No content sources yet",
    sourceEmptyDescription:
      "Add RSS / Atom URLs to sync external articles, videos, or social content.",
    itemEmptyTitle: "No content yet",
    itemEmptyDescription: "Add a content source and sync it to show entries here.",
    noMatchTitle: "No matching content",
    noMatchDescription: "Try another category, source, or search term.",
    previewTitle: "Preview",
    convert: "Convert",
    converted: "Converted",
    convertCategoryTitle: "Select article category",
    convertCategoryDescription:
      "Choose a category from article management, or create a new one for the public article filter.",
    convertCategoryAction: "Convert to article",
    convertCategoryRequired: "Select an article category first.",
    convertPublishLabel: "Publish mode",
    convertAsDraft: "Save draft",
    convertAsPublished: "Publish",
    convertPublishDraftTip:
      "Switched to draft. Confirm to apply.",
    convertPublishPublishedTip:
      "Switched to publish. Confirm to apply.",
    openOriginal: "Open Original",
    browseArticle: "View on site",
    saved: "Content source saved.",
    deleted: "Content source deleted.",
    synced: (imported: number, updated: number) =>
      `Sync complete: ${imported} imported, ${updated} refreshed.`,
    convertedDone:
      "Converted to an article draft. You can edit or publish it in article management.",
    convertedDraftDone:
      "Converted to an article draft. You can edit or publish it in article management.",
    convertedPublishedDone:
      "Converted and published. The public article page is now available.",
    deleteConfirmTitle: "Delete this content source?",
    deleteConfirmDescription:
      "Synced entries from this source will also be deleted.",
    sourceCount: (count: number) => `${count} items`
  };
}

function getCategoryIcon(category: string) {
  return categoryIcons[category as keyof typeof categoryIcons] ?? Tags;
}

function decodeBasicHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => decodeEntityCode(code, 10))
    .replace(/&#x([a-f\d]+);/gi, (_, code: string) => decodeEntityCode(code, 16));
}

function decodeEntityCode(code: string, radix: 10 | 16) {
  const point = Number.parseInt(code, radix);

  if (!Number.isFinite(point) || point < 0 || point > 0x10ffff) {
    return "";
  }

  return String.fromCodePoint(point);
}

function cleanArticleDisplayText(value: string) {
  return decodeBasicHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<a\b[^>]*(?:class=["'][^"']*\bheaderlink\b[^"']*["']|href=["']#[^"']*["'])[^>]*>\s*<\/a>/gi, " ")
    .replace(/<a\b[^>\n]*(?:class=["'][^"'\n]*\bheaderlink\b[^"'\n]*["']?|href=["']#[^"'\n]*["']?)[^>\n]*$/gi, " ")
    .replace(/\[\]\(#[^)]+\)/g, " ")
    .replace(/!\[([^\]]*)\]\((?:[^)(]|\([^)]*\))*\)/g, "$1")
    .replace(/^#{1,6}\s+/g, "")
    .replace(/\[([^\]]+)\]\((?:[^)(]|\([^)]*\))*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/(?:^|\s)[×✕✖](?=\s|$)/g, " ")
    .replace(/\s+(?:#[\p{L}\p{N}_-]+\s*){2,}(?:频道\s*[|｜]\s*聊天)?\s*$/u, "")
    .replace(/[*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getArticleDisplayTitle({
  content,
  summary,
  title
}: Pick<Article, "content" | "summary" | "title">) {
  const cleanedTitle = cleanArticleDisplayText(title);
  const contentText = cleanArticleDisplayText(content);
  const summaryText = cleanArticleDisplayText(summary);

  if (shouldDeriveArticleDisplayTitle(cleanedTitle, contentText, summaryText)) {
    const derivedTitle =
      deriveArticleDisplayTitle(content) ||
      deriveArticleDisplayTitle(summary) ||
      deriveArticleDisplayTitle(contentText);

    if (derivedTitle) {
      return truncateArticleDisplayTitle(derivedTitle, 96);
    }
  }

  return truncateArticleDisplayTitle(cleanedTitle || summaryText || "Untitled");
}

function shouldDeriveArticleDisplayTitle(
  title: string,
  contentText: string,
  summaryText: string
) {
  if (!title) {
    return true;
  }

  if (title.length <= 88) {
    return false;
  }

  const comparableTitle = normalizeComparableArticleText(title);
  const titleHead = comparableTitle.slice(0, 42);

  if (!titleHead) {
    return false;
  }

  return (
    normalizeComparableArticleText(contentText).startsWith(titleHead) ||
    normalizeComparableArticleText(summaryText).startsWith(titleHead)
  );
}

function deriveArticleDisplayTitle(value: string) {
  const lines = value.replace(/\r\n?/g, "\n").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || isDecorativeArticleLine(trimmed) || isMarkdownImageLine(trimmed)) {
      continue;
    }

    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    const strong =
      trimmed.match(/^\*\*(.+?)\*\*$/) ?? trimmed.match(/^\*\*(.+?)\*\*/);
    const candidate = cleanArticleTitleCandidate(
      heading?.[1] ?? strong?.[1] ?? trimmed
    );

    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function cleanArticleTitleCandidate(value: string) {
  const cleaned = cleanArticleDisplayText(value)
    .replace(/^[-*]\s+/, "")
    .replace(/^#+\s+/, "")
    .replace(/^\*+|\*+$/g, "")
    .trim();
  const sentence = cleaned.match(/^.{6,}?[。！？!?](?=\s|$)/)?.[0] ?? "";
  const split = (sentence || cleaned).split(
    /\s+(?=(?:流量|时间|注册方式|节点位置|开业|网页注册|注册链接|优惠券|五折活动|#)\s*[：:]?)/
  )[0];

  return truncateArticleDisplayTitle(split || cleaned, 96);
}

function truncateArticleDisplayTitle(value: string, maxLength = 140) {
  const cleaned = cleanArticleDisplayText(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).replace(/[，,、:：；;\s]+$/g, "")}...`;
}

function isDecorativeArticleLine(value: string) {
  return /^(?:×|✕|✖)$/u.test(value.trim());
}

function isMarkdownImageLine(value: string) {
  return (
    /^!\[[^\]]*\]\([^)]+\)$/.test(value.trim()) ||
    /^\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)$/.test(value.trim())
  );
}

function normalizeComparableArticleText(value: string) {
  return cleanArticleDisplayText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function isSimilarArticleText(value: string, reference: string) {
  const normalizedValue = normalizeComparableArticleText(value);
  const normalizedReference = normalizeComparableArticleText(reference);

  if (!normalizedValue || !normalizedReference) {
    return false;
  }

  if (normalizedValue === normalizedReference) {
    return true;
  }

  const minLength = Math.min(normalizedValue.length, normalizedReference.length);

  return (
    minLength >= 12 &&
    (normalizedValue.startsWith(normalizedReference) ||
      normalizedReference.startsWith(normalizedValue) ||
      (normalizedValue.length >= 24 && normalizedReference.includes(normalizedValue)))
  );
}

function stripLeadingArticleDuplicates(
  content: string,
  title: string,
  summary: string,
  coverImage = ""
) {
  let nextContent = content
    .replace(
      /\[\s*\n+\s*(!\[[^\]]*\]\([^)]+\))\s*\n+\s*\]\(([^)\s]+)\)/g,
      "[$1]($2)"
    )
    .replace(/^\s+/, "");
  const preservedBlocks: string[] = [];

  for (let index = 0; index < 8; index += 1) {
    const decorativeMatch = nextContent.match(/^(?:×|✕|✖)\s*(?:\n+|$)/u);

    if (decorativeMatch) {
      nextContent = nextContent.slice(decorativeMatch[0].length).replace(/^\s+/, "");
      continue;
    }

    const headingMatch = nextContent.match(/^#{1,6}\s+(.+?)(?:\n+|$)/);

    if (headingMatch && isSimilarArticleText(headingMatch[1], title)) {
      nextContent = nextContent.slice(headingMatch[0].length).replace(/^\s+/, "");
      continue;
    }

    const imageMatch =
      nextContent.match(/^\[!\[[^\]]*\]\(([^)\s]+)\)\]\([^)]+\)\s*(?:\n+|$)/) ??
      nextContent.match(/^!\[[^\]]*\]\(([^)\s]+)\)\s*(?:\n+|$)/) ??
      nextContent.match(/^(?:\[)?!\[[^\n]*\]\(([^)\n]+)\)(?:\]\([^\n]+\))?\s*(?:\n+|$)/);

    if (
      imageMatch &&
      coverImage &&
      normalizeMarkdownImageUrl(imageMatch[1]) ===
        normalizeMarkdownImageUrl(coverImage)
    ) {
      nextContent = nextContent.slice(imageMatch[0].length).replace(/^\s+/, "");
      continue;
    }

    if (imageMatch) {
      preservedBlocks.push(imageMatch[0].trim());
      nextContent = nextContent.slice(imageMatch[0].length).replace(/^\s+/, "");
      continue;
    }

    const blockquoteMatch = nextContent.match(/^>\s*(.+?)(?:\n{2,}|$)/s);
    const blockquote = blockquoteMatch?.[1]?.trim() ?? "";

    if (
      blockquote &&
      (isSimilarArticleText(blockquote, summary) ||
        isSimilarArticleText(blockquote, title))
    ) {
      nextContent = nextContent
        .slice(blockquoteMatch?.[0].length ?? 0)
        .replace(/^\s+/, "");
      continue;
    }

    const paragraphMatch = nextContent.match(/^([^\n#>`|][\s\S]*?)(?:\n{2,}|$)/);
    const paragraph = paragraphMatch?.[1]?.trim() ?? "";

    if (
      paragraph &&
      !paragraph.startsWith("![") &&
      (isSimilarArticleText(paragraph, summary) ||
        isSimilarArticleText(paragraph, title))
    ) {
      nextContent = nextContent
        .slice(paragraphMatch?.[0].length ?? 0)
        .replace(/^\s+/, "");
      continue;
    }

    break;
  }

  if (!preservedBlocks.length) {
    return nextContent;
  }

  return [preservedBlocks.join("\n\n"), nextContent].filter(Boolean).join("\n\n");
}

function normalizeMarkdownImageUrl(value: string) {
  return value
    .trim()
    .replace(/^<|>$/g, "")
    .replace(/^['"]|['"]$/g, "");
}

function createArticleHref(slug: string) {
  return `/articles/${encodeURIComponent(slug)}`;
}

function createArticlePreviewHref(slug: string) {
  return `${createArticleHref(slug)}?preview=1`;
}

function createArticleBrowseHref(slug: string, published?: boolean | null) {
  return published ? createArticleHref(slug) : createArticlePreviewHref(slug);
}

function createContentItemPreviewHref(id: string) {
  return `/articles/content-preview?contentItem=${encodeURIComponent(id)}`;
}

function normalizeForm(tool: Tool): ToolInput {
  return {
    name: tool.name,
    description: tool.description,
    url: tool.url,
    demoUrl: tool.demoUrl,
    image: tool.image,
    category: tool.category,
    tags: tool.tags,
    githubLanguage: tool.githubLanguage,
    githubLicense: tool.githubLicense,
    featured: tool.featured
  };
}

function normalizeArticleForm(article: Article): ArticleInput {
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content: article.content,
    coverImage: article.coverImage,
    category: article.category,
    tags: article.tags,
    published: article.published,
    publishedAt: isoToDatetimeLocal(article.publishedAt ?? article.published_at)
  };
}

function normalizeContentSourceForm(source: ContentSource): ContentSourceInput {
  return {
    title: source.title,
    url: source.url,
    category: source.category,
    tags: source.tags,
    enabled: source.enabled
  };
}

function getContentItemTimestamp(item: ContentItem) {
  const value = item.published_at ?? item.updated_at ?? item.created_at ?? "";
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortContentItems(items: ContentItem[]) {
  return [...items].sort((left, right) => {
    return getContentItemTimestamp(right) - getContentItemTimestamp(left);
  });
}

function normalizeSlugInput(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function cleanArticleTag(value: string) {
  return value
    .trim()
    .replace(/^[-*]\s*/, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function splitArticleTagSegment(value: string) {
  const trimmed = value
    .trim()
    .replace(/^tags\s*:\s*/i, "")
    .replace(/^\[(.*)\]$/, "$1");

  return trimmed
    .split(/[\r\n,，、。;；|｜/／\\]+/)
    .map(cleanArticleTag)
    .filter(Boolean);
}

function parseArticleTagsInput(value: string) {
  const normalized = value.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const tagKeyIndex = lines.findIndex((line) => /^\s*tags\s*:/i.test(line));
  const tags: string[] = [];

  if (tagKeyIndex >= 0) {
    const firstLineValue = lines[tagKeyIndex].replace(/^\s*tags\s*:\s*/i, "");

    if (firstLineValue.trim()) {
      tags.push(...splitArticleTagSegment(firstLineValue));
    }

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
        tags.push(cleanArticleTag(trimmed));
      }
    }
  } else {
    for (const line of lines) {
      tags.push(...splitArticleTagSegment(line));
    }
  }

  return Array.from(new Set(tags.map(cleanArticleTag).filter(Boolean))).slice(0, 24);
}

function formatTagInputText(tags: string[]) {
  return tags.join(", ");
}

function readImportJson(value: string, emptyMessage: string, invalidMessage: string) {
  if (!value.trim()) {
    throw new Error(emptyMessage);
  }

  const parsed = JSON.parse(value) as unknown;

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "tools" in parsed &&
    Array.isArray((parsed as { tools?: unknown }).tools)
  ) {
    return (parsed as { tools: unknown[] }).tools;
  }

  throw new Error(invalidMessage);
}

function createImageFromUrl(url: string) {
  if (!url.trim()) {
    return "";
  }

  const githubPreview = createGitHubOpenGraphImageUrl(url);

  if (githubPreview) {
    return githubPreview;
  }

  return `https://image.thum.io/get/width/1200/crop/720/${url.trim()}`;
}

function createGitHubOpenGraphImageUrl(url: string) {
  const repoPath = getGitHubRepoPath(url);

  return repoPath ? `https://opengraph.githubassets.com/htools/${repoPath}` : "";
}

function getGitHubRepoPath(url: string) {
  try {
    const parsed = new URL(url);
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

function isGitHubRepoUrl(value: string) {
  return Boolean(getGitHubRepoPath(normalizeHttpUrlInput(value)));
}

function shouldUseGitHubMetadataValue(
  currentValue: string,
  previousValue?: string
) {
  const current = currentValue.trim();
  const previous = previousValue?.trim() ?? "";

  return !current || (Boolean(previous) && current === previous);
}

function formatGitHubCount(value: number) {
  if (value >= 1000000) {
    return `${Math.round(value / 100000) / 10}m`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k`;
  }

  return String(Math.max(0, value));
}

function formatGitHubUpdatedAt(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
}

function getGitHubMetadataDetailText(t: Messages) {
  const chinese = isChineseLocaleText(t);

  return {
    forks: chinese ? "Forks" : "Forks",
    empty: chinese
      ? "点击上方 GitHub 信息读取仓库详情"
      : "Use GitHub Info above to load repository details",
    failed: chinese
      ? "暂未读取到 GitHub 仓库信息"
      : "GitHub repository info is not available",
    language: chinese ? "语言" : "Language",
    license: chinese ? "协议" : "License",
    loading: chinese
      ? "正在读取 GitHub 仓库信息..."
      : "Loading GitHub repository info...",
    stars: chinese ? "Stars" : "Stars",
    title: chinese ? "GitHub 详情" : "GitHub details",
    updatedAt: chinese ? "更新" : "Updated"
  };
}

function applyGitHubMetadataToForm(
  current: ToolInput,
  metadata: GitHubToolMetadata,
  normalizedUrl: string,
  previousMetadata?: GitHubToolMetadata | null,
  overwrite = false
): ToolInput {
  if (overwrite) {
    return {
      ...current,
      url: normalizedUrl,
      name: metadata.name,
      description: metadata.description,
      demoUrl: metadata.demoUrl,
      image: metadata.image,
      githubLanguage: metadata.language,
      githubLicense: metadata.license,
      tags: current.tags
    };
  }

  return {
    ...current,
    url: normalizedUrl,
    name: shouldUseGitHubMetadataValue(current.name, previousMetadata?.name)
      ? metadata.name
      : current.name,
    description: shouldUseGitHubMetadataValue(
      current.description,
      previousMetadata?.description
    )
      ? metadata.description
      : current.description,
    demoUrl: shouldUseGitHubMetadataValue(
      current.demoUrl,
      previousMetadata?.demoUrl
    )
      ? metadata.demoUrl
      : current.demoUrl,
    image: shouldUseGitHubMetadataValue(current.image, previousMetadata?.image)
      ? metadata.image
      : current.image,
    githubLanguage: metadata.language,
    githubLicense: metadata.license,
    tags: current.tags
  };
}

function getGitHubMetadataTags(metadata: GitHubToolMetadata) {
  return Array.from(
    new Set(
      [
        ...(metadata.topics ?? []),
        metadata.language,
        metadata.license
      ]
        .map(cleanArticleTag)
        .filter(Boolean)
    )
  ).slice(0, 8);
}

function isGeneratedScreenshotUrl(url: string) {
  try {
    return new URL(url).hostname.toLowerCase() === "image.thum.io";
  } catch {
    return false;
  }
}

function isGitHubOpenGraphImageUrl(url: string) {
  try {
    return new URL(url).hostname.toLowerCase() === "opengraph.githubassets.com";
  } catch {
    return false;
  }
}

function createToolPreviewSource(tool: Tool) {
  if (usesGitHubOpenGraphPreview(tool)) {
    return createGitHubOpenGraphImageUrl(tool.url);
  }

  return tool.image || createImageFromUrl(tool.url);
}

function usesGitHubOpenGraphPreview(tool: Tool) {
  return Boolean(
    createGitHubOpenGraphImageUrl(tool.url) &&
      (!tool.image ||
        isGeneratedScreenshotUrl(tool.image) ||
        isGitHubOpenGraphImageUrl(tool.image))
  );
}

function normalizeHttpUrlInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function createAdminIconFromUrl(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return `/icons/${encodeURIComponent(host)}/icon.png?fallback=404`;
  } catch {
    return "";
  }
}

function isGitHubUrl(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "github.com" || host === "www.github.com";
  } catch {
    return false;
  }
}

function getToolInitials(name: string) {
  const words = name
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/[\s-]+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0] ?? name).slice(0, 2).toUpperCase();
}

function getCategoryLabel(category: string, t: Messages) {
  if (category === ADMIN_FEATURED_CATEGORY) {
    return t.tool.featured;
  }

  return t.categories[category] ?? category;
}

const ADMIN_CATEGORY_LABEL_MAX_CHARS = 10;

function getAdminCategoryDisplayLabel(label: string) {
  const chars = Array.from(label.trim());

  if (chars.length <= ADMIN_CATEGORY_LABEL_MAX_CHARS) {
    return label;
  }

  return `${chars.slice(0, ADMIN_CATEGORY_LABEL_MAX_CHARS - 1).join("")}…`;
}

function getAdminCategoryLabelWidth(label: string) {
  return Math.min(
    ADMIN_CATEGORY_LABEL_MAX_CHARS,
    Math.max(1, Array.from(label.trim()).length)
  );
}

function normalizeAdminCategoryValue(category: string) {
  const value = category.trim();
  const normalizedValue = value.toLowerCase();

  if (value === "全部" || normalizedValue === "all") {
    return "All";
  }

  if (value === "\u7cbe\u9009" || normalizedValue === "featured") {
    return ADMIN_FEATURED_CATEGORY;
  }

  return value;
}

function isAllCategoryValue(category: string) {
  return normalizeAdminCategoryValue(category) === "All";
}

function isFeaturedCategoryValue(category: string) {
  return normalizeAdminCategoryValue(category) === ADMIN_FEATURED_CATEGORY;
}

function isPersistableAdminCategory(category: string) {
  const normalized = normalizeAdminCategoryValue(category);

  return (
    normalized &&
    !isAllCategoryValue(normalized) &&
    !isFeaturedCategoryValue(normalized)
  );
}

function normalizeAdminCategoryList(categories: string[]) {
  return Array.from(
    new Set(
      categories
        .map(normalizeAdminCategoryValue)
        .filter(isPersistableAdminCategory)
    )
  );
}

function sortCategoriesBySettings(
  categories: string[],
  preferredOrder: string[],
  t: Messages
) {
  const normalizedPreferredOrder = normalizeAdminCategoryList(preferredOrder);
  const orderMap = new Map(
    normalizedPreferredOrder.map((category, index) => [category, index])
  );

  return normalizeAdminCategoryList(categories).sort((left, right) => {
    const leftIndex = orderMap.get(left);
    const rightIndex = orderMap.get(right);

    if (leftIndex !== undefined || rightIndex !== undefined) {
      if (leftIndex === undefined) {
        return 1;
      }

      if (rightIndex === undefined) {
        return -1;
      }

      return leftIndex - rightIndex;
    }

    return getCategoryLabel(left, t).localeCompare(getCategoryLabel(right, t));
  });
}

function moveAdminCategoryInList(
  categories: string[],
  category: string
) {
  const normalizedCategories = normalizeAdminCategoryList(categories);
  const normalizedCategory = normalizeAdminCategoryValue(category);
  const currentIndex = normalizedCategories.indexOf(normalizedCategory);

  if (currentIndex < 0) {
    return normalizedCategories;
  }

  const targetIndex =
    currentIndex === 0 ? normalizedCategories.length - 1 : currentIndex - 1;
  const nextCategories = [...normalizedCategories];
  const [movedCategory] = nextCategories.splice(currentIndex, 1);
  nextCategories.splice(targetIndex, 0, movedCategory);

  return nextCategories;
}

function addAdminCategorySetting(
  settings: AdminCategorySettings,
  scope: AdminCategoryScope,
  category: string
) {
  const normalized = normalizeAdminCategoryValue(category);

  if (!isPersistableAdminCategory(normalized)) {
    return settings;
  }

  const categories = normalizeAdminCategoryList([
    ...settings[scope],
    normalized
  ]);

  if (
    categories.length === settings[scope].length &&
    categories.every((item, index) => item === settings[scope][index])
  ) {
    return settings;
  }

  return {
    ...settings,
    [scope]: categories
  };
}

function removeAdminCategorySetting(
  settings: AdminCategorySettings,
  scope: AdminCategoryScope,
  category: string
) {
  const normalized = normalizeAdminCategoryValue(category);
  const categories = settings[scope].filter(
    (item) => normalizeAdminCategoryValue(item) !== normalized
  );

  if (categories.length === settings[scope].length) {
    return settings;
  }

  return {
    ...settings,
    [scope]: categories
  };
}

function formatAdminDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).format(date);
}

function isoToDatetimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function datetimeLocalToIso(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function buildLinkCheckTargets(tools: Tool[]): LinkCheckTarget[] {
  return tools.flatMap((tool) => {
    const targets: LinkCheckTarget[] = [];
    const url = tool.url.trim();
    const demoUrl = tool.demoUrl.trim();

    if (url) {
      targets.push({
        id: tool.id,
        name: tool.name,
        kind: "url",
        url
      });
    }

    if (demoUrl) {
      targets.push({
        id: tool.id,
        name: tool.name,
        kind: "demoUrl",
        url: demoUrl
      });
    }

    return targets;
  });
}

function normalizeSourceUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return DEFAULT_SOURCE_URL;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed}`;
}

async function fetchToolSource(
  sourceUrl: string,
  text: ReturnType<typeof getAdminMaintenanceText>
) {
  const response = await fetch(sourceUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(text.sourceRequestFailed(response.status));
  }

  const payload = (await response.json()) as unknown;
  const tools = readToolSource(payload, text);

  if (!tools.length) {
    throw new Error(text.sourceEmpty);
  }

  return tools;
}

function readToolSource(
  payload: unknown,
  text: ReturnType<typeof getAdminMaintenanceText>
) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "tools" in payload &&
    Array.isArray((payload as { tools?: unknown }).tools)
  ) {
    return (payload as { tools: unknown[] }).tools;
  }

  throw new Error(text.sourceInvalid);
}

function readBackupPayload(
  payload: unknown,
  text: ReturnType<typeof getAdminMaintenanceText>
): HtoolsBackup {
  if (!isRecordValue(payload)) {
    throw new Error(text.backupInvalid);
  }

  if (payload.source !== "htools-backup" || typeof payload.version !== "string") {
    throw new Error(text.backupInvalid);
  }

  if (!isRecordValue(payload.data)) {
    throw new Error(text.backupInvalid);
  }

  return {
    source: "htools-backup",
    version: payload.version,
    exportedAt: typeof payload.exportedAt === "string" ? payload.exportedAt : "",
    counts: readBackupCounts(payload.counts, payload.data),
    data: payload.data
  };
}

function readBackupCounts(
  value: unknown,
  data: Record<string, unknown>
): BackupCounts {
  const counts = isRecordValue(value) ? value : {};

  return {
    tools: readBackupCount(counts.tools, data.tools),
    articles: readBackupCount(counts.articles, data.articles),
    contentSources: readBackupCount(counts.contentSources, data.contentSources),
    contentItems: readBackupCount(counts.contentItems, data.contentItems),
    settings: readBackupCount(counts.settings, data.settings)
  };
}

function readBackupCount(value: unknown, fallbackArray: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  return Array.isArray(fallbackArray) ? fallbackArray.length : 0;
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createSourcePreview(
  items: unknown[],
  currentTools: Tool[],
  mode: ToolImportMode,
  text: ReturnType<typeof getAdminMaintenanceText>
) {
  const currentUrls = new Set(
    currentTools
      .map((tool) => normalizeUrlForImport(tool.url))
      .filter(Boolean)
  );
  const seenUrls = new Set<string>();
  const errors: Array<{ index: number; message: string }> = [];
  let valid = 0;
  let invalid = 0;
  let duplicateInSource = 0;
  let duplicateInSite = 0;
  let willCreate = 0;
  let willUpdate = 0;
  let willSkip = 0;

  items.forEach((item, index) => {
    const result = validateSourcePreviewItem(item, text);

    if (!result.ok) {
      invalid += 1;
      errors.push({ index, message: result.message });
      return;
    }

    valid += 1;

    if (seenUrls.has(result.urlKey)) {
      duplicateInSource += 1;
      willSkip += 1;
      return;
    }

    seenUrls.add(result.urlKey);

    if (currentUrls.has(result.urlKey)) {
      duplicateInSite += 1;

      if (mode === "upsert") {
        willUpdate += 1;
      } else {
        willSkip += 1;
      }
      return;
    }

    willCreate += 1;
  });

  return {
    total: items.length,
    valid,
    invalid,
    duplicateInSource,
    duplicateInSite,
    willCreate,
    willUpdate,
    willSkip,
    errors
  };
}

function validateSourcePreviewItem(
  item: unknown,
  text: ReturnType<typeof getAdminMaintenanceText>
):
  | { ok: true; urlKey: string }
  | { ok: false; message: string } {
  if (!item || typeof item !== "object") {
    return { ok: false, message: text.sourceItemObject };
  }

  const payload = item as Record<string, unknown>;
  const requiredFields = ["name", "description", "url", "category"] as const;
  const missing = requiredFields.filter(
    (field) => typeof payload[field] !== "string" || !payload[field].trim()
  );

  if (missing.length) {
    return { ok: false, message: text.sourceRequired(missing.join(", ")) };
  }

  const url = String(payload.url).trim();
  const demoUrl =
    typeof payload.demoUrl === "string"
      ? payload.demoUrl.trim()
      : typeof payload.demo_url === "string"
        ? payload.demo_url.trim()
        : "";
  const image = typeof payload.image === "string" ? payload.image.trim() : "";

  if (!isValidHttpUrl(url)) {
    return { ok: false, message: text.sourceUrlInvalid };
  }

  if (demoUrl && !isValidHttpUrl(demoUrl)) {
    return { ok: false, message: text.sourceDemoUrlInvalid };
  }

  if (image && !isValidHttpUrl(image)) {
    return { ok: false, message: text.sourceImageInvalid };
  }

  return { ok: true, urlKey: normalizeUrlForImport(url) };
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrlForImport(value: string) {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

function clampInteger(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function buildFailedLinkCheckResults(
  targets: LinkCheckTarget[],
  error: unknown
): LinkCheckResult[] {
  const checkedAt = new Date().toISOString();
  const message = getErrorMessage(error);

  return targets.map((target) => ({
    ...target,
    status: 0,
    ok: false,
    duration: 0,
    checkedAt,
    error: message
  }));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function getLocalizedErrorMessage(error: unknown, t: Messages) {
  const message = getErrorMessage(error);
  const normalized = message.toLowerCase();
  const isChinese = isChineseLocaleText(t);

  if (
    message.includes("D1 \u6570\u636e\u5e93\u672a\u7ed1\u5b9a") ||
    message.includes("\u8bf7\u68c0\u67e5\u60a8\u7684\u9879\u76ee\u662f\u5426\u5df2\u6b63\u786e\u7ed1\u5b9a\u6570\u636e\u5e93\u3002") ||
    normalized.includes("cannot read properties of undefined") ||
    normalized.includes("reading 'prepare'") ||
    normalized.includes("no such table")
  ) {
    return t.empty.connectionDescription;
  }

  if (
    message === "Failed to fetch" ||
    message === "Network request failed." ||
    normalized.includes("failed to fetch") ||
    normalized.includes("networkerror") ||
    normalized.includes("load failed")
  ) {
    return isChinese
      ? "网络请求失败，请检查本地预览服务或网络连接。"
      : "Network request failed. Check the local preview server or network connection.";
  }

  if (message === "Request failed") {
    return t.status.saveFailed;
  }

  if (message === "Invalid password.") {
    return t.status.loginFailed;
  }

  if (
    message ===
    "clientId, clientSecret, owner, and repo are required when GitHub submissions are enabled."
  ) {
    return getGitHubSettingsRequiredMessage(t);
  }

  if (message === "GitHub submissions are not configured.") {
    return isChinese
      ? "GitHub 提交尚未配置。"
      : "GitHub submissions are not configured.";
  }

  if (message === "URL must be a GitHub repository.") {
    return isChinese
      ? "请输入有效的 GitHub 仓库地址。"
      : "Enter a valid GitHub repository URL.";
  }

  if (message === "GitHub repository not found.") {
    return isChinese ? "未找到 GitHub 仓库。" : "GitHub repository not found.";
  }

  if (message === "GitHub API rate limit reached. Try again later.") {
    return isChinese
      ? "GitHub API 请求次数已达上限，请稍后再试。"
      : message;
  }

  if (message.startsWith("GitHub API request failed with status ")) {
    const status = message.match(/\d+/)?.[0] ?? "";
    return isChinese
      ? `GitHub API 请求失败${status ? `：${status}` : "。"}`
      : message;
  }

  if (message === "Unable to load GitHub metadata.") {
    return isChinese ? "GitHub 仓库信息读取失败。" : message;
  }

  if (
    message ===
    "GitHub rejected this submission. Check repository issue permissions."
  ) {
    return isChinese
      ? "GitHub 拒绝了这次提交，请检查目标仓库的 Issue 权限。"
      : message;
  }

  if (message === "Unauthorized.") {
    return isChinese ? "登录已失效，请重新登录。" : "Session expired. Sign in again.";
  }

  return message;
}

function getGitHubSettingsRequiredMessage(t: Messages) {
  return isChineseLocaleText(t)
    ? "启用 GitHub 提交时，请填写 OAuth Client ID、Client Secret、仓库 Owner 和仓库名称。"
    : "OAuth Client ID, Client Secret, repository owner, and repository name are required when GitHub submissions are enabled.";
}

function getSourceErrorMessage(
  error: unknown,
  text: ReturnType<typeof getAdminMaintenanceText>,
  t: Messages
) {
  const rawMessage = getErrorMessage(error);

  if (rawMessage === "Request failed") {
    return text.sourceOperationFailed;
  }

  return getLocalizedErrorMessage(error, t);
}

function createCsv(rows: Array<Array<string | number>>) {
  return rows
    .map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(","))
    .join("\n");
}

function escapeCsvCell(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function scrollPageToTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function spawnNavClickBurst(clientX: number, clientY: number) {
  const burst = document.createElement("span");
  burst.className = "nav-particle-burst";
  burst.setAttribute("aria-hidden", "true");
  burst.style.left = `${clientX}px`;
  burst.style.top = `${clientY}px`;

  for (let index = 0; index < NAV_BURST_PARTICLE_COUNT; index += 1) {
    const particle = document.createElement("span");
    const angle =
      (Math.PI * 2 * index) / NAV_BURST_PARTICLE_COUNT +
      (index % 2 === 0 ? 0.12 : -0.08);
    const distance = 24 + (index % 4) * 5;

    particle.className = "nav-particle";
    particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--delay", `${(index % 3) * 8}ms`);
    burst.appendChild(particle);
  }

  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 360);
}

function getPaginationItems(
  totalPages: number,
  currentPage: number
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const normalizedCurrent = Math.min(Math.max(currentPage, 1), totalPages);
  const visiblePages = new Set<number>([
    1,
    totalPages,
    normalizedCurrent - 1,
    normalizedCurrent,
    normalizedCurrent + 1
  ]);

  if (currentPage <= 4) {
    [2, 3, 4, 5].forEach((page) => visiblePages.add(page));
  } else if (currentPage >= totalPages - 3) {
    [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) =>
      visiblePages.add(page)
    );
  }

  const pages = Array.from(visiblePages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  return pages.reduce<PaginationItem[]>((items, page, index) => {
    const previousPage = pages[index - 1];

    if (previousPage && page - previousPage === 2) {
      items.push(previousPage + 1);
    } else if (previousPage && page - previousPage > 2) {
      items.push(page < normalizedCurrent ? "ellipsis-left" : "ellipsis-right");
    }

    items.push(page);
    return items;
  }, []);
}

function getToolTimestamp(tool: Tool) {
  const value = tool.updated_at ?? tool.created_at ?? "";
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortToolsByUpdatedAt(tools: Tool[]) {
  return [...tools].sort((left, right) => {
    return getToolTimestamp(right) - getToolTimestamp(left);
  });
}

function getArticleTimestamp(article: Article) {
  const value = article.published_at ?? article.updated_at ?? article.created_at ?? "";
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortArticlesByUpdatedAt(articles: Article[]) {
  return [...articles].sort((left, right) => {
    return getArticleTimestamp(right) - getArticleTimestamp(left);
  });
}

function useLoadingSkeleton(isLoading: boolean) {
  return isLoading;
}

function LoadingSkeleton({ children }: { children: ReactNode }) {
  const showSkeleton = useLoadingSkeleton(true);

  return <SkeletonVisibility visible={showSkeleton}>{children}</SkeletonVisibility>;
}

function SkeletonVisibility({
  children,
  visible
}: {
  children: ReactNode;
  visible: boolean;
}) {
  return (
    <div
      className={`skeleton-visibility ${visible ? "" : "is-reserved"}`.trim()}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export function App() {
  const cachedSiteSettings = readCachedSiteSettings();
  const [tools, setTools] = useState<Tool[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);
  const [hasLoadedTools, setHasLoadedTools] = useState(false);
  const [toolLoadError, setToolLoadError] = useState("");
  const [articleLoadError, setArticleLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeArticleCategory, setActiveArticleCategory] = useState("All");
  const [proxySettings, setProxySettings] = useState<ProxySettings>(
    DEFAULT_PROXY_SETTINGS
  );
  const [publicCategorySettings, setPublicCategorySettings] =
    useState<AdminCategorySettings>(initialAdminCategorySettings);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(
    cachedSiteSettings ?? DEFAULT_SITE_SETTINGS
  );
  const [siteSettingsLoaded, setSiteSettingsLoaded] = useState(
    Boolean(cachedSiteSettings)
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    resolveStoredThemeMode(localStorage.getItem("htools_theme"))
  );
  const [locale, setLocale] = useState<Locale>(() =>
    resolveLocale(localStorage.getItem("htools_locale") ?? navigator.language)
  );
  const toastIdRef = useRef(0);
  const [toasts, setToasts] = useState<GlobalToast[]>([]);
  const pathname = window.location.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isCategoryRoute = pathname.startsWith("/tools");
  const isSubmitRoute = pathname.startsWith("/submit");
  const isArticlesRoute = pathname.startsWith("/articles");
  const articleSlug = isArticlesRoute
    ? decodeURIComponent(pathname.split("/").filter(Boolean).slice(1).join("/"))
    : "";
  const isArticleDetailRoute = Boolean(articleSlug);
  const isAboutRoute = pathname.startsWith("/about");
  const isPrivacyRoute = pathname.startsWith("/privacy");
  const isTermsRoute = pathname.startsWith("/terms");
  const t = translations[locale];
  const localeOption = getLocaleOption(locale);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((toast: ToastInput) => {
    const id = ++toastIdRef.current;
    const nextToast = { ...toast, id };

    setToasts((current) => [...current, nextToast].slice(-3));
    window.setTimeout(() => {
      dismissToast(id);
    }, 4200);
  }, [dismissToast]);

  async function refreshTools() {
    setIsLoading(true);

    try {
      const result = await loadTools();
      setTools(result.tools);
      setToolLoadError(result.error ?? "");
    } finally {
      setHasLoadedTools(true);
      setIsLoading(false);
    }
  }

  async function refreshArticles() {
    setIsArticlesLoading(true);

    try {
      const nextArticles = await loadArticles();
      setArticles(sortArticlesByUpdatedAt(nextArticles));
      setArticleLoadError("");
    } catch (error) {
      setArticles([]);
      setArticleLoadError(error instanceof Error ? error.message : "Request failed");
    } finally {
      setIsArticlesLoading(false);
    }
  }

  useEffect(() => {
    void refreshTools();
  }, []);

  useEffect(() => {
    void refreshArticles();
  }, []);

  useEffect(() => {
    let active = true;

    async function refreshCategorySettings() {
      try {
        const settings = await loadCategorySettings();

        if (active) {
          setPublicCategorySettings(settings);
        }
      } catch {
        if (active) {
          setPublicCategorySettings(initialAdminCategorySettings);
        }
      }
    }

    void refreshCategorySettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function refreshSiteSettings() {
      try {
        const settings = await loadSiteSettings();

        if (active) {
          setSiteSettings(settings);
          writeCachedSiteSettings(settings);
          setSiteSettingsLoaded(true);
        }
      } catch {
        if (active) {
          if (!cachedSiteSettings) {
            setSiteSettings(DEFAULT_SITE_SETTINGS);
          }
          setSiteSettingsLoaded(true);
        }
      }
    }

    void refreshSiteSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function refreshProxySettings() {
      try {
        const settings = await loadProxySettings();

        if (active) {
          setProxySettings({
            enabled: settings.enabled,
            baseUrl: normalizeProxyBaseUrl(settings.baseUrl),
            mode: normalizeProxyMode(settings.mode)
          });
        }
      } catch {
        if (active) {
          setProxySettings(DEFAULT_PROXY_SETTINGS);
        }
      }
    }

    void refreshProxySettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const resolvedTheme = resolveThemeMode(themeMode);
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;
      document.documentElement.style.backgroundColor =
        resolvedTheme === "dark" ? "#09090b" : "#fff";
    };
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    applyTheme();
    localStorage.setItem("htools_theme", themeMode);

    if (themeMode === "system") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.lang = localeOption.htmlLang;
    localStorage.setItem("htools_locale", locale);
  }, [locale, localeOption.htmlLang]);

  useEffect(() => {
    document.title = getSiteDocumentTitle(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    syncSiteFavicon(siteSettings.iconUrl);
  }, [siteSettings.iconUrl]);

  const hasFeaturedTools = tools.some((tool) => tool.featured);
  const categories = useMemo(() => {
    const names = sortCategoriesBySettings(
      tools.map((tool) => tool.category),
      publicCategorySettings.tools,
      t
    );
    return hasFeaturedTools ? ["All", ADMIN_FEATURED_CATEGORY, ...names] : ["All", ...names];
  }, [hasFeaturedTools, publicCategorySettings.tools, t, tools]);

  useEffect(() => {
    if (!hasFeaturedTools && isFeaturedCategoryValue(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, hasFeaturedTools]);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = tools.filter((tool) => {
      const matchesCategory = isFeaturedCategoryValue(activeCategory)
        ? tool.featured
        : activeCategory === "All" || tool.category === activeCategory;
      const haystack = [
        tool.name,
        tool.description,
        tool.category,
        getCategoryLabel(tool.category, t),
        ...tool.tags
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });

    return sortToolsByUpdatedAt(filtered);
  }, [activeCategory, query, t, tools]);
  const articleCategories = useMemo(() => {
    const names = sortCategoriesBySettings(
      articles.map((article) => article.category),
      publicCategorySettings.articles,
      t
    );

    return ["All", ...names];
  }, [articles, publicCategorySettings.articles, t]);

  useEffect(() => {
    const normalizedArticleCategory =
      normalizeAdminCategoryValue(activeArticleCategory);

    if (activeArticleCategory !== normalizedArticleCategory) {
      setActiveArticleCategory(normalizedArticleCategory);
      return;
    }

    if (!articleCategories.includes(normalizedArticleCategory)) {
      setActiveArticleCategory("All");
    }
  }, [activeArticleCategory, articleCategories]);

  const filteredArticles = useMemo(() => {
    if (isAllCategoryValue(activeArticleCategory)) {
      return articles;
    }

    return articles.filter(
      (article) =>
        normalizeAdminCategoryValue(article.category) === activeArticleCategory
    );
  }, [activeArticleCategory, articles]);
  const isInitialToolsLoading = isLoading && !hasLoadedTools;
  const showInitialToolSkeletons = useLoadingSkeleton(isInitialToolsLoading);
  const showPublicArticleSkeletons = useLoadingSkeleton(
    isArticlesLoading && articles.length === 0
  );
  function updateSiteSettings(settings: SiteSettings) {
    setSiteSettings(settings);
    writeCachedSiteSettings(settings);
  }

  const page = isAdminRoute ? (
    <AdminApp
      locale={locale}
      onBackHome={() => (window.location.href = "/")}
      onLocaleChange={setLocale}
      onNotify={notify}
      onProxySettingsChange={setProxySettings}
      onSiteSettingsChange={updateSiteSettings}
      onThemeChange={setThemeMode}
      proxySettings={proxySettings}
      siteSettings={siteSettings}
      t={t}
      themeMode={themeMode}
    />
  ) : isSubmitRoute ? (
    <SubmitPage
      locale={locale}
      onLocaleChange={setLocale}
      onThemeChange={setThemeMode}
      query={query}
      searchArticles={articles}
      searchTools={tools}
      setQuery={setQuery}
      siteSettingsLoaded={siteSettingsLoaded}
      t={t}
      themeMode={themeMode}
    />
  ) : isArticleDetailRoute ? (
    <ArticleDetailPage
      articleSlug={articleSlug}
      locale={locale}
      onLocaleChange={setLocale}
      onThemeChange={setThemeMode}
      query={query}
      searchArticles={articles}
      searchTools={tools}
      setQuery={setQuery}
      t={t}
      themeMode={themeMode}
    />
  ) : isArticlesRoute ? (
    <ArticlesPage
      activeCategory={activeArticleCategory}
      articles={filteredArticles}
      categories={articleCategories}
      error={articleLoadError}
      isLoading={isArticlesLoading}
      locale={locale}
      onLocaleChange={setLocale}
      onThemeChange={setThemeMode}
      setActiveCategory={setActiveArticleCategory}
      query={query}
      searchArticles={articles}
      searchTools={tools}
      setQuery={setQuery}
      showSkeletons={showPublicArticleSkeletons}
      totalArticleCount={articles.length}
      t={t}
      themeMode={themeMode}
    />
  ) : isAboutRoute ? (
    <AboutPage
      locale={locale}
      onLocaleChange={setLocale}
      onThemeChange={setThemeMode}
      query={query}
      searchArticles={articles}
      searchTools={tools}
      setQuery={setQuery}
      siteSettingsLoaded={siteSettingsLoaded}
      t={t}
      themeMode={themeMode}
    />
  ) : isPrivacyRoute || isTermsRoute ? (
    <LegalPage
      kind={isPrivacyRoute ? "privacy" : "terms"}
      locale={locale}
      onLocaleChange={setLocale}
      onThemeChange={setThemeMode}
      query={query}
      searchArticles={articles}
      searchTools={tools}
      setQuery={setQuery}
      siteSettingsLoaded={siteSettingsLoaded}
      t={t}
      themeMode={themeMode}
    />
  ) : isCategoryRoute ? (
    <CategoryPage
      activeCategory={activeCategory}
      categories={categories}
      isLoading={isInitialToolsLoading}
      locale={locale}
      onLocaleChange={setLocale}
      onThemeChange={setThemeMode}
      proxySettings={proxySettings}
      query={query}
      searchArticles={articles}
      searchTools={tools}
      setActiveCategory={setActiveCategory}
      setQuery={setQuery}
      showSkeletons={showInitialToolSkeletons}
      t={t}
      themeMode={themeMode}
      toolLoadError={toolLoadError}
      totalToolCount={tools.length}
      tools={filteredTools}
    />
  ) : (
    <HomePage
      articles={articles}
      articleError={articleLoadError}
      isArticlesLoading={isArticlesLoading}
      isLoading={isInitialToolsLoading}
      locale={locale}
      onLocaleChange={setLocale}
      onThemeChange={setThemeMode}
      proxySettings={proxySettings}
      query={query}
      searchArticles={articles}
      searchTools={tools}
      setQuery={setQuery}
      showArticleSkeletons={showPublicArticleSkeletons}
      showToolSkeletons={showInitialToolSkeletons}
      t={t}
      themeMode={themeMode}
      toolLoadError={toolLoadError}
      totalToolCount={tools.length}
      tools={filteredTools}
    />
  );

  return (
    <SiteSettingsContext.Provider value={siteSettings}>
      <ProxySettingsContext.Provider value={proxySettings}>
        {page}
        <GlobalToasts toasts={toasts} />
      </ProxySettingsContext.Provider>
    </SiteSettingsContext.Provider>
  );
}

function GlobalToasts({
  toasts
}: {
  toasts: GlobalToast[];
}) {
  if (!toasts.length) {
    return null;
  }

  return createPortal(
    <div className="global-toast-region" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`global-toast is-${toast.tone}`} key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
}

function HomePage({
  articleError,
  articles,
  isLoading,
  isArticlesLoading,
  locale,
  onLocaleChange,
  onThemeChange,
  proxySettings,
  query,
  searchArticles,
  searchTools,
  setQuery,
  showArticleSkeletons,
  showToolSkeletons,
  t,
  themeMode,
  toolLoadError,
  totalToolCount,
  tools
}: {
  articleError: string;
  articles: Article[];
  isLoading: boolean;
  isArticlesLoading: boolean;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  proxySettings: ProxySettings;
  query: string;
  searchArticles: Article[];
  searchTools: Tool[];
  setQuery: (value: string) => void;
  showArticleSkeletons: boolean;
  showToolSkeletons: boolean;
  t: Messages;
  themeMode: ThemeMode;
  toolLoadError: string;
  totalToolCount: number;
  tools: Tool[];
}) {
  const latestTools = tools.slice(0, 8);
  const latestArticles = articles.slice(0, 4);
  const articleText = getArticleText(locale);
  const categoryCount = useMemo(
    () => new Set(searchTools.map((tool) => tool.category)).size,
    [searchTools]
  );

  return (
    <div className="home-shell">
      <HomeHeader
        activePage="home"
        locale={locale}
        onLocaleChange={onLocaleChange}
        onThemeChange={onThemeChange}
        query={query}
        searchArticles={searchArticles}
        searchTools={searchTools}
        setQuery={setQuery}
        showSearch={false}
        t={t}
        themeMode={themeMode}
      />

      <main>
        <section className="home-hero">
          <div className="hero-content">
            <a className="hero-pill" href="/tools">
              <Sparkles size={16} />
              {t.home.browseCategories(categoryCount)}
              <ArrowUpRight size={18} />
            </a>
            <div className="home-hero-copy">
              <h1>
                <span className="hero-title-line">{t.home.titleTop}</span>
                <span className="hero-title-accent">{t.home.titleBottom}</span>
              </h1>
              <p>{t.home.description}</p>
            </div>
            <div className="hero-actions">
              <a className="primary-button glow-button" href="/tools">
                {t.home.exploreAll}
                <ArrowUpRight size={17} />
              </a>
              <a className="ghost-button hero-ghost" href="#latest-tools">
                {t.home.latestTools}
              </a>
            </div>
          </div>
        </section>

        <section className="home-section" id="latest-tools">
          <SectionTitle icon={<PackagePlus size={25} />} title={t.home.latestTools} />
          <div className="home-tool-grid">
            {isLoading ? (
              <SkeletonVisibility visible={showToolSkeletons}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <ToolCardSkeleton key={index} />
                ))}
              </SkeletonVisibility>
            ) : latestTools.length > 0 ? (
              latestTools.map((tool, index) => (
                <HomeToolCard
                  key={tool.id}
                  priority={index < 4}
                  proxySettings={proxySettings}
                  tool={tool}
                  t={t}
                />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">
                  {toolLoadError ? <CircleAlert size={24} /> : <PanelLeft size={24} />}
                  <h2>
                    {toolLoadError
                      ? t.empty.connectionTitle
                      : totalToolCount === 0
                        ? t.empty.libraryTitle
                        : t.empty.title}
                  </h2>
                </div>
                <p>
                  {toolLoadError
                    ? t.empty.connectionDescription
                    : totalToolCount === 0
                      ? t.empty.libraryDescription
                      : t.empty.description}
                </p>
                {!toolLoadError && totalToolCount === 0 ? (
                  <a className="primary-button empty-state-action" href="/admin/check">
                    {t.empty.libraryAction}
                    <ArrowUpRight size={15} />
                  </a>
                ) : null}
              </div>
            )}
          </div>
          <div className="section-action">
            <a className="primary-button glow-button small-glow" href="/tools">
              {t.home.moreTools}
              <ArrowUpRight size={15} />
            </a>
          </div>
        </section>

        <section className="home-section" id="latest-articles">
          <SectionTitle icon={<FileText size={25} />} title={t.home.latestArticles} />
          <div className="article-list">
            {isArticlesLoading ? (
              <SkeletonVisibility visible={showArticleSkeletons}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <ArticleItemSkeleton key={index} />
                ))}
              </SkeletonVisibility>
            ) : latestArticles.length > 0 ? (
              latestArticles.map((article) => (
                <ArticleListItem
                  article={article}
                  articleText={articleText}
                  key={article.id}
                />
              ))
            ) : (
              <div className="empty-state article-empty-state">
                <div className="empty-state-title">
                  {articleError ? <CircleAlert size={24} /> : <FileText size={24} />}
                  <h2>
                    {articleError
                      ? t.empty.connectionTitle
                      : articleText.publicEmptyTitle}
                  </h2>
                </div>
                <p>
                  {articleError
                    ? t.empty.connectionDescription
                    : articleText.publicEmptyDescription}
                </p>
              </div>
            )}
          </div>
          <div className="section-action">
            <a className="primary-button glow-button small-glow" href="/articles">
              {t.home.morePosts}
              <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
      </main>

      <HomeFooter t={t} />
    </div>
  );
}

function CategoryPage({
  activeCategory,
  categories,
  isLoading,
  locale,
  onLocaleChange,
  onThemeChange,
  proxySettings,
  query,
  searchArticles,
  searchTools,
  setActiveCategory,
  setQuery,
  showSkeletons,
  t,
  themeMode,
  toolLoadError,
  totalToolCount,
  tools
}: {
  activeCategory: string;
  categories: string[];
  isLoading: boolean;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  proxySettings: ProxySettings;
  query: string;
  searchArticles: Article[];
  searchTools: Tool[];
  setActiveCategory: (category: string) => void;
  setQuery: (value: string) => void;
  showSkeletons: boolean;
  t: Messages;
  themeMode: ThemeMode;
  toolLoadError: string;
  totalToolCount: number;
  tools: Tool[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(tools.length / CATEGORY_PAGE_SIZE);
  const currentVisiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const visibleTools = useMemo(() => {
    const pageStart = (currentVisiblePage - 1) * CATEGORY_PAGE_SIZE;
    return tools.slice(pageStart, pageStart + CATEGORY_PAGE_SIZE);
  }, [currentVisiblePage, tools]);
  const paginationItems = useMemo(
    () => getPaginationItems(totalPages, currentVisiblePage),
    [currentVisiblePage, totalPages]
  );
  const previousPageLabel = "Previous page";
  const nextPageLabel = "Next page";
  function handleCategorySelect(category: string) {
    setCurrentPage(1);
    setActiveCategory(category);
    scrollPageToTop();
  }

  function handlePageSelect(page: number) {
    const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
    setCurrentPage(nextPage);
    scrollPageToTop();
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, query, tools.length]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="home-shell">
      <HomeHeader
        activePage="category"
        locale={locale}
        onLocaleChange={onLocaleChange}
        onThemeChange={onThemeChange}
        query={query}
        searchArticles={searchArticles}
        searchTools={searchTools}
        setQuery={setQuery}
        t={t}
        themeMode={themeMode}
      />

      <main className="category-page">
        <section className="category-page-hero">
          <div>
            <h1>{t.nav.category}</h1>
            <p>{t.hero.description}</p>
          </div>
          <a className="primary-button submit-button glow-button" href="/submit">
            {t.actions.submitTool}
          </a>
        </section>

        <section className="directory-layout category-directory" id="category">
          <aside className="category-rail">
            {isLoading ? (
              <SkeletonVisibility visible={showSkeletons}>
                <CategoryRailSkeleton items={12} />
              </SkeletonVisibility>
            ) : (
              categories.map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <button
                    className={`category-item ${
                      category === activeCategory ? "is-active" : ""
                    }`}
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <Icon size={20} />
                    <span>{getCategoryLabel(category, t)}</span>
                  </button>
                );
              })
            )}
          </aside>

          <div className="category-results">
            <div className="tool-grid" id="tools">
              {isLoading ? (
                <SkeletonVisibility visible={showSkeletons}>
                  {Array.from({ length: CATEGORY_PAGE_SIZE }).map((_, index) => (
                    <ToolCardSkeleton key={index} />
                  ))}
                </SkeletonVisibility>
              ) : tools.length > 0 ? (
                visibleTools.map((tool, index) => (
                  <ToolCard
                    key={tool.id}
                    priority={index < 8}
                    proxySettings={proxySettings}
                    tool={tool}
                    t={t}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-title">
                    {toolLoadError ? <CircleAlert size={24} /> : <PanelLeft size={24} />}
                    <h2>
                      {toolLoadError
                        ? t.empty.connectionTitle
                        : totalToolCount === 0
                          ? t.empty.libraryTitle
                          : t.empty.title}
                    </h2>
                  </div>
                  <p>
                    {toolLoadError
                      ? t.empty.connectionDescription
                      : totalToolCount === 0
                        ? t.empty.libraryDescription
                        : t.empty.description}
                  </p>
                  {!toolLoadError && totalToolCount === 0 ? (
                    <a className="primary-button empty-state-action" href="/admin/check">
                      {t.empty.libraryAction}
                      <ArrowUpRight size={15} />
                    </a>
                  ) : null}
                </div>
              )}
            </div>

            {isLoading ? (
              <SkeletonVisibility visible={showSkeletons}>
                <PaginationSkeleton />
              </SkeletonVisibility>
            ) : totalPages > 1 ? (
              <nav className="category-pagination" aria-label="Pagination">
                <button
                  className="pagination-arrow"
                  type="button"
                  aria-label={previousPageLabel}
                  disabled={currentVisiblePage === 1}
                  onClick={() =>
                    handlePageSelect(currentVisiblePage - 1)
                  }
                >
                  <ChevronLeft size={16} />
                </button>
                {paginationItems.map((page) =>
                  typeof page === "number" ? (
                    <button
                      className={page === currentVisiblePage ? "is-active" : ""}
                      key={page}
                      type="button"
                      aria-current={
                        page === currentVisiblePage ? "page" : undefined
                      }
                      onClick={() => handlePageSelect(page)}
                    >
                      {page}
                    </button>
                  ) : (
                    <button
                      className="pagination-ellipsis"
                      disabled
                      key={page}
                      type="button"
                    >
                      ...
                    </button>
                  )
                )}
                <button
                  className="pagination-arrow"
                  type="button"
                  aria-label={nextPageLabel}
                  disabled={currentVisiblePage === totalPages}
                  onClick={() =>
                    handlePageSelect(currentVisiblePage + 1)
                  }
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            ) : null}
          </div>
        </section>
      </main>

      <HomeFooter t={t} />
    </div>
  );
}

function ArticlesPage({
  activeCategory,
  articles,
  categories,
  error,
  isLoading,
  locale,
  onLocaleChange,
  onThemeChange,
  query,
  searchArticles,
  searchTools,
  setActiveCategory,
  setQuery,
  showSkeletons,
  totalArticleCount,
  t,
  themeMode
}: {
  activeCategory: string;
  articles: Article[];
  categories: string[];
  error: string;
  isLoading: boolean;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  query: string;
  searchArticles: Article[];
  searchTools: Tool[];
  setActiveCategory: (category: string) => void;
  setQuery: (value: string) => void;
  showSkeletons: boolean;
  totalArticleCount: number;
  t: Messages;
  themeMode: ThemeMode;
}) {
  const articleText = getArticleText(locale);

  function handleCategorySelect(category: string) {
    setActiveCategory(category);
    scrollPageToTop();
  }

  return (
    <div className="home-shell">
      <HomeHeader
        activePage="articles"
        locale={locale}
        onLocaleChange={onLocaleChange}
        onThemeChange={onThemeChange}
        query={query}
        searchArticles={searchArticles}
        searchTools={searchTools}
        setQuery={setQuery}
        t={t}
        themeMode={themeMode}
      />

      <main className="category-page articles-page">
        <section className="category-page-hero">
          <div>
            <h1>{t.articlesPage.title}</h1>
            <p>{t.articlesPage.description}</p>
          </div>
        </section>

        <section className="directory-layout category-directory article-directory">
          <aside className="category-rail">
            {isLoading ? (
              <SkeletonVisibility visible={showSkeletons}>
                <CategoryRailSkeleton items={6} />
              </SkeletonVisibility>
            ) : (
              categories.map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <button
                    className={`category-item ${
                      category === activeCategory ? "is-active" : ""
                    }`}
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <Icon size={20} />
                    <span>{getCategoryLabel(category, t)}</span>
                  </button>
                );
              })
            )}
          </aside>

          <div className="category-results article-results">
            <section className="article-page-list" aria-label={t.articlesPage.title}>
              {isLoading ? (
                <SkeletonVisibility visible={showSkeletons}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ArticleItemSkeleton key={index} />
                  ))}
                </SkeletonVisibility>
              ) : articles.length > 0 ? (
                articles.map((article) => (
                  <ArticleListItem
                    article={article}
                    articleText={articleText}
                    key={article.id}
                  />
                ))
              ) : (
                <div className="empty-state article-empty-state">
                  <div className="empty-state-title">
                    {error ? <CircleAlert size={24} /> : <FileText size={24} />}
                    <h2>
                      {error
                        ? t.empty.connectionTitle
                        : totalArticleCount === 0
                          ? articleText.publicEmptyTitle
                          : articleText.noMatchTitle}
                    </h2>
                  </div>
                  <p>
                    {error
                      ? t.empty.connectionDescription
                      : totalArticleCount === 0
                        ? articleText.publicEmptyDescription
                        : articleText.noMatchDescription}
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <HomeFooter t={t} />
    </div>
  );
}

function ArticleDetailPage({
  articleSlug,
  locale,
  onLocaleChange,
  onThemeChange,
  query,
  searchArticles,
  searchTools,
  setQuery,
  t,
  themeMode
}: {
  articleSlug: string;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  query: string;
  searchArticles: Article[];
  searchTools: Tool[];
  setQuery: (value: string) => void;
  t: Messages;
  themeMode: ThemeMode;
}) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const articleText = getArticleText(locale);
  const siteSettings = useSiteSettings();
  const proxySettings = useProxySettings();
  const showSkeleton = useLoadingSkeleton(isLoading);
  const articleSearchParams = new URLSearchParams(window.location.search);
  const isPreview = articleSearchParams.get("preview") === "1";
  const previewContentItemId = articleSearchParams.get("contentItem") ?? "";
  const articleDisplayTitle = article ? getArticleDisplayTitle(article) : "";
  const articleDisplaySummary = article
    ? cleanArticleDisplayText(article.summary)
    : "";
  const articleBodyContent = article
    ? stripLeadingArticleDuplicates(
        article.content,
        articleDisplayTitle || article.title,
        articleDisplaySummary || article.summary,
        article.coverImage
      )
    : "";

  useEffect(() => {
    let active = true;

    async function refreshArticle() {
      setIsLoading(true);
      setError("");

      try {
        const previewToken = isPreview || previewContentItemId
          ? localStorage.getItem("htools_token") ?? ""
          : "";
        let nextArticle: Article;

        if (previewContentItemId) {
          if (!previewToken) {
            throw new Error("Unauthorized.");
          }

          nextArticle = await loadContentItemArticlePreview(
            previewContentItemId,
            previewToken
          );
        } else if (isPreview && previewToken) {
          nextArticle = await loadArticlePreview(articleSlug, previewToken);
        } else {
          nextArticle = await loadArticle(articleSlug);
        }

        if (active) {
          setArticle(nextArticle);
        }
      } catch (loadError) {
        if (active) {
          setArticle(null);
          setError(loadError instanceof Error ? loadError.message : "Request failed");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void refreshArticle();

    return () => {
      active = false;
    };
  }, [articleSlug, isPreview, previewContentItemId]);

  useEffect(() => {
    if (article) {
      document.title = `${articleDisplayTitle} · ${getSiteDisplayName(siteSettings)}`;
    }
  }, [article, articleDisplayTitle, siteSettings]);

  return (
    <div className="home-shell">
      <HomeHeader
        activePage="articles"
        locale={locale}
        onLocaleChange={onLocaleChange}
        onThemeChange={onThemeChange}
        query={query}
        searchArticles={searchArticles}
        searchTools={searchTools}
        setQuery={setQuery}
        t={t}
        themeMode={themeMode}
      />

      <main className="content-page article-detail-page">
        {isLoading ? (
          <SkeletonVisibility visible={showSkeleton}>
            <ArticleDetailSkeleton />
          </SkeletonVisibility>
        ) : article ? (
          <article className="article-detail-card">
            <a className="ghost-button article-back-link" href="/articles">
              <ChevronLeft size={16} />
              {articleText.backToArticles}
            </a>

            <header className="article-detail-head">
              <div className="article-detail-meta">
                {article.category ? <span>{article.category}</span> : null}
                {formatAdminDate(article.published_at ?? article.updated_at) ? (
                  <span>
                    {articleText.publishedOn(
                      formatAdminDate(article.published_at ?? article.updated_at)
                    )}
                  </span>
                ) : null}
              </div>
              <h1>{articleDisplayTitle}</h1>
              <p>{articleDisplaySummary}</p>
              <CompactTagRow tags={article.tags} />
            </header>

            <ArticleDetailCover src={article.coverImage} />

            <Suspense
              fallback={
                <LoadingSkeleton>
                  <ArticleBodySkeleton />
                </LoadingSkeleton>
              }
            >
              <MarkdownContent
                content={articleBodyContent}
                proxySettings={proxySettings}
              />
            </Suspense>
          </article>
        ) : (
          <section className="empty-state article-empty-state">
            <div className="empty-state-title">
              <CircleAlert size={24} />
              <h2>{articleText.notFoundTitle}</h2>
            </div>
            <p>{error ? articleText.notFoundDescription : articleText.notFoundDescription}</p>
            <a className="primary-button empty-state-action" href="/articles">
              {articleText.backToArticles}
              <ArrowUpRight size={15} />
            </a>
          </section>
        )}
      </main>

      <HomeFooter t={t} />
    </div>
  );
}

function ArticleListItem({
  article,
  articleText
}: {
  article: Article;
  articleText: ReturnType<typeof getArticleText>;
}) {
  const displayDate = formatAdminDate(article.published_at ?? article.updated_at);
  const displayTitle = getArticleDisplayTitle(article);
  const displaySummary = cleanArticleDisplayText(article.summary);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressResetTimerRef = useRef<number | null>(null);
  const ignoreNextClickRef = useRef(false);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
      }
      if (longPressResetTimerRef.current !== null) {
        window.clearTimeout(longPressResetTimerRef.current);
      }
    };
  }, []);

  function clearLongPressTimer() {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function scheduleLongPressReset() {
    if (!ignoreNextClickRef.current) {
      return;
    }

    if (longPressResetTimerRef.current !== null) {
      window.clearTimeout(longPressResetTimerRef.current);
    }

    longPressResetTimerRef.current = window.setTimeout(() => {
      ignoreNextClickRef.current = false;
      longPressResetTimerRef.current = null;
    }, 700);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.pointerType === "mouse") {
      return;
    }

    clearLongPressTimer();
    ignoreNextClickRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      ignoreNextClickRef.current = true;
    }, 520);
  }

  function handlePointerEnd() {
    clearLongPressTimer();
    scheduleLongPressReset();
  }

  function handleArticleClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (!ignoreNextClickRef.current) {
      return;
    }

    event.preventDefault();
    ignoreNextClickRef.current = false;
  }

  function handleArticleContextMenu(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (!ignoreNextClickRef.current) {
      return;
    }

    event.preventDefault();
    clearLongPressTimer();
    scheduleLongPressReset();
  }

  return (
    <a
      className="article-item"
      href={createArticleHref(article.slug)}
      draggable={false}
      onClick={handleArticleClick}
      onContextMenu={handleArticleContextMenu}
      onDragStart={preventCardDrag}
      onPointerCancel={handlePointerEnd}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerEnd}
      onPointerUp={handlePointerEnd}
    >
      <div>
        <span className="article-date">
          <Clock3 size={16} />
          {displayDate ? articleText.publishedOn(displayDate) : article.category}
        </span>
        <h3>{displayTitle}</h3>
        <p>{displaySummary}</p>
        <CompactTagRow tags={article.tags} />
      </div>
    </a>
  );
}

function ArticleDetailCover({ src }: { src: string }) {
  const proxySettings = useProxySettings();
  const proxiedSrc = proxifyUrl(src, proxySettings);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [proxiedSrc]);

  if (!proxiedSrc || failed) {
    return null;
  }

  return (
    <img
      className="article-detail-cover"
      src={proxiedSrc}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function ArticleBodySkeleton() {
  return (
    <div className="article-body-skeleton" aria-hidden="true">
      <span className="skeleton-shimmer skeleton-line is-long" />
      <span className="skeleton-shimmer skeleton-line" />
      <span className="skeleton-shimmer skeleton-line is-medium" />
      <span className="skeleton-shimmer skeleton-line is-long" />
      <span className="skeleton-shimmer skeleton-line" />
    </div>
  );
}

function ArticleDetailSkeleton() {
  return (
    <section
      className="article-detail-card article-detail-loading"
      aria-hidden="true"
    >
      <span className="skeleton-shimmer article-back-link-skeleton" />
      <header className="article-detail-head article-detail-head-skeleton">
        <div className="article-detail-meta">
          <span className="skeleton-shimmer article-meta-skeleton" />
          <span className="skeleton-shimmer article-meta-skeleton is-date" />
        </div>
        <span className="skeleton-shimmer article-title-skeleton" />
        <span className="skeleton-shimmer article-title-skeleton is-short" />
        <span className="skeleton-shimmer article-summary-skeleton" />
        <div className="skeleton-tag-row">
          <span className="skeleton-shimmer skeleton-tag" />
          <span className="skeleton-shimmer skeleton-tag" />
          <span className="skeleton-shimmer skeleton-tag is-small" />
        </div>
      </header>
      <span className="skeleton-shimmer article-cover-skeleton" />
      <ArticleBodySkeleton />
    </section>
  );
}

function ArticleItemSkeleton() {
  return (
    <article className="article-item article-item-skeleton skeleton-card" aria-hidden="true">
      <div>
        <span className="skeleton-shimmer skeleton-line is-short" />
        <span className="skeleton-shimmer skeleton-line is-medium" />
        <span className="skeleton-shimmer skeleton-line is-long" />
        <div className="skeleton-tag-row">
          <span className="skeleton-shimmer skeleton-tag" />
          <span className="skeleton-shimmer skeleton-tag is-small" />
        </div>
      </div>
    </article>
  );
}

function PublicPageHero({
  description,
  eyebrow,
  title
}: {
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
}) {
  return (
    <header className="category-page-hero public-page-hero">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
  );
}

function AboutPage({
  locale,
  onLocaleChange,
  onThemeChange,
  query,
  searchArticles,
  searchTools,
  setQuery,
  siteSettingsLoaded,
  t,
  themeMode
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  query: string;
  searchArticles: Article[];
  searchTools: Tool[];
  setQuery: (value: string) => void;
  siteSettingsLoaded: boolean;
  t: Messages;
  themeMode: ThemeMode;
}) {
  const siteSettings = useSiteSettings();
  const proxySettings = useProxySettings();
  const showSettingsSkeleton = useLoadingSkeleton(!siteSettingsLoaded);
  const aboutContent = siteSettings.aboutContent?.trim() ?? "";
  const showDefaultAboutHero = siteSettingsLoaded && !aboutContent;
  const productLinks = [
    { label: t.aboutPage.author, href: "https://zrf.me/" },
    { label: t.aboutPage.official, href: "https://zrf.me/" },
    { label: t.home.blog, href: "https://blog.zrf.me" },
    { label: t.aboutPage.github, href: "https://github.com/shaoyouvip/htools" }
  ];

  return (
    <div className="home-shell">
      <HomeHeader
        activePage="about"
        locale={locale}
        onLocaleChange={onLocaleChange}
        onThemeChange={onThemeChange}
        query={query}
        searchArticles={searchArticles}
        searchTools={searchTools}
        setQuery={setQuery}
        t={t}
        themeMode={themeMode}
      />

      <main className="category-page public-page about-page">
        {showDefaultAboutHero ? (
          <PublicPageHero title={t.aboutPage.title} description={t.aboutPage.intro} />
        ) : null}

        <section className="public-page-body public-page-body-prose">
          <article className={`about-content ${!siteSettingsLoaded ? "is-loading" : ""}`}>
            {siteSettingsLoaded && aboutContent ? (
              <Suspense
                fallback={
                  <LoadingSkeleton>
                    <AboutContentSkeleton />
                  </LoadingSkeleton>
                }
              >
                <MarkdownContent content={aboutContent} proxySettings={proxySettings} />
              </Suspense>
            ) : siteSettingsLoaded ? (
              <>
                <p className="about-lead">{t.aboutPage.greeting}</p>
                <p>{t.aboutPage.pain}</p>
                <p>{t.aboutPage.reason}</p>

                <section className="about-section">
                  <h2>{t.aboutPage.whatTitle}</h2>
                  <p>{t.aboutPage.whatIntro}</p>
                  <p>{t.aboutPage.collectIntro}</p>
                  <ul className="about-list">
                    <li>{t.aboutPage.devTools}</li>
                    <li>{t.aboutPage.designResources}</li>
                    <li>{t.aboutPage.growthTools}</li>
                    <li>{t.aboutPage.communityContrib}</li>
                  </ul>
                </section>

                <section className="about-section">
                  <p>{t.aboutPage.helpIntro}</p>
                  <ul className="about-list">
                    <li>{t.aboutPage.share}</li>
                    <li>{t.aboutPage.recommend}</li>
                    <li>{t.aboutPage.feedback}</li>
                    <li>
                      <a href="#">{t.aboutPage.githubStar}</a>
                    </li>
                    <li>
                      <a href="#">{t.aboutPage.twitterFollow}</a>
                    </li>
                  </ul>
                  <p>{t.aboutPage.closing}</p>
                </section>

                <section className="about-section product-links-section">
                  <h2>{t.aboutPage.productLinksTitle}</h2>
                  <div className="product-links-grid">
                    {productLinks.map((link) => (
                      <a
                        className="product-link-card"
                        href={proxifyUrl(link.href, proxySettings)}
                        key={link.label}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight size={17} />
                      </a>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <SkeletonVisibility visible={showSettingsSkeleton}>
                <AboutContentSkeleton />
              </SkeletonVisibility>
            )}
          </article>
        </section>
      </main>

      <HomeFooter t={t} />
    </div>
  );
}

function AboutContentSkeleton() {
  return (
    <div className="about-content-skeleton" aria-hidden="true">
      <span className="skeleton-shimmer skeleton-line is-medium" />
      <span className="skeleton-shimmer skeleton-line is-long" />
      <span className="skeleton-shimmer skeleton-line" />
      <span className="skeleton-shimmer skeleton-line is-long" />
      <span className="skeleton-shimmer skeleton-line is-medium" />
      <div className="about-content-skeleton-block">
        <span className="skeleton-shimmer skeleton-line is-short" />
        <span className="skeleton-shimmer skeleton-line is-long" />
        <span className="skeleton-shimmer skeleton-line" />
        <span className="skeleton-shimmer skeleton-line is-medium" />
      </div>
      <div className="about-content-skeleton-links">
        <span className="skeleton-shimmer skeleton-tag" />
        <span className="skeleton-shimmer skeleton-tag" />
        <span className="skeleton-shimmer skeleton-tag is-small" />
      </div>
    </div>
  );
}

type LegalPageKind = "privacy" | "terms";

function LegalPage({
  kind,
  locale,
  onLocaleChange,
  onThemeChange,
  query,
  searchArticles,
  searchTools,
  setQuery,
  siteSettingsLoaded,
  t,
  themeMode
}: {
  kind: LegalPageKind;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  query: string;
  searchArticles: Article[];
  searchTools: Tool[];
  setQuery: (value: string) => void;
  siteSettingsLoaded: boolean;
  t: Messages;
  themeMode: ThemeMode;
}) {
  const siteSettings = useSiteSettings();
  const showSettingsSkeleton = useLoadingSkeleton(!siteSettingsLoaded);
  const content = getLegalPageContent(kind, locale, getSiteDisplayName(siteSettings));

  return (
    <div className="home-shell">
      <HomeHeader
        activePage="about"
        locale={locale}
        onLocaleChange={onLocaleChange}
        onThemeChange={onThemeChange}
        query={query}
        searchArticles={searchArticles}
        searchTools={searchTools}
        setQuery={setQuery}
        t={t}
        themeMode={themeMode}
      />

      <main className="category-page public-page legal-page">
        <PublicPageHero title={content.title} description={content.intro} />

        <section className="public-page-body public-page-body-prose">
          <article className="about-content">
            {siteSettingsLoaded ? (
              <>
                {content.sections.map((section) => (
                  <section className="about-section" key={section.title}>
                    <h2>{section.title}</h2>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.items?.length ? (
                      <ul className="about-list">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
                <p className="legal-updated-at">{content.updatedAt}</p>
              </>
            ) : (
              <SkeletonVisibility visible={showSettingsSkeleton}>
                <AboutContentSkeleton />
              </SkeletonVisibility>
            )}
          </article>
        </section>
      </main>

      <HomeFooter t={t} />
    </div>
  );
}

function getLegalPageContent(kind: LegalPageKind, locale: Locale, siteName: string) {
  const isZh = locale === "zh";

  if (kind === "privacy") {
    return isZh
      ? {
          title: "隐私政策",
          intro: `${siteName} 是一个工具导航站。我们只在实现站点功能所需范围内处理信息，不出售用户数据，也不会主动建立广告追踪画像。`,
          updatedAt: "最后更新：2026-07-01",
          sections: [
            {
              title: "我们会处理哪些信息",
              paragraphs: [
                "访问公开页面时，Cloudflare 可能会按其基础设施规则处理必要的请求日志、安全日志和性能数据。",
                "当你使用 GitHub 登录提交工具时，站点会读取 GitHub 返回的基础身份信息，用于确认提交者并创建 Issue。"
              ],
              items: [
                "GitHub 用户名、头像、主页地址等公开资料。",
                "你主动提交的工具名称、链接、描述、分类和标签。",
                "站点运行所需的 Cookie、会话令牌和安全校验信息。"
              ]
            },
            {
              title: "信息如何使用",
              paragraphs: [
                "这些信息用于登录验证、工具提交、公开审核、问题排查和站点安全防护。",
                "通过 GitHub 提交的内容可能会出现在目标仓库的 Issue 中，因此请不要提交隐私信息、密钥或不希望公开的内容。"
              ]
            },
            {
              title: "第三方服务",
              paragraphs: [
                "站点部署和数据库依赖 Cloudflare；GitHub 登录和 Issue 提交依赖 GitHub。你使用相关功能时，也会受到这些第三方服务自身隐私政策的约束。"
              ]
            },
            {
              title: "联系我们",
              paragraphs: [
                "如果你希望删除由你提交的内容，或对隐私处理有疑问，可以通过项目 GitHub 仓库联系维护者。"
              ]
            }
          ]
        }
      : {
          title: "Privacy Policy",
          intro: `${siteName} is a tool directory. We only process information needed to run site features. We do not sell user data or build advertising profiles.`,
          updatedAt: "Last updated: 2026-07-01",
          sections: [
            {
              title: "Information We Process",
              paragraphs: [
                "When you visit public pages, Cloudflare may process necessary request logs, security logs, and performance data as part of its infrastructure.",
                "When you sign in with GitHub to submit a tool, the site reads basic GitHub identity data to identify the submitter and create an issue."
              ],
              items: [
                "Public GitHub profile data such as username, avatar, and profile URL.",
                "Tool name, URL, description, category, and tags that you submit.",
                "Cookies, session tokens, and security data required to operate the site."
              ]
            },
            {
              title: "How We Use Information",
              paragraphs: [
                "We use this information for authentication, tool submission, public review, troubleshooting, and site security.",
                "Content submitted through GitHub may appear in issues in the target repository. Do not submit private information, secrets, or content you do not want to make public."
              ]
            },
            {
              title: "Third-Party Services",
              paragraphs: [
                "The site runs on Cloudflare and uses GitHub for login and issue submission. Those features are also subject to the privacy policies of the respective providers."
              ]
            },
            {
              title: "Contact",
              paragraphs: [
                "If you want submitted content removed or have privacy questions, contact the maintainer through the project GitHub repository."
              ]
            }
          ]
        };
  }

  return isZh
    ? {
        title: "服务条款",
        intro: `使用 ${siteName} 即表示你同意以合理、合法、尊重开源社区的方式使用本网站。`,
        updatedAt: "最后更新：2026-07-01",
        sections: [
          {
            title: "网站用途",
            paragraphs: [
              "本网站用于整理、展示和分享工具、开源项目、文章与内容源。站点内容仅供参考，具体项目质量、安全性和可用性需要你自行判断。"
            ]
          },
          {
            title: "提交内容",
            paragraphs: [
              "你可以通过 GitHub 提交工具建议。提交后，内容可能会进入公开 Issue，并由维护者决定是否收录、修改或关闭。"
            ],
            items: [
              "请不要提交违法、侵权、恶意、欺诈或明显无关的内容。",
              "请不要提交密钥、账号、私人联系方式等敏感信息。",
              "提交内容应尽量真实、清晰，并指向可访问的项目页面。"
            ]
          },
          {
            title: "免责声明",
            paragraphs: [
              "网站按现状提供，不承诺所有链接、工具或文章始终准确、可用或适合你的具体用途。因使用第三方工具或外部链接产生的问题，需要你自行评估和承担风险。"
            ]
          },
          {
            title: "条款调整",
            paragraphs: [
              "维护者可能会根据站点功能变化更新这些条款。继续使用网站即表示你接受更新后的内容。"
            ]
          }
        ]
      }
    : {
        title: "Terms of Service",
        intro: `By using ${siteName}, you agree to use this site in a reasonable, lawful, and open-source-friendly manner.`,
        updatedAt: "Last updated: 2026-07-01",
        sections: [
          {
            title: "Purpose",
            paragraphs: [
              "This site organizes and shares tools, open-source projects, articles, and content sources. Content is provided for reference only. You are responsible for evaluating project quality, security, and availability."
            ]
          },
          {
            title: "Submissions",
            paragraphs: [
              "You may submit tool suggestions through GitHub. Submitted content may become a public issue, and maintainers may decide whether to list, edit, or close it."
            ],
            items: [
              "Do not submit illegal, infringing, malicious, deceptive, or clearly irrelevant content.",
              "Do not submit secrets, account data, private contact details, or sensitive information.",
              "Submissions should be accurate, clear, and point to accessible project pages."
            ]
          },
          {
            title: "Disclaimer",
            paragraphs: [
              "The site is provided as is. We do not guarantee that all links, tools, or articles are always accurate, available, or suitable for your needs. You are responsible for risks from third-party tools and external links."
            ]
          },
          {
            title: "Changes",
            paragraphs: [
              "The maintainer may update these terms as site features change. Continued use of the site means you accept the updated terms."
            ]
          }
        ]
      };
}

function HomeHeader({
  activePage,
  locale,
  onLocaleChange,
  onThemeChange,
  query,
  searchArticles = [],
  searchTools = [],
  setQuery,
  showSearch = true,
  t,
  themeMode
}: {
  activePage: PublicPage;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  query: string;
  searchArticles?: Article[];
  searchTools?: Tool[];
  setQuery: (value: string) => void;
  showSearch?: boolean;
  t: Messages;
  themeMode: ThemeMode;
}) {
  const [openMenu, setOpenMenu] = useState<"locale" | "theme" | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileNavClosing, setIsMobileNavClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchShortcutLabel = "⌘ K";
  const menuRootRef = useRef<HTMLDivElement>(null);
  const mobileUtilityRootRef = useRef<HTMLDivElement>(null);
  const mobileNavCloseTimerRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const siteSettings = useSiteSettings();
  const proxySettings = useProxySettings();
  const siteName = getSiteDisplayName(siteSettings);
  const siteSubtitle = getSiteSubtitle(siteSettings);
  const isMobileNavVisible = isMobileNavOpen || isMobileNavClosing;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedSearchQuery) {
      return [];
    }

    return searchTools
      .filter((tool) => {
        const haystack = [
          tool.name,
          tool.description,
          tool.category,
          getCategoryLabel(tool.category, t),
          ...tool.tags
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearchQuery);
      })
      .slice(0, 8);
  }, [normalizedSearchQuery, searchTools, t]);
  const articleSearchResults = useMemo(() => {
    if (!normalizedSearchQuery) {
      return [];
    }

    return searchArticles
      .filter((article) => {
        const displayTitle = getArticleDisplayTitle(article);
        const haystack = [
          displayTitle,
          article.title,
          article.summary,
          article.category,
          getCategoryLabel(article.category, t),
          article.content,
          ...article.tags
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearchQuery);
      })
      .slice(0, 6);
  }, [normalizedSearchQuery, searchArticles, t]);
  const canOpenGlobalSearch = showSearch || activePage === "home";
  const isSearchOverlayOpen = canOpenGlobalSearch && isSearchOpen;
  const shouldLockBodyScroll = isSearchOverlayOpen;
  const themeOptions: Array<{ label: string; value: ThemeMode }> = [
    { label: t.theme.light, value: "light" },
    { label: t.theme.dark, value: "dark" },
    { label: t.theme.system, value: "system" }
  ];

  function openMobileNav() {
    if (mobileNavCloseTimerRef.current !== null) {
      window.clearTimeout(mobileNavCloseTimerRef.current);
      mobileNavCloseTimerRef.current = null;
    }

    setOpenMenu(null);
    setIsMobileNavClosing(false);
    setIsMobileNavOpen(true);
  }

  function closeMobileNav() {
    if (!isMobileNavOpen && !isMobileNavClosing) {
      return;
    }

    if (mobileNavCloseTimerRef.current !== null) {
      window.clearTimeout(mobileNavCloseTimerRef.current);
    }

    setOpenMenu(null);
    setIsMobileNavOpen(false);
    setIsMobileNavClosing(true);
    mobileNavCloseTimerRef.current = window.setTimeout(() => {
      setIsMobileNavClosing(false);
      mobileNavCloseTimerRef.current = null;
    }, MOBILE_NAV_EXIT_MS);
  }

  useEffect(() => {
    return () => {
      if (mobileNavCloseTimerRef.current !== null) {
        window.clearTimeout(mobileNavCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if (!canOpenGlobalSearch) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    }

    document.addEventListener("keydown", handleSearchShortcut);

    return () => {
      document.removeEventListener("keydown", handleSearchShortcut);
    };
  }, [canOpenGlobalSearch]);

  useEffect(() => {
    if (!openMenu) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        menuRootRef.current?.contains(event.target as Node) ||
        mobileUtilityRootRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      setOpenMenu(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!shouldLockBodyScroll) {
      return;
    }

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousLeft = document.body.style.left;
    const previousRight = document.body.style.right;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      document.body.style.left = previousLeft;
      document.body.style.right = previousRight;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      window.requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      });
    };
  }, [shouldLockBodyScroll]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    window.setTimeout(() => searchInputRef.current?.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isMobileNavVisible) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileNavVisible]);

  function openSearch() {
    setOpenMenu(null);
    closeMobileNav();
    setSearchQuery("");
    setIsSearchOpen(true);
  }

  function closeSearch() {
    setSearchQuery("");
    setIsSearchOpen(false);
  }

  function handleSearchInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    if (normalizedSearchQuery && searchResults[0]) {
      event.preventDefault();
      window.open(
        proxifyUrl(searchResults[0].url, proxySettings),
        "_blank",
        "noopener,noreferrer"
      );
      closeSearch();
      return;
    }

    if (normalizedSearchQuery && articleSearchResults[0]) {
      event.preventDefault();
      window.location.href = createArticleHref(articleSearchResults[0].slug);
      return;
    }

    if (visibleCommandActions[0]) {
      event.preventDefault();
      window.location.href = visibleCommandActions[0].href;
    }
  }

  function closeOnBackdropMouseDown(
    event: ReactMouseEvent<HTMLElement>,
    onClose: () => void
  ) {
    if (event.currentTarget === event.target) {
      onClose();
    }
  }

  function handleNavClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    spawnNavClickBurst(event.clientX, event.clientY);

    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const targetUrl = new URL(event.currentTarget.href);
    const currentUrl = new URL(window.location.href);
    event.preventDefault();

    if (
      targetUrl.pathname === currentUrl.pathname &&
      targetUrl.search === currentUrl.search &&
      targetUrl.hash === currentUrl.hash
    ) {
      return;
    }

    window.setTimeout(() => {
      window.location.href = targetUrl.href;
    }, NAV_BURST_NAVIGATION_DELAY_MS);
  }

  const publicNavLinks: Array<{
    href: string;
    Icon: typeof Boxes;
    label: string;
    page: Exclude<PublicPage, "home">;
  }> = [
    { href: "/tools", Icon: Wrench, label: t.nav.category, page: "category" },
    { href: "/articles", Icon: FileText, label: t.nav.articles, page: "articles" },
    { href: "/submit", Icon: PackagePlus, label: t.actions.submitTool, page: "submit" },
    { href: "/about", Icon: BadgeCheck, label: t.nav.about, page: "about" }
  ];
  const mobileNavLinks: Array<{
    href: string;
    Icon: typeof Boxes;
    label: string;
    page: PublicPage;
  }> = [
    { href: "/", Icon: House, label: t.actions.home, page: "home" },
    ...publicNavLinks
  ];
  const searchCommandText =
    locale === "zh"
      ? {
          actionsTitle: "常用操作",
          resultsTitle: "工具结果",
          articleResultsTitle: "文章结果",
          noResultsTitle: "没有找到结果",
          noResultsDescription: "换个关键词，或者直接打开常用入口。",
          browseTools: "浏览全部工具和分类",
          readArticles: "阅读文章与资源整理",
          submitTool: "推荐一个新的开源项目",
          about: "了解本站和项目背景",
          admin: "进入后台管理"
        }
      : {
          actionsTitle: "Quick actions",
          resultsTitle: "Tool results",
          articleResultsTitle: "Article results",
          noResultsTitle: "No results",
          noResultsDescription: "Try another keyword or open a common destination.",
          browseTools: "Browse all tools and categories",
          readArticles: "Read articles and resource notes",
          submitTool: "Recommend a new open-source project",
          about: "Learn about this site and project",
          admin: "Open the admin console"
        };
  const commandActions = [
    {
      href: "/tools",
      Icon: Wrench,
      label: t.nav.category,
      description: searchCommandText.browseTools
    },
    {
      href: "/articles",
      Icon: FileText,
      label: t.nav.articles,
      description: searchCommandText.readArticles
    },
    {
      href: "/submit",
      Icon: PackagePlus,
      label: t.actions.submitTool,
      description: searchCommandText.submitTool
    },
    {
      href: "/about",
      Icon: BadgeCheck,
      label: t.nav.about,
      description: searchCommandText.about
    },
    {
      href: "/admin",
      Icon: LayoutDashboard,
      label: t.nav.admin,
      description: searchCommandText.admin
    }
  ];
  const visibleCommandActions = (
    normalizedSearchQuery
      ? commandActions.filter((action) =>
          `${action.label} ${action.description}`
            .toLowerCase()
            .includes(normalizedSearchQuery)
        )
      : commandActions
  ).slice(0, 5);
  const shouldRenderSearchTrigger = canOpenGlobalSearch;
  const shouldRenderTopbarMenus = !isMobileNavVisible;
  const searchTriggerClassName = `search-box topbar-search search-trigger${
    showSearch ? "" : " mobile-only-search"
  }`;
  const mobileNavOverlay =
    typeof document !== "undefined" && isMobileNavVisible
      ? createPortal(
          <div
            className={`mobile-nav-layer ${
              isMobileNavClosing ? "is-closing" : "is-open"
            }`}
            onMouseDown={(event) => closeOnBackdropMouseDown(event, closeMobileNav)}
          >
            <aside
              className="mobile-nav-drawer"
              aria-label="Mobile navigation"
            >
              <div className="mobile-nav-head">
                <a
                  className="mobile-drawer-brand"
                  href="/"
                  onClick={closeMobileNav}
                >
                  <SiteBrandMark />
                  <span>
                    <strong>{siteName}</strong>
                    <small>{siteSubtitle}</small>
                  </span>
                </a>
                <button
                  className="mobile-nav-close"
                  type="button"
                  aria-label={t.actions.close}
                  onClick={closeMobileNav}
                >
                  <X size={26} />
                </button>
              </div>

              <nav className="mobile-nav-list" aria-label="Mobile primary">
                <span className="mobile-nav-section">{t.nav.tools}</span>
                {mobileNavLinks.map((item) => {
                  const Icon = item.Icon;

                  return (
                    <a
                      className={`mobile-nav-link ${
                        activePage === item.page ? "is-active" : ""
                      }`}
                      href={item.href}
                      key={item.page}
                      onClick={(event) => {
                        closeMobileNav();
                        handleNavClick(event);
                      }}
                    >
                      <Icon size={19} />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="mobile-nav-bottom">
                <div className="mobile-nav-utility" ref={mobileUtilityRootRef}>
                  <div className="menu-control mobile-utility-menu">
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={t.actions.toggleLanguage}
                      aria-expanded={openMenu === "locale"}
                      onClick={() =>
                        setOpenMenu((value) => (value === "locale" ? null : "locale"))
                      }
                    >
                      <Languages size={18} />
                    </button>
                    {openMenu === "locale" ? (
                      <div className="floating-menu language-menu" role="menu">
                        {localeOptions.map((option) => (
                          <button
                            className="menu-option"
                            key={option.code}
                            type="button"
                            onClick={() => {
                              onLocaleChange(option.code);
                              setOpenMenu(null);
                            }}
                          >
                            <span>{option.label}</span>
                            {option.code === locale ? <Check size={16} /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="menu-control mobile-utility-menu">
                    <button
                      className="icon-button"
                      type="button"
                      aria-label={t.actions.toggleTheme}
                      aria-expanded={openMenu === "theme"}
                      onClick={() =>
                        setOpenMenu((value) => (value === "theme" ? null : "theme"))
                      }
                    >
                      <Sun size={18} />
                    </button>
                    {openMenu === "theme" ? (
                      <div className="floating-menu theme-menu" role="menu">
                        {themeOptions.map((option) => (
                          <button
                            className="menu-option"
                            key={option.value}
                            type="button"
                            onClick={() => {
                              onThemeChange(option.value);
                              setOpenMenu(null);
                            }}
                          >
                            <span>{option.label}</span>
                            {option.value === themeMode ? <Check size={16} /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <a className="mobile-admin-card" href="/admin" onClick={closeMobileNav}>
                  <span className="mobile-admin-card-copy">
                    <strong>{t.actions.login}</strong>
                    <small>{locale === "zh" ? "进入控制台" : "Enter console"}</small>
                  </span>
                  <span className="icon-button" aria-hidden="true">
                    <LogIn size={18} />
                  </span>
                </a>
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <header className="home-topbar">
        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded={isMobileNavOpen}
          onClick={openMobileNav}
        >
          <Menu size={25} />
        </button>

        <a className="brand" href="/" aria-label={`${siteName} home`}>
          <SiteBrandMark />
          <span>{siteName}</span>
        </a>

        <nav className="desktop-nav home-nav" aria-label="Primary">
          {publicNavLinks.map((item) => (
            <a
              className={`nav-link ${activePage === item.page ? "is-active" : ""}`}
              href={item.href}
              key={item.page}
              onClick={handleNavClick}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div
          className={`home-topbar-actions ${showSearch ? "" : "no-search"}`}
          ref={menuRootRef}
        >
          {shouldRenderSearchTrigger ? (
            <button
              className={searchTriggerClassName}
              type="button"
              aria-label={t.search.trigger}
              aria-expanded={isSearchOpen}
              onClick={openSearch}
            >
              <Search size={19} />
              <span className="search-trigger-label">{t.search.placeholder}</span>
              <kbd className="search-trigger-shortcut">{searchShortcutLabel}</kbd>
            </button>
          ) : null}
          <div className="menu-control locale-control">
            <button
              className="icon-button locale-button"
              type="button"
              aria-label={t.actions.toggleLanguage}
              aria-expanded={openMenu === "locale"}
              onClick={() =>
                setOpenMenu((value) => (value === "locale" ? null : "locale"))
              }
            >
              <Languages size={18} />
            </button>
            {shouldRenderTopbarMenus && openMenu === "locale" ? (
              <div className="floating-menu language-menu" role="menu">
                {localeOptions.map((option) => (
                  <button
                    className="menu-option"
                    key={option.code}
                    type="button"
                    onClick={() => {
                      onLocaleChange(option.code);
                      setOpenMenu(null);
                    }}
                  >
                    <span>{option.label}</span>
                    {option.code === locale ? <Check size={16} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="menu-control theme-control">
            <button
              className="icon-button"
              type="button"
              aria-label={t.actions.toggleTheme}
              aria-expanded={openMenu === "theme"}
              onClick={() =>
                setOpenMenu((value) => (value === "theme" ? null : "theme"))
              }
            >
              <Sun size={18} />
            </button>
            {shouldRenderTopbarMenus && openMenu === "theme" ? (
              <div className="floating-menu theme-menu" role="menu">
                {themeOptions.map((option) => (
                  <button
                    className="menu-option"
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onThemeChange(option.value);
                      setOpenMenu(null);
                    }}
                  >
                    <span>{option.label}</span>
                    {option.value === themeMode ? <Check size={16} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <a className="login-button" href="/admin">
            <UserRound className="login-icon" size={21} />
            <span className="login-label">{t.actions.login}</span>
          </a>
        </div>
      </header>

      {mobileNavOverlay}

      {isSearchOverlayOpen ? (
        <div
          className="global-search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t.search.placeholder}
          onMouseDown={(event) => closeOnBackdropMouseDown(event, closeSearch)}
        >
          <div className="global-search-panel">
            <div className="global-search-input-row">
              <Search size={22} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                placeholder={t.search.placeholder}
                type="text"
              />
              <kbd className="global-search-shortcut">{searchShortcutLabel}</kbd>
              <button
                className="global-search-close"
                type="button"
                aria-label={t.actions.close}
                onClick={closeSearch}
              >
                <X size={22} />
              </button>
            </div>

            <div className="global-search-body">
              {visibleCommandActions.length > 0 ? (
                <section className="global-search-section">
                  <div className="global-search-section-title">
                    {searchCommandText.actionsTitle}
                  </div>
                  <div className="global-search-results">
                    {visibleCommandActions.map((action) => {
                      const Icon = action.Icon;

                      return (
                        <a
                          className="global-search-result is-command"
                          href={action.href}
                          key={action.href}
                          onClick={closeSearch}
                        >
                          <Icon className="global-search-result-icon" size={20} />
                          <div className="global-search-result-copy">
                            <strong>{action.label}</strong>
                            <span>{action.description}</span>
                          </div>
                          <ArrowUpRight size={18} />
                        </a>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {normalizedSearchQuery && searchResults.length > 0 ? (
                <section className="global-search-section">
                  <div className="global-search-section-title">
                    {searchCommandText.resultsTitle}
                  </div>
                  <div className="global-search-results">
                    {searchResults.map((tool) => (
                      <a
                        className="global-search-result"
                        href={proxifyUrl(tool.url, proxySettings)}
                        key={tool.id}
                        target="_blank"
                        rel="noreferrer"
                        onClick={closeSearch}
                      >
                        <Wrench className="global-search-result-icon" size={20} />
                        <div className="global-search-result-copy">
                          <strong>{tool.name}</strong>
                          <span>{tool.description}</span>
                          <div className="global-search-tags">
                            <CompactTagRow tags={getToolDisplayTags(tool)} />
                          </div>
                        </div>
                        <ArrowUpRight size={18} />
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              {normalizedSearchQuery && articleSearchResults.length > 0 ? (
                <section className="global-search-section">
                  <div className="global-search-section-title">
                    {searchCommandText.articleResultsTitle}
                  </div>
                  <div className="global-search-results">
                    {articleSearchResults.map((article) => (
                      <a
                        className="global-search-result"
                        href={createArticleHref(article.slug)}
                        key={article.id}
                        onClick={closeSearch}
                      >
                        <FileText className="global-search-result-icon" size={20} />
                        <div className="global-search-result-copy">
                          <strong>{getArticleDisplayTitle(article)}</strong>
                          <span>{cleanArticleDisplayText(article.summary)}</span>
                          <div className="global-search-tags">
                            <CompactTagRow tags={article.tags} />
                          </div>
                        </div>
                        <ArrowUpRight size={18} />
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              {normalizedSearchQuery &&
              searchResults.length === 0 &&
              articleSearchResults.length === 0 &&
              visibleCommandActions.length === 0 ? (
                <div className="global-search-empty">
                  <h2>{searchCommandText.noResultsTitle}</h2>
                  <p>{searchCommandText.noResultsDescription}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h2 className="home-section-title">
      {icon}
      {title}
    </h2>
  );
}

function getToolDisplayTags(tool: Tool) {
  const tags = tool.tags.map((tag) => tag.trim()).filter(Boolean);

  if (tags.length) {
    return tags;
  }

  return Array.from(
    new Set(
      [tool.githubLanguage, tool.githubLicense]
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function getToolDemoHref(tool: Tool) {
  const demoUrl = normalizeHttpUrlInput(tool.demoUrl);

  if (!demoUrl || !isValidHttpUrl(demoUrl)) {
    return "";
  }

  const officialUrl = normalizeHttpUrlInput(tool.url);

  if (officialUrl && normalizeUrlForImport(demoUrl) === normalizeUrlForImport(officialUrl)) {
    return "";
  }

  return demoUrl;
}

function CompactTagRow({ tags, visibleCount: maxVisibleCount }: { tags: string[]; visibleCount?: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [fitCount, setFitCount] = useState(tags.length);
  const visibleLimit = maxVisibleCount ?? fitCount;
  const visibleTags = tags.slice(0, Math.min(visibleLimit, tags.length));
  const hiddenCount = Math.max(tags.length - visibleTags.length, 0);

  useEffect(() => {
    if (maxVisibleCount !== undefined) {
      return;
    }

    const row = rowRef.current;
    const measure = measureRef.current;

    if (!row || !measure) {
      return;
    }

    const rowElement = row;
    const measureElement = measure;

    function updateFitCount() {
      const availableWidth = Math.floor(rowElement.clientWidth);

      if (availableWidth <= 0) {
        return;
      }

      const gap = Number.parseFloat(getComputedStyle(measureElement).columnGap || "0") || 0;
      const tagWidths = Array.from(
        measureElement.querySelectorAll<HTMLElement>("[data-tag-measure]")
      ).map((element) => Math.ceil(element.getBoundingClientRect().width));
      const moreWidths = new Map(
        Array.from(measureElement.querySelectorAll<HTMLElement>("[data-more-count]")).map(
          (element) => [
            Number(element.dataset.moreCount),
            Math.ceil(element.getBoundingClientRect().width)
          ]
        )
      );

      let nextFitCount = 0;

      for (let count = tags.length; count >= 0; count -= 1) {
        const hidden = tags.length - count;
        const tagsWidth = tagWidths
          .slice(0, count)
          .reduce((total, width, index) => total + width + (index > 0 ? gap : 0), 0);
        const moreWidth = hidden > 0 ? moreWidths.get(hidden) ?? 0 : 0;
        const totalWidth = tagsWidth + moreWidth + (count > 0 && hidden > 0 ? gap : 0);

        if (totalWidth <= availableWidth + 1) {
          nextFitCount = count;
          break;
        }
      }

      setFitCount((current) => (current === nextFitCount ? current : nextFitCount));
    }

    updateFitCount();

    const resizeObserver = new ResizeObserver(updateFitCount);
    resizeObserver.observe(rowElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [maxVisibleCount, tags]);

  return (
    <div className="tag-row-shell">
      <div className="tag-row" ref={rowRef}>
        {visibleTags.map((tag, index) => (
          <span className="tag" key={`${tag}-${index}`}>
            {tag}
          </span>
        ))}
        {hiddenCount > 0 ? <span className="tag tag-more">+{hiddenCount}</span> : null}
      </div>
      {maxVisibleCount === undefined ? (
        <div className="tag-row tag-row-measure" ref={measureRef} aria-hidden="true">
          {tags.map((tag, index) => (
            <span className="tag" data-tag-measure="" key={`${tag}-${index}`}>
              {tag}
            </span>
          ))}
          {tags.map((_, index) => {
            const count = tags.length - index;

            return (
              <span
                className="tag tag-more"
                data-more-count={count}
                key={`more-${count}`}
              >
                +{count}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ToolCardSkeleton() {
  return (
    <div className="tool-card skeleton-card" aria-hidden="true">
      <div className="tool-card-media">
        <div className="skeleton-shimmer skeleton-card-preview" />
      </div>
      <div className="skeleton-card-body">
        <span className="skeleton-shimmer skeleton-line is-medium" />
        <span className="skeleton-shimmer skeleton-line is-long" />
        <span className="skeleton-shimmer skeleton-line is-short" />
        <div className="skeleton-card-footer">
          <div className="skeleton-tag-row">
            <span className="skeleton-shimmer skeleton-tag" />
            <span className="skeleton-shimmer skeleton-tag" />
            <span className="skeleton-shimmer skeleton-tag is-small" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryRailSkeleton({ items }: { items: number }) {
  return (
    <div className="category-rail-skeleton" aria-hidden="true">
      {Array.from({ length: items }).map((_, index) => (
        <span className="skeleton-shimmer category-skeleton-item" key={index} />
      ))}
    </div>
  );
}

function PaginationSkeleton() {
  return (
    <nav
      className="category-pagination category-pagination-skeleton"
      aria-hidden="true"
    >
      {Array.from({ length: 7 }).map((_, index) => (
        <button disabled key={index} type="button">
          <span className="skeleton-shimmer pagination-skeleton-dot" />
        </button>
      ))}
    </nav>
  );
}

function ToolPreviewActions({
  demoHref,
  isGitHubPreview,
  priority,
  proxySettings,
  t,
  tool
}: {
  demoHref: string;
  isGitHubPreview: boolean;
  priority?: boolean;
  proxySettings: ProxySettings;
  t: Messages;
  tool: Tool;
}) {
  const hasDemo = Boolean(demoHref);
  const projectHref = proxifyUrl(tool.url, proxySettings);
  const proxiedDemoHref = proxifyUrl(demoHref, proxySettings);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastPointerTypeRef = useRef("");
  const [isTouchSplitActive, setIsTouchSplitActive] = useState(false);
  const [isInteractionDismissed, setIsInteractionDismissed] = useState(false);

  function blurPreviewFocus() {
    const root = rootRef.current;
    const activeElement = document.activeElement;

    if (root && activeElement instanceof HTMLElement && root.contains(activeElement)) {
      activeElement.blur();
    }
  }

  useEffect(() => {
    if (!isTouchSplitActive) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const root = rootRef.current;

      if (root && !root.contains(event.target as Node)) {
        setIsTouchSplitActive(false);
        setIsInteractionDismissed(false);
        blurPreviewFocus();
      }
    }

    window.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isTouchSplitActive]);

  useEffect(() => {
    setIsTouchSplitActive(false);
    setIsInteractionDismissed(false);
  }, [demoHref, tool.url]);

  function handlePreviewPointerDown(event: ReactPointerEvent<HTMLAnchorElement>) {
    lastPointerTypeRef.current = event.pointerType;
  }

  function handlePreviewActionClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (!hasDemo) {
      setIsInteractionDismissed(true);
      blurActivatedLink(event);
      return;
    }

    if (event.detail === 0) {
      setIsTouchSplitActive(false);
      setIsInteractionDismissed(true);
      blurActivatedLink(event);
      return;
    }

    const pointerType = lastPointerTypeRef.current;
    const isCoarsePointer =
      pointerType === "" &&
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const isTouchPointer =
      pointerType === "touch" || pointerType === "pen" || isCoarsePointer;

    if (isTouchPointer && !isTouchSplitActive) {
      event.preventDefault();
      setIsTouchSplitActive(true);
      setIsInteractionDismissed(false);
      event.currentTarget.blur();
      lastPointerTypeRef.current = "";
      return;
    }

    setIsTouchSplitActive(false);
    setIsInteractionDismissed(true);
    blurActivatedLink(event);
    lastPointerTypeRef.current = "";
  }

  return (
    <div
      className={`tool-preview-shell ${hasDemo ? "has-demo" : ""} ${
        isTouchSplitActive ? "is-touch-active" : ""
      } ${isInteractionDismissed ? "is-action-dismissed" : ""}`}
      ref={rootRef}
      onFocus={() => setIsInteractionDismissed(false)}
      onPointerLeave={() => {
        setIsTouchSplitActive(false);
        setIsInteractionDismissed(false);
      }}
    >
      <div className={`tool-image-link ${isGitHubPreview ? "is-github-preview" : ""}`}>
        <ToolPreviewImage priority={priority} proxySettings={proxySettings} tool={tool} t={t} />
        <span
          className={`tool-card-overlay ${hasDemo ? "is-split" : ""}`}
          aria-hidden="true"
        >
          {hasDemo ? (
            <>
              <span className="tool-card-overlay-segment">
                {t.actions.visit}
                <ArrowUpRight size={20} />
              </span>
              <span className="tool-card-overlay-segment">
                {t.actions.demo}
                <ArrowUpRight size={20} />
              </span>
            </>
          ) : (
            <>
              {t.actions.viewDetails}
              <ArrowUpRight size={24} />
            </>
          )}
        </span>
      </div>
      <div className={`tool-preview-action-grid ${hasDemo ? "has-demo" : ""}`}>
        <a
          className="tool-preview-action is-project"
          href={projectHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`${t.actions.visit}: ${tool.name}`}
          draggable={false}
          onDragStart={preventCardDrag}
          onPointerDown={handlePreviewPointerDown}
          onClick={handlePreviewActionClick}
        />
        {hasDemo ? (
          <a
            className="tool-preview-action is-demo"
            href={proxiedDemoHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`${t.form.demoUrl}: ${tool.name}`}
            draggable={false}
            onDragStart={preventCardDrag}
            onPointerDown={handlePreviewPointerDown}
            onClick={handlePreviewActionClick}
          />
        ) : null}
      </div>
    </div>
  );
}

function ToolPreviewImage({
  priority = false,
  proxySettings,
  t,
  tool
}: {
  priority?: boolean;
  proxySettings: ProxySettings;
  t: Messages;
  tool: Tool;
}) {
  const source = proxifyUrl(createToolPreviewSource(tool), proxySettings);
  const isGitHubPreview = usesGitHubOpenGraphPreview(tool);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [source]);

  useEffect(() => {
    const image = imageRef.current;

    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [source]);

  if (!source || failed) {
    return (
      <span className="tool-image-fallback" aria-label={t.tool.previewAlt(tool.name)}>
        <strong>{getToolInitials(tool.name)}</strong>
        <small>{tool.name}</small>
      </span>
    );
  }

  return (
    <>
      <span className="tool-image-fallback" aria-hidden="true">
        <strong>{getToolInitials(tool.name)}</strong>
        <small>{tool.name}</small>
      </span>
      <img
        className={`tool-image ${isGitHubPreview ? "is-github-preview" : ""} ${
          loaded ? "is-loaded" : ""
        }`}
        ref={imageRef}
        src={source}
        alt={t.tool.previewAlt(tool.name)}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onDragStart={preventCardDrag}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </>
  );
}

function HomeToolCard({
  priority = false,
  proxySettings,
  tool,
  t
}: {
  priority?: boolean;
  proxySettings: ProxySettings;
  tool: Tool;
  t: Messages;
}) {
  const demoHref = getToolDemoHref(tool);
  const isGitHubPreview = usesGitHubOpenGraphPreview(tool);
  const toolHref = proxifyUrl(tool.url, proxySettings);

  return (
    <article className="tool-card home-tool-card">
      <div className="tool-card-media">
        <ToolPreviewActions
          demoHref={demoHref}
          isGitHubPreview={isGitHubPreview}
          priority={priority}
          proxySettings={proxySettings}
          tool={tool}
          t={t}
        />
      </div>
      <div className="tool-body">
        <h3>
          <a
            className="tool-title-link"
            href={toolHref}
            target="_blank"
            rel="noreferrer"
            draggable={false}
            onDragStart={preventCardDrag}
            onClick={blurActivatedLink}
          >
            {tool.name}
          </a>
        </h3>
        <p>{tool.description}</p>
        <div className="tool-card-footer">
          <CompactTagRow tags={getToolDisplayTags(tool)} />
        </div>
      </div>
    </article>
  );
}

type FooterLink = {
  label: string;
  href: string;
};

function HomeFooter({ t }: { t: Messages }) {
  const siteSettings = useSiteSettings();
  const proxySettings = useProxySettings();
  const siteName = getSiteDisplayName(siteSettings);
  const footerSettings = getLocalizedFooterSettings(siteSettings, t);
  const footerCopyrightSuffix =
    t === translations.en
      ? ". All rights reserved."
      : " \u7248\u6743\u6240\u6709\uff0c\u4fdd\u7559\u6240\u6709\u6743\u5229\u3002";

  return (
    <footer className="home-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <a className="brand" href="/">
            <SiteBrandMark className="compact-mark" />
            <span>{siteName}</span>
          </a>
          <p>{footerSettings.description}</p>
          <div className="footer-socials">
            {footerSettings.socialLinks.map((link) => (
              <FooterIconLink
                key={`${link.label}-${link.href}`}
                link={link}
                proxySettings={proxySettings}
              />
            ))}
            {footerSettings.sponsorUrl ? (
              <a
                className="coffee-button"
                href={proxifyUrl(footerSettings.sponsorUrl, proxySettings)}
                target="_blank"
                rel="noreferrer"
              >
                <Coffee size={17} />
                {footerSettings.sponsorLabel}
              </a>
            ) : null}
          </div>
        </div>

        {footerSettings.groups.map((group) => (
          <FooterColumn
            key={`${group.title}-${group.links.length}`}
            links={group.links}
            proxySettings={proxySettings}
            title={group.title}
          />
        ))}
      </div>

      <div className="footer-bottom">
        <span>
          &copy; 2026{" "}
          <a
            href={proxifyUrl(footerSettings.authorUrl, proxySettings)}
            target="_blank"
            rel="noreferrer"
          >
            {footerSettings.authorName}
          </a>
          {footerCopyrightSuffix}
        </span>
      </div>
    </footer>
  );
}

function FooterIconLink({
  link,
  proxySettings
}: {
  link: FooterLink;
  proxySettings: ProxySettings;
}) {
  const Icon = getFooterLinkIcon(link);
  const isExternal = link.href.startsWith("http");

  return (
    <a
      href={isExternal ? proxifyUrl(link.href, proxySettings) : link.href}
      aria-label={link.label}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
    >
      <Icon size={18} />
    </a>
  );
}

function getFooterLinkIcon(link: FooterLink) {
  const label = link.label.trim().toLowerCase();
  const href = link.href.trim().toLowerCase();
  const host = getFooterLinkHost(link.href);
  const text = `${label} ${host} ${href}`;

  if (href.startsWith("mailto:") || matchesFooterKeyword(text, ["email", "mail", "邮箱"])) {
    return Mail;
  }

  if (matchesFooterKeyword(text, ["github", "github.com"])) {
    return Github;
  }

  if (label === "x" || host === "x.com" || host.endsWith(".x.com")) {
    return X;
  }

  if (matchesFooterKeyword(text, ["twitter", "twitter.com"])) {
    return Twitter;
  }

  if (matchesFooterKeyword(text, ["telegram", "t.me", "telegram.me"])) {
    return Send;
  }

  if (matchesFooterKeyword(text, ["rss", "atom", "feed", "订阅"])) {
    return Rss;
  }

  if (matchesFooterKeyword(text, ["youtube", "youtu.be"])) {
    return Youtube;
  }

  if (matchesFooterKeyword(text, ["discord", "qq", "wechat", "weixin", "社群", "交流群"])) {
    return MessageCircle;
  }

  if (matchesFooterKeyword(text, ["linkedin"])) {
    return Linkedin;
  }

  if (matchesFooterKeyword(text, ["instagram"])) {
    return Instagram;
  }

  if (matchesFooterKeyword(text, ["facebook"])) {
    return Facebook;
  }

  if (label.startsWith("@") || matchesFooterKeyword(text, ["mastodon", "threads"])) {
    return AtSign;
  }

  return Link2;
}

function getFooterLinkHost(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function matchesFooterKeyword(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function FooterColumn({
  links,
  proxySettings,
  title
}: {
  links: FooterLink[];
  proxySettings: ProxySettings;
  title: string;
}) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      {links.map((link) => {
        const isExternal = link.href.startsWith("http");

        return (
          <a
            href={isExternal ? proxifyUrl(link.href, proxySettings) : link.href}
            key={link.label}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

function SubmitPage({
  locale,
  onLocaleChange,
  onThemeChange,
  query,
  searchArticles,
  searchTools,
  setQuery,
  siteSettingsLoaded,
  t,
  themeMode
}: {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  query: string;
  searchArticles: Article[];
  searchTools: Tool[];
  setQuery: (value: string) => void;
  siteSettingsLoaded: boolean;
  t: Messages;
  themeMode: ThemeMode;
}) {
  const [authState, setAuthState] = useState<GitHubAuthState>({
    configured: false,
    authenticated: false,
    user: null
  });
  const [form, setForm] = useState<SubmissionInput>({
    name: "",
    description: "",
    url: "",
    category: submissionCategories[0],
    tags: []
  });
  const [tagText, setTagText] = useState("");
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<ToastTone>("info");
  const [issueUrl, setIssueUrl] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const proxySettings = useProxySettings();
  const isPageLoading = isAuthLoading || !siteSettingsLoaded;
  const showPageSkeleton = useLoadingSkeleton(isPageLoading);
  const submitAuthDescription = authState.user
    ? t.submitPage.signedInAs(authState.user.login)
    : isChineseLocaleText(t)
      ? "请先使用 GitHub 登录。"
      : "Sign in with GitHub first.";

  async function refreshAuthState() {
    setIsAuthLoading(true);

    try {
      setAuthState(await loadGitHubAuthState());
    } catch {
      setAuthState({
        configured: false,
        authenticated: false,
        user: null
      });
    } finally {
      setIsAuthLoading(false);
    }
  }

  useEffect(() => {
    void refreshAuthState();

    const params = new URLSearchParams(window.location.search);
    const authResult = params.get("auth");

    if (authResult === "success") {
      setStatus(t.status.githubLoginSuccess);
      setStatusTone("success");
      setIssueUrl("");
    } else if (authResult === "failed") {
      setStatus(t.status.loginFailed);
      setStatusTone("error");
      setIssueUrl("");
    }

    if (authResult) {
      params.delete("auth");
      const queryString = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`
      );
    }
  }, [t.status.githubLoginSuccess, t.status.loginFailed]);

  function handleGitHubLogin() {
    window.location.href = `/api/github/login?returnTo=${encodeURIComponent(
      "/submit"
    )}`;
  }

  async function handleGitHubLogout() {
    try {
      await logoutGitHub();
      await refreshAuthState();
      setStatus("");
      setIssueUrl("");
      setStatus(t.status.githubLogoutSuccess);
      setStatusTone("success");
    } catch {
      setIssueUrl("");
      setStatus(t.status.githubLogoutFailed);
      setStatusTone("error");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIssueUrl("");

    if (!authState.configured) {
      setStatus(t.submitPage.githubNotConfigured);
      setStatusTone("error");
      return;
    }

    if (!authState.authenticated) {
      setStatus(t.submitPage.signInRequired);
      setStatusTone("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const result = await submitTool({
        ...form,
        locale,
        url: normalizeHttpUrlInput(form.url),
        tags: parseArticleTagsInput(tagText)
      });
      setIssueUrl(result.issueUrl);
      const successMessage = t.submitPage.success(result.issueNumber);
      setStatus(successMessage);
      setStatusTone("success");
      setForm({
        name: "",
        description: "",
        url: "",
        category: submissionCategories[0],
        tags: []
      });
      setTagText("");
    } catch (error) {
      setIssueUrl("");
      setStatus(getLocalizedErrorMessage(error, t));
      setStatusTone("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="home-shell">
      <HomeHeader
        activePage="submit"
        locale={locale}
        onLocaleChange={onLocaleChange}
        onThemeChange={onThemeChange}
        query={query}
        searchArticles={searchArticles}
        searchTools={searchTools}
        setQuery={setQuery}
        t={t}
        themeMode={themeMode}
      />

      <main className="category-page public-page public-submit-page">
        {isPageLoading ? (
          <SkeletonVisibility visible={showPageSkeleton}>
            <SubmitPageSkeleton />
          </SkeletonVisibility>
        ) : (
          <>
            <PublicPageHero
              title={t.submitPage.heading}
              description={t.submitPage.description}
            />

            <div className="public-page-body public-page-body-form">
              <form className="public-submit-form" onSubmit={handleSubmit}>
                <FormRow label={t.form.name}>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder={t.submitPage.namePlaceholder}
                    required
                  />
                </FormRow>

                <FormRow label={t.form.description}>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder={t.submitPage.descriptionPlaceholder}
                    rows={6}
                    required
                  />
                </FormRow>

                <FormRow label={t.form.url}>
                  <div className="submit-url-field">
                    <input
                      value={form.url}
                      onChange={(event) => setForm({ ...form, url: event.target.value })}
                      onBlur={() =>
                        setForm((current) => ({
                          ...current,
                          url: normalizeHttpUrlInput(current.url)
                        }))
                      }
                      placeholder={t.submitPage.urlPlaceholder}
                      inputMode="url"
                      required
                    />
                  </div>
                </FormRow>

                <FormRow label={t.form.tags}>
                  <input
                    value={tagText}
                    onChange={(event) => setTagText(event.target.value)}
                    placeholder={t.form.tagsPlaceholder}
                  />
                </FormRow>

                <FormRow label={t.submitPage.categoryLabel}>
                  <div className="category-radio-grid">
                    {submissionCategories.map((category) => (
                      <label className="radio-item" key={category}>
                        <input
                          checked={form.category === category}
                          name="category"
                          onChange={() => setForm({ ...form, category })}
                          type="radio"
                        />
                        <span>{getCategoryLabel(category, t)}</span>
                      </label>
                    ))}
                  </div>
                </FormRow>

                <div className="submit-auth-row">
                  <div>
                    <strong>
                      {authState.configured
                        ? t.submitPage.githubConfigured
                        : t.submitPage.githubNotConfigured}
                    </strong>
                    <span>{submitAuthDescription}</span>
                  </div>
                </div>

                <div className="submit-form-actions">
                  <div className="submit-action-buttons">
                    <button
                      className="primary-button"
                      disabled={!authState.configured || !authState.authenticated || isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? t.form.saving : t.actions.submit}
                    </button>
                    {authState.authenticated ? (
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => void handleGitHubLogout()}
                      >
                        <LogOut size={16} />
                        {t.actions.logoutGitHub}
                      </button>
                    ) : (
                      <button
                        className="ghost-button"
                        disabled={!authState.configured}
                        type="button"
                        onClick={handleGitHubLogin}
                      >
                        <Github size={16} />
                        {t.actions.signInWithGitHub}
                      </button>
                    )}
                  </div>
                  <p>{t.submitPage.submitHint}</p>
                </div>

                {status ? (
                  <div className={`submit-status is-${statusTone}`} role="status">
                    <span className="submit-status-content">
                      <span className="submit-status-icon" aria-hidden="true">
                        {statusTone === "success" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <CircleAlert size={18} />
                        )}
                      </span>
                      <span className="submit-status-message">{status}</span>
                    </span>
                    {issueUrl ? (
                      <a
                        className="ghost-button compact submit-status-link"
                        href={proxifyUrl(issueUrl, proxySettings)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.actions.openIssue}
                        <ArrowUpRight size={14} />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </form>

              <section className="submit-guide-section">
                <div className="submit-guide-intro">
                  <h2>{t.submitPage.guideIntroTitle}</h2>
                  <p>{t.submitPage.guideIntroDescription}</p>
                </div>
                <div className="submit-guide-grid">
                  <InfoPanel
                    title={t.submitPage.guideTitle}
                    description={t.submitPage.guideDescription}
                  />
                  <InfoPanel
                    title={t.submitPage.guideContentTitle}
                    description={t.submitPage.guideContentDescription}
                  />
                  <InfoPanel
                    title={t.submitPage.guideReviewTitle}
                    description={t.submitPage.guideReviewDescription}
                  />
                  <InfoPanel
                    title={t.submitPage.guideAfterTitle}
                    description={t.submitPage.guideAfterDescription}
                  />
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      <HomeFooter t={t} />
    </div>
  );
}

function SubmitPageSkeleton() {
  return (
    <div className="submit-page-skeleton" aria-hidden="true">
      <header className="category-page-hero public-page-hero submit-page-header">
        <span className="skeleton-shimmer skeleton-line submit-title-skeleton" />
      </header>

      <div className="public-page-body public-page-body-form">
        <div className="public-submit-form">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="submit-form-row" key={index}>
              <span className="skeleton-shimmer skeleton-line" />
              <span
                className={`skeleton-shimmer submit-input-skeleton ${
                  index === 1 ? "is-textarea" : ""
                }`}
              />
            </div>
          ))}
          <div className="submit-form-row submit-category-skeleton-row">
            <span className="skeleton-shimmer skeleton-line" />
            <div className="category-radio-grid submit-category-skeleton">
              {Array.from({ length: 18 }).map((_, index) => (
                <span className="submit-category-skeleton-item" key={index}>
                  <span className="skeleton-shimmer submit-radio-skeleton" />
                  <span className="skeleton-shimmer skeleton-line is-short" />
                </span>
              ))}
            </div>
          </div>
          <div className="submit-auth-row">
            <div>
              <span className="skeleton-shimmer skeleton-line is-medium" />
              <span className="skeleton-shimmer skeleton-line is-short" />
            </div>
          </div>
          <div className="submit-form-actions">
            <div className="submit-action-buttons">
              <span className="skeleton-shimmer submit-button-skeleton" />
              <span className="skeleton-shimmer submit-button-skeleton is-secondary" />
            </div>
            <span className="skeleton-shimmer skeleton-line is-medium" />
          </div>
        </div>

        <section className="submit-guide-section">
          <div className="submit-guide-intro submit-guide-intro-skeleton">
            <span className="skeleton-shimmer skeleton-line is-long submit-guide-intro-title-skeleton" />
            <span className="skeleton-shimmer skeleton-line is-long submit-guide-intro-text-skeleton" />
            <span className="skeleton-shimmer skeleton-line is-medium submit-guide-intro-text-skeleton" />
          </div>
          <div className="submit-guide-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <article className="info-panel has-no-icon submit-info-skeleton" key={index}>
                <span className="skeleton-shimmer skeleton-line is-medium submit-info-title-skeleton" />
                <span className="skeleton-shimmer skeleton-line is-long submit-info-text-skeleton" />
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function FormRow({
  children,
  label
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="submit-form-row">
      <span>{label}</span>
      {children}
    </label>
  );
}

function InfoPanel({
  description,
  icon,
  title
}: {
  description: string;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <article className={`info-panel${icon ? "" : " has-no-icon"}`}>
      {icon ? <span className="info-icon">{icon}</span> : null}
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function GitHubSettingsForm({
  maintenanceText,
  onStatus,
  token,
  t
}: {
  maintenanceText: ReturnType<typeof getAdminMaintenanceText>;
  onStatus: (message: string) => void;
  token: string;
  t: Messages;
}) {
  const [settings, setSettings] = useState<GitHubSettings | null>(null);
  const [form, setForm] = useState<GitHubSettingsInput>({
    enabled: false,
    clientId: "",
    clientSecret: "",
    owner: "",
    repo: "",
    labels: ["tool-submission"]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const showSettingsSkeleton = useLoadingSkeleton(isLoadingSettings);

  useEffect(() => {
    async function loadSettings() {
      setIsLoadingSettings(true);

      try {
        const loaded = await loadGitHubSettings(token);
        setSettings(loaded);
        setForm({
          enabled: loaded.enabled,
          clientId: loaded.clientId,
          clientSecret: "",
          owner: loaded.owner,
          repo: loaded.repo,
          labels: loaded.labels
        });
      } catch (error) {
        onStatus(getLocalizedErrorMessage(error, t));
      } finally {
        setIsLoadingSettings(false);
      }
    }

    void loadSettings();
  }, [onStatus, t.githubSettings.notLoaded, token]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    onStatus("");

    try {
      const hasClientSecret = Boolean(
        form.clientSecret?.trim() || settings?.hasClientSecret
      );

      if (
        form.enabled &&
        (!form.clientId.trim() ||
          !hasClientSecret ||
          !form.owner.trim() ||
          !form.repo.trim())
      ) {
        onStatus(getGitHubSettingsRequiredMessage(t));
        return;
      }

      const saved = await saveGitHubSettings(form, token);
      setSettings(saved);
      setForm({
        enabled: saved.enabled,
        clientId: saved.clientId,
        clientSecret: "",
        owner: saved.owner,
        repo: saved.repo,
        labels: saved.labels
      });
      onStatus(t.githubSettings.saved);
    } catch (error) {
      onStatus(getLocalizedErrorMessage(error, t));
    } finally {
      setIsSaving(false);
    }
  }

  function toggleEnabled() {
    setForm((current) => {
      const enabled = !current.enabled;
      onStatus(
        enabled
          ? t.githubSettings.enabledPending
          : t.githubSettings.disabledPending
      );
      return {
        ...current,
        enabled
      };
    });
  }

  if (isLoadingSettings) {
    return (
      <SkeletonVisibility visible={showSettingsSkeleton}>
        <GitHubSettingsFormSkeleton />
      </SkeletonVisibility>
    );
  }

  return (
    <form className="tool-form github-settings-form" onSubmit={handleSave}>
      <div className="settings-card-heading github-settings-heading">
        <div>
          <h3>{maintenanceText.oauthTitle}</h3>
        </div>
        <span className={`source-card-status ${form.enabled ? "is-enabled" : ""}`}>
          {form.enabled
            ? t.githubSettings.statusEnabled
            : t.githubSettings.statusDisabled}
        </span>
        <p>{maintenanceText.oauthDescription}</p>
      </div>

      <label>
        {t.githubSettings.clientId}
        <input
          value={form.clientId}
          onChange={(event) =>
            setForm({ ...form, clientId: event.target.value })
          }
        />
      </label>

      <label>
        {t.githubSettings.clientSecret}
        <input
          value={form.clientSecret ?? ""}
          onChange={(event) =>
            setForm({ ...form, clientSecret: event.target.value })
          }
          placeholder={
            settings?.hasClientSecret
              ? t.githubSettings.clientSecretPlaceholder
              : ""
          }
          type="password"
        />
      </label>

      <div className="settings-grid">
        <label>
          {t.githubSettings.owner}
          <input
            value={form.owner}
            onChange={(event) =>
              setForm({ ...form, owner: event.target.value })
            }
            placeholder="owner"
          />
        </label>
        <label>
          {t.githubSettings.repo}
          <input
            value={form.repo}
            onChange={(event) => setForm({ ...form, repo: event.target.value })}
            placeholder="repo"
          />
        </label>
      </div>

      <label>
        {t.githubSettings.labels}
        <input
          value={form.labels.join(", ")}
          onChange={(event) =>
            setForm({
              ...form,
              labels: event.target.value
                .split(",")
                .map((label) => label.trim())
                .filter(Boolean)
            })
          }
          placeholder={t.githubSettings.labelsPlaceholder}
        />
      </label>

      {settings?.callbackUrl ? (
        <div className="callback-box">
          <span>{t.githubSettings.callbackUrl}</span>
          <code>{settings.callbackUrl}</code>
        </div>
      ) : null}

      <div className="source-public-actions github-settings-actions">
        <button
          className="ghost-button"
          disabled={isSaving}
          type="button"
          onClick={toggleEnabled}
        >
          {form.enabled ? t.githubSettings.disabled : t.githubSettings.enabled}
        </button>
        <button className="primary-button" disabled={isSaving} type="submit">
          {isSaving ? t.form.saving : t.actions.saveSettings}
        </button>
      </div>
    </form>
  );
}

function GitHubSettingsFormSkeleton() {
  return (
    <div className="tool-form github-settings-form github-settings-skeleton" aria-hidden="true">
      <div className="settings-card-heading github-settings-heading">
        <div>
          <span className="skeleton-shimmer skeleton-line is-medium" />
        </div>
        <span className="skeleton-shimmer source-card-status" />
        <span className="skeleton-shimmer skeleton-line is-long" />
      </div>
      <div className="admin-settings-field-skeleton">
        <span className="skeleton-shimmer skeleton-line is-short" />
        <span className="skeleton-shimmer admin-settings-input-skeleton" />
      </div>
      <div className="admin-settings-field-skeleton">
        <span className="skeleton-shimmer skeleton-line is-short" />
        <span className="skeleton-shimmer admin-settings-input-skeleton" />
      </div>
      <div className="settings-grid">
        {Array.from({ length: 2 }).map((_, index) => (
          <div className="admin-settings-field-skeleton" key={index}>
            <span className="skeleton-shimmer skeleton-line is-short" />
            <span className="skeleton-shimmer admin-settings-input-skeleton" />
          </div>
        ))}
      </div>
      <div className="admin-settings-field-skeleton">
        <span className="skeleton-shimmer skeleton-line is-short" />
        <span className="skeleton-shimmer admin-settings-input-skeleton" />
      </div>
      <div className="callback-box">
        <span className="skeleton-shimmer skeleton-line is-short" />
        <span className="skeleton-shimmer admin-settings-code-skeleton" />
      </div>
      <div className="source-public-actions github-settings-actions">
        <span className="skeleton-shimmer admin-settings-button-skeleton" />
        <span className="skeleton-shimmer admin-settings-button-skeleton is-secondary" />
      </div>
    </div>
  );
}

function ToolCard({
  priority = false,
  proxySettings,
  tool,
  t
}: {
  priority?: boolean;
  proxySettings: ProxySettings;
  tool: Tool;
  t: Messages;
}) {
  const demoHref = getToolDemoHref(tool);
  const isGitHubPreview = usesGitHubOpenGraphPreview(tool);
  const toolHref = proxifyUrl(tool.url, proxySettings);

  return (
    <article className="tool-card">
      <div className="tool-card-media">
        <ToolPreviewActions
          demoHref={demoHref}
          isGitHubPreview={isGitHubPreview}
          priority={priority}
          proxySettings={proxySettings}
          tool={tool}
          t={t}
        />
      </div>
      <div className="tool-body">
        <div className="tool-heading">
          <h2>
            <a
              className="tool-title-link"
              href={toolHref}
              target="_blank"
              rel="noreferrer"
              draggable={false}
              onDragStart={preventCardDrag}
              onClick={blurActivatedLink}
            >
              {tool.name}
            </a>
          </h2>
          {tool.featured ? (
            <span className="featured-badge">
              <Star size={13} fill="currentColor" />
              {t.tool.featured}
            </span>
          ) : null}
        </div>
        <p>{tool.description}</p>
        <div className="tool-card-footer">
          <CompactTagRow tags={getToolDisplayTags(tool)} />
        </div>
      </div>
    </article>
  );
}

function AdminApp({
  locale,
  onBackHome,
  onLocaleChange,
  onNotify,
  onProxySettingsChange,
  onSiteSettingsChange,
  onThemeChange,
  proxySettings,
  siteSettings,
  t,
  themeMode
}: {
  locale: Locale;
  onBackHome: () => void;
  onLocaleChange: (locale: Locale) => void;
  onNotify: (toast: ToastInput) => void;
  onProxySettingsChange: (settings: ProxySettings) => void;
  onSiteSettingsChange: (settings: SiteSettings) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  proxySettings: ProxySettings;
  siteSettings: SiteSettings;
  t: Messages;
  themeMode: ThemeMode;
}) {
  const [token, setToken] = useState(() => localStorage.getItem("htools_token") ?? "");
  const [password, setPassword] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [adminArticles, setAdminArticles] = useState<Article[]>([]);
  const [contentSources, setContentSources] = useState<ContentSource[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [adminCategorySettings, setAdminCategorySettings] =
    useState<AdminCategorySettings>(initialAdminCategorySettings);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingContentSource, setEditingContentSource] =
    useState<ContentSource | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [articleFormOpen, setArticleFormOpen] = useState(false);
  const [contentSourceFormOpen, setContentSourceFormOpen] = useState(false);
  const [adminView, setAdminView] = useState<AdminView>(() => getInitialAdminView());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("htools_admin_sidebar") === "collapsed"
  );
  const [adminSearch, setAdminSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");
  const [articleCategoryFilter, setArticleCategoryFilter] = useState("All");
  const [contentSearch, setContentSearch] = useState("");
  const [contentCategoryFilter, setContentCategoryFilter] = useState("All");
  const [contentSourceFilter, setContentSourceFilter] = useState("all");
  const [adminCategory, setAdminCategory] = useState("All");
  const [sortMode, setSortMode] = useState<"latest" | "name">("latest");
  const [form, setForm] = useState<ToolInput>(initialForm);
  const [toolTagText, setToolTagText] = useState(() =>
    formatTagInputText(initialForm.tags)
  );
  const [articleForm, setArticleForm] = useState<ArticleInput>(initialArticleForm);
  const [articleTagText, setArticleTagText] = useState(() =>
    formatTagInputText(initialArticleForm.tags)
  );
  const [contentSourceForm, setContentSourceForm] = useState<ContentSourceInput>(
    initialContentSourceForm
  );
  const [contentSourceTagText, setContentSourceTagText] = useState(() =>
    formatTagInputText(initialContentSourceForm.tags)
  );
  const [contentPreview, setContentPreview] = useState<FeedPreview | null>(null);
  const contentPreviewRef = useRef<HTMLDivElement>(null);
  const [status, setStatusEvent] = useState<{ id: number; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isArticleSaving, setIsArticleSaving] = useState(false);
  const [isContentSourceSaving, setIsContentSourceSaving] = useState(false);
  const [isContentPreviewing, setIsContentPreviewing] = useState(false);
  const [isGitHubMetadataLoading, setIsGitHubMetadataLoading] = useState(false);
  const [isGitHubMetadataPreviewLoading, setIsGitHubMetadataPreviewLoading] =
    useState(false);
  const [githubMetadataPreviewFailed, setGithubMetadataPreviewFailed] =
    useState(false);
  const [githubMetadataPreview, setGithubMetadataPreview] =
    useState<GitHubToolMetadata | null>(null);
  const [featuredUpdatingId, setFeaturedUpdatingId] = useState<string | null>(null);
  const [articlePublishUpdatingId, setArticlePublishUpdatingId] =
    useState<string | null>(null);
  const [pendingDeleteTool, setPendingDeleteTool] = useState<Tool | null>(null);
  const [pendingDeleteArticle, setPendingDeleteArticle] = useState<Article | null>(null);
  const [pendingDeleteContentSource, setPendingDeleteContentSource] =
    useState<ContentSource | null>(null);
  const [pendingCategoryAction, setPendingCategoryAction] =
    useState<PendingAdminCategoryAction | null>(null);
  const [pendingConvertItem, setPendingConvertItem] = useState<ContentItem | null>(null);
  const [convertArticleCategory, setConvertArticleCategory] = useState("");
  const [convertPublishMode, setConvertPublishMode] =
    useState<ConvertPublishMode>("published");
  const [categoryActionTarget, setCategoryActionTarget] = useState("");
  const [isDeletingTool, setIsDeletingTool] = useState(false);
  const [isDeletingArticle, setIsDeletingArticle] = useState(false);
  const [isDeletingContentSource, setIsDeletingContentSource] = useState(false);
  const [isApplyingCategoryAction, setIsApplyingCategoryAction] = useState(false);
  const [isLoadingTools, setIsLoadingTools] = useState(Boolean(token));
  const [isLoadingArticles, setIsLoadingArticles] = useState(Boolean(token));
  const [isLoadingContent, setIsLoadingContent] = useState(Boolean(token));
  const [hasLoadedTools, setHasLoadedTools] = useState(false);
  const [hasLoadedArticles, setHasLoadedArticles] = useState(false);
  const [hasLoadedContent, setHasLoadedContent] = useState(false);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [convertingItemId, setConvertingItemId] = useState<string | null>(null);
  const [sidebarAnimating, setSidebarAnimating] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openAdminMenu, setOpenAdminMenu] = useState<"locale" | "theme" | null>(null);
  const adminMenuRootRef = useRef<HTMLDivElement>(null);
  const lastGitHubMetadataUrl = useRef("");
  const lastAppliedGitHubMetadata = useRef<AppliedGitHubMetadata | null>(null);
  const githubMetadataRequestId = useRef(0);
  const convertingItemRef = useRef<string | null>(null);
  const sidebarAnimationTimer = useRef<number | null>(null);
  const adminStatusTimer = useRef<number | null>(null);
  const adminStatusSequence = useRef(0);
  const siteName = getSiteDisplayName(siteSettings);
  const siteSubtitle = getSiteSubtitle(siteSettings);
  const themeOptions: Array<{ label: string; value: ThemeMode }> = [
    { label: t.theme.light, value: "light" },
    { label: t.theme.dark, value: "dark" },
    { label: t.theme.system, value: "system" }
  ];
  const maintenanceText = getAdminMaintenanceText(locale);
  const articleText = getArticleText(locale);
  const contentText = getContentFlowText(locale);
  const categoryTopLabel = getAdminCategoryTopLabel(t);
  const isConvertingContentItem = Boolean(convertingItemId);
  const showAdminToolSkeletons = useLoadingSkeleton(isLoadingTools && !hasLoadedTools);
  const showAdminArticleSkeletons = useLoadingSkeleton(
    isLoadingArticles && !hasLoadedArticles
  );
  const showAdminContentSkeletons = useLoadingSkeleton(
    isLoadingContent && !hasLoadedContent
  );
  const canFillGitHubMetadata = isGitHubRepoUrl(form.url);
  const githubMetadataDetailText = getGitHubMetadataDetailText(t);
  const githubMetadataDetailItems = githubMetadataPreview
    ? [
        {
          label: githubMetadataDetailText.stars,
          value: formatGitHubCount(githubMetadataPreview.stars)
        },
        {
          label: githubMetadataDetailText.forks,
          value: formatGitHubCount(githubMetadataPreview.forks)
        },
        {
          label: githubMetadataDetailText.language,
          value: githubMetadataPreview.language || "-"
        },
        {
          label: githubMetadataDetailText.license,
          value: githubMetadataPreview.license || "-"
        },
        {
          label: githubMetadataDetailText.updatedAt,
          value: formatGitHubUpdatedAt(githubMetadataPreview.updatedAt) || "-"
        }
      ]
    : [];

  const setStatus = useCallback((message: string) => {
    if (!message) {
      setStatusEvent(null);
      return;
    }

    adminStatusSequence.current += 1;
    setStatusEvent({
      id: adminStatusSequence.current,
      message
    });
  }, []);

  async function fillGitHubMetadata(
    sourceUrl: string,
    options: {
      force?: boolean;
      notify?: boolean;
      overwrite?: boolean;
    } = {}
  ) {
    const {
      force = false,
      notify = true,
      overwrite = false
    } = options;
    const normalizedUrl = normalizeHttpUrlInput(sourceUrl);
    const repoPath = getGitHubRepoPath(normalizedUrl);

    if (!repoPath) {
      setIsGitHubMetadataPreviewLoading(false);
      return;
    }

    if (!force && lastGitHubMetadataUrl.current === normalizedUrl) {
      return;
    }

    const requestId = githubMetadataRequestId.current + 1;
    githubMetadataRequestId.current = requestId;
    setIsGitHubMetadataLoading(true);
    setIsGitHubMetadataPreviewLoading(true);
    setGithubMetadataPreviewFailed(false);

    try {
      const metadata = await loadGitHubToolMetadata(normalizedUrl, token);

      if (githubMetadataRequestId.current !== requestId) {
        return;
      }

      lastGitHubMetadataUrl.current = normalizedUrl;
      const previousMetadata = lastAppliedGitHubMetadata.current?.metadata ?? null;
      setForm((current) => {
        const currentUrl = normalizeHttpUrlInput(current.url);

        if (getGitHubRepoPath(currentUrl) !== repoPath) {
          return current;
        }

        return applyGitHubMetadataToForm(
          current,
          metadata,
          normalizedUrl,
          previousMetadata,
          overwrite
        );
      });
      lastAppliedGitHubMetadata.current = {
        metadata,
        url: normalizedUrl
      };
      setGithubMetadataPreview(metadata);
      setGithubMetadataPreviewFailed(false);

      if (notify) {
        setStatus(t.status.githubMetadataApplied);
      }
    } catch (error) {
      if (githubMetadataRequestId.current === requestId) {
        setGithubMetadataPreviewFailed(true);
      }
      if (notify) {
        setStatus(getLocalizedErrorMessage(error, t));
      }
    } finally {
      if (githubMetadataRequestId.current === requestId) {
        setIsGitHubMetadataLoading(false);
        setIsGitHubMetadataPreviewLoading(false);
      }
    }
  }

  function moveGitHubUrlFromName(value: string) {
    const normalizedUrl = normalizeHttpUrlInput(value);

    if (!getGitHubRepoPath(normalizedUrl)) {
      return false;
    }

    lastGitHubMetadataUrl.current = "";
    githubMetadataRequestId.current += 1;
    setIsGitHubMetadataLoading(false);
    setIsGitHubMetadataPreviewLoading(true);
    setGithubMetadataPreviewFailed(false);
    setGithubMetadataPreview(null);
    setForm((current) => ({
      ...current,
      name: "",
      url: normalizedUrl
    }));

    return true;
  }

  useEffect(() => {
    if (!formOpen || editingTool) {
      return;
    }

    const normalizedUrl = normalizeHttpUrlInput(form.url);

    if (!getGitHubRepoPath(normalizedUrl)) {
      setIsGitHubMetadataPreviewLoading(false);
      return;
    }

    setIsGitHubMetadataPreviewLoading(true);
    setGithubMetadataPreviewFailed(false);
    const timer = window.setTimeout(() => {
      void fillGitHubMetadata(normalizedUrl);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [editingTool, form.url, formOpen, token]);

  useEffect(() => {
    if (!formOpen || !editingTool) {
      return;
    }

    const normalizedUrl = normalizeHttpUrlInput(form.url);

    if (!getGitHubRepoPath(normalizedUrl)) {
      setIsGitHubMetadataPreviewLoading(false);
      return;
    }

    let cancelled = false;
    setIsGitHubMetadataPreviewLoading(true);
    setGithubMetadataPreviewFailed(false);
    const timer = window.setTimeout(async () => {
      try {
        const metadata = await loadGitHubToolMetadata(normalizedUrl, token);

        if (!cancelled) {
          setGithubMetadataPreview(metadata);
          setGithubMetadataPreviewFailed(false);
          setIsGitHubMetadataPreviewLoading(false);
        }
      } catch {
        if (!cancelled) {
          setGithubMetadataPreview(null);
          setGithubMetadataPreviewFailed(true);
          setIsGitHubMetadataPreviewLoading(false);
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [editingTool, form.url, formOpen, token]);

  async function refreshAdminCategories() {
    try {
      const settings = await loadAdminCategorySettings(token);
      setAdminCategorySettings(settings);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load categories.");
    }
  }

  async function rememberAdminCategory(
    scope: AdminCategoryScope,
    category: string
  ) {
    const nextSettings = addAdminCategorySetting(
      adminCategorySettings,
      scope,
      category
    );

    if (nextSettings === adminCategorySettings) {
      return;
    }

    setAdminCategorySettings(nextSettings);

    try {
      const saved = await saveAdminCategorySettings(
        { [scope]: nextSettings[scope] },
        token
      );
      setAdminCategorySettings(saved);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save category.");
    }
  }

  async function moveAdminCategory(
    scope: AdminCategoryScope,
    category: string
  ) {
    const currentCategories =
      scope === "tools"
        ? adminFilterCategories
        : scope === "articles"
          ? articleFilterCategories
          : contentFilterCategories;
    const nextOrder = moveAdminCategoryInList(
      currentCategories,
      category
    );

    if (
      nextOrder.length === adminCategorySettings[scope].length &&
      nextOrder.every((item, index) => item === adminCategorySettings[scope][index])
    ) {
      return;
    }

    const nextSettings = {
      ...adminCategorySettings,
      [scope]: nextOrder
    };

    setAdminCategorySettings(nextSettings);

    try {
      const saved = await saveAdminCategorySettings(
        { [scope]: nextOrder },
        token
      );
      setAdminCategorySettings(saved);
    } catch (error) {
      setAdminCategorySettings(adminCategorySettings);
      setStatus(error instanceof Error ? error.message : "Unable to save category.");
    }
  }

  async function deleteAdminCategory(
    scope: AdminCategoryScope,
    category: string
  ) {
    const normalized = normalizeAdminCategoryValue(category);

    if (isAllCategoryValue(normalized)) {
      setPendingCategoryAction({
        category: normalized,
        contentCount: getAdminCategoryContentCount(scope, normalized),
        scope
      });
      setCategoryActionTarget("");
      return;
    }

    if (scope === "tools" && isFeaturedCategoryValue(normalized)) {
      await applyCategoryAction(scope, normalized, "delete", "");
      return;
    }

    if (!isPersistableAdminCategory(normalized)) {
      return;
    }

    const contentCount = getAdminCategoryContentCount(scope, normalized);

    if (contentCount > 0) {
      setPendingCategoryAction({
        category: normalized,
        contentCount,
        scope
      });
      setCategoryActionTarget(getDefaultCategoryActionTarget(scope, normalized));
      return;
    }

    await applyCategoryAction(scope, normalized, "delete", "");
  }

  function getAdminCategoryContentCount(
    scope: AdminCategoryScope,
    category: string
  ) {
    const normalized = normalizeAdminCategoryValue(category);

    if (isAllCategoryValue(normalized)) {
      if (scope === "tools") {
        return tools.length;
      }

      if (scope === "articles") {
        return adminArticles.length;
      }

      return contentSources.length + contentItems.length;
    }

    if (scope === "tools") {
      if (isFeaturedCategoryValue(normalized)) {
        return tools.filter((tool) => tool.featured).length;
      }

      return tools.filter(
        (tool) => normalizeAdminCategoryValue(tool.category) === normalized
      ).length;
    }

    if (scope === "articles") {
      return adminArticles.filter(
        (article) => normalizeAdminCategoryValue(article.category) === normalized
      ).length;
    }

    const sourceCount = contentSources.filter(
      (source) => normalizeAdminCategoryValue(source.category) === normalized
    ).length;
    const itemCount = contentItems.filter(
      (item) => normalizeAdminCategoryValue(item.category) === normalized
    ).length;

    return sourceCount + itemCount;
  }

  function getCategoryActionOptions(
    scope: AdminCategoryScope,
    category: string
  ) {
    const normalized = normalizeAdminCategoryValue(category);

    if (isAllCategoryValue(normalized)) {
      return [];
    }

    const categories =
      scope === "tools"
        ? adminFilterCategories
        : scope === "articles"
          ? articleExistingCategories
          : contentExistingCategories;

    return categories.filter((item) => {
      const next = normalizeAdminCategoryValue(item);

      return (
        next &&
        next !== normalized &&
        next !== "All" &&
        next !== ADMIN_FEATURED_CATEGORY
      );
    });
  }

  function getDefaultCategoryActionTarget(
    scope: AdminCategoryScope,
    category: string
  ) {
    return getCategoryActionOptions(scope, category)[0] ?? "";
  }

  function syncCategoryStateAfterAction(
    scope: AdminCategoryScope,
    category: string,
    targetCategory: string
  ) {
    const normalized = normalizeAdminCategoryValue(category);
    const replacement = targetCategory
      ? normalizeAdminCategoryValue(targetCategory)
      : "";

    if (scope === "tools") {
      if (normalizeAdminCategoryValue(adminCategory) === normalized) {
        setAdminCategory(replacement || "All");
      }

      if (normalizeAdminCategoryValue(form.category) === normalized) {
        setForm((current) => ({ ...current, category: replacement }));
      }

      return;
    }

    if (scope === "articles") {
      if (normalizeAdminCategoryValue(articleCategoryFilter) === normalized) {
        setArticleCategoryFilter(replacement || "All");
      }

      if (normalizeAdminCategoryValue(articleForm.category) === normalized) {
        setArticleForm((current) => ({ ...current, category: replacement }));
      }

      if (normalizeAdminCategoryValue(convertArticleCategory) === normalized) {
        setConvertArticleCategory(replacement);
      }

      return;
    }

    if (normalizeAdminCategoryValue(contentCategoryFilter) === normalized) {
      setContentCategoryFilter(replacement || "All");
      setContentSourceFilter("all");
    }

    if (normalizeAdminCategoryValue(contentSourceForm.category) === normalized) {
      setContentSourceForm((current) => ({
        ...current,
        category: replacement
      }));
    }
  }

  async function applyCategoryAction(
    scope: AdminCategoryScope,
    category: string,
    action: AdminCategoryAction,
    targetCategory: string
  ) {
    const normalized = normalizeAdminCategoryValue(category);
    const target = targetCategory ? normalizeAdminCategoryValue(targetCategory) : "";

    if (action === "migrate") {
      if (!target || target === normalized || !isPersistableAdminCategory(target)) {
        setStatus(
          isChineseLocaleText(t)
            ? "请选择要迁移到的分类。"
            : "Choose a category to migrate into."
        );
        return;
      }
    }

    setIsApplyingCategoryAction(true);

    try {
      const result = await applyAdminCategoryAction(
        scope,
        normalized,
        action,
        target,
        token
      );

      setAdminCategorySettings(result.settings);
      syncCategoryStateAfterAction(
        scope,
        normalized,
        action === "migrate" ? target : ""
      );
      setPendingCategoryAction(null);
      setCategoryActionTarget("");

      if (scope === "tools") {
        await refresh();
      } else if (scope === "articles") {
        await refreshArticles();
        await refreshContent();
      } else {
        await refreshContent();
      }

      setStatus(
        action === "migrate"
          ? getAdminCategoryMigratedText(t, normalized, target, result.affected)
          : getAdminCategoryDeletedText(t, normalized, scope)
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update category.");
    } finally {
      setIsApplyingCategoryAction(false);
    }
  }

  const adminFilterCategories = useMemo(() => {
    const names = sortCategoriesBySettings(
      [
        ...adminCategorySettings.tools,
        ...tools.map((tool) => tool.category),
        adminCategory
      ],
      adminCategorySettings.tools,
      t
    );

    return ["All", ADMIN_FEATURED_CATEGORY, ...names];
  }, [adminCategory, adminCategorySettings.tools, t, tools]);
  useEffect(() => {
    const normalizedAdminCategory = normalizeAdminCategoryValue(adminCategory);

    if (adminCategory !== normalizedAdminCategory) {
      setAdminCategory(normalizedAdminCategory);
      return;
    }

    if (!adminFilterCategories.includes(normalizedAdminCategory)) {
      setAdminCategory("All");
    }
  }, [adminCategory, adminFilterCategories]);
  useEffect(() => {
    localStorage.setItem(
      "htools_admin_sidebar",
      sidebarCollapsed ? "collapsed" : "expanded"
    );
  }, [sidebarCollapsed]);
  const visibleTools = useMemo(() => {
    const query = adminSearch.trim().toLowerCase();
    const filtered = tools.filter((tool) => {
      const matchesCategory =
        isAllCategoryValue(adminCategory) ||
        (isFeaturedCategoryValue(adminCategory)
          ? tool.featured
          : tool.category === adminCategory);
      const matchesQuery =
        !query ||
          [
            tool.name,
            tool.description,
            tool.url,
            tool.demoUrl,
            tool.category,
            ...tool.tags
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

      return matchesCategory && matchesQuery;
    });

    return filtered.sort((left, right) => {
      if (sortMode === "name") {
        return left.name.localeCompare(right.name);
      }

      return (right.created_at ?? "").localeCompare(left.created_at ?? "");
    });
  }, [adminCategory, adminSearch, sortMode, tools]);
  const articleExistingCategories = useMemo(() => {
    const names = sortCategoriesBySettings(
      [
        ...adminCategorySettings.articles,
        ...adminArticles.map((article) => article.category)
      ],
      adminCategorySettings.articles,
      t
    );

    return names;
  }, [adminArticles, adminCategorySettings.articles, t]);
  const articleFilterCategories = useMemo(
    () =>
      Array.from(
        new Set(
          ["All", ...articleExistingCategories, articleCategoryFilter]
            .map(normalizeAdminCategoryValue)
            .filter(Boolean)
        )
      ),
    [articleCategoryFilter, articleExistingCategories]
  );
  const articleCategoryOptions = useMemo(
    () =>
      sortCategoriesBySettings(
        [
          ...articleExistingCategories,
          articleCategoryFilter,
          articleForm.category,
          convertArticleCategory
        ],
        adminCategorySettings.articles,
        t
      ),
    [
      adminCategorySettings.articles,
      articleCategoryFilter,
      articleExistingCategories,
      articleForm.category,
      convertArticleCategory,
      t
    ]
  );
  const visibleArticles = useMemo(() => {
    const query = articleSearch.trim().toLowerCase();
    const filtered = adminArticles.filter((article) => {
      const matchesCategory =
        isAllCategoryValue(articleCategoryFilter) ||
        normalizeAdminCategoryValue(article.category) === articleCategoryFilter;
      const matchesQuery =
        !query ||
        [
          article.title,
          article.summary,
          article.content,
          article.slug,
          article.category,
          ...article.tags
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesQuery;
    });

    return filtered.sort((left, right) => {
      if (sortMode === "name") {
        return left.title.localeCompare(right.title);
      }

      return getArticleTimestamp(right) - getArticleTimestamp(left);
    });
  }, [adminArticles, articleCategoryFilter, articleSearch, sortMode]);
  useEffect(() => {
    const normalizedArticleCategory =
      normalizeAdminCategoryValue(articleCategoryFilter);

    if (articleCategoryFilter !== normalizedArticleCategory) {
      setArticleCategoryFilter(normalizedArticleCategory);
      return;
    }

    if (!articleFilterCategories.includes(normalizedArticleCategory)) {
      setArticleCategoryFilter("All");
    }
  }, [articleCategoryFilter, articleFilterCategories]);
  const contentExistingCategories = useMemo(() => {
    const names = sortCategoriesBySettings(
      [
        ...adminCategorySettings.content,
        ...contentSources.map((source) => source.category),
        ...contentItems.map((item) => item.category)
      ],
      adminCategorySettings.content,
      t
    );

    return names;
  }, [adminCategorySettings.content, contentItems, contentSources, t]);
  const contentCategoryOptions = useMemo(
    () =>
      sortCategoriesBySettings(
        [
          ...contentExistingCategories,
          contentCategoryFilter,
          contentSourceForm.category
        ],
        adminCategorySettings.content,
        t
      ),
    [
      adminCategorySettings.content,
      contentCategoryFilter,
      contentExistingCategories,
      contentSourceForm.category,
      t
    ]
  );
  const contentFilterCategories = useMemo(
    () =>
      Array.from(
        new Set(
          ["All", ...contentExistingCategories, contentCategoryFilter]
            .map(normalizeAdminCategoryValue)
            .filter(Boolean)
        )
      ),
    [contentCategoryFilter, contentExistingCategories]
  );
  const contentItemsForCategory = useMemo(() => {
    if (isAllCategoryValue(contentCategoryFilter)) {
      return contentItems;
    }

    return contentItems.filter(
      (item) => normalizeAdminCategoryValue(item.category) === contentCategoryFilter
    );
  }, [contentCategoryFilter, contentItems]);
  const contentSourceCounts = useMemo(() => {
    return contentItemsForCategory.reduce<Record<string, number>>((counts, item) => {
      counts[item.sourceId] = (counts[item.sourceId] ?? 0) + 1;
      return counts;
    }, {});
  }, [contentItemsForCategory]);
  const visibleContentSources = useMemo(() => {
    if (isAllCategoryValue(contentCategoryFilter)) {
      return contentSources;
    }

    return contentSources.filter(
      (source) =>
        normalizeAdminCategoryValue(source.category) === contentCategoryFilter
    );
  }, [contentCategoryFilter, contentSources]);
  const visibleContentItems = useMemo(() => {
    const query = contentSearch.trim().toLowerCase();
    const filtered = contentItems.filter((item) => {
      const matchesCategory =
        isAllCategoryValue(contentCategoryFilter) ||
        normalizeAdminCategoryValue(item.category) === contentCategoryFilter;
      const matchesSource =
        contentSourceFilter === "all" || item.sourceId === contentSourceFilter;
      const matchesQuery =
        !query ||
        [
          item.title,
          item.summary,
          item.content,
          item.url,
          item.author,
          item.sourceTitle,
          item.category,
          ...item.tags
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSource && matchesQuery;
    });

    return sortContentItems(filtered);
  }, [contentCategoryFilter, contentItems, contentSearch, contentSourceFilter]);
  useEffect(() => {
    const normalizedContentCategory =
      normalizeAdminCategoryValue(contentCategoryFilter);

    if (contentCategoryFilter !== normalizedContentCategory) {
      setContentCategoryFilter(normalizedContentCategory);
      return;
    }

    if (!contentFilterCategories.includes(normalizedContentCategory)) {
      setContentCategoryFilter("All");
    }
  }, [contentCategoryFilter, contentFilterCategories]);
  useEffect(() => {
    if (
      contentSourceFilter !== "all" &&
      !visibleContentSources.some((source) => source.id === contentSourceFilter)
    ) {
      setContentSourceFilter("all");
    }
  }, [contentSourceFilter, visibleContentSources]);
  const adminCategoryOptions = useMemo(
    () =>
      sortCategoriesBySettings(
        [
          ...adminFilterCategories,
          form.category,
          initialForm.category
        ],
        adminCategorySettings.tools,
        t
      ),
    [adminCategorySettings.tools, adminFilterCategories, form.category, t]
  );

  async function refresh() {
    setIsLoadingTools(true);

    try {
      const result = await loadTools();
      setTools(result.tools);
      if (result.error) {
        setStatus(result.error);
      }
    } finally {
      setHasLoadedTools(true);
      setIsLoadingTools(false);
    }
  }

  async function refreshArticles() {
    setIsLoadingArticles(true);

    try {
      const nextArticles = await loadAdminArticles(token);
      setAdminArticles(sortArticlesByUpdatedAt(nextArticles));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load articles.");
    } finally {
      setHasLoadedArticles(true);
      setIsLoadingArticles(false);
    }
  }

  async function refreshContent() {
    setIsLoadingContent(true);

    try {
      const [nextSources, nextItems] = await Promise.all([
        loadContentSources(token),
        loadContentItems(token)
      ]);
      setContentSources(nextSources);
      setContentItems(sortContentItems(nextItems));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load content flow.");
    } finally {
      setHasLoadedContent(true);
      setIsLoadingContent(false);
    }
  }

  useEffect(() => {
    if (!token) {
      setTools([]);
      setAdminArticles([]);
      setContentSources([]);
      setContentItems([]);
      setAdminCategorySettings(initialAdminCategorySettings);
      setIsLoadingTools(false);
      setIsLoadingArticles(false);
      setIsLoadingContent(false);
      setHasLoadedTools(false);
      setHasLoadedArticles(false);
      setHasLoadedContent(false);
      return;
    }

    setHasLoadedTools(false);
    setHasLoadedArticles(false);
    setHasLoadedContent(false);
    void refreshAdminCategories();
    void refresh();
    void refreshArticles();
    void refreshContent();
  }, [token]);

  useLayoutEffect(() => {
    document.documentElement.classList.add("admin-route");

    return () => {
      document.documentElement.classList.remove("admin-route");
    };
  }, []);

  useEffect(() => {
    const nextPath = getAdminPath(adminView);

    if (window.location.pathname !== nextPath || window.location.search) {
      window.history.replaceState(null, "", `${nextPath}${window.location.hash}`);
    }
  }, []);

  useEffect(() => {
    function handlePopState() {
      setAdminView(getInitialAdminView());
      setMobileSidebarOpen(false);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (sidebarAnimationTimer.current) {
        window.clearTimeout(sidebarAnimationTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    if (!openAdminMenu) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (adminMenuRootRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpenAdminMenu(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenAdminMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openAdminMenu]);

  useEffect(() => {
    if (!token || !status) {
      return;
    }

    if (adminStatusTimer.current) {
      window.clearTimeout(adminStatusTimer.current);
    }

    adminStatusTimer.current = window.setTimeout(() => {
      setStatusEvent(null);
      adminStatusTimer.current = null;
    }, 5000);

    return () => {
      if (adminStatusTimer.current) {
        window.clearTimeout(adminStatusTimer.current);
        adminStatusTimer.current = null;
      }
    };
  }, [status?.id, token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    try {
      const nextToken = await login(password);
      localStorage.setItem("htools_token", nextToken);
      setToken(nextToken);
      setPassword("");
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    }
  }

  function toggleSidebar() {
    if (window.matchMedia("(max-width: 920px)").matches) {
      setMobileSidebarOpen((open) => !open);
      return;
    }

    setSidebarCollapsed((collapsed) => !collapsed);
    setSidebarAnimating(true);

    if (sidebarAnimationTimer.current) {
      window.clearTimeout(sidebarAnimationTimer.current);
    }

    sidebarAnimationTimer.current = window.setTimeout(() => {
      setSidebarAnimating(false);
      sidebarAnimationTimer.current = null;
    }, 320);
  }

  function selectAdminView(nextView: AdminView) {
    const nextPath = getAdminPath(nextView);

    if (window.location.pathname !== nextPath || window.location.search) {
      window.history.pushState(null, "", nextPath);
    }

    resetAdminViewFilters(nextView);
    setAdminView(nextView);
    setMobileSidebarOpen(false);
  }

  function resetAdminViewFilters(nextView: AdminView) {
    if (nextView === "tools") {
      setAdminCategory("All");
      setAdminSearch("");
      return;
    }

    if (nextView === "articles") {
      setArticleCategoryFilter("All");
      setArticleSearch("");
      return;
    }

    if (nextView === "content") {
      setContentCategoryFilter("All");
      setContentSourceFilter("all");
      setContentSearch("");
    }
  }

  function openCreate() {
    const category =
      isAllCategoryValue(adminCategory) || isFeaturedCategoryValue(adminCategory)
        ? initialForm.category
        : adminCategory;

    setEditingTool(null);
    setForm({ ...initialForm, category });
    setToolTagText(formatTagInputText(initialForm.tags));
    lastGitHubMetadataUrl.current = "";
    lastAppliedGitHubMetadata.current = null;
    githubMetadataRequestId.current += 1;
    setIsGitHubMetadataLoading(false);
    setIsGitHubMetadataPreviewLoading(false);
    setGithubMetadataPreviewFailed(false);
    setGithubMetadataPreview(null);
    setFormOpen(true);
  }

  function openEdit(tool: Tool) {
    const nextForm = normalizeForm(tool);

    setEditingTool(tool);
    setForm(nextForm);
    setToolTagText(formatTagInputText(nextForm.tags));
    lastGitHubMetadataUrl.current = normalizeHttpUrlInput(tool.url);
    lastAppliedGitHubMetadata.current = null;
    githubMetadataRequestId.current += 1;
    setIsGitHubMetadataLoading(false);
    setIsGitHubMetadataPreviewLoading(isGitHubRepoUrl(tool.url));
    setGithubMetadataPreviewFailed(false);
    setGithubMetadataPreview(null);
    setFormOpen(true);
  }

  function closeToolEditor() {
    githubMetadataRequestId.current += 1;
    lastAppliedGitHubMetadata.current = null;
    setIsGitHubMetadataLoading(false);
    setIsGitHubMetadataPreviewLoading(false);
    setGithubMetadataPreviewFailed(false);
    setGithubMetadataPreview(null);
    setFormOpen(false);
  }

  function openCreateArticle() {
    const category = isAllCategoryValue(articleCategoryFilter)
      ? ""
      : articleCategoryFilter;

    setEditingArticle(null);
    setArticleForm({ ...initialArticleForm, category });
    setArticleTagText(formatTagInputText(initialArticleForm.tags));
    setArticleFormOpen(true);
  }

  function openEditArticle(article: Article) {
    const nextForm = normalizeArticleForm(article);

    setEditingArticle(article);
    setArticleForm(nextForm);
    setArticleTagText(formatTagInputText(nextForm.tags));
    setArticleFormOpen(true);
  }

  function openCreateContentSource() {
    const category = isAllCategoryValue(contentCategoryFilter)
      ? ""
      : contentCategoryFilter;

    setEditingContentSource(null);
    setContentSourceForm({ ...initialContentSourceForm, category });
    setContentSourceTagText(formatTagInputText(initialContentSourceForm.tags));
    setContentPreview(null);
    setContentSourceFormOpen(true);
  }

  function openEditContentSource(source: ContentSource) {
    const nextForm = normalizeContentSourceForm(source);

    setEditingContentSource(source);
    setContentSourceForm(nextForm);
    setContentSourceTagText(formatTagInputText(nextForm.tags));
    setContentPreview(null);
    setContentSourceFormOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    githubMetadataRequestId.current += 1;
    setIsGitHubMetadataLoading(false);
    setIsSaving(true);
    setStatus("");

    try {
      const normalizedUrl = normalizeHttpUrlInput(form.url);
      const normalizedDemoUrl = normalizeHttpUrlInput(form.demoUrl);
      const normalizedImage = normalizeHttpUrlInput(form.image);
      const tags = parseArticleTagsInput(toolTagText);
      const payload = {
        ...form,
        url: normalizedUrl,
        demoUrl: normalizedDemoUrl,
        image: normalizedImage || createImageFromUrl(normalizedUrl),
        tags
      };

      if (editingTool) {
        await updateTool(editingTool.id, payload, token);
        setStatus(t.status.toolUpdated);
      } else {
        await createTool(payload, token);
        setStatus(t.status.toolCreated);
      }

      closeToolEditor();
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    const category = normalizeAdminCategoryValue(articleForm.category);

    if (!category || isAllCategoryValue(category) || isFeaturedCategoryValue(category)) {
      setStatus(articleText.categoryRequired);
      return;
    }

    setIsArticleSaving(true);

    try {
      const normalizedCoverImage = normalizeHttpUrlInput(articleForm.coverImage);
      const tags = parseArticleTagsInput(articleTagText);
      const payload = {
        ...articleForm,
        category,
        coverImage: normalizedCoverImage,
        publishedAt: datetimeLocalToIso(articleForm.publishedAt),
        slug: normalizeSlugInput(articleForm.slug),
        tags
      };

      if (editingArticle) {
        await updateArticle(editingArticle.id, payload, token);
        setStatus(articleText.updated);
      } else {
        await createArticle(payload, token);
        setStatus(articleText.created);
      }

      setArticleFormOpen(false);
      await refreshArticles();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.saveFailed);
    } finally {
      setIsArticleSaving(false);
    }
  }

  async function handlePreviewContentSource() {
    setIsContentPreviewing(true);
    setStatus("");

    try {
      const tags = parseArticleTagsInput(contentSourceTagText);
      const payload = {
        ...contentSourceForm,
        url: normalizeHttpUrlInput(contentSourceForm.url),
        tags
      };
      const preview = await previewContentSource(payload, token);
      setContentPreview(preview);
      setStatus(
        isChineseLocaleText(t)
          ? `预览已加载，共 ${preview.items.length} 条内容。`
          : `Preview loaded with ${preview.items.length} items.`
      );

      if (!contentSourceForm.title.trim()) {
        setContentSourceForm((current) => ({
          ...current,
          title: preview.title
        }));
      }

      window.requestAnimationFrame(() => {
        contentPreviewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.saveFailed);
    } finally {
      setIsContentPreviewing(false);
    }
  }

  async function handleSaveContentSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    const category = normalizeAdminCategoryValue(contentSourceForm.category);

    if (!category || isAllCategoryValue(category) || isFeaturedCategoryValue(category)) {
      setStatus(contentText.categoryRequired);
      return;
    }

    setIsContentSourceSaving(true);

    try {
      const tags = parseArticleTagsInput(contentSourceTagText);
      const payload = {
        ...contentSourceForm,
        category,
        url: normalizeHttpUrlInput(contentSourceForm.url),
        tags
      };
      const savedSource = editingContentSource
        ? await updateContentSource(editingContentSource.id, payload, token)
        : await createContentSource(payload, token);

      setContentSourceFormOpen(false);

      if (!editingContentSource) {
        setSyncingSourceId(savedSource.id);
        const result = await syncContentSource(savedSource.id, token);
        setStatus(contentText.synced(result.imported, result.updated));
      } else {
        setStatus(contentText.saved);
      }

      await refreshContent();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.saveFailed);
    } finally {
      setSyncingSourceId(null);
      setIsContentSourceSaving(false);
    }
  }

  async function handleSyncContentSource(source: ContentSource) {
    if (!source.category.trim()) {
      setStatus(contentText.categoryRequired);
      return;
    }

    setSyncingSourceId(source.id);
    setStatus("");

    try {
      const result = await syncContentSource(source.id, token);
      setStatus(contentText.synced(result.imported, result.updated));
      await refreshContent();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.saveFailed);
    } finally {
      setSyncingSourceId(null);
    }
  }

  async function handleDelete(tool: Tool) {
    setIsDeletingTool(true);
    try {
      await deleteTool(tool.id, token);
      setStatus(t.status.toolDeleted);
      setPendingDeleteTool(null);
      await refresh();
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.deleteFailed);
      return false;
    } finally {
      setIsDeletingTool(false);
    }
  }

  async function handleDeleteArticle(article: Article) {
    setIsDeletingArticle(true);

    try {
      await deleteArticle(article.id, token);
      setStatus(articleText.deleted);
      setPendingDeleteArticle(null);
      await refreshArticles();
      await refreshContent();
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.deleteFailed);
      return false;
    } finally {
      setIsDeletingArticle(false);
    }
  }

  async function handleDeleteContentSource(source: ContentSource) {
    setIsDeletingContentSource(true);

    try {
      await deleteContentSource(source.id, token);
      setStatus(contentText.deleted);
      setPendingDeleteContentSource(null);
      setContentSourceFilter((current) => (current === source.id ? "all" : current));
      await refreshContent();
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.deleteFailed);
      return false;
    } finally {
      setIsDeletingContentSource(false);
    }
  }

  function openConvertContentItem(item: ContentItem) {
    if (item.articleId || convertingItemRef.current) {
      return;
    }

    const itemCategory = normalizeAdminCategoryValue(item.category);
    const initialCategory = !isAllCategoryValue(articleCategoryFilter)
      ? articleCategoryFilter
      : articleExistingCategories.includes(itemCategory)
        ? itemCategory
        : "";

    setPendingConvertItem(item);
    setConvertArticleCategory(initialCategory);
    setConvertPublishMode("published");
  }

  async function handleConvertContentItem(
    item: ContentItem,
    categoryValue: string,
    publishMode: ConvertPublishMode
  ) {
    if (convertingItemRef.current) {
      return;
    }

    const category = normalizeAdminCategoryValue(categoryValue);

    if (!category || isAllCategoryValue(category) || isFeaturedCategoryValue(category)) {
      setStatus(contentText.convertCategoryRequired);
      return;
    }

    convertingItemRef.current = item.id;
    setConvertingItemId(item.id);
    setStatus("");

    try {
      const shouldPublish = publishMode === "published";
      const article = await convertContentItemToArticle(
        item.id,
        category,
        shouldPublish,
        token
      );
      setContentItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                articleId: article.id,
                articleSlug: article.slug,
                articlePublished: article.published
              }
            : entry
        )
      );
      setPendingConvertItem(null);
      setConvertArticleCategory("");
      setConvertPublishMode("published");
      setStatus(
        shouldPublish
          ? contentText.convertedPublishedDone
          : contentText.convertedDraftDone
      );
      await refreshArticles();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.saveFailed);
    } finally {
      convertingItemRef.current = null;
      setConvertingItemId(null);
    }
  }

  async function handleToggleFeatured(tool: Tool) {
    const nextFeatured = !tool.featured;
    setFeaturedUpdatingId(tool.id);
    setStatus("");

    try {
      const updatedTool = await updateTool(
        tool.id,
        {
          ...normalizeForm(tool),
          featured: nextFeatured
        },
        token
      );
      setTools((current) =>
        current.map((item) => (item.id === updatedTool.id ? updatedTool : item))
      );
      setStatus(
        nextFeatured ? t.status.featuredEnabled : t.status.featuredDisabled
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.saveFailed);
    } finally {
      setFeaturedUpdatingId(null);
    }
  }

  async function handleToggleArticlePublished(article: Article) {
    const nextPublished = !article.published;
    setArticlePublishUpdatingId(article.id);
    setStatus("");

    try {
      const updatedArticle = await updateArticle(
        article.id,
        {
          slug: article.slug,
          title: article.title,
          summary: article.summary,
          content: article.content,
          coverImage: article.coverImage,
          category: article.category,
          tags: article.tags,
          published: nextPublished,
          publishedAt: article.publishedAt ?? article.published_at ?? ""
        },
        token
      );

      setAdminArticles((current) =>
        sortArticlesByUpdatedAt(
          current.map((item) =>
            item.id === updatedArticle.id ? updatedArticle : item
          )
        )
      );
      setStatus(
        nextPublished ? articleText.publishedDone : articleText.draftedDone
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.status.saveFailed);
    } finally {
      setArticlePublishUpdatingId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("htools_token");
    setToken("");
  }

  if (!token) {
    return (
      <div className="admin-shell auth-shell">
        <section className="auth-card">
          <div className="auth-card-actions" ref={adminMenuRootRef}>
            <button className="ghost-button compact" type="button" onClick={onBackHome}>
              {t.actions.backHome}
            </button>
            <div className="auth-menu-actions">
              <div className="menu-control">
                <button
                  className="icon-button locale-button"
                  type="button"
                  aria-label={t.actions.toggleLanguage}
                  aria-expanded={openAdminMenu === "locale"}
                  onClick={() =>
                    setOpenAdminMenu((value) => (value === "locale" ? null : "locale"))
                  }
                >
                  <Languages size={17} />
                </button>
                {openAdminMenu === "locale" ? (
                  <div className="floating-menu language-menu" role="menu">
                    {localeOptions.map((option) => (
                      <button
                        className="menu-option"
                        key={option.code}
                        type="button"
                        onClick={() => {
                          onLocaleChange(option.code);
                          setOpenAdminMenu(null);
                        }}
                      >
                        <span>{option.label}</span>
                        {option.code === locale ? <Check size={16} /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="menu-control">
                <button
                  className="icon-button"
                  type="button"
                  aria-label={t.actions.toggleTheme}
                  aria-expanded={openAdminMenu === "theme"}
                  onClick={() =>
                    setOpenAdminMenu((value) => (value === "theme" ? null : "theme"))
                  }
                >
                  <Sun size={17} />
                </button>
                {openAdminMenu === "theme" ? (
                  <div className="floating-menu theme-menu" role="menu">
                    {themeOptions.map((option) => (
                      <button
                        className="menu-option"
                        key={option.value}
                        type="button"
                        onClick={() => {
                          onThemeChange(option.value);
                          setOpenAdminMenu(null);
                        }}
                      >
                        <span>{option.label}</span>
                        {option.value === themeMode ? <Check size={16} /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="auth-heading">
            <SiteBrandMark className="auth-mark" />
            <div>
              <h1>{t.admin.title}</h1>
              <p>{t.admin.description}</p>
            </div>
          </div>
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              {t.admin.password}
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="ADMIN_PASSWORD"
                type="password"
                required
              />
            </label>
            <button className="primary-button wide" type="submit">
              {t.actions.login}
            </button>
          </form>
          {status ? <p className="form-status">{status.message}</p> : null}
        </section>
      </div>
    );
  }

  const activeTitle =
    adminView === "articles"
      ? articleText.adminNav
      : adminView === "content"
        ? contentText.nav
      : adminView === "check"
      ? maintenanceText.title
      : adminView === "system"
        ? maintenanceText.systemTitle
        : t.admin.toolLibrary;
  const pendingCategoryIsAll = pendingCategoryAction
    ? isAllCategoryValue(pendingCategoryAction.category)
    : false;

  return (
    <div
      className={`admin-workspace ${sidebarCollapsed ? "is-sidebar-collapsed" : ""} ${
        sidebarAnimating ? "is-sidebar-animating" : ""
      } ${mobileSidebarOpen ? "is-mobile-sidebar-open" : ""}`}
    >
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <button className="admin-brand" type="button" onClick={onBackHome}>
            <SiteBrandMark className="compact-mark" />
            <span>
              <strong>{siteName}</strong>
              <small>{siteSubtitle}</small>
            </span>
          </button>
          <button
            className="admin-mobile-sidebar-close"
            type="button"
            aria-label={t.actions.close}
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={26} />
          </button>
        </div>

        <nav className="admin-sidebar-nav" aria-label={t.admin.dashboard}>
          <span className="admin-sidebar-section">{t.admin.platform}</span>
          <button
            className={adminView === "tools" ? "is-active" : ""}
            type="button"
            onClick={() => selectAdminView("tools")}
          >
            <Link2 size={18} />
            <span>{t.admin.toolLibrary}</span>
          </button>
          <button
            className={adminView === "articles" ? "is-active" : ""}
            type="button"
            onClick={() => selectAdminView("articles")}
          >
            <FileText size={18} />
            <span>{articleText.adminNav}</span>
          </button>
          <button
            className={adminView === "content" ? "is-active" : ""}
            type="button"
            onClick={() => selectAdminView("content")}
          >
            <Rss size={18} />
            <span>{contentText.nav}</span>
          </button>

          <span className="admin-sidebar-section">{t.admin.settings}</span>
          <button
            className={adminView === "check" ? "is-active" : ""}
            type="button"
            onClick={() => selectAdminView("check")}
          >
            <ShieldCheck size={18} />
            <span>{maintenanceText.title}</span>
          </button>
          <button
            className={adminView === "system" ? "is-active" : ""}
            type="button"
            onClick={() => selectAdminView("system")}
          >
            <Settings size={18} />
            <span>{maintenanceText.systemTitle}</span>
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-utility" ref={adminMenuRootRef}>
            <div className="menu-control admin-utility-menu">
              <button
                className="icon-button"
                type="button"
                aria-label={t.actions.toggleLanguage}
                aria-expanded={openAdminMenu === "locale"}
                onClick={() =>
                  setOpenAdminMenu((value) => (value === "locale" ? null : "locale"))
                }
              >
                <Languages size={17} />
              </button>
              {openAdminMenu === "locale" ? (
                <div className="floating-menu language-menu" role="menu">
                  {localeOptions.map((option) => (
                    <button
                      className="menu-option"
                      key={option.code}
                      type="button"
                      onClick={() => {
                        onLocaleChange(option.code);
                        setOpenAdminMenu(null);
                      }}
                    >
                      <span>{option.label}</span>
                      {option.code === locale ? <Check size={16} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="menu-control admin-utility-menu">
              <button
                className="icon-button"
                type="button"
                aria-label={t.actions.toggleTheme}
                aria-expanded={openAdminMenu === "theme"}
                onClick={() =>
                  setOpenAdminMenu((value) => (value === "theme" ? null : "theme"))
                }
              >
                <Sun size={17} />
              </button>
              {openAdminMenu === "theme" ? (
                <div className="floating-menu theme-menu" role="menu">
                  {themeOptions.map((option) => (
                    <button
                      className="menu-option"
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onThemeChange(option.value);
                        setOpenAdminMenu(null);
                      }}
                    >
                      <span>{option.label}</span>
                      {option.value === themeMode ? <Check size={16} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="admin-user-card">
            <span className="admin-user-card-copy">
              <strong>{t.admin.rootUser}</strong>
              <small>{t.admin.directoryService}</small>
            </span>
            <button
              className="icon-button"
              type="button"
              onClick={handleLogout}
              aria-label={t.actions.logout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <button
        className="admin-mobile-sidebar-overlay"
        type="button"
        aria-label={t.actions.close}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <button
              className={`admin-sidebar-toggle ${sidebarAnimating ? "is-toggling" : ""}`}
              type="button"
              aria-label={
                sidebarCollapsed ? t.admin.expandSidebar : t.admin.collapseSidebar
              }
              title={sidebarCollapsed ? t.admin.expandSidebar : t.admin.collapseSidebar}
              onClick={toggleSidebar}
            >
              <PanelLeft size={18} />
            </button>
            <span>{t.admin.dashboard}</span>
            <ChevronRight size={15} />
            <strong>{activeTitle}</strong>
          </div>

          <div className="admin-topbar-actions">
            {adminView === "tools" ? (
              <div className="admin-command-row">
                <button
                  className="ghost-button admin-create-button"
                  type="button"
                  onClick={openCreate}
                >
                  <Plus size={16} />
                  <span>{t.actions.addTool}</span>
                </button>
                <button
                  className="ghost-button admin-sort-button"
                  type="button"
                  aria-label={sortMode === "latest" ? t.admin.sortLatest : t.admin.sortName}
                  title={sortMode === "latest" ? t.admin.sortLatest : t.admin.sortName}
                  onClick={() =>
                    setSortMode((current) => (current === "latest" ? "name" : "latest"))
                  }
                >
                  <ArrowDownUp size={16} />
                  <span className="admin-sort-label">
                    {sortMode === "latest" ? t.admin.sortLatest : t.admin.sortName}
                  </span>
                </button>
              </div>
            ) : null}
            {adminView === "articles" ? (
              <div className="admin-command-row">
                <button
                  className="ghost-button admin-create-button"
                  type="button"
                  onClick={openCreateArticle}
                >
                  <Plus size={16} />
                  <span>{articleText.addArticle}</span>
                </button>
                <button
                  className="ghost-button admin-sort-button"
                  type="button"
                  aria-label={sortMode === "latest" ? t.admin.sortLatest : t.admin.sortName}
                  title={sortMode === "latest" ? t.admin.sortLatest : t.admin.sortName}
                  onClick={() =>
                    setSortMode((current) => (current === "latest" ? "name" : "latest"))
                  }
                >
                  <ArrowDownUp size={16} />
                  <span className="admin-sort-label">
                    {sortMode === "latest" ? t.admin.sortLatest : t.admin.sortName}
                  </span>
                </button>
              </div>
            ) : null}
            {adminView === "content" ? (
              <div className="admin-command-row">
                <button
                  className="ghost-button admin-create-button"
                  type="button"
                  onClick={openCreateContentSource}
                >
                  <Plus size={16} />
                  <span>{contentText.addSource}</span>
                </button>
              </div>
            ) : null}
            {adminView === "tools" ? (
              <div className="admin-filter-row">
                <AdminCategoryFilter
                  allLabel={categoryTopLabel}
                  categories={adminFilterCategories}
                  onDeleteCategory={(category) =>
                    void deleteAdminCategory("tools", category)
                  }
                  onMoveCategory={(category) =>
                    void moveAdminCategory("tools", category)
                  }
                  onChange={(category) => {
                    setAdminCategory(category);
                    void rememberAdminCategory("tools", category);
                  }}
                  t={t}
                  value={adminCategory}
                />
                <label className="admin-search-field">
                  <Search size={16} />
                  <input
                    value={adminSearch}
                    onChange={(event) => setAdminSearch(event.target.value)}
                    placeholder={t.admin.searchPlaceholder}
                  />
                </label>
              </div>
            ) : null}
            {adminView === "articles" ? (
              <div className="admin-filter-row">
                <AdminCategoryFilter
                  allLabel={categoryTopLabel}
                  categories={articleFilterCategories}
                  onDeleteCategory={(category) =>
                    void deleteAdminCategory("articles", category)
                  }
                  onMoveCategory={(category) =>
                    void moveAdminCategory("articles", category)
                  }
                  onChange={(category) => {
                    setArticleCategoryFilter(category);
                    void rememberAdminCategory("articles", category);
                  }}
                  t={t}
                  value={articleCategoryFilter}
                />
                <label className="admin-search-field">
                  <Search size={16} />
                  <input
                    value={articleSearch}
                    onChange={(event) => setArticleSearch(event.target.value)}
                    placeholder={articleText.searchPlaceholder}
                  />
                </label>
              </div>
            ) : null}
            {adminView === "content" ? (
              <div className="admin-filter-row">
                <AdminCategoryFilter
                  allLabel={categoryTopLabel}
                  categories={contentFilterCategories}
                  onDeleteCategory={(category) =>
                    void deleteAdminCategory("content", category)
                  }
                  onMoveCategory={(category) =>
                    void moveAdminCategory("content", category)
                  }
                  onChange={(category) => {
                    setContentCategoryFilter(category);
                    setContentSourceFilter("all");
                    void rememberAdminCategory("content", category);
                  }}
                  t={t}
                  value={contentCategoryFilter}
                />
                <label className="admin-search-field">
                  <Search size={16} />
                  <input
                    value={contentSearch}
                    onChange={(event) => setContentSearch(event.target.value)}
                    placeholder={contentText.searchPlaceholder}
                  />
                </label>
              </div>
            ) : null}
          </div>
        </header>

        <div className="admin-content-scroll">
          {status ? (
            <div className="admin-status" key={status.id}>
              {status.message}
            </div>
          ) : null}

          {adminView === "tools" && (
            isLoadingTools && !hasLoadedTools ? (
              <SkeletonVisibility visible={showAdminToolSkeletons}>
                <section className="admin-tool-grid" aria-label={t.admin.manageTools}>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <AdminToolCardSkeleton key={index} />
                  ))}
                </section>
              </SkeletonVisibility>
            ) : visibleTools.length ? (
              <section className="admin-tool-grid" aria-label={t.admin.manageTools}>
                {visibleTools.map((tool) => (
                  <AdminToolCard
                    key={tool.id}
                    isFeaturedUpdating={featuredUpdatingId === tool.id}
                    onDelete={() => setPendingDeleteTool(tool)}
                    onEdit={() => openEdit(tool)}
                    onToggleFeatured={() => void handleToggleFeatured(tool)}
                    proxySettings={proxySettings}
                    t={t}
                    tool={tool}
                  />
                ))}
              </section>
            ) : (
              <section className="admin-empty-state">
                <div className="empty-state-title">
                  {tools.length === 0 ? <PanelLeft size={28} /> : <Search size={28} />}
                  <h2>{tools.length === 0 ? t.empty.libraryTitle : t.admin.emptyTitle}</h2>
                </div>
                <p>
                  {tools.length === 0
                    ? t.empty.libraryDescription
                    : t.admin.emptyDescription}
                </p>
                {tools.length === 0 ? (
                  <button
                    className="primary-button empty-state-action"
                    type="button"
                    onClick={() => selectAdminView("check")}
                  >
                    {t.empty.libraryAction}
                    <ArrowUpRight size={15} />
                  </button>
                ) : null}
              </section>
            )
          )}

          {adminView === "articles" && (
            isLoadingArticles && !hasLoadedArticles ? (
              <SkeletonVisibility visible={showAdminArticleSkeletons}>
                <section className="admin-tool-grid" aria-label={articleText.adminTitle}>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <AdminArticleCardSkeleton key={index} />
                  ))}
                </section>
              </SkeletonVisibility>
            ) : visibleArticles.length ? (
              <section className="admin-tool-grid" aria-label={articleText.adminTitle}>
                {visibleArticles.map((article) => (
                  <AdminArticleCard
                    article={article}
                    articleText={articleText}
                    isPublishUpdating={articlePublishUpdatingId === article.id}
                    key={article.id}
                    onDelete={() => setPendingDeleteArticle(article)}
                    onEdit={() => openEditArticle(article)}
                    onTogglePublished={() =>
                      void handleToggleArticlePublished(article)
                    }
                  />
                ))}
              </section>
            ) : (
              <section className="admin-empty-state">
                <div className="empty-state-title">
                  {adminArticles.length === 0 ? <FileText size={28} /> : <Search size={28} />}
                  <h2>
                    {adminArticles.length === 0
                      ? articleText.emptyTitle
                      : articleText.noMatchTitle}
                  </h2>
                </div>
                <p>
                  {adminArticles.length === 0
                    ? articleText.emptyDescription
                    : articleText.noMatchDescription}
                </p>
                {adminArticles.length === 0 ? (
                  <button
                    className="primary-button empty-state-action"
                    type="button"
                    onClick={openCreateArticle}
                  >
                    {articleText.addArticle}
                    <ArrowUpRight size={15} />
                  </button>
                ) : null}
              </section>
            )
          )}

          {adminView === "content" ? (
            <AdminContentFlowPanel
              contentSourceCounts={contentSourceCounts}
              contentSourceFilter={contentSourceFilter}
              contentSources={visibleContentSources}
              contentText={contentText}
              contentCategoryItemCount={contentItemsForCategory.length}
              hasLoadedContent={hasLoadedContent}
              isConvertLocked={isConvertingContentItem}
              isLoadingContent={isLoadingContent}
              onConvertItem={openConvertContentItem}
              onDeleteSource={(source) => setPendingDeleteContentSource(source)}
              onEditSource={openEditContentSource}
              onSelectSource={setContentSourceFilter}
              onSyncSource={(source) => void handleSyncContentSource(source)}
              proxySettings={proxySettings}
              onAddSource={openCreateContentSource}
              showSkeletons={showAdminContentSkeletons}
              syncingSourceId={syncingSourceId}
              visibleContentItems={visibleContentItems}
            />
          ) : null}

          {adminView === "check" ? (
            <AdminLinkCheckPanel
              isLoadingTools={isLoadingTools && !hasLoadedTools}
              maintenanceText={maintenanceText}
              onReloadTools={refresh}
              proxySettings={proxySettings}
              setStatus={setStatus}
              t={t}
              token={token}
              tools={tools}
            />
          ) : null}

          {adminView === "system" ? (
            <AdminSystemSettingsPanel
              maintenanceText={maintenanceText}
              onProxySettingsChange={onProxySettingsChange}
              onDataRestored={async () => {
                await Promise.all([
                  refreshAdminCategories(),
                  refresh(),
                  refreshArticles(),
                  refreshContent()
                ]);
              }}
              onSiteSettingsChange={onSiteSettingsChange}
              proxySettings={proxySettings}
              setStatus={setStatus}
              siteSettings={siteSettings}
              t={t}
              token={token}
            />
          ) : null}
        </div>
      </main>

      {formOpen ? (
        <Dialog
          title={editingTool ? t.admin.editTool : t.actions.addTool}
          closeLabel={t.actions.close}
          onClose={closeToolEditor}
          panelClassName="tool-editor-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                type="button"
                onClick={closeToolEditor}
              >
                {t.actions.close}
              </button>
              <button
                className="primary-button"
                disabled={isSaving}
                type="submit"
                form="admin-tool-editor-form"
              >
                {isSaving ? t.form.saving : t.form.saveTool}
              </button>
            </>
          }
        >
          <div className="tool-editor-top-actions">
            {canFillGitHubMetadata ? (
              <button
                aria-label={t.form.githubMetadata}
                className="tool-featured-toggle tool-github-metadata-button"
                disabled={isGitHubMetadataLoading}
                title={t.form.githubMetadata}
                type="button"
                onClick={() =>
                  void fillGitHubMetadata(form.url, {
                    force: true,
                    overwrite: true
                  })
                }
              >
                {isGitHubMetadataLoading ? (
                  <RefreshCw size={16} />
                ) : (
                  <Github size={16} />
                )}
                <span>
                  {isGitHubMetadataLoading
                    ? t.form.githubMetadataLoading
                    : t.form.githubMetadata}
                </span>
              </button>
            ) : null}
            <button
              aria-label={t.form.featuredTool}
              aria-pressed={form.featured}
              className={`tool-featured-toggle ${form.featured ? "is-active" : ""}`}
              title={t.form.featuredTool}
              type="button"
              onClick={() => {
                const nextFeatured = !form.featured;
                setForm({ ...form, featured: nextFeatured });
                setStatus(
                  nextFeatured
                    ? t.status.featuredDraftEnabled
                    : t.status.featuredDraftDisabled
                );
              }}
            >
              <Star size={16} fill={form.featured ? "currentColor" : "none"} />
              <span>{t.form.featuredTool}</span>
            </button>
          </div>

          <form id="admin-tool-editor-form" className="tool-form" onSubmit={handleSave}>
            <label>
              {t.form.name}
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                onBlur={() => {
                  moveGitHubUrlFromName(form.name);
                }}
                onPaste={(event) => {
                  const pastedText = event.clipboardData.getData("text");

                  if (moveGitHubUrlFromName(pastedText)) {
                    event.preventDefault();
                  }
                }}
                required
              />
            </label>

            <div className="tool-form-field tool-url-field">
              <div className="tool-form-field-head">
                <label htmlFor="admin-tool-url">{t.form.url}</label>
              </div>
              <input
                id="admin-tool-url"
                value={form.url}
                onChange={(event) => {
                  const nextUrl = event.target.value;
                  setGithubMetadataPreview(null);
                  setIsGitHubMetadataPreviewLoading(isGitHubRepoUrl(nextUrl));
                  setGithubMetadataPreviewFailed(false);
                  setForm({ ...form, url: nextUrl });
                }}
                onBlur={() =>
                  setForm((current) => ({
                    ...current,
                    url: normalizeHttpUrlInput(current.url)
                  }))
                }
                placeholder="https://example.com"
                inputMode="url"
                required
              />
            </div>

            <label>
              {t.form.demoUrl}
              <input
                value={form.demoUrl}
                onChange={(event) =>
                  setForm({ ...form, demoUrl: event.target.value })
                }
                onBlur={() =>
                  setForm((current) => ({
                    ...current,
                    demoUrl: normalizeHttpUrlInput(current.demoUrl)
                  }))
                }
                placeholder={t.form.demoUrlPlaceholder}
                inputMode="url"
              />
            </label>

            <label>
              {t.form.image}
              <input
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
                onBlur={() =>
                  setForm((current) => ({
                    ...current,
                    image: normalizeHttpUrlInput(current.image)
                  }))
                }
                placeholder={t.form.imagePlaceholder}
                inputMode="url"
              />
            </label>

            <div className="tool-form-field">
              <span className="tool-form-label">{t.form.category}</span>
              <AdminCategoryFilter
                allowCreate
                alignToTopOnOpen
                categories={adminCategoryOptions}
                className="tool-form-category-filter"
                onDeleteCategory={(category) =>
                  void deleteAdminCategory("tools", category)
                }
                onChange={(category) => {
                  setForm({ ...form, category });
                  void rememberAdminCategory("tools", category);
                }}
                t={t}
                value={form.category}
              />
            </div>

            <label>
              {t.form.description}
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                rows={4}
                required
              />
            </label>

            <label>
              {t.form.tags}
              <input
                value={toolTagText}
                onChange={(event) => setToolTagText(event.target.value)}
                onPaste={(event) => {
                  const text = event.clipboardData.getData("text");

                  if (text.includes("\n") || /^\s*tags\s*:/i.test(text)) {
                    event.preventDefault();
                    setToolTagText(formatTagInputText(parseArticleTagsInput(text)));
                  }
                }}
                placeholder={t.form.tagsPlaceholder}
              />
            </label>

            {canFillGitHubMetadata || githubMetadataPreview ? (
              <div
                className={`tool-form-field tool-github-detail-field ${
                  githubMetadataPreview ? "" : "is-placeholder"
                }`}
              >
                <span className="tool-form-label">
                  {githubMetadataDetailText.title}
                </span>
                <section className="tool-github-detail-card">
                  {githubMetadataPreview ? (
                    <>
                      <div className="tool-github-detail-repo">
                        <Github size={16} />
                        <span>{githubMetadataPreview.fullName}</span>
                      </div>
                      <div className="tool-github-detail-grid">
                        {githubMetadataDetailItems.map((item) => (
                          <div className="tool-github-detail-item" key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="tool-github-detail-placeholder">
                      <Github size={16} />
                      <span>
                        {isGitHubMetadataPreviewLoading || isGitHubMetadataLoading
                          ? githubMetadataDetailText.loading
                          : githubMetadataPreviewFailed
                            ? githubMetadataDetailText.failed
                            : githubMetadataDetailText.empty}
                      </span>
                    </div>
                  )}
                </section>
              </div>
            ) : null}

          </form>
        </Dialog>
      ) : null}

      {articleFormOpen ? (
        <Dialog
          title={editingArticle ? articleText.editArticle : articleText.addArticle}
          closeLabel={t.actions.close}
          onClose={() => setArticleFormOpen(false)}
          panelClassName="tool-editor-dialog article-editor-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                type="button"
                onClick={() => setArticleFormOpen(false)}
              >
                {t.actions.close}
              </button>
              <button
                className="primary-button"
                disabled={isArticleSaving}
                type="submit"
                form="admin-article-editor-form"
              >
                {isArticleSaving ? t.form.saving : articleText.saveArticle}
              </button>
            </>
          }
        >
          <div className="tool-editor-top-actions article-editor-top-actions">
            <div className="tool-form-field article-publish-mode-field">
              <span className="tool-form-label">{articleText.publishModeLabel}</span>
              <div className="content-convert-publish-options" role="group">
                <button
                  className={`article-publish-toggle ${
                    articleForm.published ? "is-active" : ""
                  }`}
                  type="button"
                  aria-pressed={articleForm.published}
                  onClick={() => {
                    setArticleForm((current) => ({
                      ...current,
                      published: true
                    }));
                    onNotify({
                      message: articleText.publishDraftEnabled,
                      tone: "info"
                    });
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{articleText.publishDirectLabel}</span>
                </button>
                <button
                  className={`article-publish-toggle ${
                    !articleForm.published ? "is-active" : ""
                  }`}
                  type="button"
                  aria-pressed={!articleForm.published}
                  onClick={() => {
                    setArticleForm((current) => ({
                      ...current,
                      published: false
                    }));
                    onNotify({
                      message: articleText.publishDraftDisabled,
                      tone: "info"
                    });
                  }}
                >
                  <CircleStop size={16} />
                  <span>{articleText.draftLabel}</span>
                </button>
              </div>
            </div>
          </div>

          <form
            id="admin-article-editor-form"
            className="tool-form article-form"
            onSubmit={handleSaveArticle}
          >
            <label>
              {articleText.titleLabel}
              <input
                value={articleForm.title}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, title: event.target.value })
                }
                required
              />
            </label>

            <label>
              {articleText.slugLabel}
              <input
                value={articleForm.slug}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, slug: event.target.value })
                }
                onBlur={() =>
                  setArticleForm((current) => ({
                    ...current,
                    slug: normalizeSlugInput(current.slug)
                  }))
                }
                placeholder={articleText.slugPlaceholder}
              />
              <small className="form-field-help">{articleText.slugHelp}</small>
            </label>

            <label>
              {articleText.publishTimeLabel}
              <input
                type="datetime-local"
                value={articleForm.publishedAt}
                onChange={(event) =>
                  setArticleForm({
                    ...articleForm,
                    publishedAt: event.target.value
                  })
                }
              />
              <small className="form-field-help">
                {articleText.publishTimeHelp}
              </small>
            </label>

            <div className="tool-form-field">
              <span className="tool-form-label">{articleText.categoryLabel}</span>
              <AdminCategoryFilter
                alignToTopOnOpen
                categories={articleCategoryOptions}
                className="tool-form-category-filter"
                emptyLabel={articleText.categoryEmptyLabel}
                onDeleteCategory={(category) =>
                  void deleteAdminCategory("articles", category)
                }
                onChange={(category) => {
                  setArticleForm({
                    ...articleForm,
                    category
                  });
                  void rememberAdminCategory("articles", category);
                }}
                t={t}
                value={articleForm.category}
              />
              <small className="form-field-help">
                {articleText.categoryPlaceholder}
              </small>
            </div>

            <label>
              {articleText.summaryLabel}
              <textarea
                value={articleForm.summary}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, summary: event.target.value })
                }
                placeholder={articleText.summaryPlaceholder}
                rows={3}
                required
              />
            </label>

            <label>
              {articleText.coverImageLabel}
              <input
                value={articleForm.coverImage}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, coverImage: event.target.value })
                }
                onBlur={() =>
                  setArticleForm((current) => ({
                    ...current,
                    coverImage: normalizeHttpUrlInput(current.coverImage)
                  }))
                }
                placeholder={articleText.coverImagePlaceholder}
                inputMode="url"
              />
            </label>

            <label>
              {articleText.tagsLabel}
              <input
                value={articleTagText}
                onChange={(event) => setArticleTagText(event.target.value)}
                onPaste={(event) => {
                  const text = event.clipboardData.getData("text");

                  if (text.includes("\n") || /^\s*tags\s*:/i.test(text)) {
                    event.preventDefault();
                    setArticleTagText(formatTagInputText(parseArticleTagsInput(text)));
                  }
                }}
                placeholder={articleText.tagsPlaceholder}
              />
            </label>

            <label>
              {articleText.contentLabel}
              <textarea
                className="article-content-input"
                value={articleForm.content}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, content: event.target.value })
                }
                placeholder={articleText.contentPlaceholder}
                rows={12}
                required
              />
            </label>
          </form>
        </Dialog>
      ) : null}

      {contentSourceFormOpen ? (
        <Dialog
          title={
            editingContentSource
              ? contentText.editSource
              : contentText.addSource
          }
          closeLabel={t.actions.close}
          onClose={() => setContentSourceFormOpen(false)}
          panelClassName="tool-editor-dialog article-editor-dialog content-source-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                disabled={isContentPreviewing || isContentSourceSaving}
                type="button"
                onClick={() => void handlePreviewContentSource()}
              >
                {isContentPreviewing ? contentText.previewing : contentText.preview}
              </button>
              <button
                className="ghost-button"
                disabled={isContentSourceSaving}
                type="button"
                onClick={() => setContentSourceFormOpen(false)}
              >
                {t.actions.close}
              </button>
              <button
                className="primary-button"
                disabled={isContentSourceSaving}
                type="submit"
                form="admin-content-source-form"
              >
                {isContentSourceSaving ? t.form.saving : contentText.saveSource}
              </button>
            </>
          }
        >
          <div className="tool-editor-top-actions">
            <button
              className={`tool-featured-toggle article-publish-toggle ${
                contentSourceForm.enabled ? "is-active" : ""
              }`}
              type="button"
              aria-pressed={contentSourceForm.enabled}
              onClick={() => {
                const nextEnabled = !contentSourceForm.enabled;
                setContentSourceForm((current) => ({
                  ...current,
                  enabled: nextEnabled
                }));
                setStatus(
                  nextEnabled
                    ? contentText.enabledDraftEnabled
                    : contentText.enabledDraftDisabled
                );
              }}
            >
              {contentSourceForm.enabled ? (
                <CheckCircle2 size={16} />
              ) : (
                <CircleStop size={16} />
              )}
              <span>{contentText.enabledLabel}</span>
            </button>
          </div>

          <form
            id="admin-content-source-form"
            className="tool-form article-form"
            onSubmit={handleSaveContentSource}
          >
            <label>
              {contentText.sourceUrlLabel}
              <input
                value={contentSourceForm.url}
                onChange={(event) =>
                  setContentSourceForm({
                    ...contentSourceForm,
                    url: event.target.value
                  })
                }
                onBlur={() =>
                  setContentSourceForm((current) => ({
                    ...current,
                    url: normalizeHttpUrlInput(current.url)
                  }))
                }
                placeholder={contentText.sourceUrlPlaceholder}
                inputMode="url"
                required
              />
            </label>

            <label>
              {contentText.sourceTitleLabel}
              <input
                value={contentSourceForm.title}
                onChange={(event) =>
                  setContentSourceForm({
                    ...contentSourceForm,
                    title: event.target.value
                  })
                }
                placeholder={contentText.sourceTitlePlaceholder}
              />
            </label>

            <div className="tool-form-field">
              <span className="tool-form-label">{contentText.categoryLabel}</span>
              <AdminCategoryFilter
                alignToTopOnOpen
                categories={contentCategoryOptions}
                className="tool-form-category-filter"
                emptyLabel={contentText.categoryEmptyLabel}
                onDeleteCategory={(category) =>
                  void deleteAdminCategory("content", category)
                }
                onChange={(category) => {
                  setContentSourceForm({
                    ...contentSourceForm,
                    category
                  });
                  void rememberAdminCategory("content", category);
                }}
                t={t}
                value={contentSourceForm.category}
              />
              <small className="form-field-help">
                {contentText.categoryPlaceholder}
              </small>
            </div>

            <label>
              {contentText.tagsLabel}
              <input
                value={contentSourceTagText}
                onChange={(event) => setContentSourceTagText(event.target.value)}
                onPaste={(event) => {
                  const text = event.clipboardData.getData("text");

                  if (text.includes("\n") || /^\s*tags\s*:/i.test(text)) {
                    event.preventDefault();
                    setContentSourceTagText(
                      formatTagInputText(parseArticleTagsInput(text))
                    );
                  }
                }}
                placeholder={contentText.tagsPlaceholder}
              />
            </label>

            {contentPreview ? (
              <div className="content-source-preview" ref={contentPreviewRef}>
                <div>
                  <strong>{contentText.previewTitle}</strong>
                  <span>{contentPreview.title}</span>
                </div>
                {contentPreview.items.slice(0, 3).map((item) => (
                  <article key={item.externalId}>
                    <h3>{getArticleDisplayTitle(item)}</h3>
                    <p>{cleanArticleDisplayText(item.summary)}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </form>
        </Dialog>
      ) : null}

      {pendingConvertItem ? (
        <Dialog
          title={contentText.convertCategoryTitle}
          closeLabel={t.actions.close}
          onClose={() => {
            if (!isConvertingContentItem) {
              setPendingConvertItem(null);
              setConvertArticleCategory("");
              setConvertPublishMode("published");
            }
          }}
          panelClassName="tool-editor-dialog article-editor-dialog content-convert-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                disabled={isConvertingContentItem}
                type="button"
                onClick={() => {
                  setPendingConvertItem(null);
                  setConvertArticleCategory("");
                  setConvertPublishMode("published");
                }}
              >
                {t.actions.close}
              </button>
              <button
                className="primary-button"
                disabled={isConvertingContentItem}
                type="button"
                onClick={() =>
                  void handleConvertContentItem(
                    pendingConvertItem,
                    convertArticleCategory,
                    convertPublishMode
                  )
                }
              >
                {contentText.convertCategoryAction}
              </button>
            </>
          }
        >
          <div className="tool-form article-form">
            <p className="form-field-help content-convert-description">
              {contentText.convertCategoryDescription}
            </p>
            <div className="tool-form-field">
              <span className="tool-form-label">{articleText.categoryLabel}</span>
              <AdminCategoryFilter
                alignToTopOnOpen
                categories={articleCategoryOptions}
                className="tool-form-category-filter"
                emptyLabel={articleText.categoryEmptyLabel}
                onDeleteCategory={(category) =>
                  void deleteAdminCategory("articles", category)
                }
                onChange={(category) => {
                  setConvertArticleCategory(category);
                  void rememberAdminCategory("articles", category);
                }}
                t={t}
                value={convertArticleCategory}
              />
              <small className="form-field-help">
                {articleText.categoryPlaceholder}
              </small>
            </div>
            <div className="tool-form-field">
              <span className="tool-form-label">{contentText.convertPublishLabel}</span>
              <div className="content-convert-publish-options" role="group">
                <button
                  className={`article-publish-toggle ${
                    convertPublishMode === "published" ? "is-active" : ""
                  }`}
                  disabled={isConvertingContentItem}
                  type="button"
                  aria-pressed={convertPublishMode === "published"}
                  onClick={() => {
                    setConvertPublishMode("published");
                    onNotify({
                      message: contentText.convertPublishPublishedTip,
                      tone: "info"
                    });
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{contentText.convertAsPublished}</span>
                </button>
                <button
                  className={`article-publish-toggle ${
                    convertPublishMode === "draft" ? "is-active" : ""
                  }`}
                  disabled={isConvertingContentItem}
                  type="button"
                  aria-pressed={convertPublishMode === "draft"}
                  onClick={() => {
                    setConvertPublishMode("draft");
                    onNotify({
                      message: contentText.convertPublishDraftTip,
                      tone: "info"
                    });
                  }}
                >
                  <CircleStop size={16} />
                  <span>{contentText.convertAsDraft}</span>
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      ) : null}

      {pendingCategoryAction ? (
        <Dialog
          title={
            pendingCategoryIsAll
              ? isChineseLocaleText(t)
                ? `清空${getAdminCategoryScopeLabel(t, pendingCategoryAction.scope)}`
                : `Clear ${getAdminCategoryScopeLabel(t, pendingCategoryAction.scope)}`
              : isChineseLocaleText(t)
              ? `处理分类“${getCategoryLabel(pendingCategoryAction.category, t)}”`
              : `Manage category "${getCategoryLabel(pendingCategoryAction.category, t)}"`
          }
          closeLabel={t.actions.close}
          onClose={() => {
            if (!isApplyingCategoryAction) {
              setPendingCategoryAction(null);
              setCategoryActionTarget("");
            }
          }}
          panelClassName="admin-delete-dialog admin-category-action-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                disabled={isApplyingCategoryAction}
                type="button"
                onClick={() => {
                  setPendingCategoryAction(null);
                  setCategoryActionTarget("");
                }}
              >
                {t.status.deleteCancel}
              </button>
              <button
                className={pendingCategoryIsAll ? "primary-button" : "ghost-button"}
                disabled={isApplyingCategoryAction}
                type="button"
                onClick={() =>
                  void applyCategoryAction(
                    pendingCategoryAction.scope,
                    pendingCategoryAction.category,
                    "delete",
                    ""
                  )
                }
              >
                {pendingCategoryIsAll
                  ? isChineseLocaleText(t)
                    ? "清空全部内容"
                    : "Clear all content"
                  : isChineseLocaleText(t)
                  ? "删除分类及内容"
                  : "Delete category and content"}
              </button>
              {pendingCategoryIsAll ? null : (
                <button
                  className="primary-button"
                  disabled={isApplyingCategoryAction}
                  type="button"
                  onClick={() =>
                    void applyCategoryAction(
                      pendingCategoryAction.scope,
                      pendingCategoryAction.category,
                      "migrate",
                      categoryActionTarget
                    )
                  }
                >
                  {isChineseLocaleText(t) ? "迁移内容" : "Migrate content"}
                </button>
              )}
            </>
          }
        >
          <div className="admin-category-action-body">
            <p className="admin-delete-dialog-description">
              {pendingCategoryIsAll
                ? isChineseLocaleText(t)
                  ? `这将清空${getAdminCategoryScopeLabel(t, pendingCategoryAction.scope)}中的 ${pendingCategoryAction.contentCount} 条内容。`
                  : `This will clear ${pendingCategoryAction.contentCount} items from ${getAdminCategoryScopeLabel(t, pendingCategoryAction.scope)}.`
                : isChineseLocaleText(t)
                ? `这个分类下还有 ${pendingCategoryAction.contentCount} 条内容。可以迁移到其他分类，也可以删除分类及内容。`
                : `This category still has ${pendingCategoryAction.contentCount} items. You can migrate them to another category or delete the category and its content.`}
            </p>
            {pendingCategoryIsAll ? null : (
              <div className="admin-category-action-field">
                <div className="admin-category-action-copy">
                  <span className="admin-category-action-label">
                    {isChineseLocaleText(t) ? "迁移到分类" : "Migrate to category"}
                  </span>
                  <small className="admin-category-action-help">
                    {isChineseLocaleText(t)
                      ? "可选择已有分类，也可以输入新分类。"
                      : "Choose an existing category or type a new one."}
                  </small>
                </div>
                <AdminCategoryFilter
                  categories={getCategoryActionOptions(
                    pendingCategoryAction.scope,
                    pendingCategoryAction.category
                  )}
                  className="admin-category-action-filter"
                  emptyLabel={isChineseLocaleText(t) ? "选择分类" : "Select category"}
                  onChange={setCategoryActionTarget}
                  t={t}
                  value={categoryActionTarget}
                />
              </div>
            )}
          </div>
        </Dialog>
      ) : null}

      {pendingDeleteTool ? (
        <Dialog
          title={t.status.deleteConfirmTitle}
          closeLabel={t.actions.close}
          onClose={() => {
            if (!isDeletingTool) {
              setPendingDeleteTool(null);
            }
          }}
          panelClassName="admin-delete-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                disabled={isDeletingTool}
                type="button"
                onClick={() => setPendingDeleteTool(null)}
              >
                {t.status.deleteCancel}
              </button>
              <button
                className="primary-button"
                disabled={isDeletingTool}
                type="button"
                onClick={() => void handleDelete(pendingDeleteTool)}
              >
                {t.status.deleteContinue}
              </button>
            </>
          }
        >
          <p className="admin-delete-dialog-description">
            {t.status.deleteConfirmDescription}
          </p>
        </Dialog>
      ) : null}

      {pendingDeleteArticle ? (
        <Dialog
          title={articleText.deleteConfirmTitle}
          closeLabel={t.actions.close}
          onClose={() => {
            if (!isDeletingArticle) {
              setPendingDeleteArticle(null);
            }
          }}
          panelClassName="admin-delete-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                disabled={isDeletingArticle}
                type="button"
                onClick={() => setPendingDeleteArticle(null)}
              >
                {t.status.deleteCancel}
              </button>
              <button
                className="primary-button"
                disabled={isDeletingArticle}
                type="button"
                onClick={() => void handleDeleteArticle(pendingDeleteArticle)}
              >
                {t.status.deleteContinue}
              </button>
            </>
          }
        >
          <p className="admin-delete-dialog-description">
            {articleText.deleteConfirmDescription}
          </p>
        </Dialog>
      ) : null}

      {pendingDeleteContentSource ? (
        <Dialog
          title={contentText.deleteConfirmTitle}
          closeLabel={t.actions.close}
          onClose={() => {
            if (!isDeletingContentSource) {
              setPendingDeleteContentSource(null);
            }
          }}
          panelClassName="admin-delete-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                disabled={isDeletingContentSource}
                type="button"
                onClick={() => setPendingDeleteContentSource(null)}
              >
                {t.status.deleteCancel}
              </button>
              <button
                className="primary-button"
                disabled={isDeletingContentSource}
                type="button"
                onClick={() =>
                  void handleDeleteContentSource(pendingDeleteContentSource)
                }
              >
                {t.status.deleteContinue}
              </button>
            </>
          }
        >
          <p className="admin-delete-dialog-description">
            {contentText.deleteConfirmDescription}
          </p>
        </Dialog>
      ) : null}
    </div>
  );
}

function AdminContentFlowPanel({
  contentSourceCounts,
  contentSourceFilter,
  contentSources,
  contentText,
  contentCategoryItemCount,
  hasLoadedContent,
  isConvertLocked,
  isLoadingContent,
  onAddSource,
  onConvertItem,
  onDeleteSource,
  onEditSource,
  onSelectSource,
  onSyncSource,
  proxySettings,
  showSkeletons,
  syncingSourceId,
  visibleContentItems
}: {
  contentSourceCounts: Record<string, number>;
  contentSourceFilter: string;
  contentSources: ContentSource[];
  contentText: ReturnType<typeof getContentFlowText>;
  contentCategoryItemCount: number;
  hasLoadedContent: boolean;
  isConvertLocked: boolean;
  isLoadingContent: boolean;
  onAddSource: () => void;
  onConvertItem: (item: ContentItem) => void;
  onDeleteSource: (source: ContentSource) => void;
  onEditSource: (source: ContentSource) => void;
  onSelectSource: (sourceId: string) => void;
  onSyncSource: (source: ContentSource) => void;
  proxySettings: ProxySettings;
  showSkeletons: boolean;
  syncingSourceId: string | null;
  visibleContentItems: ContentItem[];
}) {
  if (isLoadingContent && !hasLoadedContent) {
    return (
      <SkeletonVisibility visible={showSkeletons}>
        <ContentFlowSkeleton />
      </SkeletonVisibility>
    );
  }

  return (
    <section className="content-flow-layout" aria-label={contentText.title}>
      <aside className="content-flow-rail">
        <div className="content-flow-section-head">
          <h2>{contentText.title}</h2>
          <p>{contentText.description}</p>
        </div>

        <div className="content-source-list">
          {contentSources.map((source) => (
            <ContentSourceButton
              contentText={contentText}
              count={contentSourceCounts[source.id] ?? 0}
              isSelected={contentSourceFilter === source.id}
              isSyncing={syncingSourceId === source.id}
              key={source.id}
              onDelete={() => onDeleteSource(source)}
              onEdit={() => onEditSource(source)}
              onSelect={() => onSelectSource(source.id)}
              onSync={() => onSyncSource(source)}
              source={source}
            />
          ))}
        </div>
      </aside>

      <div className="content-flow-main">
        {contentSources.length === 0 ? (
          <section className="admin-empty-state content-flow-empty">
            <div className="empty-state-title">
              <Rss size={28} />
              <h2>{contentText.sourceEmptyTitle}</h2>
            </div>
            <p>{contentText.sourceEmptyDescription}</p>
            <button
              className="primary-button empty-state-action"
              type="button"
              onClick={onAddSource}
            >
              {contentText.addSource}
              <ArrowUpRight size={15} />
            </button>
          </section>
        ) : visibleContentItems.length ? (
          <div className="content-item-list">
            {visibleContentItems.map((item) => (
              <ContentItemCard
                contentText={contentText}
                isConvertLocked={isConvertLocked}
                item={item}
                key={item.id}
                onConvert={() => onConvertItem(item)}
                proxySettings={proxySettings}
              />
            ))}
          </div>
        ) : (
          <section className="admin-empty-state content-flow-empty">
            <div className="empty-state-title">
              {contentCategoryItemCount === 0 ? <Rss size={28} /> : <Search size={28} />}
              <h2>
                {contentCategoryItemCount === 0
                  ? contentText.itemEmptyTitle
                  : contentText.noMatchTitle}
              </h2>
            </div>
            <p>
              {contentCategoryItemCount === 0
                ? contentText.itemEmptyDescription
                : contentText.noMatchDescription}
            </p>
          </section>
        )}
      </div>
    </section>
  );
}

function ContentSourceButton({
  contentText,
  count,
  isSelected,
  isSyncing,
  onDelete,
  onEdit,
  onSelect,
  onSync,
  source
}: {
  contentText: ReturnType<typeof getContentFlowText>;
  count: number;
  isSelected: boolean;
  isSyncing: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  onSync: () => void;
  source: ContentSource;
}) {
  const Icon = getCategoryIcon(source.category);

  return (
    <div className={`content-source-item ${isSelected ? "is-active" : ""}`}>
      <button className="content-source-main" type="button" onClick={onSelect}>
        <span className="content-source-icon">
          <Icon size={16} />
        </span>
        <span className="content-source-copy">
          <strong>{source.title}</strong>
          <small>{contentText.sourceCount(count)}</small>
        </span>
      </button>
      <div className="content-source-actions">
        <button
          className="icon-button"
          disabled={isSyncing}
          type="button"
          title={contentText.syncSource}
          onClick={onSync}
        >
          <RefreshCw size={15} />
        </button>
        <button
          className="icon-button"
          type="button"
          title={contentText.editSource}
          onClick={onEdit}
        >
          <SquarePen size={15} />
        </button>
        <button
          className="icon-button"
          type="button"
          title={contentText.deleteSource}
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function ContentItemCard({
  contentText,
  isConvertLocked,
  item,
  onConvert,
  proxySettings
}: {
  contentText: ReturnType<typeof getContentFlowText>;
  isConvertLocked: boolean;
  item: ContentItem;
  onConvert: () => void;
  proxySettings: ProxySettings;
}) {
  const Icon = getCategoryIcon(item.category);
  const displayDate = formatAdminDate(item.published_at ?? item.updated_at);
  const displayTitle = getArticleDisplayTitle(item);
  const coverSrc = item.coverImage ? proxifyUrl(item.coverImage, proxySettings) : "";
  const originalHref = proxifyUrl(item.url, proxySettings);
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = Boolean(coverSrc && !coverFailed);

  useEffect(() => {
    setCoverFailed(false);
  }, [coverSrc]);

  return (
    <article className={`content-item-card ${showCover ? "has-cover" : ""}`}>
      <div className="content-item-main">
        <div className="content-item-meta">
          <span>
            <Icon size={15} />
            {item.sourceTitle || item.category}
          </span>
          {displayDate ? <span>{displayDate}</span> : null}
        </div>
        <h3>{displayTitle}</h3>
        <p>{cleanArticleDisplayText(item.summary)}</p>
        <CompactTagRow tags={item.tags} />
      </div>
      {showCover ? (
        <img
          className="content-item-cover"
          src={coverSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setCoverFailed(true)}
        />
      ) : null}
      <div className="content-item-actions">
        <a
          className="ghost-button"
          href={originalHref}
          target="_blank"
          rel="noreferrer"
        >
          {contentText.openOriginal}
        </a>
        <a
          className="ghost-button"
          href={
            item.articleId && item.articleSlug
              ? createArticleBrowseHref(item.articleSlug, item.articlePublished)
              : createContentItemPreviewHref(item.id)
          }
          target="_blank"
          rel="noreferrer"
        >
          {contentText.browseArticle}
        </a>
        <button
          className="primary-button"
          disabled={Boolean(item.articleId) || isConvertLocked}
          type="button"
          onClick={onConvert}
        >
          {item.articleId ? contentText.converted : contentText.convert}
        </button>
      </div>
    </article>
  );
}

function isChineseLocaleText(t: Messages) {
  return t.categories.All === "全部";
}

function getAdminCategoryTopLabel(t: Messages) {
  return isChineseLocaleText(t)
    ? "新增/筛选分类"
    : "Create / Filter Category";
}

function getAdminCategoryFilterEmpty(t: Messages) {
  return isChineseLocaleText(t) ? "没有找到分类" : "No matching categories";
}

function getAdminCategoryCreateLabel(t: Messages, category: string) {
  return isChineseLocaleText(t)
    ? `新增分类：${category}`
    : `Create category: ${category}`;
}

function getAdminCategoryDeleteLabel(t: Messages, category: string) {
  if (isAllCategoryValue(category)) {
    return isChineseLocaleText(t) ? "清空全部内容" : "Clear all content";
  }

  const label = getCategoryLabel(category, t);

  return isChineseLocaleText(t)
    ? `删除分类：${label}`
    : `Delete category: ${label}`;
}

function getAdminCategoryMoveLabel(t: Messages, category: string) {
  const label = getCategoryLabel(category, t);

  return isChineseLocaleText(t)
    ? `上移分类：${label}`
    : `Move category up: ${label}`;
}

function getAdminCategoryScopeLabel(t: Messages, scope: AdminCategoryScope) {
  if (isChineseLocaleText(t)) {
    const labels: Record<AdminCategoryScope, string> = {
      tools: "工具库",
      articles: "文章管理",
      content: "内容流"
    };

    return labels[scope];
  }

  const labels: Record<AdminCategoryScope, string> = {
    tools: "Tools",
    articles: "Articles",
    content: "Content Flow"
  };

  return labels[scope];
}

function getAdminCategoryDeletedText(
  t: Messages,
  category: string,
  scope: AdminCategoryScope
) {
  if (isAllCategoryValue(category)) {
    const scopeLabel = getAdminCategoryScopeLabel(t, scope);

    return isChineseLocaleText(t)
      ? `${scopeLabel}已清空全部内容。`
      : `${scopeLabel}: all content has been cleared.`;
  }

  if (scope === "tools" && isFeaturedCategoryValue(category)) {
    return isChineseLocaleText(t)
      ? "工具库已取消所有精选工具。"
      : "Tools: all featured tools have been unfeatured.";
  }

  const label = getCategoryLabel(category, t);
  const scopeLabel = getAdminCategoryScopeLabel(t, scope);

  return isChineseLocaleText(t)
    ? `分类“${label}”已从${scopeLabel}删除。`
    : `Category "${label}" removed from ${scopeLabel}.`;
}

function getAdminCategoryMigratedText(
  t: Messages,
  category: string,
  targetCategory: string,
  affected: number
) {
  const label = getCategoryLabel(category, t);
  const targetLabel = getCategoryLabel(targetCategory, t);

  return isChineseLocaleText(t)
    ? `分类“${label}”下的 ${affected} 条内容已迁移到“${targetLabel}”。`
    : `${affected} items from "${label}" moved to "${targetLabel}".`;
}

function getCompactAdminActionLabel(label: string) {
  return label
    .replace(/\s*(Tool|Article)$/i, "")
    .replace(/(工具|文章)$/, "");
}

function AdminCategoryFilter({
  allowCreate = true,
  alignToTopOnOpen = false,
  allLabel,
  categories,
  className = "",
  emptyLabel,
  onChange,
  onDeleteCategory,
  onMoveCategory,
  t,
  value
}: {
  allowCreate?: boolean;
  alignToTopOnOpen?: boolean;
  allLabel?: string;
  categories: string[];
  className?: string;
  emptyLabel?: string;
  onChange: (category: string) => void;
  onDeleteCategory?: (category: string) => void;
  onMoveCategory?: (category: string) => void;
  t: Messages;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const emptyText = getAdminCategoryFilterEmpty(t);
  const normalizedValue = normalizeAdminCategoryValue(value);
  const selectedLabel = normalizedValue
    ? isAllCategoryValue(normalizedValue) && allLabel
      ? allLabel
      : getCategoryLabel(normalizedValue, t)
    : (emptyLabel ?? getCategoryLabel("All", t));
  const displaySelectedLabel = getAdminCategoryDisplayLabel(selectedLabel);
  const createCategoryName = query.trim();
  const isFilteringCategories = Boolean(query.trim());
  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const uniqueCategories = Array.from(
      new Set(categories.map(normalizeAdminCategoryValue))
    );

    if (!normalizedQuery) {
      return uniqueCategories;
    }

    return uniqueCategories.filter((category) => {
      const label = getCategoryLabel(category, t);

      return `${category} ${label}`.toLowerCase().includes(normalizedQuery);
    });
  }, [categories, query, t]);
  const canCreateCategory = useMemo(() => {
    const normalizedName = createCategoryName.toLowerCase();

    if (
      !allowCreate ||
      !normalizedName ||
      isAllCategoryValue(createCategoryName) ||
      isFeaturedCategoryValue(createCategoryName)
    ) {
      return false;
    }

    return !categories.some((category) => {
      const label = getCategoryLabel(category, t).toLowerCase();

      return (
        normalizeAdminCategoryValue(category).toLowerCase() === normalizedName ||
        label === normalizedName
      );
    });
  }, [allowCreate, categories, createCategoryName, t]);
  const categoryWidthChars = useMemo(() => {
    const labels = [
      selectedLabel,
      ...categories.map((category) =>
        getCategoryLabel(normalizeAdminCategoryValue(category), t)
      )
    ];

    return Math.max(6, ...labels.map(getAdminCategoryLabelWidth));
  }, [categories, selectedLabel, t]);
  const categoryFilterStyle = {
    "--admin-category-filter-text-width": `${categoryWidthChars}em`
  } as CSSProperties;

  function selectCategory(category: string) {
    onChange(normalizeAdminCategoryValue(category));
    setOpen(false);
  }

  function scrollFilterToDialogTop() {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const target = root.closest(".tool-form-field") ?? root;
    const scrollContainer = root.closest(".dialog-body") as HTMLElement | null;

    if (!scrollContainer) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop = scrollContainer.scrollTop + targetRect.top - containerRect.top;

    scrollContainer.scrollTo({
      behavior: "smooth",
      top: Math.max(0, nextTop)
    });
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    if (alignToTopOnOpen) {
      window.requestAnimationFrame(scrollFilterToDialogTop);
      window.setTimeout(scrollFilterToDialogTop, 80);
      window.setTimeout(scrollFilterToDialogTop, 180);
    }

    window.setTimeout(
      () => searchRef.current?.focus({ preventScroll: true }),
      alignToTopOnOpen ? 220 : 0
    );
  }, [alignToTopOnOpen, open]);

  return (
    <div
      className={`admin-category-filter ${className} ${open ? "is-open" : ""}`}
      ref={rootRef}
      style={categoryFilterStyle}
    >
      {open ? (
        <div
          className="admin-category-filter-trigger is-searching"
          role="combobox"
          aria-expanded="true"
          aria-haspopup="listbox"
        >
          <Tags size={16} />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canCreateCategory) {
                event.preventDefault();
                selectCategory(createCategoryName);
              }
            }}
            placeholder={displaySelectedLabel}
          />
          <button
            className="admin-category-filter-arrow"
            type="button"
            aria-label={t.actions.close}
            onClick={() => setOpen(false)}
          >
            <ChevronDown size={15} />
          </button>
        </div>
      ) : (
        <button
          className="admin-category-filter-trigger"
          type="button"
          aria-expanded="false"
          aria-haspopup="listbox"
          onClick={() => setOpen(true)}
        >
          <Tags size={16} />
          <span className="admin-category-filter-value" title={selectedLabel}>
            {displaySelectedLabel}
          </span>
          <span className="admin-category-filter-arrow admin-category-filter-arrow-indicator">
            <ChevronDown size={15} />
          </span>
        </button>
      )}

      {open ? (
        <div className="admin-category-filter-popover">
          {canCreateCategory ? (
            <button
              className="admin-category-create-option"
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => selectCategory(createCategoryName)}
            >
              <Plus size={15} />
              <span>{getAdminCategoryCreateLabel(t, createCategoryName)}</span>
            </button>
          ) : null}
          {filteredCategories.length > 0 || !canCreateCategory ? (
            <div className="admin-category-filter-list" role="listbox">
              {filteredCategories.length > 0 ? (
              <>
                {filteredCategories.map((category) => {
                  const selected = category === normalizedValue;
                  const canDelete = Boolean(onDeleteCategory);
                  const categoryLabel = getCategoryLabel(category, t);
                  const displayCategoryLabel =
                    getAdminCategoryDisplayLabel(categoryLabel);
                  const movableCategories = filteredCategories.filter(
                    isPersistableAdminCategory
                  );
                  const canMove =
                    Boolean(onMoveCategory) &&
                    !isFilteringCategories &&
                    isPersistableAdminCategory(category) &&
                    movableCategories.length > 1;

                  return (
                    <div className="admin-category-filter-option" key={category}>
                      <button
                        className={`admin-category-select-option ${
                          selected ? "is-selected" : ""
                        }`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => selectCategory(category)}
                      >
                        <span title={categoryLabel}>{displayCategoryLabel}</span>
                      </button>
                      {canMove || canDelete ? (
                        <div className="admin-category-option-actions">
                          {canMove ? (
                            <button
                              className="admin-category-move-option"
                              type="button"
                              aria-label={getAdminCategoryMoveLabel(t, category)}
                              title={getAdminCategoryMoveLabel(t, category)}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                onMoveCategory?.(category);
                              }}
                            >
                              <ArrowUp size={14} />
                            </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              className="admin-category-delete-option"
                              type="button"
                              aria-label={getAdminCategoryDeleteLabel(t, category)}
                              title={getAdminCategoryDeleteLabel(t, category)}
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setOpen(false);
                                onDeleteCategory?.(category);
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="admin-category-filter-empty">
                {emptyText}
              </div>
            )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AdminToolCard({
  isFeaturedUpdating,
  onDelete,
  onEdit,
  onToggleFeatured,
  proxySettings,
  t,
  tool
}: {
  isFeaturedUpdating: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggleFeatured: () => void;
  proxySettings: ProxySettings;
  t: Messages;
  tool: Tool;
}) {
  const displayDate = formatAdminDate(tool.created_at ?? tool.updated_at);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<"url" | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const copiedLinkTimer = useRef<number | null>(null);
  const isGitHubTool = isGitHubUrl(tool.url);
  const toolHref = proxifyUrl(tool.url, proxySettings);

  useEffect(() => {
    if (!actionsOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActionsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [actionsOpen]);

  useEffect(() => {
    return () => {
      if (copiedLinkTimer.current) {
        window.clearTimeout(copiedLinkTimer.current);
      }
    };
  }, []);

  async function copyToolLink(kind: "url", value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedLink(kind);

    if (copiedLinkTimer.current) {
      window.clearTimeout(copiedLinkTimer.current);
    }

    copiedLinkTimer.current = window.setTimeout(() => {
      setCopiedLink(null);
      copiedLinkTimer.current = null;
    }, 1200);
  }

  return (
    <article className="admin-tool-card">
      <div className="admin-tool-card-head">
        <span className={`admin-tool-avatar ${isGitHubTool ? "is-github" : ""}`}>
          {isGitHubTool ? (
            <Github size={25} strokeWidth={2.1} fill="currentColor" />
          ) : (
            <>
              <span>{getToolInitials(tool.name)}</span>
              <img
                src={proxifyUrl(createAdminIconFromUrl(tool.url), proxySettings)}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </>
          )}
        </span>
        <div className="admin-tool-title">
          <div className="admin-tool-title-row">
            <h2>{tool.name}</h2>
          </div>
          <div className="admin-tool-title-meta">
            {displayDate ? (
              <span>
                {displayDate}
              </span>
            ) : null}
          </div>
        </div>
        <div className="admin-tool-card-actions" ref={actionsRef}>
          <button
            className="icon-button admin-tool-copy-button"
            type="button"
            aria-label={`${t.actions.copy}: ${tool.url}`}
            onClick={() => void copyToolLink("url", tool.url)}
          >
            {copiedLink === "url" ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <button
            className={`icon-button admin-featured-badge ${
              tool.featured ? "is-active" : ""
            }`}
            type="button"
            aria-label={t.form.featuredTool}
            aria-pressed={tool.featured}
            disabled={isFeaturedUpdating}
            onClick={onToggleFeatured}
          >
            <Star size={16} fill={tool.featured ? "currentColor" : "none"} />
          </button>
          <button
            className={`icon-button admin-tool-menu-trigger ${
              actionsOpen ? "is-active" : ""
            }`}
            type="button"
            aria-expanded={actionsOpen}
            aria-haspopup="menu"
            aria-label={`${tool.name} actions`}
            onClick={() => setActionsOpen((current) => !current)}
          >
            <ChevronDown size={17} />
          </button>
          {actionsOpen ? (
            <div className="admin-tool-action-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onEdit();
                }}
              >
                <SquarePen size={18} />
                <span className="admin-action-label-full">{t.admin.editTool}</span>
                <span className="admin-action-label-short">
                  {getCompactAdminActionLabel(t.admin.editTool)}
                </span>
              </button>
              <button
                className="danger"
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onDelete();
                }}
              >
                <Eraser size={18} />
                <span className="admin-action-label-full">{t.admin.deleteTool}</span>
                <span className="admin-action-label-short">
                  {getCompactAdminActionLabel(t.admin.deleteTool)}
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <p className="admin-tool-description">{tool.description}</p>

      <div className="admin-tool-links">
        <div className="admin-tool-link-row" title={tool.url}>
          <a
            className="admin-tool-link-text"
            href={toolHref}
            rel="noreferrer"
            target="_blank"
            aria-label={`${t.actions.visit}: ${tool.name}`}
          >
            {tool.url}
          </a>
        </div>
      </div>

      <div className="admin-tool-card-footer">
        <CompactTagRow tags={tool.tags} />
      </div>
    </article>
  );
}

function AdminArticleCard({
  article,
  articleText,
  isPublishUpdating,
  onDelete,
  onEdit,
  onTogglePublished
}: {
  article: Article;
  articleText: ReturnType<typeof getArticleText>;
  isPublishUpdating: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onTogglePublished: () => void;
}) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const displayDate = formatAdminDate(
    article.published_at ?? article.updated_at ?? article.created_at
  );
  const displayTitle = getArticleDisplayTitle(article);
  const articleHref = createArticleBrowseHref(article.slug, article.published);

  useEffect(() => {
    if (!actionsOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActionsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [actionsOpen]);

  return (
    <article className="admin-tool-card admin-article-card">
      <div className="admin-tool-card-head">
        <div className="admin-tool-title">
          <div className="admin-tool-title-row">
            <h2>{displayTitle}</h2>
          </div>
          <div className="admin-tool-title-meta">
            {displayDate ? <span>{displayDate}</span> : null}
            <span>
              {article.published
                ? articleText.statusPublished
                : articleText.statusDraft}
            </span>
          </div>
        </div>
        <div className="admin-tool-card-actions" ref={actionsRef}>
          <button
            className={`icon-button admin-article-publish-button ${
              article.published ? "is-active" : ""
            }`}
            type="button"
            aria-label={
              article.published
                ? articleText.statusPublished
                : articleText.publishedLabel
            }
            aria-pressed={article.published}
            disabled={isPublishUpdating}
            onClick={onTogglePublished}
          >
            {article.published ? (
              <CheckCircle2 size={16} />
            ) : (
              <CircleStop size={16} />
            )}
          </button>
          <button
            className={`icon-button admin-tool-menu-trigger ${
              actionsOpen ? "is-active" : ""
            }`}
            type="button"
            aria-expanded={actionsOpen}
            aria-haspopup="menu"
            aria-label={`${displayTitle} actions`}
            onClick={() => setActionsOpen((current) => !current)}
          >
            <ChevronDown size={17} />
          </button>
          {actionsOpen ? (
            <div className="admin-tool-action-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onEdit();
                }}
              >
                <SquarePen size={18} />
                <span className="admin-action-label-full">
                  {articleText.editArticle}
                </span>
                <span className="admin-action-label-short">
                  {getCompactAdminActionLabel(articleText.editArticle)}
                </span>
              </button>
              <button
                className="danger"
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onDelete();
                }}
              >
                <Eraser size={18} />
                <span className="admin-action-label-full">
                  {articleText.deleteArticle}
                </span>
                <span className="admin-action-label-short">
                  {getCompactAdminActionLabel(articleText.deleteArticle)}
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <p className="admin-tool-description">{cleanArticleDisplayText(article.summary)}</p>

      <div className="admin-tool-links">
        <div className="admin-tool-link-row" title={articleHref}>
          <a
            className="admin-tool-link-text"
            href={articleHref}
            rel="noreferrer"
            target="_blank"
            aria-label={articleHref}
          >
            {articleHref}
          </a>
        </div>
      </div>

      <div className="admin-tool-card-footer">
        <CompactTagRow
          tags={Array.from(new Set([article.category, ...article.tags].filter(Boolean)))}
        />
      </div>
    </article>
  );
}

function AdminToolCardSkeleton() {
  return (
    <article className="admin-tool-card admin-tool-card-skeleton skeleton-card" aria-hidden="true">
      <div className="admin-tool-card-head">
        <span className="skeleton-shimmer admin-skeleton-avatar" />
        <div className="admin-tool-title admin-skeleton-title">
          <div className="admin-tool-title-row">
            <span className="skeleton-shimmer skeleton-line admin-skeleton-name" />
          </div>
          <div className="admin-tool-title-meta admin-skeleton-title-meta">
            <span className="skeleton-shimmer skeleton-line admin-skeleton-date" />
          </div>
        </div>
        <div className="admin-skeleton-actions">
          <span className="skeleton-shimmer" />
          <span className="skeleton-shimmer" />
          <span className="skeleton-shimmer" />
        </div>
      </div>

      <div className="admin-skeleton-description">
        <span className="skeleton-shimmer skeleton-line" />
        <span className="skeleton-shimmer skeleton-line is-medium" />
      </div>

      <div className="admin-tool-links admin-skeleton-links">
        <div className="admin-tool-link-row">
          <span className="skeleton-shimmer skeleton-line" />
        </div>
      </div>

      <div className="admin-tool-card-footer">
        <div className="skeleton-tag-row">
          <span className="skeleton-shimmer skeleton-tag" />
          <span className="skeleton-shimmer skeleton-tag" />
          <span className="skeleton-shimmer skeleton-tag is-small" />
        </div>
      </div>
    </article>
  );
}

function AdminArticleCardSkeleton() {
  return (
    <article
      className="admin-tool-card admin-article-card admin-article-card-skeleton skeleton-card"
      aria-hidden="true"
    >
      <div className="admin-tool-card-head">
        <div className="admin-tool-title admin-skeleton-title">
          <div className="admin-tool-title-row">
            <span className="skeleton-shimmer skeleton-line admin-skeleton-name" />
          </div>
          <div className="admin-tool-title-meta admin-skeleton-title-meta">
            <span className="skeleton-shimmer skeleton-line admin-skeleton-date" />
            <span className="skeleton-shimmer skeleton-line admin-skeleton-status" />
          </div>
        </div>
        <div className="admin-skeleton-actions admin-article-skeleton-actions">
          <span className="skeleton-shimmer" />
          <span className="skeleton-shimmer" />
        </div>
      </div>

      <div className="admin-skeleton-description">
        <span className="skeleton-shimmer skeleton-line" />
        <span className="skeleton-shimmer skeleton-line is-medium" />
      </div>

      <div className="admin-tool-links admin-skeleton-links">
        <div className="admin-tool-link-row">
          <span className="skeleton-shimmer skeleton-line" />
        </div>
      </div>

      <div className="admin-tool-card-footer">
        <div className="skeleton-tag-row">
          <span className="skeleton-shimmer skeleton-tag" />
          <span className="skeleton-shimmer skeleton-tag" />
          <span className="skeleton-shimmer skeleton-tag is-small" />
        </div>
      </div>
    </article>
  );
}

function ContentFlowSkeleton() {
  return (
    <section
      className="content-flow-layout content-flow-skeleton"
      aria-hidden="true"
    >
      <aside className="content-flow-rail">
        <div className="content-flow-section-head">
          <span className="skeleton-shimmer skeleton-line is-short" />
          <span className="skeleton-shimmer skeleton-line is-long" />
          <span className="skeleton-shimmer skeleton-line is-medium" />
        </div>

        <div className="content-source-list">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="content-source-item content-source-item-skeleton" key={index}>
              <span className="skeleton-shimmer content-source-icon" />
              <div className="content-source-copy">
                <span className="skeleton-shimmer skeleton-line is-medium" />
                <span className="skeleton-shimmer skeleton-line is-short" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="content-flow-main">
        <div className="content-item-list">
          {Array.from({ length: 4 }).map((_, index) => (
            <article className="content-item-card has-cover content-item-card-skeleton" key={index}>
              <div className="content-item-main">
                <div className="content-item-meta">
                  <span className="skeleton-shimmer skeleton-line is-short" />
                  <span className="skeleton-shimmer skeleton-line is-short" />
                </div>
                <span className="skeleton-shimmer skeleton-line is-long" />
                <div className="admin-skeleton-description">
                  <span className="skeleton-shimmer skeleton-line" />
                  <span className="skeleton-shimmer skeleton-line is-medium" />
                </div>
                <div className="content-item-actions">
                  <span className="skeleton-shimmer content-action-skeleton" />
                  <span className="skeleton-shimmer content-action-skeleton" />
                  <span className="skeleton-shimmer content-action-skeleton" />
                </div>
              </div>
              <span className="skeleton-shimmer content-item-cover" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdminSettingsHeadingSkeleton({ withStatus = false }: { withStatus?: boolean }) {
  return (
    <div
      className={`admin-settings-heading-skeleton ${
        withStatus ? "has-status" : ""
      }`.trim()}
    >
      <span className="skeleton-shimmer skeleton-line is-medium" />
      {withStatus ? <span className="skeleton-shimmer source-card-status" /> : null}
      <span className="skeleton-shimmer skeleton-line is-long" />
    </div>
  );
}

function AdminSettingsFieldSkeleton({
  textareaClassName = ""
}: {
  textareaClassName?: string;
}) {
  const isTextarea = Boolean(textareaClassName);

  return (
    <div className="admin-settings-field-skeleton">
      <span className="skeleton-shimmer skeleton-line is-short" />
      <span
        className={`skeleton-shimmer ${
          isTextarea ? textareaClassName : "admin-settings-input-skeleton"
        }`.trim()}
      />
    </div>
  );
}

function AdminSettingsActionsSkeleton({
  className = "source-public-actions",
  count = 2
}: {
  className?: string;
  count?: number;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <span
          className={`skeleton-shimmer admin-settings-button-skeleton ${
            index > 0 ? "is-secondary" : ""
          }`.trim()}
          key={index}
        />
      ))}
    </div>
  );
}

function AdminSystemSettingsSkeleton() {
  return (
    <section
      className="admin-system-settings admin-panel-skeleton"
      aria-hidden="true"
    >
      <div className="system-settings-grid">
        <div className="system-settings-column system-settings-primary">
          <article className="source-public-card site-identity-card admin-settings-card-skeleton">
            <AdminSettingsHeadingSkeleton />
            <div className="proxy-settings-form">
              {Array.from({ length: 3 }).map((_, index) => (
                <AdminSettingsFieldSkeleton key={index} />
              ))}
              <span className="skeleton-shimmer skeleton-line is-medium admin-settings-help-skeleton" />
              <div className="site-icon-upload-row admin-settings-upload-row-skeleton">
                <span className="skeleton-shimmer admin-settings-button-skeleton" />
                <span className="skeleton-shimmer skeleton-line is-medium" />
              </div>
              <span className="skeleton-shimmer skeleton-line is-long admin-settings-help-skeleton" />
              <div className="site-identity-footer">
                <div className="site-identity-preview-shell">
                  <div className="site-identity-preview">
                    <span className="skeleton-shimmer admin-settings-logo-skeleton" />
                    <span className="admin-settings-preview-lines">
                      <span className="skeleton-shimmer skeleton-line is-medium" />
                      <span className="skeleton-shimmer skeleton-line is-short" />
                    </span>
                  </div>
                </div>
                <AdminSettingsActionsSkeleton className="site-identity-actions" />
              </div>
            </div>
          </article>

          <article className="source-public-card about-settings-card admin-settings-card-skeleton">
            <AdminSettingsHeadingSkeleton />
            <div className="footer-settings-form">
              <AdminSettingsFieldSkeleton textareaClassName="admin-settings-textarea-skeleton is-about" />
              <AdminSettingsActionsSkeleton />
            </div>
          </article>

          <article className="source-public-card footer-settings-card admin-settings-card-skeleton">
            <AdminSettingsHeadingSkeleton />
            <div className="footer-settings-form">
              <AdminSettingsFieldSkeleton textareaClassName="admin-settings-textarea-skeleton is-footer-intro" />
              <div className="footer-settings-pair">
                <AdminSettingsFieldSkeleton />
                <AdminSettingsFieldSkeleton />
              </div>
              <AdminSettingsFieldSkeleton textareaClassName="admin-settings-textarea-skeleton is-footer-links" />
              <AdminSettingsFieldSkeleton textareaClassName="admin-settings-textarea-skeleton is-footer-groups" />
              <span className="skeleton-shimmer skeleton-line is-long admin-settings-help-skeleton" />
              <AdminSettingsActionsSkeleton />
            </div>
          </article>
        </div>

        <div className="system-settings-column system-settings-secondary">
          <article className="source-public-card github-submission-card admin-settings-card-skeleton">
            <GitHubSettingsFormSkeleton />
          </article>

          <article className="source-public-card admin-security-card admin-settings-card-skeleton">
            <AdminSettingsHeadingSkeleton />
            <span className="skeleton-shimmer skeleton-line is-medium admin-settings-help-skeleton" />
            <div className="admin-security-form">
              {Array.from({ length: 3 }).map((_, index) => (
                <AdminSettingsFieldSkeleton key={index} />
              ))}
              <span className="skeleton-shimmer admin-settings-button-skeleton" />
            </div>
          </article>

          <article className="source-public-card public-source-card admin-settings-card-skeleton">
            <AdminSettingsHeadingSkeleton withStatus />
            <span className="skeleton-shimmer skeleton-line is-short source-public-label" />
            <span className="skeleton-shimmer admin-settings-code-skeleton" />
            <AdminSettingsActionsSkeleton count={3} />
          </article>

          <article className="source-public-card proxy-settings-card admin-settings-card-skeleton">
            <AdminSettingsHeadingSkeleton withStatus />
            <span className="skeleton-shimmer skeleton-line is-long admin-settings-help-skeleton" />
            <div className="proxy-settings-form">
              <AdminSettingsFieldSkeleton />
              <AdminSettingsFieldSkeleton />
              <span className="skeleton-shimmer skeleton-line is-long admin-settings-help-skeleton" />
              <span className="skeleton-shimmer skeleton-line is-medium admin-settings-help-skeleton" />
              <AdminSettingsActionsSkeleton />
            </div>
          </article>

          <article className="source-public-card backup-restore-card admin-settings-card-skeleton">
            <AdminSettingsHeadingSkeleton />
            <div>
              <span className="skeleton-shimmer skeleton-line is-medium" />
              <span className="skeleton-shimmer skeleton-line is-long" />
            </div>
            <AdminSettingsActionsSkeleton count={3} />
          </article>

          <article className="source-public-card factory-reset-card admin-settings-card-skeleton">
            <AdminSettingsHeadingSkeleton />
            <div>
              <span className="skeleton-shimmer skeleton-line is-medium" />
              <span className="skeleton-shimmer skeleton-line is-long" />
            </div>
            <AdminSettingsActionsSkeleton count={1} />
          </article>
        </div>
      </div>
    </section>
  );
}

function AdminLinkCheckSkeleton() {
  return (
    <section className="admin-link-check admin-panel-skeleton" aria-hidden="true">
      <section className="source-import-panel">
        <div className="source-import-main">
          <div className="link-check-heading">
            <span className="skeleton-shimmer skeleton-line is-medium" />
            <span className="skeleton-shimmer skeleton-line is-long" />
          </div>
          <AdminSettingsFieldSkeleton />
          <div className="source-mode-row">
            <span className="skeleton-shimmer skeleton-line is-short" />
            <div className="source-mode-toggle source-mode-toggle-skeleton">
              <span className="skeleton-shimmer admin-settings-button-skeleton" />
              <span className="skeleton-shimmer admin-settings-button-skeleton is-secondary" />
            </div>
            <span className="skeleton-shimmer skeleton-line is-long" />
          </div>
          <AdminSettingsActionsSkeleton className="source-action-row" count={3} />
        </div>
      </section>

      <div className="link-check-hero">
        <div className="link-check-heading">
          <span className="skeleton-shimmer skeleton-line is-medium" />
          <span className="skeleton-shimmer skeleton-line is-long" />
        </div>
        <div className="link-check-config">
          {Array.from({ length: 2 }).map((_, index) => (
            <AdminSettingsFieldSkeleton key={index} />
          ))}
        </div>
        <AdminSettingsActionsSkeleton className="link-check-actions" count={5} />
      </div>

      <div className="link-check-stats">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index}>
            <span className="skeleton-shimmer skeleton-line is-short" />
            <span className="skeleton-shimmer skeleton-line is-medium" />
          </div>
        ))}
      </div>

      <section className="link-check-progress">
        <div className="link-check-progress-head">
          <div>
            <span className="skeleton-shimmer skeleton-line is-medium" />
            <span className="skeleton-shimmer skeleton-line is-long" />
          </div>
          <span className="skeleton-shimmer link-check-percent-skeleton" />
        </div>
        <div className="link-check-progress-track" aria-hidden="true">
          <span className="skeleton-shimmer link-check-progress-skeleton-bar" />
        </div>
      </section>

      <section className="link-check-results">
        <div className="link-check-results-head">
          <div>
            <span className="skeleton-shimmer skeleton-line is-medium" />
            <span className="skeleton-shimmer skeleton-line is-long" />
          </div>
        </div>
        <div className="link-check-tabs link-check-tabs-skeleton">
          {Array.from({ length: 3 }).map((_, index) => (
            <span className="skeleton-shimmer admin-settings-button-skeleton" key={index} />
          ))}
        </div>
        <div className="admin-link-table-skeleton">
          {Array.from({ length: 6 }).map((_, index) => (
            <span className="skeleton-shimmer skeleton-line" key={index} />
          ))}
        </div>
      </section>
    </section>
  );
}

function AdminSystemSettingsPanel({
  maintenanceText,
  onProxySettingsChange,
  onDataRestored,
  onSiteSettingsChange,
  proxySettings,
  setStatus,
  siteSettings,
  t,
  token
}: {
  maintenanceText: ReturnType<typeof getAdminMaintenanceText>;
  onProxySettingsChange: (settings: ProxySettings) => void;
  onDataRestored: () => Promise<void>;
  onSiteSettingsChange: (settings: SiteSettings) => void;
  proxySettings: ProxySettings;
  setStatus: (status: string) => void;
  siteSettings: SiteSettings;
  t: Messages;
  token: string;
}) {
  const [sourceSettings, setSourceSettings] = useState<SourceSettings | null>(null);
  const [securitySettings, setSecuritySettings] =
    useState<AdminSecuritySettings | null>(null);
  const [sourceSettingsLoading, setSourceSettingsLoading] = useState(true);
  const [sourceSettingsSaving, setSourceSettingsSaving] = useState(false);
  const [proxySaving, setProxySaving] = useState(false);
  const [proxyForm, setProxyForm] = useState(proxySettings);
  const [siteForm, setSiteForm] = useState(() =>
    getEditableSiteSettings(siteSettings)
  );
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteResetting, setSiteResetting] = useState(false);
  const [aboutResetting, setAboutResetting] = useState(false);
  const [footerResetting, setFooterResetting] = useState(false);
  const [siteIconFileName, setSiteIconFileName] = useState("");
  const [sitePreviewFailed, setSitePreviewFailed] = useState(false);
  const [sitePreviewRetryToken, setSitePreviewRetryToken] = useState(0);
  const sitePreviewIconUrl = siteForm.iconUrl.trim();
  const sitePreviewIconSrc = useMemo(
    () => addSiteIconRetryParam(sitePreviewIconUrl, sitePreviewRetryToken),
    [sitePreviewIconUrl, sitePreviewRetryToken]
  );
  const [footerSocialLinksText, setFooterSocialLinksText] = useState(
    formatFooterJson(getSiteFooterSettings(siteSettings).socialLinks)
  );
  const [footerGroupsText, setFooterGroupsText] = useState(
    formatFooterJson(getSiteFooterSettings(siteSettings).groups)
  );
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [backupFileName, setBackupFileName] = useState("");
  const [backupPayload, setBackupPayload] = useState<HtoolsBackup | null>(null);
  const [backupExporting, setBackupExporting] = useState(false);
  const [backupRestoring, setBackupRestoring] = useState(false);
  const [factoryResetting, setFactoryResetting] = useState(false);
  const [pendingBackupRestore, setPendingBackupRestore] = useState(false);
  const [pendingFactoryReset, setPendingFactoryReset] = useState(false);

  function clearMessage() {
    setStatus("");
  }

  function getSecurityErrorMessage(error: unknown) {
    const message = getLocalizedErrorMessage(error, t);

    if (message === "currentPassword is required.") {
      return maintenanceText.securityCurrentRequired;
    }

    if (message === "newPassword is required.") {
      return maintenanceText.securityNewRequired;
    }

    if (message === "Current password is incorrect.") {
      return maintenanceText.securityCurrentIncorrect;
    }

    return message;
  }

  function getSiteSettingsErrorMessage(error: unknown) {
    const message = getLocalizedErrorMessage(error, t);

    if (
      message === "site icon URL must be a valid http/https URL." ||
      message === "site icon must be a valid http/https URL or supported image data."
    ) {
      return maintenanceText.siteIconInvalid;
    }

    return message;
  }

  function syncSiteSettingsForm(settings: SiteSettings) {
    const footer = getSiteFooterSettings(settings);

    setSiteForm(getEditableSiteSettings(settings));
    setFooterSocialLinksText(formatFooterJson(footer.socialLinks));
    setFooterGroupsText(formatFooterJson(footer.groups));
  }

  useEffect(() => {
    setProxyForm(proxySettings);
  }, [proxySettings]);

  useEffect(() => {
    syncSiteSettingsForm(siteSettings);
    setSiteIconFileName("");
  }, [siteSettings]);

  useEffect(() => {
    setSitePreviewFailed(false);
    setSitePreviewRetryToken(0);
  }, [siteForm.iconUrl]);

  function handleSitePreviewError() {
    if (!sitePreviewRetryToken && !isSiteIconDataUrl(sitePreviewIconUrl)) {
      setSitePreviewRetryToken(Date.now());
      return;
    }

    setSitePreviewFailed(true);
  }

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      setSourceSettingsLoading(true);

      try {
        const [source, security] = await Promise.all([
          loadSourceSettings(token),
          loadAdminSecuritySettings(token)
        ]);
        if (active) {
          setSourceSettings(source);
          setSecuritySettings(security);
        }
      } catch (error) {
        if (active) {
          setStatus(getLocalizedErrorMessage(error, t));
        }
      } finally {
        if (active) {
          setSourceSettingsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, [token]);

  async function togglePublicSource() {
    setSourceSettingsSaving(true);
    clearMessage();

    try {
      const settings = await saveSourceSettings(!(sourceSettings?.enabled ?? false), token);
      setSourceSettings(settings);
      setStatus(
        settings.enabled
          ? maintenanceText.publicEnabledMessage
          : maintenanceText.publicDisabledMessage
      );
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    } finally {
      setSourceSettingsSaving(false);
    }
  }

  async function saveProxy(nextSettings: ProxySettings) {
    const baseUrl = normalizeProxyBaseUrl(nextSettings.baseUrl);

    if (nextSettings.enabled && !baseUrl) {
      setStatus(
        nextSettings.baseUrl.trim()
          ? maintenanceText.proxyInvalid
          : maintenanceText.proxyRequired
      );
      return;
    }

    setProxySaving(true);
    clearMessage();

    try {
      const settings = await saveProxySettings(
        {
          enabled: nextSettings.enabled,
          baseUrl,
          mode: normalizeProxyMode(nextSettings.mode)
        },
        token
      );
      const normalizedSettings = {
        enabled: settings.enabled,
        baseUrl: normalizeProxyBaseUrl(settings.baseUrl),
        mode: normalizeProxyMode(settings.mode)
      };
      setProxyForm(normalizedSettings);
      onProxySettingsChange(normalizedSettings);
      setStatus(maintenanceText.proxyUpdated);
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    } finally {
      setProxySaving(false);
    }
  }

  function saveProxyForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveProxy(proxyForm);
  }

  function toggleProxy() {
    void saveProxy({
      ...proxyForm,
      enabled: !proxyForm.enabled
    });
  }

  function updateFooterForm(patch: Partial<FooterSettings>) {
    setSiteForm((current) => ({
      ...current,
      footer: {
        ...getFooterFormValues(current),
        ...patch
      }
    }));
  }

  function parseFooterJson<T>(value: string, fallback: T): T {
    if (!value.trim()) {
      return fallback;
    }

    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error("footer JSON must be an array.");
    }

    return parsed as T;
  }

  function buildSiteSettingsPayload(): SiteSettings {
    const footer = getSiteFooterSettings(siteForm);

    return {
      ...siteForm,
      footer: {
        ...footer,
        authorName: DEFAULT_FOOTER_SETTINGS.authorName,
        authorUrl: DEFAULT_FOOTER_SETTINGS.authorUrl,
        copyright: DEFAULT_FOOTER_SETTINGS.copyright,
        socialLinks: parseFooterJson(
          footerSocialLinksText,
          DEFAULT_FOOTER_SETTINGS.socialLinks
        ),
        groups: parseFooterJson(footerGroupsText, DEFAULT_FOOTER_SETTINGS.groups)
      }
    };
  }

  async function saveSiteForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSiteSaving(true);
    clearMessage();

    try {
      const settings = await saveSiteSettings(buildSiteSettingsPayload(), token);
      syncSiteSettingsForm(settings);
      onSiteSettingsChange(settings);
      setStatus(maintenanceText.siteUpdated);
    } catch (error) {
      setStatus(
        error instanceof SyntaxError
          ? maintenanceText.footerJsonInvalid
          : getSiteSettingsErrorMessage(error)
      );
    } finally {
      setSiteSaving(false);
    }
  }

  async function resetSiteIdentity() {
    setSiteResetting(true);
    clearMessage();

    try {
      const settings = await saveSiteSettings(
        {
          ...siteSettings,
          name: DEFAULT_SITE_SETTINGS.name,
          subtitle: DEFAULT_SITE_SETTINGS.subtitle,
          iconUrl: "",
          footer: getSiteFooterSettings(siteSettings)
        },
        token
      );
      setSiteIconFileName("");
      setSitePreviewFailed(false);
      syncSiteSettingsForm(settings);
      onSiteSettingsChange(settings);
      setStatus(maintenanceText.siteResetDone);
    } catch (error) {
      setStatus(getSiteSettingsErrorMessage(error));
    } finally {
      setSiteResetting(false);
    }
  }

  async function resetAboutPage() {
    setAboutResetting(true);
    clearMessage();

    try {
      const settings = await saveSiteSettings(
        {
          ...siteSettings,
          aboutContent: DEFAULT_SITE_SETTINGS.aboutContent,
          footer: getSiteFooterSettings(siteSettings)
        },
        token
      );
      syncSiteSettingsForm(settings);
      onSiteSettingsChange(settings);
      setStatus(maintenanceText.aboutResetDone);
    } catch (error) {
      setStatus(getSiteSettingsErrorMessage(error));
    } finally {
      setAboutResetting(false);
    }
  }

  async function resetFooterSettings() {
    setFooterResetting(true);
    clearMessage();

    try {
      const settings = await saveSiteSettings(
        {
          ...siteSettings,
          footer: DEFAULT_FOOTER_SETTINGS
        },
        token
      );
      syncSiteSettingsForm(settings);
      onSiteSettingsChange(settings);
      setStatus(maintenanceText.footerResetDone);
    } catch (error) {
      setStatus(getSiteSettingsErrorMessage(error));
    } finally {
      setFooterResetting(false);
    }
  }

  async function handleSiteIconFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const iconUrl = await readSiteIconFile(file);
      setSiteIconFileName(file.name);
      setSitePreviewFailed(false);
      setSiteForm((current) => ({
        ...current,
        iconUrl
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message === "site icon file is too large.") {
        setStatus(maintenanceText.siteIconUploadTooLarge);
        return;
      }

      setStatus(maintenanceText.siteIconUploadInvalid);
    }
  }

  async function saveSecuritySettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearMessage();

    if (!securityForm.currentPassword.trim()) {
      setStatus(maintenanceText.securityCurrentRequired);
      return;
    }

    if (!securityForm.newPassword.trim()) {
      setStatus(maintenanceText.securityNewRequired);
      return;
    }

    if (!securityForm.confirmPassword.trim()) {
      setStatus(maintenanceText.securityConfirmRequired);
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setStatus(maintenanceText.securityMismatch);
      return;
    }

    setSecuritySaving(true);

    try {
      const settings = await updateAdminPassword(
        {
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword
        },
        token
      );
      setSecuritySettings(settings);
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setStatus(maintenanceText.securityUpdated);
    } catch (error) {
      setStatus(getSecurityErrorMessage(error));
    } finally {
      setSecuritySaving(false);
    }
  }

  async function copyPublicSource() {
    const publicUrl = sourceSettings?.sourceUrl;

    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setStatus(maintenanceText.publicCopied);
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    }
  }

  async function factoryReset() {
    setFactoryResetting(true);
    clearMessage();

    try {
      const result = await resetFactorySettings(token);
      const settings = await loadSourceSettings(token);
      setSourceSettings(settings);
      setBackupFileName("");
      setBackupPayload(null);
      await onDataRestored();
      setStatus(maintenanceText.resetDone(result));
      setPendingFactoryReset(false);
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    } finally {
      setFactoryResetting(false);
    }
  }

  async function exportBackup() {
    setBackupExporting(true);
    clearMessage();

    try {
      const backup = await exportBackupData(token);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadTextFile(
        `htools-backup-${stamp}.json`,
        JSON.stringify(backup, null, 2),
        "application/json;charset=utf-8"
      );
      setStatus(maintenanceText.backupExported(backup.counts));
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    } finally {
      setBackupExporting(false);
    }
  }

  async function handleBackupFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const payload = JSON.parse(await file.text()) as unknown;
      const backup = readBackupPayload(payload, maintenanceText);
      setBackupFileName(file.name);
      setBackupPayload(backup);
      setStatus(maintenanceText.backupReady(file.name, backup.counts));
    } catch (error) {
      setBackupFileName("");
      setBackupPayload(null);
      setStatus(getLocalizedErrorMessage(error, t));
    }
  }

  async function restoreBackup() {
    if (!backupPayload) {
      setStatus(maintenanceText.backupEmpty);
      return;
    }

    setBackupRestoring(true);
    clearMessage();

    try {
      const result = await restoreBackupData(backupPayload, token);
      const [source, proxy, site] = await Promise.all([
        loadSourceSettings(token),
        loadProxySettings(),
        loadSiteSettings()
      ]);
      const normalizedProxy = {
        enabled: proxy.enabled,
        baseUrl: normalizeProxyBaseUrl(proxy.baseUrl),
        mode: normalizeProxyMode(proxy.mode)
      };

      setSourceSettings(source);
      setProxyForm(normalizedProxy);
      onProxySettingsChange(normalizedProxy);
      syncSiteSettingsForm(site);
      onSiteSettingsChange(site);
      await onDataRestored();
      const summary = maintenanceText.backupRestoreSummary(result);
      setStatus(summary);
      setPendingBackupRestore(false);
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    } finally {
      setBackupRestoring(false);
    }
  }

  const publicSourceEnabled = sourceSettings?.enabled ?? false;
  const publicSourceUrl =
    sourceSettings?.sourceUrl ?? new URL("/api/htools.json", window.location.origin).toString();
  const proxyEnabled = proxyForm.enabled;
  const footerForm = getFooterFormValues(siteForm);
  const siteSettingsBusy =
    siteSaving || siteResetting || aboutResetting || footerResetting;
  const showSourceSettingsSkeleton = useLoadingSkeleton(sourceSettingsLoading);

  if (sourceSettingsLoading) {
    return (
      <SkeletonVisibility visible={showSourceSettingsSkeleton}>
        <AdminSystemSettingsSkeleton />
      </SkeletonVisibility>
    );
  }

  return (
    <section className="admin-system-settings" aria-label={maintenanceText.systemTitle}>
      <div className="system-settings-grid">
        <div className="system-settings-column system-settings-primary">
          <article className="source-public-card site-identity-card">
          <div>
            <h3>{maintenanceText.siteTitle}</h3>
            <p>{maintenanceText.siteDescription}</p>
          </div>
          <form className="proxy-settings-form" onSubmit={saveSiteForm}>
            <label className="source-url-field">
              {maintenanceText.siteNameLabel}
              <input
                disabled={siteSettingsBusy}
                maxLength={40}
                onChange={(event) =>
                  setSiteForm({
                    ...siteForm,
                    name: event.target.value
                  })
                }
                placeholder={DEFAULT_SITE_SETTINGS.name}
                value={siteForm.name}
              />
            </label>
            <label className="source-url-field">
              {maintenanceText.siteSubtitleLabel}
              <input
                disabled={siteSettingsBusy}
                maxLength={60}
                onChange={(event) =>
                  setSiteForm({
                    ...siteForm,
                    subtitle: event.target.value
                  })
                }
                placeholder={DEFAULT_SITE_SETTINGS.subtitle}
                value={siteForm.subtitle}
              />
            </label>
            <label className="source-url-field">
              {maintenanceText.siteIconLabel}
              <input
                disabled={siteSettingsBusy}
                inputMode="url"
                onChange={(event) => {
                  setSiteIconFileName("");
                  setSiteForm({
                    ...siteForm,
                    iconUrl: event.target.value
                  });
                }}
                placeholder={maintenanceText.siteIconPlaceholder}
                type="url"
                value={isSiteIconDataUrl(siteForm.iconUrl) ? "" : siteForm.iconUrl}
              />
            </label>
            <p className="site-icon-choice-help">
              {maintenanceText.siteIconChoiceHelp}
            </p>
            <div className="site-icon-upload-row">
              <label className="ghost-button backup-file-picker site-icon-upload-button">
                <Upload size={16} />
                {maintenanceText.siteIconUpload}
                <input
                  accept={SITE_ICON_UPLOAD_ACCEPT}
                  disabled={siteSettingsBusy}
                  type="file"
                  onChange={handleSiteIconFile}
                />
              </label>
              {isSiteIconDataUrl(siteForm.iconUrl) ? (
                <span className="site-icon-upload-status">
                  {siteIconFileName || maintenanceText.siteIconUploaded}
                </span>
              ) : null}
            </div>
            <p className="site-icon-upload-help">
              {maintenanceText.siteIconUploadHint}
            </p>
            <div className="site-identity-footer">
              <div className="site-identity-preview-shell">
                <div className="site-identity-preview">
                  <span
                    className={`brand-mark compact-mark ${
                      sitePreviewIconUrl && !sitePreviewFailed ? "has-site-icon" : ""
                    }`.trim()}
                  >
                    {sitePreviewIconUrl && !sitePreviewFailed ? (
                      <img
                        className="site-brand-icon"
                        src={sitePreviewIconSrc}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={handleSitePreviewError}
                      />
                    ) : (
                      <Wand2 size={25} />
                    )}
                  </span>
                  <span>
                    <strong>{siteForm.name.trim() || DEFAULT_SITE_SETTINGS.name}</strong>
                    <small>{siteForm.subtitle.trim() || DEFAULT_SITE_SETTINGS.subtitle}</small>
                  </span>
                </div>
              </div>
              <div className="site-identity-actions">
                <button
                  className="primary-button"
                  disabled={siteSettingsBusy}
                  type="submit"
                >
                  {siteSaving ? maintenanceText.siteSaving : maintenanceText.siteSave}
                </button>
                <button
                  className="ghost-button settings-reset-button"
                  disabled={siteSettingsBusy}
                  type="button"
                  onClick={() => void resetSiteIdentity()}
                >
                  {siteResetting ? maintenanceText.siteResetting : maintenanceText.siteReset}
                </button>
              </div>
            </div>
          </form>
          </article>

          <article className="source-public-card about-settings-card">
          <div>
            <h3>{maintenanceText.aboutSettingsTitle}</h3>
            <p>{maintenanceText.aboutSettingsDescription}</p>
          </div>
          <form className="footer-settings-form" onSubmit={saveSiteForm}>
            <label className="source-url-field">
              {maintenanceText.aboutContentLabel}
              <textarea
                className="about-settings-textarea"
                disabled={siteSettingsBusy}
                placeholder={maintenanceText.aboutContentPlaceholder}
                rows={12}
                value={siteForm.aboutContent}
                onChange={(event) =>
                  setSiteForm({
                    ...siteForm,
                    aboutContent: event.target.value
                  })
                }
              />
            </label>
            <div className="source-public-actions">
              <button className="primary-button" disabled={siteSettingsBusy} type="submit">
                {siteSaving ? maintenanceText.siteSaving : maintenanceText.aboutSave}
              </button>
              <button
                className="ghost-button settings-reset-button"
                disabled={siteSettingsBusy}
                type="button"
                onClick={() => void resetAboutPage()}
              >
                {aboutResetting ? maintenanceText.aboutResetting : maintenanceText.aboutReset}
              </button>
            </div>
          </form>
          </article>

          <article className="source-public-card footer-settings-card">
          <div>
            <h3>{maintenanceText.footerTitle}</h3>
            <p>{maintenanceText.footerDescription}</p>
          </div>
          <form className="footer-settings-form" onSubmit={saveSiteForm}>
            <label className="source-url-field">
              {maintenanceText.footerIntroLabel}
              <textarea
                disabled={siteSettingsBusy}
                maxLength={180}
                placeholder={DEFAULT_FOOTER_SETTINGS.description}
                rows={3}
                value={footerForm.description}
                onChange={(event) =>
                  updateFooterForm({ description: event.target.value })
                }
              />
            </label>

            <div className="footer-settings-pair">
              <label className="source-url-field">
                {maintenanceText.footerSponsorLabel}
                <input
                  disabled={siteSettingsBusy}
                  maxLength={48}
                  placeholder={DEFAULT_FOOTER_SETTINGS.sponsorLabel}
                  value={footerForm.sponsorLabel}
                  onChange={(event) =>
                    updateFooterForm({ sponsorLabel: event.target.value })
                  }
                />
              </label>
              <label className="source-url-field">
                {maintenanceText.footerSponsorUrl}
                <input
                  disabled={siteSettingsBusy}
                  inputMode="url"
                  placeholder={DEFAULT_FOOTER_SETTINGS.sponsorUrl}
                  value={footerForm.sponsorUrl}
                  onChange={(event) =>
                    updateFooterForm({ sponsorUrl: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="source-url-field">
              {maintenanceText.footerSocialLinks}
              <textarea
                disabled={siteSettingsBusy}
                rows={5}
                value={footerSocialLinksText}
                onChange={(event) => setFooterSocialLinksText(event.target.value)}
              />
            </label>
            <label className="source-url-field">
              {maintenanceText.footerGroups}
              <textarea
                disabled={siteSettingsBusy}
                rows={8}
                value={footerGroupsText}
                onChange={(event) => setFooterGroupsText(event.target.value)}
              />
            </label>
            <p className="site-icon-choice-help">{maintenanceText.footerJsonHelp}</p>
            <div className="source-public-actions">
              <button className="primary-button" disabled={siteSettingsBusy} type="submit">
                {siteSaving ? maintenanceText.siteSaving : maintenanceText.footerSave}
              </button>
              <button
                className="ghost-button settings-reset-button"
                disabled={siteSettingsBusy}
                type="button"
                onClick={() => void resetFooterSettings()}
              >
                {footerResetting ? maintenanceText.footerResetting : maintenanceText.footerReset}
              </button>
            </div>
          </form>
          </article>
        </div>

        <div className="system-settings-column system-settings-secondary">
          <article className="source-public-card github-submission-card">
            <GitHubSettingsForm
              maintenanceText={maintenanceText}
              onStatus={setStatus}
              token={token}
              t={t}
            />
          </article>

          <article className="source-public-card admin-security-card">
          <div>
            <h3>{maintenanceText.securityTitle}</h3>
            <p>{maintenanceText.securityDescription}</p>
            {securitySettings?.updatedAt ? (
              <p>
                {maintenanceText.securityUpdatedAt(
                  formatAdminDate(securitySettings.updatedAt)
                )}
              </p>
            ) : null}
          </div>
          <form className="admin-security-form" onSubmit={saveSecuritySettings}>
            <label>
              {maintenanceText.securityCurrent}
              <input
                autoComplete="current-password"
                disabled={securitySaving}
                type="password"
                value={securityForm.currentPassword}
                onChange={(event) =>
                  setSecurityForm({
                    ...securityForm,
                    currentPassword: event.target.value
                  })
                }
              />
            </label>
            <label>
              {maintenanceText.securityNew}
              <input
                autoComplete="new-password"
                disabled={securitySaving}
                type="password"
                value={securityForm.newPassword}
                onChange={(event) =>
                  setSecurityForm({
                    ...securityForm,
                    newPassword: event.target.value
                  })
                }
              />
            </label>
            <label>
              {maintenanceText.securityConfirm}
              <input
                autoComplete="new-password"
                disabled={securitySaving}
                type="password"
                value={securityForm.confirmPassword}
                onChange={(event) =>
                  setSecurityForm({
                    ...securityForm,
                    confirmPassword: event.target.value
                  })
                }
              />
            </label>
            <button
              className="primary-button"
              disabled={securitySaving}
              type="submit"
            >
              <Lock size={16} />
              {securitySaving ? maintenanceText.securitySaving : maintenanceText.securitySave}
            </button>
          </form>
          </article>

          <article className="source-public-card public-source-card">
          <div className="source-card-heading">
            <h3>{maintenanceText.publicTitle}</h3>
            <span
              className={`source-card-status ${publicSourceEnabled ? "is-enabled" : ""}`}
            >
              {publicSourceEnabled
                ? maintenanceText.publicEnabled
                : maintenanceText.publicDisabled}
            </span>
            <p>{maintenanceText.publicDescription}</p>
          </div>
          <span className="source-public-label">
            {maintenanceText.publicSourceUrlLabel}
          </span>
          <code>{publicSourceUrl}</code>
          <div className="source-public-actions">
            <button
              className="primary-button"
              disabled={sourceSettingsLoading || sourceSettingsSaving}
              type="button"
              onClick={() => void togglePublicSource()}
            >
              {sourceSettingsSaving
                ? maintenanceText.publicOpening
                : publicSourceEnabled
                  ? maintenanceText.publicDisable
                  : maintenanceText.publicEnable}
            </button>
            <a
              className="ghost-button"
              href={publicSourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink size={16} />
              {maintenanceText.publicOpen}
            </a>
            <button
              className="ghost-button"
              disabled={!sourceSettings?.sourceUrl}
              type="button"
              onClick={() => void copyPublicSource()}
            >
              <Copy size={16} />
              {maintenanceText.publicCopy}
            </button>
          </div>
          </article>

          <article className="source-public-card proxy-settings-card">
          <div className="source-card-heading">
            <h3>{maintenanceText.proxyTitle}</h3>
            <span
              className={`source-card-status ${proxyEnabled ? "is-enabled" : ""}`}
            >
              {proxyEnabled
                ? maintenanceText.proxyEnabled
                : maintenanceText.proxyDisabled}
            </span>
            <p>{maintenanceText.proxyDescription}</p>
            <p className="proxy-warning-note">{maintenanceText.proxyWarning}</p>
          </div>
          <form className="proxy-settings-form" onSubmit={saveProxyForm}>
            <label className="source-url-field">
              {maintenanceText.proxyUrlLabel}
              <input
                disabled={proxySaving}
                onChange={(event) =>
                  setProxyForm({
                    ...proxyForm,
                    baseUrl: event.target.value
                  })
                }
                placeholder={maintenanceText.proxyPlaceholder}
                type="url"
                value={proxyForm.baseUrl}
              />
            </label>
            <label className="source-url-field">
              {maintenanceText.proxyModeLabel}
              <select
                disabled={proxySaving}
                onChange={(event) =>
                  setProxyForm({
                    ...proxyForm,
                    mode: normalizeProxyMode(event.target.value)
                  })
                }
                value={normalizeProxyMode(proxyForm.mode)}
              >
                <option value="prefix">{maintenanceText.proxyModePrefix}</option>
                <option value="edgeone-proxy">
                  {maintenanceText.proxyModeEdgeOneProxy}
                </option>
                <option value="edgeone-advanced">
                  {maintenanceText.proxyModeEdgeOneAdvanced}
                </option>
              </select>
            </label>
            <p>{maintenanceText.proxyHelp}</p>
            <p className="proxy-project-note">
              <span>{maintenanceText.proxyProjectNote}</span>
              <a
                className="proxy-project-link"
                href={EDGEONE_PROXY_PROJECT_URL}
                rel="noreferrer"
                target="_blank"
              >
                {maintenanceText.proxyProjectLink}
                <ArrowUpRight size={14} />
              </a>
            </p>
            <div className="source-public-actions">
              <button
                className="primary-button"
                disabled={proxySaving}
                type="button"
                onClick={toggleProxy}
              >
                {proxySaving
                  ? maintenanceText.proxySaving
                  : proxyEnabled
                    ? maintenanceText.proxyDisable
                    : maintenanceText.proxyEnable}
              </button>
              <button
                className="ghost-button"
                disabled={proxySaving}
                type="submit"
              >
                {proxySaving ? maintenanceText.proxySaving : maintenanceText.proxySave}
              </button>
            </div>
          </form>
          </article>

          <article className="source-public-card backup-restore-card">
          <div>
            <h3>{maintenanceText.backupTitle}</h3>
            <p>{maintenanceText.backupDescription}</p>
            <p>{maintenanceText.backupHelp}</p>
          </div>
          {backupFileName ? <code>{backupFileName}</code> : null}
          <div className="source-public-actions">
            <button
              className="primary-button"
              disabled={backupExporting || backupRestoring}
              type="button"
              onClick={() => void exportBackup()}
            >
              <Download size={16} />
              {backupExporting ? maintenanceText.backupExporting : maintenanceText.backupExport}
            </button>
            <label className="ghost-button backup-file-picker">
              <Upload size={16} />
              {maintenanceText.backupChoose}
              <input
                accept="application/json,.json"
                type="file"
                onChange={handleBackupFile}
              />
            </label>
            <button
              className="ghost-button"
              disabled={!backupPayload || backupExporting || backupRestoring}
              type="button"
              onClick={() => {
                if (!backupPayload) {
                  setStatus(maintenanceText.backupEmpty);
                  return;
                }

                setPendingBackupRestore(true);
              }}
            >
              <RefreshCw size={16} />
              {backupRestoring ? maintenanceText.backupRestoring : maintenanceText.backupRestore}
            </button>
          </div>
          </article>

          <article className="source-public-card factory-reset-card">
          <div>
            <h3>{maintenanceText.resetTitle}</h3>
            <p>{maintenanceText.resetDescription}</p>
            <p>{maintenanceText.resetWarning}</p>
          </div>
          <div className="source-public-actions">
            <button
              className="primary-button factory-reset-button"
              disabled={factoryResetting}
              type="button"
              onClick={() => setPendingFactoryReset(true)}
            >
              <Trash2 size={16} />
              {factoryResetting ? maintenanceText.resetting : maintenanceText.resetButton}
            </button>
          </div>
          </article>
        </div>
      </div>

      {pendingBackupRestore ? (
        <Dialog
          title={maintenanceText.backupTitle}
          closeLabel={t.actions.close}
          onClose={() => {
            if (!backupRestoring) {
              setPendingBackupRestore(false);
            }
          }}
          panelClassName="admin-delete-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                disabled={backupRestoring}
                type="button"
                onClick={() => setPendingBackupRestore(false)}
              >
                {t.status.deleteCancel}
              </button>
              <button
                className="primary-button"
                disabled={backupRestoring}
                type="button"
                onClick={() => void restoreBackup()}
              >
                {backupRestoring ? maintenanceText.backupRestoring : t.status.deleteContinue}
              </button>
            </>
          }
        >
          <p className="admin-delete-dialog-description">
            {maintenanceText.backupRestoreConfirm}
          </p>
        </Dialog>
      ) : null}

      {pendingFactoryReset ? (
        <Dialog
          title={maintenanceText.resetTitle}
          closeLabel={t.actions.close}
          onClose={() => {
            if (!factoryResetting) {
              setPendingFactoryReset(false);
            }
          }}
          panelClassName="admin-delete-dialog"
          footer={
            <>
              <button
                className="ghost-button"
                disabled={factoryResetting}
                type="button"
                onClick={() => setPendingFactoryReset(false)}
              >
                {t.status.deleteCancel}
              </button>
              <button
                className="primary-button"
                disabled={factoryResetting}
                type="button"
                onClick={() => void factoryReset()}
              >
                {factoryResetting ? maintenanceText.resetting : t.status.deleteContinue}
              </button>
            </>
          }
        >
          <p className="admin-delete-dialog-description">
            {maintenanceText.resetConfirm}
          </p>
        </Dialog>
      ) : null}
    </section>
  );
}

function AdminLinkCheckPanel({
  isLoadingTools,
  maintenanceText,
  onReloadTools,
  proxySettings,
  setStatus,
  t,
  token,
  tools
}: {
  isLoadingTools: boolean;
  maintenanceText: ReturnType<typeof getAdminMaintenanceText>;
  onReloadTools: () => Promise<void>;
  proxySettings: ProxySettings;
  setStatus: (status: string) => void;
  t: Messages;
  token: string;
  tools: Tool[];
}) {
  const [timeoutSeconds, setTimeoutSeconds] = useState(6);
  const [batchSize, setBatchSize] = useState(4);
  const [sourceUrl, setSourceUrl] = useState(DEFAULT_SOURCE_URL);
  const [sourceMode, setSourceMode] = useState<ToolImportMode>("skip");
  const [sourceItems, setSourceItems] = useState<unknown[] | null>(null);
  const [checkedSourceUrl, setCheckedSourceUrl] = useState("");
  const [sourceCheckedAt, setSourceCheckedAt] = useState("");
  const [sourceChecking, setSourceChecking] = useState(false);
  const [sourceImporting, setSourceImporting] = useState(false);
  const [sourceExporting, setSourceExporting] = useState(false);
  const [results, setResults] = useState<LinkCheckResult[]>([]);
  const [activeFilter, setActiveFilter] = useState("abnormal");
  const [checking, setChecking] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [wasStopped, setWasStopped] = useState(false);
  const stopRequested = useRef(false);
  const targets = useMemo(() => buildLinkCheckTargets(tools), [tools]);
  const toolById = useMemo(
    () => new Map(tools.map((tool) => [tool.id, tool])),
    [tools]
  );
  const sourcePreview = useMemo(
    () =>
      sourceItems
        ? createSourcePreview(sourceItems, tools, sourceMode, maintenanceText)
        : null,
    [maintenanceText, sourceItems, sourceMode, tools]
  );
  const totalCount = targets.length;
  const checkedCount = results.length;
  const normalCount = results.filter((result) => result.ok).length;
  const abnormalCount = results.filter((result) => !result.ok).length;
  const networkErrorCount = results.filter((result) => result.status === 0).length;
  const progress = totalCount ? Math.round((checkedCount / totalCount) * 100) : 0;
  const completed = totalCount > 0 && checkedCount === totalCount && !checking;
  const statusItems = useMemo(() => {
    const counts = new Map<number, number>();

    for (const result of results.filter((item) => !item.ok)) {
      counts.set(result.status, (counts.get(result.status) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort(([left], [right]) => left - right)
      .map(([status, count]) => ({
        status,
        count,
        value: `status:${status}`
      }));
  }, [results]);
  const filteredResults = useMemo(() => {
    if (activeFilter === "all") {
      return results;
    }

    if (activeFilter === "abnormal") {
      return results.filter((result) => !result.ok);
    }

    if (activeFilter.startsWith("status:")) {
      const status = Number(activeFilter.replace("status:", ""));
      return results.filter((result) => result.status === status);
    }

    return results;
  }, [activeFilter, results]);
  const emptyMessage = !results.length
    ? t.linkCheck.emptyNotStarted
    : completed && activeFilter === "abnormal" && abnormalCount === 0
      ? t.linkCheck.emptyNoBrokenLinks
      : t.linkCheck.emptyNoMatchingResults;
  const showToolsLoadingSkeleton = useLoadingSkeleton(isLoadingTools);

  if (isLoadingTools) {
    return (
      <SkeletonVisibility visible={showToolsLoadingSkeleton}>
        <AdminLinkCheckSkeleton />
      </SkeletonVisibility>
    );
  }

  async function checkSource(url = sourceUrl) {
    const nextUrl = normalizeSourceUrl(url);
    setSourceChecking(true);
    setStatus("");

    try {
      const items = await fetchToolSource(nextUrl, maintenanceText);
      const preview = createSourcePreview(items, tools, sourceMode, maintenanceText);
      setSourceUrl(nextUrl);
      setSourceItems(items);
      setCheckedSourceUrl(nextUrl);
      setSourceCheckedAt(new Date().toISOString());
      setStatus(maintenanceText.sourceChecked(preview.total));
    } catch (error) {
      setStatus(getSourceErrorMessage(error, maintenanceText, t));
      setSourceItems(null);
      setCheckedSourceUrl("");
      setSourceCheckedAt("");
    } finally {
      setSourceChecking(false);
    }
  }

  async function importSource() {
    const nextUrl = normalizeSourceUrl(sourceUrl);
    setSourceImporting(true);
    setStatus("");

    try {
      const items =
        sourceItems && checkedSourceUrl === nextUrl
          ? sourceItems
          : await fetchToolSource(nextUrl, maintenanceText);
      const result = await importTools(items, sourceMode, token);
      setSourceUrl(nextUrl);
      setSourceItems(items);
      setCheckedSourceUrl(nextUrl);
      setSourceCheckedAt(new Date().toISOString());
      setStatus(maintenanceText.sourceImportSummary(result));
      await onReloadTools();
    } catch (error) {
      setStatus(getSourceErrorMessage(error, maintenanceText, t));
    } finally {
      setSourceImporting(false);
    }
  }

  async function exportSource() {
    setSourceExporting(true);
    setStatus("");

    try {
      const source = await exportToolSourceData(token);
      downloadTextFile(
        "htools.json",
        JSON.stringify(source, null, 2),
        "application/json;charset=utf-8"
      );
      setStatus(maintenanceText.sourceExported(source.length));
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    } finally {
      setSourceExporting(false);
    }
  }

  async function reloadLinks() {
    if (checking) {
      return;
    }

    setLoadingLinks(true);
    setStatus("");

    try {
      await onReloadTools();
      setResults([]);
      setWasStopped(false);
      setActiveFilter("abnormal");
      setStatus(t.linkCheck.messages.reloaded);
    } catch (error) {
      setStatus(getLocalizedErrorMessage(error, t));
    } finally {
      setLoadingLinks(false);
    }
  }

  async function startCheck() {
    if (checking) {
      return;
    }

    const nextTimeout = clampInteger(timeoutSeconds, 1, 9, 6);
    const nextBatchSize = clampInteger(batchSize, 1, 10, 4);

    setTimeoutSeconds(nextTimeout);
    setBatchSize(nextBatchSize);

    if (!targets.length) {
      setStatus(t.linkCheck.messages.empty);
      return;
    }

    setChecking(true);
    setWasStopped(false);
    setResults([]);
    setActiveFilter("abnormal");
    setStatus("");
    stopRequested.current = false;

    try {
      for (let index = 0; index < targets.length; index += nextBatchSize) {
        if (stopRequested.current) {
          break;
        }

        const batch = targets.slice(index, index + nextBatchSize);

        try {
          const response = await checkLinks(batch, nextTimeout, token);
          setResults((current) => [...current, ...response.results]);
        } catch (error) {
          setResults((current) => [
            ...current,
            ...buildFailedLinkCheckResults(batch, error)
          ]);

          if (getErrorMessage(error).toLowerCase().includes("unauthorized")) {
            break;
          }
        }
      }

      const stopped = stopRequested.current;
      setWasStopped(stopped);
      setStatus(stopped ? t.linkCheck.messages.stopped : t.linkCheck.messages.completed);
    } finally {
      setChecking(false);
      stopRequested.current = false;
    }
  }

  function stopCheck() {
    stopRequested.current = true;
  }

  function clearResults() {
    setResults([]);
    setWasStopped(false);
    setActiveFilter("abnormal");
  }

  function exportResults() {
    const rows = results.filter((result) => !result.ok);

    if (!rows.length) {
      return;
    }

    const csv = createCsv([
      [
        "tool",
        "type",
        "url",
        "status",
        "result",
        "error",
        "duration",
        "checkedAt"
      ],
      ...rows.map((result) => [
        result.name,
        result.kind === "demoUrl"
          ? t.linkCheck.linkTypeDemo
          : t.linkCheck.linkTypeOfficial,
        result.url,
        result.status,
        getLinkCheckResultText(result, t),
        result.error ?? "",
        result.duration,
        result.checkedAt
      ])
    ]);
    const stamp = new Date().toISOString().slice(0, 10);

    downloadTextFile(
      `htools-link-check-${stamp}.csv`,
      `\ufeff${csv}`,
      "text/csv;charset=utf-8"
    );
  }

  return (
    <section className="admin-link-check" aria-label={maintenanceText.title}>
      <section className="source-import-panel">
        <div className="source-import-main">
          <div className="link-check-heading">
            <h2>{maintenanceText.sourceTitle}</h2>
            <p>{maintenanceText.sourceDescription}</p>
          </div>

          <label className="source-url-field">
            <span>{maintenanceText.sourceUrl}</span>
            <input
              value={sourceUrl}
              onChange={(event) => {
                setSourceUrl(event.target.value);
                setStatus("");
              }}
              placeholder={maintenanceText.sourcePlaceholder}
            />
          </label>

          <div className="source-mode-row" aria-label={maintenanceText.sourceMode}>
            <span>{maintenanceText.sourceMode}</span>
            <div className="source-mode-toggle">
              <button
                className={sourceMode === "skip" ? "is-active" : ""}
                type="button"
                onClick={() => setSourceMode("skip")}
              >
                {maintenanceText.sourceModeSkip}
              </button>
              <button
                className={sourceMode === "upsert" ? "is-active" : ""}
                type="button"
                onClick={() => setSourceMode("upsert")}
              >
                {maintenanceText.sourceModeUpsert}
              </button>
            </div>
            <small>{maintenanceText.sourceModeHelp}</small>
          </div>

          <div className="source-action-row">
            <button
              className="ghost-button"
              disabled={sourceChecking || sourceImporting || sourceExporting}
              type="button"
              onClick={() => void checkSource()}
            >
              <Activity size={16} />
              {sourceChecking ? maintenanceText.sourceChecking : maintenanceText.sourceDetect}
            </button>
            <button
              className="primary-button"
              disabled={sourceChecking || sourceImporting || sourceExporting}
              type="button"
              onClick={() => void importSource()}
            >
              <Database size={16} />
              {sourceImporting ? maintenanceText.sourceImporting : maintenanceText.sourceImport}
            </button>
            <button
              className="ghost-button"
              disabled={sourceChecking || sourceImporting || sourceExporting}
              type="button"
              onClick={() => void exportSource()}
            >
              <Download size={16} />
              {sourceExporting ? maintenanceText.sourceExporting : maintenanceText.sourceExport}
            </button>
          </div>

          {sourcePreview ? (
            <div className="source-report-grid" aria-live="polite">
              <div>
                <span>{maintenanceText.sourceTotal}</span>
                <strong>{sourcePreview.total}</strong>
              </div>
              <div>
                <span>{maintenanceText.sourceValid}</span>
                <strong>{sourcePreview.valid}</strong>
              </div>
              <div>
                <span>{maintenanceText.sourceDuplicate}</span>
                <strong>{sourcePreview.duplicateInSource}</strong>
              </div>
              <div>
                <span>{maintenanceText.sourceExisting}</span>
                <strong>{sourcePreview.duplicateInSite}</strong>
              </div>
              <div>
                <span>{maintenanceText.sourceMissing}</span>
                <strong>{sourcePreview.invalid}</strong>
              </div>
              <div>
                <span>{maintenanceText.sourceWillCreate}</span>
                <strong>{sourcePreview.willCreate}</strong>
              </div>
              <div>
                <span>{maintenanceText.sourceWillUpdate}</span>
                <strong>{sourcePreview.willUpdate}</strong>
              </div>
              <div>
                <span>{maintenanceText.sourceWillSkip}</span>
                <strong>{sourcePreview.willSkip}</strong>
              </div>
            </div>
          ) : null}

          {sourcePreview?.errors.length ? (
            <div className="source-error-list">
              <strong>{maintenanceText.sourceErrors}</strong>
              {sourcePreview.errors
                .slice(0, SOURCE_PREVIEW_ERROR_LIMIT)
                .map((error) => (
                  <span key={`${error.index}-${error.message}`}>
                    {maintenanceText.sourceErrorItem(error.index, error.message)}
                  </span>
                ))}
            </div>
          ) : null}

          {sourceCheckedAt ? (
            <p className="source-message subtle">
              {new Date(sourceCheckedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </section>

      <div className="link-check-hero">
        <div className="link-check-heading">
          <h2>{maintenanceText.linkModuleTitle}</h2>
          <p>{maintenanceText.linkModuleDescription}</p>
        </div>

        <div className="link-check-config">
          <label className="link-check-field">
            <span>{t.linkCheck.timeout}</span>
            <input
              disabled={checking}
              max={9}
              min={1}
              onChange={(event) => setTimeoutSeconds(event.target.valueAsNumber)}
              step={1}
              type="number"
              value={Number.isFinite(timeoutSeconds) ? timeoutSeconds : ""}
            />
            <small>{t.linkCheck.timeoutHelp}</small>
          </label>
          <label className="link-check-field">
            <span>{t.linkCheck.batchSize}</span>
            <input
              disabled={checking}
              max={10}
              min={1}
              onChange={(event) => setBatchSize(event.target.valueAsNumber)}
              step={1}
              type="number"
              value={Number.isFinite(batchSize) ? batchSize : ""}
            />
            <small>{t.linkCheck.batchSizeHelp}</small>
          </label>
        </div>

        <div className="link-check-actions">
          <button
            className="primary-button"
            disabled={checking || loadingLinks || totalCount === 0}
            onClick={() => void startCheck()}
            type="button"
          >
            <Activity size={16} />
            {checking ? t.linkCheck.checking : t.linkCheck.start}
          </button>
          <button
            className="ghost-button danger-action"
            disabled={!checking}
            onClick={stopCheck}
            type="button"
          >
            <CircleStop size={16} />
            {t.linkCheck.stop}
          </button>
          <button
            className="ghost-button"
            disabled={checking || loadingLinks}
            onClick={() => void reloadLinks()}
            type="button"
          >
            <RefreshCw size={16} />
            {loadingLinks ? t.linkCheck.reloading : t.linkCheck.reload}
          </button>
          <button
            className="ghost-button"
            disabled={checking || !results.length}
            onClick={clearResults}
            type="button"
          >
            <Trash2 size={16} />
            {t.linkCheck.clear}
          </button>
          <button
            className="ghost-button"
            disabled={checking || abnormalCount === 0}
            onClick={exportResults}
            type="button"
          >
            <Download size={16} />
            {t.linkCheck.exportCsv}
          </button>
        </div>
      </div>

      <div className="link-check-stats" aria-label={t.linkCheck.progressTitle}>
        <div>
          <span>{t.linkCheck.total}</span>
          <strong>{totalCount}</strong>
        </div>
        <div>
          <span>{t.linkCheck.checked}</span>
          <strong>{checkedCount}</strong>
        </div>
        <div>
          <span>{t.linkCheck.normal}</span>
          <strong>{normalCount}</strong>
        </div>
        <div>
          <span>{t.linkCheck.abnormal}</span>
          <strong>{abnormalCount}</strong>
        </div>
        <div>
          <span>{t.linkCheck.networkError}</span>
          <strong>{networkErrorCount}</strong>
        </div>
      </div>

      <section className="link-check-progress">
        <div className="link-check-progress-head">
          <div>
            <h3>{t.linkCheck.progressTitle}</h3>
            <p>
              {wasStopped
                ? t.linkCheck.progressStopped
                : t.linkCheck.progressText(checkedCount, totalCount)}
            </p>
          </div>
          <strong>{progress}%</strong>
        </div>
        <div className="link-check-progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="link-check-results">
        <div className="link-check-results-head">
          <div>
            <h3>{t.linkCheck.resultsTitle}</h3>
            <p>{t.linkCheck.resultsDescription}</p>
          </div>
        </div>

        <div className="link-check-tabs" role="tablist" aria-label={t.linkCheck.resultsTitle}>
          <button
            className={activeFilter === "abnormal" ? "is-active" : ""}
            onClick={() => setActiveFilter("abnormal")}
            type="button"
          >
            {t.linkCheck.tabsAbnormal(abnormalCount)}
          </button>
          {statusItems.map((item) => (
            <button
              className={activeFilter === item.value ? "is-active" : ""}
              key={item.value}
              onClick={() => setActiveFilter(item.value)}
              type="button"
            >
              {t.linkCheck.tabsStatus(item.status, item.count)}
            </button>
          ))}
          <button
            className={activeFilter === "all" ? "is-active" : ""}
            onClick={() => setActiveFilter("all")}
            type="button"
          >
            {t.linkCheck.tabsAll(results.length)}
          </button>
        </div>

        <div className="link-check-table-wrap">
          <table className="link-check-table">
            <thead>
              <tr>
                <th>{t.linkCheck.tableTool}</th>
                <th>{t.linkCheck.tableType}</th>
                <th>{t.linkCheck.tableUrl}</th>
                <th>{t.linkCheck.tableStatusCode}</th>
                <th>{t.linkCheck.tableResult}</th>
                <th>{t.linkCheck.tableDuration}</th>
                <th>{t.linkCheck.tableError}</th>
                <th>{t.linkCheck.tableAction}</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td className="link-check-empty" colSpan={8}>
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredResults.map((result, index) => {
                  const relatedTool = toolById.get(result.id);
                  const relatedToolUrl = relatedTool?.url ?? "";
                  const targetLabel =
                    result.kind === "demoUrl"
                      ? maintenanceText.demoUrlLabel
                      : maintenanceText.urlLabel;
                  const secondaryTargetLabel = maintenanceText.urlLabel;
                  const showToolUrl =
                    result.kind === "demoUrl" &&
                    Boolean(relatedToolUrl) &&
                    normalizeUrlForImport(relatedToolUrl) !==
                      normalizeUrlForImport(result.url);

                  return (
                    <tr key={`${result.id}-${result.kind}-${result.checkedAt}-${index}`}>
                      <td>
                        <strong>{result.name || result.id}</strong>
                      </td>
                      <td>
                        <span className="link-check-type-label">
                          {result.kind === "demoUrl"
                            ? t.linkCheck.linkTypeDemo
                            : t.linkCheck.linkTypeOfficial}
                        </span>
                      </td>
                      <td>
                        <span className="link-check-url" title={result.url}>
                          {result.url || "-"}
                        </span>
                      </td>
                      <td>
                        <span className={getLinkCheckPillClass(result)}>
                          {result.status}
                        </span>
                      </td>
                      <td>
                        <span className={getLinkCheckPillClass(result)}>
                          {getLinkCheckResultText(result, t)}
                        </span>
                      </td>
                      <td>
                        <span className="link-check-duration">
                          {t.linkCheck.durationMs(result.duration)}
                        </span>
                      </td>
                      <td>
                        <span className="link-check-error-text" title={result.error ?? "-"}>
                          {result.error ?? "-"}
                        </span>
                      </td>
                      <td>
                        <div className="link-check-action-buttons">
                          {showToolUrl ? (
                            <a
                              className="link-check-open-link"
                              href={proxifyUrl(relatedToolUrl, proxySettings)}
                              aria-label={secondaryTargetLabel}
                              rel="noreferrer"
                              target="_blank"
                              title={secondaryTargetLabel}
                            >
                              <span>{secondaryTargetLabel}</span>
                              <ArrowUpRight size={14} />
                            </a>
                          ) : null}
                          {result.url ? (
                            <a
                              className="link-check-open-link"
                              href={proxifyUrl(result.url, proxySettings)}
                              aria-label={targetLabel}
                              rel="noreferrer"
                              target="_blank"
                              title={targetLabel}
                            >
                              <span>{targetLabel}</span>
                              <ArrowUpRight size={14} />
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function getLinkCheckResultText(result: LinkCheckResult, t: Messages) {
  if (result.status === 0) {
    return t.linkCheck.resultNetworkError;
  }

  return result.ok ? t.linkCheck.resultNormal : t.linkCheck.resultAbnormal;
}

function getLinkCheckPillClass(result: LinkCheckResult) {
  if (result.status === 0) {
    return "link-check-result-pill is-network";
  }

  return result.ok
    ? "link-check-result-pill is-ok"
    : "link-check-result-pill is-error";
}

function Dialog({
  children,
  closeLabel,
  footer,
  panelClassName = "",
  title,
  onClose
}: {
  children: ReactNode;
  closeLabel: string;
  footer?: ReactNode;
  panelClassName?: string;
  title: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement | null>(null);
  const drawerDrag = useRef({
    dragging: false,
    pointerId: -1,
    startY: 0,
    lastY: 0
  });
  const backdropClassName = panelClassName
    .split(" ")
    .filter(Boolean)
    .map((className) => `${className}-backdrop`)
    .join(" ");
  const isToolEditorDrawer = panelClassName.split(" ").includes("tool-editor-dialog");

  useEffect(() => {
    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;
    const previousBodyLeft = document.body.style.left;
    const previousBodyRight = document.body.style.right;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.left = "0";
    document.body.style.right = "0";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      document.body.style.left = previousBodyLeft;
      document.body.style.right = previousBodyRight;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      window.requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      });
    };
  }, []);

  function canDragDrawer() {
    return (
      isToolEditorDrawer &&
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches
    );
  }

  function resetDrawerPosition() {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    panel.style.transition = "transform 0.18s cubic-bezier(0.2, 0.82, 0.2, 1)";
    panel.style.transform = "translateY(0)";
    window.setTimeout(() => {
      panel.style.transition = "";
      panel.style.transform = "";
    }, 190);
  }

  function handleDrawerPointerDown(event: React.PointerEvent<HTMLElement>) {
    if (!canDragDrawer() || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    const target = event.target as HTMLElement;

    if (
      target.closest(
        "button, a, input, textarea, select, [role='button'], [role='menuitem']"
      )
    ) {
      return;
    }

    drawerDrag.current = {
      dragging: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDrawerPointerMove(event: React.PointerEvent<HTMLElement>) {
    const state = drawerDrag.current;

    if (!state.dragging || state.pointerId !== event.pointerId) {
      return;
    }

    const distance = Math.max(0, event.clientY - state.startY);
    state.lastY = event.clientY;

    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    event.preventDefault();
    panel.style.transition = "none";
    panel.style.transform = `translateY(${distance}px)`;
  }

  function handleDrawerPointerEnd(event: React.PointerEvent<HTMLElement>) {
    const state = drawerDrag.current;

    if (!state.dragging || state.pointerId !== event.pointerId) {
      return;
    }

    const distance = Math.max(0, state.lastY - state.startY);
    drawerDrag.current.dragging = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const panel = panelRef.current;

    if (distance > 88 && panel) {
      panel.style.transition = "transform 0.18s cubic-bezier(0.2, 0.82, 0.2, 1)";
      panel.style.transform = "translateY(100%)";
      window.setTimeout(onClose, 160);
      return;
    }

    resetDrawerPosition();
  }

  return (
    <div
      className={`dialog-backdrop ${backdropClassName}`}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        ref={panelRef}
        className={`dialog-panel ${panelClassName}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header
          className={`dialog-header ${isToolEditorDrawer ? "is-drawer-draggable" : ""}`}
          onPointerCancel={handleDrawerPointerEnd}
          onPointerDown={handleDrawerPointerDown}
          onPointerMove={handleDrawerPointerMove}
          onPointerUp={handleDrawerPointerEnd}
        >
          <span className="dialog-drawer-grip" aria-hidden="true" />
          <h2>{title}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X size={18} />
          </button>
        </header>
        <div className="dialog-body">{children}</div>
        {footer ? <footer className="dialog-footer">{footer}</footer> : null}
      </section>
    </div>
  );
}
