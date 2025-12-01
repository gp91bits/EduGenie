import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/Users.js";
import { transporter, createMailOptions } from "../conf/mail.conf.js";
import Bytez from "bytez.js";

// Initialize Bytez
const bytez = new Bytez(process.env.BYTEZ_API_KEY);

// Generate quiz questions using Bytez AI
const generateQuizQuestions = async (topic, numberOfQuestions) => {
  try {
    const model = bytez.model('Qwen/Qwen3-4B');

    const prompt = `Generate exactly ${numberOfQuestions} unique and diverse multiple choice quiz questions about "${topic}".

IMPORTANT: 
- Make each question DIFFERENT and cover various aspects of the topic
- Include a mix of conceptual, practical, and application-based questions
- Vary the difficulty level (some easy, some medium, some challenging)
- Make questions specific and educational

Return ONLY a valid JSON array with no additional text. Each question object must have this exact structure:
[
  {
    "questionText": "The question text here",
    "options": [
      { "text": "Option A text", "isCorrect": false },
      { "text": "Option B text", "isCorrect": false },
      { "text": "Option C text", "isCorrect": true },
      { "text": "Option D text", "isCorrect": false }
    ],
    "correctAnswer": "The text of the correct option",
    "explanation": "A brief explanation of why this answer is correct"
  }
]

Requirements:
- Each question must have exactly 4 options
- Only ONE option should have isCorrect: true
- The correctAnswer field must match the text of the correct option exactly
- Questions should be educational, accurate, and varied
- Do NOT repeat similar questions
- Cover different subtopics within "${topic}"

Return ONLY the JSON array, no markdown code blocks or other text.`;

    const input = [
      {
        role: "system",
        content: "You are an expert quiz generator. Generate diverse, educational multiple choice questions. Always return valid JSON only, no markdown or extra text."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const result = await model.run(input);
    
    if (result.error) {
      throw new Error(result.error);
    }

    // Handle different output formats from Bytez
    let text;
    if (typeof result.output === 'string') {
      text = result.output;
    } else if (result.output && typeof result.output === 'object') {
      // If output is an object with content or text field
      text = result.output.content || result.output.text || JSON.stringify(result.output);
    } else if (Array.isArray(result.output)) {
      // If the output is already an array (direct JSON response)
      text = JSON.stringify(result.output);
    } else {
      text = String(result.output || '');
    }
    
    // console.log('Bytez raw output:', text);
    
    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // Remove any thinking tags if present
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    
    // Try to find JSON array in the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    // Parse the JSON response
    const questions = JSON.parse(text);
    
    // Validate and ensure proper structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid response format from AI");
    }
    
    // Validate each question has required fields
    const validatedQuestions = questions.map((q, index) => {
      if (!q.questionText || !q.options || !q.correctAnswer || !q.explanation) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }
      
      // Ensure exactly one correct answer
      const correctOptions = q.options.filter(opt => opt.isCorrect);
      if (correctOptions.length !== 1) {
        // Fix by matching correctAnswer text
        q.options = q.options.map(opt => ({
          ...opt,
          isCorrect: opt.text === q.correctAnswer
        }));
      }
      
      return {
        questionText: q.questionText,
        options: q.options.slice(0, 4), // Ensure max 4 options
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      };
    });
    
    return validatedQuestions.slice(0, numberOfQuestions);
    
  } catch (error) {
    console.error("Bytez AI error:", error);
    
    // Generate varied fallback questions when AI fails
    const questionTemplates = [
      {
        questionText: `What is the primary purpose of ${topic}?`,
        options: [
          { text: "To solve complex problems efficiently", isCorrect: true },
          { text: "To make things more complicated", isCorrect: false },
          { text: "It has no practical purpose", isCorrect: false },
          { text: "To replace human thinking entirely", isCorrect: false }
        ],
        correctAnswer: "To solve complex problems efficiently",
        explanation: `${topic} is designed to help solve problems efficiently and effectively.`
      },
      {
        questionText: `Which of the following best describes a key concept in ${topic}?`,
        options: [
          { text: "Random unrelated information", isCorrect: false },
          { text: "A systematic approach to understanding", isCorrect: true },
          { text: "Guesswork without foundation", isCorrect: false },
          { text: "Outdated methodology", isCorrect: false }
        ],
        correctAnswer: "A systematic approach to understanding",
        explanation: `${topic} involves systematic approaches to understand and solve problems.`
      },
      {
        questionText: `What skill is most important when studying ${topic}?`,
        options: [
          { text: "Memorization only", isCorrect: false },
          { text: "Critical thinking and analysis", isCorrect: true },
          { text: "Speed reading", isCorrect: false },
          { text: "Avoiding practice", isCorrect: false }
        ],
        correctAnswer: "Critical thinking and analysis",
        explanation: `Critical thinking is essential for mastering ${topic}.`
      },
      {
        questionText: `How is ${topic} typically applied in real-world scenarios?`,
        options: [
          { text: "It's only theoretical", isCorrect: false },
          { text: "Through practical problem-solving", isCorrect: true },
          { text: "By avoiding challenges", isCorrect: false },
          { text: "Without any structure", isCorrect: false }
        ],
        correctAnswer: "Through practical problem-solving",
        explanation: `${topic} has many practical applications in real-world problem-solving.`
      },
      {
        questionText: `What is a common misconception about ${topic}?`,
        options: [
          { text: "It requires understanding", isCorrect: false },
          { text: "It's too difficult to learn", isCorrect: true },
          { text: "It has real applications", isCorrect: false },
          { text: "Practice helps improve", isCorrect: false }
        ],
        correctAnswer: "It's too difficult to learn",
        explanation: `While ${topic} may seem challenging, with proper study it becomes manageable.`
      },
      {
        questionText: `Which approach is recommended for learning ${topic}?`,
        options: [
          { text: "Consistent practice and application", isCorrect: true },
          { text: "Cramming before exams only", isCorrect: false },
          { text: "Avoiding difficult concepts", isCorrect: false },
          { text: "Relying solely on others", isCorrect: false }
        ],
        correctAnswer: "Consistent practice and application",
        explanation: `Regular practice is the best way to master ${topic}.`
      },
      {
        questionText: `What makes ${topic} valuable in today's world?`,
        options: [
          { text: "It's completely outdated", isCorrect: false },
          { text: "It has no practical use", isCorrect: false },
          { text: "Its broad applicability across fields", isCorrect: true },
          { text: "It's only for experts", isCorrect: false }
        ],
        correctAnswer: "Its broad applicability across fields",
        explanation: `${topic} is valuable due to its wide range of applications.`
      },
      {
        questionText: `What foundation is important before studying advanced ${topic}?`,
        options: [
          { text: "No foundation needed", isCorrect: false },
          { text: "Understanding basic principles first", isCorrect: true },
          { text: "Jumping to complex topics immediately", isCorrect: false },
          { text: "Ignoring fundamentals", isCorrect: false }
        ],
        correctAnswer: "Understanding basic principles first",
        explanation: `A strong foundation in basics is crucial for advanced ${topic}.`
      },
      {
        questionText: `How do experts typically approach problems in ${topic}?`,
        options: [
          { text: "By breaking them into smaller parts", isCorrect: true },
          { text: "By guessing randomly", isCorrect: false },
          { text: "By avoiding analysis", isCorrect: false },
          { text: "By ignoring details", isCorrect: false }
        ],
        correctAnswer: "By breaking them into smaller parts",
        explanation: `Breaking problems down is a key strategy in ${topic}.`
      },
      {
        questionText: `What role does practice play in mastering ${topic}?`,
        options: [
          { text: "Practice is unnecessary", isCorrect: false },
          { text: "Only theory matters", isCorrect: false },
          { text: "Practice is essential for skill development", isCorrect: true },
          { text: "Practice slows learning", isCorrect: false }
        ],
        correctAnswer: "Practice is essential for skill development",
        explanation: `Regular practice is key to becoming proficient in ${topic}.`
      }
    ];
    
    const fallbackQuestions = [];
    for (let i = 0; i < numberOfQuestions; i++) {
      const template = questionTemplates[i % questionTemplates.length];
      fallbackQuestions.push({
        ...template,
        questionText: `Q${i + 1}: ${template.questionText}`
      });
    }
    return fallbackQuestions;
  }
};

// Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const { topic, numberOfQuestions, timeLimit } = req.body;
    const userId = req.user.id;

    // Validation
    if (!topic || !numberOfQuestions || !timeLimit) {
      return res.status(400).json({
        success: false,
        message: "Topic, number of questions, and time limit are required"
      });
    }

    if (numberOfQuestions < 1 || numberOfQuestions > 50) {
      return res.status(400).json({
        success: false,
        message: "Number of questions must be between 1 and 50"
      });
    }

    if (timeLimit < 1 || timeLimit > 180) {
      return res.status(400).json({
        success: false,
        message: "Time limit must be between 1 and 180 minutes"
      });
    }

    // Generate questions using Google Gemini AI
    const questions = await generateQuizQuestions(topic, numberOfQuestions);

    // Create quiz
    const quiz = new Quiz({
      user: userId,
      topic,
      numberOfQuestions,
      timeLimit,
      questions
    });

    await quiz.save();

    // Create quiz attempt
    const quizAttempt = new QuizAttempt({
      user: userId,
      quiz: quiz._id,
      topic,
      timeLimit,
      totalQuestions: numberOfQuestions
    });

    await quizAttempt.save();

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: {
        quizId: quiz._id,
        attemptId: quizAttempt._id,
        topic,
        numberOfQuestions,
        timeLimit,
        questions: quiz.questions.map(q => ({
          questionText: q.questionText,
          options: q.options.map(opt => ({ text: opt.text })) // Don't send correct answers
        }))
      }
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quiz",
      error: error.message
    });
  }
};

