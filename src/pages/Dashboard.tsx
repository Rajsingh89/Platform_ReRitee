import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/layout/AppSidebar";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { profileService } from "../services/profileService";
import {
  Search, Bell, PenSquare, Menu, MoreHorizontal, Bookmark, MessageCircle,
  Settings, HelpCircle, Star, Flame, Clock3, BrainCircuit, Palette,
  LayoutGrid, Sparkles,
  ThumbsUp, Share2, Copy, Check, ExternalLink, BookOpen, Target,
  TrendingUp, Trophy, Lightbulb, Zap, Eye, GraduationCap, Pin,
  X, ChevronDown, Brain, Users,
  History, UserPlus, UserMinus, FileText, Volume2, Minimize2, Maximize2,
  Timer, Keyboard, Pencil, AlertCircle,
  Newspaper, Heart, BarChart3,
  Loader2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";

// ─── STATIC DATA ───────────────────────────────────────────────────────────────
const DAILY_CHALLENGES = [
  {
    question: "Which cognitive bias causes people to overvalue information they already possess?",
    options: ["Confirmation Bias", "Endowment Effect", "Anchoring Bias", "Dunning-Kruger Effect"],
    correct: 1,
    explanation: "The Endowment Effect is a cognitive bias where people place higher value on things they already own or know, making them reluctant to trade or let go.",
    category: "Behavioral Economics",
  },
  {
    question: "What is the phenomenon where people recall uncompleted tasks better than completed ones?",
    options: ["Zeigarnik Effect", "Primacy Effect", "Recency Bias", "Spacing Effect"],
    correct: 0,
    explanation: "The Zeigarnik Effect shows our brain keeps incomplete tasks in active memory, creating mental tension until they're resolved.",
    category: "Memory",
  },
  {
    question: "Which system in dual-process theory handles fast, automatic thinking?",
    options: ["System 2", "Executive Function", "System 1", "Prefrontal Cortex"],
    correct: 2,
    explanation: "System 1 (Kahneman) operates automatically and quickly with little effort. System 2 allocates attention to effortful mental activities.",
    category: "Decision Making",
  },
];

const THINKING_MODELS = [
  { name: "First Principles", desc: "Break down complex problems into basic elements and reassemble from the ground up.", icon: Target, color: "text-violet-400", use: "Problem Solving" },
  { name: "Inversion", desc: "Instead of asking how to succeed, ask what would guarantee failure — then avoid those things.", icon: Zap, color: "text-amber-400", use: "Strategy" },
  { name: "Second-Order Thinking", desc: "Consider the consequences of the consequences. Think beyond the immediate effects.", icon: Brain, color: "text-cyan-400", use: "Planning" },
  { name: "Occam's Razor", desc: "The simplest explanation that accounts for all the facts is usually the correct one.", icon: Eye, color: "text-emerald-400", use: "Analysis" },
  { name: "Circle of Competence", desc: "Know what you know, know what you don't know, and operate within your strengths.", icon: Users, color: "text-rose-400", use: "Self-Awareness" },
  { name: "Probabilistic Thinking", desc: "Use math and logic to estimate the likelihood of outcomes, not gut feelings.", icon: TrendingUp, color: "text-blue-400", use: "Forecasting" },
];

const COGNITIVE_BIASES_DECK = [
  { bias: "Anchoring Bias", definition: "Over-relying on the first piece of information encountered.", example: "Seeing a $500 jacket first makes a $200 jacket seem cheap.", debiasing: "Always seek multiple reference points before deciding." },
  { bias: "Survivorship Bias", definition: "Focusing on successes while ignoring failures that are no longer visible.", example: "Studying only successful startups and ignoring the 90% that failed.", debiasing: "Actively seek out failure cases and base rates." },
  { bias: "Availability Heuristic", definition: "Judging probability by how easily examples come to mind.", example: "Thinking plane crashes are common after seeing one on the news.", debiasing: "Check actual statistics before forming judgments." },
  { bias: "Dunning-Kruger Effect", definition: "Low-ability individuals overestimate their competence; experts underestimate theirs.", example: "A beginner thinks they've mastered coding after one tutorial.", debiasing: "Seek honest feedback and compare with actual experts." },
  { bias: "Sunk Cost Fallacy", definition: "Continuing an endeavor because of previously invested resources.", example: "Finishing a bad movie because you paid for the ticket.", debiasing: "Ask: Would I start this today if I hadn't already invested?" },
  { bias: "Framing Effect", definition: "Drawing different conclusions from the same information based on how it's presented.", example: "'90% survival rate' sounds better than '10% mortality rate.'", debiasing: "Reframe the information in multiple ways before deciding." },
];

const BRAIN_FACTS = [
  "Your brain uses 20% of your body's total energy despite being only 2% of body weight.",
  "The human brain can process an image in just 13 milliseconds.",
  "You make about 35,000 decisions every single day.",
  "Reading rewires your brain — literally. It strengthens neural connections.",
  "Your brain's storage capacity is approximately 2.5 petabytes.",
  "Multitasking reduces productivity by up to 40%. Your brain actually task-switches.",
  "The brain generates about 12-25 watts of electricity — enough to power a low-watt LED bulb.",
];

const KEY_CONCEPTS = [
  { icon: Brain, label: "Working Memory", desc: "The mental workspace for real-time processing", deeper: "Limited to ~4 chunks. Use chunking to bypass limits." },
  { icon: Eye, label: "Attention Economy", desc: "How focus is allocated in information-rich environments", deeper: "Average attention span has decreased. Design for scannable content." },
  { icon: Zap, label: "Neuroplasticity", desc: "The brain's ability to rewire and adapt", deeper: "Deliberate practice creates new neural pathways at any age." },
  { icon: Target, label: "Decision Science", desc: "How we make choices under uncertainty", deeper: "Decision fatigue is real — make important decisions early in the day." },
  { icon: Users, label: "Social Cognition", desc: "How we understand and interact with others", deeper: "Mirror neurons help us empathize by simulating others' experiences." },
  { icon: GraduationCap, label: "Meta-Cognition", desc: "Thinking about thinking", deeper: "Self-monitoring your thought process improves learning by 20-30%." },
];

const COGNITIVE_RESOURCES = [
  { name: "Stanford Encyclopedia of Philosophy", url: "https://plato.stanford.edu", desc: "Peer-reviewed philosophy articles" },
  { name: "Cognitive Science Society", url: "https://cognitivesciencesociety.org", desc: "Latest CogSci research" },
  { name: "Behavioral Scientist", url: "https://behavioralscientist.org", desc: "Evidence-based insights" },
  { name: "LessWrong", url: "https://lesswrong.com", desc: "Rationality and decision-making community" },
  { name: "Farnam Street", url: "https://fs.blog", desc: "Mental models & decision-making blog" },
  { name: "Coursera — Learning How to Learn", url: "https://coursera.org/learn/learning-how-to-learn", desc: "World's most popular online course" },
];

const DESIGN_TIPS = [
  "8pt grid system creates visual harmony. Spacing should always be multiples of 8.",
  "Limit your type scale to 4-5 sizes max. Consistency beats variety.",
  "The 60-30-10 color rule: 60% dominant, 30% secondary, 10% accent.",
  "White space is not empty space — it's the most powerful design element.",
  "Design for the fold — but don't obsess over it. Engaging content gets scrolled.",
  "Contrast ratio of 4.5:1 minimum for accessible body text.",
  "Motion should communicate, not decorate. Every animation needs a purpose.",
];

const DESIGN_RESOURCES = [
  { name: "Figma Community", url: "https://figma.com/community", desc: "Free design files & plugins" },
  { name: "Dribbble", url: "https://dribbble.com", desc: "Design inspiration shots" },
  { name: "Mobbin", url: "https://mobbin.com", desc: "Real-world UI patterns" },
  { name: "Untitled UI", url: "https://untitledui.com", desc: "Design system & components" },
  { name: "Laws of UX", url: "https://lawsofux.com", desc: "Psychology-backed principles" },
];

const COLOR_PALETTES = [
  { name: "Midnight Bloom", colors: ["#0F172A", "#1E293B", "#7C3AED", "#A78BFA", "#F1F5F9"] },
  { name: "Ocean Breeze", colors: ["#042F2E", "#0D9488", "#2DD4BF", "#99F6E4", "#F0FDFA"] },
  { name: "Sunset Fire", colors: ["#1C1917", "#DC2626", "#F97316", "#FCD34D", "#FFFBEB"] },
  { name: "Forest Depth", colors: ["#052E16", "#166534", "#22C55E", "#86EFAC", "#F0FDF4"] },
];

const DESIGN_CHALLENGE = {
  title: "Weekly Design Challenge",
  prompt: "Redesign a mobile banking app's transaction history screen using only 2 colors and no icons. Focus on typography hierarchy and whitespace.",
  deadline: "Submit by Sunday",
};

const WRITING_PROMPTS = [
  { tag: "Cognitive", prompt: "How does sleep deprivation affect decision-making in high-stakes environments?" },
  { tag: "Design", prompt: "What makes a design system truly scalable? Share a real-world case study." },
  { tag: "AI", prompt: "Will AI replace UX researchers? Argue both sides with evidence." },
  { tag: "Career", prompt: "The one skill that 10x-ed your career — and how to develop it." },
  { tag: "Product", prompt: "A feature you'd remove from every app and why users would thank you." },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ["N"], desc: "New draft" },
  { keys: ["F"], desc: "Toggle focus mode" },
  { keys: ["S"], desc: "Open search" },
  { keys: ["1"], desc: "For You tab" },
  { keys: ["2"], desc: "Featured tab" },
  { keys: ["3"], desc: "Cognitive Science tab" },
  { keys: ["4"], desc: "Design tab" },
  { keys: ["?"], desc: "Show shortcuts" },
  { keys: ["Esc"], desc: "Close overlays" },
];

