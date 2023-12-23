import express from 'express'
import { updateUser, friendRequest } from '../../controllers/userController.js'
import { initMulter } from '../../utils/storage.js';

export const router = express.Router();
const upload = initMulter("media/user/").single("avatar");

router.route("/profile/update")
.put(function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      console.log("error bro")
      console.log(err)
      return res.status(400).json({errors:err})
    }
    next();
  });
}, updateUser);

router.route("/:username/friend-request")
.post(friendRequest);



