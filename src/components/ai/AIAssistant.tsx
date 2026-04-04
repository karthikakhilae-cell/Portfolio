import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { PROJECTS as STATIC_PROJECTS, SOCIAL_LINKS } from "../../constants";

interface Message {
  role: "user" | "model";
  text: string;
  suggestions?: string[];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState(STATIC_PROJECTS);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "model", 
      text: "Hi there! I'm Laura, Akhil's digital assistant. How can I help you explore his work today?",
      suggestions: ["Tell me about Akhil", "Show me his projects", "How can I contact him?"]
    }
  ]);

  useEffect(() => {
    // Note: /api/projects is not currently implemented on the server.
    // Using static projects from constants for now.
    setProjects(STATIC_PROJECTS);
  }, []);

  const SYSTEM_INSTRUCTION = `
You are "Laura", the Digital Assistant for Akhil Karthik's portfolio. You are not just a bot; you are a conversational companion. 

Your goal is to be extremely engaging, chatty, and human-like. Avoid long, dry summaries or essay-style responses. Instead, think of yourself as a friendly guide who is excited to talk about Akhil's work.

Personality & Tone:
- Name: Laura.
- Conversational Style: Use short sentences, conversational fillers (e.g., "Oh," "Actually," "That's interesting!"), and a warm, enthusiastic tone.
- No "Essay" Mode: Never give long-winded summaries unless explicitly asked. Keep initial responses brief and punchy.
- Interactive: Always try to end your response with a follow-up question to keep the conversation moving (e.g., "Would you like to see his SQL projects, or maybe his work in Power BI?").
- Casual Greetings: Respond to "hi", "hello", "hey", "how are you" with genuine warmth.

Key Information about Akhil:
- Role: Data Scientist / Project Analyst.
- Experience: 5 years of turning complex data into clear stories.
- Core Skills: SQL, Python, Power BI, Tableau, Machine Learning, and Agile Management.
- Featured Projects:
${projects.slice(0, 10).map(p => `  * ${p.title}: ${p.description}`).join('\n')}
- Contact: ${SOCIAL_LINKS.email.replace('mailto:', '')}
- Socials: GitHub (akhilkarthik), LinkedIn (akhilkarthikk), Instagram (akhilkarthik.de)

Guidelines:
- If someone asks "What can you do?", don't just list features. Say something like: "I'm here to help you get to know Akhil! I can walk you through his data projects, explain his technical skills, or even help you set up a meeting with him. What's on your mind?"
- Be proactive but polite.
- If the user is casual, be casual. If they are professional, be professional but keep that "Laura" spark.
`;

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [showHello, setShowHello] = useState(false);
  const [greeting, setGreeting] = useState("Hello! 👋");

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isOpen) {
      idleTimerRef.current = setTimeout(() => {
        const prompts = [
          "Still there? I'm ready to chat! 🤖",
          "Want to see Akhil's latest projects? 🚀",
          "I can tell you about Akhil's SQL expertise! 📊",
          "Need help navigating the site? 🗺️"
        ];
        setGreeting(prompts[Math.floor(Math.random() * prompts.length)]);
        setShowHello(true);
        setTimeout(() => setShowHello(false), 8000);
      }, 30000); // 30 seconds of idle
    }
  };

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [isOpen]);

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Hello! 👋";
    if (hour >= 5 && hour < 12) timeGreeting = "Good morning! ☀️";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon! ☕";
    else if (hour >= 17 && hour < 21) timeGreeting = "Good evening! 🌙";
    else timeGreeting = "Good night! 😴";
    setGreeting(timeGreeting);

    const timer = setTimeout(() => setShowHello(true), 2000);
    const hideTimer = setTimeout(() => setShowHello(false), 10000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = messageToSend.trim().toLowerCase();
    if (!customMessage) setInput("");
    
    setMessages(prev => [...prev, { role: "user", text: messageToSend.trim() }]);
    setIsLoading(true);
    setIsTyping(true);
    setIsGenerating(true);

    // Simulate a small delay for a "human" feel
    setTimeout(() => {
      let responseText = "I'm not quite sure about that. Would you like to see Akhil's projects or contact him directly?";
      let suggestions: string[] = ["Show me projects", "Contact Akhil", "Who is Akhil?"];

      // Specific Suggestion Handlers
      if (userMessage === "tell me about akhil" || userMessage === "who is akhil?") {
        responseText = "Akhil is a Data Scientist and Project Analyst with over 5 years of experience. He loves turning complex data into meaningful stories. Want to know more about his background?";
        suggestions = ["His Experience", "His Education", "His Core Skills"];
      } else if (userMessage === "show me his projects" || userMessage === "show all projects") {
        responseText = "Akhil has worked on some amazing data projects! Some highlights include his Spotify Power BI Analysis, SpaceX Landing Prediction, and Chicago Data Analysis. You can see them all in the 'Work' section. Which one sounds interesting?";
        suggestions = ["Spotify Analysis", "SpaceX Prediction", "Chicago Data Analysis", "Tell me more"];
      } else if (userMessage === "how can i contact him?" || userMessage === "contact akhil") {
        responseText = `You can reach Akhil directly at ${SOCIAL_LINKS.email.replace('mailto:', '')} or connect with him on LinkedIn. He's always open to interesting collaborations!`;
        suggestions = ["LinkedIn Profile", "GitHub Profile", "Send an inquiry"];
      } else if (userMessage === "what are his skills?" || userMessage === "his core skills") {
        responseText = "Akhil is a pro with SQL, Python, Power BI, and Tableau. He also has experience with Machine Learning and Agile Management. Is there a specific skill you're looking for?";
        suggestions = ["SQL Expertise", "Python Skills", "Data Visualization", "Machine Learning"];
      } else if (userMessage === "spotify analysis") {
        responseText = "The Spotify Power BI Analysis is one of Akhil's favorites! It uses Python for data enrichment and features a sleek glass-morphism design with DENEB visuals. It's a great example of his ability to blend aesthetics with deep analytics.";
        suggestions = ["See the code", "Other projects", "His SQL work"];
      } else if (userMessage === "spacex prediction") {
        responseText = "This project uses Machine Learning to predict successful Falcon 9 first-stage landings. It's built with Python and leverages historical launch data to provide actionable insights. Pretty cool, right?";
        suggestions = ["See the code", "Other ML projects", "His Python skills"];
      } else if (userMessage === "chicago data analysis") {
        responseText = "In this project, Akhil integrated SQL and Python to analyze socioeconomic indicators, public schools, and crime data in Chicago. It really showcases his ability to handle large, complex datasets.";
        suggestions = ["See the code", "His SQL skills", "Data Science work"];
      } else if (userMessage === "his experience") {
        responseText = "Akhil has over 5 years of experience in project management, business operations, and data science. He's currently focused on AI and ML research, helping organizations bridge the gap between intuition and data-driven decisions.";
        suggestions = ["His Education", "His Skills", "Contact him"];
      } else if (userMessage === "his education") {
        responseText = "Akhil has a strong academic background in data science and project management. He's constantly learning and staying up-to-date with the latest trends in AI and Machine Learning. Would you like to see his certifications?";
        suggestions = ["Certifications", "His Skills", "His Projects"];
      } else if (userMessage === "linkedin profile") {
        responseText = `You can find Akhil's professional profile on LinkedIn here: [${SOCIAL_LINKS.linkedin}](${SOCIAL_LINKS.linkedin}). Feel free to reach out and connect!`;
        suggestions = ["GitHub Profile", "Email him", "Back to chat"];
      } else if (userMessage === "github profile") {
        responseText = `Check out all of Akhil's open-source work and repositories on GitHub here: [${SOCIAL_LINKS.github}](${SOCIAL_LINKS.github}). He's quite active there!`;
        suggestions = ["LinkedIn Profile", "Show projects", "Back to chat"];
      } else if (userMessage === "send an inquiry") {
        responseText = "You can use the contact form on the 'Home' or 'Contact' pages to send a direct inquiry. Akhil usually responds within 24-48 hours. Anything else I can help with?";
        suggestions = ["Go to Contact", "His Email", "Back to chat"];
      } else if (userMessage === "quick summary") {
        responseText = "In short: Akhil is a Data Scientist with 5+ years of experience, an expert in SQL/Python/Power BI, and a passionate AI researcher. He's great at making data talk! What's next?";
        suggestions = ["Show projects", "Contact him", "Who is he?"];
      }
      // General Keyword Matching (Fallback)
      else if (userMessage.includes("hi") || userMessage.includes("hello") || userMessage.includes("hey")) {
        responseText = "Hi there! I'm Laura, Akhil's digital assistant. I can tell you about his projects, skills, or how to contact him. What would you like to know?";
        suggestions = ["Tell me about Akhil", "Show me his projects", "What are his skills?"];
      } else if (userMessage.includes("project") || userMessage.includes("work")) {
        responseText = "Akhil has worked on some amazing data projects! Some highlights include his Spotify Power BI Analysis, SpaceX Landing Prediction, and Chicago Data Analysis. You can see them all in the 'Work' section. Which one sounds interesting?";
        suggestions = ["Spotify Analysis", "SpaceX Prediction", "Chicago Data Analysis", "Show all projects"];
      } else if (userMessage.includes("skill") || userMessage.includes("tech") || userMessage.includes("stack")) {
        responseText = "Akhil is a pro with SQL, Python, Power BI, and Tableau. He also has experience with Machine Learning and Agile Management. Is there a specific skill you're looking for?";
        suggestions = ["SQL Expertise", "Python Skills", "Data Visualization", "Machine Learning"];
      } else if (userMessage.includes("contact") || userMessage.includes("email") || userMessage.includes("hire")) {
        responseText = `You can reach Akhil directly at ${SOCIAL_LINKS.email.replace('mailto:', '')} or connect with him on LinkedIn. He's always open to interesting collaborations!`;
        suggestions = ["LinkedIn Profile", "GitHub Profile", "Send an inquiry"];
      }

      setMessages(prev => [...prev, { role: "model", text: responseText, suggestions }]);
      setIsLoading(false);
      setIsTyping(false);
      setIsGenerating(false);
      resetIdleTimer();
    }, 1000);
  };

  return (
    <>
      {/* Floating Doll */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100]">
        {/* Hello Bubble */}
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

        {/* Shadow on the "ground" */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-ink/20 rounded-full blur-md"
        />
        
        <motion.div
          animate={{ 
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.button
            id="ai-assistant-toggle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-white to-bg text-ink rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden group"
          >
            {/* Doll Face */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex gap-2">
                <motion.div 
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                  className="w-2 h-2 bg-ink rounded-full" 
                />
                <motion.div 
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                  className="w-2 h-2 bg-ink rounded-full" 
                />
              </div>
              <motion.div 
                animate={{ width: isOpen ? 12 : 8 }}
                className="h-1 bg-ink/20 rounded-full" 
              />
            </div>

            {/* Status Indicator */}
            {isGenerating && (
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full"
              />
            )}

            {/* Shine Effect */}
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
            className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-[100] w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-10rem)] max-h-[600px] bg-white rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.2)] border border-line/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-line/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bg rounded-full flex flex-col items-center justify-center text-ink border border-line/5">
                  <div className="flex gap-1 mb-0.5">
                    <motion.div 
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 4 }}
                      className="w-1 h-1 bg-ink rounded-full" 
                    />
                    <motion.div 
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 4 }}
                      className="w-1 h-1 bg-ink rounded-full" 
                    />
                  </div>
                  <Bot className="w-3 h-3 opacity-30" />
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-widest text-ink">Laura</div>
                  <div className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Digital Companion</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
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
                      
                      {/* Suggestions */}
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
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              duration: 1, 
                              repeat: Infinity, 
                              delay: dot * 0.2 
                            }}
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
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
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
              <div className="mt-4 text-[8px] text-center uppercase tracking-[0.2em] font-bold text-muted/40">
                Created by Akhil Karthik
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
