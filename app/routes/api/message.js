import express from 'express';
import { getUserMessages } from '../../controllers/messageController.js';
export const router = express.Router();

router.route('/users/:id/messages')
.post(getUserMessages);
