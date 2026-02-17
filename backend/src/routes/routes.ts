import { Router } from "express";
import fetch from "node-fetch";
import { collections } from "../services/databaseService";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const router = Router();

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}
const N8N_URL = process.env.N8N_URL;

router.post("/google", async (req, res) => {
  
  console.log("BODY:", req.body);
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Missing code" });
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    if (!tokens.id_token) {
      return res.status(400).json({ error: "id_token missing from Google" });
    }

    const parts = tokens.id_token.split(".");

    const payloadBase64 = parts.length > 1 ? parts[1] : null;

    if (!payloadBase64) {
      return res.status(400).json({ error: "Invalid id_token format" });
    }

    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf-8")
    );

    const user = {
      google_id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      refresh_token: tokens.refresh_token ?? null,
      provider: "google" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existing = await collections.users?.findOne({ google_id: user.google_id });

    if (!existing) {
      await collections.users?.insertOne(user);
      await fetch(`${N8N_URL!}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-api-key": process.env.N8N_WEBHOOK_SECRET!
          },
          body: JSON.stringify({
            userId: user.google_id,
            email: user.email,
            name: user.name,
            refresh_token: user.refresh_token,
          }),
        });
      } else {
        await collections.users?.updateOne(
          { google_id: user.google_id },
          { $set: { user, updatedAt: new Date() } }
        );
      }
      
      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Auth failed", details: err });
    }
});

router.post("/message", (req, res) => {
  console.log("n8n replied:", req.body);

  res.sendStatus(200);
});

export default router;