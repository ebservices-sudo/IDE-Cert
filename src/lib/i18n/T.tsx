// Bilingual text (Albanian + English). Both versions are in the HTML; CSS shows the one
// that matches <html data-lang>. Works in server and client components alike.
// For attributes (placeholder, aria-label, title) use `useLang()` from ./useLang instead.

export type Lang = "sq" | "en";

export function T({ sq, en }: { sq: React.ReactNode; en: React.ReactNode }) {
  return (
    <>
      <span className="lang-sq">{sq}</span>
      <span className="lang-en">{en}</span>
    </>
  );
}

/** A pair of strings, for data that is shown in both languages. */
export type L10n = { sq: string; en: string };

export const LANG_KEY = "idecert-lang";

/** Runs before first paint (inline in <head>) so the right language shows without a flash. */
export const langBootScript = `(function(){try{var d=document.documentElement,q=new URLSearchParams(location.search).get('lang'),l=(q==='en'||q==='sq')?q:localStorage.getItem('${LANG_KEY}');if(l!=='en')l='sq';d.dataset.lang=l;d.lang=l;}catch(e){}})();`;
