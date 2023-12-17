import express from 'express';
import { getUserMessages,getUsersList } from '../../controllers/messageController.js';
export const router = express.Router();

router.route("/users/:username/messages")
.post(getUserMessages);

router.route("/chat/list")
.post(getUsersList);