// Get active quiz attempt
const getActiveQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: 'in-progress'
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "No active quiz found"
      });
    }

    // Check if quiz expired
    if (attempt.isExpired) {
      await attempt.autoComplete();
      return res.status(410).json({
        success: false,
        message: "Quiz has expired"
      });
    }

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        topic: attempt.topic,
        timeLimit: attempt.timeLimit,
        remainingTime: attempt.getRemainingTime(),
        totalQuestions: attempt.totalQuestions,
        currentAnswers: attempt.answers,
        questions: attempt.quiz.questions.map(q => ({
          questionText: q.questionText,
          options: q.options.map(opt => ({ text: opt.text }))
        }))
      }
    });
  } catch (error) {
    console.error("Get active quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz",
      error: error.message
    });
  }
};

// Submit quiz answer
const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionIndex, selectedAnswer } = req.body;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: 'in-progress'
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    // Check if quiz expired
    if (attempt.isExpired) {
      await attempt.autoComplete();
      return res.status(410).json({
        success: false,
        message: "Quiz has expired"
      });
    }

    // Validate question index
    if (questionIndex < 0 || questionIndex >= attempt.quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index"
      });
    }

    const question = attempt.quiz.questions[questionIndex];
    const isCorrect = question.correctAnswer === selectedAnswer;

    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionIndex === questionIndex
    );

    if (existingAnswerIndex > -1) {
      attempt.answers[existingAnswerIndex] = {
        questionIndex,
        selectedAnswer,
        isCorrect
      };
    } else {
      attempt.answers.push({
        questionIndex,
        selectedAnswer,
        isCorrect
      });
    }

    await attempt.save();

    res.json({
      success: true,
      message: "Answer submitted successfully",
      data: {
        remainingTime: attempt.getRemainingTime()
      }
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit answer",
      error: error.message
    });
  }
};

