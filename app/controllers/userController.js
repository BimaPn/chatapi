import User from "../models/User.js";
import { deleteFile } from "../utils/storage.js";
import client from "../lib/redis/redisConnect.js";
  
export const updateUser = async (req,res) => {
  const auth = req.user.id;
  const { name, bio } = req.body;
  let avatar;

  const user = await User.findOne({ _id:auth }).exec();
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

export const searchUsers = async (req, res) => {
  const username = req.query.username;
  try {
    const users = await User.find({username: {$regex: username, $options: "i"}},"name username bio avatar").limit(15)
    res.json({
      users
    });
  } catch (err) {
    res.status(500).json({message: "There is something wrong."});
  }
} 

export const checkFriend = async (req, res) => {
  const target = req.params.id;
  const auth = req.user.id;

  const user = await User.findOne({_id:auth,"friends.user":target},
  {"friends.$":1}).exec();

  let status;
  if(user) {
    status = `${user.friends[0].status}`;
  }else {
    status = "0";
  }
  res.json({
    status
  });
}

export const deleteFriend = async (req, res) => {
  const target = req.params.id;
  const auth = req.user.id;
  try {
    await User.updateOne(
      {_id: auth},
      {$pull: {friends:{user:target}}}
    ).exec();
    await User.updateOne(
      {_id: target},
      {$pull: {friends:{user:auth}}}
    ).exec();
  } catch (err) {
   return res.status(400).json({errors:err}); 
  }
  res.json({
    status: "0"
  });
}

export const friendRequest = async (req, res) => {
  const target = req.params.id;
  const auth = req.user.id;
  try {
    await User.updateOne(
      {_id: auth, "friends.user": {$ne: target}},
      {$push: {friends: {user: target, status: 1}}}
    ).exec();
    await User.updateOne(
      {_id: target, "friends.user": {$ne: auth}},
      {$push: {friends: {user: auth, status: 2}}}
    ).exec();
  } catch (err) {
   return res.status(400).json({errors:err.errors}); 
  }
  res.json({
    status: "1"
  });
} 

export const acceptFriendRequest = async (req, res) => {
  const target = req.params.id;
  const auth = req.user.id;
  try {
    await User.updateOne(
      {_id: auth, "friends.user": target},
      {$set: {"friends.$.status":3}}
    ).exec();
    await User.updateOne(
      {_id: target, "friends.user": auth},
      {$set: {"friends.$.status":3}}
    ).exec();
  } catch (err) {
   return res.status(400).json({errors:err.errors}); 
  }
  res.json({
    status: "3"
  });
} 



