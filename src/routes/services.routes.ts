import express from "express";
import "dotenv/config";
import { getCoordinates } from "../services/locationService";
import {
  messagesCollection,
  // processedMessagesCollection,
} from "../services/mongodb";
import { processMessageWithGemini } from "../services/geminiServices";

export const servicesRouter = express.Router();
servicesRouter.get("/grouped-reports", async (req, res) => {
  try {
    const groupedReports = await messagesCollection.aggregate([
        {
          $group: {
            _id: { location: "$location", issueType: "$issueType" },
            count: { $sum: 1 },
            messages: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            location: "$_id.location",
            issueType: "$_id.issueType",
            count: "$count",
          },
        },
        {
          $sort: { "location": 1, "issueType": 1 },
        },
      ])
      .toArray();
    return res.send(groupedReports);
  } catch(error) {
    console.error("Failed to fetch grouped reports:", error);
    return res.status(500).json({ error: JSON.stringify(error, null, 2) });
  }
});
servicesRouter.get("/messages", async (req, res) => {
  try {
    const messages = await messagesCollection
      .find()
      .sort({ date: -1 })
      .toArray();
    return res.send(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return res.status(500).json({ error: JSON.stringify(error, null, 2) });
  }
});

servicesRouter.post("/incoming-messages", async (req, res) => {
  console.log("Message received:", JSON.stringify(req.body, null, 2));
  const message = { ...req.body, receivedAt: new Date().toLocaleDateString() };
  if (message.text) {
    try {
      const processedData = await processMessageWithGemini(message.text);
      console.log(
        "Processed data from Gemini:",
        JSON.stringify(processedData, null, 2)
      );
      // Get coordinates if location is available
      const coords = await getCoordinates(processedData.location);
      console.log("Coordinates:", coords);
      const finalData = {
        ...message,
        ...processedData,
        ...coords,
      };
      const result = await messagesCollection.insertOne(finalData);
      console.log("Message stored successfully:", result.insertedId);
      return res.status(201).json({
        status: "Message processed and stored",
        id: result.insertedId,
        ...finalData,
      });
    } catch (error) {
      console.log(
        "Error processing message with Gemini:",
        JSON.stringify(error, null, 2)
      );
      return res.status(500).json({ error: "Failed to process message." });
    }
  } else {
    console.warn("Incoming message has no 'text' field.");
    return res.status(400).json({ error: "Message has no 'text' field." });
  }
});

servicesRouter.post("/delivery-reports", (req, res) => {
  const data = req.body;
  console.log("Received delivery report:", JSON.stringify(data, null, 2));
  return res.sendStatus(200);
});
