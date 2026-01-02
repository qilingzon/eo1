import type { APIRoute } from "astro";

const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";

export const GET: APIRoute = async ({ redirect }) => {
  const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response("Missing OAUTH_GITHUB_CLIENT_ID environment variable", {
      status: 500,
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "repo,user",
  });

  return redirect(`${GITHUB_OAUTH_URL}?${params.toString()}`);
};
