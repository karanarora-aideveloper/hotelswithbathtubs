import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const configPath = path.join(os.homedir(), '.gemini/config/mcp_config.json');
const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const servers = rawConfig.mcpServers;

async function testServer(name, serverConfig) {
  return new Promise((resolve) => {
    const { command, args = [], env = {} } = serverConfig;
    const mergedEnv = { ...process.env, ...env };

    console.log(`\n--------------------------------------------------`);
    console.log(`Testing MCP Server: [${name}]`);
    console.log(`Command: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      env: mergedEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';
    let isInitialized = false;
    let toolsList = [];
    let errorOccurred = null;

    const timeout = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        name,
        status: isInitialized ? 'PARTIAL (Timeout on tools)' : 'TIMEOUT',
        error: isInitialized ? null : 'Process timed out after 10s without initialize response',
        toolsCount: toolsList.length,
        tools: toolsList,
        stderr: stderrBuffer.trim(),
      });
    }, 10000);

    proc.stderr.on('data', (data) => {
      stderrBuffer += data.toString();
    });

    proc.stdout.on('data', (data) => {
      stdoutBuffer += data.toString();
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop(); // keep partial line

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line.trim());
          if (msg.id === 1 && msg.result) {
            isInitialized = true;
            // Send initialized notification
            proc.stdin.write(JSON.stringify({
              jsonrpc: '2.0',
              method: 'notifications/initialized',
            }) + '\n');

            // Request tools/list
            proc.stdin.write(JSON.stringify({
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/list',
              params: {},
            }) + '\n');
          } else if (msg.id === 2 && msg.result && msg.result.tools) {
            toolsList = msg.result.tools.map(t => t.name);
            clearTimeout(timeout);
            proc.kill('SIGTERM');
            resolve({
              name,
              status: 'HEALTHY',
              error: null,
              toolsCount: toolsList.length,
              tools: toolsList,
              stderr: stderrBuffer.trim(),
            });
          } else if (msg.error) {
            errorOccurred = msg.error;
          }
        } catch (e) {
          // not JSON line (might be banner or log)
        }
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        name,
        status: 'FAILED_TO_START',
        error: err.message,
        toolsCount: 0,
        tools: [],
        stderr: stderrBuffer.trim(),
      });
    });

    proc.on('exit', (code) => {
      clearTimeout(timeout);
      if (!isInitialized) {
        resolve({
          name,
          status: 'EXITED_EARLY',
          error: errorOccurred ? JSON.stringify(errorOccurred) : `Exited with code ${code}`,
          toolsCount: 0,
          tools: [],
          stderr: stderrBuffer.trim(),
        });
      }
    });

    // Send initialize request
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'diagnostic-runner',
          version: '1.0.0',
        },
      },
    };

    proc.stdin.write(JSON.stringify(initRequest) + '\n');
  });
}

async function runAll() {
  const results = [];
  for (const [name, cfg] of Object.entries(servers)) {
    const res = await testServer(name, cfg);
    results.push(res);
  }

  console.log('\n==================================================');
  console.log('                 DIAGNOSTIC REPORT                ');
  console.log('==================================================\n');
  console.table(results.map(r => ({
    Server: r.name,
    Status: r.status,
    Tools: r.toolsCount,
    Error: r.error || 'None',
  })));

  console.log('\nDetails:');
  for (const r of results) {
    console.log(`\n[${r.name}] Status: ${r.status}`);
    if (r.tools.length > 0) {
      console.log(`  Tools (${r.tools.length}): ${r.tools.join(', ')}`);
    }
    if (r.error) {
      console.log(`  Error: ${r.error}`);
    }
    if (r.stderr) {
      console.log(`  Logs / Stderr:\n  ${r.stderr.split('\n').slice(-5).join('\n  ')}`);
    }
  }
}

runAll().catch(console.error);
