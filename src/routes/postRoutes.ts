import { Router } from "express";
import {
  getCategories,
  getTags,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} from "../controllers/postController";

const router = Router();

router.get("/categories", getCategories);
router.get("/tags", getTags);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", createPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;
