export interface Part {
  id: string;
  category_id: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  description: string | null;
  price_pence: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PartImage {
  id: string;
  part_id: string;
  storage_path: string;
  is_primary: boolean;
  created_at: string;
}

// Extends a part with its primary image
export interface PartWithImage extends Part {
  primary_image?: PartImage | null;
}

export type FuelType = "petrol" | "diesel" | "hybrid" | "plug_in_hybrid" | "electric" | "other";

export interface PartVehicleCompatibility {
  id: string;
  part_id: string;
  make: string;
  model: string;
  year_from: number | null;
  year_to: number | null;
  fuel_type: FuelType | null;
  engine_capacity_cc: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
