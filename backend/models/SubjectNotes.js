import mongoose from "mongoose";

// Notes/Resources Schema
const subjectNotesSchema = new mongoose.Schema(
  {
    subjectId: {
      type: Number,
      required: true,
    },
    semesterId: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    notes: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
    
        fileUrl: {
          type: String, 
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    videos: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        youtubeUrl: {
          type: String,
          required: true,
        },
        duration: {
          type: String, 
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    quizzes: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quiz",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

subjectNotesSchema.index(
  { subjectId: 1, semesterId: 1 },
  { unique: true }
);

const SubjectNotes = mongoose.model("SubjectNotes", subjectNotesSchema);
export default SubjectNotes;