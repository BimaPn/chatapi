import client from "../lib/redis/redisConnect.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { saveFile } from "../utils/storage.js";
import path from "path";

const chatSocketHandlers = (io) => {
  const chat = io.of("/chat");
  chat.on("connection",async (socket) => {
    const auth = socket.user.id;
    console.log(`${auth} connect`);
    socket.join(auth);
    await client.hSet("online",auth,auth);
    socket.broadcast.emit("onlineUser",socket.user.username,true);

    socket.on("message",async ({message,to}) => {
      let content = {};
      if("message" in message) {
        content = {message : message.message};
      }else {
        content = {media: message.media};
      }
      const chat = {
        username:socket.user.username,
        name:socket.user.name,
        createdAt:message.createdAt,
        avatar:socket.user.avatar,
        message:message.message ? message.message : "images",
        unread: await client.incrBy(`unread:${to}-${auth.username}`,1),
      }
      socket.to(to).to(auth).emit("message",{content,from:chat});
    });

    socket.on("typing", (target, isTyping) => {
      socket.to(target).emit("typing",auth, isTyping);
    });

    socket.on("friendRequest", async (to, status) => {
      socket.to(to).emit("friendRequest",auth, status);
    });

    socket.on("messagesRead", async (target) => {
      await client.del(`unread:${auth.username}-${target}`);
    });
    
    socket.on("disconnect",async (msg) => {
      socket.broadcast.emit("onlineUser",socket.user.username,false);
      await client.hDel("online",auth);
      console.log(`${auth} disconnect`);
    });
  });
}

export default chatSocketHandlers;
