const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-message");
const sendBtn = document.getElementById("send-btn");

function appendMessage(message, sender = "bot") {
  const div = document.createElement("div");
  div.className = sender === "user" ? "user-message" : "bot-message";
  div.textContent = message;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;
  appendMessage(message, "user");
  userInput.value = "";

  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  if (data.reply) {
    appendMessage(data.reply, "bot");
  } else {
    appendMessage("Chyba při získávání odpovědi.", "bot");
    console.error(data.error);
  }
});

// Export výsledků
document.getElementById("export-csv").addEventListener("click", () => {
  const rows = [["Parametr", "Hodnota"]];
  const results = calculateFVE({ spotreba: 4800, baterie: true, tepelneCerpadlo: true });
  for (const [key, value] of Object.entries(results)) rows.push([key, value]);

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "fve_vypocet.csv";
  link.click();
});

document.getElementById("export-txt").addEventListener("click", () => {
  const results = calculateFVE({ spotreba: 4800, baterie: true, tepelneCerpadlo: true });
  let txt = "Výpočet návratnosti FVE, baterie a TČ:\n";
  for (const [key, value] of Object.entries(results)) txt += `${key}: ${value}\n`;

  const blob = new Blob([txt], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "fve_vypocet.txt";
  link.click();
});