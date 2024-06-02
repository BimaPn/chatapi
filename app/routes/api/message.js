import express from 'express';
import { createMessage, deleteMessage, getUserMessages,getUsersList } from '../../controllers/messageController.js';
import { initMulter } from '../../utils/storage.js';
import { mediaPreview } from '../../controllers/MediaController.js';

export const router = express.Router();
const upload = initMulter("media/message", (1024*1024)*50)
.fields([
  {name:"files[]",maxCount:50}
]);

router.route("/users/:username/messages")
.get(getUserMessages);

router.route("/chat/list")
.get(getUsersList);

router.route("/messages/:id/delete")
.delete(deleteMessage);

router.route("/messages/:id/create")
.post(function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({errors:err})
    }
    next();
  });
}, createMessage);

router.route("/messages/:id/media/preview")
.get(mediaPreview);
