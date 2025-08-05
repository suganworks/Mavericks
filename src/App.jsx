import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import the new background component first
import ParticleBackground from "./components/ParticleBackground";

// Import all page components from your 'src/pages' directory
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

// Import the Admin Dashboard and the security component that protects it
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <Router>
      {/*
        The ParticleBackground component is placed here, at the top level.
        It uses absolute positioning and a z-index of -1 to render itself
        behind all other content, creating a seamless background across all routes.
      */}
      <ParticleBackground />

      <div className="relative z-10">
        {/*
          This wrapper div with a relative z-index ensures that all page
          content rendered by the Routes will appear on top of the background.
        */}
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- Standard User Routes --- */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/code-editor" element={<CodeEditor />} />
          <Route path="/hackathon" element={<Hackathon />} />
          <Route path="/ai-explainer" element={<AIConceptExplainer />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/ai-resume" element={<AIResumeConsolidator />} />

          {/* --- Protected Admin Route --- */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}