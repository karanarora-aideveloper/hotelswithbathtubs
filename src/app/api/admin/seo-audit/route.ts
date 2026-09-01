import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    // Fetch the target URL's HTML
    let htmlContent = '';
    try {
      const targetRes = await fetch(url);
      htmlContent = await targetRes.text();
    } catch (e) {
      return NextResponse.json({ error: 'Failed to fetch the provided URL. Ensure it is accessible.' }, { status: 400 });
    }

    // Strip unnecessary tags to save tokens
    const strippedHtml = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 15000); // Limit length to avoid token limits

    await connectToDatabase();
    const settings = await Settings.findOne();
    const apiKey = settings?.deepseekApiKey || process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'DeepSeek API Key is missing. Please add it in SEO Settings.' }, { status: 401 });
    }

    const systemPrompt = `You are a Senior Technical SEO Expert. 
I am going to provide you with the raw HTML of a page from my website (Hotels With Bathtubs).
Please perform a comprehensive SEO audit.

Analyze the following:
1. Title Tag & Meta Description (Are they optimized for CTR and length?)
2. Heading Structure (H1, H2, H3 logic)
3. Keyword Optimization (Are terms like "private bathtub", "jacuzzi", or location names used effectively?)
4. Content Length & Quality

Format your response in Markdown. Be direct, actionable, and highlight specific gaps and exact recommendations.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Target URL: ${url}\n\nHTML Snippet:\n${strippedHtml}` }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ report: data.choices[0].message.content });

  } catch (err: any) {
    console.error('SEO Audit Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
