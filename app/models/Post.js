import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const Post = mongoose.model("Post",new Schema({
  _id : {type:String,default:uuid},
  title : String,
  author : {type:String,required:true},
  body : String,
},));
export default Post;
