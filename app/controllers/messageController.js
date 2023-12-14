import Message from "../models/Message.js";
import User from "../models/User.js"
import { dateToTime } from '../utils/converter.js'
import client from "../lib/redis/redisConnect.js";

export const getUserMessages = async (req,res) => {
  const target = req.params.id;

  const messages = await Message.find(
    {
      $or: [
        {senderId:req.user.id,receiverId:target},
        {senderId:target,receiverId:req.user.id}
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

  const userTarget = await User.findOneFilter({_id:target}).exec();
  if(!userTarget) return res.status(404).json({message:"User not found."})

  const {_id,name,avatar,bio} = userTarget;
  const isOnline = await client.exists(`online:${_id}`) 
  res.status(200).json({
    message:"Success.",
    user:{
      id:_id,
      name,
      avatar,
      bio
    },
    messages:newMessages,
    isOnline: isOnline
    });
}

export const getUsersList = async (req,res) => {
  const userId = req.user.id;
  const users = await Message.aggregate([
    {
        $match: {
            $or: [
                { senderId: userId},
                { receiverId: userId }
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
                    if: { $eq: ["$senderId", userId] },
                    then: "$receiverId",
                    else: "$senderId"
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
      {_id:data.senderId === userId ? data.receiverId : data.senderId }).exec();

    return {
      id:user.id,
      name:user.name,
      avatar:user.avatar,
      message:data.message? data.message : "images",
      createdAt:dateToTime(data.createdAt),
      unread: await client.get(`unread:${req.user.id}-${user.id}`),
      isOnline : await client.exists(`online:${user.id}`)
    }
  }));
  // TEMPORARY SOLUTION, YOU MUST CHANGE LATER !!

  res.status(200).json({users:result});
}



