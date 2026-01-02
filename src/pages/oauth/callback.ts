import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  const clientId = import.meta.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response("Missing OAuth environment variables", { status: 500 });
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return new Response(`OAuth error: ${data.error_description || data.error}`, {
        status: 400,
      });
    }

    const content = `
<!DOCTYPE html>
<html>
<head>
  <title>OAuth Callback</title>
</head>
<body>
  <script>
    (function() {
      const token = "${data.access_token}";
      const provider = "github";

      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:' + provider + ':success:' + JSON.stringify({ token: token, provider: provider }),
          e.origin
        );
      }

      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:" + provider, "*");
    })();
  </script>
</body>
</html>`;

    return new Response(content, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return new Response(`OAuth error: ${error}`, { status: 500 });
  }
};
