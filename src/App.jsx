import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import the background component first
import ParticleBackground from "./components/ParticleBackground";
import PageWithNavbar from "./components/PageWithNavbar";

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
        It uses fixed positioning and a z-index of -1 to render itself
        behind all other content, creating a seamless background across all routes.
      */}
      <ParticleBackground />

      <div className="relative z-10 min-h-screen">
        {/*
          This wrapper div with a relative z-index ensures that all page
          content rendered by the Routes will appear on top of the background.
        */}
        <Routes>
          {/* Public routes (no navbar) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* All other routes with navbar */}
          <Route path="/dashboard" element={<PageWithNavbar><Dashboard /></PageWithNavbar>} />
          <Route path="/menu" element={<PageWithNavbar><Menu /></PageWithNavbar>} />
          <Route path="/code-editor" element={<PageWithNavbar><CodeEditor /></PageWithNavbar>} />
          <Route path="/editor/:problemId" element={<PageWithNavbar><CodeEditor /></PageWithNavbar>} />
          <Route path="/hackathon" element={<PageWithNavbar><Hackathon /></PageWithNavbar>} />
          <Route path="/ai-explainer" element={<PageWithNavbar><AIConceptExplainer /></PageWithNavbar>} />
          <Route path="/leaderboard" element={<PageWithNavbar><Leaderboard /></PageWithNavbar>} />
          <Route path="/ai-resume" element={<PageWithNavbar><AIResumeConsolidator /></PageWithNavbar>} />
          {/* Admin route */}
          <Route path="/admin/dashboard" element={<AdminRoute><PageWithNavbar><AdminDashboard /></PageWithNavbar></AdminRoute>} />
        </Routes>
      </div>
    </Router>
  );
}