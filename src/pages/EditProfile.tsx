import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Bell, 
  Menu, 
  Search, 
  Settings, 
  HelpCircle, 
  Star, 
  User,
  Camera,
  Loader2,
  Check,
  X,
  ArrowLeft
} from "lucide-react";
import { AppSidebar } from "../components/layout/AppSidebar";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

export const EditProfile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const [username, setUsername] = useState(profile?.username || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [user, profile]);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);

    try {
      let avatarUrl = profile?.avatar_url || null;

      if (avatarFile) {
        const fileName = `avatars/${user.id}/${Date.now()}_${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) {
          throw new Error('Failed to upload avatar');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          full_name: fullName.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) {
        if (error.message.includes('username')) {
          throw new Error('Username already taken');
        }
        throw error;
      }

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground flex flex-col">
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
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-universe-highlight flex items-center justify-center text-white text-sm font-semibold">
                  {fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 rounded-lg border border-universe-700 bg-universe-900 shadow-xl z-50 py-2 divide-y divide-universe-700">
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-full bg-universe-highlight flex items-center justify-center text-lg font-semibold text-white">
                      {username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-universe-foreground">{username || 'User'}</div>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
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
                  <button onClick={() => { navigate("/settings"); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    <Settings className="w-4 h-4 text-universe-muted" /> Settings
                  </button>
                  <button onClick={() => { navigate("/help"); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
                    <HelpCircle className="w-4 h-4 text-universe-muted" /> Help
                  </button>
                </div>

                <div className="py-2">
                  <button onClick={() => { navigate("/membership"); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-universe-foreground hover:bg-universe-800 transition-colors">
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
          <div className="max-w-2xl mx-auto px-4 py-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-universe-muted hover:text-universe-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h1 className="text-3xl font-bold text-universe-foreground mb-2">Edit Profile</h1>
            <p className="text-universe-muted mb-8">Update your public profile information</p>

            {message && (
              <div className={cn(
                "mb-6 p-4 rounded-lg flex items-center gap-2",
                message.type === 'success' ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"
              )}>
                {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-universe-foreground mb-3">Profile Picture</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-universe-800 border-2 border-universe-700">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-10 h-10 text-universe-muted" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-universe-highlight text-white flex items-center justify-center hover:bg-universe-highlight/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-universe-muted mb-1">Upload a new photo</p>
                    <p className="text-xs text-universe-muted">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-universe-foreground mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="Choose a unique username"
                  className="w-full px-4 py-3 rounded-lg bg-universe-800 border border-universe-700 text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-colors"
                />
                <p className="text-xs text-universe-muted mt-1">reritee.com/@{username || 'username'}</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-universe-foreground mb-2">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full px-4 py-3 rounded-lg bg-universe-800 border border-universe-700 text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-colors"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-universe-foreground mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-lg bg-universe-800 border border-universe-700 text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-colors resize-none"
                />
                <p className="text-xs text-universe-muted mt-1 text-right">{bio.length}/300</p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-lg bg-universe-highlight text-white font-medium hover:bg-universe-highlight/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};