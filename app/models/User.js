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
    minLength : [4, "Please enter a valid name with at least 4 characters."],
    maxLength : [26, "Name must not exceed 26 characters."],
    required : [true, "Name is required."]
  },
  username : {
    type : String,
    unique : true,
    index : true,
    minLength : [6, "Please enter a valid name with at least 4 characters."],
    maxLength : [24, "Username must not exceed 24 characters."],
    required : [true, "Name is required."],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9]+$/.test(value);
      },
      message: "Username can only consist of letters or numbers and must not contain spaces.",
    },
  },
  bio : {
    type : String,
    required : true,
    minLength : [4, "Please enter a valid bio with at least 4 characters."],
    maxLength : [50, "Bio must not exceed 50 characters."],
    default : "Hallo everyone !"
  },
  avatar : {
    type : String,
    required : [true, "Name is required."],
    default : `${process.env.APP_URL}/media/user/default.jpg`
  },
  email : {
    type : String,
    required : [true, "Name is required."],
    unique : true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Invalid email address format',
    },
  },
  friends : [
    {
      user:{
        type: String,
        ref: "User"
      },
      status:{
        type: Number,
        index: true,
        enums: [1, 2, 3]
      }
    }
  ],
  password : {
    type : String,
    select : false,
    required : [true, "Name is required."]
  },
  refreshToken : String,
},{timestamps:true});

userSchema.statics.findOneFilter = function (query) {
  return this.findOne(query,{_id:0,name:1,username:1,email:1,avatar:1,bio:1});
}

const User = mongoose.model("User",userSchema);

export default User;
