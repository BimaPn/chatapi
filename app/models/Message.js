import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const Message = mongoose.model("Message",new Schema({
  _id : {type:String,default:uuid},
  senderId : {type : String,index : true,required : true},
  receiverId : {type : String,index : true,required : true},
  images : [{type: String,default:null}],
  message : {type : String,required : true},
 },{timestamps:true}));

export default Message;
