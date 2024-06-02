import User from "../models/User.js"

const roomSocketHandlers = async (io) => {
  const room = io.of("/room");
  room.on("connection", async (socket) => {
    const users = await User.find().exec(); 
    socket.emit("rooms",users);
  });
}
export default roomSocketHandlers;
