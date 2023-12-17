import client from "../lib/redis/redisConnect.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { initMulter, saveFile } from "../utils/storage.js";
import {writeFile} from "fs"
import path from "path";

const chatSocketHandlers = (io) => {
  const chat = io.of("/chat");
  chat.on("connection",async (socket) => {
    const username = socket.user.username;
    console.log(`${username} connect`);
    socket.join(username);
    socket.broadcast.emit("onlineUser",username,true);
    await client.set(`online:${username}`,1);

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
        sender:username,
        receiver:to,
        ...content
      }    
      await Message.create(finalMessage).catch((err) => {
        socket.emit("messageError",err);
        console.log(err);
        return;
      });

      const chat = {
        username:username,
        name:socket.user.name,
        createdAt:message.createdAt,
        avatar:socket.user.avatar,
        message:message.message ? message.message : "images",
        unread: await client.incrBy(`unread:${to}-${username}`,1),
      }

      socket.to(to).to(username).emit("message",{content,from:chat});
    });

    socket.on("messagesRead", async (target) => {
      await client.del(`unread:${username}-${target}`);
    })
    
    socket.on("disconnect",async (msg) => {
      socket.broadcast.emit("onlineUser",username,false);
      await client.del(`online:${username}`);
      console.log(`${username} disconnect`);
    });
  });
}

export default chatSocketHandlers;
