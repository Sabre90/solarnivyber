// ----------------------
// 1️⃣ Funkce pro komunikaci s GPT přes Netlify Functions
// ----------------------
async function sendToGPT() {
  const input = document.getElementById('userInput').value;
  if (!input.trim()) return;

  const chatOutput = document.getElementById('chatOutput');
  chatOutput.innerHTML += `<div class="user-msg"><b>Vy:</b> ${input}</div>`;

  try {
    const response = await fetch("/.netlify/functions/gpt-proxy", {
      method: "POST",
      body: JSON.stringify({ prompt: input })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ Chyba při volání GPT";

    chatOutput.innerHTML += `<div class="gpt-msg"><b>GPT:</b> ${reply}</div>`;
  } catch (error) {
    chatOutput.innerHTML += `<div class="gpt-msg"><b>Chyba:</b> Nepodařilo se získat odpověď.</div>`;
  }
}

// ----------------------
// 2️⃣ Google Forms Integration
// ----------------------
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  // Tvůj Google Form URL (formResponse)
  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSeZjNJC75-7QZP9eurHY63wPJADLQhtRmKykErmgzEVNjfrlQ/formResponse";

  // Nahraď za skutečná entry ID polí
  const formData = new FormData();
  formData.append('entry.1456344775', email);   // Email
  formData.append('entry.1786917849', phone);   // Telefon

  fetch(formURL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).then(() => {
    document.getElementById('status').innerText = "✅ Děkujeme! Váš kontakt byl uložen.";
    document.getElementById('contactForm').reset();
  }).catch(() => {
    document.getElementById('status').innerText = "⚠️ Nepodařilo se odeslat, zkuste znovu.";
  });
});

// ----------------------
// 3️⃣ Export výsledků do TXT
// ----------------------
function downloadTXT() {
  const chatText = document.getElementById('chatOutput').innerText || "Žádný výsledek";
  const blob = new Blob([chatText], { type: "text/plain;charset=utf-8" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "solarni_vypocet.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ----------------------
// 4️⃣ Export výsledků do CSV
// ----------------------
function downloadCSV() {
  const resultData = {
    adresa: document.getElementById('resultAddress')?.innerText || 'Nezadáno',
    doporuceny_vykon_FVE: document.getElementById('resultPower')?.innerText || '0 kWp',
    doporucena_baterie: document.getElementById('resultBattery')?.innerText || '0 kWh',
    rocni_uspora: document.getElementById('resultSavings')?.innerText || '0 Kč',
    navratnost_let: document.getElementById('resultROI')?.innerText || '0 let'
  };

  const csvRows = [];
  csvRows.push(Object.keys(resultData).join(","));
  csvRows.push(Object.values(resultData).join(","));

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = "solarni_vypocet.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}