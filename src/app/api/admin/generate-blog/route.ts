import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const settings = await Settings.findOne();
    const apiKey = settings?.deepseekApiKey || process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'DeepSeek API Key is missing. Please add it in SEO Settings.' }, { status: 401 });
    }

    const systemPrompt = `You are an expert SEO travel blogger for "Hotels With Bathtubs", a website dedicated to reviewing luxury hotels and suites with private in-room bathtubs and Jacuzzis.
    
Write a highly detailed, SEO-optimized blog post about the following topic: "${topic}".

STRICT REQUIREMENTS:
1. Return ONLY valid HTML. Do not use Markdown formatting (like \`\`\`html). Do not include <html> or <body> tags. Start directly with an <h2> or <p>.
2. Do NOT output a main <h1> title in the HTML (the CMS handles the title separately). Use <h2> for main sections and <h3> for sub-sections.
3. Structure the post logically: Introduction, 3-5 specific hotel recommendations or key points, and a Conclusion.
4. Naturally include keywords like "private bathtub", "Jacuzzi suite", "romantic getaway", and the location mentioned.
5. Minimum length: 600 words.
6. Use <p>, <ul>, <li>, <strong>, and <em> for formatting.`;

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
          { role: 'user', content: `Please write the blog post for: ${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Clean up markdown block if the model hallucinated it
    if (content.startsWith('```html')) {
      content = content.replace(/^```html\n/, '').replace(/\n```$/, '');
    }

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
