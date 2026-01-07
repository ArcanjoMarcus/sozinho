const chat = document.getElementById("chat");

document.getElementById("connect").onclick = () => {
  const pass = document.getElementById("pass").value;

  chrome.runtime.sendMessage({
    type: "CONNECT",
    pass
  });
};

document.getElementById("send").onclick = () => {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text) return;

  chrome.runtime.sendMessage({
    type: "SEND",
    text
  });

  input.value = "";
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "CHAT") {
    const line = document.createElement("div");
    line.textContent = `${msg.from.slice(0, 6)}: ${msg.text}`;
    chat.appendChild(line);
    chat.scrollTop = chat.scrollHeight;
  }

  if (msg.type === "STATUS") {
    const line = document.createElement("div");
    line.textContent = msg.ok ? "Connected" : "Disconnected";
    chat.appendChild(line);
  }
});
