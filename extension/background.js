let ws = null;
let userId = crypto.randomUUID();

chrome.runtime.onMessage.addListener((msg) => {
  // Connect using pass
  if (msg.type === "CONNECT") {
    if (ws) {
      ws.close();
      ws = null;
    }

    ws = new WebSocket("wss://sozinho.onrender.com");

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "auth",
        pass: msg.pass
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "auth_ok") {
        chrome.runtime.sendMessage({ type: "STATUS", ok: true });
        return;
      }

      chrome.runtime.sendMessage({
        type: "CHAT",
        from: data.from,
        text: data.text,
        time: data.time
      });
    };

    ws.onclose = () => {
      chrome.runtime.sendMessage({ type: "STATUS", ok: false });
    };
  }

  // Send chat message
  if (msg.type === "SEND" && ws && ws.readyState === 1) {
    ws.send(JSON.stringify({
      type: "chat",
      from: userId,
      text: msg.text
    }));
  }
});
