import Story from "../models/Story.js";
import client from "../lib/redis/redisConnect.js";
import User from "../models/User.js";
import { dateToTime } from "../utils/converter.js";

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

  res.json({ message:"success" })
}

export const deleteStory =  async (req, res) => {
  const id = req.params.id;
  const auth = req.user.id;

  const story = await Story.deleteOne({ _id:id, createdBy: auth }); 

  if(story.deletedCount !== 1) {
    return res.status(400).json({
      error: "Document not found or not deleted"
    });
  }
  res.json({
    message: "success"
  });
}

export const seenStory = async (req, res) => {
  const id = req.params.id;
  const auth = req.user.id;

  const result = await Story.updateOne(
    { _id: id, "hasSeen": { $ne: auth } },
    { $addToSet: { hasSeen: auth } }
  );
  if(result.modifiedCount <= 0) {
    return res.status(400).json({
      error: "failed to update"
    });
  }
 res.json({
   message: "success"
 });
}

export const getUserStories = async (req, res) => {
  const userId = req.params.id;
  const auth = req.user.id;

  const stories = await Story.aggregate([
    {
      $match: { createdBy: userId }
    },
    {
      $group: {
        _id:null,
        hasSeen: {$push: {
          $in: [auth, "$hasSeen"]
        }},
        contents: {
          $push: {
            id: "$_id",
            media: "$media",
            createdAt: "$createdAt",
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        seenStories : {
          $cond: {
            if: { $ne: [userId, auth] },
            then: "$hasSeen",
            else: null
          }
        },
        position: {
          $indexOfArray: ["$hasSeen", false]
        },
        contents: 1
      }
    }
  ]);

  res.json({
    user: auth,
    stories:stories[0]
  });
}

export const getFriendsLastStory = async (req, res) => {
  const auth = req.user.id;

  const userStory = await Story.findOne({ createdBy:auth },null,{sort:{ "createdAt":-1 }})
  .select({ createdAt: 1 })
  .exec();

  const lastStories = await User.aggregate([
  { $match: { _id: auth } },
  {
    $match: { 'friends.status': 3 },
  },
  {
    $unwind: '$friends',
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
    $lookup: {
      from: 'users',
      localField: 'friends.user',
      foreignField: '_id',
      as: 'friendDetail',
    },
  },
  {
    $unwind: '$friendStories',
  },
  {
    $sort: { 'friendStories.createdAt': -1 },
  },
  {
    $group: {
      _id: '$friends.user',
      friendDetail: {$first: { $arrayElemAt: ['$friendDetail', 0] }},
      lastStory: { $first: '$friendStories' },
      hasSeen: {
        $min: { $in: [auth, '$friendStories.hasSeen'] },
      },
    },
  },
  {
    $project: {
      _id: "$_id",
      avatar: "$friendDetail.avatar",
      name: "$friendDetail.name",
      createdAt: "$lastStory.createdAt",
      hasSeen: "$hasSeen"
    }
  }
  ]);

  res.json({
    userStory: userStory ? dateToTime(userStory.createdAt) : null,
    stories: lastStories
  })
}
