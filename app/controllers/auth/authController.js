import User from "../../models/User.js"
import bcrypt from "bcrypt"
import pkg from 'jsonwebtoken';
import client from "../../lib/redis/redisConnect.js"
import { getUserCache } from "../../lib/redis/cacheQueries.js";
import { isValidUsername } from "../../utils/validations.js";
const { verify,sign } = pkg;

export const handleLogin = async (req, res) => {
  const { email,password } = req.body;
  if(!email || !password) {
    return res.status(400).json({message : "Email and password are required"}); 
  } 
  const foundUser = await User.findOne({ email }).select({password:1,username:1}).exec();
  if(!foundUser) return res.status(401).json({message : "User not found"}); 
  
  const match = await bcrypt.compare(password,foundUser.password);
  if(!match) {
    return res.status(401).json({message : "Email or password is incorrect"})
  }

  const accessToken = sign(
    {
      user : {
        username : foundUser.username,
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn : "5d" }
  );

  const refreshToken = sign(
    {email : foundUser.email},
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn : "7d" }
  );

  foundUser.refreshToken = refreshToken;
  await foundUser.save();
  
  res.cookie("jwt","shit",{
    httpOnly : true,
    sameSite : "None",
    secure: false,
    maxAge: 24 * 60 * 60 * 30 });

  const result = await getUserCache(foundUser.username).catch((err) => {
    return res.status(500).json({message : "Internal server error."})
  });
  res.json({
    ...result,
    accessToken
  });
}

export const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); 

    verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
            const accessToken = sign(
                {
                  user : {
                    username : foundUser.username,
                  } 
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '5d' }
            );
            res.json({  accessToken })
        }
    );
}

export const usernameCheck = async (req, res) => {
  const { username } = req.body;
  
  const result = await isValidUsername(username);

  if(!result.isValid) {
    return res.status(400).json({message : result.message}); 
  }
  
  res.json({message : result.message});
}

export const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content

    const refreshToken = cookies.jwt;
    
    // -- TEMPORARY SOLUTION, PLEASE CHANGE IT LATER 
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure:false });
        return res.sendStatus(204);
    }

    foundUser.refreshToken = '';
    console.log(foundUser)
    await foundUser.save();
    // --

    await client.hDel(`users:${foundUser.id}`);
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure:false });
    res.status(200).json({message : "success"});
}


