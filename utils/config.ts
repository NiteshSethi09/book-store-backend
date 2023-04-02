import dotenv from "dotenv";
dotenv.config();

export const portNumber = process.env.PORT_NUMBER || 5000;

export const userEmailNodemailer = process.env.USER_EMAIL_NODEMAILER;
export const passwordNodemailer = process.env.APP_PASSWORD_NODEMAILER;
export const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
export const razorpaySecret = process.env.RAZORPAY_SECRET;
export const websiteUrl = process.env.WEBSITE_URL;
