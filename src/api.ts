import type {
  AdminCategoryAction,
  AdminCategoryActionResult,
  AdminCategoryScope,
  AdminCategorySettings,
  AdminPasswordInput,
  AdminSecuritySettings,
  Article,
  ArticleInput,
  ContentItem,
  ContentSource,
  ContentSourceInput,
  ContentSyncResponse,
  FactoryResetResponse,
  FeedPreview,
  GitHubAuthState,
  GitHubSettings,
  GitHubSettingsInput,
  GitHubToolMetadata,
  LinkCheckResponse,
  LinkCheckTarget,
  ProxySettings,
  HtoolsBackup,
  BackupRestoreResponse,
  SiteSettings,
  SourceSettings,
  SubmissionInput,
  SubmissionResult,
  Tool,
  ToolSourceItem,
  ToolImportMode,
  ToolImportResponse,
  ToolInput
} from "./types";

type ToolsResponse = {
  tools: Tool[];
};

export type ToolsLoadResult = {
  tools: Tool[];
  error?: string;
};

type ToolResponse = {
  tool: Tool;
};

type ArticlesResponse = {
  articles: Article[];
};

type ArticleResponse = {
  article: Article;
};

type ContentSourcesResponse = {
  sources: ContentSource[];
};

type ContentSourceResponse = {
  source: ContentSource;
};

type ContentItemsResponse = {
  items: ContentItem[];
};

type FeedPreviewResponse = {
  feed: FeedPreview;
};

type LoginResponse = {
  token: string;
};

type GitHubSettingsResponse = {
  settings: GitHubSettings;
};

type GitHubToolMetadataResponse = {
  metadata: GitHubToolMetadata;
};

type SubmissionResponse = {
  submission: SubmissionResult;
};

type SourceSettingsResponse = {
  settings: SourceSettings;
};

type ProxySettingsResponse = {
  settings: ProxySettings;
};

type SiteSettingsResponse = {
  settings: SiteSettings;
};

type AdminSecuritySettingsResponse = {
  settings: AdminSecuritySettings;
};

type AdminCategorySettingsResponse = {
  settings: AdminCategorySettings;
};

type PublicCategorySettingsResponse = {
  settings: AdminCategorySettings;
};

type AdminCategoryActionResponse = AdminCategoryActionResult;

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export async function loadTools(): Promise<ToolsLoadResult> {
  try {
    const response = await fetch("/api/tools", {
      headers: {
        Accept: "application/json"
      }
    });
    const data = await readJson<ToolsResponse>(response);
    return {
      tools: data.tools
    };
  } catch (error) {
    return {
      tools: [],
      error: error instanceof Error ? error.message : "Request failed"
    };
  }
}

export async function loadArticles(): Promise<Article[]> {
  const response = await fetch("/api/articles", {
    headers: {
      Accept: "application/json"
    }
  });
  const data = await readJson<ArticlesResponse>(response);
  return data.articles;
}

export async function loadArticle(slug: string): Promise<Article> {
  const response = await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
    headers: {
      Accept: "application/json"
    }
  });
  const data = await readJson<ArticleResponse>(response);
  return data.article;
}

