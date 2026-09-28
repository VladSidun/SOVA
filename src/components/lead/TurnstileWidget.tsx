"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileWidgetProps = {
  locale: "uk" | "en";
  onError: () => void;
  onToken: (token: string) => void;
  resetKey: number;
  siteKey: string;
};

type TurnstileApi = {
  remove(widgetId: string): void;
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      language: string;
      size: "flexible";
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      "timeout-callback": () => void;
    },
  ): string;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function TurnstileWidget({ locale, onError, onToken, resetKey, siteKey }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  const onTokenRef = useRef(onToken);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onErrorRef.current = onError;
    onTokenRef.current = onToken;
  }, [onError, onToken]);

  useEffect(() => {
    const turnstile = window.turnstile;
    const container = containerRef.current;
    if (!scriptReady || !turnstile || !container) return;

    const widgetId = turnstile.render(container, {
      sitekey: siteKey,
      language: locale,
      size: "flexible",
      callback: (token) => onTokenRef.current(token),
      "error-callback": () => onErrorRef.current(),
      "expired-callback": () => onErrorRef.current(),
      "timeout-callback": () => onErrorRef.current(),
    });

    return () => turnstile.remove(widgetId);
  }, [locale, resetKey, scriptReady, siteKey]);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        onReady={() => setScriptReady(true)}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div className="mt-6 min-h-[65px]" ref={containerRef} />
    </>
  );
}
