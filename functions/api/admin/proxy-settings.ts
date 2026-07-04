import { json, requireAdmin, saveProxySettings, type Env } from "../../_shared";

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const payload = (await request.json()) as {
      enabled?: unknown;
      baseUrl?: unknown;
      mode?: unknown;
    };

    return json({
      settings: await saveProxySettings(env, payload)
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save proxy settings.";
    return json({ error: message }, { status: 400 });
  }
};
