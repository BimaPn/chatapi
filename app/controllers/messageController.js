import Message from "../models/Message.js";
import User from "../models/User.js"
import { dateToTime } from '../utils/converter.js'
import client from "../lib/redis/redisConnect.js";

export const getUserMessages = async (req,res) => {
  const target = req.params.username;

  const messages = await Message.find(
    {
      $or: [
        {sender:req.user.username,receiver:target},
        {sender:target,receiver:req.user.username}
      ]
    }
  ).sort({createdAt:1}).exec();

  let newMessages = messages.map((item) => {
    let content = {};
    if(item.images.length !== 0) {
      content = {images : item.images};
    }else {
      content = {message : item.message};
    }
    return {
      id:item._id,
      ...content,
      isCurrentUser: item.senderId === req.user.id ? true : false,
      createdAt: dateToTime(item.createdAt)
    }
  });

  const userTarget = await User.findOneFilter({username:target}).exec();
  if(!userTarget) return res.status(404).json({message:"User not found."})

  const {username,name,avatar,bio} = userTarget;
  const isOnline = await client.exists(`online:${username}`) 
  res.status(200).json({
    message:"Success.",
    user:{
      username,
      name,
      avatar,
      bio
    },
    messages:newMessages,
    isOnline: isOnline
    });
}

export const getUsersList = async (req,res) => {
  const username = req.user.username;
  const users = await Message.aggregate([
    {
        $match: {
            $or: [
                { sender: username},
                { receiver: username }
            ]
        }
    },
    {
        $sort: {
            createdAt: -1
        }
    },
    {
        $group: {
            _id: {
                $cond: {
                    if: { $eq: ["$sender", username] },
                    then: "$receiver",
                    else: "$sender"
                }
            },
            lastMessage: { $first: "$$ROOT" }
        }
    },
    {
        $replaceRoot: { newRoot: "$lastMessage" }
    }
  ]);

  if(!users) {
    return res.json({users:[]});
  }

  // !! TEMPORARY SOLUTION, YOU MUST CHANGE LATER 
  const result = await Promise.all(users.map( async (data) => {
    const user = await User.findOne(
      {username:data.sender === username ? data.receiver : data.sender }).exec();

    return {
      username : user.username,
      name:user.name,
      avatar:user.avatar,
      message:data.message? data.message : "images",
      createdAt:dateToTime(data.createdAt),
      unread: await client.get(`unread:${req.user.username}-${user.username}`),
      isOnline : await client.exists(`online:${user.username}`)
    }
  }));
  // TEMPORARY SOLUTION, YOU MUST CHANGE LATER !!

  res.status(200).json({users:result});
}



