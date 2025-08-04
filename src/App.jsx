import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import CodeEditor from "./pages/code-editor";
import Hackathon from "./pages/Hackathon";
import AIConceptExplainer from "./pages/AIConceptExplainer";
import Leaderboard from "./pages/Leaderboard";
import AIResumeConsolidator from "./pages/AIResumeConsolidator";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/code-editor" element={<CodeEditor />} />
        <Route path="/hackathon" element={<Hackathon />} />
        <Route path="/ai-explainer" element={<AIConceptExplainer />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/ai-resume" element={<AIResumeConsolidator />} />
      </Routes>
    </Router>
  );
}
