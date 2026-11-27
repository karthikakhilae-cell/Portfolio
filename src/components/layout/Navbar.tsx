import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Linkedin, Instagram, ExternalLink, Sun, Moon, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PROFILE_PIC, SOCIAL_LINKS } from "../../constants";
import { useTheme } from "../../hooks/useTheme";

// Primary links stay visible inline; everything else lives in the
// grouped "More" overlay so the bar itself stays short and scannable.
const PRIMARY_LINKS = [
  { name: "Home", path: "/home" },
  { name: "Work", path: "/work" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const MORE_GROUPS = [
  { group: "Work", links: [{ name: "Dashboard", path: "/dashboard" }, { name: "Lab", path: "/lab" }] },
  { group: "Writing", links: [{ name: "Thinking", path: "/thinking" }, { name: "Blogs", path: "/blogs" }, { name: "Journal", path: "/journal" }] },
  { group: "Explore", links: [{ name: "Life", path: "/life" }, { name: "Arts", path: "/arts" }, { name: "Store", path: "/store" }] },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const isLandingPage = location.pathname === "/";
  // pages with a dark hero: navbar needs light text until it gains its own bg
  const onDarkPage = location.pathname === "/about";
  const lightText = onDarkPage && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLandingPage) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 px-4 sm:px-8 md:px-12 lg:px-16 flex justify-between items-center transition-all duration-500 ${
          scrolled
            ? "py-3 md:py-4 bg-bg/95 backdrop-blur-xl border-b border-line/10 shadow-sm"
            : "py-5 md:py-7 bg-transparent border-b border-transparent"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5 md:gap-3 group cursor-pointer"
          onClick={() => navigate('/about')}
        >
          <div className="relative">
            <img
              src={PROFILE_PIC}
              alt="Akhil"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-ink/10 group-hover:border-accent transition-colors"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-bg rounded-full" />
          </div>
          <div className={`text-sm md:text-base font-display tracking-tight leading-tight ${lightText ? "text-white" : "text-ink"}`}>
            Akhil Karthik
            <div className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-muted">Data &amp; AI</div>
          </div>
        </motion.div>

        <div className={`hidden lg:flex items-center gap-7 xl:gap-9 text-[11px] uppercase tracking-[0.15em] font-bold ${lightText ? "text-white/70" : "text-ink/70"}`}>
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative transition-colors hover:text-accent ${location.pathname === link.path ? "text-accent" : ""}`}
            >
              {link.name}
            </Link>
          ))}
          <button onClick={() => setIsMenuOpen(true)} className="transition-colors hover:text-accent">
            More
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className={`p-2 rounded-full transition-colors ${lightText ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5"}`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/hire-me"
            className="hidden sm:inline-flex items-center gap-2 bg-accent text-white px-5 md:px-6 py-2.5 md:py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-ink transition-colors"
          >
            Let's Talk <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-full hover:bg-ink/5 transition-colors ${lightText ? "text-white" : "text-ink"}`}
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink text-white p-6 md:p-24 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="text-2xl font-display">Index</div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-4 hover:scale-110 transition-transform"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="my-8 md:my-12 overflow-y-auto max-h-[70vh] pr-4 scrollbar-hide space-y-10 md:space-y-14">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent/70 mb-4 md:mb-6">Main</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 md:gap-x-24 gap-y-5 md:gap-y-6">
                  {[...PRIMARY_LINKS, { name: "Hire Me", path: "/hire-me" }].map((link, i) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-end gap-3 md:gap-4"
                      >
                        <span className="text-[9px] md:text-[10px] font-bold opacity-20 group-hover:opacity-100 transition-opacity mb-1 md:mb-2">0{i + 1}</span>
                        <span className="text-3xl sm:text-4xl md:text-6xl font-display hover:text-accent transition-all duration-500 group-hover:pl-2 md:group-hover:pl-4">
                          {link.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {MORE_GROUPS.map((section, gi) => (
                <div key={section.group}>
                  <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent/70 mb-4 md:mb-6">{section.group}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 md:gap-x-24 gap-y-5 md:gap-y-6">
                    {section.links.map((link, i) => (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (gi * 3 + i) * 0.03 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="group flex items-end gap-3 md:gap-4"
                        >
                          <span className="text-[9px] md:text-[10px] font-bold opacity-20 group-hover:opacity-100 transition-opacity mb-1 md:mb-2">0{i + 1}</span>
                          <span className="text-2xl sm:text-3xl md:text-5xl font-display hover:text-accent transition-all duration-500 group-hover:pl-2 md:group-hover:pl-4">
                            {link.name}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-12 pt-12 border-t border-white/10">
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-30">Get in touch</div>
                <a href={SOCIAL_LINKS.email} className="text-2xl md:text-4xl font-display hover:text-accent transition-colors">{SOCIAL_LINKS.email.replace('mailto:', '')}</a>
              </div>
              <div className="flex gap-8">
                <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><Github className="w-6 h-6" /></a>
                <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><Instagram className="w-6 h-6" /></a>
                <a href={SOCIAL_LINKS.medium} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><ExternalLink className="w-6 h-6" /></a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
