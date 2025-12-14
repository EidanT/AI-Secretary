import express from "express";
import fetch from "node-fetch";
import { collections } from "../services/databaseService";

export const authRouter = express.Router();

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

authRouter.post("/google", async (req, res) => {
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
        redirect_uri: "http://localhost:5173/signup",
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
    };

    const existing = await collections.users?.findOne({ google_id: user.google_id });

    if (!existing) {
      await collections.users?.insertOne(user);
    } else {
      await collections.users?.updateOne(
        { google_id: user.google_id },
        { $set: user }
      );
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Auth failed", details: err });
  }
});

