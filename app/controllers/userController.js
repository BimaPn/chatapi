import { v4 as uuid } from "uuid";
import User from "../models/User.js";
import { deleteFile } from "../utils/storage.js";

export const updateUser = async (req,res) => {
  const username = req.params.username;
  const { name, bio, avatar } = req.body;

  const user = await User.findOne({ username });
  if(!user){
      res.status(400).json({message:"user not found"});
  }

  if( name ) user.name = name;
  if( bio ) user.bio = bio;
  if(req.file) {
    if(!user.avatar.includes("default.jpg")) {
      const basePath = `${__basedir}/public/images/users`;
      const fileName = user.avatar.split("/").pop();
      const destination = `${basePath}/${fileName}`;
      deleteFile(destination);
    }

    const fileName = req.file.filename;
    user.avatar = `${process.env.APP_URL}/images/users/${fileName}`;
  }
  
  await user.save();
  res.json({
    message : 'success',
    user 
  });
}

