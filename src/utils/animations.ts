import { Variants, Transition } from 'motion/react';
import { useState, useEffect } from 'react';

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
  exit: { opacity: 0, y: prefersReducedMotion ? 0 : -10 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
  animate: { opacity: 1, x: 0 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : -20 }, // Added from your spec, though wait, x: -20 is moving FROM left. Let me make it accurate.
  animate: { opacity: 1, x: 0 },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: prefersReducedMotion ? 0 : -20 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0 },
  animate: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.08,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0 : 0.05,
    },
  },
};

export const pulseObserved: Variants = {
  animate: prefersReducedMotion ? {} : { 
    scale: [1, 1.05, 1], 
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } 
  }
};

export const pulseUrgent: Variants = {
  animate: prefersReducedMotion ? {} : { 
    scale: [1, 1.08, 1], 
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } 
  }
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
  : { scale: 1.01, boxShadow: '0 20px 40px -15px rgba(15,23,42,0.1)' }; // Reduced from 1.02 to 1.01 as requested in plan

// Button specific presets
export const btnPrimary = {
  whileHover: prefersReducedMotion ? {} : { scale: 1.03 },
  whileTap: prefersReducedMotion ? {} : { scale: 0.97 }
};

export const btnSecondary = {
  whileHover: prefersReducedMotion ? {} : { scale: 1.01 },
  whileTap: prefersReducedMotion ? {} : { scale: 0.98 }
};

export const btnDanger = {
  whileHover: prefersReducedMotion ? {} : { x: [-2, 2, -2, 2, 0], transition: { duration: 0.3 } },
  whileTap: prefersReducedMotion ? {} : { scale: 0.98 }
};


// --- Page transition for tab switching ---

export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const viewTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: safeTransition({ duration: 0.3, ease: 'easeOut' }) },
  exit: { opacity: 0, transition: safeTransition({ duration: 0.15, ease: 'easeOut' }) },
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

// --- Hooks ---

export const useCountUp = (target: number, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
};
