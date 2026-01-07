import { WebSocketServer } from "ws";

const PORT = process.env.PORT;
const API_KEY = process.env.CHAT_API_KEY;

const wss = new WebSocketServer({ port: PORT });
const rooms = new Map();

wss.on("connection", (ws, req) => {
  let room = null;
  let authorized = false;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // 1. Authenticate
    if (msg.type === "auth") {
      if (msg.key === API_KEY) {
        authorized = true;
        ws.send(JSON.stringify({ type: "auth_ok" }));
      } else {
        ws.close(4001, "Invalid API key");
      }
      return;
    }

    if (!authorized) {
      ws.close(4002, "Unauthorized");
      return;
    }

    // 2. Join room
    if (msg.type === "join") {
      room = msg.room;
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room).add(ws);
      return;
    }

    // 3. Chat message
    if (msg.type === "chat" && room) {
      for (const client of rooms.get(room)) {
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
    if (room && rooms.has(room)) {
      rooms.get(room).delete(ws);
    }
  });
});

console.log("Chat server running");
