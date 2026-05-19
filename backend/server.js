require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { validateEnv } = require("./src/config/env");
const { initializeSocket } = require("./src/sockets/socket");

validateEnv();

const PORT = Number(process.env.PORT) || 5000;
const server = http.createServer(app);

initializeSocket(server, app);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed", error);
    process.exitCode = 1;
  }
};

startServer();
