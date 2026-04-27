import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
}

export const Button = ({ children, onClick, variant = "primary", className, size = "md", type = "button" }: ButtonProps) => {
  const baseStyles = "rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-universe-foreground text-universe-900 shadow-lg border border-transparent hover:bg-universe-highlight hover:text-white",
    
    secondary: "bg-universe-800 text-universe-foreground border border-universe-700 hover:border-universe-highlight hover:text-universe-highlight hover:shadow-md",
    
    outline: "bg-transparent text-universe-foreground border border-universe-700 hover:border-universe-highlight hover:text-universe-highlight hover:bg-universe-highlight/10",
    
    ghost: "bg-transparent text-universe-muted hover:text-universe-highlight hover:bg-universe-highlight/10",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      type={type}
    >
      {children}
    </motion.button>
  );
};
