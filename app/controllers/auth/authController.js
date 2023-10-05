import User from "../../models/User.js"
import bcrypt from "bcrypt"
import pkg from 'jsonwebtoken';
const { verify,sign } = pkg;

export const handleLogin = async (req, res) => {
  const { email,password } = req.body;
  if(!email || !password) {
    return res.status(400).json({message : "Email and password are required"}); 
  } 
  const foundUser = await User.findOne({ email }).exec();
  if(!foundUser) return res.status(401).json({message : "User not found"}); //Unauthorized
  
  //evaluate password
  const match = await bcrypt.compare(password,foundUser.password);
  if(!match) {
    return res.status(401).json({message : "Email or password is incorrect"})
  }
  //create JWT
  const accessToken = sign(
    {
      userInfo : {
        id : foundUser.id,
        name : foundUser.name,
        email : foundUser.email,
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
  //saving refreshTOken with current user
  foundUser.refreshToken = refreshToken;
  await foundUser.save();
  
  //creates secure cookie with refresh token & user id
  res.cookie("jwt",refreshToken,{ httpOnly : true,sameSite : "None",maxAge: 24 * 60 * 60 * 1000 });

  res.json({
    id:foundUser.id,
    name:foundUser.name,
    email:foundUser.email,  
    accessToken
  });
}

export const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); //Forbidden 
    // evaluate jwt 
    verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.email !== decoded.email) return res.sendStatus(403);
            const accessToken = sign(
                {
                  userInfo : {
                    id : foundUser.id,
                    name : foundUser.name,
                    email : foundUser.email,
                  }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '5d' }
            );
            res.json({  accessToken })
        }
    );
}

export const handleLogout = async (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    foundUser.refreshToken = '';
    await foundUser.save();

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.status(200).json({message : "success"});
}


