import { motion } from 'framer-motion';

export function Scene3() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[8vw] z-30 bg-[var(--color-bg-light)] overflow-hidden"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="mesh opacity-60" />
      <div className="dot-grid" />
      
      <div className="w-[45%] relative z-10 flex flex-col justify-center">
        <motion.div
          className="font-accent text-[3vw] text-[var(--color-primary)] mb-[1vw]"
          initial={{ opacity: 0, x: "-2vw" }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          Step 1
        </motion.div>
        <motion.h2 
          className="font-display text-[4.5vw] font-extrabold text-ink leading-tight"
          initial={{ opacity: 0, y: "3vw" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Enterprise-Grade Website.
        </motion.h2>
        <motion.p
          className="font-body text-[2.2vw] text-ink-2 mt-[1.5vw]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          Built and managed for you. <br/>
          <strong className="text-[var(--color-accent)]">Live in 24 hours.</strong>
        </motion.p>
      </div>

      <motion.div 
        className="w-[45%] h-[70vh] relative z-10 rounded-[2vw] overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.8, rotateY: 20, perspective: 1000 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.34, 1.3, 0.64, 1] }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-truck.png`}
          className="w-full h-full object-cover"
          alt="Service truck"
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/20 to-transparent mix-blend-multiply"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}
