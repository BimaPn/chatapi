import User from "../../models/User.js"
import bcrypt from "bcrypt"

export const handleNewUser = async (req, res) => {
  const { name,email,password,password_confirmation } = req.body;
  if(password !== password_confirmation) {
    return res.status(400).json({password_confirmation : "Password confirmation is incorrect"});
  }
  if(!email || !password || !name) {
    return res.status(400).json({message : "email or password or name is required"}); 
  } 
  const duplicate = await User.findOne({ email }).exec();
  if(duplicate) return res.status(409).json({message:"Account is already exist."}); //conflict
  
  //encrypt the password
  const hashedPwd = await bcrypt.hash(password,10);

  //create and store new user
  await User.create({
    name,
    email,
    password : hashedPwd
  });

  res.status(201).json({ success : "new user created !" });
}


