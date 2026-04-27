import { motion } from "framer-motion";
import { BookOpen, Gavel, Lightbulb, UserCheck } from "lucide-react";
import { cn } from "../../lib/utils";

export type BrainMode = 'student' | 'practitioner' | 'critic' | 'decisionMaker';

interface BrainModeSelectorProps {
  currentMode: BrainMode | null;
  onSelect: (mode: BrainMode) => void;
}

export const BrainModeSelector = ({ currentMode, onSelect }: BrainModeSelectorProps) => {
  const modes = [
    { id: 'student', icon: BookOpen, label: 'Student', color: 'text-blue-400' },
    { id: 'practitioner', icon: Lightbulb, label: 'Practitioner', color: 'text-yellow-400' },
    { id: 'critic', icon: Gavel, label: 'Critic', color: 'text-red-400' },
    { id: 'decisionMaker', icon: UserCheck, label: 'Decision Maker', color: 'text-green-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-universe-800/50 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-wrap gap-2 justify-center mb-8"
    >
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelect(mode.id as BrainMode)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
            currentMode === mode.id 
              ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}
        >
          <mode.icon className={cn("w-4 h-4", currentMode === mode.id ? mode.color : "text-gray-500")} />
          {mode.label}
        </button>
      ))}
    </motion.div>
  );
};
