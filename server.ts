import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Insights endpoint
app.post("/api/insights", async (req, res) => {
  try {
    const { dataSummary } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are the core of Atrack, a privacy-first personal assistant. 
Review the following user summarized data and generate 3 custom, brief, high-value, highly actionable bullet-pointed insights or reminders for today.
Strictly adhere to providing actionable feedback. Focus on warning patterns, helpful health or financial reminders.

User Summary Data:
${JSON.stringify(dataSummary)}

Respond with a JSON block conforming to the following structure:
{
  "insights": [
    {
      "title": "Actionable Insight Title Here",
      "category": "Health" | "Finance" | "Habit",
      "detail": "Actionable, specific and friendly 1-sentence tip/reminder."
    },
    ... Exactly 3 insights ...
  ]
}
`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    res.setHeader('Content-Type', 'application/json');
    res.send(text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate dynamic insights", details: error instanceof Error ? error.message : String(error) });
  }
});

// Gemini Expense Chat Advisor Endpoint
app.post("/api/chat/expenses", async (req, res) => {
  try {
    const { message, expenses, history } = req.body;
    
    // Format history for the Gemini API
    const formattedHistory = [
      {
        role: "user",
        parts: [{ text: `You are a financial advisor for Atrack. The user has the following recent expenses: ${JSON.stringify(expenses)}. Provide actionable advice on saving money, budgeting, and optimizing spending.` }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I will provide financial advice based on the user's spending habits." }]
      },
      ...(history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }))
    ];

    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
