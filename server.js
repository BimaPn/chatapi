import app from "./app/app.js";
import { createServer } from "http"
import { Server } from "socket.io"
import chatSocketHandlers from "./app/websockets/chatSocket.js";
import roomSocketHandlers from "./app/websockets/roomSocket.js";
import 'dotenv/config.js';
import sessionMiddleware from "./app/middleware/session.js";
import mongoose from 'mongoose';
import cookieParser from "cookie-parser";
import connectDB from './app/config/dbConn.js'; 
import { socketAuth } from "./app/middleware/verifyJWT.js";
import "./app/lib/cron/removeStoryMediaTask.js"

connectDB();
const PORT = process.env.PORT || 3500;
const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin:process.env.FRONTEND_URL,
  },
  maxHttpBufferSize:1e8,
});

// Add socket middleware
io.use(socketAuth);
io.on("new_namespace",(namespace) => {
  namespace.use(socketAuth);
});

// Socket implementations
io.on("connection",(socket) => {
  console.log("user has connect : ",socket.id);
});

chatSocketHandlers(io);
roomSocketHandlers(io);

mongoose.connection.once('open',() => {
  server.listen(PORT,()=> console.log(`server starting on port ${PORT}`));
});

