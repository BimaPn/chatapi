import Message from "../models/Message.js";
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



