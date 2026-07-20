import OpenAI from 'openai';
import { getMode } from '@/lib/modes';

export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  mode?: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your_openai')) {
    return Response.json(
      {
        error:
          'OPENAI_API_KEY is not configured. Add it to .env.local to enable the AI Historian.',
      },
      { status: 503 },
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: '`messages` must be a non-empty array.' }, { status: 400 });
  }

  const messages = body.messages
    .filter(
      (m): m is ChatMessage =>
        (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
    )
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 16000) }));

  const mode = getMode(body.mode);
  const openai = new OpenAI({ apiKey });

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      stream: true,
      temperature: 0.7,
      messages: [{ role: 'system', content: mode.systemPrompt }, ...messages],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode('\n\n> The stream was interrupted. Please try again.'),
          );
          console.error('Stream error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('OpenAI request failed:', err);
    return Response.json(
      { error: 'The AI service is temporarily unavailable. Please try again.' },
      { status: 502 },
    );
  }
}
