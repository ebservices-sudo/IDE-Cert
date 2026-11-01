"use client";

import { useSyncExternalStore } from "react";
import { LANG_KEY, type Lang } from "./T";

const EVENT = "idecert-lang";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
const getSnapshot = (): Lang => (document.documentElement.dataset.lang === "en" ? "en" : "sq");
const getServerSnapshot = (): Lang => "sq";

/** The current language, for strings that cannot be <T> (attributes, computed text). */
export function useLang() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = (sq: string, en: string) => (lang === "sq" ? sq : en);
  return { lang, t };
}

export function setLang(lang: Lang) {
  const d = document.documentElement;
  d.dataset.lang = lang;
  d.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // storage blocked: the choice still applies to this page view
  }
  window.dispatchEvent(new Event(EVENT));
}
