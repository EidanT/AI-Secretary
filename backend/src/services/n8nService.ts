import fetch from "node-fetch";
import { Socket } from "socket.io";
import { collections } from "./databaseService";

const WEBHOOK_URL = process.env.MESSAGE_WEBHOOK_URL;

export async function handleSocketMessage(
  socket: Socket,
  text: string,
  name: string,
  email: string
) {

  if (!process.env.MESSAGE_WEBHOOK_URL) {
    socket.emit("receive_message", { text: "Webhook not configured" });
    return;
  }

  const userId = socket.data.userId;

  if (!userId) {
    socket.emit("receive_message", { text: "User not authenticated" });
    return;
  }

  const user = await collections.users?.findOne({ google_id: userId });

  if (!user) {
    socket.emit("receive_message", { text: "User not found" });
    return;
  }

  if (!user.refresh_token) {
    socket.emit("receive_message", { text: "No refresh token" });
    return;
  }

  const res = await fetch(process.env.MESSAGE_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.N8N_WEBHOOK_SECRET!,
    },
    body: JSON.stringify({
      text,
      name,
      email,
      refresh_token: user.refresh_token,
      userId: user.google_id,
    }),
  });

  console.log("n8n status:", res.status);

  const json = await res.json().catch(() => ({}));
  socket.emit("receive_message", json);
}

