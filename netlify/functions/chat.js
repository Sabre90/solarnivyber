// netlify/functions/chat.js
import fetch from 'node-fetch';

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message, history } = JSON.parse(event.body);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: "Missing OpenAI API key" };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        input: [
          ...(history || []),
          { role: "user", content: message }
        ],
        max_output_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // Zpracování chyb OpenAI
    if (!response.ok || data.error) {
      console.error("OpenAI API error:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error || "OpenAI API error" }),
      };
    }

    // Extrakce odpovědi z nového formátu OpenAI Responses API
    const reply =
      data?.output?.[0]?.content?.[0]?.text ||
      "Chyba: Nepodařilo se zpracovat odpověď.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };

  } catch (error) {
    console.error("Function error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}