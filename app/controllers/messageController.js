import Message from "../models/Message.js";
import User from "../models/User.js"
import { dateToTime } from '../utils/converter.js'
import client from "../lib/redis/redisConnect.js";

export const getUserMessages = async (req,res) => {
  const target = req.params.username;
  const auth = req.user.username;
  const messages = await Message.find(
    {
      $or: [
        {sender: auth,receiver:target},
        {sender:target,receiver: auth}
      ]
    }
  ).sort({createdAt:1}).exec();

  let newMessages = messages.map((item) => {
    let content = {};
    if(item.media.length !== 0) {
      content = {media : item.media};
    }else {
      content = {message : item.message};
    }
    return {
      id:item._id,
      ...content,
      isCurrentUser: item.sender === auth ? true : false,
      createdAt: dateToTime(item.createdAt)
    }
  });

  const userTarget = await User.findOneFilter({ username: target }).exec();
  if(!userTarget) return res.status(404).json({message:"User not found."})

  const { username, name, avatar, bio } = userTarget;
  const isOnline = await client.exists(`online:${username}`); 
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

export const createMessage = async (req, res) => {
  const username = req.params.username;
  const files = req.files["files[]"];
  const { message } = req.body;
  
  if(!files && !message) {
    return res.status(400).json({
      message: "Media or message required."
    });
  }
  
  const relation = {
    sender: req.user.username,
    receiver: username
  } 

  const finalMessage = {};

  if(files) {
    const media = files.map((file) => `${process.env.APP_URL}/images/message/${file.filename}`)
    try {
      const createdMedia = await Message.create({
        ...relation,
        media
      });
      finalMessage.media = {
        id: createdMedia.id,
        media: createdMedia.media
      }
    } catch (err) {
      return res.status(400).json({type:"media",errors:err.errors}); 
    }
  }

  if(message) {
    try {
      const createdMessage = await Message.create({
        ...relation,
        message 
      });
      finalMessage.message = {
        id: createdMessage.id,
        message: createdMessage.message
      };
    } catch (err) {
      return res.status(400).json({type:"message",errors:err.errors}); 
    }
  }

  return res.status(200).json({
    createdAt: dateToTime(new Date()),
    ...finalMessage 
  });
}

export const getUsersList = async (req,res) => {
  const auth = req.user.username;
  const messages = await Message.aggregate([
    {
        $match: {
            $or: [
                { sender: auth},
                { receiver: auth }
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
                    if: { $eq: ["$sender", auth] },
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
  if(!messages) {
    return res.json({users:[]});
  }

  // !! TEMPORARY SOLUTION, YOU MUST CHANGE LATER 
  const result = await Promise.all(messages.map( async (data) => {
    const user = await User.findOne(
      {username:data.sender === auth ? data.receiver : data.sender }).exec();

    return {
      username: user.username,
      name:user.name,
      avatar:user.avatar,
      message:data.message? data.message : "images",
      createdAt:dateToTime(data.createdAt),
      unread: await client.get(`unread:${auth}-${user.username}`),
      isOnline : await client.exists(`online:${user.username}`)
    }
  }));
  // TEMPORARY SOLUTION, YOU MUST CHANGE LATER !!

  res.status(200).json({users:result});
}



