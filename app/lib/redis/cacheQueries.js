import client from "./redisConnect.js";
import User from "../../models/User.js";

export const getUserCache = async (userId) => {
  const user = await client.hGetAll(`users:${userId}`);
  if(user) {
    return user;
  }  
  
  let foundUser = await User.findOne({ _id:userId })
    .select({_id:0,name:1,email:1,avatar:1,bio:1}).exec();

  if(!foundUser) throw new Error("User not found.");    

  const result = {
    id:userId,
    ...foundUser._doc
  }

  await client.HSET(`users:${userId}`,{
    ...result,
    bio : foundUser.bio ? foundUser.bio : "",
  })
  .catch(err => {throw new Error(err)});
  await client.expire(`users:${userId}`,60*60*24*14); // 2 weeks

  return result;
}