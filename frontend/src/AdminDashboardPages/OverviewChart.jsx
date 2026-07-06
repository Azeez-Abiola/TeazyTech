import React, { useRef, useState } from "react";

// Series colors validated for CVD + contrast on both surfaces
// (light: #2F6FCC/#D97706, dark: #3987e5/#c98500)
const THEMES = {
  light: {
    published: "#2F6FCC",
    drafts: "#D97706",
    grid: "#eef0f4",
    axis: "#9ca3af",
  },
  dark: {
    published: "#3987e5",
    drafts: "#c98500",
    grid: "#2c2c2c",
    axis: "#6b7280",
  },
};

const W = 820;
const H = 280;
const PAD = { top: 16, right: 20, bottom: 32, left: 40 };

/**
 * Line chart of posts per month (published vs drafts) with a
 * crosshair + tooltip hover layer. `data` is an array of
 * { label, published, drafts } buckets in chronological order.
 */
const OverviewChart = ({ data, isDark }) => {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null); // { index, px }
  const theme = THEMES[isDark ? "dark" : "light"];

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const rawMax = Math.max(1, ...data.flatMap((d) => [d.published, d.drafts]));
  const yMax = Math.ceil(rawMax / 4) * 4; // divisible by 4 so ticks are integers
  const ticks = [0, yMax / 4, yMax / 2, (3 * yMax) / 4, yMax];

  const x = (i) =>
    PAD.left + (data.length > 1 ? (i * innerW) / (data.length - 1) : innerW / 2);
  const y = (v) => PAD.top + innerH - (v / yMax) * innerH;

  const linePath = (key) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d[key])}`).join(" ");

  const handleMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(x(i) - svgX);
      if (dist < best) {
        best = dist;
        nearest = i;
      }
    });
    setHover({ index: nearest, px: (x(nearest) / W) * rect.width });
  };

  if (!data.length) return null;
  const hovered = hover ? data[hover.index] : null;

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex items-center justify-end gap-5">
        {[
          { label: "Published", color: theme.published },
          { label: "Drafts", color: theme.drafts },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div
        ref={wrapRef}
        className="relative"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Posts per month, published versus drafts">
          {/* Grid + y labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={theme.grid}
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                fontSize="11"
                fill={theme.axis}
              >
                {t}
              </text>
            </g>
          ))}

          {/* X labels */}
          {data.map((d, i) => (
            <text
              key={d.label}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="11"
              fill={theme.axis}
            >
              {d.label}
            </text>
          ))}

          {/* Crosshair */}
          {hover && (
            <line
              x1={x(hover.index)}
              x2={x(hover.index)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke={theme.axis}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* Series lines */}
          <path d={linePath("published")} fill="none" stroke={theme.published} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <path d={linePath("drafts")} fill="none" stroke={theme.drafts} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* Hover markers */}
          {hover && (
            <>
              <circle cx={x(hover.index)} cy={y(hovered.published)} r="5" fill={theme.published} stroke={isDark ? "#1a1a1a" : "#ffffff"} strokeWidth="2" />
              <circle cx={x(hover.index)} cy={y(hovered.drafts)} r="5" fill={theme.drafts} stroke={isDark ? "#1a1a1a" : "#ffffff"} strokeWidth="2" />
            </>
          )}
        </svg>

        {/* Tooltip */}
        {hover && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-[130px] -translate-x-1/2 rounded-xl border border-gray-100 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-[#242424]"
            style={{
              left: Math.min(
                Math.max(hover.px, 75),
                (wrapRef.current?.clientWidth || W) - 75,
              ),
            }}
          >
            <p className="mb-2 border-b border-gray-100 pb-1.5 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
              {hovered.label}
            </p>
            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.published }} />
                Published
                <span className="ml-auto font-semibold text-gray-900 dark:text-white">{hovered.published}</span>
              </p>
              <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.drafts }} />
                Drafts
                <span className="ml-auto font-semibold text-gray-900 dark:text-white">{hovered.drafts}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewChart;
