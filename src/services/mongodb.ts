import { MongoClient } from "mongodb";
import { mongodbUri } from "../variables";
require("dotenv").config();

export const dbClient = new MongoClient(mongodbUri);
export const database = dbClient.db("climateReportSystem");

export const messagesCollection = database.collection("Incoming Messages");
export const processedMessagesCollection = database.collection("Processed Messages");