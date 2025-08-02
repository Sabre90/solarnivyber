import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);

    const prompt = `
Uživatel zadal:
- Adresa: ${body.address}
- Typ domu: ${body.houseType}
- Roční spotřeba: ${body.consumption} kWh
- Baterie: ${body.battery}
- Tepelné čerpadlo: ${body.heatpump}

Spočítej návratnost FVE a doporuč výrobce panelů a baterií. Dodržuj český jazyk.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        input: prompt,
        tools: [{ type: "web_search_preview", search_context_size: "medium" }]
      }),
    });

    const data = await response.json();
    const output = data.output?.[0]?.content?.[0]?.text || "Chyba při generování odpovědi.";

    return {
      statusCode: 200,
      body: JSON.stringify({ output }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}