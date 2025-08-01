// netlify/functions/calc.js
export async function handler(event) {
    try {
      const { input } = JSON.parse(event.body);
  
      // ✅ Ověření, že máme vstup
      if (!input || input.trim() === "") {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Chybí vstup pro výpočet." })
        };
      }
  
      // ✅ Volání OpenAI GPT (nahradíš svým API klíčem v Netlify env variable)
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Jsi asistent pro výpočet solární FVE." },
            { role: "user", content: input }
          ]
        })
      });
  
      if (!response.ok) {
        const errText = await response.text();
        return { statusCode: 500, body: JSON.stringify({ error: errText }) };
      }
  
      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || "Chyba: prázdná odpověď.";
  
      return {
        statusCode: 200,
        body: JSON.stringify({ result })
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: err.message })
      };
    }
  }