import { v4 as uuid } from "uuid";
import User from "../models/User.js";
import { deleteFile } from "../utils/storage.js";
import client from "../lib/redis/redisConnect.js";
  
export const updateUser = async (req,res) => {
  const auth = req.user.id;
  const { name, bio } = req.body;
  let avatar;

  const user = await User.findOne({ _id:auth });
  if(!user){
      res.status(400).json({message:"user not found"});
  }
  if( name ) user.name = name;
  if( bio ) user.bio = bio;
  if(req.file) {
    if(!user.avatar.includes("default.jpg")) {
      const basePath = `${__basedir}/public/media/user`;
      const fileName = user.avatar.split("/").pop();
      const destination = `${basePath}/${fileName}`;
      deleteFile(destination);
    }
    const fileName = req.file.filename;
    avatar = `${process.env.APP_URL}/media/user/${fileName}`;
    user.avatar = avatar;
  }
  try {
    await user.save();
  } catch (err) {
   return res.status(400).json({errors:err.errors}); 
  }
  try {
    await client.HSET(`users:${auth}`,{
      name,
      bio,
      avatar: avatar ? avatar : user.avatar
    });
  } catch (err) {
   return res.status(400).json({errors:err.errors}); 
  }
  res.json({
    message : 'success',
    user 
  });
}

export const friendRequest = async (req, res) => {
  // const username = req.params.username;
  // const userTarget = await User.findOne({ username }).exec();
  // if(!userTarget) {
  //   return res.status(404).json({message:"User not found."});
  // } 
  // try {
  //   await FriendRequest.create({
  //     sender: req.user.username,
  //     receiver: username,
  //   });
  // } catch (err) {
  //  return res.status(400).json({errors:err.errors}); 
  // }
  // res.json({
  //   message: "success"
  // });
} 