// Submit quiz (complete the quiz)
const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Quiz already completed"
      });
    }

    // Calculate results
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = attempt.answers.length - correctAnswers;
    const score = Math.round((correctAnswers / attempt.totalQuestions) * 100);

    // Update attempt
    attempt.status = 'completed';
    attempt.endTime = new Date();
    attempt.correctAnswers = correctAnswers;
    attempt.incorrectAnswers = incorrectAnswers;
    attempt.score = score;
    attempt.isArchived = true;

    await attempt.save();

    res.json({
      success: true,
      message: "Quiz completed successfully",
      data: {
        attemptId: attempt._id,
        totalQuestions: attempt.totalQuestions,
        correctAnswers,
        incorrectAnswers,
        score,
        topic: attempt.topic
      }
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
      error: error.message
    });
  }
};

// Get quiz results
const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: { $in: ['completed', 'expired'] }
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz results not found"
      });
    }

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        topic: attempt.topic,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        score: attempt.score,
        status: attempt.status,
        completedAt: attempt.endTime,
        explanationEmailSent: attempt.explanationEmailSent
      }
    });
  } catch (error) {
    console.error("Get quiz results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get results",
      error: error.message
    });
  }
};

// Send explanation email
const sendExplanationEmail = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: { $in: ['completed', 'expired'] }
    }).populate('quiz user');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    if (attempt.explanationEmailSent) {
      return res.status(400).json({
        success: false,
        message: "Explanation email already sent"
      });
    }

    // Create email content
    let emailContent = `
      <h2>Quiz Results and Explanations</h2>
      <h3>Topic: ${attempt.topic}</h3>
      <p><strong>Score:</strong> ${attempt.correctAnswers}/${attempt.totalQuestions} (${attempt.score}%)</p>
      <p><strong>Correct Answers:</strong> ${attempt.correctAnswers}</p>
      <p><strong>Incorrect Answers:</strong> ${attempt.incorrectAnswers}</p>
      <hr>
      <h3>Detailed Explanations:</h3>
    `;

    attempt.quiz.questions.forEach((question, index) => {
      const userAnswer = attempt.answers.find(a => a.questionIndex === index);
      const studentAnswer = userAnswer ? userAnswer.selectedAnswer : "Not Answered";
      
      emailContent += `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd;">
          <h4>Question ${index + 1}</h4>
          <p><strong>Q:</strong> ${question.questionText}</p>
          <p><strong>Your Answer:</strong> ${studentAnswer}</p>
          <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>
          <p><strong>Status:</strong> ${userAnswer && userAnswer.isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
          <p><strong>Explanation:</strong> ${question.explanation}</p>
        </div>
      `;
    });

    // Send email using existing email configuration
    const mailOptions = createMailOptions(
      attempt.user.email,
      `Quiz Results: ${attempt.topic}`,
      emailContent
    );

    await transporter.sendMail(mailOptions);

    // Mark email as sent
    attempt.explanationEmailSent = true;
    await attempt.save();

    res.json({
      success: true,
      message: "Explanation email sent successfully"
    });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send explanation email",
      error: error.message
    });
  }
};

// Get user's quiz history (archived quizzes)
const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const attempts = await QuizAttempt.find({
      user: userId,
      isArchived: true
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('topic totalQuestions correctAnswers score status createdAt endTime');

    const total = await QuizAttempt.countDocuments({
      user: userId,
      isArchived: true
    });

    res.json({
      success: true,
      data: {
        attempts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error("Get quiz history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz history",
      error: error.message
    });
  }
};

// Delete a quiz attempt
const deleteQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    // Delete the associated quiz as well
    await Quiz.findByIdAndDelete(attempt.quiz);
    await QuizAttempt.findByIdAndDelete(attemptId);

    res.json({
      success: true,
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
      error: error.message
    });
  }
};

// Get user stats (quiz count, streak)
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const quizCount = await QuizAttempt.countDocuments({
      user: userId,
      isArchived: true
    });

    const user = await User.findById(userId).select('streak lastLoginDate');

    res.json({
      success: true,
      data: {
        quizCount,
        streak: user?.streak || 0,
        lastLoginDate: user?.lastLoginDate
      }
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user stats",
      error: error.message
    });
  }
};

export { createQuiz, getActiveQuiz, submitAnswer, submitQuiz, getQuizResults, sendExplanationEmail, getQuizHistory, deleteQuizAttempt, getUserStats };