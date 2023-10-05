import express from 'express';
import { getUsers,createUser,getUser,updateUser,deleteUser } from '../../controllers/userController.js';
export const router = express.Router();

router.route('/')
.get(getUsers)
.post(createUser)
router.route('/:id')
.put(updateUser)
.post(getUser)
.delete(deleteUser)
