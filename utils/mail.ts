import { Request, Response } from "express";
import { createTransport } from "nodemailer";
import { passwordNodemailer, userEmailNodemailer } from "./config";

export interface MailData {
  message: string;
  email: string;
  subject: string;
}

const sendMail = function (req: Request, res: Response, data: MailData) {
  createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    auth: {
      user: userEmailNodemailer,
      pass: passwordNodemailer,
    },
  })
    .sendMail({
      from: userEmailNodemailer, // sender address
      to: data.email, // list of receivers
      subject: data.subject, // Subject line
      html: data.message, // html body
    })
    .then(() => console.log("Message sent successfully!"))
    .catch((e) => {
      console.log("Nodemailer Error:", e.message);
      return new Error(e.message);
    });
};

export default sendMail;
