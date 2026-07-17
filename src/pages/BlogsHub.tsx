import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Feather } from "lucide-react";

const blogs = [
  {
    title: "Professional",
    subtitle: "Data Science, Power BI & Analytics",
    description:
      "Technical deep-dives, case studies, and end-to-end walkthroughs — from raw data to production dashboards.",
    to: "/blogs/professional",
    icon: Briefcase,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    accent: "bg-accent",
  },
  {
    title: "Personal",
    subtitle: "Thoughts, Stories & Life",
    description:
      "Personal reflections, creative writing, and everything beyond the data — the human side of the journey.",
    to: "/blogs/personal",
    icon: Feather,
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop",
    accent: "bg-[#b87d2a]",
  },
];

export default function BlogsHub() {
  return (
    <main className="min-h-screen bg-bg pt-24 md:pt-32 pb-20 px-4 sm:px-8 md:px-12 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mb-16 md:mb-24"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-accent mb-4 md:mb-6 block">
          Written Word
        </span>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-display leading-[0.9] mb-6 md:mb-8">
          Two voices, <br /> one author.
        </h1>
        <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl font-light">
          I write in two lanes — technical posts that show the work, and personal
          essays that show the thinking. Pick a side, or read both.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-6xl">
        {blogs.map((blog, i) => {
          const Icon = blog.icon;
          return (
            <motion.div
              key={blog.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={blog.to}
                className="group block overflow-hidden rounded-2xl border border-line bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-ink/5 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`${blog.accent} p-2.5 rounded-lg text-white`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                        {blog.subtitle}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display text-white leading-tight">
                      {blog.title}
                    </h2>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <p className="text-sm md:text-base text-muted leading-relaxed mb-6">
                    {blog.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent group-hover:gap-4 transition-all">
                    Read posts
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
