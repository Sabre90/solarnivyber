// ====== 1️⃣ Výpočet přes GPT ======
document.getElementById('calculateBtn').addEventListener('click', async () => {
    const input = document.getElementById('userInput').value.trim();
    const resultBox = document.getElementById('result');
    
    if (!input) {
      resultBox.value = "❗ Zadejte nejprve vstup pro výpočet.";
      return;
    }
  
    resultBox.value = "⏳ Probíhá výpočet...";
  
    try {
      const response = await fetch('/.netlify/functions/calc', {
        method: 'POST',
        body: JSON.stringify({ input }),
      });
  
      const data = await response.json();
  
      if (data.result) {
        resultBox.value = data.result;
      } else {
        resultBox.value = "Chyba při výpočtu: " + (data.error || "Neznámá chyba");
      }
    } catch (err) {
      resultBox.value = "Chyba při komunikaci se serverem: " + err.message;
    }
  });
  
  // ====== 2️⃣ Odeslání do Google Forms ======
  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const result = document.getElementById('result').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
  
    // Tvůj Google Form URL (formResponse)
    const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSeZjNJC75-7QZP9eurHY63wPJADLQhtRmKykErmgzEVNjfrlQ/formResponse";
  
    const formData = new FormData();
    formData.append('entry.400294580', result); // Vypocet
    formData.append('entry.1456344775', email);  // Email
    formData.append('entry.1786917849', phone);  // Telefon
  
    fetch(formURL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    }).then(() => {
      document.getElementById('status').innerText = "✅ Děkujeme! Specialista vás brzy kontaktuje.";
      document.getElementById('contactForm').reset();
    }).catch(() => {
      document.getElementById('status').innerText = "⚠️ Nepodařilo se odeslat, zkuste znovu.";
    });
  });