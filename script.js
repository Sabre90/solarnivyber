const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const contactForm = document.getElementById("contactForm");
const exportCSV = document.getElementById("exportCSV");

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("chat-message", sender);
  msg.innerText = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage("user", text);
  userInput.value = "";

  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await response.json();
  addMessage("bot", data.reply);
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

contactForm.addEventListener("submit", e => {
  e.preventDefault();
  alert("Děkujeme, brzy vás budeme kontaktovat s výsledkem výpočtu.");
  contactForm.reset();
});

exportCSV.addEventListener("click", () => {
  const csvContent = calc.exportCSV();
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vypocet_fve.csv";
  a.click();
});