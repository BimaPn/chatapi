import express from 'express'
import { updateUser } from '../../controllers/userController.js'
import { initMulter } from '../../utils/storage.js';

export const router = express.Router();
const upload = initMulter("images/users/").single("avatar");
// router.route("/:username")
// .post(getUser)




router.route("/:username/update")
.put(function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({errors:err})
    }
    next();
  });
}, updateUser);

// router.route("/:username/delete")
// .delete(deleteUser);


