import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body);

    const systemPrompt = `
Jsi expertní asistent na fotovoltaiku, bateriová úložiště a tepelná čerpadla v ČR.
Dodržuj tato pravidla:
1. Odpovídej pouze na témata FVE, baterií a TČ v ČR.
2. Pokud dotaz NENÍ k tématu, odpověz: "Prosím, zůstaňme u výpočtu návratnosti FVE, baterií a TČ v ČR."
3. Pokud se uživatel ptá na aktuální dotace, ceny nebo výrobce, použij web search k vyhledání informací.
`;

    // 1️⃣ Pošleme nejdříve dotaz do OpenAI s možností Web Search
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
        tools: [{ type: "web_search" }],  // 🔹 Přidána možnost vyhledávání
      })
    });

    const data = await resp.json();

    // 2️⃣ Odpověď z modelu
    const reply = data.output_text || "Chyba při získávání odpovědi.";

    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}