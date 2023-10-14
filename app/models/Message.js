import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const Message = mongoose.model("Message",new Schema({
  _id : {type:String,default:uuid},
  senderId : {type : String,index : true,required : true},
  receiverId : {type : String,index : true,required : true},
  message : {type : String,required : true},
  timestamp : {type : Date,default: Date.now()},
},{timestamps:true}));

export default Message;
