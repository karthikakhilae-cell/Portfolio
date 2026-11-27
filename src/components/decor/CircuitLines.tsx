interface CircuitLinesProps {
  className?: string;
  variant?: "corner" | "band" | "cluster";
}

// Lightweight static SVG circuit/PCB-trace decoration — thin lines with
// small node squares, echoing the "AI + design" tech motif from the
// reference. Deliberately simple/abstract: no photographic assets exist
// for the reference's robotic-hand photo, so this fills the same role
// without fabricating or sourcing imagery.
export default function CircuitLines({ className = "", variant = "corner" }: CircuitLinesProps) {
  if (variant === "band") {
    return (
      <svg
        viewBox="0 0 240 160"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M0 20H60L75 35V80" />
        <path d="M0 60H40" />
        <path d="M240 30H180L168 42V100" />
        <path d="M240 90H200L190 100" />
        <path d="M100 0V30L115 45H160" />
        <path d="M130 160V120L145 105" />
        {[[60, 20], [75, 80], [40, 60], [180, 30], [168, 100], [200, 90], [100, 30], [160, 45], [130, 120], [145, 105]].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 2} y={y - 2} width="4" height="4" />
        ))}
      </svg>
    );
  }

  if (variant === "cluster") {
    return (
      <svg
        viewBox="0 0 160 160"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M80 10V50M80 50L50 70M80 50L110 70M50 70V110M110 70V110M50 110L80 130M110 110L80 130M80 130V150" />
        <path d="M30 40H50M130 40H110M20 90H50M140 90H110" />
        {[[80, 10], [80, 50], [50, 70], [110, 70], [50, 110], [110, 110], [80, 130], [80, 150], [30, 40], [130, 40], [20, 90], [140, 90]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="currentColor" stroke="none" />
        ))}
      </svg>
    );
  }

  // corner (default)
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M200 40H140L120 60V110" />
      <path d="M200 90H160" />
      <path d="M170 0V30L190 50" />
      <path d="M90 130H140" />
      {[[140, 40], [120, 110], [160, 90], [170, 30], [190, 50], [90, 130], [140, 130]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 2} y={y - 2} width="4" height="4" />
      ))}
    </svg>
  );
}
