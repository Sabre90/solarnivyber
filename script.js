// ----------------------
// 1. Zavolání OpenAI GPT přes Netlify serverless funkci
// ----------------------
async function sendToGPT() {
    const input = document.getElementById('userInput').value;
    if (!input) return alert("Zadejte vstup pro výpočet!");

    const res = await fetch('/.netlify/functions/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
    });

    const data = await res.json();
    document.getElementById('result').innerText = data.result;
    window.lastCalculation = data.result;
}

// ----------------------
// 2. Odeslání do Google Forms
// ----------------------
function sendForm(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const result = window.lastCalculation || "Žádný výpočet nebyl proveden.";

    const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSeZjNJC75-7QZP9eurHY63wPJADLQhtRmKykErmgzEVNjfrlQ/formResponse";

    const formData = new FormData();
    formData.append('entry.400294580', result);    // Výsledek
    formData.append('entry.1456344775', email);    // Email
    formData.append('entry.1786917849', phone);    // Telefon

    fetch(formURL, { method: 'POST', mode: 'no-cors', body: formData })
      .then(() => {
        document.getElementById('status').innerText = "✅ Děkujeme! Specialista vás brzy kontaktuje.";
        document.getElementById('contactForm').reset();
      })
      .catch(() => {
        document.getElementById('status').innerText = "⚠️ Nepodařilo se odeslat, zkuste znovu.";
      });
}