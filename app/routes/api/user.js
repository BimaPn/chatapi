import express from 'express'
import { updateUser, friendRequest, checkFriend, deleteFriend, acceptFriendRequest, searchUsers } from '../../controllers/userController.js'
import { initMulter } from '../../utils/storage.js';

export const router = express.Router();
const upload = initMulter("media/user/").single("avatar");

router.route("/profile/update")
.put(function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({errors:err})
    }
    next();
  });
}, updateUser);

router.route(`/search`)
.get(searchUsers);

router.route("/:id/friend-request")
.get(checkFriend)
.post(friendRequest)
.put(acceptFriendRequest)
.delete(deleteFriend);



