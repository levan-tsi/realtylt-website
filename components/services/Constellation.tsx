/** The /ai hub, drawn flat.
 *
 * The journey at realtylt.com/ai is a galaxy that reshapes into a brain, with every
 * service hanging off the core as a node. This is that shape in static SVG: it ties the
 * marketing pages to the thing they describe, it is the page's mid-scroll picture, and it
 * costs no WebGL, no client JS, and no stock photography.
 *
 * `lit` is the node index to light (null lights none). Callers pass the service's position
 * in the registry, so every service page lights a different node. */
export function Constellation({
  count = 12,
  lit = null,
  label,
}: {
  count?: number;
  /** Node to highlight, or null. */
  lit?: number | null;
  label: string;
}) {
  const cx = 200;
  const cy = 160;
  const rx = 118;
  const ry = 97;
  const active = lit === null ? null : ((lit % count) + count) % count;

  const nodes = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // start at the top, go clockwise
    return { i, x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
  });

  return (
    <svg viewBox="0 0 400 320" className="h-auto w-full" role="img" aria-label={label}>
      {nodes.map((n) => (
        <line
          key={`l-${n.i}`}
          x1={cx}
          y1={cy}
          x2={n.x}
          y2={n.y}
          stroke={n.i === active ? "#28a8e0" : "#ffffff"}
          strokeOpacity={n.i === active ? 0.75 : 0.12}
          strokeWidth={n.i === active ? 1.4 : 1}
        />
      ))}

      {/* the core */}
      <circle cx={cx} cy={cy} r={26} fill="none" stroke="#ffffff" strokeOpacity={0.16} />
      <circle cx={cx} cy={cy} r={14} fill="none" stroke="#ffffff" strokeOpacity={0.28} />
      <circle cx={cx} cy={cy} r={4.5} fill="#ffffff" fillOpacity={0.75} />

      {nodes.map((n) =>
        n.i === active ? (
          <g key={`n-${n.i}`}>
            {/* live signal — a sonar ping emanating from the lit node, echoing the /ai hub's
                "answers in seconds". CSS-animated so the global reduced-motion rule collapses it. */}
            <circle
              className="svc-ping"
              cx={n.x}
              cy={n.y}
              r={6}
              fill="none"
              stroke="#28a8e0"
              strokeWidth={1.2}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <circle cx={n.x} cy={n.y} r={11} fill="#28a8e0" fillOpacity={0.16} />
            <circle cx={n.x} cy={n.y} r={4.5} fill="#28a8e0" />
          </g>
        ) : (
          <circle key={`n-${n.i}`} cx={n.x} cy={n.y} r={2.6} fill="#ffffff" fillOpacity={0.32} />
        ),
      )}
    </svg>
  );
}
