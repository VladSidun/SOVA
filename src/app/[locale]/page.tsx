import { LeadGoalProvider } from "@/components/lead/LeadGoalProvider";
import { Directions } from "@/components/sections/Directions";
import { FAQ } from "@/components/sections/FAQ";
import { FormatsPricing } from "@/components/sections/FormatsPricing";
import { GoalMatcher } from "@/components/sections/GoalMatcher";
import { Hero } from "@/components/sections/Hero";
import { Location } from "@/components/sections/Location";
import { Method } from "@/components/sections/Method";
import { OptionalContentSections } from "@/components/sections/OptionalContentSections";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { TrialProcess } from "@/components/sections/TrialProcess";
import { WhySova } from "@/components/sections/WhySova";

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
        <WhySova />
        <Method />
        <OptionalContentSections />
        <Location />
        <FAQ />
      </LeadGoalProvider>
    </main>
  );
}
