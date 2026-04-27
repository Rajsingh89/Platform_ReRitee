import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { Check, Sparkles, Brain, Infinity, Star, Zap, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 4 Unique Slides matching the reference vibe
const HERO_SLIDES = [
  {
    id: 1,
    title: "Henrietta Lacks, Subjectivity, & The Medical Exploitation of Women",
    author: "Quintessa Williams",
    role: "Writer for Cultured",
    image: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=800&q=80",
    bgColor: "#F2F8F1", 
    accent: "#166534"
  },
  {
    id: 2,
    title: "How Starting an Investment Firm Almost Landed Me in a Federal Prison",
    author: "Marlon Weems",
    role: "Host of The Journeyman Unfiltered",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
    bgColor: "#E5E5E5", 
    accent: "#171717"
  },
  {
    id: 3,
    title: "The Future of Design is Emotional",
    author: "Sarah Jenkins",
    role: "Product Designer",
    image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80",
    bgColor: "#FFF8F0", 
    accent: "#9A3412"
  },
  {
    id: 4,
    title: "Why Everyone Should Learn Quantum Physics",
    author: "Marcus Chen",
    role: "Physics Researcher",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    bgColor: "#F7F0FF", 
    accent: "#6B21A8"
  }
];

const SectionHeader = ({ title, subtitle }: { title: React.ReactNode, subtitle?: string }) => (
  <div className="md:w-1/3 mb-8 md:mb-0">
    <div className="sticky top-24">
      <h2 className="text-4xl md:text-6xl font-serif font-medium tracking-tight text-black leading-[1.1] mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-500 font-sans max-w-xs">{subtitle}</p>
      )}
    </div>
  </div>
);

