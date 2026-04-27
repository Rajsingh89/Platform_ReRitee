import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/layout/AppSidebar";
import { useAuth } from "../context/AuthContext";
import { 
  Menu, 
  Search, 
  Bell, 
  PenSquare,
  Settings,
  HelpCircle,
  Star
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";

export const Stories = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("drafts");
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
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          !isSidebarCollapsed ? "lg:ml-60" : "lg:ml-0"
        )}>
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
            
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-universe-foreground tracking-tight">
                Stories
              </h1>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => navigate('/write')}
                  variant="primary"
                  className="rounded-full bg-universe-highlight text-white hover:bg-universe-highlight/90 border-none px-6"
                >
                  Write a story
                </Button>
                <Button 
                  variant="outline"
                  className="rounded-full border-universe-700 hover:border-universe-foreground px-6"
                >
                  Import a story
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 md:gap-8 border-b border-universe-700 mb-8 md:mb-12 overflow-x-auto no-scrollbar">
              {[
                { id: "drafts", label: "Drafts" },
                { id: "scheduled", label: "Scheduled" },
                { id: "published", label: "Published" },
                { id: "unlisted", label: "Unlisted" },
                { id: "submissions", label: "Submissions" },
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
                      layoutId="activeStoriesTab"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-universe-foreground"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[300px] flex flex-col">
              {activeTab === "drafts" && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center py-20 text-center"
                >
                  <p className="text-universe-muted mb-2">No stories in draft.</p>
                  <p className="text-universe-muted">
                    Why not <Link to="/write" className="underline hover:text-universe-highlight transition-colors">start writing one</Link>?
                  </p>
                </motion.div>
              )}
              {/* Other tabs... */}
              {activeTab === "published" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="border-b border-universe-700 pb-6">
                    <h3 className="text-xl font-bold font-serif text-universe-foreground mb-1 hover:text-universe-highlight cursor-pointer transition-colors">
                      Understanding Attention: A Practical Guide
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-universe-muted">
                      <span>Published on Feb 04, 2026</span><span>·</span><span>7 min read</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
