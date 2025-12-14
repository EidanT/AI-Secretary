import express, { Request, Response } from "express";
import { collections } from "../services/databaseService";
import User from "../models/users";


export const usersRouter = express.Router();

usersRouter.use(express.json());

usersRouter.get("/", async (_req: Request, res: Response) => {
    try {
        const users = (await collections.users?.find({}).toArray()) as User[];
    
        res.status(200).send(users);
    }
    catch (error) {
        res.status(500).send(error)
    }
});

usersRouter.post("/", async (req: Request, res: Response)=> {
    try {
        const newUser = req.body as User;
        const result = await collections.users?.insertOne(newUser);

        result ? res.status(201).send(`Successfully created a new user with id ${result.insertedId}`) :
                 res.status(500).send("Failed to create a new user.");
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error)
    }
});