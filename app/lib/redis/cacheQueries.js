import client from "./redisConnect.js";
import User from "../../models/User.js";

export const getUserCache = async (id) => {
  const isExist = await client.exists(`users:${id}`);
  if(isExist) {
    const user = await client.hGetAll(`users:${id}`);
    return user;
  }  
  const foundUser = await User.findOne({ _id: id })
    .select({ _id: 0, name: 1, username: 1, email: 1, avatar: 1, bio: 1 })
    .exec();

  if(!foundUser) throw new Error("User not found.");    
  
  const { name, username, email, avatar, bio } = foundUser;

  const result = { id, name, username, email, avatar, bio };

  await client.HSET(`users:${id}`,result)
  .catch(err => {throw new Error(err)});
  await client.expire(`users:${id}`,60*60*24*14); // 2 weeks
  return result;
}
