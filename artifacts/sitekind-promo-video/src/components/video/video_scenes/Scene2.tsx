import { motion } from 'framer-motion';

export function Scene2() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-[5vw] text-center z-20 bg-[var(--color-bg-dark)] overflow-hidden"
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/ai-abstract.png`}
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: "linear" }}
        alt=""
      />
      <div className="dot-grid mix-blend-overlay opacity-30" />

      <motion.div
        className="relative z-10"
        initial={{ y: "4vw", opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.34, 1.3, 0.64, 1], delay: 0.5 }}
      >
        <h2 className="font-display text-[8vw] font-extrabold text-[var(--color-bg-light)] leading-none tracking-tighter">
          sitekind.
        </h2>
        <motion.div 
          className="h-[0.4vw] bg-[var(--color-primary)] mt-[1.5vw] mx-auto"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 1.2, ease: "easeInOut" }}
        />
        <motion.p
          className="font-body text-[3vw] text-[var(--color-text-dark-secondary)] mt-[2vw] font-light tracking-wide"
          initial={{ opacity: 0, y: "2vw" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          The Fully Automated Digital Agency.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
