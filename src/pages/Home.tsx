import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mail, Linkedin, Github, Instagram, ExternalLink, Loader2, BookOpen, Target, Gauge, CalendarClock, Zap, Search, Layers, Code2, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, FormEvent, Suspense, lazy, useRef } from "react";
import { PROJECTS as STATIC_PROJECTS, PROFILE_PIC, SOCIAL_LINKS, SKILLS } from "../constants";
import AntigravitySkills from "../components/home/AntigravitySkills";
import AnalyticsVisuals from "../components/home/AnalyticsVisuals";
import Card3D from "../components/3d/Card3D";
import CircuitLines from "../components/decor/CircuitLines";

const PROCESS_STEPS = [
  { n: "01", icon: Search, title: "Discover", desc: "Understand the data, the business question, and what success actually looks like." },
  { n: "02", icon: Layers, title: "Model", desc: "Design the pipeline or model architecture with the right tools for the problem at hand." },
  { n: "03", icon: Code2, title: "Build", desc: "Ship clean, tested, production-grade work — dashboards, pipelines, or ML services." },
  { n: "04", icon: Activity, title: "Monitor", desc: "Track performance, drift, and real-world impact once it's live." },
];

const HERO_STATS = [
  { icon: Target, value: "20+", label: "Projects Shipped" },
  { icon: Gauge, value: "94%", label: "ML Model Accuracy" },
  { icon: CalendarClock, value: "5+", label: "Years Experience" },
  { icon: Zap, value: "65%", label: "Query Speedup" },
];

const FloatingOrb = lazy(() => import("../components/3d/FloatingOrb"));
const ParticleField = lazy(() => import("../components/3d/ParticleField"));

