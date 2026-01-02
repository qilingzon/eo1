import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url, redirect }) => {
  const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response("Missing OAUTH_GITHUB_CLIENT_ID", { status: 500 });
  }

  const redirectUri = new URL("/oauth/callback/", url.origin).toString();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
  });

  return redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};
