import type { Variants } from "motion/react";

export const motionTiming = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
  stagger: 0.08,
};

// Reduced motion is instant, including child delays. No spring/bounce.
export function getMotionVariants(reducedMotion: boolean) {
  const transition = {
    duration: reducedMotion ? 0 : motionTiming.duration,
    ease: motionTiming.ease,
  };
  const fadeUp: Variants = {
    hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition },
  };
  const fadeIn: Variants = {
    hidden: { opacity: reducedMotion ? 1 : 0 },
    visible: { opacity: 1, transition },
  };
  const subtleScale: Variants = {
    hidden: { opacity: reducedMotion ? 1 : 0, scale: reducedMotion ? 1 : 0.98 },
    visible: { opacity: 1, scale: 1, transition },
  };
  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reducedMotion ? 0 : motionTiming.stagger } },
  };

  return { fadeUp, fadeIn, subtleScale, staggerContainer, staggerItem: fadeUp };
}

export const { fadeUp, fadeIn, subtleScale, staggerContainer, staggerItem } = getMotionVariants(false);
