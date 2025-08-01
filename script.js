const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const exampleBtns = document.querySelectorAll('.example-btn');

// Funkce pro přidání zprávy do chatu
function addMessage(message, sender = 'bot') {
  const div = document.createElement('div');
  div.classList.add('chat-message', sender);
  div.textContent = message;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Odeslání dotazu na serverless funkci
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  addMessage(message, 'user');
  userInput.value = '';

  addMessage('⏳ Počkejte, počítám...', 'bot');

  try {
    const response = await fetch('/.netlify/functions/calc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();

    chatBox.lastChild.remove(); // odstranit "Počkejte..."
    if (data.reply) {
      addMessage(data.reply, 'bot');
      document.getElementById('result').value = data.reply; // předvyplní výsledek
    } else {
      addMessage('⚠️ Chyba při výpočtu', 'bot');
    }
  } catch (e) {
    chatBox.lastChild.remove();
    addMessage('⚠️ Chyba při výpočtu', 'bot');
  }
}

// Kliknutí na inspiraci
exampleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    userInput.value = btn.textContent;
    sendMessage();
  });
});

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

// ----------------------
// Odeslání do Google Forms
// ----------------------
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const result = document.getElementById('result').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSeZjNJC75-7QZP9eurHY63wPJADLQhtRmKykErmgzEVNjfrlQ/formResponse";

  const formData = new FormData();
  formData.append('entry.400294580', result);  // Výpočet
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