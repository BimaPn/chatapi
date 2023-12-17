import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const Message = mongoose.model("Message",new Schema({
  _id : {type:String,default:uuid},
  sender : {type : String,index : true,required : true},
  receiver : {type : String,index : true,required : true},
  images : [{type: String,default:null,required : false}],
  message : {type : String,required : false},
 },{timestamps:true}));

export default Message;
