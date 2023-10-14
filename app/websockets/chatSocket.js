import Message from "../models/Message.js";

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
      message
    });
    socket.to(to).to(userId).emit("message",{message,from:userId});
  });

    socket.on("disconnect",(msg) => console.log(`${userId} disconnect`));
  });
}
export default chatSocketHandlers;
