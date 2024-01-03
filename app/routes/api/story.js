import express from 'express';
import { addStory, deleteStory, getFriendsLastStory } from '../../controllers/storyController.js';
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

router.route("/:id/delete")
.delete(deleteStory);

