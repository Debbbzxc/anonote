import { Router } from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { getNotes, createNote, updateNote, deleteNote } from "../controllers/note-controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
