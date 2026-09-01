import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CLIENT_ID = 'ubersuggest-mcp';
const REDIRECT_URI = 'http://127.0.0.1:8080/callback';
const TOKEN_URL = 'https://ubersuggest-mcp.neilpatelapi.com/token';

const codeVerifier = 'antigravity_ubersuggest_mcp_auth_verifier_1234567890';
const codeChallenge = '4Ajzv4ixkm997QNza2cyLdG55QRFsoxoL9v02hxTXMk';

const server = http.createServer(async (req, res) => {
  console.log(`[${new Date().toISOString()}] Received request: ${req.method} ${req.url}`);
  const reqUrl = new URL(req.url, 'http://127.0.0.1:8080');

  const code = reqUrl.searchParams.get('code');
  const error = reqUrl.searchParams.get('error');
  const errorDesc = reqUrl.searchParams.get('error_description');

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`<h1>Authentication Failed</h1><p>${error}: ${errorDesc}</p>`);
    console.error(`Auth error: ${error} - ${errorDesc}`);
    return;
  }

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Ubersuggest Auth Listener is active. Waiting for code...</h1>');
    return;
  }

  try {
    console.log(`Exchanging authorization code: ${code}`);
    
    // Try exchanging with redirect_uri = http://127.0.0.1:8080/callback first, then http://localhost:8080/callback
    let tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    let tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.log('Retrying with localhost redirect_uri...');
      tokenRes = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          code,
          redirect_uri: 'http://localhost:8080/callback',
          code_verifier: codeVerifier,
        }),
      });
      tokenData = await tokenRes.json();
    }

    if (!tokenRes.ok || !tokenData.access_token) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Token Exchange Error</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
      console.error('Token exchange error:', tokenData);
      return;
    }

    const accessToken = tokenData.access_token;
    console.log('\n>>> Successfully obtained access token! <<<\n');

    // Update config files
    const configPaths = [
      path.join(os.homedir(), '.gemini/config/mcp_config.json'),
      path.join(os.homedir(), '.gemini/antigravity-ide/mcp_config.json'),
      path.join(os.homedir(), '.gemini/antigravity/mcp_config.json'),
      path.join(process.cwd(), '.agents/mcp_config.json'),
    ];

    const configContent = {
      mcpServers: {
        ubersuggest: {
          serverUrl: 'https://ubersuggest-mcp.neilpatelapi.com/mcp',
          url: 'https://ubersuggest-mcp.neilpatelapi.com/mcp',
          type: 'sse',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    };

    for (const cfgPath of configPaths) {
      try {
        fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
        fs.writeFileSync(cfgPath, JSON.stringify(configContent, null, 2), 'utf8');
        console.log(`Updated ${cfgPath}`);
      } catch (err) {
        console.warn(`Could not update ${cfgPath}: ${err.message}`);
      }
    }

    // Save tokens locally
    const tokenFile = path.join(process.cwd(), 'scratch/tokens.json');
    fs.mkdirSync(path.dirname(tokenFile), { recursive: true });
    fs.writeFileSync(tokenFile, JSON.stringify(tokenData, null, 2), 'utf8');
    console.log(`Saved tokens to ${tokenFile}`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
            .card { background: #1e293b; padding: 2.5rem 3.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; border: 1px solid #334155; }
            h1 { color: #38bdf8; margin-bottom: 0.5rem; }
            p { color: #94a3b8; font-size: 1.1rem; }
            .badge { display: inline-block; background: #10b981; color: white; padding: 0.5rem 1.2rem; border-radius: 9999px; margin-top: 1rem; font-weight: 600; font-size: 1.1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1> Authentication Successful!</h1>
            <p>Ubersuggest MCP has been successfully authorized and connected.</p>
            <div class="badge">You can close this tab now</div>
          </div>
        </body>
      </html>
    `);

    console.log('\nAll configurations updated. Closing server in 3 seconds.');
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 3000);

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h1>Error: ${err.message}</h1>`);
    console.error(err);
  }
});

server.listen(8080, '0.0.0.0', () => {
  console.log('OAuth server listening on 0.0.0.0:8080');
});
