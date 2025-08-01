const GPT_ENDPOINT = '/.netlify/functions/calc';
const SHEETS_ENDPOINT = '/.netlify/functions/submit';

const chatBox = document.getElementById('chat');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const suggestions = document.getElementById('suggestions');
const resultField = document.getElementById('result');
const contactForm = document.getElementById('contactForm');
const statusDiv = document.getElementById('status');

// Add message to chat
function addMessage(text, type = 'bot') {
  const msg = document.createElement('div');
  msg.className = type === 'user' ? 'user-message' : 'bot-message';
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Show animated typing indicator
function showTyping() {
  const typing = document.createElement('div');
  typing.className = 'bot-message typing-indicator';
  typing.id = 'typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove typing indicator
function removeTyping() {
  const typing = document.getElementById('typing');
  if (typing) typing.remove();
}

// Handle sending user message to GPT
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  addMessage(question, 'user');
  userInput.value = '';

  showTyping();

  try {
    const res = await fetch(GPT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: question })
    });

    const data = await res.json();
    removeTyping();

    if (data.error) {
      addMessage('Chyba při výpočtu: ' + (data.error.message || data.error), 'bot');
      return;
    }

    const answer = data.answer || 'Žádná odpověď';
    addMessage(answer, 'bot');

    // Pre-fill result field so user can send it to Sheets
    resultField.value = answer;

  } catch (err) {
    removeTyping();
    addMessage('Chyba při výpočtu: ' + err.message, 'bot');
  }
});

// Handle suggested questions
suggestions.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    userInput.value = e.target.textContent;
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// Handle sending contact form to Google Sheets
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const result = resultField.value.trim();

  statusDiv.textContent = 'Odesílám...';

  try {
    const res = await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, result })
    });

    const data = await res.json();

    if (data.success) {
      statusDiv.textContent = '✅ Úspěšně odesláno!';
      contactForm.reset();
    } else {
      statusDiv.textContent = '⚠️ Chyba: ' + (data.error || 'Neznámá chyba');
    }
  } catch (err) {
    statusDiv.textContent = '⚠️ Chyba připojení: ' + err.message;
  }
});