import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const User = mongoose.model("User",new Schema({
  _id : {type:String,default:uuid},
  name : {type : String,required : true},
  email : {type : String,required : true},
  password : {type : String,required : true},
  refreshToken : String,
}));

export default User;
