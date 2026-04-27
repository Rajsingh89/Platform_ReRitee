import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const OurStory = () => {
  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground font-sans selection:bg-universe-highlight/30 transition-colors duration-300 flex flex-col">
      <Navbar />
      
      <main className="pt-32 flex-1">
        <div className="max-w-4xl mx-auto px-6 mb-24">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-[0.9] text-universe-foreground">
              We built a brain,<br />
              <span className="text-universe-muted italic">not a blog.</span>
            </h1>
            <p className="text-xl md:text-2xl text-universe-muted max-w-2xl mx-auto leading-relaxed">
              The internet is full of passive consumption. We wanted to build a space where reading is an act of thinking.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[500px] rounded-3xl overflow-hidden mb-24 shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80" 
              alt="Team working" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-10 max-w-lg">
              <h3 className="text-2xl font-bold text-white mb-2">The Lab</h3>
              <p className="text-gray-300">Where we design cognitive interfaces for the next generation of thinkers.</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-universe-highlight">The Problem</h2>
              <p className="text-universe-muted text-lg leading-relaxed">
                Most platforms reward clickbait and shallow engagement. They want your eyeballs, not your mind. This creates a feedback loop of noise, where the loudest voice wins, not the smartest.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-blue-500">The Solution</h2>
              <p className="text-universe-muted text-lg leading-relaxed">
                Cognitive is different. We introduced "Thinking Mode"—a layer of interactivity that challenges your biases as you read. We don't just serve content; we serve perspective.
              </p>
            </div>
          </div>
        </div>

        {/* 
          REFERENCE IMPLEMENTATION 
          - Dark Section with 3 Links
          - White Footer Bar
        */}
        <div className="w-full">
          
          {/* 1. Start Reading */}
          <Link 
            to="/dashboard" 
            className="group flex items-center justify-between py-8 md:py-12 px-6 md:px-20 bg-[#242424] border-t border-white/10 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <span className="text-4xl md:text-6xl font-serif font-medium text-white group-hover:text-universe-highlight transition-colors tracking-tight">
              Start reading
            </span>
            <ArrowRight className="w-8 h-8 md:w-12 md:h-12 text-white group-hover:text-universe-highlight transition-all duration-300 transform group-hover:translate-x-4" />
          </Link>

          {/* 2. Start Writing */}
          <Link 
            to="/write" 
            className="group flex items-center justify-between py-8 md:py-12 px-6 md:px-20 bg-[#242424] border-t border-white/10 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <span className="text-4xl md:text-6xl font-serif font-medium text-white group-hover:text-universe-highlight transition-colors tracking-tight">
              Start writing
            </span>
            <ArrowRight className="w-8 h-8 md:w-12 md:h-12 text-white group-hover:text-universe-highlight transition-all duration-300 transform group-hover:translate-x-4" />
          </Link>

          {/* 3. Become a Member */}
          <Link 
            to="/membership" 
            className="group flex items-center justify-between py-8 md:py-12 px-6 md:px-20 bg-[#242424] border-t border-b border-white/10 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <span className="text-4xl md:text-6xl font-serif font-medium text-white group-hover:text-universe-highlight transition-colors tracking-tight">
              Become a member
            </span>
            <ArrowRight className="w-8 h-8 md:w-12 md:h-12 text-white group-hover:text-universe-highlight transition-all duration-300 transform group-hover:translate-x-4" />
          </Link>

          {/* WHITE FOOTER BAR */}
          <div className="bg-white py-6 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="text-2xl font-serif font-bold text-black tracking-tight hover:text-universe-highlight transition-colors">
              ReRitee
            </Link>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-black">
              <Link to="/about" className="hover:text-universe-highlight transition-colors underline decoration-transparent hover:decoration-universe-highlight underline-offset-4">About</Link>
              <Link to="/terms" className="hover:text-universe-highlight transition-colors underline decoration-transparent hover:decoration-universe-highlight underline-offset-4">Terms</Link>
              <Link to="/privacy" className="hover:text-universe-highlight transition-colors underline decoration-transparent hover:decoration-universe-highlight underline-offset-4">Privacy</Link>
              <Link to="/help" className="hover:text-universe-highlight transition-colors underline decoration-transparent hover:decoration-universe-highlight underline-offset-4">Help</Link>
              <Link to="/contact" className="hover:text-universe-highlight transition-colors underline decoration-transparent hover:decoration-universe-highlight underline-offset-4">Teams</Link>
              <Link to="/contact" className="hover:text-universe-highlight transition-colors underline decoration-transparent hover:decoration-universe-highlight underline-offset-4">Press</Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
