import fs from 'node:fs';
import path from 'node:path';

const MCP_ENDPOINT = 'https://ubersuggest-mcp.neilpatelapi.com/mcp';

export function getAccessToken() {
  const tokenFile = path.join(process.cwd(), 'scratch/tokens.json');
  if (!fs.existsSync(tokenFile)) {
    throw new Error('No tokens.json found. Please complete authentication first.');
  }
  const data = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
  return data.access_token;
}

export async function callMcpMethod(method, params = {}) {
  const token = getAccessToken();
  const res = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, status: res.status };
  }
}

export async function listTools() {
  return await callMcpMethod('tools/list', {});
}

export async function callTool(toolName, args = {}) {
  return await callMcpMethod('tools/call', {
    name: toolName,
    arguments: args,
  });
}

// CLI runner
if (process.argv[1] && process.argv[1].endsWith('ubersuggest_tools.mjs')) {
  const [,, cmd, ...args] = process.argv;
  if (cmd === 'list') {
    listTools().then(console.log).catch(console.error);
  } else if (cmd === 'call') {
    const [name, jsonArgs] = args;
    callTool(name, jsonArgs ? JSON.parse(jsonArgs) : {}).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error);
  }
}
