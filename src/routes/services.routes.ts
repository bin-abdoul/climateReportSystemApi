import express from "express";
import "dotenv/config";
import {
  messagesCollection,
    processedMessagesCollection,
} from "../services/mongodb";
import { processMessageWithGemini } from "../services/geminiServices";

export const servicesRouter = express.Router();

servicesRouter.get("/messages", async (req, res) => {
  try {
    const messages = await messagesCollection.find().toArray();
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
    console.log("Message has text:", message.text);
    try {
      const processedData = await processMessageWithGemini(message.text);
      console.log(
        "Processed data from Gemini:",
        JSON.stringify(processedData, null, 2)
      );
      // Count similar reports from last week
      const issueType = processedData.issueType?.toLowerCase().trim();
      const location = processedData.location?.toLowerCase().trim();
      const similarCount = await messagesCollection.countDocuments({
        issueType,
        location,
        receivedAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
      });
      let alertLevel: "none" | "low" | "medium" | "high" = "none";

      if (similarCount > 0 && similarCount <= 3) {
        alertLevel = "low";
      } else if (similarCount >= 4 && similarCount <= 10) {
        alertLevel = "medium";
      } else if (similarCount >= 11) {
        alertLevel = "high";
      }
      console.log(
        `Alert Level: ${alertLevel} (${similarCount} similar reports)`
      );

      const finalData = {
        ...message,
        ...processedData,
        alertLevel,
        similarReports: similarCount,
        processedAt: new Date(),
      };
      const result = await messagesCollection.insertOne(finalData);
      console.log("Message stored successfully:", result.insertedId);
      return res.status(201).json({
        status: "Message processed and stored",
        id: result.insertedId,
        alertLevel,
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
