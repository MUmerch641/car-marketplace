"use client";

import type { CarCardData } from "@/lib/marketplace/cars";
import { CarCard } from "./car-card";
import GlareHover from "@/components/GlareHover";

export function FeaturedCarCard({ car }: { car: CarCardData }) {
  return (
    <div className="relative">
      <GlareHover
        width="100%"
        height="100%"
        background="transparent"
        borderRadius="0px"
        borderColor="transparent"
        glareColor="#ffffff"
        glareOpacity={0.07}
        glareSize={300}
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

