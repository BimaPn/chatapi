import client from "../lib/redis/redisConnect.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const chatSocketHandlers = (io) => {
  const chat = io.of("/chat");
  chat.on("connection",async (socket) => {
    const userId = socket.user.id;
    console.log(`${userId} connect`);
    socket.join(userId);
    socket.broadcast.emit("onlineUser",socket.user.id,true);
    await client.set(`online:${userId}`,true);

    socket.on("message",async ({message,to}) => {
      await Message.create({
        senderId:userId,
        receiverId:to,
        message:message.message
      });

      const chat = {
        id:userId,
        name:socket.user.name,
        createdAt:message.createdAt,
        avatar:socket.user.avatar,
        message:message.message,
        unread: await client.incrBy(`unread:${to}-${userId}`,1),
      }

      socket.to(to).to(userId).emit("message",{message:message.message,from:chat});
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
