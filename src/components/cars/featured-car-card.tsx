"use client";

import type { CarCardData } from "@/lib/marketplace/cars";
import { CarCard } from "./car-card";
import GlareHover from "@/components/GlareHover";

export function FeaturedCarCard({ car }: { car: CarCardData }) {
  return (
    <div className="relative">
      {/* GlareHover overlay — subtle, no neon. Pointer events disabled so card
          links remain fully clickable. Glare passes through via z-index layering. */}
      <GlareHover
        width="100%"
        height="100%"
        background="transparent"
        borderRadius="0px"
        borderColor="transparent"
        glareColor="#ffffff"
        glareOpacity={0.06}
        glareAngle={-40}
        glareSize={260}
        transitionDuration={700}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          borderStyle: "none",
        }}
      >
        <span />
      </GlareHover>
      <CarCard car={car} />
    </div>
  );
}
