import type { Project } from "@/config/projects";
import { T } from "@/lib/i18n/T";
import { fmt } from "./geometry";

// Length, drop and speed as count-up figures. animate.ts counts [data-count] from
// data-from (default 0); the server renders the final values.

export function ProjectStats({ project: p, className = "" }: { project: Project; className?: string }) {
  const [lo, hi] = p.speed.match(/\d+/g)!.map(Number);
  const twin = p.lines > 1;
  return (
    <dl className={`pj-stats ${className}`}>
      <div>
        <dt>
          {twin ? <T sq="Gjatësia / linjë" en="Length / line" /> : <T sq="Gjatësia" en="Length" />}
        </dt>
        <dd>
          {!p.dropM && <span className="pj-pre">~</span>}
          <b data-count={p.lengthM}>{fmt(p.lengthM)}</b>
          <i>m</i>
        </dd>
      </div>
      <div>
        {p.dropM ? (
          <>
            <dt>
              <T sq="Disniveli" en="Drop" />
            </dt>
            <dd>
              <b data-count={p.dropM} data-dec="2">
                {fmt(p.dropM, 2)}
              </b>
              <i>m</i>
            </dd>
          </>
        ) : (
          <>
            <dt>
              <T sq="Linja paralele" en="Parallel lines" />
            </dt>
            <dd>
              <b data-count={p.lines}>{p.lines}</b>
            </dd>
          </>
        )}
      </div>
      <div>
        <dt>
          <T sq="Shpejtësia" en="Speed" />
        </dt>
        <dd>
          <span className="pj-pre">{lo}–</span>
          <b data-count={hi} data-from={lo}>
            {hi}
          </b>
          <i>km/h</i>
        </dd>
      </div>
    </dl>
  );
}
