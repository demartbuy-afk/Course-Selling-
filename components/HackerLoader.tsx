import React from 'react';

// Full-page loading screen showing the unique cyber-security "loading logo" mark:
// a glowing hexagonal emblem with a keyhole/lock symbol, orbited by two
// counter-rotating red/cyan arcs and a slow-spinning HUD tick ring.
export const HackerLoader: React.FC = () => {
  const ticks = Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2;
    const r1 = 76;
    const r2 = 84;

    const x1 = 85 + r1 * Math.cos(angle);
    const y1 = 85 + r1 * Math.sin(angle);
    const x2 = 85 + r2 * Math.cos(angle);
    const y2 = 85 + r2 * Math.sin(angle);

    return {
      x1,
      y1,
      x2,
      y2,
      hi: i % 5 === 0,
    };
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="relative w-[220px] h-[220px] flex items-center justify-center">

        {/* Ambient pulsing glow */}
        <div
          className="cyber-logo-glow absolute w-[190px] h-[190px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, #ff2e4d33, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />

        <div className="relative w-[170px] h-[170px]">

          <svg
            viewBox="0 0 170 170"
            className="absolute inset-0 overflow-visible"
          >
            <defs>

              {/* Red gradient */}
              <linearGradient
                id="gradRed"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ff2e4d" />
                <stop offset="100%" stopColor="#ff7a5c" />
              </linearGradient>

              {/* Cyan gradient */}
              <linearGradient
                id="gradCyan"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3ad4ea" />
                <stop offset="100%" stopColor="#8af7ff" />
              </linearGradient>

              {/* Center edge gradient */}
              <linearGradient
                id="gradEdge"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ff2e4d" />
                <stop offset="100%" stopColor="#3ad4ea" />
              </linearGradient>

            </defs>

            {/* Slow-spinning outer HUD tick ring */}
            <g className="cyber-logo-ticks">
              {ticks.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.hi ? '#3ad4ea' : '#123640'}
                  strokeWidth={2}
                  opacity={t.hi ? 0.8 : 0.55}
                />
              ))}
            </g>

            {/* Counter-rotating glowing red arc */}
            <circle
              className="cyber-logo-arc-red"
              cx="85"
              cy="85"
              r="70"
              fill="none"
              stroke="url(#gradRed)"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray="120 340"
              style={{
                filter:
                  'drop-shadow(0 0 6px #ff2e4d) drop-shadow(0 0 14px #ff2e4d)',
              }}
            />

            {/* Counter-rotating glowing cyan arc */}
            <circle
              className="cyber-logo-arc-cyan"
              cx="85"
              cy="85"
              r="58"
              fill="none"
              stroke="url(#gradCyan)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="90 280"
              style={{
                filter:
                  'drop-shadow(0 0 5px #3ad4ea) drop-shadow(0 0 10px #3ad4ea)',
              }}
            />
          </svg>

          {/* Center hexagonal emblem with keyhole/lock symbol */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78px] h-[78px]">

            {/* Hexagon */}
            <svg
              viewBox="0 0 78 78"
              className="absolute inset-0"
              style={{
                filter:
                  'drop-shadow(0 0 8px #ff2e4d88) drop-shadow(0 0 14px #3ad4ea55)',
              }}
            >
              <path
                d="M39 4 L68 20 V58 L39 74 L10 58 V20 Z"
                fill="#050607"
                stroke="url(#gradEdge)"
                strokeWidth={2}
              />
            </svg>

            {/* Keyhole */}
            <svg
              viewBox="0 0 78 78"
              className="absolute inset-0"
            >
              <circle
                cx="39"
                cy="33"
                r="8"
                fill="none"
                stroke="#e8fbff"
                strokeWidth={1.6}
                opacity={0.9}
                style={{
                  filter: 'drop-shadow(0 0 4px #3ad4ea)',
                }}
              />

              <path
                d="M39 40 L39 52"
                stroke="#e8fbff"
                strokeWidth={1.6}
                opacity={0.9}
                style={{
                  filter: 'drop-shadow(0 0 4px #3ad4ea)',
                }}
              />

              {/* Red keyhole dot */}
              <circle
                className="cyber-logo-dot"
                cx="39"
                cy="33"
                r="2.4"
                fill="#ff2e4d"
                style={{
                  filter: 'drop-shadow(0 0 5px #ff2e4d)',
                }}
              />
            </svg>

          </div>
        </div>
      </div>

      {/* Loading text */}
      <p className="mt-6 text-[10px] tracking-[6px] text-cyan-200/70 font-mono">
        LOADING
      </p>
    </div>
  );
};
