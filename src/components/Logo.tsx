export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Define gradients */}
      <defs>
        <linearGradient id="tub-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f4a7c" />
          <stop offset="100%" stopColor="#002244" />
        </linearGradient>
        <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="rim-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Bathtub main body - realistic shape */}
      <g filter="url(#shadow)">
        {/* Outer tub wall - left side */}
        <path
          d="M 12 28 Q 8 40 8 55 Q 8 72 20 78 L 100 78 Q 112 72 112 55 Q 112 40 108 28 Z"
          fill="url(#tub-gradient)"
          stroke="#001a33"
          strokeWidth="0.8"
        />

        {/* Tub rim - top edge */}
        <ellipse
          cx="60"
          cy="28"
          rx="49"
          ry="8"
          fill="url(#rim-gradient)"
          stroke="#c4b5a0"
          strokeWidth="1"
        />

        {/* Tub bottom - underside depth */}
        <ellipse
          cx="60"
          cy="78"
          rx="47"
          ry="6"
          fill="#001a33"
          opacity="0.4"
        />

        {/* Water fill - realistic wave */}
        <path
          d="M 15 50 Q 20 46 28 48 T 44 45 T 60 47 T 76 45 T 92 48 Q 100 46 105 50 L 105 65 Q 105 72 100 76 L 20 76 Q 15 72 15 65 Z"
          fill="url(#water-gradient)"
          opacity="0.85"
        />

        {/* Water surface ripples - natural waves */}
        <path
          d="M 15 50 Q 20 46 28 48 T 44 45 T 60 47 T 76 45 T 92 48 Q 100 46 105 50"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="1.2"
          opacity="0.6"
          strokeLinecap="round"
        />

        {/* Foam bubble effect - left */}
        <circle
          cx="25"
          cy="45"
          r="2"
          fill="#ffffff"
          opacity="0.4"
        />

        {/* Foam bubble effect - center */}
        <circle
          cx="60"
          cy="42"
          r="1.5"
          fill="#ffffff"
          opacity="0.3"
        />

        {/* Foam bubble effect - right */}
        <circle
          cx="95"
          cy="46"
          r="1.8"
          fill="#ffffff"
          opacity="0.35"
        />

        {/* Decorative jets/nozzles - left side */}
        <rect
          x="10"
          y="58"
          width="3"
          height="5"
          rx="1"
          fill="#0f4a7c"
          opacity="0.6"
        />

        {/* Decorative jets/nozzles - right side */}
        <rect
          x="107"
          y="58"
          width="3"
          height="5"
          rx="1"
          fill="#0f4a7c"
          opacity="0.6"
        />

        {/* Highlight on rim - glossy effect */}
        <ellipse
          cx="60"
          cy="26"
          rx="40"
          ry="5"
          fill="#ffffff"
          opacity="0.15"
        />

        {/* Inner shadow for depth */}
        <path
          d="M 16 32 Q 14 42 14 55 Q 14 68 22 74"
          fill="none"
          stroke="#000000"
          strokeWidth="1"
          opacity="0.1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