export const Membership = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerColorIndex, setBannerColorIndex] = useState(0);
  const { scrollYProgress } = useScroll();

  // Hero Slide Interval (5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Bottom Banner Color Interval (2 seconds for smoother feel)
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerColorIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const scrollToPlans = () => {
    const plansSection = document.getElementById('plans');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans transition-colors duration-300 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col pt-16">
        
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row border-b border-black min-h-[calc(100vh-64px)]">
          {/* Left: Typography */}
          <div className="lg:w-[60%] flex flex-col justify-center px-6 md:px-16 py-12 lg:border-r border-black bg-white relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tight mb-8 text-black leading-[0.95]">
                Fuel your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-black">cognitive evolution.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium max-w-xl">
                Unlock a sanctuary for deep thinking. No ads, no noise—just pure, unfiltered wisdom from the world's sharpest minds.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  onClick={scrollToPlans}
                  className="rounded-full px-10 py-4 text-lg bg-black text-white hover:bg-universe-highlight hover:text-white border-none transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Get started
                </Button>
                <Button 
                  variant="outline" 
                  onClick={scrollToPlans}
                  className="rounded-full px-10 py-4 text-lg border-black text-black hover:bg-black/5 bg-transparent"
                >
                  View plans
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right: Dynamic Visual */}
          <motion.div 
            className="lg:w-[40%] relative flex items-center justify-center p-8 lg:p-12 overflow-hidden"
            animate={{ backgroundColor: HERO_SLIDES[currentSlide].bgColor }}
            transition={{ duration: 0.8 }}
          >
             {/* Progress Bar */}
             <div className="absolute top-0 left-0 right-0 h-1 bg-black/10">
               <motion.div 
                 key={currentSlide}
                 className="h-full bg-black"
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 5, ease: "linear" }}
               />
             </div>

             {/* UPDATED: rounded-none */}
             <div className="w-full max-w-[400px] bg-white shadow-2xl rounded-none flex flex-col transform transition-transform duration-700 hover:scale-[1.02] hover:shadow-3xl">
               <div className="h-[300px] relative overflow-hidden bg-gray-200">
                 <AnimatePresence mode="wait">
                   <motion.img 
                     key={currentSlide}
                     src={HERO_SLIDES[currentSlide].image} 
                     alt={HERO_SLIDES[currentSlide].title} 
                     initial={{ scale: 1.1, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.6 }}
                     className="w-full h-full object-cover"
                   />
                 </AnimatePresence>
                 
                 {/* Badge */}
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Member-only</span>
                 </div>
               </div>
               
               <div className="p-8 bg-white flex-1 flex flex-col justify-between border-t border-gray-100 relative">
                  <div className="mb-6">
                    <AnimatePresence mode="wait">
                      <motion.h3 
                        key={currentSlide}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="text-2xl font-serif font-bold text-black leading-tight line-clamp-3"
                      >
                        {HERO_SLIDES[currentSlide].title}
                      </motion.h3>
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 ring-2 ring-white shadow-md">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${HERO_SLIDES[currentSlide].author}`} alt="Avatar" />
                     </div>
                     <div className="overflow-hidden">
                       <AnimatePresence mode="wait">
                         <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                         >
                           <p className="text-sm font-bold text-black truncate">{HERO_SLIDES[currentSlide].author}</p>
                           <p className="text-xs text-gray-500 truncate font-medium" style={{ color: HERO_SLIDES[currentSlide].accent }}>{HERO_SLIDES[currentSlide].role}</p>
                         </motion.div>
                       </AnimatePresence>
                     </div>
                  </div>
               </div>
             </div>
          </motion.div>
        </div>

        {/* WHY MEMBERSHIP */}
        <div className="py-24 px-6 md:px-16 border-b border-black bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
            <SectionHeader 
              title={<>Why <br /> membership?</>}
              subtitle="Invest in your intellectual growth."
            />
            
            <div className="md:w-2/3 space-y-20">
              {[
                { title: "Directly reward writers", desc: "Your membership fee goes directly to the writers you read. No middlemen, no ad networks—just pure support for quality thought.", icon: Zap },
                { title: "Read without limits", desc: "Unlock the full archive. No paywalls, no pop-ups, no distractions. Just you and the ideas that matter.", icon: ShieldCheck },
                { title: "Deepen your understanding", desc: "Access exclusive 'Thinking Modes'—interactive tools that help you analyze, critique, and retain complex concepts.", icon: Brain }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-t border-black pt-8 group"
                >
                  <div className="flex items-start gap-6">
                    <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-universe-highlight/10 transition-colors">
                      <item.icon className="w-8 h-8 text-black group-hover:text-universe-highlight transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif font-bold mb-4 text-black group-hover:text-universe-highlight transition-colors">{item.title}</h3>
                      <p className="text-xl text-gray-600 leading-relaxed max-w-2xl font-serif">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* WHAT MEMBERS ARE SAYING */}
        <div className="py-24 px-6 md:px-16 border-b border-black bg-[#F2F8F1]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
             <SectionHeader 
               title={<>What members <br /> are saying</>} 
             />
             
             <div className="md:w-2/3 space-y-16">
                {[
                  {
                    quote: "For us tech folks, ReRitee membership unlocks a whole treasure trove of high-quality articles. One good technology book could sell for over the membership fee amount.",
                    author: "Wenqi Glantz",
                    role: "Software Architect"
                  },
                  {
                    quote: "I love that my subscription goes directly to the writers. It feels like a sustainable ecosystem for quality content, rather than just another ad-driven platform.",
                    author: "David Kim",
                    role: "Data Scientist"
                  }
                ].map((testimonial, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="border-t border-black pt-8 flex gap-6 items-start"
                  >
                     <div className="w-16 h-16 rounded-full bg-white border border-black/10 flex items-center justify-center text-2xl font-serif font-bold text-universe-highlight shrink-0">
                        "
                     </div>
                     <div>
                        <p className="text-xl font-serif text-gray-800 leading-relaxed mb-6 italic">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-[1px] w-8 bg-black"></div>
                          <div>
                            <p className="text-sm font-bold text-black">{testimonial.author}</p>
                            <p className="text-xs text-gray-600 uppercase tracking-wider">{testimonial.role}</p>
                          </div>
                        </div>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        {/* PLANS SECTION */}
        <div id="plans" className="py-24 px-6 md:px-16 bg-white border-b border-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
            
            <SectionHeader 
              title={<>Membership <br /> plans</>}
              subtitle="Choose the tier that fits your curiosity."
            />

            {/* Right: Cards */}
            <div className="md:w-2/3 grid md:grid-cols-2 gap-8">
              
              {/* Card 1: ReRitee Member - UPDATED: rounded-none */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="p-8 rounded-none bg-white border border-gray-200 flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-black group-hover:bg-universe-highlight transition-colors" />
                
                <div className="flex justify-center mb-6">
                   <div className="p-4 rounded-full bg-gray-50 group-hover:bg-universe-highlight/10 transition-colors">
                     <Brain className="w-10 h-10 text-black group-hover:text-universe-highlight transition-colors stroke-[1.5]" />
                   </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-black mb-1">ReRitee Member</h3>
                <p className="text-center text-gray-500 mb-8 font-medium">$2/month or $10/year</p>
                
                <Button 
                  onClick={() => navigate('/register')}
                  className="w-full rounded-full bg-black text-white hover:bg-universe-highlight hover:text-white border-none py-3 mb-8 shadow-md"
                >
                  Get started
                </Button>
                
                <ul className="space-y-4 text-sm">
                  {[
                    "Read member-only stories",
                    "Support writers you read most",
                    "Listen to audio narrations",
                    "Read offline with the app",
                    "Access cognitive community"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <Check className="w-5 h-5 text-green-600 shrink-0" /> 
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Card 2: Friend of ReRitee - UPDATED: rounded-none */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="p-8 rounded-none bg-white border border-gray-200 flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFC017] to-orange-500" />
                
                <div className="flex justify-center mb-6">
                   <div className="p-4 rounded-full bg-[#FFC017]/10 group-hover:bg-[#FFC017]/20 transition-colors">
                      <Infinity className="w-10 h-10 text-black stroke-[1.5]" />
                   </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-black mb-1">Friend of ReRitee</h3>
                <p className="text-center text-gray-500 mb-8 font-medium">$10/month or $50/year</p>
                
                <Button 
                  onClick={() => navigate('/register')}
                  className="w-full rounded-full bg-black text-white hover:bg-universe-highlight hover:text-white border-none py-3 mb-8 shadow-md"
                >
                  Get started
                </Button>
                
                <div className="flex items-center justify-center gap-2 mb-8 text-xs font-bold text-[#b88a10] bg-[#FFC017]/10 py-2 rounded-full">
                   <Sparkles className="w-3 h-3" /> Includes all Member benefits
                </div>

                <ul className="space-y-4 text-sm">
                  {[
                    "Give 4x more to writers",
                    "Share stories with anyone",
                    "Customize app icon",
                    "Early access to new features"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <Check className="w-5 h-5 text-[#b88a10] shrink-0" /> 
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

            </div>
          </div>
        </div>

        {/* BOTTOM BANNER - ANIMATED BACKGROUND */}
        <motion.div 
          className="py-16 px-6 border-b border-black text-center flex flex-col items-center justify-center relative overflow-hidden"
          animate={{ backgroundColor: HERO_SLIDES[bannerColorIndex].bgColor }}
          transition={{ duration: 1.5 }}
        >
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative z-10"
           >
             <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-black mb-8">
               Take your mind further.
             </h2>
             <Button 
               onClick={() => navigate('/register')}
               className="rounded-full px-12 py-4 text-xl bg-black text-white hover:bg-universe-highlight hover:text-white border-none shadow-2xl hover:scale-105 transition-transform"
             >
               Get started
             </Button>
           </motion.div>
        </motion.div>

        {/* Footer */}
        <footer className="w-full bg-white h-20 flex items-center justify-between px-6 lg:px-16 shrink-0">
          <div className="text-2xl font-serif font-bold text-black tracking-tight">
              ReRitee
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500 font-medium underline decoration-transparent hover:decoration-gray-500 underline-offset-4 transition-all">
              <button>About</button>
              <button>Terms</button>
              <button>Privacy</button>
              <button>Help</button>
              <button>Teams</button>
              <button>Press</button>
          </div>
        </footer>
      </main>
    </div>
  );
};
