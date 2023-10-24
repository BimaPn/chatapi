import client from "../lib/redis/redisConnect.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const chatSocketHandlers = (io) => {
  const chat = io.of("/chat");
  chat.on("connection",(socket) => {
    const userId = socket.user.id;
    console.log(`${userId} connect`);
    socket.join(userId);

    socket.on("message",async ({message,to}) => {
      await Message.create({
        senderId:userId,
        receiverId:to,
        message:message.message
      });

      // !! TEMPORARY SOLUTION, YOU MUST CHANGE LATER 
      const chat = {
        id:userId,
        name:socket.user.name,
        createdAt:message.createdAt,
        avatar:socket.user.avatar,
        message:message.message,
        unread: await client.incrBy(`unread:${to}-${userId}`,1)
      }
      // TEMPORARY SOLUTION, YOU MUST CHANGE LATER !!

      socket.to(to).to(userId).emit("message",{message:message.message,from:chat});
    });

    socket.on("messagesRead", async (target) => {
      await client.del(`unread:${userId}-${target}`);
    })
    
    socket.on("disconnect",(msg) => console.log(`${userId} disconnect`));
  });
}

export default chatSocketHandlers;
