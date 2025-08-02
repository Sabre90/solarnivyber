// =========================
// UI Elements
// =========================
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const starters = [
  "Spočítej návratnost FVE s baterií a TČ pro rodinný dům.",
  "Jaká je aktuální dotace na fotovoltaiku a baterii?",
  "Kolik ušetřím ročně, když budu mít fotovoltaiku 5 kWp?",
  "Chci zjistit, jestli se mi vyplatí fotovoltaika na domě v mém městě."
];

// Při načtení vložíme startovní návrhy do UI
window.addEventListener("DOMContentLoaded", () => {
  starters.forEach((s) => appendMessage(s, "starter"));
});

// =========================
// Helpers
// =========================
function appendMessage(text, sender = "user") {
  const div = document.createElement("div");
  div.className = sender === "user" ? "msg user" : sender === "bot" ? "msg bot" : "msg starter";
  div.textContent = text;
  div.addEventListener("click", () => {
    if (sender === "starter") {
      input.value = text;
      sendMessage();
    }
  });
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// =========================
// API Calls
// =========================

// Volání GPT
async function askGPT(prompt) {
  appendMessage(prompt, "user");
  appendMessage("⏳ Počkejte na odpověď...", "bot");

  try {
    const res = await fetch("/.netlify/functions/calc", {
      method: "POST",
      body: JSON.stringify({ action: "ask", data: { prompt } }),
    });
    const text = await res.text();
    const lastBot = chatBox.querySelector(".msg.bot:last-child");
    if (lastBot) lastBot.textContent = text;
  } catch (err) {
    const lastBot = chatBox.querySelector(".msg.bot:last-child");
    if (lastBot) lastBot.textContent = "⚠️ Chyba při dotazu na GPT.";
  }
}

// Výpočet FVE
async function calculateFVE(spotreba, baterie, tc) {
  appendMessage("📊 Počítám návratnost FVE...", "bot");

  try {
    const res = await fetch("/.netlify/functions/calc", {
      method: "POST",
      body: JSON.stringify({ action: "calculate", data: { spotreba, baterie, tc } }),
    });
    const result = await res.json();

    appendMessage(
      `✅ Doporučený výkon FVE: ${result.kWp} kWp
🔋 Baterie: ${result.baterieKWh} kWh
💰 Investice po dotacích: ${result.investice.toLocaleString()} Kč
📉 Roční úspora: ${result.rocniUspora.toLocaleString()} Kč
⏱ Návratnost: ${result.navratnost} let
💶 Dotace NZÚ: ${result.dotace.toLocaleString()} Kč`,
      "bot"
    );
  } catch (err) {
    appendMessage("⚠️ Chyba při výpočtu návratnosti.", "bot");
  }
}

// Web Search
async function searchWeb(query) {
  appendMessage(`🔎 Hledám na webu: "${query}"`, "user");
  appendMessage("⏳ Vyhledávání...", "bot");

  try {
    const res = await fetch("/.netlify/functions/calc", {
      method: "POST",
      body: JSON.stringify({ action: "websearch", data: { query } }),
    });
    const links = await res.json();
    const lastBot = chatBox.querySelector(".msg.bot:last-child");
    if (lastBot) {
      if (links.length === 0) {
        lastBot.textContent = "Nenalezeny žádné výsledky.";
      } else {
        lastBot.innerHTML = "🌐 Nalezené odkazy:<br>" +
          links
            .map((l) => `<a href="${l.FirstURL}" target="_blank">${l.Text}</a>`)
            .join("<br>");
      }
    }
  } catch (err) {
    const lastBot = chatBox.querySelector(".msg.bot:last-child");
    if (lastBot) lastBot.textContent = "⚠️ Chyba při vyhledávání.";
  }
}

// =========================
// Sending messages
// =========================
async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  // Zjistíme, zda je to příkaz pro výpočet
  if (message.toLowerCase().includes("spočítej") || message.toLowerCase().includes("návratnost")) {
    // Defaultní demo: spotřeba 5000 kWh, baterie a TČ ano
    calculateFVE(5000, true, true);
  } else if (message.toLowerCase().includes("hledej") || message.toLowerCase().includes("dotace")) {
    searchWeb(message);
  } else {
    askGPT(message);
  }

  input.value = "";
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});