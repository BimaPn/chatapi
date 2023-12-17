import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const userSchema = new Schema({
  _id : {type:String,default:uuid},
  name : {type : String, required : true},
  username : {type : String, unique : true, index : true, required : true},
  bio : {type : String,required : false,default : null},
  avatar : {type : String,required : false,default : `${process.env.APP_URL}/images/users/default.jpg`},
  email : {type : String,required : true},
  password : {type : String,required : true},
  refreshToken : String,
});

userSchema.statics.findOneFilter = function (query) {
  return this.findOne(query,{_id:1,name:1,email:1,avatar:1,bio:1});
}

const User = mongoose.model("User",userSchema);

export default User;