export async function loadArticlePreview(
  slug: string,
  token: string
): Promise<Article> {
  const response = await fetch(
    `/api/admin/articles/preview/${encodeURIComponent(slug)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );
  const data = await readJson<ArticleResponse>(response);
  return data.article;
}

export async function loadContentItemArticlePreview(
  id: string,
  token: string
): Promise<Article> {
  const response = await fetch(
    `/api/admin/content-items/${encodeURIComponent(id)}/preview`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );
  const data = await readJson<ArticleResponse>(response);
  return data.article;
}

export async function login(password: string): Promise<string> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });
  const data = await readJson<LoginResponse>(response);
  return data.token;
}

export async function createTool(input: ToolInput, token: string): Promise<Tool> {
  const response = await fetch("/api/tools", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<ToolResponse>(response);
  return data.tool;
}

export async function updateTool(id: string, input: ToolInput, token: string): Promise<Tool> {
  const response = await fetch(`/api/tools/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<ToolResponse>(response);
  return data.tool;
}

export async function deleteTool(id: string, token: string): Promise<void> {
  const response = await fetch(`/api/tools/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  await readJson<{ ok: boolean }>(response);
}

export async function loadAdminArticles(token: string): Promise<Article[]> {
  const response = await fetch("/api/admin/articles", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  const data = await readJson<ArticlesResponse>(response);
  return data.articles;
}

export async function createArticle(
  input: ArticleInput,
  token: string
): Promise<Article> {
  const response = await fetch("/api/admin/articles", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<ArticleResponse>(response);
  return data.article;
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
  token: string
): Promise<Article> {
  const response = await fetch(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<ArticleResponse>(response);
  return data.article;
}

export async function deleteArticle(id: string, token: string): Promise<void> {
  const response = await fetch(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  await readJson<{ ok: boolean }>(response);
}

export async function loadContentSources(
  token: string
): Promise<ContentSource[]> {
  const response = await fetch("/api/admin/content-sources", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  const data = await readJson<ContentSourcesResponse>(response);
  return data.sources;
}

export async function createContentSource(
  input: ContentSourceInput,
  token: string
): Promise<ContentSource> {
  const response = await fetch("/api/admin/content-sources", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<ContentSourceResponse>(response);
  return data.source;
}

export async function updateContentSource(
  id: string,
  input: ContentSourceInput,
  token: string
): Promise<ContentSource> {
  const response = await fetch(`/api/admin/content-sources/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<ContentSourceResponse>(response);
  return data.source;
}

export async function deleteContentSource(
  id: string,
  token: string
): Promise<void> {
  const response = await fetch(`/api/admin/content-sources/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  await readJson<{ ok: boolean }>(response);
}

export async function previewContentSource(
  input: ContentSourceInput,
  token: string
): Promise<FeedPreview> {
  const response = await fetch("/api/admin/content-sources/preview", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<FeedPreviewResponse>(response);
  return data.feed;
}

export async function syncContentSource(
  id: string,
  token: string
): Promise<ContentSyncResponse> {
  const response = await fetch(
    `/api/admin/content-sources/${encodeURIComponent(id)}/sync`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return readJson<ContentSyncResponse>(response);
}

export async function loadContentItems(
  token: string,
  params: { sourceId?: string } = {}
): Promise<ContentItem[]> {
  const searchParams = new URLSearchParams();

  if (params.sourceId) {
    searchParams.set("sourceId", params.sourceId);
  }

  const response = await fetch(
    `/api/admin/content-items${searchParams.size ? `?${searchParams}` : ""}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    }
  );
  const data = await readJson<ContentItemsResponse>(response);
  return data.items;
}

export async function convertContentItemToArticle(
  id: string,
  category: string,
  published: boolean,
  token: string
): Promise<Article> {
  const response = await fetch(
    `/api/admin/content-items/${encodeURIComponent(id)}/to-article`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ category, published })
    }
  );
  const data = await readJson<ArticleResponse>(response);
  return data.article;
}

export async function loadAdminCategorySettings(
  token: string
): Promise<AdminCategorySettings> {
  const response = await fetch("/api/admin/categories", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  const data = await readJson<AdminCategorySettingsResponse>(response);
  return data.settings;
}

export async function loadCategorySettings(): Promise<AdminCategorySettings> {
  const response = await fetch("/api/categories", {
    headers: {
      Accept: "application/json"
    }
  });
  const data = await readJson<PublicCategorySettingsResponse>(response);
  return data.settings;
}

export async function saveAdminCategorySettings(
  settings: Partial<Record<AdminCategoryScope, string[]>>,
  token: string
): Promise<AdminCategorySettings> {
  const response = await fetch("/api/admin/categories", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(settings)
  });
  const data = await readJson<AdminCategorySettingsResponse>(response);
  return data.settings;
}

export async function applyAdminCategoryAction(
  scope: AdminCategoryScope,
  category: string,
  action: AdminCategoryAction,
  targetCategory: string,
  token: string
): Promise<AdminCategoryActionResult> {
  const response = await fetch("/api/admin/categories", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action,
      category,
      scope,
      targetCategory
    })
  });
  return readJson<AdminCategoryActionResponse>(response);
}

export async function importTools(
  tools: unknown[],
  mode: ToolImportMode,
  token: string
): Promise<ToolImportResponse> {
  const response = await fetch("/api/admin/import-tools", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tools,
      mode
    })
  });

  return readJson<ToolImportResponse>(response);
}

export async function loadSourceSettings(token: string): Promise<SourceSettings> {
  const response = await fetch("/api/admin/source-settings", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  const data = await readJson<SourceSettingsResponse>(response);
  return data.settings;
}

export async function saveSourceSettings(
  enabled: boolean,
  token: string
): Promise<SourceSettings> {
  const response = await fetch("/api/admin/source-settings", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ enabled })
  });
  const data = await readJson<SourceSettingsResponse>(response);
  return data.settings;
}

