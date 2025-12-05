import SubjectNotes from "../models/SubjectNotes.js";
import Progress from "../models/Progress.js";
import mongoose from "mongoose";
import { createNotification } from "./helperFunctions.js";

// ============================================
// HELPER FUNCTIONS
// ============================================

const getContentCounts = async (subjectId, semesterId) => {
  const content = await SubjectNotes.findOne({
    subjectId: parseInt(subjectId),
    semesterId: parseInt(semesterId),
  });

  if (!content) {
    return { notes: 0, videos: 0 };
  }

  return {
    notes: content.notes?.length || 0,
    videos: content.videos?.length || 0,
  };
};

const computeCompletion = ({
  totalNotes = 0,
  totalLectures = 0,
  notesCompletedCount = 0,
  videosCompletedCount = 0,
}) => {
  const totalItems = totalNotes + totalLectures;
  if (totalItems === 0) return 0;

  const completed = notesCompletedCount + videosCompletedCount;
  const raw = (completed / totalItems) * 100;

  return Math.max(0, Math.min(100, Math.round(raw)));
};

const recalcProgressForSubject = async (subjectId, semesterId) => {
  try {
    const { notes: totalNotes, videos: totalLectures } = await getContentCounts(
      subjectId,
      semesterId
    );

    // Fetch all students with progress in this subject
    const records = await Progress.find({
      subjectId: parseInt(subjectId),
      semesterId: parseInt(semesterId),
    });

    if (records.length === 0) return;

    const bulkOps = records.map((rec) => {
      const completion = computeCompletion({
        totalNotes,
        totalLectures,
        notesCompletedCount: rec.notesCompleted?.length || 0,
        videosCompletedCount: rec.videosCompleted?.length || 0,
      });

      return {
        updateOne: {
          filter: { _id: rec._id },
          update: {
            $set: {
              completion,
              notesRead: rec.notesCompleted?.length || 0,
              lecturesWatched: rec.videosCompleted?.length || 0,
              lastUpdated: new Date(),
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Progress.bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error("recalcProgressForSubject error:", err);
  }
};

// ============================================
// GET CONTENT
// ============================================

export const getSubjectContent = async (req, res) => {
  try {
    const { subjectId, semesterId } = req.query;

    if (!subjectId || !semesterId) {
      return res
        .status(400)
        .json({ message: "Subject ID and Semester ID required" });
    }

    let content = await SubjectNotes.findOne({
      subjectId: parseInt(subjectId),
      semesterId: parseInt(semesterId),
    });

    // Return empty structure if not found
    if (!content) {
      content = {
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
        notes: [],
        videos: [],
        quizzes: [],
      };
    }

    return res.status(200).json(content);
  } catch (error) {
    console.error("getSubjectContent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// ADMIN ONLY OPERATIONS - NOTES
// ============================================

export const addNote = async (req, res) => {
  try {
    const { subjectId, semesterId, title, description, fileType, fileUrl } =
      req.body;

    if (!subjectId || !semesterId || !title || !fileUrl) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, title, and fileUrl required",
      });
    }

    let content = await SubjectNotes.findOne({
      subjectId: parseInt(subjectId),
      semesterId: parseInt(semesterId),
    });

    if (!content) {
      content = new SubjectNotes({
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
        notes: [],
        videos: [],
        quizzes: [],
      });
    }

    const newNote = {
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      description: description?.trim() || "",
      fileType: fileType || "pdf",
      fileUrl: fileUrl.trim(),
      uploadedAt: new Date(),
    };

    content.notes.push(newNote);
    await content.save();

    await recalcProgressForSubject(subjectId, semesterId);

    createNotification({
      category: "notes",
      title: `New Note Added: ${title}`,
      msg: `A new note has been uploaded in Semester ${semesterId}, Subject ${subjectId}.`,
      actionUrl: `/subjects/${subjectId}/notes`,
      metadata: {
        subjectId,
        semesterId,
        type: "note",
      },
    }).catch(console.error);

    return res.status(201).json({
      message: "Note added successfully",
      note: newNote,
    });
  } catch (error) {
    console.error("addNote error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { subjectId, semesterId, noteId, title, description, fileUrl } =
      req.body;

    if (!subjectId || !semesterId || !noteId) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, and Note ID required",
      });
    }

    const content = await SubjectNotes.findOneAndUpdate(
      {
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
        "notes._id": noteId,
      },
      {
        $set: {
          "notes.$[elem].title": title?.trim() || "",
          "notes.$[elem].description": description?.trim() || "",
          "notes.$[elem].fileUrl": fileUrl?.trim() || "",
        },
      },
      {
        arrayFilters: [{ "elem._id": noteId }],
        new: true,
      }
    );

    if (!content) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Recalculate progress for all students
    await recalcProgressForSubject(subjectId, semesterId);

    return res.status(200).json({
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("updateNote error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { subjectId, semesterId, noteId } = req.body;

    if (!subjectId || !semesterId || !noteId) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, and Note ID required",
      });
    }

    const content = await SubjectNotes.findOneAndUpdate(
      {
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
      },
      { $pull: { notes: { _id: noteId } } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: "Subject content not found" });
    }

    // Recalculate progress for all students
    await recalcProgressForSubject(subjectId, semesterId);

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("deleteNote error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// ADMIN ONLY OPERATIONS - VIDEOS
// ============================================

export const addVideo = async (req, res) => {
  try {
    const { subjectId, semesterId, title, description, youtubeUrl, duration } =
      req.body;

    if (!subjectId || !semesterId || !title || !youtubeUrl) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, title, and youtubeUrl required",
      });
    }

    let content = await SubjectNotes.findOne({
      subjectId: parseInt(subjectId),
      semesterId: parseInt(semesterId),
    });

    if (!content) {
      content = new SubjectNotes({
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
        notes: [],
        videos: [],
        quizzes: [],
      });
    }

    const newVideo = {
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      description: description?.trim() || "",
      youtubeUrl: youtubeUrl.trim(),
      duration: duration || "0:00",
      uploadedAt: new Date(),
    };

    content.videos.push(newVideo);
    await content.save();

    await recalcProgressForSubject(subjectId, semesterId);

    createNotification({
      category: "notes",
      title: `New Video Added: ${title}`,
      msg: `A new video has been uploaded in Semester ${semesterId}, Subject ${subjectId}.`,
      actionUrl: `/subjects/${subjectId}/videos`,
      metadata: {
        subjectId,
        semesterId,
        type: "video",
      },
    }).catch(console.error);

    return res.status(201).json({
      message: "Video added successfully",
      video: newVideo,
    });
  } catch (error) {
    console.error("addVideo error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const {
      subjectId,
      semesterId,
      videoId,
      title,
      description,
      youtubeUrl,
      duration,
    } = req.body;

    if (!subjectId || !semesterId || !videoId) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, and Video ID required",
      });
    }

    const content = await SubjectNotes.findOneAndUpdate(
      {
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
        "videos._id": videoId,
      },
      {
        $set: {
          "videos.$[elem].title": title?.trim() || "",
          "videos.$[elem].description": description?.trim() || "",
          "videos.$[elem].youtubeUrl": youtubeUrl?.trim() || "",
          "videos.$[elem].duration": duration || "0:00",
        },
      },
      {
        arrayFilters: [{ "elem._id": videoId }],
        new: true,
      }
    );

    if (!content) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Recalculate progress for all students
    await recalcProgressForSubject(subjectId, semesterId);

    return res.status(200).json({
      message: "Video updated successfully",
    });
  } catch (error) {
    console.error("updateVideo error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { subjectId, semesterId, videoId } = req.body;

    if (!subjectId || !semesterId || !videoId) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, and Video ID required",
      });
    }

    const content = await SubjectNotes.findOneAndUpdate(
      {
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
      },
      { $pull: { videos: { _id: videoId } } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: "Subject content not found" });
    }

    // Recalculate progress for all students
    await recalcProgressForSubject(subjectId, semesterId);

    return res.status(200).json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("deleteVideo error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// ADMIN ONLY OPERATIONS - QUIZZES
// ============================================

export const addQuiz = async (req, res) => {
  try {
    const { subjectId, semesterId, title, description, quizId } = req.body;

    if (!subjectId || !semesterId || !title) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, and title required",
      });
    }

    let content = await SubjectNotes.findOne({
      subjectId: parseInt(subjectId),
      semesterId: parseInt(semesterId),
    });

    if (!content) {
      content = new SubjectNotes({
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
        notes: [],
        videos: [],
        quizzes: [],
      });
    }

    const newQuiz = {
      _id: new mongoose.Types.ObjectId(),
      title: title.trim(),
      description: description?.trim() || "",
      quizId: quizId || null,
      uploadedAt: new Date(),
    };

    content.quizzes.push(newQuiz);
    await content.save();

    return res.status(201).json({
      message: "Quiz added successfully",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("addQuiz error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { subjectId, semesterId, quizId } = req.body;

    if (!subjectId || !semesterId || !quizId) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, and Quiz ID required",
      });
    }

    const content = await SubjectNotes.findOneAndUpdate(
      {
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
      },
      { $pull: { quizzes: { _id: quizId } } },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: "Subject content not found" });
    }

    return res.status(200).json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("deleteQuiz error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// ADMIN ONLY - GET ALL NOTES ACROSS SEMESTERS
// ============================================

export const getAllNotes = async (req, res) => {
  try {
    
    const allContent = await SubjectNotes.find({});
   

    // Organize by semester, then by subject
    const semesters = {};

    allContent.forEach((content) => {
      if (!semesters[content.semesterId]) {
        semesters[content.semesterId] = {
          semesterId: content.semesterId,
          subjects: [],
        };
      }

      semesters[content.semesterId].subjects.push({
        subjectId: content.subjectId,
        subjectName: `Subject ${content.subjectId}`,
        notes: content.notes || [],
        videos: content.videos || [],
      });
    });

    // Convert to array
    const result = Object.values(semesters).sort(
      (a, b) => a.semesterId - b.semesterId
    );

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("[getAllNotes] error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// ADMIN ONLY - TOGGLE NOTE VISIBILITY
// ============================================

export const toggleNoteVisibility = async (req, res) => {
  try {
    const { subjectId, semesterId, noteId } = req.body;

    if (!subjectId || !semesterId || !noteId) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, and Note ID required",
      });
    }

    // First, find the note to get current state
    const content = await SubjectNotes.findOne({
      subjectId: parseInt(subjectId),
      semesterId: parseInt(semesterId),
      "notes._id": noteId,
    });

    if (!content) {
      return res.status(404).json({ message: "Note not found" });
    }

    const note = content.notes.find((n) => n._id.toString() === noteId.toString());
    const newHiddenState = !note.isHidden;

    // Update the note
    const updatedContent = await SubjectNotes.findOneAndUpdate(
      {
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
        "notes._id": noteId,
      },
      {
        $set: {
          "notes.$[elem].isHidden": newHiddenState,
        },
      },
      {
        arrayFilters: [{ "elem._id": noteId }],
        new: true,
      }
    );

    return res.status(200).json({
      message: "Note visibility toggled successfully",
      isHidden: newHiddenState,
    });
  } catch (error) {
    console.error("toggleNoteVisibility error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ============================================
// ADMIN ONLY - TOGGLE VIDEO VISIBILITY
// ============================================

export const toggleVideoVisibility = async (req, res) => {
  try {
    const { subjectId, semesterId, videoId } = req.body;

    if (!subjectId || !semesterId || !videoId) {
      return res.status(400).json({
        message: "Subject ID, Semester ID, and Video ID required",
      });
    }

    // First, find the video to get current state
    const content = await SubjectNotes.findOne({
      subjectId: parseInt(subjectId),
      semesterId: parseInt(semesterId),
      "videos._id": videoId,
    });

    if (!content) {
      return res.status(404).json({ message: "Video not found" });
    }

    const video = content.videos.find((v) => v._id.toString() === videoId.toString());
    const newHiddenState = !video.isHidden;

    // Update the video
    const updatedContent = await SubjectNotes.findOneAndUpdate(
      {
        subjectId: parseInt(subjectId),
        semesterId: parseInt(semesterId),
        "videos._id": videoId,
      },
      {
        $set: {
          "videos.$[elem].isHidden": newHiddenState,
        },
      },
      {
        arrayFilters: [{ "elem._id": videoId }],
        new: true,
      }
    );

    return res.status(200).json({
      message: "Video visibility toggled successfully",
      isHidden: newHiddenState,
    });
  } catch (error) {
    console.error("toggleVideoVisibility error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
