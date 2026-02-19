import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./services/databaseService";
import http from "http";
import router from "./routes/routes";
import { initSocket } from "./socket";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

initSocket(server);

app.use(cors({
  origin: [
    process.env.FRONTEND_ORIGIN,
    process.env.BACKEND_ORIGIN

  ].filter((origin): origin is string => Boolean(origin)),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.get("/", (req, res) => {
  res.status(200).send("OK");
});


connectToDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con MongoDB:", error);
  });
