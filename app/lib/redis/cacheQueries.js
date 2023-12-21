import client from "./redisConnect.js";
import User from "../../models/User.js";

export const getUserCache = async (username) => {
  const isExist = await client.exists(`users:${username}`);
  if(isExist) {
    const user = await client.hGetAll(`users:${username}`);
    return user;
  }  
  let foundUser = await User.findOne({ username })
    .select({_id:0,name:1,username:1,email:1,avatar:1,bio:1}).exec();

  if(!foundUser) throw new Error("User not found.");    

  const result = {
    ...foundUser._doc
  }

  await client.HSET(`users:${username}`,{
    ...result,
    bio : foundUser.bio ? foundUser.bio : "",
  })
  .catch(err => {throw new Error(err)});
  await client.expire(`users:${username}`,60*60*24*14); // 2 weeks

  return result;
}
