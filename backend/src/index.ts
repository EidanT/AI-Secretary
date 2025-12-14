import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./services/databaseService";
import { usersRouter } from "./routes/routes";
import { authRouter } from "./routes/auth";



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", usersRouter);
app.use("/auth", authRouter);

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con MongoDB:", error);
  });
