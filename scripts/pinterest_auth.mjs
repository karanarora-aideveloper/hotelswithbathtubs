import http from 'http';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const APP_ID = process.env.PINTEREST_APP_ID || '1608445';
const APP_SECRET = process.env.PINTEREST_APP_SECRET || '95deaa3f343014c1883491358c306209694d10df';
const PORT = 8085;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = 'boards:read,boards:write,pins:read,pins:write,user_accounts:read';

const authUrl = `https://www.pinterest.com/oauth/?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}`;

console.log('\n======================================================');
console.log('       PINTEREST 1-CLICK OAUTH AUTHORIZATION');
console.log('======================================================\n');
console.log('STEP 1: Make sure you have added this Redirect URI to your app on developers.pinterest.com:');
console.log(`👉  ${REDIRECT_URI}\n`);
console.log('STEP 2: Open this URL in your browser to authorize write access:');
console.log(`👉  ${authUrl}\n`);
console.log(`Waiting for callback on port ${PORT}...\n`);

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);

  if (reqUrl.pathname === '/callback') {
    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error');
    const errorDesc = reqUrl.searchParams.get('error_description');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>Authorization Failed</h1><p>${error}: ${errorDesc}</p>`);
      console.error(`Authorization error: ${error} - ${errorDesc}`);
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>No code provided</h1>');
      return;
    }

    console.log('Received authorization code from Pinterest!');
    console.log('Exchanging code for permanent access & refresh tokens...');

    try {
      const authHeader = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');
      const tokenRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        console.error('Failed to exchange token:', tokenData);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Token Exchange Failed</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
        return;
      }

      console.log('\nSUCCESS! Tokens received from Pinterest:');
      console.log(`Access Token: ${tokenData.access_token.substring(0, 15)}...`);
      console.log(`Scope: ${tokenData.scope}`);
      if (tokenData.refresh_token) {
        console.log(`Refresh Token: ${tokenData.refresh_token.substring(0, 15)}...`);
      }

      // Append or update .env.local
      const envPath = path.resolve(process.cwd(), '.env.local');
      let envContent = fs.readFileSync(envPath, 'utf8');

      const updateOrAddEnv = (key, val) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}="${val}"`);
        } else {
          envContent += `\n${key}="${val}"`;
        }
      };

      updateOrAddEnv('PINTEREST_ACCESS_TOKEN', tokenData.access_token);
      if (tokenData.refresh_token) {
        updateOrAddEnv('PINTEREST_REFRESH_TOKEN', tokenData.refresh_token);
      }

      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('Saved PINTEREST_ACCESS_TOKEN and PINTEREST_REFRESH_TOKEN to .env.local!');

      // Verify user account info
      const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      const userData = await userRes.json();
      console.log(`Connected Pinterest User: @${userData.username || 'unknown'} (${userData.account_type || 'business'})`);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
          <h1 style="color: #e60023;">Pinterest Connected!</h1>
          <p>Account: <strong>@${userData.username || 'user'}</strong></p>
          <p>Permissions: <code>${tokenData.scope}</code></p>
          <p style="color: #10b981; font-weight: bold;">Credentials have been saved to .env.local.</p>
          <p>You can close this tab and return to the terminal.</p>
        </div>
      `);

      setTimeout(() => {
        server.close();
        process.exit(0);
      }, 2000);
    } catch (err) {
      console.error('Error exchanging token:', err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Error</h1><p>${err.message}</p>`);
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
