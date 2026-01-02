// OAuth 回调端点
// 处理 GitHub OAuth 回调，交换 code 获取 token

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // 检查是否有错误
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

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(getErrorPage('Server configuration error'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  try {
    // 交换 code 获取 access token
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

    // 返回成功页面，通过 postMessage 传递 token 给 CMS
    return new Response(getSuccessPage('github', tokenData.access_token), {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (err) {
    return new Response(getErrorPage(`Token exchange failed: ${err.message}`), {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

function getSuccessPage(provider, token) {
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
      window.close();
    })();
  </script>
  <p>Authorization successful. This window should close automatically.</p>
</body>
</html>`;
}

function getErrorPage(message) {
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
