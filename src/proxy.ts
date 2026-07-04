import type { ProxyMode, ProxySettings } from "./types";

export const DEFAULT_PROXY_MODE: ProxyMode = "prefix";

export function normalizeProxyMode(value: unknown): ProxyMode {
  return value === "edgeone-proxy" || value === "edgeone-advanced" || value === "prefix"
    ? value
    : DEFAULT_PROXY_MODE;
}

export function normalizeProxyBaseUrl(value: string) {
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

export function proxifyUrl(value: string, settings: ProxySettings) {
  const trimmed = value.trim();

  if (!trimmed || !settings.enabled || !settings.baseUrl) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return trimmed;
    }

    if (
      typeof window !== "undefined" &&
      url.origin === window.location.origin
    ) {
      return trimmed;
    }

    const targetUrl = url.toString();
    const baseUrl = normalizeProxyBaseUrl(settings.baseUrl);

    if (!baseUrl) {
      return trimmed;
    }

    const mode = normalizeProxyMode(settings.mode);

    if (mode === "edgeone-proxy") {
      return createProxyQueryUrl(baseUrl, "proxy", targetUrl);
    }

    if (mode === "edgeone-advanced") {
      return createProxyQueryUrl(baseUrl, "advanced-proxy", targetUrl);
    }

    return `${baseUrl}${targetUrl}`;
  } catch {
    return trimmed;
  }
}

function createProxyQueryUrl(baseUrl: string, route: string, targetUrl: string) {
  const url = new URL(baseUrl);
  const basePath = url.pathname.replace(/\/?$/, "/");
  url.pathname = `${basePath}${route}`.replace(/\/{2,}/g, "/");
  url.search = "";
  url.searchParams.set("url", targetUrl);
  url.hash = "";

  return url.toString();
}
