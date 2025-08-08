import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import the background component first
import ParticleBackground from "./components/ParticleBackground";
import PageWithNavbar from "./components/PageWithNavbar";
import AdminPageWithNavbar from "./components/AdminPageWithNavbar";
import ErrorBoundary from "./components/ErrorBoundary";

// Import all page components from your 'src/pages' directory
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import Hackathon from "./pages/Hackathon";
import AIConceptExplainer from "./pages/AIConceptExplainer";
import Leaderboard from "./pages/Leaderboard";
import AIResumeConsolidator from "./pages/AIResumeConsolidator";
import Assessments from "./pages/assessments";
import AssessmentFlow from "./pages/assessment-flow";
import MCQAssessment from "./pages/mcq-assessment";
import CodeAssessment from "./pages/code-assessment";
import AssessmentResults from "./pages/assessment-results";
import HackathonDashboard from "./pages/HackathonDashboard";
import ChallengeWorkspace from "./pages/ChallengeWorkspace";
import HackathonLeaderboard from "./pages/HackathonLeaderboard";
import HackathonScoreReport from "./pages/HackathonScoreReport";
import HackathonAdminScores from "./pages/HackathonAdminScores";

// Import the Admin Dashboard and the security component that protects it
import AdminDashboard from "./pages/AdminDashboard";
import Admin from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  console.log('App.jsx: Component rendering...');
  
  return (
    <ErrorBoundary>
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
          <Route path="/code-editor" element={<PageWithNavbar><CodeAssessment /></PageWithNavbar>} />
          <Route path="/editor/:problemId" element={<PageWithNavbar><CodeAssessment /></PageWithNavbar>} />
          <Route path="/hackathon" element={<PageWithNavbar><Hackathon /></PageWithNavbar>} />
          <Route path="/hackathons/:id/dashboard" element={<PageWithNavbar><HackathonDashboard /></PageWithNavbar>} />
          <Route path="/challenges/:challengeId/workspace" element={<PageWithNavbar><ChallengeWorkspace /></PageWithNavbar>} />
          <Route path="/hackathons/:hackathonId/leaderboard" element={<PageWithNavbar><HackathonLeaderboard /></PageWithNavbar>} />
          <Route path="/hackathons/:hackathonId/score-report" element={<PageWithNavbar><HackathonScoreReport /></PageWithNavbar>} />
          <Route path="/hackathons/:hackathonId/admin/scores" element={<AdminRoute><PageWithNavbar><HackathonAdminScores /></PageWithNavbar></AdminRoute>} />
          <Route path="/ai-explainer" element={<PageWithNavbar><AIConceptExplainer /></PageWithNavbar>} />
          <Route path="/assessments" element={<PageWithNavbar><Assessments /></PageWithNavbar>} />
          <Route path="/assessments/:id/mcq" element={<PageWithNavbar><MCQAssessment /></PageWithNavbar>} />
          <Route path="/assessments/:problemId" element={<PageWithNavbar><AssessmentFlow /></PageWithNavbar>} />
          <Route path="/assessments/:id/code" element={<PageWithNavbar><CodeAssessment /></PageWithNavbar>} />
          <Route path="/assessments/:id/result" element={<PageWithNavbar><AssessmentResults /></PageWithNavbar>} />
          <Route path="/assessments/:id/results" element={<PageWithNavbar><AssessmentResults /></PageWithNavbar>} />
          <Route path="/leaderboard" element={<PageWithNavbar><Leaderboard /></PageWithNavbar>} />
          <Route path="/ai-resume" element={<PageWithNavbar><AIResumeConsolidator /></PageWithNavbar>} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminPageWithNavbar><Admin /></AdminPageWithNavbar></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminPageWithNavbar><AdminDashboard /></AdminPageWithNavbar></AdminRoute>} />
          
          {/* Test route - bypass authentication temporarily */}
          <Route path="/test-admin" element={<AdminPageWithNavbar><AdminDashboard /></AdminPageWithNavbar>} />
        </Routes>
      </div>
    </Router>
    </ErrorBoundary>
  );
}