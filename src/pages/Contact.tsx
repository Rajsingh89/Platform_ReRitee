import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { Mail, MapPin } from "lucide-react";

export const Contact = () => {
  return (
    <div className="min-h-screen bg-universe-900 text-universe-foreground font-sans selection:bg-universe-highlight/30">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-16">
        
        {/* Contact Info */}
        <div className="flex-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-serif font-bold mb-6 text-universe-foreground"
          >
            Get in touch.
          </motion.h1>
          {/* FIXED: Replaced text-gray-400 with text-universe-muted */}
          <p className="text-universe-muted mb-12 text-lg">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-universe-800 text-universe-highlight">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-universe-foreground">Email</h3>
                <p className="text-universe-muted">hello@reritee.com</p>
                <p className="text-universe-muted">support@reritee.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-universe-800 text-universe-highlight">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-universe-foreground">Office</h3>
                <p className="text-universe-muted">123 Cognitive Way</p>
                <p className="text-universe-muted">San Francisco, CA 94103</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-universe-800/50 p-8 rounded-3xl border border-universe-700"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-universe-muted">First Name</label>
                <input type="text" className="w-full bg-universe-900 border border-universe-700 rounded-lg p-3 text-universe-foreground focus:border-universe-highlight focus:outline-none transition-colors" placeholder="Jane" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-universe-muted">Last Name</label>
                <input type="text" className="w-full bg-universe-900 border border-universe-700 rounded-lg p-3 text-universe-foreground focus:border-universe-highlight focus:outline-none transition-colors" placeholder="Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-universe-muted">Email</label>
              <input type="email" className="w-full bg-universe-900 border border-universe-700 rounded-lg p-3 text-universe-foreground focus:border-universe-highlight focus:outline-none transition-colors" placeholder="jane@example.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-universe-muted">Message</label>
              <textarea rows={4} className="w-full bg-universe-900 border border-universe-700 rounded-lg p-3 text-universe-foreground focus:border-universe-highlight focus:outline-none transition-colors resize-none" placeholder="Tell us what's on your mind..." />
            </div>

            <Button className="w-full" size="lg">Send Message</Button>
          </form>
        </motion.div>

      </main>
    </div>
  );
};
