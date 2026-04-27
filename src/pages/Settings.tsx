import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Menu,
  Search,
  PenSquare,
  Bell,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { AppSidebar } from "../components/layout/AppSidebar";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const SETTINGS_TABS = [
  "Account",
  "Publishing",
  "Notifications",
  "Membership and payment",
  "Security and apps",
];

const accountRows = (email: string | undefined, username: string | undefined, fullName: string | undefined) => [
  { title: "Email address", helper: "", value: email || "" },
  { title: "Username and subdomain", helper: "", value: username ? `@${username}` : "" },
  {
    title: "Profile information",
    helper: "Edit your photo, name, pronouns, short bio, etc.",
    value: fullName || username || "User",
    hasArrow: true,
  },
  {
    title: "Profile design",
    helper: "Customize the appearance of your profile.",
    value: "",
    hasArrow: true,
  },
  {
    title: "Custom domain",
    helper: "Upgrade to a Medium Membership to redirect your profile URL to a domain like yourdomain.com.",
    value: "None",
    hasArrow: true,
  },
  {
    title: "Partner Program",
    helper: "You are not enrolled in the Partner Program.",
    value: "",
    hasArrow: true,
  },
  { title: "Your Medium Digest frequency", helper: "Adjust how often you see a new Digest.", value: "Daily", hasDropdown: true },
  {
    title: "Provide Feedback",
    helper: "Receive occasional invitations to share your feedback with Medium.",
    value: "",
    hasToggle: true,
  },
  {
    title: "Refine recommendations",
    helper: "Adjust recommendations by updating what you're following and more.",
    value: "",
    hasArrow: true,
  },
  { title: "Muted writers and publications", helper: "", value: "", hasArrow: true },
  { title: "Blocked users", helper: "", value: "", hasArrow: true },
];

const helpLinks = [
  "Sign in or sign up to Medium",
  "Your profile page",
  "Writing and publishing your first story",
  "About Medium's distribution system",
  "Get started with the Partner Program",
];

