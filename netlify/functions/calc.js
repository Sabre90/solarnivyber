import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Spočítej návratnost fotovoltaiky podle tohoto zadání: ${prompt}`,
      }),
    });

    const data = await response.json();
    const result = data.output_text || "Chyba při výpočtu";

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}