import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/layout/AppSidebar";
import { 
  Menu, 
  Search, 
  Bell, 
  PenSquare, 
  MoreHorizontal,
  MessageCircle,
  Bookmark,
  Copy,
  EyeOff,
  VolumeX,
  Settings,
  HelpCircle,
  Star,
  Check,
  Loader2,
  Heart,
  UserMinus,
  UserPlus
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { postService, useBookmarks, useFollowingList } from "../hooks/usePosts";
import type { Post } from "../hooks/usePosts";

export const Following = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("writers");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState("all");
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const { followingIds, toggleFollow } = useFollowingList();
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setOpenActionMenuId(null);
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

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(null), 1800);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await postService.getAllPosts(50);
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleToggleSave = async (postId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    await toggleBookmark(postId);
    setActionMessage(bookmarkedIds.has(postId) ? "Removed from saved" : "Saved to reading list");
  };

  const handleToggleFollow = async (authorId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const isNowFollowing = await toggleFollow(authorId);
    setActionMessage(isNowFollowing ? "Following" : "Unfollowed");
  };

  const copyPostLink = async (id: string) => {
    const postUrl = `${window.location.origin}/blog/${id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setActionMessage("Post link copied");
    } catch {
      setActionMessage("Clipboard unavailable");
    }
  };

  const visibleFeed = posts.filter((post) => {
    if (activeTab === "writers") {
      return post.author && followingIds.has(post.author.id);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground flex flex-col transition-colors duration-300">
      <header className="fixed top-0 inset-x-0 z-50 w-full bg-universe-900/95 backdrop-blur border-b border-universe-700 h-16 flex items-center px-4 gap-4 font-sans">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileSidebarOpen(!isMobileSidebarOpen);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="p-2 rounded-full text-universe-muted transition-colors focus:outline-none hover:bg-universe-800 hover:text-universe-foreground focus:ring-2 focus:ring-universe-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group mr-2">
             <span className="text-xl font-bold tracking-tight text-universe-foreground group-hover:text-universe-highlight transition-colors">ReRitee</span>
          </Link>
        </div>

        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-universe-muted" />
          <input 
            type="text" 
            placeholder="Search ReRitee..." 
            className="w-full bg-universe-800 border border-transparent rounded-full py-2 pl-10 pr-4 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-700 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <button className="md:hidden p-2 text-universe-muted hover:text-universe-foreground rounded-full hover:bg-universe-800 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/write')} 
            className="hidden md:flex items-center gap-2 text-universe-muted hover:text-universe-foreground px-3 py-2 rounded-full hover:bg-universe-800 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-universe-700"
          >
            <PenSquare className="w-4 h-4" /> Write
          </button>
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="p-2 text-universe-muted hover:text-universe-foreground rounded-full hover:bg-universe-800 transition-colors relative focus:outline-none focus:ring-2 focus:ring-universe-700"
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
              className="ml-1 md:ml-2 w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-universe-700 transition-all focus:outline-none focus:ring-2 focus:ring-universe-700"
            >
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" />
              ) : (
                <div className="w-full h-full bg-universe-highlight flex items-center justify-center text-white text-sm font-semibold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-lg border border-universe-700 bg-universe-900 shadow-xl z-50 py-2 divide-y divide-universe-700">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-universe-highlight flex items-center justify-center text-lg font-semibold text-white">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-universe-foreground">User</div>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate("/my-profile");
                        }}
                        className="text-xs text-universe-muted hover:text-universe-foreground transition-colors"
                      >
                        View profile
                      </button>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button onClick={() => { setIsProfileMenuOpen(false); navigate("/settings"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    <Settings className="w-4 h-4 text-universe-muted" /> Settings
                  </button>
                  <button onClick={() => { setIsProfileMenuOpen(false); navigate("/help"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    <HelpCircle className="w-4 h-4 text-universe-muted" /> Help
                  </button>
                </div>

                <div className="py-2">
                  <button onClick={() => { setIsProfileMenuOpen(false); navigate("/membership"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    <Star className="w-4 h-4 text-amber-500" /> Become a member
                  </button>
                </div>

                <div className="py-2">
                  <button onClick={() => { setIsProfileMenuOpen(false); signOut(); navigate("/login"); }} className="w-full text-left px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    Sign out
                  </button>
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
            <h1 className="text-5xl font-serif font-bold mb-8 text-universe-foreground tracking-tight">Following</h1>
            
            <div className="flex items-center gap-3 mb-8 border-b border-universe-700">
              <button 
                onClick={() => setActiveTab("writers")}
                className={cn(
                  "mb-4 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "writers" 
                    ? "text-universe-foreground border-universe-foreground bg-universe-900" 
                    : "text-universe-muted border-universe-700 bg-universe-900 hover:text-universe-foreground"
                )}
              >
                Writers you follow
              </button>
              <button 
                onClick={() => setActiveTab("all")}
                className={cn(
                  "mb-4 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "all" 
                    ? "text-universe-foreground border-universe-foreground bg-universe-900" 
                    : "text-universe-muted border-universe-700 bg-universe-900 hover:text-universe-foreground"
                )}
              >
                Latest
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-universe-highlight animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {visibleFeed.map((post, idx) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative border border-universe-700 rounded-xl p-4"
                  >
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="mb-3 flex items-center gap-2 text-sm text-universe-muted">
                          {post.author?.avatar_url ? (
                            <img src={post.author.avatar_url} alt={post.author.username} className="h-5 w-5 rounded object-cover" />
                          ) : (
                            <div className="h-5 w-5 rounded bg-universe-highlight flex items-center justify-center text-xs text-white">
                              {post.author?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="truncate">
                            by <span className="text-universe-foreground">{post.author?.full_name || post.author?.username || 'Unknown'}</span>
                          </span>
                          {post.author && (
                            <button
                              onClick={() => handleToggleFollow(post.author.id)}
                              className={cn(
                                "ml-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors inline-flex items-center gap-1",
                                followingIds.has(post.author.id) 
                                  ? "border-universe-highlight/40 text-universe-highlight" 
                                  : "border-universe-700 text-universe-muted hover:text-universe-foreground hover:border-universe-foreground"
                              )}
                            >
                              {followingIds.has(post.author.id) ? <><UserMinus className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
                            </button>
                          )}
                        </div>

                        <h3
                          onClick={() => navigate(`/blog/${post.id}`)}
                          className="max-w-[560px] cursor-pointer text-xl font-bold leading-[1.25] tracking-tight text-universe-foreground hover:underline"
                        >
                          {post.title}
                        </h3>
                        <p className="mt-1.5 max-w-[560px] text-xs font-sans leading-5 text-universe-muted/90 line-clamp-2">
                          {post.subtitle || 'No description available'}
                        </p>

                        <div className="mt-3 flex items-center gap-4 text-xs text-universe-muted">
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          <span className="hidden sm:inline">{post.claps_count} claps</span>
                          <span className="hidden sm:inline">{post.comments_count} comments</span>
                          <button 
                            onClick={() => navigate(`/blog/${post.id}`)}
                            className="inline-flex items-center gap-1 transition-colors hover:text-universe-foreground"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Reply</span>
                          </button>
                          <button
                            onClick={() => handleToggleSave(post.id)}
                            className={cn(
                              "inline-flex items-center gap-1 transition-colors",
                              bookmarkedIds.has(post.id) ? "text-universe-foreground" : "hover:text-universe-foreground"
                            )}
                          >
                            <Bookmark className="h-4 w-4" />
                            <span className="hidden sm:inline">{bookmarkedIds.has(post.id) ? "Saved" : "Save"}</span>
                          </button>

                          <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setOpenActionMenuId(prev => (prev === post.id ? null : post.id))}
                              className="rounded-full p-2 text-universe-muted transition-colors hover:bg-universe-800 hover:text-universe-foreground"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>

                            {openActionMenuId === post.id && (
                              <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-xl border border-universe-700 bg-universe-900 shadow-2xl">
                                <button
                                  onClick={() => {
                                    handleToggleSave(post.id);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-universe-foreground transition-colors hover:bg-universe-800"
                                >
                                  <Bookmark className="h-4 w-4 text-universe-muted" />
                                  {bookmarkedIds.has(post.id) ? "Remove saved" : "Save post"}
                                </button>

                                <button
                                  onClick={() => {
                                    copyPostLink(post.id);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-universe-foreground transition-colors hover:bg-universe-800"
                                >
                                  <Copy className="h-4 w-4 text-universe-muted" />
                                  Copy link
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {post.cover_image && (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          onClick={() => navigate(`/blog/${post.id}`)}
                          className="mt-10 h-[80px] w-[128px] cursor-pointer rounded-md object-cover"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {visibleFeed.length === 0 && !loading && (
              <div className="rounded-xl border border-universe-700 bg-universe-800/40 px-6 py-10 text-center text-universe-muted">
                {activeTab === "writers" ? (
                  <>
                    <p className="mb-4">You're not following anyone yet.</p>
                    <button
                      onClick={() => setActiveTab("all")}
                      className="text-universe-highlight hover:underline"
                    >
                      Discover writers
                    </button>
                  </>
                ) : (
                  "No posts available yet."
                )}
              </div>
            )}

            {actionMessage && (
              <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-full border border-universe-700 bg-universe-900 px-4 py-2 text-sm text-universe-foreground shadow-xl">
                <Check className="h-4 w-4 text-universe-foreground" />
                {actionMessage}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};