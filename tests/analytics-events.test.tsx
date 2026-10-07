import { fireEvent, render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnalyticsEvents } from "@/components/analytics/AnalyticsEvents";
import { track } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/i18n/navigation", () => ({ usePathname: () => "/" }));
afterEach(() => vi.unstubAllGlobals());

describe("explicit interaction instrumentation", () => {
  it("tracks only marked links without reading their URL or text", () => {
    const { container } = render(
      <NextIntlClientProvider locale="uk">
        <AnalyticsEvents />
        <a data-analytics-event="phone_click" data-analytics-source="footer" href="tel:private" onClick={(event) => event.preventDefault()}>
          <span>Private name and phone</span>
        </a>
        <a href="#unmarked" onClick={(event) => event.preventDefault()}>Unmarked link</a>
      </NextIntlClientProvider>,
    );
    fireEvent.click(container.querySelector("span")!);
    fireEvent.click(container.querySelectorAll("a")[1]);
    expect(track).toHaveBeenCalledExactlyOnceWith("phone_click", { locale: "uk", source: "footer" });
    expect(JSON.stringify(vi.mocked(track).mock.calls)).not.toContain("private");
  });
  it("observes pricing/form visibility and only marked real video playback", () => {
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    let notify: IntersectionObserverCallback | undefined;
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    });
    const { container, unmount } = render(
      <NextIntlClientProvider locale="en">
        <div id="pricing" />
        <div id="lead" />
        <AnalyticsEvents />
        <video data-analytics-video="school" />
        <video />
      </NextIntlClientProvider>,
    );
    expect(observe).toHaveBeenCalledTimes(2);
    const entries = ["pricing", "lead"].map((id) => ({ target: container.querySelector(`#${id}`)!, isIntersecting: true }));
    notify!(entries as IntersectionObserverEntry[], {} as IntersectionObserver);
    expect(track).toHaveBeenCalledWith("price_view", { locale: "en" });
    expect(track).toHaveBeenCalledWith("trial_form_open", { locale: "en" });
    expect(unobserve).toHaveBeenCalledTimes(2);
    fireEvent.play(container.querySelector("video")!);
    fireEvent.play(container.querySelectorAll("video")[1]);
    expect(track).toHaveBeenCalledWith("video_play", { locale: "en", videoId: "school" });
    expect(track).toHaveBeenCalledTimes(3);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
