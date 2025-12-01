import express from "express";
import {
  getSemesterProgress,
  getSubjectProgress,
  getSubjectProgressById,
  markNoteRead,
  markLectureWatched,
  initSemesterProgress,
} from "../controllers/progress.controller.js";

const progressRoutes = express.Router();

// Initialize semester progress
progressRoutes.post("/initSemester", initSemesterProgress);

// Get progress data
progressRoutes.get("/getSemesterProgress", getSemesterProgress);
progressRoutes.get("/getSubjectProgress", getSubjectProgress);
progressRoutes.get("/getSubjectProgressById/:subjectId", getSubjectProgressById);

// Mark items as completed
progressRoutes.post("/markNoteRead", markNoteRead);
progressRoutes.post("/markLectureWatched", markLectureWatched);

export default progressRoutes;