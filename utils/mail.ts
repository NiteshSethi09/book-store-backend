import { createTransport } from "nodemailer";
import { passwordNodemailer, userEmailNodemailer } from "./config";

export interface MailData {
  message: string;
  email: string;
  subject: string;
}

const emailTransporter = createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  auth: {
    user: userEmailNodemailer,
    pass: passwordNodemailer,
  },
});

const sendMail = async function (data: MailData) {
  try {
    await emailTransporter.sendMail({
      from: `Book Store <${userEmailNodemailer}>`, // sender address
      to: data.email, // list of receivers
      subject: data.subject, // Subject line
      html: data.message, // html body
    });
  } catch (e: any) {
    console.log("Nodemailer Error:", e.message);
    return new Error(e.message);
  }
};

export default sendMail;
