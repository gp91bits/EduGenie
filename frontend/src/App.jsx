import { Routes, Route } from "react-router-dom";
import {
  logIn,
  signUp,
  verify,
  index,
  forgotPass,
  events,
} from "./Routes/Routes";

import { Home, Auth,Events } from "./pages/index.pages";


function App() {
  return (
    <>
      <Routes>
        <Route path={index} element={<Home />} />
        <Route path={logIn} element={<Auth />} />
        <Route path={verify} element={<Auth />} />
        <Route path={forgotPass} element={<Auth />} />
        <Route path={signUp} element={<Auth />} />
        <Route path={events} element={<Events />} />
      </Routes>
    </>
  );
}

export default App;
