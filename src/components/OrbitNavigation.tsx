import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/app";
import { Area } from "@/types/domain";

interface OrbitNavigationProps {
  centerImageSrc?: string;
}

const OrbitNavigation: React.FC<OrbitNavigationProps> = ({ centerImageSrc }) => {
  const navigate = useNavigate();
  const areas = useAppStore((s) => s.areas);
  const getStreakForArea = useAppStore((s) => s.getStreakForArea);

  const areasArr = useMemo(() => Object.values(areas) as Area[], [areas]);

  const radius = 140; // px orbit radius (adjusts in responsive wrapper)

  return (
    <div className="relative mx-auto w-full max-w-[520px] aspect-square">
      {/* Center avatar/logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="size-28 rounded-full border border-border bg-card shadow-[var(--shadow-elegant)] grid place-items-center overflow-hidden">
          {centerImageSrc ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={centerImageSrc} loading="lazy" className="size-full object-cover" alt="Profile or app logo" />
          ) : (
            <div className="text-3xl" aria-hidden>
              🧡
            </div>
          )}
        </div>
      </div>

      {/* Planets */}
      {areasArr.map((a, i) => {
        const angle = (i / areasArr.length) * Math.PI * 2;
        const streak = getStreakForArea(a.id);
        const progress = Math.min(1, streak / 7); // normalize 0..1 (7-day target)
        const size = 56 + progress * 28; // 56..84
        const glowAlpha = 0.25 + progress * 0.45; // 0.25..0.7
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const style: React.CSSProperties = {
          width: size,
          height: size,
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          background: `hsl(${a.color})`,
          boxShadow: `0 0 0 2px hsl(${a.color} / 0.45), 0 0 24px hsl(${a.color} / ${glowAlpha})`,
        };
        return (
          <button
            key={a.id}
            style={style}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full text-[10px] sm:text-xs font-medium text-[hsl(var(--primary-foreground))] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/80 hover:scale-105 transition-transform"
            aria-label={`${a.name} — progress ${(progress * 100).toFixed(0)}%`}
            onClick={() => navigate(`/area/${a.slug}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/area/${a.slug}`);
              }
            }}
          >
            <span className="sr-only">{a.name}</span>
            <div className="grid place-items-center size-full">
              <div className="text-xl" aria-hidden>
                {a.icon}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default OrbitNavigation;
