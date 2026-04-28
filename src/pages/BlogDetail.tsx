import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppSidebar } from "../components/layout/AppSidebar";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { followService } from "../services/followService";
import { likeService } from "../services/likeService";
import { commentService } from "../services/commentService";
import { bookmarkService } from "../services/bookmarkService";
import type { Comment } from "../services/commentService";
import {
  Menu,
  Search,
  Bell,
  PenSquare,
  MoreHorizontal,
  MessageCircle,
  Bookmark,
  Heart,
  Settings,
  HelpCircle,
  Star,
  Loader2,
  Send,
} from "lucide-react";

export const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { posts } = useApp();
  
  const currentPost = posts.find((item) => item.id === id) || posts[0];
  const authorUsername = currentPost?.author?.username || 'unknown';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [claps, setClaps] = useState(currentPost?.claps_count || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

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

  useEffect(() => {
    if (user && id) {
      checkUserStatus();
      loadComments();
    }
  }, [user, id]);

  const checkUserStatus = async () => {
    if (!user || !id) return;
    
    const [likedStatus, bookmarkedStatus, followStatus] = await Promise.all([
      likeService.hasUserLiked(user.id, id),
      bookmarkService.isBookmarked(user.id, id),
      followService.isFollowing(user.id, currentPost?.author_id || '')
    ]);
    
    setLiked(likedStatus);
    setSaved(bookmarkedStatus);
    setIsFollowing(followStatus);
  };

  const loadComments = async () => {
    if (!id) return;
    const { data } = await commentService.getCommentsByPost(id);
    if (data) setComments(data);
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!id) return;
    
    setLoading(true);
    const isNowLiked = await likeService.toggleLike(id);
    setLiked(isNowLiked);
    setClaps(prev => isNowLiked ? prev + 1 : prev - 1);
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!currentPost?.author_id) return;
    
    setLoading(true);
    const isNowFollowing = await followService.toggleFollow(currentPost.author_id);
    setIsFollowing(isNowFollowing);
    setLoading(false);
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!id) return;
    
    const isNowSaved = await bookmarkService.toggleBookmark(id);
    setSaved(isNowSaved);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !id) return;
    
    setSubmittingComment(true);
    const { data } = await commentService.addComment(id, newComment.trim());
    if (data) {
      setComments(prev => [...prev, data]);
      setNewComment("");
    }
    setSubmittingComment(false);
  };

  // Render article content from database - NOT hardcoded
  const articleParagraphs = useMemo(() => {
    if (!currentPost) return [];
    
    // Try to get content from the post - handle both string and object formats
    const rawContent = currentPost.content;
    let contentText = '';
    
    if (typeof rawContent === 'string') {
      contentText = rawContent;
    } else if (Array.isArray(rawContent)) {
      // Handle array of content blocks
      contentText = rawContent.map((block: any) => block.content || '').filter(Boolean).join('\n\n');
    } else if (rawContent && typeof rawContent === 'object') {
      // Handle object format - try common fields
      contentText = rawContent.body || rawContent.text || rawContent.content || '';
    }
    
    // Split content into paragraphs
    if (contentText) {
      return contentText.split('\n\n').filter(p => p.trim());
    }
    
    // Fallback to subtitle if no content
    if (currentPost.subtitle) {
      return [currentPost.subtitle, 'Click the button above to read the full article when the author publishes the complete content.'];
    }
    
    // No content available
    return [
      'This article is waiting for the author to publish its content.',
      'The title suggests there is more to come - check back later!',
    ];
  }, [currentPost]);

  const moreFromAuthor = posts.filter((item) => item.author_id === currentPost?.author_id && item.id !== id).slice(0, 4);
  const recommendedPosts = posts.filter((item) => item.id !== id).slice(0, 6);

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-universe-900 text-universe-foreground flex items-center justify-center">
        <p className="text-universe-muted">Post not found</p>
      </div>
    );
  }

  const authorName = currentPost.author?.full_name || currentPost.author?.username || 'Unknown Author';
  const authorAvatar = currentPost.author?.avatar_url;

  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground flex flex-col transition-colors duration-300">
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
            className="p-2 rounded-full text-universe-muted transition-colors focus:outline-none hover:bg-universe-800 hover:text-universe-foreground focus:ring-2 focus:ring-universe-700"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 group mr-2">
            <span className="text-lg font-serif font-bold tracking-tight text-universe-foreground group-hover:text-universe-highlight transition-colors">ReRitee</span>
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
            onClick={() => navigate("/write")}
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
              <div className="absolute right-0 mt-3 w-80 rounded-lg border border-universe-700 bg-universe-900 shadow-xl z-50 overflow-hidden">
                <div className="p-5 border-b border-universe-700">
                  <h2 className="text-xl font-bold text-universe-foreground">Notifications</h2>
                </div>
                <div className="p-6 text-center text-sm text-universe-muted">You're all caught up.</div>
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
              ) : profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" />
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
                      {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-universe-foreground">
                        {profile?.username || profile?.full_name || 'User'}
                      </div>
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
                  <button onClick={() => navigate("/settings")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    <Settings className="w-4 h-4 text-universe-muted" /> Settings
                  </button>
                  <button onClick={() => navigate("/help")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    <HelpCircle className="w-4 h-4 text-universe-muted" /> Help
                  </button>
                </div>

                <div className="py-2">
                  <button onClick={() => navigate("/membership")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    <Star className="w-4 h-4 text-amber-500" /> Become a member
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

        <main className={cn("flex-1 transition-all duration-300", !isSidebarCollapsed ? "lg:ml-60" : "lg:ml-0")}>
          <article className="max-w-[720px] mx-auto px-4 md:px-6 pt-8 pb-14">
            <div className="mb-6 flex items-center gap-2 text-xs text-universe-muted">
              {authorAvatar && <img src={authorAvatar} alt={authorName} className="w-5 h-5 rounded object-cover" />}
              <span>{authorName}</span>
            </div>

            <h1 className="text-xl md:text-2xl leading-tight font-bold tracking-tight text-universe-foreground mb-2.5">{currentPost.title}</h1>
            <p className="text-xs md:text-sm text-universe-muted mb-3.5">{currentPost.subtitle}</p>

            <div className="flex flex-wrap items-center justify-between gap-3 border-y border-universe-700 py-2.5 mb-7">
              <div className="flex items-center gap-2 text-xs text-universe-muted">
                <span className="text-universe-foreground">The AI edge</span>
                <button 
                  onClick={handleFollow}
                  disabled={loading}
                  className={cn(
                    "px-2.5 py-0.5 text-xs rounded-full border transition-colors disabled:opacity-50",
                    isFollowing 
                      ? "border-universe-foreground text-universe-foreground" 
                      : "border-universe-700 hover:border-universe-foreground"
                  )}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <span>·</span>
                <span>{new Date(currentPost.created_at).toLocaleDateString()}</span>
                <span>·</span>
                <span>{currentPost.read_time || 5} min</span>
              </div>
              <div className="flex items-center gap-3 text-universe-muted">
                <button 
                  onClick={handleLike}
                  disabled={loading}
                  className={cn(
                    "flex items-center gap-1 hover:text-universe-foreground transition-colors disabled:opacity-50",
                    liked && "text-red-500"
                  )}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={cn("w-4 h-4", liked && "fill-current")} />}
                  <span>{claps}</span>
                </button>
                <button className="hover:text-universe-foreground transition-colors"><MessageCircle className="w-4 h-4" /></button>
                <button 
                  onClick={handleBookmark}
                  className={cn("hover:text-universe-foreground transition-colors", saved ? "text-universe-foreground" : "")}
                > 
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="hover:text-universe-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>

            {currentPost.cover_image && (
              <div className="mb-7">
                <img src={currentPost.cover_image} alt={currentPost.title} className="w-full h-auto max-h-[380px] object-cover rounded-md border border-universe-700" />
                <p className="text-center text-[11px] text-universe-muted mt-2">Image gallery for sample.</p>
              </div>
            )}

            <div className="space-y-3.5 text-[14px] leading-6 text-universe-foreground/90">
              {articleParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="my-10 rounded-xl border border-universe-700 bg-universe-800/40 px-5 py-7 text-center">
              <h3 className="text-lg font-serif text-universe-foreground mb-2">Become a member to read the full story</h3>
              <p className="text-xs text-universe-muted mb-5">Access member-only stories and unlock deeper insights.</p>
              <button onClick={() => navigate("/membership")} className="rounded-full bg-universe-foreground text-universe-900 px-4 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity">Upgrade</button>
            </div>

            <div className="border-t border-universe-700 pt-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {authorAvatar && <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-md object-cover" />}
                  <div>
                    <p className="text-sm text-universe-muted">Published in ReRitee</p>
                    <p className="text-xs text-universe-foreground">Written by {authorName}</p>
                  </div>
                </div>
                <button 
                  onClick={handleFollow}
                  disabled={loading}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50",
                    isFollowing 
                      ? "border-universe-foreground text-universe-foreground" 
                      : "border-universe-700 hover:border-universe-foreground"
                  )}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            </div>

            <section className="mt-9">
              <h2 className="text-base font-semibold mb-3">Responses ({comments.length})</h2>
              
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="flex-1 bg-universe-800 border border-universe-700 rounded-lg px-4 py-2 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-4 py-2 bg-universe-highlight text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full mb-4 rounded-lg border border-universe-700 bg-universe-800/30 p-3 text-xs text-universe-muted hover:border-universe-highlight hover:text-universe-highlight transition-colors"
                >
                  Sign in to leave a response
                </button>
              )}

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-universe-800/30 border border-universe-700">
                    <img 
                      src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author?.username || 'U'}`} 
                      alt={comment.author?.username || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-universe-foreground">
                          {comment.author?.full_name || comment.author?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-universe-muted">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-universe-foreground/90">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-xs text-universe-muted text-center py-4">No responses yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </section>

            <section className="mt-14">
              <h2 className="text-base font-semibold mb-4">More from {authorName}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {moreFromAuthor.length === 0 && (
                  <div className="text-xs text-universe-muted">No more stories from this author yet.</div>
                )}
                {moreFromAuthor.map((item) => (
                  <button key={item.id} onClick={() => navigate(`/blog/${item.id}`)} className="text-left rounded-lg border border-universe-700 overflow-hidden hover:border-universe-foreground transition-colors">
                    {item.cover_image && <img src={item.cover_image} alt={item.title} className="h-32 w-full object-cover" />}
                    <div className="p-3">
                      <p className="line-clamp-2 text-xs font-semibold text-universe-foreground">{item.title}</p>
                      <p className="mt-2 text-xs text-universe-muted">{new Date(item.created_at).toLocaleDateString()} · {item.read_time || 5} min</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-14">
              <h2 className="text-base font-semibold mb-4">Recommended for you</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendedPosts.map((item) => {
                  const itemAuthorName = item.author?.full_name || item.author?.username || 'Unknown';
                  return (
                    <button key={item.id} onClick={() => navigate(`/blog/${item.id}`)} className="text-left rounded-lg border border-universe-700 overflow-hidden hover:border-universe-foreground transition-colors">
                      {item.cover_image && <img src={item.cover_image} alt={item.title} className="h-28 w-full object-cover" />}
                      <div className="p-3">
                        <p className="line-clamp-2 text-xs font-semibold text-universe-foreground">{item.title}</p>
                        <p className="mt-2 text-xs text-universe-muted">{itemAuthorName} · {item.read_time || 5} min</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <footer className="mt-14 pt-6 border-t border-universe-700 text-xs text-universe-muted flex flex-wrap gap-x-4 gap-y-2">
              <span>Help</span>
              <span>Status</span>
              <span>About</span>
              <span>Terms</span>
              <span>Privacy</span>
            </footer>
          </article>
        </main>
      </div>
    </div>
  );
};