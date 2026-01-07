import { WebSocketServer } from "ws";

const PORT = process.env.PORT;
const PASS = process.env.PASS;

if (!PASS) {
  throw new Error("PASS environment variable not set");
}

const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on("connection", (ws) => {
  let authorized = false;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // Authentication
    if (msg.type === "auth") {
      if (msg.pass === PASS) {
        authorized = true;
        ws.send(JSON.stringify({ type: "auth_ok" }));
        clients.add(ws);
      } else {
        ws.close(4001, "Invalid pass");
      }
      return;
    }

    if (!authorized) {
      ws.close(4002, "Unauthorized");
      return;
    }

    // Chat message
    if (msg.type === "chat") {
      for (const client of clients) {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            from: msg.from,
            text: msg.text,
            time: Date.now()
          }));
        }
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

console.log("Chat server running on Render");
