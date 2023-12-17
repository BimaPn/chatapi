import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const userSchema = new Schema({
  _id : {
    type:String,
    default:uuid
  },
  name : {
    type : String,
    minLength : 4,
    maxLength : 26,
    required : true
  },
  username : {
    type : String,
    unique : true,
    index : true,
    minLength : 6,
    maxLength : 24,
    required : true
  },
  bio : {
    type : String,
    required : false,
    default : "Hallo everyone !"
  },
  avatar : {
    type : String,
    required : false,
    default : `${process.env.APP_URL}/images/users/default.jpg`
  },
  email : {
    type : String,
    required : true,
    unique : true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Invalid email address format',
    },
  },
  password : {
    type : String,
    required : true
  },
  refreshToken : String,
});

userSchema.statics.findOneFilter = function (query) {
  return this.findOne(query,{_id:0,name:1,username:1,email:1,avatar:1,bio:1});
}

const User = mongoose.model("User",userSchema);

export default User;
