const nodemailer = require("nodemailer");

// Create a transporter for SMTP
export const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
export const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log("Server server is ready to take our messages");
    return true;
  } catch (error) {
    console.error("SMTP connection error:", JSON.stringify(error, null, 2));
    return false;
  }
};

export const mailOptions = {
  from: '"Example Team" <team@example.com>',
  to: "alice@example.com, bob@example.com",
  subject: "Hello",
  text: "Hello world?",
  html: "<b>Hello world?</b>", // html body
};
export const sendEmail = async (mailOptions: object) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: JSON.stringify(error, null, 2),
    };
  }
};
