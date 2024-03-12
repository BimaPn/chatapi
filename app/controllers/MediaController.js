import Message from "../models/Message.js";

const MEDIA_PREVIEW_LIMIT = 4;

export const mediaPreview = async (req, res) => {
  const target = req.params.id;
  const auth = req.user.id;

  const media = await Message.find({
    $or: [
        { sender: auth, receiver: target },
        { sender: target, receiver: auth }
    ],
    media: { $ne: [] }
  },"media").sort({createdAt: -1}).limit(MEDIA_PREVIEW_LIMIT);

  const isMore = media.length >= MEDIA_PREVIEW_LIMIT;
  
  res.json({
    media,
    isMore
  });
}
