import Story from "../models/Story.js";
import client from "../lib/redis/redisConnect.js";

export const addStory = async (req, res)=> {
  const caption = req.body.caption;
  const media = req.file;
  if(!caption && !media) {
    return res.status(400).json({message:"Caption or media is required."})
  }

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
