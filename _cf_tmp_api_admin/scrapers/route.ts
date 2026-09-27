import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // Only allow execution in development mode (local machine)
    if (process.env.NODE_ENV === 'production') {
      return new Response(
        JSON.stringify({ error: 'Scrapers cannot be executed in the production Vercel environment.' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { city, country, scriptName } = await req.json();

    if (!city || !scriptName) {
      return new Response(
        JSON.stringify({ error: 'City and scriptName are required.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Default country to 'India' if not provided
    const targetCountry = country || 'India';

    // Validate scriptName to prevent command injection
    const allowedScripts = ['mmt_uc.py', 'agoda_uc.py', 'booking_uc.py'];
    if (!allowedScripts.includes(scriptName)) {
      return new Response(
        JSON.stringify({ error: 'Invalid script name.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const scriptPath = path.join(process.cwd(), '_legacy_static', scriptName);

    // Setup Server-Sent Events (Streaming)
    const stream = new ReadableStream({
      start(controller) {
        const pythonProcess = spawn('python3', [scriptPath, city, targetCountry], {
          cwd: process.cwd(),
          env: process.env // Pass environment variables for MongoDB connection
        });

        pythonProcess.stdout.on('data', (data) => {
          controller.enqueue(data);
        });

        pythonProcess.stderr.on('data', (data) => {
          controller.enqueue(data);
        });

        pythonProcess.on('close', (code) => {
          controller.enqueue(new TextEncoder().encode(`\n[Process exited with code ${code}]`));
          controller.close();
        });
        
        pythonProcess.on('error', (err) => {
          controller.enqueue(new TextEncoder().encode(`\n[Failed to start subprocess: ${err.message}]`));
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
