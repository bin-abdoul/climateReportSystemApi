import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const mongodbUri = process.env.mongodbUri;
if (!mongodbUri) {
  throw new Error("mongodbUri is not defined in environment variables.");
}

export const dbClient = new MongoClient(mongodbUri);
export const database = dbClient.db("climateReportSystem");

export const messagesCollection = database.collection("Incoming Messages");
export const processedMessagesCollection =
  database.collection("Processed Messages");
