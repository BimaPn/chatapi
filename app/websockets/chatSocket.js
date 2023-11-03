import client from "../lib/redis/redisConnect.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { initMulter } from "../utils/diskStorage.js";
import {writeFile} from "fs"
import path from "path";
import { saveFile } from "../utils/storeFile.js";

const chatSocketHandlers = (io) => {
  const chat = io.of("/chat");
  chat.on("connection",async (socket) => {
    const userId = socket.user.id;
    console.log(`${userId} connect`);
    socket.join(userId);
    socket.broadcast.emit("onlineUser",socket.user.id,true);
    await client.set(`online:${userId}`,1);

    socket.on("message",async ({message,to}) => {
      let content = {};
      if("message" in message) {
        content = {message : message.message};
      }else {
        const savedImages = [];
        for(const image of message.images) {
          savedImages.push(await saveFile(image,"images/chat"));
        }
        content = {images : savedImages};
      }
      
      const finalMessage = {
        senderId:userId,
        receiverId:to,
        ...content
      }    
      await Message.create(finalMessage).catch((err) => {
        socket.emit("messageError",err);
        console.log(err);
        return;
      });

      const chat = {
        id:userId,
        name:socket.user.name,
        createdAt:message.createdAt,
        avatar:socket.user.avatar,
        message:message.message ? message.message : "images",
        unread: await client.incrBy(`unread:${to}-${userId}`,1),
      }

      socket.to(to).to(userId).emit("message",{content,from:chat});
    });

    socket.on("messagesRead", async (target) => {
      await client.del(`unread:${userId}-${target}`);
    })
    
    socket.on("disconnect",async (msg) => {
      socket.broadcast.emit("onlineUser",socket.user.id,false);
      await client.del(`online:${userId}`);
      console.log(`${userId} disconnect`);
    });
  });
}

export default chatSocketHandlers;
