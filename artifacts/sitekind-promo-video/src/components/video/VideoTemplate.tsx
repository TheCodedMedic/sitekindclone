// Video Template - Sitekind promo

import { useEffect, useRef } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { AnimatePresence, motion } from 'framer-motion';

import { Scene1, Scene2, Scene3, Scene4, Scene5, Scene6 } from './video_scenes';

export const SCENE_DURATIONS = {
  scene1: 3500,
  scene2: 4000,
  scene3: 4500,
  scene4: 4000,
  scene5: 4500,
  scene6: 5000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  scene1: Scene1,
  scene2: Scene2,
  scene3: Scene3,
  scene4: Scene4,
  scene5: Scene5,
  scene6: Scene6,
};

// Cumulative start offset (seconds) of each canonical scene, for audio sync.
const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

// Narration line per scene, shown as an on-screen caption for muted playback.
const SCENE_CAPTIONS: Record<string, string> = {
  scene1: 'You run a service business. Not a website.',
  scene2: 'Meet Sitekind. Your fully automated agency.',
  scene3: 'Your new site, live in twenty-four hours.',
  scene4: 'An AI receptionist that never misses a lead.',
  scene5: 'Automated SEO puts you on top of local search.',
  scene6: 'Sitekind. From one hundred fifty a month. Stop losing leads.',
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  captions = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  captions?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg-light)' }}
    >
      {/* Persistent Cross-Scene Elements */}
      <motion.div
        className="absolute top-0 left-0 w-[150vw] h-[150vw] rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-multiply"
        animate={{
          x: sceneIndex === 0 ? '-50vw' : sceneIndex === 1 ? '-20vw' : sceneIndex === 2 ? '-40vw' : sceneIndex === 3 ? '10vw' : sceneIndex === 4 ? '-60vw' : '-50vw',
          y: sceneIndex === 0 ? '-50vw' : sceneIndex === 1 ? '-10vw' : sceneIndex === 2 ? '20vw' : sceneIndex === 3 ? '-40vw' : sceneIndex === 4 ? '10vw' : '-50vw',
          backgroundColor: sceneIndex === 1 || sceneIndex === 3 ? 'var(--color-primary)' : 'var(--color-blush)',
          scale: sceneIndex === 5 ? 2 : 1
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[100vw] h-[100vw] rounded-full blur-[80px] pointer-events-none opacity-40 mix-blend-multiply"
        animate={{
          x: sceneIndex === 0 ? '20vw' : sceneIndex === 1 ? '50vw' : sceneIndex === 2 ? '10vw' : sceneIndex === 3 ? '30vw' : sceneIndex === 4 ? '50vw' : '20vw',
          y: sceneIndex === 0 ? '20vw' : sceneIndex === 1 ? '50vw' : sceneIndex === 2 ? '30vw' : sceneIndex === 3 ? '10vw' : sceneIndex === 4 ? '40vw' : '20vw',
          backgroundColor: sceneIndex === 1 || sceneIndex === 3 ? 'var(--color-accent)' : 'var(--color-sky)'
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      {/* Caption overlay — keeps the message legible when played muted */}
      {captions && (
        <div className="absolute bottom-[6%] left-0 right-0 flex justify-center pointer-events-none z-20 px-6">
          <AnimatePresence mode="wait">
            {SCENE_CAPTIONS[baseSceneKey] && (
              <motion.p
                key={baseSceneKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="max-w-[80%] text-center text-white text-base md:text-lg font-medium leading-snug rounded-full px-6 py-2.5"
                style={{
                  backgroundColor: 'rgba(20, 20, 30, 0.55)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                {SCENE_CAPTIONS[baseSceneKey]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/composite_audio.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
