"use client";

type Petal = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  type: "sakura" | "rose";
  rotate: number;
};

// 18 statically positioned drifting petals for zero-re-render, pure GPU-accelerated drift
const STATIC_PETALS: Petal[] = [
  { id: 1, left: 5, size: 14, duration: 16, delay: 0, type: "sakura", rotate: 20 },
  { id: 2, left: 12, size: 18, duration: 22, delay: 3, type: "rose", rotate: 75 },
  { id: 3, left: 20, size: 12, duration: 14, delay: 6, type: "sakura", rotate: 140 },
  { id: 4, left: 27, size: 16, duration: 19, delay: 1, type: "sakura", rotate: 45 },
  { id: 5, left: 35, size: 20, duration: 25, delay: 8, type: "rose", rotate: 210 },
  { id: 6, left: 42, size: 13, duration: 15, delay: 4, type: "sakura", rotate: 90 },
  { id: 7, left: 50, size: 17, duration: 21, delay: 2, type: "sakura", rotate: 180 },
  { id: 8, left: 58, size: 22, duration: 24, delay: 7, type: "rose", rotate: 300 },
  { id: 9, left: 65, size: 11, duration: 13, delay: 5, type: "sakura", rotate: 15 },
  { id: 10, left: 72, size: 15, duration: 18, delay: 9, type: "sakura", rotate: 130 },
  { id: 11, left: 78, size: 19, duration: 23, delay: 3.5, type: "rose", rotate: 85 },
  { id: 12, left: 84, size: 14, duration: 17, delay: 1.5, type: "sakura", rotate: 240 },
  { id: 13, left: 91, size: 16, duration: 20, delay: 6.5, type: "sakura", rotate: 60 },
  { id: 14, left: 96, size: 18, duration: 22, delay: 4.5, type: "rose", rotate: 165 },
  { id: 15, left: 8, size: 13, duration: 15, delay: 8.5, type: "sakura", rotate: 110 },
  { id: 16, left: 30, size: 15, duration: 18, delay: 5.5, type: "rose", rotate: 320 },
  { id: 17, left: 62, size: 12, duration: 16, delay: 10, type: "sakura", rotate: 40 },
  { id: 18, left: 88, size: 16, duration: 21, delay: 2.5, type: "rose", rotate: 195 },
];

export function PetalBreeze() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
    >
      {STATIC_PETALS.map((p) => {
        const isRose = p.type === "rose";
        return (
          <div
            key={p.id}
            className="absolute top-[-30px] opacity-0"
            style={{
              left: `${p.left}%`,
              animation: `drift-petal ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size * 1.35}px`,
                borderRadius: isRose
                  ? "50% 50% 50% 10%"
                  : "60% 40% 70% 30% / 70% 30% 70% 30%",
                background: isRose
                  ? "radial-gradient(ellipse at 35% 35%, #c4454d, #8f2d3a 80%, #54141e)"
                  : "radial-gradient(ellipse at 30% 30%, #ffccd5, #f3a6b2 65%, #c4454d 100%)",
                transform: `rotate(${p.rotate}deg)`,
                boxShadow: isRose
                  ? "0 0 6px rgba(196,69,77,0.3)"
                  : "0 0 5px rgba(255,182,193,0.35)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                animation: "sway-petal 4s ease-in-out infinite alternate",
              }}
            />
          </div>
        );
      })}

      <style jsx>{`
        @keyframes drift-petal {
          0% {
            transform: translate3d(0, -20px, 0);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(80px, 105vh, 0);
            opacity: 0;
          }
        }
        @keyframes sway-petal {
          0% {
            transform: rotate(-15deg) scale(0.95);
          }
          100% {
            transform: rotate(25deg) scale(1.05) translate(15px, 0);
          }
        }
      `}</style>
    </div>
  );
}
