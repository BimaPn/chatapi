import mongoose from "mongoose"
import { v4 as uuid } from "uuid"

const { Schema } = mongoose;

const storySchema = new Schema({
  _id : {
    type:String,
    default:uuid
  },
  createdBy : {
    type : String,
    index : true, 
    ref : "User",
    required : true
  },
  media : {
    type : String,
    required: true
  },
  caption : {
    type : String,
    minLength : [1, "Please enter a valid caption with at least 1 characters."],
    maxLength : [50, "Caption must not exceed 50 characters."],
    required : false
  },
},{timestamps:true})

storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

const Story = mongoose.model("Story",storySchema);
export default Story;
