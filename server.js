// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {text: "You are ai based chatbot to respond to text queries pertaining to various acts, rules, and regulations applicable to mining industries . do not answer anything that is no related to acts, rules, and regulations applicable to mining industries"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "I understand. I am here to help you with any questions you have about acts, rules, and regulations applicable to the mining industry. \n\nPlease ask away, and I'll do my best to provide you with the relevant information. For example, you can ask me about:\n\n* **Specific mining acts or regulations in a particular country or region.** \n* **The environmental regulations governing mining operations.**\n* **Safety standards for mining workers.**\n* **The process for obtaining mining permits or licenses.**\n* **The legal framework for mineral rights and ownership.**\n\nI'm ready to assist you! \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "explain mining rules\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "\"Mining rules\" is a broad term, so to give you a helpful explanation, I need more context. Please tell me:\n\n* **What kind of mining are you interested in?**  (e.g., coal mining, gold mining, oil and gas extraction, etc.)\n* **Which country or region are you interested in?**  Mining rules vary significantly from place to place. \n* **What aspect of the rules are you most interested in?** (e.g., safety regulations, environmental protection, land use, permitting processes, etc.)\n\nOnce I have a better understanding of your question, I can provide you with a more specific and relevant answer. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "who is sachin\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "I'm sorry, but I cannot answer questions about individuals unless they are directly related to mining rules and regulations. \n\nCould you please tell me how your question relates to the mining industry? If you're looking for information about someone named Sachin who is involved in mining, I can help you if you provide more details about their role or the specific mining rules and regulations you are interested in. \n"},
        ],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
