import User from "../../models/User.js"
import bcrypt from "bcrypt"
import { isValidUsername } from "../../utils/validations.js";

export const handleNewUser = async (req, res) => {
  const { name, email, username, password, password_confirmation } = req.body;
  if(password !== password_confirmation) {
    return res.status(400).json({message : "Password confirmation is incorrect"});
  }

  const usernameValidation = await isValidUsername(username);

  if(!usernameValidation.isValid) {
    return res.status(400).json({message : usernameValidation.message});
  }

  const duplicate = await User.findOne({ email }).exec();
  if(duplicate) return res.status(409).json({message:"Account is already exist."}); //conflict
  
  //encrypt the password
  const hashedPwd = await bcrypt.hash(password,10);

  //create and store new user
  await User.create({
    name,
    email,
    username,
    password : hashedPwd
  });

  res.status(201).json({ success : "new user created !" });
}


