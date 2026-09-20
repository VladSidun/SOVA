import { LeadGoalProvider } from "@/components/lead/LeadGoalProvider";
import { Directions } from "@/components/sections/Directions";
import { GoalMatcher } from "@/components/sections/GoalMatcher";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";

export default function LandingPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LeadGoalProvider>
        <Hero />
        <TrustStrip />
        <Directions />
        <GoalMatcher />
      </LeadGoalProvider>
    </main>
  );
}
