"use client";

// "Projects": IDE Cert's zip lines as a pinned horizontal journey, in the same engine
// as the home page hero. Scrolling down slides the projects past; each one builds its
// side-view drawing (towers, cable, rider, dimensions) and counts up its figures.
// Phones, short screens and reduced motion get the projects stacked, each drawing
// itself once when it scrolls into view (or straight away, finished, for reduced motion).

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { projects, STATUS } from "@/config/projects";
import { Container } from "@/components/ui/Container";
import { T } from "@/lib/i18n/T";
import { ZipProfile } from "@/components/projects/ZipProfile";
import { ProjectStats } from "@/components/projects/ProjectStats";
import { play, rig, setD } from "@/components/projects/animate";
import "@/components/projects/projects.css";

const N = projects.length;
const LEAD = 0.55;
const TAIL = 0.3;
const U = N - 1 + LEAD + TAIL;

export function ProjectsSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    const stage = sec.querySelector<HTMLElement>(".pj-stage")!;
    const track = sec.querySelector<HTMLElement>(".pj-track")!;
    const fill = sec.querySelector<HTMLElement>(".pj-bar i")!;
    const dot = sec.querySelector<HTMLElement>(".pj-bar s")!;
    const count = sec.querySelector<HTMLElement>(".pj-hud b")!;
    const panels = [...sec.querySelectorAll<HTMLElement>(".pj-panel")];
    const rigs = panels.map(rig);
    const views = panels.map(() => ({ off: NaN, vis: NaN }));
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const smooth = (p: number, e0: number, e1: number) => {
      const t = clamp((p - e0) / (e1 - e0), 0, 1);
      return t * t * (3 - 2 * t);
    };

    const PIN = matchMedia("(min-width: 1024px) and (min-height: 620px)");
    const RM = matchMedia("(prefers-reduced-motion: reduce)");
    let mode: "pin" | "stack" | "still" | null = null;
    let undo: (() => void) | null = null;

    function pin() {
      sec!.classList.add("pj-pin");
      sec!.style.setProperty("--pj-u", String(U));
      let panelW = 0, stickTop = 0, range = 1, lastX = NaN, lastIdx = "";
      const layout = () => {
        panelW = track.clientWidth;
        stickTop = parseFloat(getComputedStyle(stage).top) || 0;
        range = Math.max(1, sec!.offsetHeight - stage.offsetHeight);
        lastX = NaN;
      };
      const progress = () => clamp((stickTop - sec!.getBoundingClientRect().top) / range, 0, 1);
      const render = (p: number) => {
        const u = p * U - LEAD;
        const c = clamp(u, 0, N - 1);
        const i = Math.min(N - 2, Math.floor(c));
        const f = c - i;
        // Dwell on each project, glide between them.
        const x = i + f - (0.9 * Math.sin(2 * Math.PI * f)) / (2 * Math.PI);
        if (!(Math.abs(x - lastX) <= 0.0005)) {
          lastX = x;
          track.style.transform = `translate3d(${(-x * panelW).toFixed(1)}px,0,0)`;
          const k = x / (N - 1);
          fill.style.transform = `scaleX(${k.toFixed(4)})`;
          dot.style.left = (k * 100).toFixed(2) + "%";
          const idx = String(Math.round(x) + 1).padStart(2, "0");
          if (idx !== lastIdx) {
            lastIdx = idx;
            count.textContent = idx;
          }
          panels.forEach((el, j) => {
            const off = j - x, vis = 1 - Math.min(1, Math.abs(off) * 1.4) * 0.9;
            const v = views[j];
            if (!(Math.abs(off - v.off) <= 0.001)) {
              v.off = off;
              el.style.setProperty("--off", off.toFixed(3));
            }
            if (!(Math.abs(vis - v.vis) <= 0.004)) {
              v.vis = vis;
              el.style.setProperty("--vis", vis.toFixed(3));
            }
          });
        }
        rigs.forEach((r, j) => setD(r, smooth(u, j - 0.55, j + 0.2)));
      };

      let target = 0, shown = 0, rafId: number | null = null, lastTick = 0, onScreen = false;
      const tick = (now: number) => {
        const dt = Math.min(100, now - (lastTick || now));
        lastTick = now;
        shown += (target - shown) * (1 - Math.pow(1 - 0.12, dt / 16.667));
        const settled = Math.abs(target - shown) < 0.0003;
        if (settled) shown = target;
        render(shown);
        if (settled) {
          rafId = null;
          lastTick = 0;
        } else rafId = requestAnimationFrame(tick);
      };
      const onScroll = () => {
        target = progress();
        if (rafId === null && onScreen) rafId = requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver((es) => {
        onScreen = es[0].isIntersecting;
        if (onScreen) onScroll();
      });
      io.observe(sec!);
      let rz: ReturnType<typeof setTimeout> | undefined;
      const onResize = () => {
        clearTimeout(rz);
        rz = setTimeout(() => {
          layout();
          target = shown = progress();
          render(shown);
        }, 120);
      };
      // Keyboard users: focusing a link in another project scrolls to that project.
      const onFocus = (e: FocusEvent) => {
        const j = panels.findIndex((el) => el.contains(e.target as Node));
        stage.scrollLeft = 0;
        if (j < 0) return;
        const top = sec!.getBoundingClientRect().top + scrollY - stickTop;
        scrollTo({ top: top + ((j + LEAD) / U) * range, behavior: "instant" });
      };
      layout();
      target = shown = progress();
      render(shown);
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", onResize);
      sec!.addEventListener("focusin", onFocus);
      document.fonts?.ready.then(onResize);
      return () => {
        removeEventListener("scroll", onScroll);
        removeEventListener("resize", onResize);
        sec!.removeEventListener("focusin", onFocus);
        io.disconnect();
        clearTimeout(rz);
        if (rafId !== null) cancelAnimationFrame(rafId);
        sec!.classList.remove("pj-pin");
        track.style.transform = "";
        panels.forEach((el) => {
          el.style.removeProperty("--off");
          el.style.removeProperty("--vis");
        });
        views.forEach((v) => ((v.off = NaN), (v.vis = NaN)));
      };
    }

    function stack() {
      const stops: (() => void)[] = [];
      rigs.forEach((r) => setD(r, 0));
      const io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            const r = rigs[panels.indexOf(e.target as HTMLElement)];
            stops.push(play(r, 2400));
          });
        },
        { rootMargin: "0px 0px -20% 0px", threshold: 0.2 },
      );
      panels.forEach((el) => io.observe(el));
      return () => {
        io.disconnect();
        stops.forEach((s) => s());
      };
    }

    const apply = () => {
      const next = RM.matches ? "still" : PIN.matches ? "pin" : "stack";
      if (next === mode) return;
      undo?.();
      undo = null;
      mode = next;
      if (next === "pin") undo = pin();
      else if (next === "stack") undo = stack();
      else rigs.forEach((r) => setD(r, 1));
    };
    PIN.addEventListener("change", apply);
    RM.addEventListener("change", apply);
    apply();
    return () => {
      PIN.removeEventListener("change", apply);
      RM.removeEventListener("change", apply);
      undo?.();
    };
  }, []);

  return (
    <section id="projektet" ref={ref} className="pj-sec" aria-labelledby="projects-title">
      <div className="pj-stage">
        <Container className="pj-head">
          <div>
            <p className="pj-kick">
              <T sq={`Projektet · ${String(N).padStart(2, "0")}`} en={`Projects · ${String(N).padStart(2, "0")}`} />
            </p>
            <h2 id="projects-title" className="pj-title font-display">
              <T sq="Zipline të projektuara nga IDE Cert" en="Zip lines engineered by IDE Cert" />
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <div className="pj-hud" aria-hidden="true">
              <span>
                <b>01</b> / {String(N).padStart(2, "0")}
              </span>
              <span className="pj-bar">
                <i />
                <s />
              </span>
            </div>
            <Link href="/projects" className="pj-all">
              <T sq="Të gjitha projektet" en="All projects" />
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </Container>

        <div className="pj-track">
          {projects.map((p, i) => (
            <article key={p.slug} className="pj-panel" aria-labelledby={`pj-${p.slug}`}>
              <span className="pj-big font-display" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pj-copy">
                <p className="pj-meta">
                  <span className="pj-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`pj-badge pj-${p.status}`}>
                    <T sq={STATUS[p.status].sq} en={STATUS[p.status].en} />
                  </span>
                  <span>{p.year}</span>
                </p>
                <h3 id={`pj-${p.slug}`} className="pj-name font-display">
                  {p.name}
                </h3>
                <p className="pj-place">
                  <MapPin aria-hidden className="size-4" />
                  <T sq={`${p.place.sq}, ${p.country.sq}`} en={`${p.place.en}, ${p.country.en}`} />
                </p>
                <p className="pj-tag">
                  <T sq={p.tagline.sq} en={p.tagline.en} />
                </p>
                <ProjectStats project={p} />
                <Link href={`/projects/${p.slug}`} className="pj-cta">
                  <T sq="Shiko projektin" en="View project" />
                  <span className="sr-only">: {p.name}</span>
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
              <div className="pj-visual">
                {p.photos[0] && (
                  <div className="pj-photo">
                    <Image src={p.photos[0].src} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" />
                  </div>
                )}
                <ZipProfile project={p} idPrefix={`h-${p.slug}`} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
