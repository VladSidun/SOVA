import { LeadGoalProvider } from "@/components/lead/LeadGoalProvider";
import { Directions } from "@/components/sections/Directions";
import { FAQ } from "@/components/sections/FAQ";
import { FormatsPricing } from "@/components/sections/FormatsPricing";
import { GoalMatcher } from "@/components/sections/GoalMatcher";
import { Hero } from "@/components/sections/Hero";
import { LeadSection } from "@/components/sections/LeadSection";
import { Location } from "@/components/sections/Location";
import { Method } from "@/components/sections/Method";
import { OptionalContentSections } from "@/components/sections/OptionalContentSections";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { TrialProcess } from "@/components/sections/TrialProcess";
import { WhySova } from "@/components/sections/WhySova";
import { buildLeadFallbackLinks } from "@/lib/contact-links";
import { getPublicEnv } from "@/lib/public-env";

export default function LandingPage() {
  const publicEnv = getPublicEnv();
  const fallbackLinks = buildLeadFallbackLinks({
    whatsapp: publicEnv.NEXT_PUBLIC_WHATSAPP_URL,
    viber: publicEnv.NEXT_PUBLIC_VIBER_URL,
    telegram: publicEnv.NEXT_PUBLIC_TELEGRAM_URL,
  });

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
        <LeadSection
          fallbackLinks={fallbackLinks}
          turnstileSiteKey={publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />
      </LeadGoalProvider>
    </main>
  );
}
