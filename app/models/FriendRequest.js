import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const Message = mongoose.model("Message",new Schema({
  _id : {
    type:String,
    default:uuid
  },
  sender : {
    type : String,
    index : true,
    ref : "User",
    required : true
  },
  receiver : {
    type : String,
    index : true,
    ref : "User",
    required : true
  },
 },{timestamps:true}));

export default Message;
