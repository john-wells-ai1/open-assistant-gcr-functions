import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables if running locally

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

console.log('logging Express app');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;

// Health check
app.get('/', (req, res) => {
  res.send('✅ OpenAI Assistant API is running.');
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  const { threadId, message } = req.body;
  console.log('in POST');
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
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Assistant Error', details: err.message });
  }
});

// ✅ Export the app for Google Cloud Run to use
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Assistant server running on http://localhost:${PORT}`);
});

