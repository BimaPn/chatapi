import mongoose from 'mongoose';

const DATABASE_URI = "mongodb://bindapi:BSAIGkNoHCcPpSox@ac-2er5kxs-shard-00-00.u8yvkaq.mongodb.net:27017,ac-2er5kxs-shard-00-01.u8yvkaq.mongodb.net:27017,ac-2er5kxs-shard-00-02.u8yvkaq.mongodb.net:27017/?ssl=true&replicaSet=atlas-kb2d9a-shard-0&authSource=admin&retryWrites=true&w=majority"

const connectDB = async () => {
  try {
   await mongoose.connect(DATABASE_URI,{
     useUnifiedTopology : true,
     useNewUrlParser : true
   }) 
  } catch (err) {
    console.log(err);
  }
}

export const disconnectDB = async () => {
  await mongoose.disconnect();
}


export default connectDB;


