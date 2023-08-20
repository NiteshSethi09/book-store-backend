import { createLogger, transports, format } from "winston";

export const logger = createLogger({
  format: format.json(),
  // to write logs in file
  transports: [new transports.File({ filename: "logs/server.log" })],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}
