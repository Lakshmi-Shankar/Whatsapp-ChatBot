import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const COURSE_CONTEXT = `
AI Academy Course:

Modules:
1. Introduction to LLM – 10 units
2. Basics of Prompting – 12 units
3. Deep Dive into LLM Integration – 15 units
4. Advanced LLM Concepts and Agentic AI – 17 units

Access:
- Module 1 & 2 are FREE
- Module 3 & 4 cost ₹499

Certificate available after completing all modules.

Pricing: https://ai-academy.example.com/pricing
`;

router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Entry message
    if (userMessage === "AI-Academy") {
      return res.json({
        reply: "Thank you for reaching out to the AI Academy! How can I help you today?",
      });
    }

    // Groq using OpenAI SDK (chat format)
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an AI Academy assistant. Answer ONLY using the provided context. If the answer is not in the context, say you don't know.",
        },
        {
          role: "system",
          content: COURSE_CONTEXT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    console.log(JSON.stringify(response, null, 2));

    let botReply = "I’m not sure based on available information.";

    if (response.choices && response.choices.length > 0) {
      const content = response.choices[0].message?.content;
      if (content && content.trim() !== "") {
        botReply = content;
      }
    }

    return res.json({ reply: botReply });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;