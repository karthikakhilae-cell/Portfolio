import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, User, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { PROJECTS as STATIC_PROJECTS, SOCIAL_LINKS } from "../../constants";

interface Message {
  role: "user" | "model";
  text: string;
  suggestions?: string[];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [projects] = useState(STATIC_PROJECTS);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi there! I'm Laura, Akhil's digital assistant. How can I help you explore his work today?",
      suggestions: ["Tell me about Akhil", "Show me his projects", "How can I contact him?"]
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHello, setShowHello] = useState(false);
  const [greeting, setGreeting] = useState("Hello! 👋");
  const scrollRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isOpen) {
      idleTimerRef.current = setTimeout(() => {
        const prompts = [
          "Still there? I'm ready to chat! 🤖",
          "Want to see Akhil's latest projects? 🚀",
          "I can tell you about his ML work! 📊",
          "Need help navigating the site? 🗺️"
        ];
        setGreeting(prompts[Math.floor(Math.random() * prompts.length)]);
        setShowHello(true);
        setTimeout(() => setShowHello(false), 8000);
      }, 30000);
    }
  };

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [isOpen]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning! ☀️");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon! ☕");
    else if (hour >= 17 && hour < 21) setGreeting("Good evening! 🌙");
    else setGreeting("Good night! 😴");
    const show = setTimeout(() => setShowHello(true), 2000);
    const hide = setTimeout(() => setShowHello(false), 10000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const RESPONSES = {
    whoIsAkhil: [
      "Akhil is a Data Scientist and AI Engineer with 5+ years of experience building ML pipelines, enterprise data platforms, and AI automation systems. Want to know more about his background?",
      "Meet Akhil! He bridges raw data all the way to deployed ML models and live dashboards — end to end. Should I tell you about his skills or show you his projects?",
      "Akhil is a Data Scientist who turns messy data into working ML models, Power BI dashboards, and automated workflows. What would you like to explore?"
    ],
    projects: [
      "Akhil has some great projects! Highlights include his ML Performance Dashboard, Enterprise Lakehouse on Microsoft Fabric, and a database query optimisation that cut response times by 65%. Which one interests you?",
      "His portfolio covers ML monitoring, enterprise data engineering, and AI automation. Want me to walk you through any specific project?",
      "From Power BI dashboards to Synapse Spark pipelines, Akhil's work covers a lot of ground. What area are you most interested in?"
    ],
    contact: [
      `You can reach Akhil at ${SOCIAL_LINKS.email.replace('mailto:', '')} or connect on LinkedIn. He's always open to interesting collaborations!`,
      `Best way to reach him is via email: ${SOCIAL_LINKS.email.replace('mailto:', '')}. You can also find him on LinkedIn!`,
      `Akhil is happy to connect! Drop him an email at ${SOCIAL_LINKS.email.replace('mailto:', '')} or message him on LinkedIn.`
    ],
    skills: [
      "Akhil's core stack: Python, Power BI / DAX, Microsoft Fabric, SQL Server, and Machine Learning. Is there a specific skill you're looking for?",
      "He's expert in end-to-end data work — from SQL query optimisation to ML model deployment and Power BI dashboards. Want more detail on any of these?",
      "Python, Power BI, Microsoft Fabric, SQL, and ML/AI automation — that's his wheelhouse. Should we dig into any of these?"
    ],
    greetings: [
      "Hi! I'm Laura, Akhil's assistant. I can tell you about his projects, skills, or how to contact him. What's on your mind?",
      "Hello! I'm here to help you explore Akhil's Data Science and AI work. Where would you like to start?",
      "Hey! Great to meet you. I'm Laura — ask me anything about Akhil's work or how to reach him!"
    ],
    fallback: [
      "I'm not quite sure about that. Want to see Akhil's projects or contact him directly?",
      "That's a bit outside my knowledge! I can definitely tell you about his ML work or Power BI dashboards though. What do you think?",
      "I didn't quite catch that. How about we look at Akhil's projects or his core skills?"
    ]
  };

  const getRandomResponse = (intent: keyof typeof RESPONSES) => {
    const opts = RESPONSES[intent];
    return opts[Math.floor(Math.random() * opts.length)];
  };

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;
    const userMessage = messageToSend.trim().toLowerCase();
    if (!customMessage) setInput("");

    setMessages(prev => [...prev, { role: "user", text: messageToSend.trim() }]);
    setIsLoading(true);
    setIsTyping(true);
    setIsGenerating(true);

    // Try the live Groq AI first via Netlify function
    try {
      const history = messages
        .filter(m => m.role === "user" || m.role === "model")
        .map(m => ({ role: m.role === "model" ? "assistant" : "user", content: m.text }));

      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend.trim(), history }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          setMessages(prev => [...prev, {
            role: "model",
            text: data.reply,
            suggestions: ["Show me his projects", "What are his skills?", "Contact Akhil"],
          }]);
          setIsLoading(false);
          setIsTyping(false);
          setIsGenerating(false);
          resetIdleTimer();
          return;
        }
      }
    } catch {
      // network/API issue — fall through to built-in responses
    }

    // Built-in fallback responses
    setTimeout(() => {
      let responseText = getRandomResponse("fallback");
      let suggestions: string[] = ["Show me projects", "Contact Akhil", "Who is Akhil?"];

      if (userMessage === "tell me about akhil" || userMessage === "who is akhil?") {
        responseText = getRandomResponse("whoIsAkhil");
        suggestions = ["His Experience", "His Core Skills", "Show me his projects"];
      } else if (userMessage === "show me his projects" || userMessage === "show all projects") {
        responseText = getRandomResponse("projects");
        suggestions = ["ML Dashboard", "Enterprise Lakehouse", "Database Tuning"];
      } else if (userMessage === "how can i contact him?" || userMessage === "contact akhil") {
        responseText = getRandomResponse("contact");
        suggestions = ["LinkedIn Profile", "GitHub Profile", "Send an inquiry"];
      } else if (userMessage === "what are his skills?" || userMessage === "his core skills") {
        responseText = getRandomResponse("skills");
        suggestions = ["Python & ML", "Power BI", "Microsoft Fabric", "SQL"];
      } else if (userMessage === "linkedin profile") {
        responseText = `You can find Akhil on LinkedIn here: [${SOCIAL_LINKS.linkedin}](${SOCIAL_LINKS.linkedin}). Feel free to reach out!`;
        suggestions = ["GitHub Profile", "Email him", "Back to chat"];
      } else if (userMessage === "github profile") {
        responseText = `Check out Akhil's open-source work on GitHub: [${SOCIAL_LINKS.github}](${SOCIAL_LINKS.github})`;
        suggestions = ["LinkedIn Profile", "Show projects", "Back to chat"];
      } else if (userMessage.includes("hi") || userMessage.includes("hello") || userMessage.includes("hey")) {
        responseText = getRandomResponse("greetings");
        suggestions = ["Tell me about Akhil", "Show me his projects", "What are his skills?"];
      } else if (userMessage.includes("project") || userMessage.includes("work")) {
        responseText = getRandomResponse("projects");
        suggestions = ["ML Dashboard", "Enterprise Lakehouse", "Database Tuning"];
      } else if (userMessage.includes("skill") || userMessage.includes("tech") || userMessage.includes("stack")) {
        responseText = getRandomResponse("skills");
        suggestions = ["Python & ML", "Power BI", "Microsoft Fabric"];
      } else if (userMessage.includes("contact") || userMessage.includes("email") || userMessage.includes("hire")) {
        responseText = getRandomResponse("contact");
        suggestions = ["LinkedIn Profile", "GitHub Profile", "Send an inquiry"];
      }

      setMessages(prev => [...prev, { role: "model", text: responseText, suggestions }]);
      setIsLoading(false);
      setIsTyping(false);
      setIsGenerating(false);
      resetIdleTimer();
    }, 800);
  };

  return (
    <>
      {/* Floating Doll */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100]">
        <AnimatePresence>
          {showHello && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute bottom-24 md:bottom-28 right-0"
            >
              <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-line/10 text-[11px] font-bold uppercase tracking-widest text-ink/60 whitespace-nowrap relative">
                {greeting}
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white/90 rotate-45 border-r border-b border-line/10" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-ink/20 rounded-full blur-md"
        />

        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <motion.button
            id="ai-assistant-toggle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-white to-bg text-ink rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden group"
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex gap-2">
                <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} className="w-2 h-2 bg-ink rounded-full" />
                <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }} className="w-2 h-2 bg-ink rounded-full" />
              </div>
              <motion.div animate={{ width: isOpen ? 12 : 8 }} className="h-1 bg-ink/20 rounded-full" />
            </div>
            {isGenerating && (
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        </motion.div>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-assistant-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 md:bottom-28 md:right-8 z-[100] w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] max-h-[600px] bg-white rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.2)] border border-line/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-line/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bg rounded-full flex flex-col items-center justify-center text-ink border border-line/5">
                  <div className="flex gap-1 mb-0.5">
                    <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 4 }} className="w-1 h-1 bg-ink rounded-full" />
                    <motion.div animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 4 }} className="w-1 h-1 bg-ink rounded-full" />
                  </div>
                  <Bot className="w-3 h-3 opacity-30" />
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-widest text-ink">Laura</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    <span className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Digital Companion</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-ink transition-colors p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="space-y-3 max-w-[85%]">
                    <div className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-ink text-white" : "bg-bg text-ink border border-line/5"}`}>
                        {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-ink text-white rounded-tr-none" : "bg-bg text-ink rounded-tl-none border border-line/5"}`}>
                        <div className="markdown-body relative">
                          <Markdown>{m.text}</Markdown>
                          {isGenerating && i === messages.length - 1 && m.role === "model" && (
                            <motion.span
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="inline-block w-1.5 h-4 bg-accent ml-1 translate-y-0.5"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {m.role === "model" && m.suggestions && i === messages.length - 1 && !isLoading && (
                      <div className="flex flex-wrap gap-2 ml-11">
                        {m.suggestions.map((suggestion, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            onClick={() => handleSend(suggestion)}
                            className="px-4 py-2 bg-bg border border-line/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-ink/60 hover:bg-ink hover:text-white hover:border-ink transition-all"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-bg text-ink rounded-full flex items-center justify-center border border-line/5">
                      <Bot className="w-4 h-4" />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-bg px-4 py-3 rounded-2xl rounded-tl-none border border-line/5 flex items-center gap-3"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((dot) => (
                          <motion.div
                            key={dot}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2 }}
                            className="w-1 h-1 bg-ink/40 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-ink/40">Thinking</span>
                    </motion.div>
                  </div>
                </div>
              )}

              {isGenerating && !isTyping && (
                <div className="flex justify-center py-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[9px] uppercase tracking-[0.2em] font-bold text-accent/60 flex items-center gap-2"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating Response
                  </motion.div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-line/5">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Laura anything about Akhil..."
                  className="w-full bg-bg border border-line/10 rounded-xl py-4 pl-6 pr-14 text-sm focus:border-ink outline-none transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-ink text-white rounded-lg flex items-center justify-center hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
