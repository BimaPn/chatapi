
const chatSocketHandlers = (io) => {
  const chat = io.of("/chat");
  chat.on("connection",(socket) => {
    const userId = socket.user.id;
    console.log(`${userId} connect`);
    socket.join(userId);
    socket.on("message",({message,to}) => {
      console.log(message);
      socket.to(to).to(userId).emit("message",{message,to});
    });
    socket.on("disconnect",(msg) => console.log(`${userId} disconnect`));
  });
}
export default chatSocketHandlers;
