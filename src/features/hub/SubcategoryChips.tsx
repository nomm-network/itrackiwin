import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from '@/components/ui/button';

export type Chip = { slug: string; label: string };

export default function SubcategoryChips({ hubSlug, chips }:{
  hubSlug: string; chips: Chip[];
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const active = (searchParams.get("sub") ?? chips[0]?.slug ?? "").toLowerCase();

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {chips.map((c) => {
        const slug = c.slug.toLowerCase();
        const isActive = slug === active;
        return (
          <Button
            key={slug}
            variant={isActive ? "default" : "outline"}
            onClick={() => navigate(`/dashboard?cat=${hubSlug}&sub=${slug}`)}
            className="h-16 flex flex-col items-center gap-1 p-2"
          >
            <span className="text-lg">📋</span>
            <span className="text-xs leading-tight text-center">
              {c.label}
            </span>
          </Button>
        );
      })}
      {/* Configure button as 6th item */}
      <Button
        variant={active === "configure" ? "default" : "outline"}
        onClick={() => navigate(`/dashboard?cat=${hubSlug}&sub=configure`)}
        className="h-16 flex flex-col items-center gap-1 p-2"
      >
        <span className="text-lg">⚙️</span>
        <span className="text-xs leading-tight text-center">
          Configure
        </span>
      </Button>
    </div>
  );
}