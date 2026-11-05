"use client";

import { useAnimationControls, useInView } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, type ReactNode } from "react";
import { getMotionVariants } from "@/lib/motion";
import { useReducedMotion } from "./useReducedMotion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: "fadeUp" | "fadeIn" | "subtleScale" | "staggerContainer";
};

// Use only around editorial text/decorative media, never around CTA or form controls.
// SSR and offscreen content stay visible; enhancement starts only on intersection.
export function Reveal({ children, className, variant = "fadeUp" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();

  useEffect(() => {
    if (reducedMotion) {
      controls.stop();
      controls.set("visible");
      return;
    }
    if (!inView || playedRef.current) return;
    playedRef.current = true;
    controls.set("hidden");
    void controls.start("visible");
  }, [controls, inView, reducedMotion]);

  return (
    <m.div
      animate={controls}
      className={className}
      data-motion-reveal={variant}
      initial={false}
      ref={ref}
      variants={getMotionVariants(reducedMotion)[variant]}
    >
      {children}
    </m.div>
  );
}

export function RevealItem({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return <m.div variants={getMotionVariants(reducedMotion).staggerItem}>{children}</m.div>;
}
