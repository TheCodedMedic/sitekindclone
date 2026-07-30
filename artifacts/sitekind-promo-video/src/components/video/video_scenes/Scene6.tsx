import { motion } from 'framer-motion';

export function Scene6() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-[5vw] z-[60] bg-[var(--color-bg-light)] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className="mesh opacity-80" />
      <div className="dot-grid" />
      
      <motion.div
        className="font-display text-[9vw] font-extrabold text-ink tracking-tighter"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        sitekind.
      </motion.div>

      <motion.div
        className="font-body text-[3vw] font-semibold text-[var(--color-primary)] mt-[1vw]"
        initial={{ y: "2vw", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        From $150/mo.
      </motion.div>

      <motion.div
        className="mt-[3vw] px-[4vw] py-[2vw] bg-[var(--color-accent)] text-[var(--color-bg-light)] rounded-[2vw] font-display text-[2.5vw] font-bold shadow-2xl"
        initial={{ y: "4vw", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5, type: "spring", stiffness: 200, damping: 20 }}
      >
        Stop losing leads
      </motion.div>

    </motion.div>
  );
}
