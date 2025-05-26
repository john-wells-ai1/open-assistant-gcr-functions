// README.md
/*
# 🧠 OpenAI Assistant on Google Cloud Run

This project deploys a Node.js Express API for interacting with an OpenAI Assistant using the [OpenAI API](https://platform.openai.com/docs/assistants/overview), hosted on [Google Cloud Run](https://cloud.google.com/run).

## 🚀 Features
- Stateless HTTP interface to an OpenAI Assistant
- Threaded memory support via OpenAI Threads
- Runs fully serverless via Google Cloud Run

## 🧱 Project Structure
```
.
├── Dockerfile
├── index.js
├── package.json
└── README.md
```

## 🛠️ Setup
### 1. Clone the repo
```bash
git clone https://github.com/your-org/openai-assistant-cloudrun.git
cd openai-assistant-cloudrun
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` or pass via CLI
- `OPENAI_API_KEY`: Your OpenAI secret key
- `ASSISTANT_ID`: The ID of your Assistant (create one at https://platform.openai.com/assistants)

### 4. Deploy to Google Cloud Run
```bash
gcloud run deploy openai-assistant-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your-key,ASSISTANT_ID=your-id
```

## 🧪 Test the API
```bash
curl -X POST https://<your-cloud-run-url>/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!","threadId":null}'
```

## 🧼 Cleanup
```bash
gcloud run services delete openai-assistant-api --region=us-central1
```

---
MIT Licensed. Built with ❤️ using OpenAI + Google Cloud.
*/