export async function loadProxySettings(): Promise<ProxySettings> {
  const response = await fetch("/api/proxy-settings", {
    headers: {
      Accept: "application/json"
    }
  });
  const data = await readJson<ProxySettingsResponse>(response);
  return data.settings;
}

export async function saveProxySettings(
  input: ProxySettings,
  token: string
): Promise<ProxySettings> {
  const response = await fetch("/api/admin/proxy-settings", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<ProxySettingsResponse>(response);
  return data.settings;
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  const response = await fetch("/api/site-settings", {
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });
  const data = await readJson<SiteSettingsResponse>(response);
  return data.settings;
}

export async function saveSiteSettings(
  input: SiteSettings,
  token: string
): Promise<SiteSettings> {
  const response = await fetch("/api/admin/site-settings", {
    cache: "no-store",
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<SiteSettingsResponse>(response);
  return data.settings;
}

export async function exportBackupData(token: string): Promise<HtoolsBackup> {
  const response = await fetch("/api/admin/backup", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  return readJson<HtoolsBackup>(response);
}

export async function exportToolSourceData(token: string): Promise<ToolSourceItem[]> {
  const response = await fetch("/api/admin/tool-source", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  return readJson<ToolSourceItem[]>(response);
}

export async function restoreBackupData(
  backup: unknown,
  token: string
): Promise<BackupRestoreResponse> {
  const response = await fetch("/api/admin/backup", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(backup)
  });

  return readJson<BackupRestoreResponse>(response);
}

export async function resetFactorySettings(token: string): Promise<FactoryResetResponse> {
  const response = await fetch("/api/admin/factory-reset", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return readJson<FactoryResetResponse>(response);
}

export async function loadAdminSecuritySettings(
  token: string
): Promise<AdminSecuritySettings> {
  const response = await fetch("/api/admin/security", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  const data = await readJson<AdminSecuritySettingsResponse>(response);
  return data.settings;
}

export async function updateAdminPassword(
  input: AdminPasswordInput,
  token: string
): Promise<AdminSecuritySettings> {
  const response = await fetch("/api/admin/security", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<AdminSecuritySettingsResponse>(response);
  return data.settings;
}

export async function loadGitHubAuthState(): Promise<GitHubAuthState> {
  const response = await fetch("/api/github/me", {
    headers: {
      Accept: "application/json"
    }
  });
  return readJson<GitHubAuthState>(response);
}

export async function loadGitHubSettings(token: string): Promise<GitHubSettings> {
  const response = await fetch("/api/admin/github-settings", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  const data = await readJson<GitHubSettingsResponse>(response);
  return data.settings;
}

export async function saveGitHubSettings(
  input: GitHubSettingsInput,
  token: string
): Promise<GitHubSettings> {
  const response = await fetch("/api/admin/github-settings", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<GitHubSettingsResponse>(response);
  return data.settings;
}

const pendingGitHubMetadataRequests = new Map<
  string,
  Promise<GitHubToolMetadata>
>();

export function loadGitHubToolMetadata(
  url: string,
  token: string,
  options: { forceRefresh?: boolean } = {}
): Promise<GitHubToolMetadata> {
  const requestKey = url.trim().toLowerCase();
  const pendingRequest = pendingGitHubMetadataRequests.get(requestKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async () => {
    const searchParams = new URLSearchParams({ url });
    if (options.forceRefresh) {
      searchParams.set("refresh", "1");
    }

    const response = await fetch(`/api/admin/github-metadata?${searchParams}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    const data = await readJson<GitHubToolMetadataResponse>(response);
    return data.metadata;
  })();

  pendingGitHubMetadataRequests.set(requestKey, request);
  const clearPendingRequest = () => {
    if (pendingGitHubMetadataRequests.get(requestKey) === request) {
      pendingGitHubMetadataRequests.delete(requestKey);
    }
  };
  void request.then(clearPendingRequest, clearPendingRequest);

  return request;
}

export async function checkLinks(
  links: LinkCheckTarget[],
  timeout: number,
  token: string
): Promise<LinkCheckResponse> {
  const response = await fetch("/api/admin/link-check", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      links: links.map((link) => ({
        id: link.id,
        kind: link.kind
      })),
      timeout
    })
  });

  return readJson<LinkCheckResponse>(response);
}

export async function submitTool(input: SubmissionInput): Promise<SubmissionResult> {
  const response = await fetch("/api/submissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await readJson<SubmissionResponse>(response);
  return data.submission;
}

export async function logoutGitHub(): Promise<void> {
  const response = await fetch("/api/github/logout", {
    method: "POST"
  });
  await readJson<{ ok: boolean }>(response);
}
