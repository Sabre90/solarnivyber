// ----------------------
// 1️⃣ Spočítat výsledek přes OpenAI API
// ----------------------
const resultEl = document.getElementById('result');
const calcForm = document.getElementById('calcForm');

calcForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userInput = document.getElementById('inputData').value;
  resultEl.innerText = "⏳ Počkejte, počítám...";

  try {
    const response = await fetch('/.netlify/functions/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userInput }),
    });

    const data = await response.json();
    if (data.result) {
      resultEl.innerText = data.result;
      document.getElementById('manualResult').value = data.result;
    } else {
      resultEl.innerText = "❌ Chyba při výpočtu";
    }
  } catch (err) {
    resultEl.innerText = "❌ Chyba spojení se serverem";
  }
});

// ----------------------
// 2️⃣ Odeslat data do Google Forms
// ----------------------
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const result = document.getElementById('manualResult').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSeZjNJC75-7QZP9eurHY63wPJADLQhtRmKykErmgzEVNjfrlQ/formResponse";

  const formData = new FormData();
  formData.append('entry.400294580', result);  // Výsledek
  formData.append('entry.1456344775', email);  // Email
  formData.append('entry.1786917849', phone);  // Telefon

  fetch(formURL, { method: 'POST', mode: 'no-cors', body: formData })
    .then(() => {
      document.getElementById('status').innerText = "✅ Děkujeme! Specialista vás brzy kontaktuje.";
      document.getElementById('contactForm').reset();
    })
    .catch(() => {
      document.getElementById('status').innerText = "⚠️ Nepodařilo se odeslat, zkuste znovu.";
    });
});