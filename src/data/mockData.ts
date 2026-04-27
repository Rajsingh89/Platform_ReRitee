export interface Comment {
  id: string;
  author: string;
  text: string;
  avatar: string;
}

export interface Challenge {
  id: string;
  question: string;
  options: string[];
  correctReasoning: string;
}

export interface BrainModeContent {
  student: string;
  practitioner: string;
  critic: string;
  decisionMaker: string;
}

export interface Section {
  id: string;
  content: string;
  brainModeNotes?: BrainModeContent;
  challenge?: Challenge;
}

export interface BrainFact {
  id: string;
  fact: string;
  category: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const CHALLENGES: Challenge[] = [
  {
    id: "c1",
    question: "If an AI can pass the Turing Test, does that mean it's conscious?",
    options: [
      "Yes, passing the Turing Test is sufficient proof of consciousness",
      "No, the Turing Test only measures behavioral mimicry, not inner experience",
      "It depends on the specific implementation",
      "We cannot determine this with current technology"
    ],
    correctReasoning: "The Turing Test measures a machine's ability to exhibit intelligent behavior indistinguishable from a human. It was never designed to test consciousness. Consciousness requires subjective experience (qualia) which cannot be measured through behavioral output alone."
  },
  {
    id: "c2",
    question: "A self-driving car must choose between hitting a pedestrian or sacrificing its passenger. What should it optimize for?",
    options: [
      "Minimize total casualties",
      "Protect the passenger at all costs",
      "Follow traffic laws regardless of outcome",
      "Randomize the decision to avoid predictability"
    ],
    correctReasoning: "This is the classic 'trolley problem' in autonomous vehicles. While utilitarian approaches minimize total harm, real-world implementations must balance legal compliance, social expectations, and liability. Most ethical frameworks suggest the decision should be transparent and consistent with human values."
  },
  {
    id: "c3",
    question: "Does having more neurons in an AI model directly correlate with better reasoning?",
    options: [
      "Yes, more neurons always improve performance",
      "No, model behavior depends more on architecture and training",
      "Only for certain types of tasks",
      "It depends on the neuron type used"
    ],
    correctReasoning: "Model performance depends on architecture, training data quality, and task alignment—not just neuron count. A smaller, well-trained model can outperform a larger, poorly trained one. Efficiency and purpose matter more than raw scale."
  },
  {
    id: "c4",
    question: "Should AI-generated content be labeled as such?",
    options: [
      "Always, for transparency and trust",
      "Only when it could influence important decisions",
      "Only when requested by users",
      "No, it's impractical to enforce"
    ],
    correctReasoning: "Labeling AI content balances transparency with practicality. Full disclosure prevents deception in journalism and education, while exceptions may exist for creative applications where authorship is less consequential."
  },
  {
    id: "c5",
    question: "Is it ethical to use AI for medical diagnosis?",
    options: [
      "Yes, AI can match or exceed human diagnostic accuracy",
      "Only as a supplementary tool alongside human doctors",
      "Only in areas with limited access to healthcare",
      "No, diagnosis requires human judgment and empathy"
    ],
    correctReasoning: "AI diagnostic tools excel at pattern recognition in imaging and lab results but lack contextual understanding, patient empathy, and accountability. The ethical approach is collaborative—AI augmenting human judgment, not replacing it."
  }
];

export const BRAIN_FACTS: BrainFact[] = [
  { id: "bf1", fact: "The brain uses approximately 20% of the body's total energy despite being only 2% of body weight.", category: "energy" },
  { id: "bf2", fact: "Neurons fire at speeds up to 268 mph, creating the fastest signal transmission in the body.", category: "speed" },
  { id: "bf3", fact: "The brain can process images seen for only 13 milliseconds—faster than the blink of an eye.", category: "vision" },
  { id: "bf4", fact: "Working memory can hold approximately 4 items simultaneously, not 7 as commonly believed.", category: "memory" },
  { id: "bf5", fact: "Sleep deprivation impairs memory consolidation more than complete lack of sleep.", category: "sleep" },
  { id: "bf6", fact: "The brain's prefrontal cortex isn't fully developed until around age 25.", category: "development" },
  { id: "bf7", fact: "Emotional memories are processed differently than neutral ones, with stronger neural encoding.", category: "emotion" },
  { id: "bf8", fact: "Neuroplasticity allows the brain to reorganize itself throughout life, not just in childhood.", category: "plasticity" },
  { id: "bf9", fact: "The brain generates approximately 70,000 thoughts per day in the average person.", category: "thoughts" },
  { id: "bf10", fact: "Context-dependent memory means you're more likely to remember things in the same environment where you learned them.", category: "memory" }
];

export const FLASHCARDS: Flashcard[] = [
  { id: "fc1", question: "What is the Turing Test?", answer: "A test of a machine's ability to exhibit intelligent behavior equivalent to, or indistinguishable from, that of a human.", category: "AI" },
  { id: "fc2", question: "What is neural plasticity?", answer: "The brain's ability to reorganize itself by forming new neural connections throughout life.", category: "Neuroscience" },
  { id: "fc3", question: "What is cognitive load theory?", answer: "The idea that working memory has limited capacity, and instructional design should avoid overloading it.", category: "Education" },
  { id: "fc4", question: "What is the attention schema theory?", answer: "The theory that consciousness arises from the brain building a simplified model of its own attention processes.", category: "Consciousness" },
  { id: "fc5", question: "What is transfer learning in ML?", answer: "When a model trained on one task is refined for a different but related task, leveraging learned features.", category: "Machine Learning" },
  { id: "fc6", question: "What is the hippocampus role?", answer: "Essential for forming new memories and converting short-term memories to long-term storage.", category: "Neuroscience" },
  { id: "fc7", question: "What is the difference between AI narrow intelligence and general intelligence?", answer: "Narrow AI performs specific tasks; AGI would match human cognitive abilities across any domain.", category: "AI" },
  { id: "fc8", question: "What is dual-process theory?", answer: "System 1 (fast, intuitive) and System 2 (slow, deliberate) thinking modes in human cognition.", category: "Psychology" },
  { id: "fc9", question: "What is emergence in complex systems?", answer: "Complex behaviors arising from simple rules and interactions between system components.", category: "Systems" },
  { id: "fc10", question: "What is the gradient descent optimization?", answer: "An algorithm that iteratively minimizes a loss function by moving toward the steepest descent direction.", category: "Machine Learning" }
];

export const DAILY_CHALLENGE = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
export const DAILY_FACT = BRAIN_FACTS[Math.floor(Math.random() * BRAIN_FACTS.length)];