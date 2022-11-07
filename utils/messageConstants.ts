import { portNumber } from "./config";

export const signupMessage = (token: string) => `
  <p>Hi, please verify your account by click on the link given below</p>
  <a href="http://localhost:${portNumber}/verify-account/${token}" target="_blank">Click here to verify</a>
`;

export const resetPasswordMessage = (token: string) => `
  <p>You have requested for password reset. Given below the link for reset the password</p>
  <a href="http://localhost:${portNumber}/reset-password/${token}" target="_blank">Click here to reset</a>
`;