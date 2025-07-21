import { AfricasTalkingApiKey } from "./variables";

const AfricasTalking = require("africastalking");

const africastalking = AfricasTalking({
  apiKey: AfricasTalkingApiKey,
  username: "sandbox",
});

export const sendSMS = async (to:string, message: string) => {
  // TODO: Send message
  try {
    const result = await africastalking.SMS.send({
      to: to, 
      message: message,
      from: '49900'
    });
    console.log(result);
  } catch(ex) {
    console.error(ex);
  } 
};
