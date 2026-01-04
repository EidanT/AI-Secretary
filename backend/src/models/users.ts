import { ObjectId } from "mongodb";

export default class User {
  constructor(
    public google_id: string,
    public name: string,
    public email: string,
    public picture: string,
    public refresh_token: string | null,
    public provider: "google" = "google",
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public _id?: ObjectId
  ) {}
}