export default function Home() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const projects = STATIC_PROJECTS;

  // Scroll parallax for hero section
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, type: "inquiry" }),
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
    <main className="bg-bg">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-24 py-32 md:py-0 overflow-hidden">
        {/* 3D particle field background */}
        <Suspense fallback={null}>
          <ParticleField className="absolute inset-0 -z-10" />
        </Suspense>
        {/* Soft glow remnants */}
        <div className="absolute top-0 right-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[80%] bg-accent/4 blur-[140px] rounded-full" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-6 md:mb-8 block">
            Available for hire · Data Science & AI Engineering
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] leading-[0.85] tracking-tighter mb-12 md:mb-16 font-display">
            I build <span className="text-accent">ML pipelines,</span> <br />
            Power BI dashboards, <br />
            <span className="text-ink/40">&amp; AI automation.</span>
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                to="/work"
                className="bg-accent text-white px-8 sm:px-12 py-4 sm:py-6 rounded-full flex items-center justify-center sm:justify-start gap-4 text-xs font-bold uppercase tracking-widest hover:bg-ink transition-all duration-500 shadow-xl shadow-accent/20"
              >
                View Projects <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/hire-me"
                className="bg-white text-ink border border-line/20 px-8 sm:px-12 py-4 sm:py-6 rounded-full flex items-center justify-center sm:justify-start gap-4 text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-white hover:border-ink transition-all duration-500 shadow-xl shadow-ink/5"
              >
                Hire Me <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="max-w-sm space-y-3">
              <p className="text-sm text-muted leading-relaxed font-light">
                I help enterprise teams turn messy data into working ML models, live dashboards, and automated workflows — using Python, Power BI, SQL, and Microsoft Fabric.
              </p>
              <Link to="/blogs" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-accent hover:text-ink transition-colors">
                <BookOpen className="w-3.5 h-3.5" /> Read the latest blogs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </motion.div>

        {/* 3D Floating Orb — background decoration for hero right side */}
        <Suspense fallback={null}>
          <FloatingOrb className="absolute right-0 top-0 w-[45%] h-full hidden md:block opacity-80" />
        </Suspense>

        {/* Circuit-line decoration + label, echoing the "AI meets human" motif */}
        <div className="absolute top-20 right-8 lg:right-16 hidden lg:flex flex-col items-end gap-3 z-10 pointer-events-none">
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-ink/30 text-right leading-relaxed">
            AI + Design <br /> Human + Impact
          </span>
          <CircuitLines variant="corner" className="w-28 h-28 text-ink/15" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.05, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-4 sm:right-8 md:right-12 lg:right-24 bottom-12 sm:bottom-24 w-32 h-44 sm:w-48 sm:h-64 md:w-72 md:h-96 block"
        >
          <div className="relative w-full h-full">
            <img
              src={PROFILE_PIC}
              alt="Akhil Karthik"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-4 -left-4 sm:-bottom-8 sm:-left-8 bg-white/80 backdrop-blur-md p-4 sm:p-8 shadow-2xl rounded-2xl sm:rounded-3xl max-w-[140px] sm:max-w-[220px] border border-white/20">
              <p className="text-[9px] sm:text-[11px] text-ink/60 leading-relaxed font-sans">
                "Data is not just numbers; it's the narrative of progress."
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Work — proof of work, right after the hero */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 pt-16 md:pt-24 pb-8">
        <div className="max-w-4xl mb-10 md:mb-14">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-4 block">Featured Work</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display leading-tight">Live dashboards &amp; tools.</h2>
          <p className="mt-4 text-sm text-muted max-w-xl leading-relaxed font-light">
            Interactive data science and analytics work built on Python, Power BI, and Microsoft Fabric — covering ML, data engineering, and AI automation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              to: "/dashboard", external: false,
              tag: "Power BI · DAX",
              title: "ML Performance Dashboard",
              desc: "Live model monitoring dashboard — accuracy trends, F1/AUC tracking, data drift alerts and pipeline health across 18 deployed models.",
              variant: "light"
            },
            {
              to: "/dashboard", external: false,
              tag: "Power BI · Analytics",
              title: "Enterprise KPI Dashboard",
              desc: "Executive analytics platform — real-time KPIs, drill-through reports, and automated commentary generation using Python + DAX.",
              variant: "dark"
            },
            {
              to: "https://github.com/akhilkarthik/Enterprise-Fabric-Data-Lakehouse", external: true,
              tag: "Microsoft Fabric · Spark",
              title: "Enterprise Lakehouse",
              desc: "End-to-end data platform on Microsoft Fabric — Synapse Spark pipelines, Delta Lakehouse, DirectLake Power BI semantic models.",
              variant: "tint"
            }
          ].map((p, i) => {
            const isDark = p.variant === "dark";
            const inner = (
              <>
                <div>
                  <div className={`text-[10px] uppercase tracking-widest font-bold mb-6 ${isDark ? "text-white/60" : "text-accent"}`}>{p.tag}</div>
                  <h3 className={`text-2xl md:text-3xl mb-3 font-display transition-colors ${isDark ? "group-hover:text-white/80" : "group-hover:text-accent"}`}>{p.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-muted"}`}>{p.desc}</p>
                </div>
                <div className="flex justify-end mt-8">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-500 ${isDark ? "border-white/15 group-hover:bg-white group-hover:text-ink" : "border-line/10 group-hover:bg-accent group-hover:text-white"}`}>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </>
            );
            const tintClass = p.variant === "dark" ? "bg-[#1C1A15] text-white" : p.variant === "tint" ? "bg-accent/15" : "bg-white";
            const cls = `group p-8 md:p-10 ${tintClass} rounded-[2rem] md:rounded-[2.5rem] border border-line/5 hover:border-accent/20 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-700 flex flex-col justify-between min-h-[280px]`;
            const card = p.external ? (
              <a key={i} href={p.to} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
            ) : (
              <Link key={i} to={p.to} className={cls}>{inner}</Link>
            );
            return <Card3D key={i}>{card}</Card3D>;
          })}
        </div>
      </section>

      {/* Services */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 py-16 md:py-24">
        <div className="grid lg:grid-cols-[0.6fr_1.4fr] gap-10 md:gap-16 items-start">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-4 block">What I Do</span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-display leading-tight">Services</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 md:gap-10">
            {SKILLS.map((skill) => (
              <div key={skill.name} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
                  {skill.icon}
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold font-display mb-2">{skill.name}</h3>
                  <p className="text-sm text-muted leading-relaxed">{skill.items.slice(0, 3).join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AntigravitySkills />

      {/* Stats band */}
      <section className="relative py-16 md:py-24 px-4 sm:px-8 md:px-12 lg:px-24 bg-accent/6 overflow-hidden">
        <CircuitLines variant="corner" className="absolute -top-4 -left-4 w-32 h-32 text-ink/10 pointer-events-none" />
        <CircuitLines variant="corner" className="absolute -bottom-4 -right-4 w-32 h-32 text-ink/10 rotate-180 pointer-events-none" />
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
          {HERO_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-accent/25 flex items-center justify-center text-accent">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl md:text-4xl font-display text-ink">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <AnalyticsVisuals projectCount={projects.length} />

      {/* Process */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="max-w-4xl mb-16 md:mb-20">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-4 block">My Process</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display leading-tight">How I work.</h2>
        </div>
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-[length:8px_1px] bg-repeat-x" style={{ backgroundImage: "repeating-linear-gradient(to right, var(--color-line) 0 6px, transparent 6px 12px)" }} />
          {PROCESS_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="relative">
                <div className="relative z-10 w-14 h-14 rounded-full bg-white border-2 border-accent/20 flex items-center justify-center mb-6 shadow-sm">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="text-xs font-bold text-accent/50 mb-2">{step.n}</div>
                <h3 className="text-xl font-display mb-3">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Links Grid */}
      <section className="py-24 md:py-40 px-4 sm:px-8 md:px-12 lg:px-24">
        <div className="max-w-4xl mb-16 md:mb-24">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-4 md:mb-6 block">The Index</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display leading-tight">Explore the <br /> digital monograph.</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            { to: "/work", title: "Work", desc: "Selected professional projects and case studies.", tint: "bg-white" },
            { to: "/dashboard", title: "Dashboards", desc: "Live, interactive Power BI and data science dashboards.", tint: "bg-accent/8" },
            { to: "/blogs", title: "Blogs", desc: "Long-form articles and technical deep-dives.", tint: "bg-white" },
            { to: "/lab", title: "Lab", desc: "Experiments, technical ideas, and raw prototypes.", tint: "bg-accent/8" },
            { to: "/thinking", title: "Thinking", desc: "Strategic insights and technical deep-dives.", tint: "bg-white" },
            { to: "/journal", title: "Journal", desc: "Weekly reflections and personal learnings.", tint: "bg-accent/8" }
          ].map((link, i) => (
            <Card3D key={link.to}>
              <Link
                to={link.to}
                className={`group p-8 sm:p-12 ${link.tint} rounded-[2.5rem] md:rounded-[3rem] border border-line/5 hover:border-accent/20 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-700 flex flex-col justify-between aspect-square`}
              >
                <div>
                  <div className="text-[10px] font-bold text-accent/30 mb-8">0{i + 1}</div>
                  <h3 className="text-4xl mb-4 font-display group-hover:text-accent transition-colors">{link.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{link.desc}</p>
                </div>
                <div className="flex justify-end">
                  <div className="w-12 h-12 rounded-full border border-line/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-500">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </Card3D>
          ))}
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="relative py-24 md:py-40 px-4 sm:px-8 md:px-12 lg:px-24 bg-white rounded-[2.5rem] md:rounded-[4rem] mx-2 sm:mx-4 md:mx-12 mb-12 shadow-2xl shadow-ink/5 overflow-hidden">
        <CircuitLines variant="cluster" className="absolute top-8 right-8 md:top-12 md:right-16 w-32 h-32 md:w-44 md:h-44 text-accent/15 pointer-events-none" />
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start">
          <div className="space-y-12 md:space-y-16">
            <div>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-6 md:mb-8 block">Collaborate</span>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-display leading-[0.9] mb-8 md:mb-12">
                Let's build <br /> something <span className="text-accent">meaningful.</span>
              </h2>
              <p className="text-muted leading-relaxed text-base md:text-lg max-w-md font-light">
                Open to new opportunities in Data Science, AI Engineering, and enterprise data platform roles. Particularly interested in high-impact ML, analytics, and automation projects.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-12">
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest font-bold text-accent">Contact</div>
                <a href={SOCIAL_LINKS.email} className="text-sm hover:text-accent transition-colors block">{SOCIAL_LINKS.email.replace('mailto:', '')}</a>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest font-bold text-accent">Social</div>
                <div className="flex gap-6">
                  <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Linkedin className="w-4 h-4" /></a>
                  <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Github className="w-4 h-4" /></a>
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><Instagram className="w-4 h-4" /></a>
                  <a href={SOCIAL_LINKS.medium} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors"><ExternalLink className="w-4 h-4" /></a>
                </div>
              </div>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleFormSubmit}
            className="space-y-8 md:space-y-12 bg-bg p-8 sm:p-12 md:p-16 rounded-[2.5rem] md:rounded-[3rem] border border-line/5"
          >
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Full Name</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full border-b border-line/20 py-4 focus:border-accent outline-none transition-colors bg-transparent text-lg font-sans"
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
                  className="w-full border-b border-line/20 py-4 focus:border-accent outline-none transition-colors bg-transparent text-lg font-sans"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted">Your Inquiry</label>
                <textarea
                  required
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full border-b border-line/20 py-4 focus:border-accent outline-none transition-colors bg-transparent h-32 resize-none text-lg font-sans"
                  placeholder="Tell me about your project..."
                />
              </div>
            </div>

            {submitStatus && (
              <div className={`text-xs font-bold uppercase tracking-widest p-6 rounded-2xl ${submitStatus.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-ink text-white py-6 rounded-2xl flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all duration-500 disabled:opacity-50 shadow-xl shadow-ink/10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Inquiry <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
