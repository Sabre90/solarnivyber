export async function handler(event) {
    try {
      const { prompt } = JSON.parse(event.body);
  
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Jsi odborník na solární návrhy a výpočty návratnosti." },
            { role: "user", content: prompt }
          ],
          max_tokens: 300
        })
      });
  
      const data = await res.json();
      const result = data.choices?.[0]?.message?.content || "Chyba při výpočtu";
  
      return {
        statusCode: 200,
        body: JSON.stringify({ result }),
      };
  
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }