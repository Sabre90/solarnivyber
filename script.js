document.getElementById('calc-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const address = document.getElementById('address').value;
    const houseType = document.getElementById('houseType').value;
    const consumption = parseFloat(document.getElementById('consumption').value);
    const battery = document.getElementById('battery').value;
    const heatpump = document.getElementById('heatpump').value;
  
    // Lokální výpočet
    const localResult = calculateFVE(consumption, battery, heatpump);
  
    // Zobrazení výsledku
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
      <h2>Výsledek výpočtu</h2>
      <p>Doporučený výkon FVE: ${localResult.fvePower} kWp</p>
      <p>Velikost baterie: ${localResult.batterySize} kWh</p>
      <p>Roční úspora: ${localResult.yearlySaving.toFixed(0)} Kč</p>
      <p>Celková investice po dotaci: ${localResult.totalCost.toFixed(0)} Kč</p>
      <p>Dotace celkem: ${localResult.subsidy.toFixed(0)} Kč</p>
      <p>Návratnost: ${localResult.payback.toFixed(1)} let</p>
    `;
  
    document.getElementById('export-section').style.display = 'block';
  
    // Odeslání na GPT pro detailní doporučení
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address, houseType, consumption, battery, heatpump
      })
    });
  
    const data = await response.json();
    if (data.output) {
      resultDiv.innerHTML += `<hr><h3>Doporučení agenta:</h3><p>${data.output}</p>`;
    }
  });
  
  // Export CSV
  document.getElementById('export-csv').addEventListener('click', () => {
    const resultText = document.getElementById('result').innerText;
    const blob = new Blob([resultText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vysledek.csv';
    link.click();
  });
  
  // Export TXT
  document.getElementById('export-txt').addEventListener('click', () => {
    const resultText = document.getElementById('result').innerText;
    const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vysledek.txt';
    link.click();
  });
  
  // Odeslání kontaktního formuláře (zatím jen log)
  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Děkujeme! Váš výsledek bude zaslán e‑mailem.');
  });