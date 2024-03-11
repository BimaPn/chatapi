import User from "../models/User.js"
import bcrypt from "bcrypt"
import connectDB, { disconnectDB } from '../config/dbConn.js'
import 'dotenv/config'

export const seedUser = async () => {
  connectDB();
  const hashedPassword = await bcrypt.hash("password",10);

  const general = {
    bio : "Hi, I'm new user bro.",
    password: hashedPassword
  };

  await User.create({
    name: "Nanang Hacker",
    username: "nanang",
    email: "nanang@gmail.com",
    ...general
  });

  await User.create({
    name: "Dodi Junior",
    username: "dodi22",
    email: "dodi@gmail.com",
    ...general
  });

  await User.create({
    name: "Tatang Ahmad",
    username: "tatang",
    email: "tatang@gmail.com",
    ...general
  });

  await User.create({
    name: "Michel Ahmad Jordan",
    username: "michel",
    email: "michel@gmail.com",
    ...general
  });

  disconnectDB()
}

