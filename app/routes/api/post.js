import express from "express"
import { getPosts,createPost, updatePost, getPost, deletePost } from "../../controllers/postController.js"
export const router = express.Router();

router.route("/")
.get(getPosts)
.post(createPost);

router.route("/:id")
.put(updatePost)
.get(getPost)
.delete(deletePost)
