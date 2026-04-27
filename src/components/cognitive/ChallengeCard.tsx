import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Challenge } from "../../data/mockData";
import { Button } from "../ui/Button";

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedOption) setIsSubmitted(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="my-12 p-1 rounded-2xl bg-gradient-to-br from-universe-highlight via-blue-500 to-universe-accent"
    >
      <div className="bg-universe-900 rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-universe-800 rounded-lg border border-white/10">
            <AlertTriangle className="w-6 h-6 text-universe-highlight" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-universe-highlight uppercase tracking-wider mb-1">Challenge Your Bias</h4>
            <h3 className="text-xl font-semibold text-white">{challenge.question}</h3>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {challenge.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => !isSubmitted && setSelectedOption(option)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center justify-between group ${
                selectedOption === option 
                  ? "border-universe-highlight bg-universe-highlight/10 text-white" 
                  : "border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <span>{option}</span>
              {selectedOption === option && !isSubmitted && (
                <motion.div layoutId="check" className="w-2 h-2 rounded-full bg-universe-highlight" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-end"
            >
              <Button onClick={handleSubmit} disabled={!selectedOption} variant={selectedOption ? "primary" : "ghost"}>
                Submit Reasoning <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-lg p-4 border-l-4 border-universe-accent"
            >
              <div className="flex items-center gap-2 mb-2 text-universe-accent font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Analysis</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{challenge.correctReasoning}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
