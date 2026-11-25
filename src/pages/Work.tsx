import { motion } from "framer-motion";
import { PROJECTS as STATIC_PROJECTS, SOCIAL_LINKS } from "../constants";
import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ONGOING_PROJECT_IDS = new Set([
  "laura-telegram-agent",
  "fabric-lakehouse",
  "planning-automation",
  "db-optimization",
]);

export default function Work() {
  const projects = STATIC_PROJECTS;

  return (
    <main className="pt-24 md:pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-24 min-h-screen bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mb-12 md:mb-24"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-accent mb-4 md:mb-6 block">
          Selected Archive
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-display leading-[0.9] mb-6 md:mb-8">
          Featured <br /> Projects
        </h1>
        <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl font-light">
          A deep dive into my professional work, case studies, and successful project implementations.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-ink/10 transition-all duration-500 hover:bg-accent"
        >
          <BarChart3 className="w-4 h-4" />
          View Dashboard analysis
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-16">
          {projects.map((project) => (
            <motion.a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group cursor-pointer block"
            >
              <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[4/3]">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-500" />
                {ONGOING_PROJECT_IDS.has(project.id) && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-2xl shadow-black/20 backdrop-blur-md">
                    <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-accent/25">
                      <span className="absolute h-4 w-4 animate-ping rounded-full bg-accent/40" />
                      <Sparkles className="relative h-3 w-3 text-white" />
                    </span>
                    Ongoing
                  </div>
                )}
                <div className="absolute top-6 left-6 text-white/50 font-display text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  {project.year}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-[8px] uppercase tracking-[0.2em] font-bold text-accent bg-accent/5 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-medium group-hover:text-accent transition-colors">{project.title}</h3>
                {project.summary && (
                  <p className="border-l-2 border-accent/40 pl-3 text-[11px] font-medium italic leading-relaxed text-ink/75 group-hover:border-accent transition-colors">
                    {project.summary}
                  </p>
                )}
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{project.description}</p>
              </div>
            </motion.a>
          ))}
      </div>

      <div className="mt-32 text-center">
        <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest border-b border-ink pb-2 hover:text-accent hover:border-accent transition-all">
          Explore All Case Studies on GitHub
        </a>
      </div>
    </main>
  );
}
