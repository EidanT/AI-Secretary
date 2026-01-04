import express from "express";
import http from "http";
import { Server } from "socket.io";
import fetch from "node-fetch";
import fs from "fs";

interface Gmail {
  id: number;
  text: string;
  date: string;
}

interface EventItem {
  id: number;
  title: string;
  description?: string;
  date?: string;
}

interface DataStore {
  gmails: Gmail[];
  events: EventItem[];
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

const DATA_FILE = "./data.json";
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;


let data: DataStore = {
  gmails: [],
  events: [],
};


try {
  if (fs.existsSync(DATA_FILE)) {
    const fileData = fs.readFileSync(DATA_FILE, "utf8");
    data = JSON.parse(fileData) as DataStore;
    console.log("Datos cargados desde data.json");
  }
} catch (err) {
  console.error("Error leyendo data.json:", err);
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get("/gmails", (_req, res) => {
  res.json(data.gmails);
});

app.get("/events", (_req, res) => {
  res.json(data.events);
});

app.delete("/delete", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Missing 'title' in request body" });
  }

  const initialLength = data.events.length;
  data.events = data.events.filter(e => e.title !== title);

  if (data.events.length === initialLength) {
    return res.status(404).json({ message: "Event not found" });
  }

  saveData();
  console.log(`Deleted event with title: ${title}`);
  res.status(200).json({ message: "Event deleted successfully" });
});


app.post("/message", (req, res) => {
  console.log("n8n replied:", req.body);

  const { type, response, text, subject, summary, title, date } = req.body;
  const messageText = response || text || subject || summary || title || date || "No message content";

  if (type === "chat") {
    io.emit("receive_message", { text: messageText });
  }

  else if (type === "gmail") {
    const gmail = { id: Date.now(), text: messageText, date: new Date().toISOString() };
    data.gmails.push(gmail);
    saveData(); 
    io.emit("gmail_triggered", gmail);
  }

  else if (type === "event_created") {
    const event = { id: Date.now(), title: title, description: summary, date: date };
    data.events.push(event);
    saveData(); 
    io.emit("event_created", { text: messageText });
  }

  else if (type === "event_alert") {
    io.emit("event_alert", { text: messageText });
  }

  res.sendStatus(200);
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("send_message", async (data: { text: string }) => {
    console.log("Message from app:", data);

    const webhookUrl = WEBHOOK_URL;

    if (!webhookUrl) {
       socket.emit("receive_message", { text: "Webhook URL not configured" });
        return;
    }

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: data.text }),
      });

      const json = await res.json().catch(() => ({}));

      console.log("n8n responded with:", json);
      socket.emit("receive_message", json);

    } catch (error) {
      console.error("Error forwarding to n8n:", error);
      socket.emit("receive_message", { text: "Failed to reach n8n." });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(4000, () => console.log("Socket.IO server running on port 3000"));