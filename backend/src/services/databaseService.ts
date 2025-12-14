import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import User from "../models/users.js";

export const collections: { users?: mongoDB.Collection<User> } = {}

export async function connectToDatabase () {
    dotenv.config();

    const client = new mongoDB.MongoClient(process.env.DB_CONN_STRING!);
    await client.connect();

    const db = client.db(process.env.DB_NAME!);

    collections.users = db.collection("users");

    console.log(`Successfully connected to database!`)

}