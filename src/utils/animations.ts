import { Variants, Transition } from 'motion/react';

// Check if user prefers reduced motion
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Reduced-motion safe transition
const safeTransition = (t: Transition): Transition =>
  prefersReducedMotion ? { duration: 0.15, ease: 'easeOut' } : t;

// --- Reusable Variants ---

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, x: 0 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
  animate: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 },
  animate: { opacity: 1, scale: 1 },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0 },
  animate: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.07,
    },
  },
};

// --- Reusable Transitions ---

export const springBounce: Transition = safeTransition({
  type: 'spring',
  stiffness: 260,
  damping: 20,
  duration: 0.5,
});

export const easeOut: Transition = safeTransition({
  duration: 0.4,
  ease: 'easeOut',
});

export const easeOutFast: Transition = safeTransition({
  duration: 0.3,
  ease: 'easeOut',
});

export const easeOutSlow: Transition = safeTransition({
  duration: 0.5,
  ease: 'easeOut',
});

// --- Hover & Tap presets ---

export const hoverScale = prefersReducedMotion
  ? {}
  : { scale: 1.03 };

export const tapScale = prefersReducedMotion
  ? {}
  : { scale: 0.97 };

export const hoverLift = prefersReducedMotion
  ? {}
  : { scale: 1.01, y: -2 };

export const hoverCardLift = prefersReducedMotion
  ? {}
  : { scale: 1.02, boxShadow: '0 20px 40px -15px rgba(15,23,42,0.2)' };

// --- Page transition for tab switching ---

export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pageTransitionConfig: Transition = safeTransition({
  duration: 0.3,
  ease: 'easeOut',
});

// --- Progress bar ---

export const progressBar = (width: string) => ({
  initial: { width: '0%' },
  animate: { width },
  transition: safeTransition({ duration: 1.2, ease: 'easeOut' }),
});
