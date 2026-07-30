import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-[5vw] text-center z-10 bg-[var(--color-bg-light)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)", transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <motion.div
        className="mesh"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        exit={{ opacity: 0 }}
      />
      <div className="dot-grid" />
      
      <motion.h1 
        className="font-display text-[5.5vw] font-extrabold text-ink leading-tight tracking-tight"
        initial={{ y: "4vw", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        You run a <span className="text-[var(--color-primary)]">service business.</span>
      </motion.h1>
      
      <motion.h2
        className="font-display text-[4.5vw] font-extrabold text-ink-2 mt-[2vw]"
        initial={{ y: "3vw", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.5 }}
      >
        You don't have time to run a website.
      </motion.h2>
    </motion.div>
  );
}
