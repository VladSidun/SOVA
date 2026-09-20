import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/Header";
import { features } from "@/config/features";
import { getNavigationItems, sectionIds } from "@/config/navigation";
import uk from "@/i18n/messages/uk.json";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    locale,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string; locale?: string }) => (
    <a href={locale ? `/${locale}${href === "/" ? "" : href}` : href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/",
}));

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="uk" messages={uk} timeZone="Europe/Kyiv">
      <Header navigationItems={getNavigationItems()} />
    </NextIntlClientProvider>,
  );
}

describe("responsive navigation", () => {
  it("opens the mobile menu, moves focus inside and closes with Escape", async () => {
    renderHeader();
    const trigger = screen.getByRole("button", { name: "Відкрити меню" });

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const mobileNavigation = screen.getByRole("navigation", { name: "Мобільна навігація" });
    const contactLink = within(mobileNavigation).getByRole("link", { name: "Контакти" });
    await waitFor(() => expect(contactLink).toHaveFocus());

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("navigation", { name: "Мобільна навігація" })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("keeps keyboard focus within the open mobile menu", async () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Відкрити меню" }));

    const mobileNavigation = screen.getByRole("navigation", { name: "Мобільна навігація" });
    const firstLink = within(mobileNavigation).getByRole("link", { name: "Контакти" });
    const lastLink = within(mobileNavigation).getByRole("link", { name: "Безкоштовний урок" });
    await waitFor(() => expect(firstLink).toHaveFocus());

    lastLink.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(firstLink).toHaveFocus();

    firstLink.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(lastLink).toHaveFocus();
  });

  it("omits disabled feature sections and anchors that are not rendered", () => {
    const items = getNavigationItems({
      flags: { ...features, showReviews: false },
      renderedSections: [sectionIds.directions, sectionIds.reviews, sectionIds.contacts],
    });

    expect(items.map((item) => item.id)).toEqual([sectionIds.directions, sectionIds.contacts]);
    expect(items.some((item) => item.href === "#reviews")).toBe(false);
  });
});
