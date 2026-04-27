import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Menu,
  MoreHorizontal,
  PenSquare,
  Search,
  Settings,
  HelpCircle,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppSidebar } from "../components/layout/AppSidebar";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { posts, loadingPosts, followersCount, followingCount } = useApp();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderProfileMenuOpen, setIsHeaderProfileMenuOpen] = useState(false);
  const [isProfileActionsOpen, setIsProfileActionsOpen] = useState(false);
  const [activeStoryMenuId, setActiveStoryMenuId] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState("all");
  
  const headerProfileMenuRef = useRef<HTMLDivElement>(null);
  const profileActionsRef = useRef<HTMLDivElement>(null);
  const storyMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerProfileMenuRef.current && !headerProfileMenuRef.current.contains(event.target as Node)) {
        setIsHeaderProfileMenuOpen(false);
      }
      if (profileActionsRef.current && !profileActionsRef.current.contains(event.target as Node)) {
        setIsProfileActionsOpen(false);
      }
      if (storyMenuRef.current && !storyMenuRef.current.contains(event.target as Node)) {
        setActiveStoryMenuId(null);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
    }
  };

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';
  const username = profile?.username || 'user';
  const avatarUrl = profile?.avatar_url;
  const bio = profile?.bio;

  const userPosts = posts.filter(post => post.author_id === user?.id);

  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground flex flex-col transition-colors duration-300">
      <header className="fixed top-0 inset-x-0 z-50 w-full bg-universe-900/95 backdrop-blur border-b border-universe-700 h-16 flex items-center px-4 gap-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="p-2 hover:bg-universe-800 rounded-full text-universe-foreground transition-colors focus:outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 group mr-4">
            <span className="text-[2rem] font-serif font-medium tracking-tight text-universe-foreground">
              ReRitee
            </span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-universe-muted" />
          <input
            type="text"
            placeholder="Search ReRitee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-universe-800/50 border border-universe-700 rounded-full py-2.5 pl-11 pr-4 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:bg-universe-900 focus:border-universe-highlight transition-all"
          />
        </form>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <button className="md:hidden p-2 text-universe-muted hover:text-universe-foreground rounded-full">
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate("/write")}
            className="hidden md:flex items-center gap-2 text-universe-muted hover:text-universe-foreground transition-colors text-sm font-normal px-2"
          >
            <PenSquare className="w-5 h-5" /> Write
          </button>

          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="p-2 text-universe-muted hover:text-universe-foreground transition-colors relative"
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

          <div className="relative" ref={headerProfileMenuRef}>
            <button
              onClick={() => {
                setIsProfileActionsOpen(false);
                setIsHeaderProfileMenuOpen((prev) => !prev);
              }}
              className="ml-2 w-8 h-8 rounded-full overflow-hidden ring-1 ring-universe-700 hover:ring-universe-foreground transition-all"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-universe-highlight flex items-center justify-center text-white font-semibold">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
            </button>

            {isHeaderProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-lg border border-universe-700 bg-universe-900 shadow-xl z-50 py-2 divide-y divide-universe-700">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-universe-highlight flex items-center justify-center text-lg font-semibold text-white">
                      {displayName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-universe-foreground">{displayName}</div>
                      <button
                        onClick={() => {
                          setIsHeaderProfileMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="text-xs text-universe-muted hover:text-universe-foreground transition-colors"
                      >
                        View profile
                      </button>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsHeaderProfileMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-universe-muted" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsHeaderProfileMenuOpen(false);
                      navigate("/help");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-universe-muted" />
                    Help
                  </button>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsHeaderProfileMenuOpen(false);
                      navigate("/membership");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors"
                  >
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>Become a member</span>
                  </button>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsHeaderProfileMenuOpen(false);
                      signOut();
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors"
                  >
                    Sign out
                  </button>
                  <div className="px-4 py-2 text-xs text-universe-muted">
                    {user?.email}
                  </div>
                </div>

                <div className="px-4 py-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-universe-muted">
                    <Link to="/about" onClick={() => setIsHeaderProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">About</Link>
                    <Link to="/about" onClick={() => setIsHeaderProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">Blog</Link>
                    <Link to="/privacy" onClick={() => setIsHeaderProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">Privacy</Link>
                    <Link to="/terms" onClick={() => setIsHeaderProfileMenuOpen(false)} className="hover:text-universe-foreground transition-colors">Terms</Link>
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

        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out pt-2 lg:pt-3",
            !isSidebarCollapsed ? "lg:ml-60" : "lg:ml-0"
          )}
        >
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-12 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-y-8 lg:gap-x-24">
            <section className="min-w-0 lg:pr-0">
              <div className="flex items-start justify-between mb-7">
                <h1 className="text-[1.8rem] leading-none md:text-[2rem] font-bold tracking-tight text-universe-foreground">{displayName}</h1>

              <div className="relative" ref={profileActionsRef}>
                <button
                  onClick={() => {
                    setIsHeaderProfileMenuOpen(false);
                    setIsProfileActionsOpen((prev) => !prev);
                  }}
                  className="p-2 rounded-full text-universe-muted hover:text-universe-foreground hover:bg-universe-800 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {isProfileActionsOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-universe-700 bg-universe-900 shadow-xl z-20 py-2">
                    <button 
                      onClick={() => navigate("/profile/edit")}
                      className="w-full text-left px-4 py-2 text-sm text-universe-foreground hover:bg-universe-700 transition-colors"
                    >
                      Edit profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-universe-foreground hover:bg-universe-700 transition-colors">
                      Copy link to profile
                    </button>
                  </div>
                )}
              </div>
              </div>

              {bio && (
                <p className="text-universe-muted mb-6">{bio}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-universe-muted mb-5">
                <span>{followersCount} followers</span>
                <span>·</span>
                <span>{followingCount} following</span>
              </div>

              <div className="flex items-center gap-8 border-b border-universe-700 mb-5 overflow-x-auto no-scrollbar">
                {[
                  { id: "home", label: "Home" },
                  { id: "lists", label: "Lists" },
                  { id: "about", label: "About" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "pb-4 text-sm font-normal transition-all relative whitespace-nowrap outline-none flex-shrink-0",
                      activeTab === tab.id ? "text-universe-foreground" : "text-universe-muted hover:text-universe-foreground"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-universe-foreground" />
                    )}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-universe-700">
                {userPosts.length > 0 ? userPosts.map((post) => (
                  <article key={post.id} className="py-9 md:py-10 relative">
                    <Link to={`/blog/${post.id}`} className="block">
                      <h2 className="text-[1.2rem] md:text-[1.3rem] leading-tight font-bold text-universe-foreground mb-3">{post.title}</h2>
                      <p className="font-sans text-universe-muted/90 text-xs leading-5 line-clamp-2 mb-7">{post.subtitle}</p>
                    </Link>

                    <div className="flex items-center justify-between">
                      <span className="text-universe-muted text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-universe-muted hover:text-universe-foreground transition-colors">
                          <Bookmark className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveStoryMenuId((prev) => (prev === post.id ? null : post.id))}
                          className="p-2 text-universe-muted hover:text-universe-foreground transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="py-16 text-center">
                    <p className="text-universe-muted mb-4">You haven't published any stories yet.</p>
                    <button
                      onClick={() => navigate("/write")}
                      className="px-6 py-2 rounded-full bg-universe-highlight text-white font-medium hover:bg-universe-highlight/90 transition-colors"
                    >
                      Write your first story
                    </button>
                  </div>
                )}
              </div>
            </section>

            <aside className="hidden lg:block border-l border-universe-700 pl-12 min-h-[calc(100vh-8rem)]">
              <div className="sticky top-24">
                <div className="pt-3 pb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-universe-highlight flex items-center justify-center text-4xl font-medium text-white overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        displayName[0]?.toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-[1.5rem] font-bold text-universe-foreground">{displayName}</div>
                    <p className="text-sm text-universe-muted">@{username}</p>
                      <button
                        onClick={() => navigate("/profile/edit")}
                        className="mt-2 text-sm font-normal text-universe-highlight hover:text-universe-highlight/80 transition-colors"
                      >
                        Edit profile
                      </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[1.45rem] md:text-[1.3rem] font-bold text-universe-foreground mb-4">Following</h3>
                  <div className="space-y-3 text-universe-muted">
                    <p className="text-sm">Follow writers to see their stories here.</p>
                    <button
                      onClick={() => navigate("/following")}
                      className="text-sm text-universe-highlight hover:text-universe-highlight/80 transition-colors"
                    >
                      Find writers to follow
                    </button>
                  </div>
                </div>

                <div className="mt-16 pt-4 border-t border-universe-700/80">
                  <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-universe-muted">
                    <Link to="/help" className="hover:text-universe-foreground transition-colors">Help</Link>
                    <Link to="/stats" className="hover:text-universe-foreground transition-colors">Status</Link>
                    <Link to="/about" className="hover:text-universe-foreground transition-colors">About</Link>
                    <Link to="/privacy" className="hover:text-universe-foreground transition-colors">Privacy</Link>
                    <Link to="/terms" className="hover:text-universe-foreground transition-colors">Terms</Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};