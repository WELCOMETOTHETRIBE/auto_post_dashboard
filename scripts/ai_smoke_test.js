import OpenAI from 'openai';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID;
  const prompt = process.argv.slice(2).join(' ') || 'Say hello from the assistant.';

  if (!apiKey || !assistantId) {
    console.error('Missing OPENAI_API_KEY or OPENAI_ASSISTANT_ID');
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });
  try {
    const thread = await client.beta.threads.create();
    await client.beta.threads.messages.create(thread.id, { role: 'user', content: prompt });
    let run = await client.beta.threads.runs.create(thread.id, { assistant_id: assistantId });

    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise((r) => setTimeout(r, 800));
      run = await client.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
    }

    if (run.status !== 'completed') {
      console.error('Run did not complete. Status:', run.status);
      process.exit(2);
    }

    const messages = await client.beta.threads.messages.list(thread.id, { order: 'desc', limit: 20 });
    const assistantMsg = messages.data?.find((m) => m.role === 'assistant');
    const text = assistantMsg?.content?.find((c) => c.type === 'text')?.text?.value || '';
    console.log(JSON.stringify({ ok: true, text }, null, 2));
  } catch (err) {
    console.error('Smoke test error:', err?.message || err);
    process.exit(3);
  }
}

main();


