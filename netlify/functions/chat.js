import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { location, houseType, consumption, battery, heatPump, email } = req.body;

  try {
    const prompt = `
Jsi expertní asistent na fotovoltaiku, bateriová úložiště a tepelná čerpadla v České republice.

Tvoje pravidla:
1. Odpovídej pouze na témata související s fotovoltaikou, bateriemi, tepelnými čerpadly a jejich ekonomickou návratností v ČR.  
2. Pokud dotaz NENÍ k tématu, odpověz pouze:  
   "Prosím, zůstaňme u výpočtu návratnosti FVE, baterií a TČ v ČR."  
3. Nikdy neposkytuj rady k jiným oborům, recepty, kód, finance, IT ani osobní poradenství mimo zadané téma.

Tvůj úkol:
1. Zeptat se uživatele na:
   - adresu nebo město
   - typ domu (rodinný / bytový)
   - roční spotřebu elektřiny v kWh
   - zda uvažuje o baterii a tepelném čerpadle
2. Spočítat návratnost FVE, baterie a TČ na základě:
   - průměrné výroby FVE v ČR: 1 kWp ≈ 1050 kWh/rok
   - účinnosti a degradace panelů (dle výrobců)
   - aktuálních cen podle ověřených výrobců
3. Automaticky vybrat nejlepšího výrobce panelů a baterií podle účinnosti a spolehlivosti
4. Vypočítat dotace dle principů NZÚ:
   - 10 000 Kč/kWp FVE (max. 5 kWp)
   - 10 000 Kč/kWh baterie (min. 1:1 k výkonu FVE)
   - Bonus 30 000 Kč při chytrém řízení / komunitní energetice
   - Bonus 30 000 Kč při kombinaci se zateplením, nebo 60 000 Kč při kombinaci s TČ
   - Dotace na TČ až 100 000 Kč
5. Vytvořit přehledný výstup s:
   - doporučeným výkonem FVE, velikostí baterie a TČ
   - doporučenými výrobci (panely, baterie) + odůvodnění
   - orientační roční úsporou a návratností
   - výší dotací a celkovým snížením investice
6. Na konci nabídni:
   - možnost exportu výsledku do CSV nebo textového reportu
   - možnost poslat výsledek na e‑mail (uživatel ho musí zadat)

Ověření výrobci (pro každý rok aktualizuj podle nových dat):
- AIKO Solar – účinnost 24–25 %, degradace 0,5 %/rok
- Longi Solar – účinnost 22 %, degradace 0,55 %/rok
- Risen Energy – účinnost 21,5 %, degradace 0,6 %/rok
- AEG Solar – účinnost 21 %, degradace 0,6 %/rok

Cenové odhady:
- FVE: 28 000 Kč/kWp
- Baterie: 18 000 Kč/kWh
- Tepelné čerpadlo: 180 000 Kč
- Elektřina: 6,5 Kč/kWh

Pokud uživatel položí dotaz mimo téma, reaguj jedinou větou:
"Prosím, zůstaňme u výpočtu návratnosti FVE, baterií a TČ v ČR."
`;

    // Volání OpenAI API
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt
      })
    });

    const json = await aiResponse.json();

    // Uložení do Google Sheets přes Apps Script Webhook
    await fetch(process.env.GOOGLE_SHEET_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location, houseType, consumption, battery, heatPump, email,
        result: json.output_text || json.choices?.[0]?.text || 'Výsledek nedostupný'
      })
    });

    return res.status(200).json({ result: json.output_text || json.choices?.[0]?.text });
  } catch (error) {
    console.error('Chyba serveru:', error);
    return res.status(500).json({ error: error.message });
  }
};