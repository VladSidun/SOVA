"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { business } from "@/config/business";
import type { NavigationItem } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "./Container";

type HeaderProps = {
  navigationItems: NavigationItem[];
};

function LanguageSwitch({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  return (
    <div
      aria-label={t("languageSwitcher")}
      className={`flex items-center rounded-full border border-black/10 bg-white ${compact ? "p-0.5" : "p-1"}`}
      role="group"
    >
      {(["uk", "en"] as const).map((targetLocale) => (
        <span className="contents" key={targetLocale}>
          <Link
            aria-current={locale === targetLocale ? "page" : undefined}
            aria-label={targetLocale === "uk" ? t("switchToUkrainian") : t("switchToEnglish")}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 text-xs font-semibold uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
              locale === targetLocale ? "bg-brand-black text-white" : "text-brand-black hover:bg-black/5"
            }`}
            href={pathname}
            locale={targetLocale}
            onClick={onNavigate}
          >
            {targetLocale === "uk" ? "UA" : "EN"}
          </Link>
        </span>
      ))}
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      )}
    </svg>
  );
}

export function Header({ navigationItems }: HeaderProps) {
  const t = useTranslations("Navigation");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  const closeMenu = (restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) {
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    const menu = mobileMenuRef.current;
    const focusable = menu?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <a
        className="fixed left-4 top-3 z-[60] -translate-y-24 rounded-md bg-brand-black px-4 py-3 text-sm font-semibold text-white focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
        href="#main-content"
      >
        {t("skipToContent")}
      </a>

      <Container className="flex min-h-16 items-center gap-2 py-2 lg:min-h-20">
        <Link
          aria-label={t("homeLabel")}
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          href="/"
        >
          <Image alt="" aria-hidden="true" height={52} priority src="/brand/logo.svg" width={52} />
          <span className="hidden font-heading text-lg font-bold tracking-[0.14em] sm:inline">SOVA</span>
        </Link>

        <nav aria-label={t("primaryLabel")} className="ml-auto hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <a
              className="flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-brand-black hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              href={item.href}
              key={item.id}
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <LanguageSwitch />
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-red px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            href={`tel:${business.phoneE164}`}
          >
            {t("freeLesson")}
          </a>
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <LanguageSwitch compact />
          <button
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-brand-black hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
            onClick={() => setMenuOpen((open) => !open)}
            ref={menuButtonRef}
            type="button"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <>
          <button
            aria-label={t("closeMenu")}
            className="fixed inset-0 top-16 z-40 cursor-default bg-black/30 lg:hidden"
            onClick={() => closeMenu(true)}
            tabIndex={-1}
            type="button"
          />
          <nav
            aria-label={t("mobileLabel")}
            className="absolute left-0 right-0 top-full z-50 border-b border-black/10 bg-white shadow-xl lg:hidden"
            id="mobile-navigation"
            ref={mobileMenuRef}
          >
            <Container className="flex max-h-[calc(100dvh-4rem)] flex-col gap-2 overflow-y-auto py-4">
              {navigationItems.map((item) => (
                <a
                  className="flex min-h-12 items-center rounded-xl px-4 text-base font-semibold text-brand-black hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-red"
                  href={item.href}
                  key={item.id}
                  onClick={() => closeMenu()}
                >
                  {t(item.labelKey)}
                </a>
              ))}
              <a
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-red px-5 text-center text-base font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                href={`tel:${business.phoneE164}`}
                onClick={() => closeMenu()}
              >
                {t("freeLesson")}
              </a>
            </Container>
          </nav>
        </>
      ) : null}
    </header>
  );
}
