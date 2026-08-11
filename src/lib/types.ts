export type Car = {
  id: string; make: string; model: string; year: number; price: string; city: string;
  mileage: string; transmission: string; fuel: string; image: string; verified?: boolean;
  featured?: boolean; color: string; engine: string; description: string;
};

export type Service = {
  slug: string; name: string; description: string; price: string; duration: string;
  image: string; icon: "sparkle" | "oil" | "battery" | "scan";
};
