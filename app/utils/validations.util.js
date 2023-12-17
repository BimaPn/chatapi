import User from "../models/User.js"

export const isValidUsername = async (username) => {
  const regex = /^[a-zA-Z0-9]+$/;
  if(username.length < 6) {
    return {
      isValid : false,
      message : "Username must be at least 6 characters"
    }; 
  }else if (username.length > 24) {
    return {
      isValid : false,
      message : "Username cannot exceed 24 characters."
    }; 
  }else if (!regex.test(username)) {
    return {
      isValid : false,
      message : "Username can only consist of letters or numbers and must not contain spaces."
    }; 
  }

  const isExist = await User.findOne({username}).exec();
  if (isExist) {
    return {
      isValid : false,
      message : "This username is already taken. Please choose another username."
    }; 
  }
  
  return {
    isValid : true,
    message : "Username is valid."
  };
}
