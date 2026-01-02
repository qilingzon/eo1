// OAuth 回调端点
export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(getErrorPage(error), {
      status: 400,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  if (!code) {
    return new Response(getErrorPage('Missing authorization code'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  const clientId = import.meta.env.GITHUB_CLIENT_ID;
  const clientSecret = import.meta.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(getErrorPage('Server configuration error'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(getErrorPage(tokenData.error_description || tokenData.error), {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response(getSuccessPage('github', tokenData.access_token), {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (err: any) {
    return new Response(getErrorPage(`Token exchange failed: ${err.message}`), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

function getSuccessPage(provider: string, token: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authorization Successful</title>
</head>
<body>
  <script>
    (function() {
      function sendMessage(message) {
        const target = window.opener || window.parent;
        if (target) {
          target.postMessage(
            'authorization:${provider}:success:' + JSON.stringify(message),
            '*'
          );
        }
      }
      sendMessage({ token: '${token}', provider: '${provider}' });
      setTimeout(function() { window.close(); }, 1000);
    })();
  </script>
  <p>Authorization successful. This window should close automatically.</p>
</body>
</html>`;
}

function getErrorPage(message: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authorization Failed</title>
</head>
<body>
  <script>
    (function() {
      function sendMessage(message) {
        const target = window.opener || window.parent;
        if (target) {
          target.postMessage(
            'authorization:github:error:' + JSON.stringify(message),
            '*'
          );
        }
      }
      sendMessage({ error: '${message.replace(/'/g, "\\'")}' });
    })();
  </script>
  <p>Authorization failed: ${message}</p>
  <p><a href="javascript:window.close()">Close this window</a></p>
</body>
</html>`;
}
