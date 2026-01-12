import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./services/databaseService";
import http from "http";
import { Server } from "socket.io";

import { handleSocketMessage } from "./services/n8nService";
import router from "./routes/routes";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

connectToDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con MongoDB:", error);
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  const userId = socket.handshake.auth.userId;
  socket.data.userId = userId;

  socket.on("send_message", async (data: { text: string, name: string, email: string }) => {
    console.log("send_message received:", data);
    await handleSocketMessage(socket, data.text, data.name, data.email);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  }); 
});