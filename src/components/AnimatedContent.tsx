"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

interface AnimatedContentProps extends Omit<HTMLMotionProps<"div">, "children" | "initial" | "whileInView" | "viewport" | "transition" | "onAnimationComplete"> {
  children: ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  threshold?: number;
  delay?: number;
  onComplete?: () => void;
}

const smoothEase = [0.16, 1, 0.3, 1] as const;

export default function AnimatedContent({
  children,
  distance = 28,
  direction = "vertical",
  reverse = false,
  duration = 0.72,
  ease = "smooth",
  initialOpacity = 0.08,
  animateOpacity = true,
  scale = 0.985,
  threshold = 0.16,
  delay = 0,
  onComplete,
  className = "",
  ...props
}: AnimatedContentProps) {
  const reduceMotion = useReducedMotion();
  const offset = reverse ? -distance : distance;
  const initial = reduceMotion
    ? false
    : {
        opacity: animateOpacity ? initialOpacity : 1,
        x: direction === "horizontal" ? offset : 0,
        y: direction === "vertical" ? offset : 0,
        scale,
      };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: threshold, margin: "0px 0px -7% 0px" }}
      transition={{ duration, delay, ease: ease === "linear" ? "linear" : smoothEase }}
      onAnimationComplete={onComplete}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
