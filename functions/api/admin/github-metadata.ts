import {
  badRequest,
  json,
  loadGitHubToolMetadata,
  requireAdmin,
  type Env
} from "../../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) {
    return unauthorized;
  }

  const requestUrl = new URL(request.url);

  try {
    const metadata = await loadGitHubToolMetadata(
      requestUrl.searchParams.get("url") ?? "",
      {
        token: env.GITHUB_TOKEN,
        forceRefresh: requestUrl.searchParams.get("refresh") === "1",
        cacheBaseUrl: request.url
      }
    );
    return json({ metadata });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load GitHub metadata.";

    if (message === "URL must be a GitHub repository.") {
      return badRequest(message);
    }

    return json(
      { error: message },
      { status: message === "GitHub repository not found." ? 404 : 502 }
    );
  }
};
