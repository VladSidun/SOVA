"use client";

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  buildLeadGoalHref,
  isLeadGoal,
  leadGoalQueryParam,
  leadTargetId,
} from "@/lib/lead-goal";
import type { LeadGoal } from "@/types/lead";

type LeadGoalContextValue = {
  selectedGoal: LeadGoal | null;
  selectGoal: (goal: LeadGoal) => void;
};

const LeadGoalContext = createContext<LeadGoalContextValue | null>(null);

function readGoalFromUrl() {
  if (typeof window === "undefined") return null;

  const value = new URL(window.location.href).searchParams.get(leadGoalQueryParam);
  return isLeadGoal(value) ? value : null;
}

function subscribeToGoalUrl(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("sova:lead-goal-change", onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("sova:lead-goal-change", onStoreChange);
  };
}

export function LeadGoalProvider({ children }: { children: ReactNode }) {
  const selectedGoal = useSyncExternalStore(subscribeToGoalUrl, readGoalFromUrl, () => null);

  const selectGoal = useCallback((goal: LeadGoal) => {
    const url = new URL(window.location.href);
    url.searchParams.set(leadGoalQueryParam, goal);
    url.hash = leadTargetId;
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event("sova:lead-goal-change"));

    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document
        .getElementById(leadTargetId)
        ?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    });
  }, []);

  const value = useMemo(() => ({ selectedGoal, selectGoal }), [selectedGoal, selectGoal]);

  return <LeadGoalContext value={value}>{children}</LeadGoalContext>;
}

export function useLeadGoal() {
  const context = use(LeadGoalContext);
  if (!context) throw new Error("useLeadGoal must be used inside LeadGoalProvider");
  return context;
}

type LeadGoalLinkProps = {
  goal: LeadGoal;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  "aria-label"?: string;
};

export function LeadGoalLink({
  goal,
  children,
  className = "",
  activeClassName = "",
  "aria-label": ariaLabel,
}: LeadGoalLinkProps) {
  const { selectedGoal, selectGoal } = useLeadGoal();
  const active = selectedGoal === goal;

  return (
    <a
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`${className} ${active ? activeClassName : ""}`.trim()}
      data-lead-goal={goal}
      href={buildLeadGoalHref(goal)}
      onClick={(event) => {
        event.preventDefault();
        selectGoal(goal);
      }}
      role="button"
    >
      {children}
    </a>
  );
}
