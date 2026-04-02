import { motion } from "motion/react";
import { Mail, Linkedin, Github, Instagram, ArrowRight, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";
import { SOCIAL_LINKS } from "../constants";

export default function Contact() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: "success", message: "Thank you! Your inquiry has been submitted." });
        setFormState({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus({ type: "error", message: data.error || "Something went wrong. Please try again." });
      }
    } catch (error) {
      setSubmitStatus({ type: "error", message: "Failed to connect to the server. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-32 pb-20 px-6 md:px-24 min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto text-center mb-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl mb-8 font-display"
        >
          Ready to curate your next <span className="text-accent">meaningful</span> project?
        </motion.h1>
        <motion.a 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          href={SOCIAL_LINKS.email} 
          className="text-3xl md:text-5xl font-display hover:text-accent transition-colors border-b border-accent pb-2"
        >
          {SOCIAL_LINKS.email.replace('mailto:', '')}
        </motion.a>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-muted mt-8">
          Currently accepting select inquiries for Q2 2026
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-24 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div>
            <h3 className="text-2xl mb-6">Let's build something <span>meaningful.</span></h3>
            <p className="text-muted leading-relaxed">
              Currently accepting select commissions for late 2026 and 2027. I am particularly interested in projects involving cultural institutions and sustainable brands.
            </p>
          </div>
          
          <div className="space-y-6">
            <a href={SOCIAL_LINKS.email} className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-line flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Email</div>
                <div className="text-sm">{SOCIAL_LINKS.email.replace('mailto:', '')}</div>
              </div>
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-line flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <Linkedin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted">LinkedIn</div>
                <div className="text-sm">linkedin.com/in/akhilkarthikk</div>
              </div>
            </a>
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-line flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted">GitHub</div>
                <div className="text-sm">github.com/akhilkarthik</div>
              </div>
            </a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group">
              <div className="w-12 h-12 rounded-full border border-line flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Instagram</div>
                <div className="text-sm">instagram.com/akhilkarthik.de</div>
              </div>
            </a>
          </div>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleFormSubmit} 
          className="bg-white p-12 rounded-3xl shadow-xl space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Full Name</label>
              <input 
                type="text" 
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                className="w-full border-b border-line py-2 focus:border-accent outline-none transition-colors bg-transparent" 
                placeholder="John Doe" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Email Address</label>
              <input 
                type="email" 
                required
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full border-b border-line py-2 focus:border-accent outline-none transition-colors bg-transparent" 
                placeholder="john@example.com" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Your Inquiry</label>
            <textarea 
              required
              value={formState.message}
              onChange={(e) => setFormState({ ...formState, message: e.target.value })}
              className="w-full border-b border-line py-2 focus:border-accent outline-none transition-colors bg-transparent h-32 resize-none" 
              placeholder="Tell me about your project..." 
            />
          </div>
          
          {submitStatus && (
            <div className={`text-xs font-bold uppercase tracking-widest p-4 rounded-xl ${submitStatus.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              {submitStatus.message}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-white py-5 rounded-xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest hover:bg-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Message <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.form>
      </div>
    </main>
  );
}
