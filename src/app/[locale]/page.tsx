import { LeadGoalProvider } from "@/components/lead/LeadGoalProvider";
import { Directions } from "@/components/sections/Directions";
import { FormatsPricing } from "@/components/sections/FormatsPricing";
import { GoalMatcher } from "@/components/sections/GoalMatcher";
import { Hero } from "@/components/sections/Hero";
import { Method } from "@/components/sections/Method";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { TrialProcess } from "@/components/sections/TrialProcess";

export default function LandingPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <LeadGoalProvider>
        <Hero />
        <TrustStrip />
        <Directions />
        <GoalMatcher />
        <FormatsPricing />
        <TrialProcess />
        <Method />
      </LeadGoalProvider>
    </main>
  );
}
