"use client";

import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { scaleSequential } from "d3-scale";
import bihar from "@/data/bihar-districts.json";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/format";

const WIDTH = 640;
const HEIGHT = 460;

// Blue sequential ramp (light -> deep gov blue)
function color(t) {
  const stops = [
    [219, 234, 254],
    [147, 197, 253],
    [59, 130, 246],
    [37, 99, 235],
    [11, 61, 145],
  ];
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export default function BiharMap({ data }) {
  const { lang } = useApp();
  const [hover, setHover] = useState(null);

  // data: [{ district, count, due }]
  const lookup = useMemo(() => {
    const m = {};
    let max = 1;
    for (const d of data) {
      m[d.district] = d;
      if (d.count > max) max = d.count;
    }
    return { m, max };
  }, [data]);

  const { paths } = useMemo(() => {
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], bihar);
    const path = geoPath(projection);
    const ps = bihar.features.map((f) => ({
      d: path(f),
      name: f.properties.district,
      centroid: path.centroid(f),
    }));
    return { paths: ps };
  }, []);

  const scale = useMemo(() => scaleSequential([0, lookup.max], (t) => color(t)), [lookup.max]);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full">
        {paths.map((p) => {
          const rec = lookup.m[p.name];
          const fill = rec ? scale(rec.count) : "#e2e8f0";
          const active = hover?.name === p.name;
          return (
            <path
              key={p.name}
              d={p.d}
              fill={fill}
              stroke={active ? "#0f172a" : "#ffffff"}
              strokeWidth={active ? 1.6 : 0.6}
              className="cursor-pointer transition-[stroke-width]"
              onMouseEnter={() => setHover({ name: p.name, x: p.centroid[0], y: p.centroid[1], rec })}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
        {paths
          .filter((p) => (lookup.m[p.name]?.count || 0) >= lookup.max * 0.55)
          .map((p) => (
            <text
              key={`l-${p.name}`}
              x={p.centroid[0]}
              y={p.centroid[1]}
              textAnchor="middle"
              className="pointer-events-none fill-white text-[8px] font-semibold"
            >
              {p.name}
            </text>
          ))}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-xl"
          style={{ left: `${(hover.x / WIDTH) * 100}%`, top: `${(hover.y / HEIGHT) * 100}%` }}
        >
          <div className="font-bold">{hover.name}</div>
          <div className="text-white/80">
            {hover.rec ? `${hover.rec.count} ${lang === "hi" ? "चालान" : "challans"}` : "—"}
          </div>
          {hover.rec && <div className="text-amber-300">{formatINR(hover.rec.due)} {lang === "hi" ? "बकाया" : "due"}</div>}
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <span>{lang === "hi" ? "कम" : "Low"}</span>
        <div className="flex h-2.5 w-40 overflow-hidden rounded-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1" style={{ background: color(i / 19) }} />
          ))}
        </div>
        <span>{lang === "hi" ? "अधिक" : "High"}</span>
      </div>
    </div>
  );
}
