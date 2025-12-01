import Progress from "../models/Progress.js";
// ----  set all subjects in progress ----
export const initSemesterProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { semesterId, subjects } = req.body;

    if (!semesterId || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const semId = parseInt(semesterId, 10);
    const newSubjectIds = subjects.map((s) => s.id);

    const existingProgress = await Progress.find({
      studentId: userId,
      semesterId: semId,
    });

    const existingIds = existingProgress.map((p) => p.subjectId);

    const toAdd = newSubjectIds.filter((id) => !existingIds.includes(id));

    const toRemove = existingIds.filter((id) => !newSubjectIds.includes(id));

    if (toAdd.length > 0) {
      const bulkAdd = toAdd.map((subjectId) => ({
        updateOne: {
          filter: { studentId: userId, semesterId: semId, subjectId },
          update: {
            $setOnInsert: {
              studentId: userId,
              semesterId: semId,
              subjectId,
              notesCompleted: [],
              videosCompleted: [],
              notesRead: 0,
              lecturesWatched: 0,
              completion: 0,
            },
          },
          upsert: true,
        },
      }));
      await Progress.bulkWrite(bulkAdd);
    }

    if (toRemove.length > 0) {
      await Progress.deleteMany({
        studentId: userId,
        semesterId: semId,
        subjectId: { $in: toRemove },
      });
    }

    const updated = await Progress.find({
      studentId: userId,
      semesterId: semId,
    }).sort({ subjectId: 1 });

    return res.status(200).json({
      message: "Semester progress synced successfully",
      added: toAdd,
      removed: toRemove,
      progress: updated,
    });
  } catch (error) {
    console.error("syncSemesterProgress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----  compute completion for a subject ----
const computeCompletion = ({
  totalNotes = 0,
  totalLectures = 0,
  notesCompletedCount = 0,
  videosCompletedCount = 0,
}) => {
  const totalItems = totalNotes + totalLectures;
  if (totalItems === 0) return undefined;

  const completed = notesCompletedCount + videosCompletedCount;
  const raw = (completed / totalItems) * 100;

  return Math.max(0, Math.min(100, Math.round(raw)));
};

// ---- overall semester progress ----
export const getSemesterProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { semester } = req.query;
    if (!semester) {
      return res.status(400).json({ message: "Semester parameter required" });
    }

    const semesterId = parseInt(semester, 10);

    const progressRecords = await Progress.find({
      studentId: userId,
      semesterId,
    });

    if (progressRecords.length === 0) {
      return res.status(200).json({
        completion: 0,
        semesterId,
        studentId: userId,
      });
    }

    const completions = progressRecords.map((r) =>
      typeof r.completion === "number" ? r.completion : 0
    );
    const avg = completions.reduce((sum, v) => sum + v, 0) / completions.length;

    return res.status(200).json({
      completion: Math.round(avg),
      semesterId,
      studentId: userId,
      subjectCount: progressRecords.length,
    });
  } catch (error) {
    console.error("getSemesterProgress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----  subject progress for a semester ----
export const getSubjectProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { semesterId } = req.query;
    if (!semesterId) {
      return res
        .status(400)
        .json({ message: "Semester ID parameter required" });
    }

    const semesterIdNum = parseInt(semesterId, 10);

    const progressRecords = await Progress.find({
      studentId: userId,
      semesterId: semesterIdNum,
    }).sort({ subjectId: 1 });

    return res.status(200).json(progressRecords);
  } catch (error) {
    console.error("getSubjectProgress error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----  specific subject progress ----
export const getSubjectProgressById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subjectId } = req.params;

    const progress = await Progress.findOne({
      studentId: userId,
      subjectId: parseInt(subjectId, 10),
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    return res.status(200).json(progress);
  } catch (error) {
    console.error("getSubjectProgressById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---- mark a note as read  ----
export const markNoteRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subjectId, semesterId, noteId, totalNotes, totalLectures } =
      req.body;

    if (!subjectId || !semesterId || !noteId) {
      return res.status(400).json({
        message: "subjectId, semesterId and noteId are required",
      });
    }

    const subjectIdNum = parseInt(subjectId, 10);
    const semesterIdNum = parseInt(semesterId, 10);

    let progress = await Progress.findOne({
      studentId: userId,
      subjectId: subjectIdNum,
      semesterId: semesterIdNum,
    });

    // If no doc exists yet, create one with this note marked
    if (!progress) {
      const notesCompleted = [noteId];
      const videosCompleted = [];

      const completion = computeCompletion({
        totalNotes,
        totalLectures,
        notesCompletedCount: notesCompleted.length,
        videosCompletedCount: videosCompleted.length,
      });

      progress = await Progress.create({
        studentId: userId,
        subjectId: subjectIdNum,
        semesterId: semesterIdNum,
        notesRead: 1,
        lecturesWatched: 0,
        notesCompleted,
        videosCompleted,
        completion: typeof completion === "number" ? completion : 0,
        lastUpdated: new Date(),
      });

      return res.status(200).json({ message: "Note marked as read", progress });
    }

    // If already marked, do nothing (idempotent)
    if (
      Array.isArray(progress.notesCompleted) &&
      progress.notesCompleted.includes(noteId)
    ) {
      return res
        .status(200)
        .json({ message: "Note already marked as read", progress });
    }

    // Mark as read
    progress.notesCompleted.push(noteId);
    progress.notesRead = (progress.notesRead || 0) + 1;

    const completion = computeCompletion({
      totalNotes,
      totalLectures,
      notesCompletedCount: progress.notesCompleted.length,
      videosCompletedCount: progress.videosCompleted?.length || 0,
    });

    if (typeof completion === "number") {
      progress.completion = completion;
    }

    progress.lastUpdated = new Date();
    await progress.save();

    return res.status(200).json({ message: "Note marked as read", progress });
  } catch (error) {
    console.error("markNoteRead error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----  mark a lecture video as watched ----
export const markLectureWatched = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subjectId, semesterId, videoId, totalNotes, totalLectures } =
      req.body;

    if (!subjectId || !semesterId || !videoId) {
      return res.status(400).json({
        message: "subjectId, semesterId and videoId are required",
      });
    }

    const subjectIdNum = parseInt(subjectId, 10);
    const semesterIdNum = parseInt(semesterId, 10);

    let progress = await Progress.findOne({
      studentId: userId,
      subjectId: subjectIdNum,
      semesterId: semesterIdNum,
    });

    // Create if not exists
    if (!progress) {
      const videosCompleted = [videoId];
      const notesCompleted = [];

      const completion = computeCompletion({
        totalNotes,
        totalLectures,
        notesCompletedCount: notesCompleted.length,
        videosCompletedCount: videosCompleted.length,
      });

      progress = await Progress.create({
        studentId: userId,
        subjectId: subjectIdNum,
        semesterId: semesterIdNum,
        lecturesWatched: 1,
        notesRead: 0,
        notesCompleted,
        videosCompleted,
        completion: typeof completion === "number" ? completion : 0,
        lastUpdated: new Date(),
      });

      return res
        .status(200)
        .json({ message: "Lecture marked as watched", progress });
    }

    // If already marked, do nothing
    if (
      Array.isArray(progress.videosCompleted) &&
      progress.videosCompleted.includes(videoId)
    ) {
      return res
        .status(200)
        .json({ message: "Lecture already marked as watched", progress });
    }

    // Mark as watched
    progress.videosCompleted.push(videoId);
    progress.lecturesWatched = (progress.lecturesWatched || 0) + 1;

    const completion = computeCompletion({
      totalNotes,
      totalLectures,
      notesCompletedCount: progress.notesCompleted?.length || 0,
      videosCompletedCount: progress.videosCompleted.length,
    });

    if (typeof completion === "number") {
      progress.completion = completion;
    }

    progress.lastUpdated = new Date();
    await progress.save();

    return res
      .status(200)
      .json({ message: "Lecture marked as watched", progress });
  } catch (error) {
    console.error("markLectureWatched error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// ---- Recalculate progress for a subject when admin updates notes ----
export const recalcSubjectProgress = async (req, res) => {
  try {
    
    const { subjectId, semesterId, totalNotes, totalLectures } = req.body;

    if (!subjectId || !semesterId) {
      return res.status(400).json({ message: "subjectId and semesterId required" });
    }

    const subjectIdNum = parseInt(subjectId, 10);
    const semesterIdNum = parseInt(semesterId, 10);

    // Fetch all students who have a progress doc for this subject
    const records = await Progress.find({
      subjectId: subjectIdNum,
      semesterId: semesterIdNum,
    });

    const bulkOps = [];

    for (const rec of records) {
      const completion = computeCompletion({
        totalNotes,
        totalLectures,
        notesCompletedCount: rec.notesCompleted?.length || 0,
        videosCompletedCount: rec.videosCompleted?.length || 0,
      });

      bulkOps.push({
        updateOne: {
          filter: { _id: rec._id },
          update: {
            $set: {
              completion: completion ?? 0,
              notesRead: rec.notesCompleted.length,
              lecturesWatched: rec.videosCompleted.length,
              lastUpdated: new Date(),
            },
          },
        },
      });
    }

    if (bulkOps.length > 0) await Progress.bulkWrite(bulkOps);

    return res.status(200).json({ message: "Progress recalculated" });
  } catch (err) {
    console.error("recalcSubjectProgress error:", err);
    return res.status(500).json({ message: "Internal error" });
  }
};