export const Settings = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Account");
  const [digestFrequency, setDigestFrequency] = useState<"Daily" | "Weekly" | "Off">("Daily");
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
    }
  };

  const cycleDigestFrequency = () => {
    setDigestFrequency((prev) => {
      if (prev === "Daily") return "Weekly";
      if (prev === "Weekly") return "Off";
      return "Daily";
    });
  };

  const handleRowAction = (title: string) => {
    switch (title) {
      case "Profile information":
      case "Profile design":
        navigate("/my-profile");
        break;
      case "Custom domain":
      case "Partner Program":
        navigate("/membership");
        break;
      case "Refine recommendations":
      case "Muted writers and publications":
      case "Blocked users":
        navigate("/following");
        break;
      default:
        break;
    }
  };

  const handleDeactivateAccount = () => {
    if (window.confirm("Deactivate account? You can reactivate by signing in again.")) {
      alert("Your account is marked for deactivation.");
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Delete account permanently? This action cannot be undone.")) {
      alert("Account deletion request submitted.");
    }
  };

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
            <span className="text-[2rem] font-serif font-medium tracking-tight text-universe-foreground">ReRitee</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-universe-muted" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-universe-800/50 border border-universe-700 rounded-full py-2 pl-11 pr-4 text-sm text-universe-foreground placeholder-universe-muted focus:outline-none focus:bg-universe-900 focus:border-universe-highlight transition-all"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <button
            onClick={() => navigate("/write")}
            className="hidden md:flex items-center gap-2 text-universe-muted hover:text-universe-foreground transition-colors text-sm font-normal px-2"
          >
            <PenSquare className="w-5 h-5" /> Write
          </button>
          <button className="p-2 text-universe-muted hover:text-universe-foreground transition-colors rounded-full">
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/my-profile")}
            className="ml-1 w-8 h-8 rounded-full overflow-hidden ring-1 ring-universe-700 hover:ring-universe-foreground transition-all"
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

        <main className={`flex-1 transition-all duration-300 ease-in-out ${!isSidebarCollapsed ? "lg:ml-60" : "lg:ml-0"}`}>
          <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
            <section className="min-w-0 max-w-[760px] w-full justify-self-center px-1 md:px-3">
              <h1 className="text-[2.6rem] font-bold leading-tight mb-8 text-universe-foreground">Settings</h1>

              <div className="flex items-center gap-6 border-b border-universe-700 overflow-x-auto no-scrollbar">
                {SETTINGS_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "text-universe-foreground border-b border-universe-foreground"
                        : "text-universe-muted hover:text-universe-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-2 border-b border-universe-700">
                {accountRows(user?.email, profile?.username, profile?.full_name).map((row, index) => (
                  <div key={row.title} className={`py-5 grid grid-cols-[1fr_auto] gap-6 ${index !== accountRows(user?.email, profile?.username, profile?.full_name).length - 1 ? "border-b border-universe-700/70" : ""}`}>
                    <div>
                      <h3 className="text-sm font-medium text-universe-foreground">{row.title}</h3>
                      {row.helper && <p className="text-xs text-universe-muted mt-1 max-w-[560px]">{row.helper}</p>}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-universe-muted min-w-[140px] justify-end">
                      {!row.hasArrow && !row.hasDropdown && !row.hasToggle && row.value && (
                        <span className="text-universe-muted">{row.value}</span>
                      )}

                      {row.hasDropdown && (
                        <button
                          onClick={cycleDigestFrequency}
                          className="inline-flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          <span>{digestFrequency}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}

                      {row.hasArrow && (
                        <button
                          onClick={() => handleRowAction(row.title)}
                          className="inline-flex items-center gap-1.5 text-universe-muted hover:text-universe-foreground transition-colors"
                        >
                          {row.value && <span>{row.value}</span>}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      {row.hasToggle && (
                        <button
                          onClick={() => setFeedbackEnabled((prev) => !prev)}
                          className={`relative w-10 h-5 rounded-full border transition-colors ${feedbackEnabled ? "bg-universe-highlight/20 border-universe-highlight/60" : "bg-universe-800 border-universe-700"}`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${feedbackEnabled ? "left-[1.15rem] bg-universe-highlight" : "left-0.5 bg-universe-muted"}`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-7 space-y-5">
                <div>
                  <button onClick={handleDeactivateAccount} className="text-sm text-rose-500 hover:text-rose-400 transition-colors">Deactivate account</button>
                  <p className="text-xs text-universe-muted mt-1">Deactivating will suspend your account until you sign back in.</p>
                </div>
                <div>
                  <button onClick={handleDeleteAccount} className="text-sm text-rose-500 hover:text-rose-400 transition-colors">Delete account</button>
                  <p className="text-xs text-universe-muted mt-1">Permanently delete your account and all of your content.</p>
                </div>
              </div>
            </section>

            <aside className="hidden lg:block border-l border-universe-700 pl-7 pt-3">
              <h3 className="text-sm font-semibold text-universe-foreground mb-5">Suggested help articles</h3>
              <div className="space-y-3 mb-8">
                {helpLinks.map((item) => (
                  <button key={item} className="block text-left text-sm text-universe-muted hover:text-universe-foreground transition-colors">
                    {item}
                  </button>
                ))}
              </div>
              <div className="text-xs text-universe-muted/80 leading-6">
                <span className="hover:text-universe-foreground cursor-pointer">Help</span> ·{" "}
                <span className="hover:text-universe-foreground cursor-pointer">Status</span> ·{" "}
                <span className="hover:text-universe-foreground cursor-pointer">About</span> ·{" "}
                <span className="hover:text-universe-foreground cursor-pointer">Careers</span> ·{" "}
                <span className="hover:text-universe-foreground cursor-pointer">Press</span> ·{" "}
                <span className="hover:text-universe-foreground cursor-pointer">Blog</span> ·{" "}
                <span className="hover:text-universe-foreground cursor-pointer">Privacy</span> ·{" "}
                <span className="hover:text-universe-foreground cursor-pointer">Rules</span>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};
