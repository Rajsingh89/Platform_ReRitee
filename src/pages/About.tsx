import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { BrainCircuit, Users, Zap } from "lucide-react";

export const About = () => {
  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground font-sans selection:bg-universe-highlight/30">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            We are <span className="text-universe-highlight">ReRitee</span>.
          </h1>
          {/* FIXED: Replaced text-gray-400 with text-universe-muted */}
          <p className="text-xl text-universe-muted max-w-2xl mx-auto">
            Redefining how the world reads, writes, and thinks. We are not just a platform; we are a movement for cognitive clarity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: BrainCircuit, title: "Deep Thinking", desc: "We prioritize depth over breadth, encouraging content that challenges the mind." },
            { icon: Users, title: "Community", desc: "A network of scholars, practitioners, and curious minds connecting globally." },
            { icon: Zap, title: "Innovation", desc: "Pushing the boundaries of digital reading with interactive cognitive tools." }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-universe-800/50 border border-universe-700 hover:border-universe-highlight/50 transition-colors group"
            >
              <item.icon className="w-10 h-10 text-universe-muted group-hover:text-universe-highlight mb-4 transition-colors" />
              <h3 className="text-xl font-bold mb-2 text-universe-foreground">{item.title}</h3>
              <p className="text-universe-muted text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-serif font-bold text-universe-foreground mb-6">Our Mission</h2>
          <p className="text-universe-muted mb-6">
            In an age of information overload, clarity is power. ReRitee was born from a simple observation: the internet is great at moving information, but terrible at fostering understanding. We set out to change that.
          </p>
          <p className="text-universe-muted">
            By combining beautiful typography, distraction-free design, and novel "Thinking Modes", we create an environment where ideas can be fully explored, not just consumed.
          </p>
        </div>
      </main>
    </div>
  );
};
