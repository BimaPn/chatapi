import client from "../lib/redis/redisConnect.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { dateToTime } from "../utils/converter.js";
import { saveFile } from "../utils/storage.js";
import path from "path";

const storiesSocketHandlers = (io) => {
  const chat = io.of("/stories");
  chat.on("connection",async (socket) => {
    const auth = socket.user;
    socket.join(auth.id);

    socket.on("newStory",async (createdAt) => {
      const onlineFriends = await getOnlineFriends(auth.id);
      const newStory = {
        _id: auth.id,
        name: auth.name,
        avatar: auth.avatar,
        createdAt: createdAt,
        hasSeen: false
      }
      socket.to(onlineFriends).emit("newStory", newStory);
    });
 
  });
}

const getOnlineFriends = async (userId) => {
  const onlineUsers = await client.hVals("online");
  const result = await User.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $match: {
        'friends.status': 3,
        'friends.user': { $in: onlineUsers },
      } 
    },
    {
      $unwind: '$friends',
    },
    {
      $group: {
        _id: null,
        users: { $push: '$friends.user' },
      },
    },
  ]);
  return result.length <= 0 ? [] : result[0].users;
}

export default storiesSocketHandlers;
