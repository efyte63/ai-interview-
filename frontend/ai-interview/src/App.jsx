import { BrowserRouter, Routes, Route } from "react-router-dom";

import Homepage from "./pages/Home/Homepage";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Interview from "./pages/Interview/Interview";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Homepage" element={<Homepage />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Interview" element={<Interview />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
