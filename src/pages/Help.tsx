import { Navbar } from "../components/layout/Navbar";
import {
  Search,
  Compass,
  UserCircle2,
  BookOpen,
  PenSquare,
  NotebookPen,
  BadgeDollarSign,
  Newspaper,
  FileCheck,
  Shield,
  ChevronUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const HELP_SECTIONS = [
  {
    icon: Compass,
    title: "Getting started",
    description: "Learn the basics and set up your account quickly.",
    items: ["Sign in or sign up", "Using ReRitee", "Membership overview", "Platform glossary"],
  },
  {
    icon: UserCircle2,
    title: "Managing your account",
    description: "Everything related to profile, preferences, and security.",
    items: ["Profile page", "Profile URL", "Email preferences", "Manage social accounts"],
  },
  {
    icon: BookOpen,
    title: "Reading",
    description: "Control your reading experience on ReRitee.",
    items: ["Your homepage", "Create and manage lists", "Recommendations", "Mute users or publications"],
  },
  {
    icon: PenSquare,
    title: "Managing stories",
    description: "Manage your stories, stats, and story settings.",
    items: ["Story stats", "Detailed story page", "Audience stats", "Email subscriptions"],
  },
  {
    icon: NotebookPen,
    title: "Writing & editing",
    description: "Master writing and editing workflows.",
    items: ["Write your first story", "Create/edit/delete a story", "Using editor tools", "Using images and topics"],
  },
  {
    icon: Compass,
    title: "Distribution",
    description: "Understand how stories are distributed.",
    items: ["What happens after publishing", "Distribution guidelines", "Boost and network distribution", "Common review outcomes"],
  },
  {
    icon: BadgeDollarSign,
    title: "Partner Program",
    description: "Start earning from your writing.",
    items: ["Program guide", "Eligibility", "Earnings dashboard", "Calculating earnings"],
  },
  {
    icon: Newspaper,
    title: "Publications",
    description: "Set up and manage ReRitee publications.",
    items: ["Getting started", "Submit stories", "Manage submissions", "Publication settings"],
  },
  {
    icon: FileCheck,
    title: "Terms & Policies",
    description: "The fine print and policy resources.",
    items: ["Terms of service", "Platform rules", "Privacy policy", "Partner program terms"],
  },
  {
    icon: BookOpen,
    title: "Content",
    description: "Content policy and editorial standards.",
    items: ["Content policy", "Sensitive content", "Best practices", "Journalism on ReRitee"],
  },
  {
    icon: Shield,
    title: "Safety",
    description: "Safety and user protection tools.",
    items: ["Block a user", "Manage responses", "Report posts and users", "User data protection"],
  },
];

export const Help = () => {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground font-sans selection:bg-universe-highlight/30 transition-colors duration-300">
      <Navbar />

      <section
        className="relative overflow-hidden pt-28 pb-16 px-6 border-b border-universe-700"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=3200&q=100')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-universe-900/20 via-universe-900/4 to-transparent" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="px-4 py-8 sm:px-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">How can we help?</h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-universe-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Search help articles..."
                className="w-full bg-white/95 border border-white/70 rounded-full py-3.5 pl-12 pr-6 text-black placeholder-black/50 focus:border-universe-highlight focus:ring-1 focus:ring-universe-highlight outline-none transition-colors shadow-xl"
              />
            </div>
            <p className="mt-4 text-xs sm:text-sm text-white/95 [text-shadow:0_1px_6px_rgba(0,0,0,0.28)]">
              Popular: Membership · Partner Program · Sign in
            </p>
          </div>
        </div>
      </section>

      <main className="py-14 px-6 max-w-6xl mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_SECTIONS.map((section) => (
            <article
              key={section.title}
              className="border border-universe-700 bg-universe-800/20 rounded-xl p-6 min-h-[250px]"
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-5 h-5 text-universe-foreground" />
                <h2 className="font-semibold text-lg text-universe-foreground">{section.title}</h2>
              </div>

              <p className="text-sm text-universe-muted mb-4 leading-relaxed">{section.description}</p>

              <ul className="space-y-2 mb-5">
                {section.items.map((item) => (
                  <li key={item} className="text-sm text-universe-muted leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>

              <button className="text-xs px-3 py-1 rounded-full border border-universe-highlight/50 text-universe-highlight hover:bg-universe-highlight/10 transition-colors">
                See all...
              </button>
            </article>
          ))}
        </div>

        <div className="mt-16 py-16 text-center border border-universe-700 rounded-2xl bg-universe-800">
          <div>
            <h3 className="text-3xl font-serif text-universe-foreground mb-6">Can&apos;t find what you&apos;re looking for?</h3>
            <button className="px-5 py-2.5 rounded-full bg-universe-highlight text-white text-sm font-medium hover:bg-universe-highlight/90 transition-colors shadow-sm">
              Submit a request
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-universe-900 border-t border-universe-700 px-6 py-7">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-universe-muted">
            <Link to="/stats" className="hover:text-universe-foreground transition-colors">Status</Link>
            <Link to="/about" className="hover:text-universe-foreground transition-colors">Writers</Link>
            <Link to="/about" className="hover:text-universe-foreground transition-colors">Blog</Link>
            <Link to="/about" className="hover:text-universe-foreground transition-colors">Careers</Link>
            <Link to="/privacy" className="hover:text-universe-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-universe-foreground transition-colors">Terms</Link>
            <Link to="/about" className="hover:text-universe-foreground transition-colors">About</Link>
          </div>

          <button
            onClick={handleScrollTop}
            className="w-7 h-7 rounded-sm border border-universe-700 text-universe-muted hover:text-universe-foreground hover:border-universe-foreground/40 transition-colors flex items-center justify-center"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
