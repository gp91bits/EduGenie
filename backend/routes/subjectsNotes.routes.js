import express from "express";
import {
  getSubjectContent,
  addNote,
  addVideo,
  addQuiz,
  updateNote,
  updateVideo,
  deleteNote,
  deleteVideo,
  deleteQuiz,
  getAllNotes,
  toggleNoteVisibility,
  toggleVideoVisibility,
} from "../controllers/subjectNotes.controller.js";
import isAdmin from "../middleware/admin.js";

const subjectNotesRoutes = express.Router();

// ============================================
// PUBLIC ROUTES (Students can access)
// ============================================

subjectNotesRoutes.get("/getContent", getSubjectContent);

// ============================================
// ADMIN ONLY ROUTES (Protected)
// ============================================

// Get all notes across semesters
subjectNotesRoutes.get("/getAllNotes", isAdmin, getAllNotes);

// Add resources
subjectNotesRoutes.post("/addNote", isAdmin, addNote);
subjectNotesRoutes.post("/addVideo", isAdmin, addVideo);
subjectNotesRoutes.post("/addQuiz", isAdmin, addQuiz);

// Update resources
subjectNotesRoutes.put("/updateNote", isAdmin, updateNote);
subjectNotesRoutes.put("/updateVideo", isAdmin, updateVideo);

// Toggle visibility
subjectNotesRoutes.put("/toggleNoteVisibility", isAdmin, toggleNoteVisibility);
subjectNotesRoutes.put("/toggleVideoVisibility", isAdmin, toggleVideoVisibility);

// Delete resources
subjectNotesRoutes.delete("/deleteNote", isAdmin, deleteNote);
subjectNotesRoutes.delete("/deleteVideo", isAdmin, deleteVideo);
subjectNotesRoutes.delete("/deleteQuiz", isAdmin, deleteQuiz);

export default subjectNotesRoutes;