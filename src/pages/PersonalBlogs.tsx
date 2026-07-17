import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Feather,
  Loader2,
} from "lucide-react";

interface BlogPost {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  categories: string[];
}

function decodeHtmlEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getExcerpt(html: string) {
  const text = decodeHtmlEntities(
    html.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim()
  );
  return text.length > 170 ? `${text.slice(0, 170)}...` : text;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizePost(post: BlogPost): BlogPost {
  return {
    ...post,
    title: decodeHtmlEntities(post.title),
    description: decodeHtmlEntities(post.description),
    categories: post.categories.map(decodeHtmlEntities),
  };
}

export default function PersonalBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/blogs/personal");
        if (!response.ok) throw new Error("Failed to fetch personal blog posts");
        const data = await response.json();
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts.map(normalizePost));
        }
      } catch (err) {
        console.error("Error fetching personal Medium posts:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const featuredPost = useMemo(() => posts[0] || null, [posts]);
  const otherPosts = useMemo(
    () =>
      featuredPost
        ? posts.filter(
            (p) => p.guid !== featuredPost.guid && p.title !== featuredPost.title
          )
        : posts.slice(1),
    [featuredPost, posts]
  );

  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="pt-24 md:pt-32 px-4 sm:px-8 md:px-12 lg:px-24">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          All Blogs
        </Link>

        <div className="grid min-h-[60vh] grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center pb-12 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-ink/15 bg-white/70 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b87d2a]">
                <Feather className="h-3.5 w-3.5" />
                Personal Blog
              </span>
            </div>

            <h1 className="max-w-5xl text-5xl sm:text-6xl md:text-8xl font-display leading-[0.88] tracking-normal">
              Beyond the data, there's a story.
            </h1>

            <p className="mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-muted">
              Personal reflections, creative writing, and the thoughts that don't
              fit neatly into a dashboard — the human side of the journey.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href="https://akhilkarthik.medium.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 border border-ink/15 bg-white/70 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:border-[#b87d2a] hover:text-[#b87d2a]"
              >
                Follow on Medium
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          {featuredPost && (
            <motion.a
              href={featuredPost.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="group block overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-transform hover:-translate-y-1"
            >
              {featuredPost.thumbnail && (
                <div className="aspect-[4/3] overflow-hidden bg-ink">
                  <img
                    src={featuredPost.thumbnail}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6 md:p-8">
                <div className="mb-5 flex flex-wrap gap-2">
                  {featuredPost.categories.slice(0, 3).map((category) => (
                    <span
                      key={category}
                      className="bg-[#b87d2a]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b87d2a]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <h2 className="text-3xl md:text-4xl font-display leading-tight group-hover:text-[#b87d2a]">
                  {featuredPost.title}
                </h2>
                <p className="mt-4 text-sm md:text-base leading-relaxed text-muted">
                  {getExcerpt(featuredPost.description)}
                </p>
                <div className="mt-8 flex items-center gap-5 border-t border-ink/10 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(featuredPost.pubDate)}
                  </span>
                </div>
              </div>
            </motion.a>
          )}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8 md:px-12 lg:px-24">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#b87d2a]">
              All posts
            </span>
            <h2 className="mt-3 text-4xl md:text-6xl font-display leading-none">
              Keep reading
            </h2>
          </div>
          {isLoading && (
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing Medium
            </div>
          )}
        </div>

        {!isLoading && posts.length === 0 ? (
          <div className="text-center py-20">
            <Feather className="w-10 h-10 mx-auto text-muted mb-4" />
            <p className="text-muted text-sm">
              No personal posts found yet. Check back soon or visit{" "}
              <a
                href="https://akhilkarthik.medium.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b87d2a] underline"
              >
                Medium
              </a>{" "}
              directly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(featuredPost ? [featuredPost, ...otherPosts] : posts).map(
              (post, index) => (
                <motion.a
                  key={`${post.guid}-${index}`}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex min-h-[28rem] flex-col rounded-2xl border border-ink/10 bg-white transition-colors hover:border-[#b87d2a]/50"
                >
                  {post.thumbnail && (
                    <div className="aspect-[16/10] overflow-hidden rounded-t-2xl bg-ink">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-5 flex flex-wrap gap-2">
                      {post.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="bg-[#b87d2a]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b87d2a]"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display leading-tight group-hover:text-[#b87d2a]">
                      {post.title}
                    </h3>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                      {getExcerpt(post.description)}
                    </p>
                    <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                        {formatDate(post.pubDate)}
                      </span>
                      <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#b87d2a]">
                        Read
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </motion.a>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}
