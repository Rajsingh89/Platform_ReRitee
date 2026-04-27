import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { PenSquare, Loader2 } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const hideOnPaths = ['/dashboard', '/write', '/profile', '/library', '/stories', '/stats', '/following', '/settings', '/community-chat'];
  const isHiddenPage = hideOnPaths.some(path => location.pathname.includes(path));
  
  if (isHiddenPage) {
    return null;
  }

  if (user) {
    return (
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 inset-x-0 w-full z-50 h-16 flex items-center bg-universe-900 border-b border-universe-700 transition-colors duration-300 font-sans"
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-20 w-full flex items-center justify-between">
        
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 group">
          <span className="text-3xl font-semibold tracking-tight text-universe-foreground group-hover:text-universe-highlight transition-colors">
            ReRitee
          </span>
        </button>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-normal text-universe-foreground">
            <Link to="/story" className="hover:text-universe-highlight transition-colors">Our story</Link>
            <Link to="/membership" className="hover:text-universe-highlight transition-colors">Membership</Link>
            <button onClick={() => navigate("/write")} className="hover:text-universe-highlight transition-colors">Write</button>
            <button onClick={() => navigate("/dashboard")} className="hover:text-universe-highlight transition-colors">Home</button>
          </div>
          
          <button onClick={() => navigate("/write")}>
            <Button variant="primary" size="sm" className="bg-universe-foreground text-universe-900 hover:bg-universe-highlight hover:text-white border-none px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2">
              <PenSquare className="w-4 h-4" />
              Write
            </Button>
          </button>
        </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 inset-x-0 w-full z-50 h-16 flex items-center bg-universe-900 border-b border-universe-700 transition-colors duration-300 font-sans"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-20 w-full flex items-center justify-between">
      
      <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
        <span className="text-3xl font-semibold tracking-tight text-universe-foreground group-hover:text-universe-highlight transition-colors">
          ReRitee
        </span>
      </button>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-sm font-normal text-universe-foreground">
          <Link to="/story" className="hover:text-universe-highlight transition-colors">Our story</Link>
          <Link to="/membership" className="hover:text-universe-highlight transition-colors">Membership</Link>
          <Link to="/login" className="hover:text-universe-highlight transition-colors">Sign in</Link>
        </div>
        
        <Link to="/register">
          <Button variant="primary" size="sm" className="bg-universe-foreground text-universe-900 hover:bg-universe-highlight hover:text-white border-none px-5 py-2.5 rounded-full font-medium text-sm">
            Get started
          </Button>
        </Link>
      </div>
      </div>
    </motion.nav>
  );
};