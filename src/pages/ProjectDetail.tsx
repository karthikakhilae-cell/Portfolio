import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PROJECTS } from "../constants";
import { ArrowLeft, ExternalLink, Github, Loader2 } from "lucide-react";

type Project = (typeof PROJECTS)[number];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const staticProject = PROJECTS.find((p) => p.id === id);
  const [project, setProject] = useState<Project | null>(staticProject ?? null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setProject(staticProject ?? null);
    setReadme(null);
    setNotFound(false);
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/project/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.project) setProject(data.project);
          setReadme(data.readme ?? null);
        } else if (res.status === 404 && !staticProject) {
          setNotFound(true);
        }
      } catch {
        // Live fetch failed — fall back to whatever static data we have
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (notFound || (!loading && !project)) {
    return (
      <main className="pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-24 min-h-screen bg-bg text-center">
        <h1 className="text-4xl font-display mb-4">Project Not Found</h1>
        <Link to="/work" className="text-accent hover:underline text-sm">
          Back to Work
        </Link>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-24 min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </main>
    );
  }

  return (
    <main className="pt-24 md:pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-24 min-h-screen bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back link */}
        <Link
          to="/work"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Hero image */}
        <div className="relative overflow-hidden rounded-2xl mb-10 aspect-[16/9]">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white/60 font-display text-lg">
            {project.year}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] uppercase tracking-[0.2em] font-bold text-accent bg-accent/5 px-3 py-1.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title & category */}
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-accent block mb-3">
          {project.category}
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display leading-[0.95] mb-6">
          {project.title}
        </h1>
        <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl mb-12 font-light">
          {project.description}
        </p>

        {/* README article */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <p className="text-xs uppercase tracking-widest font-bold text-muted">
              Loading article from GitHub...
            </p>
          </div>
        ) : readme ? (
          <article className="prose prose-neutral dark:prose-invert max-w-none mb-16 border-t border-ink/10 pt-10 prose-headings:font-display prose-headings:font-normal prose-a:text-accent prose-img:rounded-xl prose-pre:bg-ink/5 prose-pre:text-sm prose-code:text-accent/80 prose-code:text-sm">
            <ReactMarkdown
              components={{
                img: ({ node, ...props }) => (
                  <img
                    {...props}
                    className="w-full rounded-xl my-6"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ),
              }}
            >
              {readme}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="mb-16 border-t border-ink/10 pt-10">
            <p className="text-sm text-muted">
              No README found in this repository yet.
            </p>
          </div>
        )}

        {/* GitHub CTA */}
        <div className="border-t border-ink/10 pt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-ink/10 transition-all duration-500 hover:bg-accent"
          >
            <Github className="w-4 h-4" />
            View Source on GitHub
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            to="/work"
            className="text-xs font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            See all projects
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
