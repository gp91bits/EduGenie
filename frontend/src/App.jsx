import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  logIn,
  signUp,
  verify,
  index,
  forgotPass,
  events,
  maps,
  news,
  notes,
  subjectNotes,
  quiz,
  quizCreate,
  quizTake,
  quizResults,
  quizHistory,
  profile,
  admin,
} from "./Routes/Routes";

import { Home, Auth, Events, Maps, News, Notes, SubjectNotes, Quiz, Admin } from "./pages/index.pages";
import Profile from "./pages/Profile";
import CreateQuiz from "./components/quiz/CreateQuiz";
import TakeQuiz from "./components/quiz/TakeQuiz";
import QuizResults from "./components/quiz/QuizResults";
import QuizHistory from "./components/quiz/QuizHistory";

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path={index} element={<Home />} />
        <Route path={logIn} element={<Auth />} />
        <Route path={verify} element={<Auth />} />
        <Route path={forgotPass} element={<Auth />} />
        <Route path={signUp} element={<Auth />} />
        <Route path={events} element={<Events />} />
        <Route path={maps} element={<Maps />} />
        <Route path={news} element={<News />} />
        <Route path={notes} element={<Notes />} />
        <Route path={subjectNotes} element={<SubjectNotes />} />
        <Route path={quiz} element={<Quiz />} />
        <Route path={quizCreate} element={<CreateQuiz />} />
        <Route path={quizTake} element={<TakeQuiz />} />
        <Route path={quizResults} element={<QuizResults />} />
        <Route path={quizHistory} element={<QuizHistory />} />
        <Route path={profile} element={<Profile />} />
        <Route path={admin} element={<Admin />} />
      </Routes>
    </>
  );
}

export default App;
