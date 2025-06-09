import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // Load .env variables if running locally

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

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

  try {
    // 1. Create or retrieve the conversation thread
    const thread = threadId
      ? await openai.beta.threads.retrieve(threadId)
      : await openai.beta.threads.create();

    // 2. Send the user message into the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // 3. Kick off a new run (i.e. “ask the assistant to generate a reply”)
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // 4. Poll for up to 30 seconds (30 attempts x 1s each) or until status is "completed"
    let runStatus;
    const MAX_ATTEMPTS = 30;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

      // If it's completed, break out immediately
      if (runStatus.status === 'completed') {
        break;
      }

      // If it entered a terminal-but-not-success state, stop retrying
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        console.error('🔍 runStatus failed:', runStatus);
        //throw new Error(`Assistant run ended with status: ${runStatus.status}`);
        throw new Error(`runStatus: ${runStatus}`);
      }

      // Otherwise, wait 1 second and retry
      await new Promise((r) => setTimeout(r, 1000));
    }

    // 5. If after all attempts it's still not completed, error out
    if (runStatus.status !== 'completed') {
      return res
        .status(504)
        .json({ error: 'Assistant run timed out (status = ' + runStatus.status + ')' });
    }

    // 6. List messages in the thread and pick out the assistant's reply
    const messages = await openai.beta.threads.messages.list(thread.id);
    const replyMessage = messages.data.find((m) => m.role === 'assistant');
    const assistantText = replyMessage?.content[0]?.text?.value || 'No reply.';

    // 7. Return JSON with the threadId (for context) and the assistant's reply
    res.json({
      threadId: thread.id,
      reply: assistantText,
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

