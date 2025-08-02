import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { action, data } = JSON.parse(event.body);

    // ========================
    // 1. Výpočet návratnosti
    // ========================
    if (action === "calculate") {
      const { spotreba, baterie, tc } = data;
      const kWp = Math.min(Math.ceil(spotreba / 1050), 10);
      const baterieKWh = baterie ? kWp : 0;
      const fveCena = kWp * 28000;
      const batCena = baterie ? baterieKWh * 18000 : 0;
      const tcCena = tc ? 180000 : 0;
      
      // Dotace NZÚ
      let dotace = 0;
      dotace += Math.min(kWp, 5) * 10000; // FVE
      if (baterie) dotace += baterieKWh * 10000;
      if (tc) dotace += 60000; // bonus při kombinaci s TČ
      if (tc) dotace += 100000; // dotace na TČ

      const investice = fveCena + batCena + tcCena - dotace;
      const rocniUspora = Math.min(spotreba, kWp * 1050) * 6.5;
      const navratnost = (investice / rocniUspora).toFixed(1);

      return {
        statusCode: 200,
        body: JSON.stringify({
          kWp,
          baterieKWh,
          investice,
          dotace,
          rocniUspora,
          navratnost
        })
      };
    }

    // ========================
    // 2. GPT dotaz
    // ========================
    if (action === "ask") {
      const { prompt } = data;

      const fullPrompt = `
Jsi expertní asistent na fotovoltaiku, bateriová úložiště a tepelná čerpadla v České republice.
Odpovídej pouze k tomuto tématu. 
Pokud dotaz není k tématu, napiš jen:
"Prosím, zůstaňme u výpočtu návratnosti FVE, baterií a TČ v ČR."

Dotaz uživatele:
${prompt}
`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Jsi expertní poradce na FVE, baterie a TČ v ČR." },
            { role: "user", content: fullPrompt }
          ]
        })
      });

      const result = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify(result.choices?.[0]?.message?.content || "Chyba GPT.")
      };
    }

    // ========================
    // 3. Web search
    // ========================
    if (action === "websearch") {
      const { query } = data;

      const searchResp = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
      );
      const json = await searchResp.json();

      return {
        statusCode: 200,
        body: JSON.stringify(json.RelatedTopics?.slice(0, 5) || [])
      };
    }

    return { statusCode: 400, body: "Neznámá akce" };
  } catch (err) {
    return { statusCode: 500, body: `Chyba: ${err.message}` };
  }
}