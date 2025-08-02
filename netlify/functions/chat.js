import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const systemPrompt = `
Jsi expertní asistent na fotovoltaiku, bateriová úložiště a tepelná čerpadla v ČR.
Odpovídej pouze k tématu. Pokud dotaz není k tématu, odpověz:
"Prosím, zůstaňme u výpočtu návratnosti FVE, baterií a TČ v ČR."
Používej web search pro aktuální dotace a ceny.
`;

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        tools: [{ type: "web_search" }]
      })
    });

    const data = await resp.json();
    if (!data.output_text) {
      console.error("OpenAI API error:", data);
      return { statusCode: 500, body: JSON.stringify({ error: data }) };
    }

    return { statusCode: 200, body: JSON.stringify({ reply: data.output_text }) };
  } catch (err) {
    console.error("Server error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}