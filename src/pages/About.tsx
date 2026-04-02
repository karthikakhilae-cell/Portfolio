import { motion } from "motion/react";
import { SKILLS, PROFILE_PIC } from "../constants";

export default function About() {
  return (
    <main className="pt-32 pb-20 px-6 md:px-24 min-h-screen bg-ink text-white">
      <div className="grid lg:grid-cols-2 gap-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold opacity-50 mb-6 block">
            The Person Behind The Lens
          </span>
          <h1 className="text-6xl md:text-8xl leading-[0.9] mb-12 font-display">
            I believe in the beauty of <span className="text-accent">subtraction.</span>
          </h1>
          <div className="space-y-8 opacity-70 leading-relaxed text-lg font-light">
            <p>
              As a curator and designer with over a decade of experience, I approach every project with the rigor of an archivist and the soul of an artist. My work is defined by a commitment to silence in a world of digital noise.
            </p>
            <p>
              I specialize in creating high-end digital monographs and portfolio experiences for architectural firms, luxury brands, and independent artists. My background in fine arts and systems engineering allows me to bridge the gap between technical complexity and aesthetic purity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-16">
            {SKILLS.map(skill => (
              <div key={skill.name} className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  {skill.icon}
                  <span className="text-[10px] uppercase tracking-widest font-bold">{skill.name}</span>
                </div>
                <ul className="space-y-2">
                  {skill.items.map(item => (
                    <li key={item} className="text-sm opacity-50">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <img 
            src={PROFILE_PIC} 
            alt="Portrait" 
            className="w-full aspect-[3/4] object-cover rounded-3xl grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-12 -left-12 bg-accent p-12 rounded-3xl hidden xl:block">
            <div className="text-4xl font-display mb-4">5+</div>
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">Years of Experience</div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
