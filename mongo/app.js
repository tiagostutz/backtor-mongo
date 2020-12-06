const pino = require("pino");
const exec = require("child_process").exec;
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const ConductorWorker = require("conductor-nodejs-worker");

if (!process.env.MONGO_USER) {
  logger.error("MONGO_USER env not set. You must provide it to connect to the target database and run the backup");
  process.exit(1);
}
if (!process.env.MONGO_PASSWORD) {
  logger.error("MONGO_PASSWORD env not set. You must provide it to connect to the target database and run the backup");
  process.exit(1);
}
if (!process.env.MONGO_HOST) {
  logger.error("MONGO_HOST env not set. You must provide it to connect to the target database and run the backup");
  process.exit(1);
}
if (!process.env.MONGO_PORT) {
  logger.error("MONGO_PORT env not set. You must provide it to connect to the target database and run the backup");
  process.exit(1);
}
if (!process.env.MONGO_DATABASE) {
  logger.error("MONGO_DATABASE env not set. You must provide it to connect to the target database and run the backup");
  process.exit(1);
}
if (!process.env.CONDUCTOR_API_URL) {
  logger.error("CONDUCTOR_API_URL env not set. You must provide it to get backup scheduling from a Conductor server");
  process.exit(1);
}

const conductorURL = process.env.CONDUCTOR_API_URL || "http://localhost:8080";
const host = process.env.MONGO_HOST;
const port = process.env.MONGO_PORT;
const user = process.env.MONGO_USER;
const authDatabase = process.env.MONGO_AUTH_DATABASE || "admin";
const password = process.env.MONGO_PASSWORD;
const database = process.env.MONGO_DATABASE;
const dumpsDir = process.env.BACKUP_FILES_DIR || "/dumps";

const worker = new ConductorWorker({
  url: conductorURL, // host
  apiPath: "/api", // base path
  workerid: "mongo-backtor-worker",
});

const taskType = "backup";

const fn = (input) => {
  logger.info("Starting backup task. INPUT:", input);
  return new Promise((resolve, reject) => {
    const handler = setTimeout(() => {
      clearTimeout(handler);

      const newBackupPath = dumpsDir + "/mongodump-" + new Date().getTime(); // New backup path for current backup process
      var cmd =
        "mongodump --host " +
        host +
        " --port " +
        port +
        " --db " +
        database +
        " --authenticationDatabase=" +
        authDatabase +
        " --username " +
        user +
        " --password " +
        password +
        " --out " +
        newBackupPath +
        " --gzip "; // Command for mongodb dump process

      exec(cmd, (error, stdout, stderr) => {
        if (!error) {
          logger.info("Successfully executed `mongodump` command. ");
          resolve({
            result: false,
            dataId: newBackupPath,
            dataSizeMB: 1,
          });
        } else {
          reject("Error executing `mongodump` command. Details: " + error);
          logger.error("Error executing `mongodump` command. Details: " + error);
        }
        logger.info("Finished!");
      });

      //   worker.Stop();
    }, 3000);
  });
};

logger.info("Starting MongoDB Backtor Conductor Worker for backing up Mongo databases");

worker.Start(taskType, fn);
