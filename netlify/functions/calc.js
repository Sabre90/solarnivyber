// netlify/functions/calc.js
export async function handler(event) {
    try {
      const { prompt } = JSON.parse(event.body);
  
      // Volání OpenAI API přímo s nativním fetch()
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt,
        }),
      });
  
      const data = await response.json();
  
      return {
        statusCode: 200,
        body: JSON.stringify({ result: data.output_text || "Chyba při výpočtu" }),
      };
    } catch (err) {
      console.error(err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }