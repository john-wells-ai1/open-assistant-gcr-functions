import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function chat(req, res) => {
  const assistantId = process.env.ASSISTANT_ID;
  const { threadId, message } = req.body;

  try {
    const thread = threadId
      ? await openai.beta.threads.retrieve(threadId)
      : await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let runStatus;
    do {
      await new Promise(r => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    } while (runStatus.status !== 'completed');

    const messages = await openai.beta.threads.messages.list(thread.id);
    const reply = messages.data.find(m => m.role === 'assistant');

    res.json({
      threadId: thread.id,
      reply: reply?.content[0]?.text?.value || 'No reply.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Assistant error', details: err.message });
  }
};
