import Story from "../models/Story.js";
import client from "../lib/redis/redisConnect.js";
import User from "../models/User.js";

export const addStory = async (req, res)=> {
  const caption = req.body.caption;
  const media = req.file;

  const story = {
    createdBy: req.user.id
  } 
  if(caption) {
    story.caption = caption;
  }
  if(media) {
    const fileName = media.filename;
    const basePath = `${__basedir}/public/media/story/${fileName}`;
    story.media = `${process.env.APP_URL}/media/story/${fileName}`;
    await client.zAdd("storyMedia", {score: Date.now() + (24 * 60 * 60 * 1000), value: basePath});
  }
  try {
    await Story.create(story);
  } catch (err) {
    return res.status(400).json({errors:err.errors}); 
  }

  return res.json({ message:"success" })
}

export const getFriendsLastStory = async (req, res) => {
  const auth = req.user.id;
  const lastStories = await User.aggregate([
  { $match: { _id: auth } },
  {
    $unwind: '$friends',
  },
  {
    $match: { 'friends.status': 3 },
  },
  {
    $lookup: {
      from: 'stories',
      localField: 'friends.user',
      foreignField: 'createdBy',
      as: 'friendStories',
    },
  },
  {
    $unwind: '$friendStories',
  },
  {
    $lookup: {
      from: 'users',
      localField: 'friendStories.createdBy',
      foreignField: '_id',
      as: 'friendDetails',
    },
  },
  {
    $sort: { 'friendStories.createdAt': -1 },
  },
  {
    $group: {
      _id: '$friendStories.createdBy',
      lastStory: { $first: '$friendStories' },
      userInfo: { $first:  '$friendDetails'},
    },
  },
  {
  $project: {
    id:"$friends.user",
    name: { $arrayElemAt: ['$userInfo.name', 0] },
    avatar: { $arrayElemAt: ['$userInfo.avatar', 0] },
    createdAt: "$lastStory.createdAt"
  }
  },
  ]);

  res.json({
    message: "success",
    stories: lastStories
  })
}
