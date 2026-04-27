import { motion } from "framer-motion";
import { AppSidebar } from "../components/layout/AppSidebar";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Brain,
  Zap,
  Menu,
  Search,
  Bell,
  PenSquare,
  Settings,
  HelpCircle,
  Star
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export const Stats = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "stories" | "engagement" | "insights"
  >("stories");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState("all");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  // ... (Mock Data remains the same) ...
  const cognitiveMetrics = [
    { id: "ai-consciousness", title: "The Illusion of AI Consciousness", cognitiveScore: 8.7, engagementDepth: 76, avgTimeSpent: "4m 32s", readerRetention: 82, assumptions: 12, discussionPoints: 23 },
    { id: "quantum-computing", title: "Quantum Computing: Beyond the Hype", cognitiveScore: 8.2, engagementDepth: 68, avgTimeSpent: "3m 54s", readerRetention: 78, assumptions: 9, discussionPoints: 18 },
    { id: "flat-design", title: "The Death of Flat Design", cognitiveScore: 7.4, engagementDepth: 59, avgTimeSpent: "3m 12s", readerRetention: 71, assumptions: 6, discussionPoints: 14 },
  ];

  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground flex flex-col transition-colors duration-300">
       {/* Header - Responsive */}
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

        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-universe-muted" />
          <input 
            type="text" 
            placeholder="Search ReRitee..." 
            className="w-full bg-universe-800 border border-universe-700 rounded-full py-2 pl-10 pr-4 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:bg-universe-800 focus:ring-1 focus:ring-universe-highlight transition-all"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2 ml-auto">
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
          "flex-1 transition-all duration-300",
          !isSidebarCollapsed ? "lg:ml-60" : "lg:ml-0"
        )}>
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 md:mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-8 text-universe-foreground">
                Status
              </h1>

              <div className="flex items-center gap-6 md:gap-8 border-b border-universe-700 pb-0 overflow-x-auto no-scrollbar">
                {[
                  { id: "stories", label: "Stories", icon: BookOpen },
                  { id: "engagement", label: "Cognitive Impact", icon: Brain },
                  { id: "insights", label: "Insights", icon: Zap },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 text-sm md:text-lg font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${
                      activeTab === tab.id
                        ? "text-universe-foreground"
                        : "text-universe-muted hover:text-universe-highlight"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-universe-highlight rounded-t-full"
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ... (Content sections remain largely the same, grid layouts are already responsive) ... */}
            {activeTab === "stories" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-6 text-universe-foreground">Monthly Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Views", value: "12.5K", trend: "+24%" },
                      { label: "Avg Time/Read", value: "3m 52s", trend: "+18%" },
                      { label: "Unique Readers", value: "2.8K", trend: "+31%" },
                      { label: "Share Rate", value: "12.4%", trend: "+7%" },
                    ].map((stat, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-universe-800 border border-universe-700 rounded-xl p-4 hover:border-universe-highlight/30 transition-colors">
                        <p className="text-universe-muted text-xs mb-2 uppercase font-medium">{stat.label}</p>
                        <div className="flex items-end justify-between">
                          <p className="text-2xl font-serif font-bold text-universe-foreground">{stat.value}</p>
                          <span className="text-xs text-green-500 font-bold">{stat.trend}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-6 text-universe-foreground">Story Performance</h2>
                  <div className="space-y-3 border border-universe-700 rounded-xl overflow-hidden overflow-x-auto no-scrollbar">
                    <div className="min-w-[600px] grid grid-cols-12 gap-4 bg-universe-800 border-b border-universe-700 px-6 py-4 text-xs text-universe-muted font-medium uppercase">
                      <div className="col-span-4">Story</div>
                      <div className="col-span-2 text-center">Views</div>
                      <div className="col-span-2 text-center">Reads</div>
                      <div className="col-span-2 text-center">Avg Time</div>
                      <div className="col-span-2 text-center">Share Rate</div>
                    </div>
                    {cognitiveMetrics.map((story, idx) => (
                      <motion.div key={story.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + idx * 0.05 }} className="min-w-[600px] grid grid-cols-12 gap-4 px-6 py-4 border-b border-universe-700 hover:bg-universe-800 transition-colors last:border-0">
                        <div className="col-span-4"><p className="font-serif font-bold text-sm text-universe-foreground hover:text-universe-highlight cursor-pointer truncate transition-colors">{story.title}</p></div>
                        <div className="col-span-2 text-center font-bold text-universe-foreground">{story.engagementDepth * 50}</div>
                        <div className="col-span-2 text-center font-bold text-universe-highlight">{story.readerRetention}%</div>
                        <div className="col-span-2 text-center font-bold text-green-500">{story.avgTimeSpent}</div>
                        <div className="col-span-2 text-center font-bold text-universe-foreground">12.4%</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {/* ... Other tabs ... */}
          </div>
        </main>
      </div>
    </div>
  );
};
