import { Server } from "socket.io";
import { handleSocketMessage } from "./services/n8nService";

export const userSockets = new Map<string, string>();
export let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  
    const userId = socket.handshake.auth.userId;
    socket.data.userId = userId;
  
    if (userId) {
      userSockets.set(userId, socket.id);
    }
  
    socket.on("send_message", async (data: { text: string, name: string, email: string }) => {
      console.log("send_message received:", data);
      await handleSocketMessage(socket, data.text, data.name, data.email);
    });
  
    socket.on("disconnect", () => {
      if (userId) {
        userSockets.delete(userId);
      }
  
      console.log("Client disconnected:", socket.id);
    }); 
  });
};
