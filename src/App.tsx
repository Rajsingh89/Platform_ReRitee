import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { BlogDetail } from "./pages/BlogDetail";
import { Dashboard } from "./pages/Dashboard";
import { Stats } from "./pages/Stats";
import { Login } from "./pages/Login";
import { OurStory } from "./pages/OurStory";
import { Membership } from "./pages/Membership";
import { Following } from "./pages/Following";
import { Profile } from "./pages/Profile";
import { Contact } from "./pages/Contact";
import { Help } from "./pages/Help";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { Editor } from "./pages/Editor";
import { Library } from "./pages/Library";
import { Stories } from "./pages/Stories";
import { CommunityChat } from "./pages/CommunityChat";
import { Settings } from "./pages/Settings";
import { EditProfile } from "./pages/EditProfile";
import { AuthCallback } from "./pages/AuthCallback";
import ScrollToTop from "./components/layout/ScrollToTop";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

function ScrollToTopWrapper() {
  return <ScrollToTop />;
}

function App() {
  return (
    <Router>
      <ScrollToTopWrapper />
      <Routes>
        {/* Public routes - redirect to dashboard if already logged in */}
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Login initialMode="register" /></PublicRoute>} />
        <Route path="/story" element={<OurStory />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/about" element={<Navigate to="/story" replace />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />

        {/* Protected routes - require login */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
        <Route path="/following" element={<ProtectedRoute><Following /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/my-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/stories" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
        <Route path="/community-chat" element={<ProtectedRoute><CommunityChat /></ProtectedRoute>} />
        <Route path="/write" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="/blog/:id" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        {/* Auth callback for OAuth */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;