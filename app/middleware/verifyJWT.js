import pkg from 'jsonwebtoken';
import { getUserCache } from '../lib/redis/cacheQueries.js';
const { verify } = pkg;

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); 
            req.user = decoded.user;
            next();
        }
    );
}

export const socketAuth = async (socket,next) => {
  const token = socket.handshake.query.accessToken;
  verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decoded) => {
          if (err) return next(new Error("Access Denied. Token is invalid.")); 
          socket.user = await getUserCache(decoded.user.id);
          next();
      }
  );
}
