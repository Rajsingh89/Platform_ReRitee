import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/layout/AppSidebar";
import { 
  Menu, 
  Search, 
  Bell, 
  PenSquare, 
  BookmarkPlus,
  MoreHorizontal,
  Lock,
  X,
  Highlighter,
  Trash2,
  Edit2,
  MinusCircle,
  Link as LinkIcon,
  Check,
  Settings,
  HelpCircle,
  Star
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export const Library = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { posts, bookmarkedPostIds } = useApp();
  const bookmarkedPosts = posts.filter(p => bookmarkedPostIds.has(p.id));
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("your-lists");
  const [showBanner, setShowBanner] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState("all");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [listDesc, setListDesc] = useState("");
  const [showDescInput, setShowDescInput] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // State for active dropdown menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reading history from bookmarked posts
  const readingHistory = bookmarkedPosts.slice(0, 4).map((p, i) => ({
    ...p,
    viewedAt: i === 0 ? "Today" : i === 1 ? "Today" : i === 2 ? "Yesterday" : "Last Week"
  }));
  
  const highlights = [
    {
      id: 1,
      text: "We often mistake fluency for sentience. When ChatGPT generates a poem, it isn't feeling the emotion.",
      source: "The Illusion of AI Consciousness",
      date: "Oct 24",
      color: "bg-yellow-500/20"
    },
    {
      id: 2,
      text: "Attention mechanisms let models weight parts of their input differently — focusing computation where it matters.",
      source: "Understanding Attention",
      date: "Feb 04",
      color: "bg-purple-500/20"
    }
  ];

  const groupedHistory = readingHistory.reduce((groups, post) => {
    const date = post.viewedAt;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(post);
    return groups;
  }, {} as Record<string, typeof readingHistory>);

  // Initial Lists Data
  const INITIAL_LISTS = [
    {
      id: "reading-list",
      title: "Reading list",
      storyCount: bookmarkedPosts.length,
      isPrivate: true,
      isDefault: true,
      covers: bookmarkedPosts.slice(0, 3).map(p => p.cover_image || '')
    },
    {
      id: "dsj",
      title: "Cognitive Models",
      storyCount: 2,
      isPrivate: true,
      isDefault: false,
      covers: bookmarkedPosts.slice(0, 2).map(p => p.cover_image || '')
    },
    {
      id: "kj",
      title: "Future Tech",
      storyCount: 0,
      isPrivate: true,
      isDefault: false,
      covers: []
    }
  ];

  const [myLists, setMyLists] = useState(INITIAL_LISTS);

  const handleCreateList = () => {
    if (!listName.trim()) return;

    const newList = {
      id: Date.now().toString(),
      title: listName,
      storyCount: 0,
      isPrivate: isPrivate,
      isDefault: false,
      covers: []
    };

    const updatedLists = [...myLists];
    updatedLists.splice(1, 0, newList); 
    setMyLists(updatedLists);
    
    setListName("");
    setListDesc("");
    setShowDescInput(false);
    setIsPrivate(false);
    setIsCreateModalOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground flex flex-col transition-colors duration-300">
      
      {/* Header - Mobile Optimized */}
      <header className="fixed top-0 inset-x-0 z-50 w-full bg-universe-900/95 backdrop-blur border-b border-universe-700 h-16 flex items-center px-4 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="p-2 hover:bg-universe-highlight/10 rounded-full text-universe-muted hover:text-universe-highlight transition-colors focus:outline-none focus:ring-2 focus:ring-universe-highlight"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group mr-2">
             <span className="text-xl font-serif font-bold tracking-tight text-universe-foreground group-hover:text-universe-highlight transition-colors">ReRitee</span>
          </Link>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-universe-muted" />
          <input 
            type="text" 
            placeholder="Search ReRitee..." 
            className="w-full bg-universe-800 border border-universe-700 rounded-full py-2 pl-10 pr-4 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:bg-universe-800 focus:ring-1 focus:ring-universe-highlight transition-all"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Mobile Search Icon */}
          <button className="md:hidden p-2 text-universe-muted hover:text-universe-highlight rounded-full hover:bg-universe-highlight/10 transition-colors">
            <Search className="w-5 h-5" />
          </button>

          <button 
            onClick={() => navigate('/write')} 
            className="hidden md:flex items-center gap-2 text-universe-muted hover:text-universe-highlight px-3 py-2 rounded-full hover:bg-universe-highlight/10 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-universe-highlight"
          >
            <PenSquare className="w-4 h-4" /> Write
          </button>
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="p-2 text-universe-muted hover:text-universe-highlight rounded-full hover:bg-universe-highlight/10 transition-colors relative focus:outline-none focus:ring-2 focus:ring-universe-highlight"
            >
              <Bell className="w-5 h-5" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-96 max-h-[600px] rounded-lg border border-universe-700 bg-universe-900 shadow-xl z-50 overflow-hidden">
                <div className="p-6 border-b border-universe-700">
                  <h2 className="text-2xl font-bold text-universe-foreground mb-4">Notifications</h2>
                  <div className="flex gap-6 border-b border-universe-700">
                    <button
                      onClick={() => setNotificationTab("all")}
                      className={cn(
                        "pb-3 text-sm font-medium transition-all relative",
                        notificationTab === "all" ? "text-universe-foreground" : "text-universe-muted hover:text-universe-foreground"
                      )}
                    >
                      All
                      {notificationTab === "all" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-universe-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => setNotificationTab("responses")}
                      className={cn(
                        "pb-3 text-sm font-medium transition-all relative",
                        notificationTab === "responses" ? "text-universe-foreground" : "text-universe-muted hover:text-universe-foreground"
                      )}
                    >
                      Responses
                      {notificationTab === "responses" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-universe-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[500px]">
                  <div className="p-8 text-center">
                    <p className="text-universe-muted text-sm">You're all caught up.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="ml-1 md:ml-2 w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-universe-highlight transition-all focus:outline-none focus:ring-2 focus:ring-universe-highlight"
            >
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

      <div className="flex flex-1 relative pt-16">
        <AppSidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          isFixed={true}
        />
        
        <main className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          !isSidebarCollapsed ? "lg:ml-60" : "lg:ml-0"
        )}>
          {/* Main Content Container */}
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
            
            {/* Page Title & Action */}
            <div className="flex flex-row items-center justify-between gap-4 mb-8 md:mb-10">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl md:text-5xl font-serif font-bold text-universe-foreground tracking-tight"
              >
                Your library
              </motion.h1>
              
              {activeTab === "your-lists" && (
                <motion.button 
                  onClick={() => setIsCreateModalOpen(true)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-universe-highlight text-white font-medium shadow-lg hover:shadow-xl hover:bg-universe-highlight/90 transition-all duration-300 text-xs md:text-sm whitespace-nowrap"
                >
                  New list
                </motion.button>
              )}
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-6 md:gap-8 border-b border-universe-700 mb-8 md:mb-12 overflow-x-auto no-scrollbar mask-linear-fade">
              {[
                { id: "your-lists", label: "Your lists" },
                { id: "saved-lists", label: "Saved lists" },
                { id: "highlights", label: "Highlights" },
                { id: "history", label: "Reading history" },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "pb-3 md:pb-4 text-sm font-medium transition-all relative whitespace-nowrap outline-none flex-shrink-0",
                    activeTab === tab.id 
                      ? "text-universe-foreground" 
                      : "text-universe-muted hover:text-universe-highlight"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeLibraryTab"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-universe-foreground"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* 1. YOUR LISTS TAB */}
                {activeTab === "your-lists" && (
                  <motion.div 
                    key="your-lists"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-8 md:space-y-12"
                  >
                    {/* 1st Card: BANNER */}
                    <AnimatePresence>
                      {showBanner && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          className="relative overflow-hidden bg-gradient-to-br from-universe-highlight via-purple-800 to-universe-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-lg group min-h-[160px] md:min-h-[180px]"
                        >
                          <button 
                            onClick={() => setShowBanner(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors z-20"
                          >
                            <X className="w-5 h-5" />
                          </button>

                          <div className="relative z-10 max-w-lg w-full">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight font-serif tracking-tight pr-8">
                              Create a list to easily <br className="hidden sm:block"/> organize and share stories
                            </h2>
                            <button 
                              onClick={() => setIsCreateModalOpen(true)}
                              className="px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-900 transition-all shadow-lg hover:scale-105"
                            >
                              Start a list
                            </button>
                          </div>
                          
                          {/* Icon - Hidden on very small screens if needed, or adjusted */}
                          <div className="hidden sm:flex shrink-0 relative items-center justify-center w-24 h-24 md:w-32 md:h-32 mr-0 md:mr-8 self-end sm:self-center">
                             <motion.div 
                               animate={{ rotate: 360 }}
                               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                               className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-full border border-white/5 backdrop-blur-sm"
                             />
                             <div 
                               className="relative z-10 w-12 h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-xl"
                             >
                               <BookmarkPlus className="w-5 h-5 md:w-6 md:h-6 text-universe-highlight" />
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* LIST CARDS - RESPONSIVE LAYOUT */}
                    <div className="space-y-6">
                      {myLists.map((list) => (
                        <div key={list.id} className="relative">
                          <motion.div 
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                            className="group relative bg-universe-800/10 border border-universe-700 overflow-hidden flex flex-col sm:flex-row cursor-pointer hover:border-universe-highlight/30 hover:shadow-lg transition-all duration-300 sm:h-36"
                          >
                            {/* Content Section */}
                            <div className="flex-1 p-4 md:p-5 flex flex-col justify-between bg-universe-800/20 min-h-[120px]">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-universe-highlight flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                    U
                                  </div>
                                  <span className="font-bold text-xs text-universe-foreground">User Name</span>
                                </div>
                                
                                <h3 className="text-lg md:text-xl font-bold text-universe-foreground font-serif group-hover:text-universe-highlight transition-colors line-clamp-1">
                                  {list.title}
                                </h3>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4 sm:mt-auto">
                                <div className="flex items-center gap-2 text-xs text-universe-muted font-medium uppercase tracking-wide">
                                    <span>{list.storyCount} stories</span>
                                    {list.isPrivate && <Lock className="w-2.5 h-2.5 mb-0.5" />}
                                </div>
                                
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === list.id ? null : list.id);
                                  }}
                                  className="p-2 rounded-full hover:bg-universe-highlight/10 hover:text-universe-highlight text-universe-muted transition-colors relative z-10"
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Image Section - Row on Mobile, Grid on Desktop */}
                            <div className="w-full sm:w-[300px] h-24 sm:h-full bg-universe-800/50 border-t sm:border-t-0 sm:border-l border-universe-700 flex shrink-0">
                              <div className="flex-1 sm:flex-[3] h-full border-r border-universe-700/50 relative overflow-hidden bg-universe-800/30">
                                {list.covers[0] ? (
                                  <img src={list.covers[0]} className="w-full h-full object-cover transition-opacity" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-universe-700/10 dark:bg-universe-700/20" /> 
                                )}
                              </div>
                              <div className="flex-1 sm:flex-[2] h-full border-r border-universe-700/50 relative overflow-hidden bg-universe-800/30">
                                {list.covers[1] ? (
                                  <img src={list.covers[1]} className="w-full h-full object-cover transition-opacity" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-universe-700/10 dark:bg-universe-700/20" /> 
                                )}
                              </div>
                              <div className="flex-1 sm:flex-[1] h-full relative overflow-hidden bg-universe-800/30">
                                {list.covers[2] ? (
                                  <img src={list.covers[2]} className="w-full h-full object-cover transition-opacity" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-universe-700/10 dark:bg-universe-700/20" /> 
                                )}
                              </div>
                            </div>
                          </motion.div>

                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {activeMenuId === list.id && (
                              <motion.div 
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-4 bottom-12 z-30 w-56 bg-universe-800 border border-universe-700 rounded-none shadow-xl overflow-hidden"
                              >
                                {/* ... Menu Items (Same as before) ... */}
                                <div className="py-1">
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-universe-foreground hover:bg-universe-highlight/10 hover:text-universe-highlight flex items-center gap-3">
                                      <LinkIcon className="w-4 h-4" /> Copy link
                                    </button>
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-universe-foreground hover:bg-universe-highlight/10 hover:text-universe-highlight flex items-center gap-3">
                                      <Edit2 className="w-4 h-4" /> Edit list info
                                    </button>
                                    {list.isDefault ? (
                                       <button className="w-full px-4 py-2.5 text-left text-sm text-universe-foreground hover:bg-universe-highlight/10 hover:text-universe-highlight flex items-center gap-3">
                                         <MinusCircle className="w-4 h-4" /> Remove items
                                       </button>
                                    ) : (
                                       <button className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-3">
                                          <Trash2 className="w-4 h-4" /> Delete list
                                       </button>
                                    )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>

                  </motion.div>
                )}

                {/* Other Tabs... (Kept similar structure) */}
                 {activeTab === "saved-lists" && (
                  <motion.div key="saved-lists" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-6">
                    <div className="text-center py-12 text-universe-muted">No saved lists yet.</div>
                  </motion.div>
                )}
                {activeTab === "highlights" && (
                  <motion.div key="highlights" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-4">
                    {highlights.map((item) => (
                      <motion.div variants={itemVariants} key={item.id} className="p-6 bg-universe-800/30 border border-universe-700 rounded-none hover:border-universe-highlight/30 transition-all group">
                        <div className="flex items-start gap-3 mb-4">
                           <Highlighter className="w-4 h-4 text-universe-highlight mt-1 shrink-0" />
                           <blockquote className="text-lg font-serif text-universe-foreground leading-relaxed italic">"{item.text}"</blockquote>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <span className="font-bold text-universe-foreground">{item.source}</span>
                           <span className="text-universe-muted">{item.date}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                {activeTab === "history" && (
                  <motion.div key="history" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-sm font-bold text-universe-foreground">Recent</h3>
                       <Button variant="ghost" size="sm" className="text-xs h-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 className="w-3 h-3 mr-2" /> Clear history</Button>
                    </div>
                    <div className="space-y-8">
                       {Object.entries(groupedHistory).map(([date, posts]) => (
                         <div key={date}>
                            <div className="text-xs font-bold text-universe-muted uppercase tracking-wider mb-4 border-b border-universe-700 pb-2">{date}</div>
                            <div className="space-y-4">
                              {posts.map((post, idx) => (
                                <div key={`${post.id}-${idx}`} className="group flex gap-4 items-start">
                                   <div className="w-16 h-16 bg-universe-800 rounded-none overflow-hidden shrink-0 border border-universe-700">
                                      <img src={post.cover_image || ''} className="w-full h-full object-cover" alt="" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <h3 className="text-base font-bold font-serif text-universe-foreground mb-1 group-hover:text-universe-highlight transition-colors cursor-pointer line-clamp-1">{post.title}</h3>
                                      <div className="flex items-center gap-2 text-xs text-universe-muted">
                                         <span>{post.author?.username || 'Unknown'}</span><span>·</span><span>{post.read_time || 5} min</span>
                                      </div>
                                   </div>
                                </div>
                              ))}
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* CREATE LIST MODAL - Responsive */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-universe-900/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl min-h-[500px] md:min-h-[600px] bg-universe-900 border border-universe-700 shadow-2xl p-6 md:p-16 overflow-hidden flex flex-col items-center justify-center"
            >
              <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 md:top-8 md:right-8 text-universe-muted hover:text-universe-foreground transition-colors">
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-universe-foreground mb-10 md:mb-16 text-center">Create new list</h2>
              <div className="w-full max-w-xl space-y-6 md:space-y-8">
                <div className="relative">
                  <input type="text" value={listName} onChange={(e) => setListName(e.target.value)} placeholder="Give it a name" className="w-full bg-transparent border border-universe-700 rounded-lg p-3 md:p-4 text-base md:text-lg text-universe-foreground placeholder-universe-muted focus:border-universe-highlight focus:outline-none transition-colors" maxLength={60} autoFocus />
                  <div className="text-right mt-2 text-xs text-universe-muted">{listName.length}/60</div>
                </div>
                {!showDescInput ? (
                  <button onClick={() => setShowDescInput(true)} className="text-universe-highlight hover:text-universe-highlight/80 text-sm md:text-base font-medium transition-colors">Add a description</button>
                ) : (
                  <div className="relative">
                    <input type="text" value={listDesc} onChange={(e) => setListDesc(e.target.value)} placeholder="Description" className="w-full bg-transparent border-b border-universe-700 py-3 text-base text-universe-foreground placeholder-universe-muted focus:border-universe-highlight focus:outline-none transition-colors" maxLength={280} />
                    <div className="text-right mt-2 text-xs text-universe-muted">{listDesc.length}/280</div>
                  </div>
                )}
                <div className="flex items-center gap-4 pt-4">
                  <button onClick={() => setIsPrivate(!isPrivate)} className={cn("w-6 h-6 border rounded flex items-center justify-center transition-colors", isPrivate ? "bg-universe-highlight border-universe-highlight text-white" : "border-universe-muted bg-transparent")}>
                    {isPrivate && <Check className="w-4 h-4" />}
                  </button>
                  <span className="text-sm md:text-base text-universe-foreground">Make it private</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 md:gap-6 mt-12 md:mt-20">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 md:px-8 py-2 md:py-3 rounded-full border border-universe-700 text-universe-foreground hover:border-universe-foreground transition-colors text-sm md:text-base font-medium">Cancel</button>
                <button onClick={handleCreateList} disabled={!listName.trim()} className="px-6 md:px-8 py-2 md:py-3 rounded-full bg-universe-highlight text-white hover:bg-universe-highlight/90 transition-colors text-sm md:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Create</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
