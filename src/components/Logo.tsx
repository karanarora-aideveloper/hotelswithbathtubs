export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hotels With Bathtubs Brand Logo"
    >
      <defs>
        {/* Luxury Champagne Gold Metallic Gradient */}
        <linearGradient id="hwb-gold" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#F5DC96" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#E2C265" />
          <stop offset="100%" stopColor="#99751E" />
        </linearGradient>

        {/* Serene Azure Water Flow Gradient */}
        <linearGradient id="hwb-azure" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.95" />
        </linearGradient>

        {/* Subtle Ambient Drop Shadow for depth on light and dark surfaces */}
        <filter id="hwb-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0B192C" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter="url(#hwb-shadow)">
        {/* Freestanding Soaking Tub Basin Outer Contour */}
        <path
          d="M 16 48 C 16 34, 28 32, 50 32 C 72 32, 84 34, 84 48 C 84 70, 72 78, 50 78 C 28 78, 16 70, 16 48 Z"
          stroke="url(#hwb-gold)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interior Serene Water Bath Glow */}
        <path
          d="M 22 50 C 26 44, 38 46, 50 44 C 62 42, 74 46, 78 50 C 76 68, 66 74, 50 74 C 34 74, 24 68, 22 50 Z"
          fill="url(#hwb-azure)"
          opacity="0.18"
        />

        {/* Fluid Infinity Ripple / Water Wave Ribbon */}
        <path
          d="M 26 48 C 26 38, 40 38, 50 48 C 60 38, 74 38, 74 48 C 74 58, 60 58, 50 48 C 40 58, 26 58, 26 48 Z"
          stroke="url(#hwb-gold)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Suspended Luminous Gold Pearl / Water Droplet */}
        <path
          d="M 50 18 C 50 18, 55.5 25, 55.5 29 C 55.5 32, 53 34.5, 50 34.5 C 47 34.5, 44.5 32, 44.5 29 C 44.5 25, 50 18, 50 18 Z"
          fill="url(#hwb-gold)"
        />

        {/* Architectural Pedestal / Plinth Base */}
        <path
          d="M 34 84 L 66 84"
          stroke="url(#hwb-gold)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M 40 89 L 60 89"
          stroke="url(#hwb-gold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>
    </svg>
  );
}