const FEED_PAGE_SIZE = 12;

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { posts, loadingPosts, likedPostIds, bookmarkedPostIds, followingIds, toggleLike, toggleBookmark, toggleFollow, followersCount, followingCount } = useApp();
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Layout
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");

  // Menus
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState("all");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Post interactions
  const [pinnedPostIds, setPinnedPostIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cognitive state
  const [cognitiveTopic, setCognitiveTopic] = useState("all");
  const [cognitiveSort, setCognitiveSort] = useState("popular");
  const [cognitiveSearch, setCognitiveSearch] = useState("");
  const cognitiveLayout: "grid" = "grid";
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);
  const [showChallengeResult, setShowChallengeResult] = useState(false);
  const [noteTexts, setNoteTexts] = useState<Record<string, string>>({});
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);
  const [showCogResources, setShowCogResources] = useState(false);
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [focusTimerActive, setFocusTimerActive] = useState(false);
  const [focusTimerSeconds, setFocusTimerSeconds] = useState(25 * 60);
  const [showBrainFact, setShowBrainFact] = useState(true);
  const [cognitiveTab, setCognitiveTab] = useState<"articles" | "models" | "biases">("articles");
  const [journalEntries, setJournalEntries] = useState<{text: string; date: string; tag: string}[]>([]);
  const [journalText, setJournalText] = useState("");
  const [journalTag, setJournalTag] = useState("reflection");
  const [learnedConcepts, setLearnedConcepts] = useState<Set<string>>(new Set());
  const readingGoal = 5;

  // Design state
  const [designTopic, setDesignTopic] = useState("all");
  const [designSort, setDesignSort] = useState("popular");
  const [designSearch, setDesignSearch] = useState("");
  const [designLayout, setDesignLayout] = useState<"editorial" | "grid" | "compact">("grid");
  const [showDesignResources, setShowDesignResources] = useState(false);
  const [showDesignTip, setShowDesignTip] = useState(true);

  // Reader features
  const [readPostIds, setReadPostIds] = useState<Set<string>>(new Set());
  const [readingStreak, setReadingStreak] = useState(3);
  const [showArticleMenu, setShowArticleMenu] = useState<string | null>(null);
  const [mutedTopics, setMutedTopics] = useState<Set<string>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [showReadHistory, setShowReadHistory] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState<string | null>(null);
  const articleMenuRef = useRef<HTMLDivElement>(null);

  // Writer features
  const [showQuickDraft, setShowQuickDraft] = useState(false);
  const [quickDraftText, setQuickDraftText] = useState("");
  const [quickDraftTitle, setQuickDraftTitle] = useState("");
  const [savedDrafts, setSavedDrafts] = useState<{title: string; text: string; date: string}[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showWritingPrompts, setShowWritingPrompts] = useState(false);
  const [visibleFeedCount, setVisibleFeedCount] = useState(FEED_PAGE_SIZE);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const feedLoadTimeoutRef = useRef<number | null>(null);

  // Stats - computed after all state declarations
  const quickStatsItems = [
    { icon: BookOpen, label: "Read", value: readPostIds.size },
    { icon: Bookmark, label: "Saved", value: bookmarkedPostIds.size },
    { icon: Heart, label: "Liked", value: likedPostIds.size },
    { icon: UserPlus, label: "Following", value: followingCount },
  ];

  // ─── EFFECTS ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) setIsProfileMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setIsNotificationOpen(false);
      if (articleMenuRef.current && !articleMenuRef.current.contains(event.target as Node)) setShowArticleMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      switch (e.key) {
        case "n": case "N": e.preventDefault(); setShowQuickDraft(true); break;
        case "f": case "F": e.preventDefault(); setFocusMode(p => !p); break;
        case "s": case "S": e.preventDefault(); searchInputRef.current?.focus(); break;
        case "1": setActiveTab("for-you"); break;
        case "2": setActiveTab("featured"); break;
        case "3": setActiveTab("cognitive"); break;
        case "4": setActiveTab("design"); break;
        case "?": e.preventDefault(); setShowKeyboardShortcuts(p => !p); break;
        case "Escape": setShowKeyboardShortcuts(false); setShowQuickDraft(false); setShowArticleMenu(null); break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (activeTab === "for-you" || activeTab === "featured") {
      setVisibleFeedCount(FEED_PAGE_SIZE);
      setIsFeedLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (feedLoadTimeoutRef.current !== null) {
        window.clearTimeout(feedLoadTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user) return;
      setLoadingSuggestions(true);
      const users = await profileService.getSuggestedUsers(user.id, 5);
      setSuggestedUsers(users);
      setLoadingSuggestions(false);
    };
    loadSuggestions();
  }, [user]);

  // ─── HELPERS ─────────────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (searchQuery) alert(`Searching for: ${searchQuery}`); };

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    setter(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const togglePin = (id: string) => toggleSet(setPinnedPostIds, id);

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sharePost = (post: any) => {
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.subtitle, url: `${window.location.origin}/blog/${post.id}` });
    } else {
      copyLink(post.id);
    }
  };

  const getDifficulty = (readTime: string) => {
    const mins = parseInt(readTime);
    if (mins <= 7) return { label: "Beginner", cls: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" };
    if (mins <= 10) return { label: "Intermediate", cls: "text-amber-400 border-amber-400/30 bg-amber-400/10" };
    return { label: "Advanced", cls: "text-rose-400 border-rose-400/30 bg-rose-400/10" };
  };

  const handleChallengeAnswer = (idx: number) => {
    setChallengeAnswer(idx);
    setShowChallengeResult(true);
  };

  const nextChallenge = () => {
    setCurrentChallengeIdx(prev => (prev + 1) % DAILY_CHALLENGES.length);
    setChallengeAnswer(null);
    setShowChallengeResult(false);
  };

  const nextFlashcard = () => {
    setFlashcardFlipped(false);
    setTimeout(() => setFlashcardIdx(prev => (prev + 1) % COGNITIVE_BIASES_DECK.length), 150);
  };
  const prevFlashcard = () => {
    setFlashcardFlipped(false);
    setTimeout(() => setFlashcardIdx(prev => (prev - 1 + COGNITIVE_BIASES_DECK.length) % COGNITIVE_BIASES_DECK.length), 150);
  };

  const markAsRead = (id: string) => {
    setReadPostIds(prev => new Set(prev).add(id));
    setReadingStreak(prev => prev + 1);
  };

  const toggleMuteTopic = (topic: string) => {
    setMutedTopics(prev => {
      const n = new Set(prev);
      n.has(topic) ? n.delete(topic) : n.add(topic);
      return n;
    });
  };

  const handleTTS = (post: any) => {
    if (ttsPlaying === post.id) {
      window.speechSynthesis.cancel();
      setTtsPlaying(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${post.title}. ${post.subtitle}`);
      utterance.onend = () => setTtsPlaying(null);
      window.speechSynthesis.speak(utterance);
      setTtsPlaying(post.id);
    }
  };

  const saveDraft = () => {
    if (!quickDraftText.trim() && !quickDraftTitle.trim()) return;
    setSavedDrafts(prev => [{ title: quickDraftTitle || "Untitled", text: quickDraftText, date: new Date().toLocaleDateString() }, ...prev]);
    setQuickDraftText("");
    setQuickDraftTitle("");
  };

  const writeAboutTopic = (topic: string) => {
    setQuickDraftTitle(topic);
    setShowQuickDraft(true);
  };

  const totalSavedReadTime = posts.filter(p => bookmarkedPostIds.has(p.id)).reduce((s, p) => s + parseInt(p.read_time || '0'), 0);

  // ─── DATA PROCESSING ────────────────────────────────────────────────────────
  const uniqueById = (postsList: any[]) => {
    const seen = new Set<string>();
    return postsList.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
  };

  const sortByMode = (postsList: any[], mode: string) => {
    const s = [...postsList];
    if (mode === "new") return s.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (mode === "quick") return s.sort((a, b) => parseInt(a.read_time || '0') - parseInt(b.read_time || '0'));
    if (mode === "deep") return s.sort((a, b) => parseInt(b.read_time || '0') - parseInt(a.read_time || '0'));
    return s.sort((a, b) => (b.claps_count + b.comments_count * 20) - (a.claps_count + a.comments_count * 20));
  };

  // For You & Featured
  const trendingPosts = posts.filter(p => p.claps_count >= 100 || p.comments_count >= 5);
  const newestPosts = [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);
  const forYouPosts = uniqueById([...trendingPosts, ...newestPosts]);
  const featuredPosts = posts.slice(0, 10);

  // Cognitive filtering
  const cognitivePosts = posts;
  const cogTopicFiltered = cognitivePosts;
  const cogSorted = sortByMode(cogTopicFiltered, cognitiveSort);
  const visibleCognitivePosts = cognitiveSearch
    ? cogSorted.filter(p => `${p.title} ${p.subtitle} ${p.author?.username || ''}`.toLowerCase().includes(cognitiveSearch.toLowerCase()))
    : cogSorted;

  // Design filtering
  const designPosts = posts;
  const desTopicFiltered = designPosts;
  const desSorted = sortByMode(desTopicFiltered, designSort);
  const visibleDesignPosts = designSearch
    ? desSorted.filter(p => `${p.title} ${p.subtitle} ${p.author?.username || ''}`.toLowerCase().includes(designSearch.toLowerCase()))
    : desSorted;

  // Computed
  const isImmersiveTab = activeTab === "cognitive" || activeTab === "design";
  const tabPosts = activeTab === "featured" ? featuredPosts : forYouPosts;
  const visibleTabPosts = tabPosts.slice(0, visibleFeedCount);
  const hasMoreTabPosts = tabPosts.length > visibleFeedCount;
  const cogStats = {
    articles: visibleCognitivePosts.length,
    totalClaps: visibleCognitivePosts.reduce((s, p) => s + (p.claps_count || 0), 0),
    avgRead: visibleCognitivePosts.length ? Math.round(visibleCognitivePosts.reduce((s, p) => s + parseInt(p.read_time || '0'), 0) / visibleCognitivePosts.length) : 0,
  };
  const desStats = {
    articles: visibleDesignPosts.length,
    totalClaps: visibleDesignPosts.reduce((s, p) => s + (p.claps_count || 0), 0),
    avgRead: visibleDesignPosts.length ? Math.round(visibleDesignPosts.reduce((s, p) => s + parseInt(p.read_time || '0'), 0) / visibleDesignPosts.length) : 0,
  };
  const todayPalette = COLOR_PALETTES[new Date().getDay() % COLOR_PALETTES.length];
  const todayTip = DESIGN_TIPS[new Date().getDay() % DESIGN_TIPS.length];
  const readingProgress = bookmarkedPostIds.size;

  useEffect(() => {
    if (activeTab !== "for-you" && activeTab !== "featured") return;
    if (!hasMoreTabPosts) return;
    if (isFeedLoading) return;

    const sentinel = feedEndRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.unobserve(sentinel);
          setIsFeedLoading(true);
          feedLoadTimeoutRef.current = window.setTimeout(() => {
            setVisibleFeedCount(prev => Math.min(prev + FEED_PAGE_SIZE, tabPosts.length));
            setIsFeedLoading(false);
          }, 380);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, hasMoreTabPosts, isFeedLoading, tabPosts.length]);

  // ─── SHARED UI: Action buttons for post cards ────────────────────────────────
  const PostActions = ({ post }: { post: any }) => (
    <div className="flex items-center gap-1 flex-wrap">
      <button onClick={() => navigate(`/blog/${post.id}`)} className="px-3 py-1.5 rounded-full bg-universe-foreground text-universe-900 text-xs font-medium hover:bg-universe-highlight hover:text-white transition-colors">
        Read Now
      </button>
      <button onClick={() => toggleLike(post.id)} className={cn("p-1.5 rounded-full border transition-colors", likedPostIds.has(post.id) ? "border-rose-500/40 text-rose-400 bg-rose-500/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800")}>
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => toggleBookmark(post.id)} className={cn("p-1.5 rounded-full border transition-colors", bookmarkedPostIds.has(post.id) ? "border-universe-highlight text-universe-highlight bg-universe-highlight/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800")}>
        <Bookmark className={cn("w-3.5 h-3.5", bookmarkedPostIds.has(post.id) && "fill-current")} />
      </button>
      <button onClick={() => togglePin(post.id)} className={cn("p-1.5 rounded-full border transition-colors", pinnedPostIds.has(post.id) ? "border-amber-500/40 text-amber-400 bg-amber-500/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800")}>
        <Pin className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => sharePost(post)} className="p-1.5 rounded-full border border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors">
        <Share2 className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => copyLink(post.id)} className="p-1.5 rounded-full border border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors">
        {copiedId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  // ─── SHARED UI: Stats Bar ────────────────────────────────────────────────────
  const StatsBar = ({ stats }: { stats: { articles: number; totalClaps: number; avgRead: number } }) => (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: BookOpen, label: "Articles", value: stats.articles },
        { icon: TrendingUp, label: "Total Engagement", value: `${(stats.totalClaps / 1000).toFixed(1)}K` },
        { icon: Clock3, label: "Avg Read", value: `${stats.avgRead} min` },
      ].map((s) => (
        <div key={s.label} className="rounded-xl border border-universe-700 bg-universe-800/50 p-4 text-center">
          <s.icon className="w-5 h-5 mx-auto mb-2 text-universe-highlight" />
          <div className="text-lg font-bold text-universe-foreground">{s.value}</div>
          <div className="text-xs text-universe-muted mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );

  // ─── RENDER: Article List (For You / Featured) ──────────────────────────────
  const renderArticleList = (
    posts: any[],
    hasMore: boolean
  ) => (
    <div className="space-y-0">
      {/* Quick Reading Stats Bar */}
      <div className="flex items-center gap-4 mb-6 p-3 rounded-xl bg-universe-800/30 border border-universe-700">
        {quickStatsItems.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-universe-muted">
            <s.icon className="w-3.5 h-3.5 text-universe-highlight" />
            <span className="font-medium text-universe-foreground">{s.value}</span>
            <span>{s.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowReadHistory(!showReadHistory)} className={cn("p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1", showReadHistory ? "border-universe-highlight text-universe-highlight" : "border-universe-700 text-universe-muted hover:text-universe-foreground")}>
            <History className="w-3.5 h-3.5" /> History
          </button>
        </div>
      </div>

      {/* Reading History Panel */}
      <AnimatePresence>
        {showReadHistory && readPostIds.size > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 rounded-xl border border-universe-700 bg-universe-800/30 p-4">
            <h4 className="text-sm font-medium text-universe-foreground mb-3 flex items-center gap-2"><History className="w-4 h-4 text-universe-highlight" /> Recently Read</h4>
            <div className="space-y-2">
              {posts.filter(p => readPostIds.has(p.id)).slice(0, 5).map(p => (
                <Link key={`hist-${p.id}`} to={`/blog/${p.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-universe-800/50 transition-colors group">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-universe-foreground group-hover:text-universe-highlight transition-colors line-clamp-1 flex-1">{p.title}</span>
                  <span className="text-xs text-universe-muted flex-shrink-0">{p.read_time}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {posts.length === 0 ? (
        <div className="py-14 text-center text-universe-muted">No posts available right now.</div>
      ) : (
        posts.map((post, index) => (
          <div key={`${post.id}-${index}`} className="group relative border-b border-universe-700 py-7 md:py-8 last:border-0">
            <div className="flex items-center gap-2 mb-4 text-sm text-universe-muted">
              <img src={post.author?.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" loading="lazy" />
              <div className="w-5 h-5 rounded-sm bg-universe-foreground text-universe-900 text-[10px] flex items-center justify-center font-semibold">
                {post.author?.username?.slice(0, 2).toUpperCase() || '??'}
              </div>
              <span>by <span className="text-universe-foreground">{post.author?.full_name || post.author?.username || 'Unknown'}</span></span>
              {/* Follow/Unfollow Author */}
              <button onClick={() => post.author && toggleFollow(post.author.id)} className={cn("ml-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors inline-flex items-center gap-1", post.author && followingIds.has(post.author.id) ? "border-universe-highlight/40 text-universe-highlight" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:border-universe-foreground")}>
                  {post.author && followingIds.has(post.author.id) ? <><UserMinus className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
                </button>
              {/* Read badge */}
              {readPostIds.has(post.id) && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30 text-emerald-400 bg-emerald-400/10 inline-flex items-center gap-1"><Check className="w-3 h-3" /> Read</span>
              )}
            </div>
            <div className="flex justify-between gap-6 md:gap-8">
              <div className="flex-1">
                <Link to={`/blog/${post.id}`} onClick={() => markAsRead(post.id)} className="block group-hover:opacity-90 transition-opacity">
                  <h2 className="text-[1.1rem] md:text-[1.35rem] leading-[1.2] font-serif font-extrabold mb-2 text-universe-foreground">{post.title}</h2>
                  <p className="font-sans text-universe-muted/90 line-clamp-2 mb-5 text-xs md:text-sm leading-[1.3] hidden md:block">{post.subtitle}</p>
                </Link>
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-3 text-xs md:text-sm text-universe-muted">
                    <span className="inline-flex items-center text-amber-500"><Star className="w-4 h-4 fill-amber-500 stroke-amber-500" /></span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span>{(post.claps_count / 1000).toFixed(1)}K</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.comments_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Like */}
                    <button onClick={() => toggleLike(post.id)} className={cn("p-1.5 transition-colors rounded-full", likedPostIds.has(post.id) ? "text-rose-400" : "text-universe-muted hover:text-universe-foreground")}>
                      <Heart className={cn("w-4 h-4", likedPostIds.has(post.id) && "fill-current")} />
                    </button>
                    {/* TTS */}
                    <button onClick={() => handleTTS(post)} className={cn("p-1.5 transition-colors rounded-full", ttsPlaying === post.id ? "text-universe-highlight" : "text-universe-muted hover:text-universe-foreground")} title="Listen to summary">
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {/* Save */}
                    <button onClick={() => toggleBookmark(post.id)} className={cn("p-1.5 transition-colors rounded-full", bookmarkedPostIds.has(post.id) ? "text-universe-highlight" : "text-universe-muted hover:text-universe-foreground")}>
                      <Bookmark className={cn("w-4 h-4", bookmarkedPostIds.has(post.id) && "fill-current")} />
                    </button>
                    {/* Share */}
                    <button onClick={() => sharePost(post)} className="p-1.5 text-universe-muted hover:text-universe-foreground transition-colors rounded-full">
                      <Share2 className="w-4 h-4" />
                    </button>
                    {/* Copy Link */}
                    <button onClick={() => copyLink(post.id)} className="p-1.5 text-universe-muted hover:text-universe-foreground transition-colors rounded-full">
                      {copiedId === post.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {/* Article Menu */}
                    <div className="relative" ref={showArticleMenu === post.id ? articleMenuRef : undefined}>
                      <button onClick={() => setShowArticleMenu(showArticleMenu === post.id ? null : post.id)} className="p-1.5 text-universe-muted hover:text-universe-foreground transition-colors rounded-full">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {showArticleMenu === post.id && (
                        <div className="absolute right-0 mt-1 w-52 rounded-lg border border-universe-700 bg-universe-900 shadow-xl z-50 py-1">
                          <button onClick={() => { writeAboutTopic(post.title); setShowArticleMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-universe-foreground hover:bg-universe-800 transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-universe-muted" /> Write about this topic
                          </button>
                          <button onClick={() => { togglePin(post.id); setShowArticleMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-universe-foreground hover:bg-universe-800 transition-colors">
                            <Pin className="w-3.5 h-3.5 text-universe-muted" /> {pinnedPostIds.has(post.id) ? "Unpin" : "Pin to top"}
                          </button>
                          <button onClick={() => { markAsRead(post.id); setShowArticleMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-universe-foreground hover:bg-universe-800 transition-colors">
                            <Check className="w-3.5 h-3.5 text-universe-muted" /> Mark as read
                          </button>
                          {post.tags?.map(t => (
                            <button key={t} onClick={() => { toggleMuteTopic(t); setShowArticleMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-universe-foreground hover:bg-universe-800 transition-colors">
                              <AlertCircle className="w-3.5 h-3.5 text-universe-muted" /> {mutedTopics.has(t) ? `Unmute "${t}"` : `Mute "${t}"`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[145px] h-[96px] md:w-[155px] md:h-[102px] flex-shrink-0 bg-universe-800 rounded-sm overflow-hidden mt-1">
                <img src={post.cover_image} className="w-full h-full object-cover" alt="" loading="lazy" />
              </div>
            </div>
          </div>
        ))
      )}

      <div ref={feedEndRef} className="h-2" />
      <div className="py-6 flex items-center justify-center min-h-[56px]">
        {isFeedLoading && hasMore && (
          <div className="inline-flex items-center gap-2 text-xs text-universe-muted">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-universe-700 border-t-universe-foreground animate-spin" />
            Loading more stories...
          </div>
        )}
      </div>
    </div>
  );

  // ─── RENDER: Cognitive Science (Full Page) ──────────────────────────────────
  const currentChallenge = DAILY_CHALLENGES[currentChallengeIdx];
  const currentFlashcard = COGNITIVE_BIASES_DECK[flashcardIdx];
  const todayBrainFact = BRAIN_FACTS[new Date().getDay() % BRAIN_FACTS.length];
  const focusMins = Math.floor(focusTimerSeconds / 60);
  const focusSecs = focusTimerSeconds % 60;

  // Focus timer effect
  useEffect(() => {
    if (!focusTimerActive || focusTimerSeconds <= 0) return;
    const interval = setInterval(() => setFocusTimerSeconds(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [focusTimerActive, focusTimerSeconds]);

  const renderImmersiveCognitive = () => (
    <div className="space-y-12 md:space-y-14">

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden rounded-3xl border border-universe-700 bg-gradient-to-br from-universe-800 via-universe-900 to-universe-800">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/6 blur-3xl" />
        <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-universe-700 bg-universe-800/60 backdrop-blur-sm px-4 py-1.5 text-sm text-universe-muted mb-5">
                <BrainCircuit className="w-4 h-4 text-universe-highlight" />
                <span>Cognitive Science Lab</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs">Live</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-universe-foreground leading-[1.1] tracking-tight">
                Train your mind.<br />
                <span className="text-universe-highlight">Think sharper.</span>
              </h2>
              <p className="text-universe-muted mt-4 text-lg leading-relaxed max-w-xl">Deep reads, mental models, bias training, and interactive tools to upgrade how you think, decide, and create.</p>
            </div>
            {/* Quick Stats Sidebar */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-3 w-full md:w-auto">
              {[
                { icon: BookOpen, val: cogStats.articles, label: "Articles" },
                { icon: TrendingUp, val: `${(cogStats.totalClaps / 1000).toFixed(1)}K`, label: "Engagement" },
                { icon: Clock3, val: `${cogStats.avgRead}m`, label: "Avg Read" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 rounded-xl border border-universe-700/50 bg-universe-800/40 backdrop-blur-sm px-4 py-3 min-w-0">
                  <s.icon className="w-4 h-4 text-universe-highlight" />
                  <div className="min-w-0">
                    <div className="text-base font-bold text-universe-foreground leading-tight">{s.val}</div>
                    <div className="text-[10px] text-universe-muted">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-universe-700 bg-universe-800/30 p-1.5 md:p-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: "cog-sec-dashboard", label: "Dashboard" },
            { id: "cog-sec-explore", label: "Explore" },
            { id: "cog-sec-challenge", label: "Challenge" },
            { id: "cog-sec-concepts", label: "Concepts" },
            { id: "cog-sec-toolkit", label: "Toolkit" },
            { id: "cog-sec-resources", label: "Resources" },
          ].map((item) => (
            <a key={item.id} href={`#${item.id}`} className="px-3.5 py-2 rounded-xl text-xs font-medium border border-universe-700 text-universe-muted hover:text-universe-foreground hover:border-universe-highlight/40 hover:bg-universe-800/60 transition-colors">
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* ══════════ ① YOUR DASHBOARD ══════════ */}
      <div id="cog-sec-dashboard" className="flex items-center gap-4 scroll-mt-20 pt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-universe-highlight/20 to-universe-highlight/5 border border-universe-highlight/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-universe-highlight">①</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-serif font-bold text-universe-foreground">Your Dashboard</h3>
          <p className="text-xs text-universe-muted">See your reading stats and today's brain fact</p>
        </div>
        <div className="hidden md:block flex-shrink-0 h-px w-24 bg-gradient-to-r from-universe-700 to-transparent" />
      </div>

      {/* ═══ BRAIN FACT + READING PROGRESS ROW ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
        {/* Brain Fact */}
        <AnimatePresence>
          {showBrainFact && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="rounded-2xl border border-universe-700 bg-gradient-to-r from-violet-500/5 via-transparent to-transparent p-5 md:p-6 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-violet-400 font-medium mb-1">Brain Fact of the Day</p>
                <p className="text-sm text-universe-foreground leading-relaxed">{todayBrainFact}</p>
              </div>
              <button onClick={() => setShowBrainFact(false)} className="p-1 text-universe-muted hover:text-universe-foreground flex-shrink-0"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>
        {!showBrainFact && <div />}

        {/* Reading Goal Compact */}
        <div className="rounded-2xl border border-universe-700 bg-universe-800/30 p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-universe-foreground flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Reading Goal</span>
            <span className="text-xs text-universe-muted">{readingProgress}/{readingGoal}</span>
          </div>
          <div className="w-full h-3 bg-universe-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((readingProgress / readingGoal) * 100, 100)}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-universe-highlight via-violet-400 to-amber-400 rounded-full" />
          </div>
          {readingProgress >= readingGoal && <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Goal reached!</p>}
        </div>
      </div>

      {/* ══════════ ② EXPLORE & LEARN ══════════ */}
      <div id="cog-sec-explore" className="flex items-center gap-4 scroll-mt-20 pt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-blue-400">②</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-serif font-bold text-universe-foreground">Explore & Learn</h3>
          <p className="text-xs text-universe-muted">Browse articles, study mental models, or practice bias recognition</p>
        </div>
        <div className="hidden md:block flex-shrink-0 h-px w-24 bg-gradient-to-r from-universe-700 to-transparent" />
      </div>

      {/* ═══ SECTION TABS ═══ */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-universe-800/40 border border-universe-700 overflow-x-auto no-scrollbar">
        {(["articles", "models", "biases"] as const).map(t => (
          <button key={t} onClick={() => setCognitiveTab(t)} className={cn("flex-1 min-w-[145px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize", cognitiveTab === t ? "bg-universe-highlight text-white shadow-lg shadow-universe-highlight/20" : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800/50")}>
            {t === "articles" ? "📚 Articles" : t === "models" ? "🧠 Mental Models" : "⚡ Bias Training"}
          </button>
        ))}
      </div>

      {/* ═══ ARTICLES TAB ═══ */}
      {cognitiveTab === "articles" && (
        <>
          {/* Search + Controls */}
          <div className="rounded-2xl border border-universe-700 bg-universe-900/80 backdrop-blur-sm p-5 md:p-6 space-y-4 md:space-y-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-universe-muted" />
              <input value={cognitiveSearch} onChange={e => setCognitiveSearch(e.target.value)} placeholder="Search articles, authors, topics..." className="w-full bg-universe-800/50 border border-universe-700 rounded-xl py-3 pl-11 pr-4 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight focus:ring-1 focus:ring-universe-highlight/20 transition-all" />
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {[{ id: "all", label: "All Topics", icon: "🌐" }, { id: "student", label: "Learning", icon: "📖" }, { id: "applied", label: "Applied", icon: "⚙️" }, { id: "debate", label: "Philosophy", icon: "💭" }].map(f => (
                  <button key={f.id} onClick={() => setCognitiveTopic(f.id)} className={cn("px-3.5 py-2 rounded-xl text-xs font-medium border transition-all", cognitiveTopic === f.id ? "border-universe-highlight text-universe-highlight bg-universe-highlight/10 shadow-sm shadow-universe-highlight/10" : "border-universe-700 text-universe-foreground hover:bg-universe-800 hover:border-universe-600")}>
                    <span className="mr-1.5">{f.icon}</span>{f.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[{ id: "popular", label: "🔥 Popular" }, { id: "new", label: "✨ Latest" }, { id: "quick", label: "⚡ Quick" }, { id: "deep", label: "🔬 Deep" }].map(s => (
                  <button key={s.id} onClick={() => setCognitiveSort(s.id)} className={cn("px-3 py-1.5 rounded-xl text-xs border transition-all", cognitiveSort === s.id ? "border-universe-highlight text-universe-highlight bg-universe-highlight/10" : "border-universe-700 text-universe-foreground hover:bg-universe-800")}>{s.label}</button>
                ))}
                <span className="text-[10px] text-universe-muted px-2 py-1 rounded-lg border border-universe-700 bg-universe-800/40">Card view</span>
              </div>
            </div>
          </div>

          {/* Article Cards */}
          {visibleCognitivePosts.length === 0 ? (
            <div className="py-20 text-center">
              <BrainCircuit className="w-12 h-12 text-universe-700 mx-auto mb-4" />
              <p className="text-universe-muted text-lg">No matching articles found.</p>
              <p className="text-universe-muted text-sm mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : cognitiveLayout === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleCognitivePosts.map((post, idx) => {
                const diff = getDifficulty(post.read_time);
                return (
                  <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="group rounded-2xl border border-universe-700 bg-universe-800/30 overflow-hidden hover:border-universe-highlight/40 hover:shadow-lg hover:shadow-universe-highlight/5 transition-all duration-300 flex flex-col">
                    <Link to={`/blog/${post.id}`} onClick={() => markAsRead(post.id)} className="block h-40 md:h-44 overflow-hidden relative">
                      <img src={post.cover_image || ''} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-universe-900/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-sm", diff.cls)}>{diff.label}</span>
                        <div className="flex items-center gap-2">
                          {pinnedPostIds.has(post.id) && <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 backdrop-blur-sm"><Pin className="w-3 h-3" /></span>}
                          {readPostIds.has(post.id) && <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-medium backdrop-blur-sm">✓ Read</span>}
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 md:p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <img src={post.author?.avatar_url || ''} className="w-6 h-6 rounded-full ring-1 ring-universe-700" alt="" />
                          <div>
                            <span className="text-xs font-medium text-universe-foreground">{post.author?.username || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-universe-muted">
                          <span className="inline-flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" />{(post.claps_count / 1000).toFixed(1)}K</span>
                          <span>{post.read_time || 5} min</span>
                        </div>
                      </div>
                      <Link to={`/blog/${post.id}`} onClick={() => markAsRead(post.id)}>
                        <h3 className="text-base md:text-[1.05rem] font-serif font-bold text-universe-foreground leading-snug mb-1.5 line-clamp-2 group-hover:text-universe-highlight transition-colors">{post.title}</h3>
                      </Link>
                      <p className="font-sans text-xs text-universe-muted/90 line-clamp-2 mb-3 leading-relaxed">{post.subtitle}</p>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags?.slice(0, 2).map(t => <span key={t} className="px-1.5 py-0.5 rounded-md bg-universe-800/80 text-[10px] text-universe-muted border border-universe-700/50">{t}</span>)}
                      </div>
                      <div className="mt-auto space-y-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button onClick={() => navigate(`/blog/${post.id}`)} className="px-3.5 py-1.5 rounded-xl bg-universe-foreground text-universe-900 text-[11px] font-semibold hover:bg-universe-highlight hover:text-white transition-all shadow-sm">Read Now</button>
                          <button onClick={() => handleTTS(post)} className={cn("p-1.5 rounded-lg border transition-all", ttsPlaying === post.id ? "border-universe-highlight text-universe-highlight bg-universe-highlight/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800")} title="Listen"><Volume2 className="w-3 h-3" /></button>
                          <button onClick={() => toggleLike(post.id)} className={cn("p-1.5 rounded-lg border transition-all", likedPostIds.has(post.id) ? "border-rose-500/40 text-rose-400 bg-rose-500/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800")}><Heart className={cn("w-3 h-3", likedPostIds.has(post.id) && "fill-current")} /></button>
                          <button onClick={() => toggleBookmark(post.id)} className={cn("p-1.5 rounded-lg border transition-all", bookmarkedPostIds.has(post.id) ? "border-universe-highlight text-universe-highlight bg-universe-highlight/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800")}><Bookmark className={cn("w-3 h-3", bookmarkedPostIds.has(post.id) && "fill-current")} /></button>
                          <button onClick={() => togglePin(post.id)} className={cn("p-1.5 rounded-lg border transition-all", pinnedPostIds.has(post.id) ? "border-amber-500/40 text-amber-400 bg-amber-500/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800")}><Pin className="w-3 h-3" /></button>
                          <button onClick={() => sharePost(post)} className="p-1.5 rounded-lg border border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-all"><Share2 className="w-3 h-3" /></button>
                          <button onClick={() => copyLink(post.id)} className="p-1.5 rounded-lg border border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-all">{copiedId === post.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}</button>
                        </div>
                        {/* Quick Note */}
                        <button onClick={() => setShowNoteFor(showNoteFor === post.id ? null : post.id)} className="text-[10px] text-universe-muted hover:text-universe-foreground transition-colors flex items-center gap-1">
                          <PenSquare className="w-3 h-3" /> {showNoteFor === post.id ? "Hide note" : "Quick note"}
                        </button>
                        <AnimatePresence>
                          {showNoteFor === post.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                              <textarea value={noteTexts[post.id] || ""} onChange={e => setNoteTexts(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Your thoughts..." className="w-full bg-universe-800/60 border border-universe-700 rounded-xl p-3 text-xs text-universe-foreground placeholder-universe-muted resize-none h-20 focus:outline-none focus:border-universe-highlight transition-all" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleCognitivePosts.map((post, idx) => {
                const diff = getDifficulty(post.read_time);
                return (
                  <motion.article key={post.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="group rounded-2xl border border-universe-700 bg-universe-800/20 p-3.5 md:p-4 hover:border-universe-highlight/40 hover:bg-universe-800/40 transition-all">
                    <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4">
                      <Link to={`/blog/${post.id}`} onClick={() => markAsRead(post.id)} className="w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img src={post.cover_image || ''} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {readPostIds.has(post.id) && <span className="absolute top-2 right-2 p-1 rounded-md bg-emerald-500/20 text-emerald-400"><Check className="w-3 h-3" /></span>}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold border", diff.cls)}>{diff.label}</span>
                          <span className="text-xs text-universe-muted">{post.read_time || 5} min</span>
                          <span className="text-xs text-universe-muted">·</span>
                          <span className="text-xs text-universe-muted">{new Date(post.created_at).toLocaleDateString()}</span>
                          <span className="text-xs text-universe-muted inline-flex items-center gap-1 ml-auto"><Flame className="w-3 h-3 text-orange-400" />{(post.claps_count / 1000).toFixed(1)}K</span>
                        </div>
                        <Link to={`/blog/${post.id}`} onClick={() => markAsRead(post.id)}><h3 className="text-[13px] font-bold text-universe-foreground line-clamp-1 hover:text-universe-highlight transition-colors">{post.title}</h3></Link>
                        <p className="font-sans text-xs text-universe-muted/90 line-clamp-1 mt-1">{post.subtitle}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <button onClick={() => navigate(`/blog/${post.id}`)} className="px-3 py-1.5 rounded-lg bg-universe-foreground text-universe-900 text-[10px] font-semibold hover:bg-universe-highlight hover:text-white transition-all">Read</button>
                          <button onClick={() => toggleLike(post.id)} className={cn("p-1.5 rounded-lg border transition-all", likedPostIds.has(post.id) ? "border-rose-500/40 text-rose-400" : "border-universe-700 text-universe-muted")}><Heart className={cn("w-3 h-3", likedPostIds.has(post.id) && "fill-current")} /></button>
                          <button onClick={() => toggleBookmark(post.id)} className={cn("p-1.5 rounded-lg border transition-all", bookmarkedPostIds.has(post.id) ? "border-universe-highlight text-universe-highlight" : "border-universe-700 text-universe-muted")}><Bookmark className={cn("w-3 h-3", bookmarkedPostIds.has(post.id) && "fill-current")} /></button>
                          <button onClick={() => handleTTS(post)} className={cn("p-1.5 rounded-lg border transition-all", ttsPlaying === post.id ? "border-universe-highlight text-universe-highlight" : "border-universe-700 text-universe-muted")}><Volume2 className="w-3 h-3" /></button>
                          <button onClick={() => sharePost(post)} className="p-1.5 rounded-lg border border-universe-700 text-universe-muted hover:text-universe-foreground transition-all"><Share2 className="w-3 h-3" /></button>
                          <button onClick={() => copyLink(post.id)} className="p-1.5 rounded-lg border border-universe-700 text-universe-muted hover:text-universe-foreground transition-all">{copiedId === post.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}</button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══ MENTAL MODELS TAB ═══ */}
      {cognitiveTab === "models" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THINKING_MODELS.map(m => (
              <motion.div key={m.name} layout className={cn("rounded-2xl border bg-universe-800/30 overflow-hidden transition-all cursor-pointer", expandedModel === m.name ? "border-universe-highlight/50 bg-universe-800/50" : "border-universe-700 hover:border-universe-highlight/30")} onClick={() => setExpandedModel(expandedModel === m.name ? null : m.name)}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl border border-universe-700/50 bg-universe-900/50", m.color)}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-universe-foreground">{m.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-universe-800 text-[10px] text-universe-muted border border-universe-700">{m.use}</span>
                      </div>
                      <p className="text-sm text-universe-muted mt-2 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedModel === m.name && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-universe-700">
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); writeAboutTopic(`Mental Model: ${m.name} — ${m.desc}`); }} className="px-3 py-1.5 rounded-lg bg-universe-foreground text-universe-900 text-xs font-medium hover:bg-universe-highlight hover:text-white transition-all">Write about this</button>
                          <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${m.name}: ${m.desc}`); setCopiedId(`model-${m.name}`); setTimeout(() => setCopiedId(null), 1500); }} className="px-3 py-1.5 rounded-lg border border-universe-700 text-xs text-universe-foreground hover:bg-universe-800 transition-all">{copiedId === `model-${m.name}` ? "Copied!" : "Copy"}</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ BIAS TRAINING TAB ═══ */}
      {cognitiveTab === "biases" && (
        <div className="space-y-6">
          {/* Flashcard */}
          <div className="rounded-3xl border border-universe-700 bg-gradient-to-br from-universe-800/60 to-universe-900 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-universe-muted">{flashcardIdx + 1} / {COGNITIVE_BIASES_DECK.length}</span>
                <span className="px-3 py-1 rounded-full bg-universe-800 text-xs text-universe-muted border border-universe-700">Flashcard Mode</span>
              </div>
              <div onClick={() => setFlashcardFlipped(!flashcardFlipped)} className="cursor-pointer min-h-[200px] flex flex-col justify-center">
                {!flashcardFlipped ? (
                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-universe-foreground mb-3">{currentFlashcard.bias}</h3>
                    <p className="text-base text-universe-muted max-w-lg mx-auto">{ currentFlashcard.definition}</p>
                    <p className="text-xs text-universe-highlight mt-6 animate-pulse">Tap to reveal example & debiasing strategy →</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, rotateY: 5 }} animate={{ opacity: 1, rotateY: 0 }} className="space-y-4">
                    <div className="rounded-xl bg-universe-800/50 border border-universe-700 p-4">
                      <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-1">Real-World Example</p>
                      <p className="text-sm text-universe-foreground">{currentFlashcard.example}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                      <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">How to Debias</p>
                      <p className="text-sm text-universe-foreground">{currentFlashcard.debiasing}</p>
                    </div>
                    <p className="text-xs text-universe-muted text-center">Tap to flip back</p>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button onClick={prevFlashcard} className="px-4 py-2 rounded-xl border border-universe-700 text-sm text-universe-foreground hover:bg-universe-800 transition-all">← Previous</button>
                <button onClick={nextFlashcard} className="px-4 py-2 rounded-xl bg-universe-foreground text-universe-900 text-sm font-medium hover:bg-universe-highlight hover:text-white transition-all">Next →</button>
              </div>
            </div>
            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5 pb-5">
              {COGNITIVE_BIASES_DECK.map((_, i) => (
                <button key={i} onClick={() => { setFlashcardFlipped(false); setFlashcardIdx(i); }} className={cn("w-2 h-2 rounded-full transition-all", i === flashcardIdx ? "bg-universe-highlight w-6" : "bg-universe-700 hover:bg-universe-600")} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ ③ DAILY CHALLENGE ══════════ */}
      <div id="cog-sec-challenge" className="flex items-center gap-4 scroll-mt-20 pt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-amber-400">③</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-serif font-bold text-universe-foreground">Daily Challenge</h3>
          <p className="text-xs text-universe-muted">Test your cognitive science knowledge with a quick quiz</p>
        </div>
        <div className="hidden md:block flex-shrink-0 h-px w-24 bg-gradient-to-r from-universe-700 to-transparent" />
      </div>

      {/* ═══ DAILY BRAIN CHALLENGE ═══ */}
      <div className="rounded-3xl border border-universe-700 bg-gradient-to-br from-amber-500/5 via-universe-900 to-violet-500/5 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-universe-foreground"><Trophy className="w-5 h-5 text-amber-400" /> Brain Challenge</div>
          <span className="px-2.5 py-1 rounded-lg bg-universe-800 text-[10px] text-universe-muted border border-universe-700">{currentChallenge.category}</span>
        </div>
        <p className="text-lg md:text-xl text-universe-foreground font-serif font-bold mb-5 leading-snug">{currentChallenge.question}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentChallenge.options.map((opt, i) => (
            <button key={i} onClick={() => handleChallengeAnswer(i)} disabled={showChallengeResult} className={cn(
              "px-5 py-3.5 rounded-xl border text-sm text-left transition-all font-medium",
              showChallengeResult && i === currentChallenge.correct ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10" :
              showChallengeResult && challengeAnswer === i ? "border-rose-500 bg-rose-500/10 text-rose-400" :
              challengeAnswer === i ? "border-universe-highlight bg-universe-highlight/10 text-universe-highlight" :
              "border-universe-700 text-universe-foreground hover:bg-universe-800 hover:border-universe-600"
            )}>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-universe-800 text-[10px] mr-2.5 border border-universe-700">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {showChallengeResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 p-5 rounded-2xl bg-universe-800/50 border border-universe-700">
              <p className={cn("text-sm font-bold mb-2", challengeAnswer === currentChallenge.correct ? "text-emerald-400" : "text-rose-400")}>
                {challengeAnswer === currentChallenge.correct ? "🎉 Correct!" : "❌ Not quite!"}
              </p>
              <p className="text-sm text-universe-muted leading-relaxed">{currentChallenge.explanation}</p>
              <button onClick={nextChallenge} className="mt-4 px-4 py-2 rounded-xl bg-universe-foreground text-universe-900 text-xs font-medium hover:bg-universe-highlight hover:text-white transition-all">Next Challenge →</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════ ④ CORE CONCEPTS ══════════ */}
      <div id="cog-sec-concepts" className="flex items-center gap-4 scroll-mt-20 pt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-emerald-400">④</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-serif font-bold text-universe-foreground">Core Concepts</h3>
          <p className="text-xs text-universe-muted">Foundational cognitive science concepts — tap to learn more</p>
        </div>
        <div className="hidden md:block flex-shrink-0 h-px w-24 bg-gradient-to-r from-universe-700 to-transparent" />
      </div>

      {/* ═══ KEY CONCEPTS (Expandable) ═══ */}
      <div className="rounded-3xl border border-universe-700 bg-universe-900/80 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-serif font-bold text-universe-foreground flex items-center gap-2"><GraduationCap className="w-5 h-5 text-universe-highlight" /> Core Concepts</h3>
          <span className="text-xs text-universe-muted">{learnedConcepts.size}/{KEY_CONCEPTS.length} learned</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KEY_CONCEPTS.map(c => (
            <div key={c.label} onClick={() => setExpandedConcept(expandedConcept === c.label ? null : c.label)} className={cn("rounded-xl border bg-universe-800/30 p-4 transition-all cursor-pointer", expandedConcept === c.label ? "border-universe-highlight/50 bg-universe-800/60" : learnedConcepts.has(c.label) ? "border-emerald-500/30 hover:border-emerald-500/40" : "border-universe-700 hover:border-universe-highlight/30")}>
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg border relative", learnedConcepts.has(c.label) ? "bg-emerald-500/10 border-emerald-500/20" : "bg-universe-highlight/10 border-universe-highlight/20")}>
                  <c.icon className={cn("w-4 h-4", learnedConcepts.has(c.label) ? "text-emerald-400" : "text-universe-highlight")} />
                  {learnedConcepts.has(c.label) && <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-universe-foreground">{c.label}</h4>
                  <p className="text-xs text-universe-muted mt-1">{c.desc}</p>
                </div>
              </div>
              <AnimatePresence>
                {expandedConcept === c.label && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 pt-3 border-t border-universe-700 space-y-2">
                    <p className="text-xs text-universe-highlight/80 leading-relaxed">💡 {c.deeper}</p>
                    <button onClick={(e) => { e.stopPropagation(); setLearnedConcepts(prev => { const n = new Set(prev); n.has(c.label) ? n.delete(c.label) : n.add(c.label); return n; }); }} className={cn("text-[10px] px-2.5 py-1 rounded-lg border transition-all inline-flex items-center gap-1", learnedConcepts.has(c.label) ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground")}>
                      <Check className="w-3 h-3" /> {learnedConcepts.has(c.label) ? "Learned ✓" : "Mark as learned"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ ⑤ YOUR TOOLKIT ══════════ */}
      <div id="cog-sec-toolkit" className="flex items-center gap-4 scroll-mt-20 pt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-cyan-400">⑤</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-serif font-bold text-universe-foreground">Your Toolkit</h3>
          <p className="text-xs text-universe-muted">Focus timer for deep reading & thought journal for capturing insights</p>
        </div>
        <div className="hidden md:block flex-shrink-0 h-px w-24 bg-gradient-to-r from-universe-700 to-transparent" />
      </div>

      {/* ═══ FOCUS TIMER ═══ */}
      <div className="rounded-3xl border border-universe-700 bg-gradient-to-r from-universe-800/50 to-universe-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-universe-foreground flex items-center gap-2"><Timer className="w-5 h-5 text-universe-highlight" /> Focus Timer</h3>
            <p className="text-xs text-universe-muted mt-1">Pomodoro-style reading sessions. Stay focused.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-mono font-bold text-universe-foreground tracking-wider">
              {String(focusMins).padStart(2, "0")}:{String(focusSecs).padStart(2, "0")}
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => { setFocusTimerActive(!focusTimerActive); }} className={cn("px-4 py-2 rounded-xl text-xs font-medium transition-all", focusTimerActive ? "bg-rose-500/10 border border-rose-500/40 text-rose-400 hover:bg-rose-500/20" : "bg-universe-foreground text-universe-900 hover:bg-universe-highlight hover:text-white")}>
                {focusTimerActive ? "Pause" : "Start"}
              </button>
              <button onClick={() => { setFocusTimerActive(false); setFocusTimerSeconds(25 * 60); }} className="px-4 py-1.5 rounded-xl border border-universe-700 text-xs text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-all">Reset</button>
            </div>
          </div>
        </div>
        {/* Quick presets */}
        <div className="flex gap-2 mt-4">
          {[5, 15, 25, 45].map(m => (
            <button key={m} onClick={() => { setFocusTimerActive(false); setFocusTimerSeconds(m * 60); }} className={cn("px-3 py-1.5 rounded-xl border text-xs transition-all", focusTimerSeconds === m * 60 && !focusTimerActive ? "border-universe-highlight text-universe-highlight" : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:bg-universe-800")}>{m}m</button>
          ))}
        </div>
      </div>

      {/* ═══ THOUGHT JOURNAL ═══ */}
      <div className="rounded-3xl border border-universe-700 bg-universe-900/80 p-6">
        <h4 className="text-base font-serif font-bold text-universe-foreground mb-1 flex items-center gap-2"><PenSquare className="w-4 h-4 text-universe-highlight" /> Thought Journal</h4>
        <p className="text-xs text-universe-muted mb-4">Capture insights, questions, and connections as you learn.</p>
        <div className="flex gap-2 mb-3">
          {(["reflection", "question", "insight", "connection"] as const).map(t => (
            <button key={t} onClick={() => setJournalTag(t)} className={cn("px-3 py-1.5 rounded-lg text-xs border capitalize transition-all", journalTag === t ? "border-universe-highlight text-universe-highlight bg-universe-highlight/10" : "border-universe-700 text-universe-muted hover:text-universe-foreground")}>{t}</button>
          ))}
        </div>
        <textarea value={journalText} onChange={e => setJournalText(e.target.value)} placeholder="What did you learn today? What surprised you?" className="w-full bg-universe-800/50 border border-universe-700 rounded-xl p-4 text-sm text-universe-foreground placeholder-universe-muted resize-none h-24 focus:outline-none focus:border-universe-highlight focus:ring-1 focus:ring-universe-highlight/20 transition-all" />
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-universe-muted">{journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"} saved</span>
          <button onClick={() => { if (journalText.trim()) { setJournalEntries(prev => [{ text: journalText, date: new Date().toLocaleDateString(), tag: journalTag }, ...prev]); setJournalText(""); } }} disabled={!journalText.trim()} className={cn("px-4 py-2 rounded-xl text-xs font-medium transition-all", journalText.trim() ? "bg-universe-foreground text-universe-900 hover:bg-universe-highlight hover:text-white" : "bg-universe-800 text-universe-muted cursor-not-allowed")}>Save Entry</button>
        </div>
        <AnimatePresence>
          {journalEntries.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-universe-700 space-y-2 max-h-48 overflow-y-auto">
              {journalEntries.slice(0, 5).map((entry, i) => (
                <div key={i} className="rounded-xl bg-universe-800/30 border border-universe-700/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] border border-universe-700 text-universe-muted capitalize">{entry.tag}</span>
                    <span className="text-[10px] text-universe-muted">{entry.date}</span>
                  </div>
                  <p className="text-xs text-universe-foreground leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════ ⑥ RESOURCES & NEXT STEPS ══════════ */}
      <div id="cog-sec-resources" className="flex items-center gap-4 scroll-mt-20 pt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-rose-400">⑥</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-serif font-bold text-universe-foreground">Resources & Next Steps</h3>
          <p className="text-xs text-universe-muted">External courses, communities, and research to continue learning</p>
        </div>
        <div className="hidden md:block flex-shrink-0 h-px w-24 bg-gradient-to-r from-universe-700 to-transparent" />
      </div>

      {/* ═══ RESOURCES ═══ */}
      <div className="rounded-3xl border border-universe-700 bg-universe-900 overflow-hidden">
        <button onClick={() => setShowCogResources(!showCogResources)} className="w-full flex items-center justify-between p-6 text-left hover:bg-universe-800/30 transition-colors">
          <span className="text-base font-serif font-bold text-universe-foreground flex items-center gap-2"><ExternalLink className="w-5 h-5 text-universe-highlight" /> Learning Resources</span>
          <ChevronDown className={cn("w-5 h-5 text-universe-muted transition-transform", showCogResources && "rotate-180")} />
        </button>
        <AnimatePresence>
          {showCogResources && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {COGNITIVE_RESOURCES.map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-universe-700 bg-universe-800/30 p-4 hover:border-universe-highlight/40 hover:bg-universe-800/50 transition-all group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium text-universe-foreground group-hover:text-universe-highlight transition-colors">{r.name}</span>
                      <ExternalLink className="w-3 h-3 text-universe-muted" />
                    </div>
                    <p className="text-xs text-universe-muted">{r.desc}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ CTA ═══ */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/stories")} className="px-6 py-3 rounded-xl bg-universe-foreground text-universe-900 text-sm font-semibold hover:bg-universe-highlight hover:text-white transition-all shadow-sm">Explore All Stories</button>
        <button onClick={() => navigate("/write")} className="px-6 py-3 rounded-xl border border-universe-700 text-sm font-medium text-universe-foreground hover:bg-universe-800 transition-all">Write Your Research</button>
      </div>
    </div>
  );

  // ─── RENDER: Design (Full Page) ─────────────────────────────────────────────
  const renderImmersiveDesign = () => (
    <div className="space-y-8 md:space-y-10">
      {/* Hero */}
      <div id="design-hero" className="rounded-3xl border border-universe-700 bg-gradient-to-br from-universe-800/70 to-universe-900 p-6 sm:p-8 md:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-universe-700 px-3 py-1 text-sm text-universe-muted mb-4">
          <Palette className="w-4 h-4 text-universe-highlight" /> Design Studio
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-universe-foreground max-w-3xl leading-tight tracking-tight">
          Interface decisions, product craft, and visual systems that actually work.
        </h2>
        <p className="text-universe-muted mt-4 max-w-2xl text-base md:text-lg leading-relaxed">Explore UI critiques, platform design shifts, and practical breakdowns from real products.</p>
      </div>

      <div className="rounded-2xl border border-universe-700 bg-universe-800/30 p-1.5 md:p-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: "design-hero", label: "Overview" },
            { id: "design-stats", label: "Stats" },
            { id: "design-palette", label: "Palette" },
            { id: "design-articles", label: "Articles" },
            { id: "design-challenge", label: "Challenge" },
            { id: "design-resources", label: "Resources" },
          ].map((item) => (
            <a key={item.id} href={`#${item.id}`} className="px-3.5 py-2 rounded-xl text-xs font-medium border border-universe-700 text-universe-muted hover:text-universe-foreground hover:border-universe-highlight/40 hover:bg-universe-800/60 transition-colors">
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div id="design-stats">
        <StatsBar stats={desStats} />
      </div>

      {/* Color Palette of the Day */}
      <div id="design-palette" className="rounded-2xl border border-universe-700 bg-universe-900 p-5 md:p-6">
        <h3 className="text-sm font-medium text-universe-foreground mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-universe-highlight" /> Color Palette of the Day — {todayPalette.name}</h3>
        <div className="flex gap-2 h-14 rounded-xl overflow-hidden">
          {todayPalette.colors.map((c, i) => (
            <button key={i} onClick={() => { navigator.clipboard.writeText(c); setCopiedId(`color-${c}`); setTimeout(() => setCopiedId(null), 1500); }}
              className="flex-1 relative group transition-all hover:flex-[2]" style={{ backgroundColor: c }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: i < 2 ? "#fff" : "#000" }}>
                {copiedId === `color-${c}` ? "Copied!" : c}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-universe-muted mt-2">Click any color to copy its hex code</p>
      </div>

      {/* Design Tip of the Day */}
      <AnimatePresence>
        {showDesignTip && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-universe-700 bg-gradient-to-r from-universe-highlight/5 to-transparent p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-universe-foreground mb-1">Design Tip of the Day</h4>
                  <p className="text-sm text-universe-muted">{todayTip}</p>
                </div>
              </div>
              <button onClick={() => setShowDesignTip(false)} className="p-1 text-universe-muted hover:text-universe-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Controls */}
      <div id="design-articles" className="rounded-2xl border border-universe-700 bg-universe-900 p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-universe-muted" />
          <input value={designSearch} onChange={e => setDesignSearch(e.target.value)} placeholder="Search design articles..." className="w-full bg-universe-800/50 border border-universe-700 rounded-full py-2.5 pl-10 pr-4 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-all" />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {[{ id: "all", label: "All Design" }, { id: "ui", label: "UI / UX" }, { id: "product", label: "Product" }, { id: "case", label: "Case Stories" }].map(f => (
              <button key={f.id} onClick={() => setDesignTopic(f.id)} className={cn("px-3 py-1.5 rounded-full text-xs border transition-colors", designTopic === f.id ? "border-universe-highlight text-universe-highlight bg-universe-highlight/10" : "border-universe-700 text-universe-foreground hover:bg-universe-800")}>{f.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[{ id: "popular", label: "Trending" }, { id: "new", label: "Latest" }].map(s => (
              <button key={s.id} onClick={() => setDesignSort(s.id)} className={cn("px-3 py-1.5 rounded-full text-xs border transition-colors", designSort === s.id ? "border-universe-highlight text-universe-highlight bg-universe-highlight/10" : "border-universe-700 text-universe-foreground hover:bg-universe-800")}>{s.label}</button>
            ))}
            <button onClick={() => setDesignLayout("grid")} className={cn("p-1.5 rounded-lg border transition-colors", designLayout === "grid" ? "border-universe-highlight text-universe-highlight" : "border-universe-700 text-universe-muted")}><LayoutGrid className="w-4 h-4" /></button>
            <span className="text-[10px] text-universe-muted px-2 py-1 rounded-lg border border-universe-700 bg-universe-800/40">3-card grid</span>
          </div>
        </div>
      </div>

      {/* Article Cards */}
      {visibleDesignPosts.length === 0 ? (
        <div className="py-14 text-center text-universe-muted">No matching design articles found.</div>
      ) : designLayout === "editorial" ? (
        <div className="space-y-4">
          {visibleDesignPosts.map((post, index) => (
            <article key={post.id} className={cn("group grid gap-4 md:gap-5 rounded-2xl border border-universe-700 bg-universe-800/30 p-3.5 md:p-4 hover:border-universe-highlight/50 transition-colors", index % 2 === 0 ? "md:grid-cols-[1.2fr_1fr]" : "md:grid-cols-[1fr_1.1fr]")}>
              <Link to={`/blog/${post.id}`} className={cn("overflow-hidden rounded-xl", index % 2 === 0 ? "order-1" : "order-2 md:order-1")}>
                <img src={post.cover_image || ''} alt={post.title} className="w-full h-44 md:h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
              <div className={cn("flex flex-col justify-between", index % 2 === 0 ? "order-2" : "order-1 md:order-2")}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <img src={post.author?.avatar_url || ''} className="w-5 h-5 rounded-full" alt="" />
                    <span className="text-xs text-universe-muted">{post.author?.username || 'Unknown'} · {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {post.tags?.slice(0, 3).map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-universe-800 text-[10px] text-universe-muted border border-universe-700">{t}</span>)}
                  </div>
                  <Link to={`/blog/${post.id}`}><h3 className="text-lg font-serif font-bold text-universe-foreground leading-tight mb-1.5 line-clamp-2 hover:text-universe-highlight transition-colors">{post.title}</h3></Link>
                  <p className="font-sans text-xs text-universe-muted/90 line-clamp-2">{post.subtitle}</p>
                </div>
                <div className="mt-3"><PostActions post={post} /></div>
              </div>
            </article>
          ))}
        </div>
      ) : designLayout === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleDesignPosts.map(post => (
            <article key={post.id} className="rounded-2xl border border-universe-700 bg-universe-800/40 overflow-hidden hover:border-universe-highlight/50 transition-colors flex flex-col">
              <Link to={`/blog/${post.id}`} className="block h-36 overflow-hidden">
                <img src={post.cover_image || ''} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </Link>
              <div className="p-3.5 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.tags?.slice(0, 2).map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-universe-800 text-[10px] text-universe-muted border border-universe-700">{t}</span>)}
                </div>
                <Link to={`/blog/${post.id}`}><h3 className="text-sm font-serif font-bold text-universe-foreground mb-1 line-clamp-2 hover:text-universe-highlight transition-colors">{post.title}</h3></Link>
                <p className="font-sans text-xs text-universe-muted/90 line-clamp-2 mb-3">{post.subtitle}</p>
                <div className="mt-auto"><PostActions post={post} /></div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Compact List */
        <div className="space-y-2.5">
          {visibleDesignPosts.map(post => (
            <article key={post.id} className="group rounded-xl border border-universe-700 bg-universe-800/30 p-3.5 hover:border-universe-highlight/40 transition-colors">
              <div className="flex gap-3">
                <Link to={`/blog/${post.id}`} className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={post.cover_image || ''} alt="" className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-xs text-universe-muted">
                    <span>{post.author?.username || 'Unknown'}</span>
                    <span>·</span>
                    <span>{post.read_time || 5} min</span>
                  </div>
                  <Link to={`/blog/${post.id}`}><h3 className="text-[13px] font-bold text-universe-foreground line-clamp-1 hover:text-universe-highlight transition-colors">{post.title}</h3></Link>
                  <p className="font-sans text-xs text-universe-muted/90 line-clamp-1 mt-0.5">{post.subtitle}</p>
                  <div className="mt-1.5"><PostActions post={post} /></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Design Challenge */}
      <div id="design-challenge" className="rounded-2xl border border-dashed border-universe-highlight/40 bg-universe-highlight/5 p-5 md:p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-universe-foreground mb-2"><Trophy className="w-4 h-4 text-amber-400" /> {DESIGN_CHALLENGE.title}</div>
        <p className="text-sm text-universe-muted mb-3">{DESIGN_CHALLENGE.prompt}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-universe-muted">{DESIGN_CHALLENGE.deadline}</span>
          <button onClick={() => navigate("/write")} className="px-4 py-2 rounded-full bg-universe-foreground text-universe-900 text-xs font-medium hover:bg-universe-highlight hover:text-white transition-colors">Submit Entry</button>
        </div>
      </div>

      {/* Design Resources */}
      <div id="design-resources" className="rounded-2xl border border-universe-700 bg-universe-900 overflow-hidden">
        <button onClick={() => setShowDesignResources(!showDesignResources)} className="w-full flex items-center justify-between p-5 text-left hover:bg-universe-800/30 transition-colors">
          <span className="text-sm font-medium text-universe-foreground flex items-center gap-2"><ExternalLink className="w-4 h-4 text-universe-highlight" /> Design Tools & Resources</span>
          <ChevronDown className={cn("w-4 h-4 text-universe-muted transition-transform", showDesignResources && "rotate-180")} />
        </button>
        <AnimatePresence>
          {showDesignResources && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DESIGN_RESOURCES.map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-universe-700 bg-universe-800/30 p-4 hover:border-universe-highlight/40 transition-colors group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-universe-foreground group-hover:text-universe-highlight transition-colors">{r.name}</span>
                      <ExternalLink className="w-3 h-3 text-universe-muted" />
                    </div>
                    <p className="text-xs text-universe-muted">{r.desc}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/stories")} className="px-5 py-2.5 rounded-full bg-universe-foreground text-universe-900 text-sm font-medium hover:bg-universe-highlight hover:text-white transition-colors">Browse All Design</button>
        <button onClick={() => navigate("/write")} className="px-5 py-2.5 rounded-full border border-universe-700 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">Publish Design Story</button>
      </div>
    </div>
  );

  // ─── RENDER: Quick Draft Floating Widget ────────────────────────────────────
  const renderQuickDraft = () => (
    <AnimatePresence>
      {showQuickDraft && (
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] z-[60] rounded-2xl border border-universe-700 bg-universe-900 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-universe-700 bg-universe-800/50">
            <span className="text-sm font-medium text-universe-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-universe-highlight" /> Quick Draft</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-universe-muted">{quickDraftText.length} chars</span>
              <button onClick={() => setShowQuickDraft(false)} className="p-1 text-universe-muted hover:text-universe-foreground transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <input value={quickDraftTitle} onChange={e => setQuickDraftTitle(e.target.value)} placeholder="Draft title..." className="w-full bg-transparent text-base font-serif font-bold text-universe-foreground placeholder-universe-muted focus:outline-none" />
            <textarea value={quickDraftText} onChange={e => setQuickDraftText(e.target.value)} placeholder="Start writing your idea..." className="w-full bg-universe-800/30 border border-universe-700 rounded-xl p-3 text-sm text-universe-foreground placeholder-universe-muted resize-none h-28 focus:outline-none focus:border-universe-highlight transition-colors" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={saveDraft} className="px-3 py-1.5 rounded-full bg-universe-foreground text-universe-900 text-xs font-medium hover:bg-universe-highlight hover:text-white transition-colors">Save Draft</button>
                <button onClick={() => { if (quickDraftTitle) navigate("/write"); }} className="px-3 py-1.5 rounded-full border border-universe-700 text-xs text-universe-foreground hover:bg-universe-800 transition-colors">Open in Editor</button>
              </div>
              <span className="text-[10px] text-universe-muted">Press N to toggle</span>
            </div>
            {/* Saved Drafts */}
            {savedDrafts.length > 0 && (
              <div className="border-t border-universe-700 pt-3 mt-2">
                <p className="text-[10px] text-universe-muted mb-2">Saved drafts ({savedDrafts.length})</p>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {savedDrafts.map((d, i) => (
                    <button key={i} onClick={() => { setQuickDraftTitle(d.title); setQuickDraftText(d.text); }} className="w-full text-left p-2 rounded-lg hover:bg-universe-800/50 transition-colors">
                      <p className="text-xs font-medium text-universe-foreground line-clamp-1">{d.title}</p>
                      <p className="text-[10px] text-universe-muted">{d.date} · {d.text.length} chars</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── RENDER: Keyboard Shortcuts Modal ───────────────────────────────────────
  const renderKeyboardShortcuts = () => (
    <AnimatePresence>
      {showKeyboardShortcuts && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowKeyboardShortcuts(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="w-[400px] max-w-[90vw] rounded-2xl border border-universe-700 bg-universe-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-universe-700">
              <span className="text-sm font-medium text-universe-foreground flex items-center gap-2"><Keyboard className="w-4 h-4 text-universe-highlight" /> Keyboard Shortcuts</span>
              <button onClick={() => setShowKeyboardShortcuts(false)} className="p-1 text-universe-muted hover:text-universe-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-2">
              {KEYBOARD_SHORTCUTS.map(s => (
                <div key={s.desc} className="flex items-center justify-between py-2">
                  <span className="text-sm text-universe-muted">{s.desc}</span>
                  <div className="flex gap-1">
                    {s.keys.map(k => (
                      <kbd key={k} className="px-2 py-0.5 rounded-md bg-universe-800 border border-universe-700 text-xs font-mono text-universe-foreground">{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── MAIN RETURN ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground flex flex-col selection:bg-universe-highlight/30 transition-colors duration-300">

      {/* Floating Widgets */}
      {renderQuickDraft()}
      {renderKeyboardShortcuts()}

      {/* Top Navigation Bar */}
      <header className={cn("fixed top-0 inset-x-0 z-50 w-full bg-universe-900/95 backdrop-blur border-b border-universe-700 h-16 flex items-center px-4 gap-4 transition-all duration-300", focusMode && "h-12")}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (window.innerWidth < 1024) setIsMobileSidebarOpen(!isMobileSidebarOpen); else setIsSidebarCollapsed(!isSidebarCollapsed); }}
            className="p-2 hover:bg-universe-800 rounded-full text-universe-foreground transition-colors focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 group mr-4">
            <span className="text-2xl font-serif font-extrabold tracking-tight text-universe-foreground">ReRitee</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-universe-muted" />
          <input ref={searchInputRef} type="text" placeholder="Search ReRitee... (S)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-universe-800/50 border border-universe-700 rounded-full py-2.5 pl-11 pr-4 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:bg-universe-900 focus:border-universe-highlight transition-all" />
        </form>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <button className="md:hidden p-2 text-universe-muted hover:text-universe-foreground rounded-full"><Search className="w-5 h-5" /></button>

          {/* Focus Mode Toggle */}
          <button onClick={() => setFocusMode(!focusMode)} className={cn("hidden md:flex p-2 rounded-full transition-colors", focusMode ? "text-universe-highlight" : "text-universe-muted hover:text-universe-foreground")} title={focusMode ? "Exit focus mode (F)" : "Focus mode (F)"}>
            {focusMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>

          {/* Quick Draft Toggle */}
          <button onClick={() => setShowQuickDraft(!showQuickDraft)} className={cn("hidden md:flex p-2 rounded-full transition-colors", showQuickDraft ? "text-universe-highlight" : "text-universe-muted hover:text-universe-foreground")} title="Quick draft (N)">
            <FileText className="w-4 h-4" />
          </button>

          {/* Keyboard Shortcuts */}
          <button onClick={() => setShowKeyboardShortcuts(true)} className="hidden md:flex p-2 rounded-full text-universe-muted hover:text-universe-foreground transition-colors" title="Shortcuts (?)">
            <Keyboard className="w-4 h-4" />
          </button>

          <button onClick={() => navigate('/write')} className="hidden md:flex items-center gap-2 text-universe-muted hover:text-universe-foreground transition-colors text-sm font-normal px-2">
            <PenSquare className="w-5 h-5" /> Write
          </button>

          {/* Community Chat */}
          <button onClick={() => navigate('/community-chat')} className="p-2 rounded-full transition-colors text-universe-muted hover:text-universe-foreground" title="Community Chat">
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button onClick={() => setIsNotificationOpen(p => !p)} className="p-2 text-universe-muted hover:text-universe-foreground transition-colors relative"><Bell className="w-5 h-5" /></button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-96 max-h-[600px] rounded-lg border border-universe-700 bg-universe-900 shadow-xl z-50 overflow-hidden">
                <div className="p-6 border-b border-universe-700">
                  <h2 className="text-2xl font-bold text-universe-foreground mb-4">Notifications</h2>
                  <div className="flex gap-6 border-b border-universe-700">
                    {["all", "responses"].map(t => (
                      <button key={t} onClick={() => setNotificationTab(t)} className={cn("pb-3 text-sm font-medium transition-all relative capitalize", notificationTab === t ? "text-universe-foreground" : "text-universe-muted hover:text-universe-foreground")}>
                        {t === "all" ? "All" : "Responses"}
                        {notificationTab === t && <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-universe-foreground" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[500px]"><div className="p-8 text-center"><p className="text-universe-muted text-sm">You're all caught up.</p></div></div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setIsProfileMenuOpen(p => !p)} className="ml-2 w-8 h-8 rounded-full overflow-hidden ring-1 ring-universe-700 hover:ring-universe-foreground transition-all">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" />
              ) : user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" />
              ) : (
                <div className="w-full h-full bg-universe-highlight flex items-center justify-center text-white text-sm font-semibold">
                  {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </button>
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-lg border border-universe-700 bg-universe-900 shadow-xl z-50 py-2 divide-y divide-universe-700">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-universe-highlight flex items-center justify-center text-lg font-semibold text-white overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" />
                      ) : (
                        profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-universe-foreground">{profile?.full_name || profile?.username || 'User'}</div>
                      <button onClick={() => { setIsProfileMenuOpen(false); navigate("/my-profile"); }} className="text-xs text-universe-muted hover:text-universe-foreground transition-colors">View profile</button>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button onClick={() => { setIsProfileMenuOpen(false); navigate("/settings"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors"><Settings className="w-4 h-4 text-universe-muted" />Settings</button>
                  <button onClick={() => { setIsProfileMenuOpen(false); navigate("/help"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors"><HelpCircle className="w-4 h-4 text-universe-muted" />Help</button>
                </div>
                <div className="py-2">
                  <button onClick={() => { setIsProfileMenuOpen(false); navigate("/membership"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors"><Star className="w-4 h-4 text-amber-500" /><span>Become a member</span></button>
                </div>
                <div className="py-2">
                  <button onClick={() => { setIsProfileMenuOpen(false); signOut(); navigate("/login"); }} className="w-full text-left px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">Sign out</button>
                  <div className="px-4 py-2 text-xs text-universe-muted">{user?.email}</div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-universe-muted">
                    <Link to="/about" onClick={() => setIsProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">About</Link>
                    <Link to="/about" onClick={() => setIsProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">Blog</Link>
                    <Link to="/about" onClick={() => setIsProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">Careers</Link>
                    <Link to="/privacy" onClick={() => setIsProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">Privacy</Link>
                    <Link to="/terms" onClick={() => setIsProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">Terms</Link>
                    <Link to="/about" onClick={() => setIsProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">Text to speech</Link>
                    <button onClick={() => setIsProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">More</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className={cn("flex flex-1 relative", focusMode ? "pt-12" : "pt-16")}>
        {!focusMode && <AppSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} isFixed={true} />}

        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          !focusMode && !isSidebarCollapsed ? "lg:ml-60" : "lg:ml-0"
        )}>
          <div className={cn(
            "mx-auto w-full",
            isImmersiveTab
              ? "max-w-[1192px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10"
              : "max-w-[1192px] px-4 md:px-10 py-10 min-h-[calc(100vh-4rem)]",
            isImmersiveTab ? "" : "grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-16 items-start"
          )}>

            <section className={cn("min-w-0 font-sans", isImmersiveTab ? "pr-0 max-w-none" : "max-w-[700px] w-full")}>

              {/* Feed Tabs */}
              <div className="flex items-center gap-8 border-b border-universe-700 mb-7 overflow-x-auto no-scrollbar">
                {[
                  { id: "for-you", label: "For you" },
                  { id: "featured", label: "Featured" },
                  { id: "cognitive", label: "Cognitive Science" },
                  { id: "design", label: "Design" },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("pb-4 text-sm font-normal transition-all relative whitespace-nowrap outline-none flex-shrink-0", activeTab === tab.id ? "text-universe-foreground" : "text-universe-muted hover:text-universe-foreground")}>
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1px] bg-universe-foreground" />}
                  </button>
                ))}
              </div>

              {activeTab === "cognitive" && renderImmersiveCognitive()}
              {activeTab === "design" && renderImmersiveDesign()}
              {(activeTab === "featured" || activeTab === "for-you") && renderArticleList(visibleTabPosts, hasMoreTabPosts)}
            </section>

            {/* Sidebar */}
            {!isImmersiveTab && !focusMode && (
              <aside className="hidden lg:block border-l border-universe-700 pl-10 pr-0 font-sans self-stretch">
                <div className="sticky top-10 space-y-6">

                  {/* Reading Streak */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-universe-foreground">Reading Streak</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-universe-foreground">{readingStreak}</span>
                      <div>
                        <p className="text-xs text-universe-muted">day{readingStreak !== 1 ? "s" : ""} in a row</p>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className={cn("w-3 h-3 rounded-sm", i < readingStreak % 7 ? "bg-universe-highlight" : "bg-universe-800")} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saved Queue */}
                  {bookmarkedPostIds.size > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="w-4 h-4 text-universe-highlight" />
                        <span className="text-sm font-medium text-universe-foreground">Reading Queue</span>
                      </div>
                      <p className="text-xs text-universe-muted">{bookmarkedPostIds.size} article{bookmarkedPostIds.size !== 1 ? "s" : ""} saved · ~{totalSavedReadTime} min total</p>
                      <div className="mt-2 space-y-1.5">
                        {posts.filter(p => bookmarkedPostIds.has(p.id)).slice(0, 3).map(p => (
                          <Link key={`queue-${p.id}`} to={`/blog/${p.id}`} className="flex items-center gap-2 text-xs text-universe-foreground hover:text-universe-highlight transition-colors">
                            <Bookmark className="w-3 h-3 text-universe-highlight flex-shrink-0 fill-current" />
                            <span className="line-clamp-1">{p.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Staff Picks */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-universe-foreground mb-4">Staff Picks</h3>
                    <div className="space-y-6">
                      {posts.slice(0, 3).map((post, index) => (
                        <Link key={`staff-${post.id}-${index}`} to={`/blog/${post.id}`} onClick={() => markAsRead(post.id)} className="block group">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-universe-800 flex-shrink-0" />
                            <p className="text-sm text-universe-muted leading-none">{post.author?.full_name || post.author?.username || 'Unknown'}</p>
                          </div>
                          <p className="text-base font-bold leading-snug text-universe-foreground group-hover:text-universe-highlight transition-colors line-clamp-2">{post.title}</p>
                        </Link>
                      ))}
                    </div>
                    <Link to="/stories" className="inline-flex mt-6 text-xs text-green-700 dark:text-green-500 hover:text-universe-foreground transition-colors">See the full list</Link>
                  </div>

                  {/* Writing Prompts */}
                  <div>
                    <button onClick={() => setShowWritingPrompts(!showWritingPrompts)} className="flex items-center justify-between w-full mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-universe-foreground">Writing Prompts</h3>
                      <ChevronDown className={cn("w-4 h-4 text-universe-muted transition-transform", showWritingPrompts && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {showWritingPrompts && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-5">
                          {WRITING_PROMPTS.map((wp, i) => (
                            <div key={i} className="group">
                              <span className="text-[10px] font-semibold text-universe-highlight uppercase tracking-wide mb-1 block">{wp.tag}</span>
                              <p className="text-sm text-universe-foreground leading-snug">{wp.prompt}</p>
                              <button onClick={() => writeAboutTopic(wp.prompt)} className="mt-1.5 text-xs text-universe-muted hover:text-universe-highlight transition-colors flex items-center gap-1"><PenSquare className="w-3 h-3" /> Write this</button>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Recommended topics */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-universe-foreground mb-4">Recommended topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Relationships", "Machine Learning", "Science", "Health", "Software Development", "Design"].map(topic => (
                        <button key={topic} onClick={() => { setSearchQuery(topic); searchInputRef.current?.focus(); }} className={cn("px-3 py-1.5 rounded-full text-sm transition-colors", mutedTopics.has(topic) ? "bg-universe-800/30 text-universe-muted line-through" : "bg-universe-800 text-universe-foreground hover:bg-universe-700")}>{topic}</button>
                      ))}
                    </div>
                    <Link to="/following" className="inline-flex mt-4 text-xs text-green-700 dark:text-green-500 hover:text-universe-foreground transition-colors">See more topics</Link>
                  </div>

                  {/* Who to follow */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-universe-foreground mb-4">Who to follow</h3>
                    <div className="space-y-4">
                      {loadingSuggestions ? (
                        <p className="text-xs text-universe-muted">Loading...</p>
                      ) : suggestedUsers.length === 0 ? (
                        <p className="text-xs text-universe-muted">No suggestions available</p>
                      ) : suggestedUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-universe-800 flex-shrink-0 overflow-hidden">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-universe-muted text-xs font-semibold">
                                  {user.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-universe-foreground truncate">{user.full_name || user.username}</p>
                              <p className="text-xs text-universe-muted truncate">{user.bio || '@' + user.username}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleFollow(user.id)} 
                            className={cn("px-3 py-1 rounded-full border text-xs font-medium transition-colors flex-shrink-0", followingIds.has(user.id) ? "border-universe-highlight text-universe-highlight" : "border-universe-700 text-universe-foreground hover:bg-universe-800")}
                          >
                            {followingIds.has(user.id) ? "Following" : "Follow"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="border-t border-universe-700 pt-6">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {[
                        { icon: BarChart3, label: "My Stats", to: "/stats" },
                        { icon: Newspaper, label: "My Stories", to: "/stories" },
                        { icon: BookOpen, label: "Library", to: "/library" },
                        { icon: Settings, label: "Settings", to: "/settings" },
                      ].map(link => (
                        <button key={link.label} onClick={() => navigate(link.to)} className="flex items-center gap-1.5 text-xs text-universe-muted hover:text-universe-foreground transition-colors">
                          <link.icon className="w-3.5 h-3.5" /> {link.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
