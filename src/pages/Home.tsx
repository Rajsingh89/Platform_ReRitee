import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import { ThemeToggle } from "../components/ui/ThemeToggle";

export const Home = () => {
  const navigate = useNavigate();

  return (
    // MASTER CONTAINER: Strictly 100vh, No Scroll, Flex Column
    <div className="h-screen w-full bg-universe-900 text-universe-foreground overflow-hidden flex flex-col font-sans selection:bg-universe-highlight/30 relative transition-colors duration-300">
      
      {/* Navbar is Fixed */}
      <Navbar />
      
      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 pt-20 flex flex-col lg:flex-row items-center justify-center relative z-10">
        
        {/* Left Column: Typography */}
        <div className="flex-1 flex flex-col justify-center items-start w-full lg:pr-8 relative z-20 h-full">
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif font-medium text-universe-foreground leading-[1.1] mb-6 tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 4.5vw, 5rem)" }}
          >
            Where curiosity <br />
            finds <span className="text-universe-highlight">clarity</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-universe-muted text-lg md:text-xl mb-8 font-sans font-light max-w-lg leading-relaxed"
          >
            A digital garden for deep thinking. Unfiltered ideas and cognitive challenges for the modern mind.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <Button 
              onClick={() => navigate('/login')}
              className="bg-universe-foreground text-universe-900 px-8 py-3 rounded-full text-base font-medium hover:bg-universe-highlight hover:text-white border-none transition-transform hover:scale-105 shadow-lg"
            >
              Start reading
            </Button>
          </motion.div>

        </div>

        {/* Right Column: Organic Nature Portal */}
        <div className="hidden lg:flex flex-1 justify-center items-center h-full w-full relative">
           <motion.div
             initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
             animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="relative w-full h-full flex items-center justify-center"
           >
              {/* THE VISUAL: Morphing Blob with Nature Image */}
              <motion.div
                className="w-[500px] h-[500px] overflow-hidden relative shadow-2xl shadow-universe-highlight/10"
                animate={{
                  borderRadius: [
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                    "30% 60% 70% 40% / 50% 60% 30% 60%",
                    "60% 40% 30% 70% / 60% 30% 70% 40%"
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* The Nature Image */}
                <img 
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop" 
                  alt="Majestic Mountain Nature" 
                  className="w-full h-full object-cover scale-110"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-universe-900 via-transparent to-transparent transition-colors duration-300" />
                
                {/* Inner Glow */}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] pointer-events-none" />
              </motion.div>

              {/* Decorative Elements */}
              <motion.div 
                className="absolute -z-10 w-[520px] h-[520px] bg-universe-highlight/10 blur-3xl rounded-full"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
           </motion.div>
        </div>

      </main>

      {/* Footer: Fixed, visible, and responsive */}
      <footer className="w-full border-t border-universe-700 bg-black text-white h-16 flex items-center justify-between px-6 lg:px-20 z-50 shrink-0 transition-colors duration-300">
        {/* Copyright */}
        <div className="hidden md:block text-xs text-gray-400 font-medium">
            © 2025 ReRitee Inc.
        </div>
        
        {/* Links */}
        <div className="flex items-center gap-6 text-xs text-gray-400 font-medium mx-auto md:mx-0">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/help" className="hover:text-white transition-colors">Help</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            
            {/* THEME TOGGLE BUTTON */}
            <div className="ml-4 border-l border-gray-700 pl-4">
              <ThemeToggle />
            </div>
        </div>
      </footer>
    </div>
  );
};
