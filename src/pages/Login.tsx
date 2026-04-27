import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, X, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.424 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.424 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
    </g>
  </svg>
);

interface LoginProps {
  initialMode?: "login" | "register";
}

export const Login = ({ initialMode = "login" }: LoginProps) => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const isRegister = initialMode === "register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      await refreshProfile();
      navigate("/dashboard");
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccessMessage("Check your email for a confirmation link!");
      setShowEmailForm(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-universe-900/95 flex items-center justify-center p-4 relative transition-colors duration-300">
      <Link 
        to="/" 
        className="absolute top-6 right-6 p-2 rounded-full text-universe-muted hover:bg-universe-highlight/10 hover:text-universe-highlight transition-colors"
      >
        <X className="w-6 h-6" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[600px] bg-universe-900 rounded-3xl p-8 md:p-16 shadow-2xl border border-universe-700 relative text-center"
      >
        <h1 className="text-4xl md:text-5xl font-serif font-medium text-universe-foreground mb-12 tracking-tight">
          {isRegister ? "Join ReRitee." : "Welcome back."}
        </h1>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {!showEmailForm ? (
          <div className="space-y-4 max-w-sm mx-auto">
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-between px-4 py-3 rounded-full border border-universe-foreground/20 bg-transparent hover:border-universe-highlight hover:text-universe-highlight text-universe-foreground transition-all duration-300 group relative overflow-hidden disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-universe-highlight/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <GoogleIcon className="w-5 h-5 relative z-10" />
              <span className="flex-1 text-center font-medium relative z-10">
                {isRegister ? "Sign up with Google" : "Sign in with Google"}
              </span>
              <div className="w-5" />
            </button>
            
            <button 
              onClick={() => setShowEmailForm(true)}
              disabled={loading}
              className="w-full flex items-center justify-between px-4 py-3 rounded-full border border-universe-foreground/20 bg-transparent hover:border-universe-highlight hover:text-universe-highlight text-universe-foreground transition-all duration-300 group relative overflow-hidden disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-universe-highlight/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Mail className="w-5 h-5 relative z-10" />
              <span className="flex-1 text-center font-medium relative z-10">
                {isRegister ? "Sign up with email" : "Sign in with email"}
              </span>
              <div className="w-5" />
            </button>

            </div>
        ) : (
          <form onSubmit={isRegister ? handleEmailSignUp : handleEmailSignIn} className="space-y-4 max-w-sm mx-auto">
            {isRegister && (
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isRegister}
                  className="w-full px-4 py-3 rounded-full border border-universe-foreground/20 bg-universe-800 text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-all"
                />
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-full border border-universe-foreground/20 bg-universe-800 text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-all"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-full border border-universe-foreground/20 bg-universe-800 text-universe-foreground placeholder-universe-muted focus:outline-none focus:border-universe-highlight transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-universe-muted hover:text-universe-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-universe-highlight text-white hover:opacity-90 transition-all duration-300 font-medium disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isRegister ? "Create Account" : "Sign In"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmailForm(false);
                setError("");
                setSuccessMessage("");
              }}
              className="text-sm text-universe-muted hover:text-universe-highlight transition-colors"
            >
              Back to options
            </button>
          </form>
        )}

        <div className="mt-12 text-center">
          <p className="text-base font-medium text-universe-foreground mb-8">
            {isRegister ? "Already have an account?" : "No account?"}{" "}
            <Link 
              to={isRegister ? "/login" : "/register"} 
              className="text-universe-highlight hover:text-universe-highlight/80 font-bold"
            >
              {isRegister ? "Sign in" : "Create one"}
            </Link>
          </p>
          
          <p className="text-xs text-universe-muted max-w-sm mx-auto leading-relaxed">
            Click "{isRegister ? "Sign up" : "Sign in"}" to agree to ReRitee's <Link to="/terms" className="underline hover:text-universe-highlight">Terms of Service</Link> and acknowledge that our <Link to="/privacy" className="underline hover:text-universe-highlight">Privacy Policy</Link> applies to you.
          </p>
        </div>
      </motion.div>
    </div>
  );
};