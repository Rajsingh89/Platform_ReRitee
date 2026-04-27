import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full bg-universe-800 border border-universe-700 text-universe-foreground hover:border-universe-highlight hover:text-universe-highlight transition-all shadow-lg overflow-hidden group"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === "dark" ? 0 : 180,
          scale: theme === "dark" ? 1 : 0.8
        }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        {theme === "dark" ? (
          <Moon className="w-5 h-5 fill-current" />
        ) : (
          <Sun className="w-5 h-5 fill-current text-yellow-500" />
        )}
      </motion.div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-universe-highlight/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
