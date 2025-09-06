import React from "react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type AreaId =
  | "love"
  | "spirituality"
  | "fitness"
  | "money"
  | "productivity"
  | "energy"
  | "learning";

export interface HumanoidProps {
  onSelectArea: (areaId: AreaId) => void;
  highlightedAreaId?: AreaId;
}

const areaLabels: Record<AreaId, string> = {
  love: "Heart — Love & Relationships",
  spirituality: "Head — Spirituality & Mindset",
  fitness: "Right Arm — Fitness & Strength",
  money: "Left Hand — Money & Finance",
  productivity: "Core — Productivity & Focus",
  energy: "Legs — Energy & Movement",
  learning: "Mouth — Communication & Learning",
};

const Humanoid: React.FC<HumanoidProps> = ({ onSelectArea, highlightedAreaId }) => {
  const handleActivate = (id: AreaId) => () => onSelectArea(id);
  const commonA11y = (id: AreaId) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": areaLabels[id],
    onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectArea(id);
      }
    },
  });

  return (
    <TooltipProvider>
      <svg
        viewBox="0 0 240 420"
        className="max-w-[420px] w-full mx-auto drop-shadow-md animate-breath"
        aria-labelledby="humanoid-title"
        role="img"
      >
        <title id="humanoid-title">Humanoid hotspots for life areas</title>
        <defs>
          <radialGradient id="glow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="120" cy="160" rx="90" ry="120" fill="url(#glow)" />

        {/* Torso */}
        <g>
          <path
            d="M120 110 C90 130 80 170 80 210 L80 280 C80 320 95 340 120 340 C145 340 160 320 160 280 L160 210 C160 170 150 130 120 110 Z"
            className="fill-[hsl(215_23%_12%)] stroke-[hsl(217_19%_24%)] [stroke-width:2]"
          />
        </g>

        {/* Head */}
        <circle cx="120" cy="70" r="38" className="fill-[hsl(215_23%_12%)] stroke-[hsl(217_19%_24%)] stroke-[2]" />

        {/* Arms */}
        <path d="M80 200 C50 190 45 165 50 150 C60 130 70 140 75 155 C78 165 85 180 95 190" className="fill-none stroke-[hsl(217_19%_24%)] stroke-[10]" />
        <path d="M160 200 C190 190 195 165 190 150 C180 130 170 140 165 155 C162 165 155 180 145 190" className="fill-none stroke-[hsl(217_19%_24%)] stroke-[10]" />

        {/* Legs */}
        <path d="M120 340 L105 400" className="stroke-[hsl(217_19%_24%)] stroke-[10]" />
        <path d="M120 340 L135 400" className="stroke-[hsl(217_19%_24%)] stroke-[10]" />

        {/* Heart (love) */}
        <g transform="translate(120,200)">
          <path
            d="M0 0 c -20 -25 -55 -5 -40 20 c 8 13 40 35 40 35 c 0 0 32 -22 40 -35 c 15 -25 -20 -45 -40 -20 z"
            className={`fill-[hsl(var(--primary))] ${highlightedAreaId === 'love' ? 'animate-heart-pulse' : ''}`}
          />
        </g>

        {/* Interactive transparent hit areas with tooltips */}
        <Tooltip>
          <TooltipTrigger asChild>
            <g
              {...commonA11y("love")}
              onClick={handleActivate("love")}
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              <rect x="90" y="170" width="60" height="60" fillOpacity="0" />
            </g>
          </TooltipTrigger>
          <TooltipContent side="top">Love & Relationships</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <g {...commonA11y("spirituality")} onClick={handleActivate("spirituality")} className="cursor-pointer">
              <circle cx="120" cy="70" r="42" fillOpacity="0" />
            </g>
          </TooltipTrigger>
          <TooltipContent side="top">Spirituality & Mindset</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <g {...commonA11y("fitness")} onClick={handleActivate("fitness")} className="cursor-pointer">
              <rect x="150" y="160" width="70" height="60" fillOpacity="0" />
            </g>
          </TooltipTrigger>
          <TooltipContent side="top">Fitness & Strength</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <g {...commonA11y("money")} onClick={handleActivate("money")} className="cursor-pointer">
              <rect x="20" y="160" width="70" height="60" fillOpacity="0" />
            </g>
          </TooltipTrigger>
          <TooltipContent side="top">Money & Finance</TooltipContent>
        </Tooltip>

        {/* Extra regions */}
        <g {...commonA11y("productivity")} onClick={handleActivate("productivity")} className="cursor-pointer">
          <rect x="90" y="230" width="60" height="60" fillOpacity="0" />
        </g>
        <g {...commonA11y("energy")} onClick={handleActivate("energy")} className="cursor-pointer">
          <rect x="90" y="300" width="60" height="40" fillOpacity="0" />
        </g>
        <g {...commonA11y("learning")} onClick={handleActivate("learning")} className="cursor-pointer">
          <rect x="110" y="95" width="60" height="30" fillOpacity="0" />
        </g>
      </svg>
    </TooltipProvider>
  );
};

export default Humanoid;
