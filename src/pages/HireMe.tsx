import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Zap, Target, BarChart3, Layers, Loader2 } from "lucide-react";
import { useState, FormEvent } from "react";
import { SOCIAL_LINKS } from "../constants";

const SERVICES = [
  {
    title: "Data Analytics & Strategy",
    description: "Transforming raw data into actionable business intelligence. I help you define KPIs, build automated dashboards, and uncover hidden growth opportunities.",
    icon: <BarChart3 className="w-6 h-6" />,
    features: ["Custom Power BI Dashboards", "Predictive Modeling", "Data Governance Strategy"]
  },
  {
    title: "Project Management",
    description: "Leading complex, cross-functional projects from conception to delivery. I bring order to chaos using Agile and Lean methodologies.",
    icon: <Layers className="w-6 h-6" />,
    features: ["Agile/Scrum Implementation", "Stakeholder Management", "Resource Optimization"]
  },
  {
    title: "Business Operations",
    description: "Optimizing internal workflows to increase efficiency and reduce overhead. I design systems that scale with your business.",
    icon: <Zap className="w-6 h-6" />,
    features: ["Process Automation", "Workflow Design", "Operational Audits"]
  },
  {
  title: "AI & Machine Learning",
  description: "Leveraging artificial intelligence and machine learning to build intelligent systems that analyze data, predict outcomes, and automate decision-making processes.",
  icon: <brain className="w-6 h-6" />,
  features: ["Machine Learning Model Development","Predictive Analytics & Forecasting","AI-Powered Data Insights"
  ]
}
];

const PROCESS = [
  { step: "01", title: "Discovery", desc: "We dive deep into your current challenges, data landscape, and business goals." },
  { step: "02", title: "Strategy", desc: "I develop a tailored roadmap and technical architecture for your project." },
  { step: "03", title: "Execution", desc: "Iterative development with regular check-ins and transparent progress tracking." },
  { step: "04", title: "Delivery", desc: "Final implementation, documentation, and team training for long-term success." }
];

export default function HireMe() {
  const [formState, setFormState] = useState({ name: "", email: "", project: "Data Analytics", message: "" });
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
        body: JSON.stringify({ ...formState, type: "hire_me" }),
      });

      if (response.ok) {
        setSubmitStatus({ type: "success", message: "Inquiry sent! I'll get back to you within 48 hours." });
        setFormState({ name: "", email: "", project: "Data Analytics", message: "" });
      } else {
        setSubmitStatus({ type: "error", message: "Something went wrong. Please try again." });
      }
    } catch (error) {
      setSubmitStatus({ type: "error", message: "Failed to connect. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-24 md:pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-24 min-h-screen bg-bg">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mb-20 md:mb-32"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-6 md:mb-8 block">
          Available for Projects
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-display leading-[0.9] mb-8 md:mb-12">
          Let's solve your <br /> <span className="text-accent">complex</span> problems.
        </h1>
        <p className="text-muted text-lg md:text-xl leading-relaxed max-w-2xl font-light">
          I partner with forward-thinking companies to build data-driven systems and lead high-impact projects. Currently accepting select inquiries for Q3 & Q4 2026.
        </p>
      </motion.div>

      {/* Services */}
      <section className="mb-24 md:mb-40">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-12 rounded-[3rem] border border-line/5 hover:border-accent/20 transition-all group"
            >
              <div className="text-accent mb-8 group-hover:scale-110 transition-transform duration-500">
                {service.icon}
              </div>
              <h3 className="text-2xl mb-6 font-display">{service.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-8">{service.description}</p>
              <ul className="space-y-3">
                {service.features.map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-ink/60">
                    <CheckCircle2 className="w-3 h-3 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mb-24 md:mb-40 py-20 md:py-32 bg-white rounded-[2.5rem] md:rounded-[4rem] px-6 sm:px-12 md:px-24 shadow-2xl shadow-ink/5">
        <div className="max-w-2xl mb-16 md:mb-24">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-4 md:mb-6 block">The Workflow</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display leading-tight">A systematic approach <br /> to excellence.</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {PROCESS.map((p, i) => (
            <div key={p.step} className="space-y-6">
              <div className="text-5xl font-display text-accent/10">{p.step}</div>
              <h4 className="text-xl font-display">{p.title}</h4>
              <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-display leading-[0.9] mb-8 md:mb-12">
              Start a <br /> <span className="text-accent">Conversation.</span>
            </h2>
            <p className="text-muted leading-relaxed text-base md:text-lg mb-8 md:mb-12 font-light">
              Fill out the form with your project details, or reach out directly via email for a quick consultation.
            </p>
            <div className="space-y-4">
              <div className="text-[10px] uppercase tracking-widest font-bold text-accent">Direct Email</div>
              <a href={SOCIAL_LINKS.email} className="text-xl md:text-2xl font-display hover:text-accent transition-colors">{SOCIAL_LINKS.email.replace('mailto:', '')}</a>
            </div>
          </div>

          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleFormSubmit} 
            className="space-y-6 md:space-y-8 bg-white p-8 sm:p-12 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-ink/5 border border-line/5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted/60">Name</label>
                <input 
                  type="text" 
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full border-b border-line/20 py-4 focus:border-accent outline-none transition-colors bg-transparent text-lg font-sans" 
                  placeholder="Your Name" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted/60">Email</label>
                <input 
                  type="email" 
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full border-b border-line/20 py-4 focus:border-accent outline-none transition-colors bg-transparent text-lg font-sans" 
                  placeholder="email@example.com" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted/60">Project Type</label>
              <select 
                value={formState.project}
                onChange={(e) => setFormState({ ...formState, project: e.target.value })}
                className="w-full border-b border-line/20 py-4 focus:border-accent outline-none transition-colors bg-transparent text-lg font-sans appearance-none cursor-pointer"
              >
                <option>Data Analytics</option>
                <option>Project Management</option>
                <option>Business Operations</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted/60">Message</label>
              <textarea 
                required
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                className="w-full border-b border-line/20 py-4 focus:border-accent outline-none transition-colors bg-transparent h-32 resize-none text-lg font-sans" 
                placeholder="Tell me about your goals..." 
              />
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
