import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  Activity, 
  PenSquare,
  User,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

// Mock data for users you are ALREADY following (fallback if no DB data)
const YOUR_FOLLOWING = [
  { id: "1", name: "Activated Thinker", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { id: "2", name: "Startup Stash", avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&q=80" },
  { id: "3", name: "Zack Liu", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
  { id: "4", name: "Andy Murphy", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  { id: "5", name: "The Geopolitical Economist", avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=150&q=80" },
  { id: "6", name: "Ken McMullen", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80" },
  { id: "7", name: "Emma. T", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" },
  { id: "8", name: "Invisible Illness", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80" },
  { id: "9", name: "Stackademic", avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=150&q=80" },
  { id: "10", name: "Predict", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
  isFixed?: boolean;
}

export const AppSidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isFixed = false }: AppSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const [followingUsers, setFollowingUsers] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleFollowingCount, setVisibleFollowingCount] = useState(8);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  // Fetch following users from Supabase (only once, only if logged in)
  useEffect(() => {
    if (!user || fetchedRef.current) return;
    
    const fetchFollowing = async () => {
      fetchedRef.current = true;
      setLoadingFollowing(true);
      
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .limit(20)
        
        if (error) {
          console.error('Error fetching following:', error)
          fetchedRef.current = false;
          return;
        }
        
        if (data && data.length > 0) {
          const userIds = data.map(f => f.following_id);
          
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds)
          
          if (profiles) {
            setFollowingUsers(profiles.map(p => ({
              id: p.id,
              name: p.username || 'Unknown',
              avatar: p.avatar_url || ''
            })));
          }
        }
      } catch (err) {
        console.error('Error in following fetch:', err);
        fetchedRef.current = false;
      } finally {
        setLoadingFollowing(false);
      }
    }
    
    fetchFollowing()
  }, [user])

  // Handle responsive state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true); 
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsCollapsed]);

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: BookOpen, label: "Library", path: "/library" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: PenSquare, label: "Stories", path: "/stories" },
    { icon: Activity, label: "Stats", path: "/stats" },
  ];

  // Use DB data if available, otherwise fallback to mock data
  const displayFollowing = followingUsers.length > 0 ? followingUsers : YOUR_FOLLOWING.slice(0, 8);
const sidebarWidth = isCollapsed ? "w-0 border-none" : "w-60";
  const visibleFollowing = displayFollowing.slice(0, visibleFollowingCount);
  const hasMoreFollowing = visibleFollowingCount < displayFollowing.length;

const handleShowMoreFollowing = () => {
    setVisibleFollowingCount(displayFollowing.length);
  };
  
  return (
    <>
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div 
        ref={sidebarRef}
        className={cn(
          "flex flex-col bg-universe-900 border-r border-universe-700 z-[60] transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden [scrollbar-width:auto] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-universe-800/50 [&::-webkit-scrollbar-thumb]:bg-universe-muted/70 [&::-webkit-scrollbar-thumb]:rounded-full font-sans",
          isMobile
            ? (isMobileOpen ? "fixed left-0 top-0 bottom-0 translate-x-0 w-60 shadow-2xl" : "fixed left-0 top-0 bottom-0 -translate-x-full w-60")
            : isFixed
              ? `fixed left-0 top-16 bottom-0 ${sidebarWidth}`
              : `sticky top-0 h-screen ${sidebarWidth}`
        )}
      >
        
        <nav className="flex-col gap-1 w-full px-4 flex mt-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 group px-3 py-2.5 rounded-md transition-all duration-200 outline-none",
                  isActive
                    ? "text-universe-foreground font-medium"
                    : "text-universe-muted hover:text-universe-foreground hover:bg-universe-800"
                )}
              >
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-universe-foreground rounded-full" />}
                <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-universe-foreground" : "text-universe-muted group-hover:text-universe-foreground")} />
                <span className="text-sm font-medium transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-4 flex-1 flex flex-col min-h-0 animate-in fade-in duration-300 border-t border-universe-700 pt-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <Link to="/following" className="inline-flex items-center gap-2 text-[15px] font-medium text-universe-foreground hover:text-universe-highlight transition-colors">
              <Users className="w-5 h-5" />
              Following
            </Link>
          </div>

          <div className="space-y-1 pb-4 px-2">
            {visibleFollowing.map((user) => (
              <Link 
                key={user.id} 
                to={`/profile/${user.id}`}
                className="flex items-center gap-2.5 hover:bg-universe-800 px-1.5 py-1.5 rounded-lg transition-colors group"
              >
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-sm leading-none font-medium text-universe-muted group-hover:text-universe-foreground transition-colors truncate flex-1">
                  {user.name}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              </Link>
            ))}

            {hasMoreFollowing && (
              <button
                onClick={handleShowMoreFollowing}
                className="inline-flex items-center mt-1 px-1 text-sm text-universe-muted hover:text-universe-foreground transition-colors"
              >
                More
              </button>
            )}

            {!hasMoreFollowing && (
              <Link
                to="/following"
                className="inline-flex items-center mt-2 px-1 text-sm text-universe-highlight hover:text-universe-highlight/80 transition-colors"
              >
                See suggestions
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};
