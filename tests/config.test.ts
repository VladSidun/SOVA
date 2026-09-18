import { describe, expect, it } from "vitest";
import { business } from "@/config/business";
import { pricing } from "@/config/pricing";
import { features } from "@/config/features";
import { teachers } from "@/content/teachers";
import { reviews } from "@/content/reviews";
import { cases } from "@/content/cases";

describe("verified business configuration", () => {
  it("keeps the confirmed contact, founding year and trial duration", () => {
    expect(business.phoneE164).toBe("+380992671906");
    expect(business.foundedYear).toBe(2019);
    expect(business.trialMinutes).toBe(45);
    expect(business.schedule.mondayToSaturday).toBe("09:00–20:00");
    expect(business).not.toHaveProperty("yearsOfExperience");
  });

  it("preserves both confirmed prices and their different billing units", () => {
    expect(pricing.group.priceUAH).toBe(1500);
    expect(pricing.group.unit).toBe("month");
    expect(pricing.pair).toEqual({ priceUAH: 350, unit: "lesson" });
    expect(pricing.individual).toEqual({ priceUAH: 500, unit: "lesson" });
    expect([pricing.group.groupSizeMin, pricing.group.groupSizeMax]).toEqual([3, 5]);
  });

  it("disables content claims and tracking until they are ready", () => {
    expect(Object.values(features).every((value) => value === false)).toBe(true);
    expect(teachers).toHaveLength(0);
    expect(reviews).toHaveLength(0);
    expect(cases).toHaveLength(0);
  });
});
