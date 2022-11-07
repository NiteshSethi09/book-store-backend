import { portNumber } from "./config";

export const signupMessage = (token: string) => `
  <p>Hi, please verify your account by click on the link given below</p>
  <a href="http://localhost:${portNumber}/verify/${token}" target="_blank">Click here to verify</a>.
`;
