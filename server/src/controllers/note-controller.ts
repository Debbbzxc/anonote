import { Request, Response } from "express";
import mongoose from "mongoose";
import { Note } from "../models/note.js";

export async function getNotes(req: Request, res: Response) {
  try {
    const notes = await Note.find({ userId: req.user!.userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Failed to fetch notes:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
}

export async function createNote(req: Request, res: Response) {
  const { encryptedTitle, encryptedContent, iv, salt } = req.body;
  if (!encryptedTitle || !encryptedContent || !iv || !salt) {
    res.status(400).json({ error: "Missing required encrypted fields" });
    return;
  }

  try {
    const note = await Note.create({
      userId: req.user!.userId,
      encryptedTitle,
      encryptedContent,
      iv,
      salt,
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Failed to create note:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
}

export async function updateNote(req: Request, res: Response) {
  const id = req.params.id as string;
  const { encryptedTitle, encryptedContent, iv, salt } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid note ID" });
    return;
  }

  try {
    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      { encryptedTitle, encryptedContent, iv, salt },
      { new: true }
    );

    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.json(note);
  } catch (err) {
    console.error("Failed to update note:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
}

export async function deleteNote(req: Request, res: Response) {
  const id = req.params.id as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "Invalid note ID" });
    return;
  }

  try {
    const note = await Note.findOneAndDelete({ _id: id, userId: req.user!.userId });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error("Failed to delete note:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
}
