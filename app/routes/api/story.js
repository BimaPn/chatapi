import express from 'express';
import { addStory, deleteStory, getFriendsLastStory, getUserStories, seenStory } from '../../controllers/storyController.js';
import { initMulter } from '../../utils/storage.js';

export const router = express.Router();
const upload = initMulter("media/story", (1024*1024)*30)
.single("media");

router.route("/add")
.post(function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({errors:err})
    }
    next();
  });
}, addStory);

router.route("/friends-last-story/get")
.get(getFriendsLastStory);

router.route("/user-stories/:id/get")
.get(getUserStories);

router.route("/:id/seen")
.post(seenStory);

router.route("/:id/delete")
.delete(deleteStory);

