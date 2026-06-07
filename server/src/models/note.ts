import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  encryptedTitle: string;
  encryptedContent: string;
  iv: string;
  ivContent: string;
  salt: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    encryptedTitle: { type: String, required: true },
    encryptedContent: { type: String, required: true },
    iv: { type: String, required: true },
    ivContent: { type: String, required: true },
    salt: { type: String, required: true },
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>("Note", noteSchema);
