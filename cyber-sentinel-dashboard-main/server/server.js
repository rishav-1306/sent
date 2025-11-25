import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Server } from "socket.io";
import authRouter from "./routes/auth.route.js";
import securityRouter from "./routes/security.route.js";
import { attachSecuritySocket } from "./services/security.service.js";

dotenv.config({ path: "../.env" });

const app = express();
const server = http.createServer(app);

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:3000,http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173"
)
  .split(",")
  .map((origin) => origin.trim());

console.log('Allowed CORS origins:', allowedOrigins);

// Configure CORS for regular HTTP requests
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/security", securityRouter);

// Configure WebSocket server with CORS
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
        console.log('Allowing WebSocket connection from origin:', origin);
        callback(null, true);
      } else {
        console.warn('Blocked WebSocket connection from origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "my-custom-header"],
  },
  // Enable HTTP long polling as fallback
  transports: ['websocket', 'polling'],
  // Add ping timeout and interval
  pingTimeout: 10000,
  pingInterval: 25000,
  // Handle upgrade requests
  allowUpgrades: true,
  // Enable compatibility mode for older Socket.IO clients
  allowEIO3: true
});
attachSecuritySocket(io);

// Handle WebSocket connection events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Handle any custom events here
});

const startServer = async () => {
  const port = process.env.PORT || 4000;
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to MongoDB ✅");
    } catch (error) {
      console.error("Failed to connect to MongoDB ❌", error.message);
      process.exit(1);
    }
  } else {
    console.warn("MONGO_URI not provided. Auth endpoints will not persist data.");
  }

  server.listen(port, () => {
    console.log(`API & Socket server listening on ${port}`);
  });
};

startServer();