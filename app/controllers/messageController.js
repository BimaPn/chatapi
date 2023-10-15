import Message from "../models/Message.js";
import User from "../models/User.js"
import { dateToTime } from '../utils/converter.js'

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

  if(!messages) {
    return res.json({messages:[]});
  }
  let newMessages = messages.map((item) => {
    return {
      id:item._id,
      message:item.message,
      isCurrentUser: item.senderId === req.user.id ? true : false,
      time: dateToTime(item.createdAt)
    }
  });
  res.status(200).json({
      message:"Success.",
      messages:newMessages
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
  const result = await Promise.all(users.map( async (data) => {
    const user = await User.findOne(
      {_id:data.senderId === userId ? data.receiverId : data.senderId }).exec();

    return {
      id:user.id,
      name:user.name,
      image:"/images/people/1.jpg",
      message:data.message,
      time:dateToTime(data.createdAt)
    }
  }));
  res.status(200).json({users:result});
}



