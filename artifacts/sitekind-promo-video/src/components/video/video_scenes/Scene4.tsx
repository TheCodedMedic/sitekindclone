import { motion } from 'framer-motion';

export function Scene4() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center p-[5vw] z-40 bg-[var(--color-bg-dark)] overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.6 } }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_60%)] opacity-20" />
      
      <motion.img 
        src={`${import.meta.env.BASE_URL}images/voice-waveform.png`}
        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        alt=""
      />

      <div className="relative z-10 text-center flex flex-col items-center">
        <motion.div
          className="font-accent text-[3.5vw] text-[var(--color-warning)] mb-[1vw]"
          initial={{ opacity: 0, y: "-2vw" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Never miss a lead again.
        </motion.div>
        
        <motion.h2 
          className="font-display text-[6vw] font-extrabold text-[var(--color-text-dark-primary)] leading-tight tracking-tight"
          initial={{ opacity: 0, y: "4vw" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          AI Voice Receptionist.
        </motion.h2>

        <motion.div 
          className="mt-[4vw] w-[18vw] h-[18vw] rounded-full border-[0.4vw] border-[var(--color-primary)] flex items-center justify-center relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 20 }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-20"
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="w-[8vw] h-[8vw] rounded-full bg-[var(--color-primary)]" />
        </motion.div>
      </div>
    </motion.div>
  );
}
