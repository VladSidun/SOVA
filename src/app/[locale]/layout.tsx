import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsEvents } from "@/components/analytics/AnalyticsEvents";
import { Header } from "@/components/layout/Header";
import { getNavigationItems } from "@/config/navigation";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/brand/logo.svg", type: "image/svg+xml" }],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <NextIntlClientProvider>
          <AnalyticsEvents />
          <Header navigationItems={getNavigationItems()} />
          {children}
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
