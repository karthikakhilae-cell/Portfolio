import { motion } from "motion/react";
import { PenTool, Palette, BookOpen, Sparkles } from "lucide-react";

const CREATIVE_WORKS = [
  {
    title: "Essays on Data Ethics",
    description: "A series of long-form essays exploring the ethical implications of data collection and AI.",
    icon: <PenTool className="w-8 h-8" />,
    category: "Writing"
  },
  {
    title: "Digital Art Collection",
    description: "Experimental digital art pieces created using generative algorithms and manual touch.",
    icon: <Palette className="w-8 h-8" />,
    category: "Visual Arts"
  },
  {
    title: "Short Stories",
    description: "Exploring human connection and digital isolation through speculative fiction.",
    icon: <BookOpen className="w-8 h-8" />,
    category: "Fiction"
  },
  {
    title: "Creative Coding",
    description: "Using code as a medium for artistic expression and interactive experiences.",
    icon: <Sparkles className="w-8 h-8" />,
    category: "Code Art"
  }
];

export default function Arts() {
  return (
    <main className="pt-24 md:pt-32 pb-20 px-6 md:px-24 min-h-screen bg-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mb-16 md:mb-24"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-accent mb-6 block">
          Creative Work
        </span>
        <h1 className="text-4xl md:text-8xl font-display leading-tight mb-8">
          Arts <br /> & Writing
        </h1>
        <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl">
          A space for my creative pursuits, from long-form writing to digital art and creative coding experiments.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {CREATIVE_WORKS.map((work, i) => (
          <motion.div
            key={work.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 md:p-12 rounded-2xl md:rounded-3xl border border-line/5 hover:border-accent/20 transition-all group"
          >
            <div className="text-accent mb-8 group-hover:scale-110 transition-transform duration-500">
              {work.icon}
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted mb-4">
              {work.category}
            </div>
            <h3 className="text-2xl mb-4 group-hover:text-accent transition-colors">{work.title}</h3>
            <p className="text-muted leading-relaxed">{work.description}</p>
            <button className="mt-8 text-[10px] uppercase tracking-widest font-bold border-b border-ink pb-1 hover:text-accent hover:border-accent transition-all">
              Explore Work
            </button>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
