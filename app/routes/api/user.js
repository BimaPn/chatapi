import express from 'express'
import { updateUser } from '../../controllers/userController.js'
import { initMulter } from '../../utils/storage.js';

const upload = initMulter("images/users/");
export const router = express.Router();
// router.route("/:username")
// .post(getUser)




router.route("/:username/update")
.put(upload.single("avatar"), updateUser);

// router.route("/:username/delete")
// .delete(deleteUser);


