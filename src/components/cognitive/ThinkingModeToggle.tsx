import { motion } from "framer-motion";
import { Brain, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

interface ThinkingModeToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const ThinkingModeToggle = ({ isEnabled, onToggle }: ThinkingModeToggleProps) => {
  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-2">
       <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-universe-800/90 backdrop-blur border border-universe-highlight/30 text-xs text-universe-highlight px-3 py-1 rounded-full mb-2"
       >
         {isEnabled ? "Cognitive Load: HIGH" : "Cognitive Load: PASSIVE"}
       </motion.div>
      
      <motion.button
        onClick={onToggle}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
          isEnabled 
            ? "bg-universe-highlight shadow-[0_0_30px_rgba(163,113,247,0.4)]" 
            : "bg-universe-700 hover:bg-universe-600"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: isEnabled ? 360 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {isEnabled ? (
            <Brain className="w-8 h-8 text-white" />
          ) : (
            <Zap className="w-8 h-8 text-gray-400" />
          )}
        </motion.div>
        
        {/* Ring Animation */}
        {isEnabled && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ scale: [1, 1.5], opacity: [1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
};
