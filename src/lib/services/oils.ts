import { createClient } from "@/lib/supabase/server";
import type { VehicleLookupResult } from "@/lib/services/vehicle-lookup";

export type OilRecommendation = {
  id: string;
  brand: string;
  name: string;
  viscosityGrade: string;
  specifications: string[];
  volumeLitres: number;
  price: number;
  description: string | null;
  imageUrl: string | null;
  primary: boolean;
};

type FitmentRow = {
  year_from: number | null;
  year_to: number | null;
  fuel_type: VehicleLookupResult["fuel_type"] | null;
  engine_capacity_min_cc: number | null;
  engine_capacity_max_cc: number | null;
  is_primary: boolean;
  oil_products: {
    id: string;
    brand: string;
    name: string;
    viscosity_grade: string;
    specifications: string[];
    volume_litres: number;
    price: number;
    description: string | null;
    image_url: string | null;
  } | null;
};

export async function getOilRecommendations(vehicle: VehicleLookupResult): Promise<OilRecommendation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oil_fitments")
    .select("year_from,year_to,fuel_type,engine_capacity_min_cc,engine_capacity_max_cc,is_primary,oil_products!inner(id,brand,name,viscosity_grade,specifications,volume_litres,price,description,image_url)")
    .ilike("make", vehicle.make)
    .ilike("model", vehicle.model);

  if (error) {
    console.error("Oil fitment lookup error:", error);
    return [];
  }

  return ((data ?? []) as unknown as FitmentRow[])
    .filter((row) => {
      const yearMatches = !vehicle.year || ((!row.year_from || vehicle.year >= row.year_from) && (!row.year_to || vehicle.year <= row.year_to));
      const fuelMatches = !row.fuel_type || row.fuel_type === vehicle.fuel_type;
      const engineMatches = !vehicle.engine_capacity_cc || ((!row.engine_capacity_min_cc || vehicle.engine_capacity_cc >= row.engine_capacity_min_cc) && (!row.engine_capacity_max_cc || vehicle.engine_capacity_cc <= row.engine_capacity_max_cc));
      return yearMatches && fuelMatches && engineMatches && row.oil_products;
    })
    .map((row) => ({
      id: row.oil_products!.id,
      brand: row.oil_products!.brand,
      name: row.oil_products!.name,
      viscosityGrade: row.oil_products!.viscosity_grade,
      specifications: row.oil_products!.specifications,
      volumeLitres: Number(row.oil_products!.volume_litres),
      price: Number(row.oil_products!.price),
      description: row.oil_products!.description,
      imageUrl: row.oil_products!.image_url,
      primary: row.is_primary,
    }))
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.price - b.price);
}
