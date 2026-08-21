/**
 * Vehicle lookup abstraction for UK number plates using RapidAPI (uk-vehicle-data1).
 */

export type VehicleLookupResult = {
  registration: string;
  make: string;
  model: string;
  year: number;
  fuel_type: "petrol" | "diesel" | "hybrid" | "plug_in_hybrid" | "electric" | "other";
  colour: string;
  engine_capacity_cc?: number | null;
  mot_expiry?: string | null;
};

function mapFuelType(apiFuel: string | undefined | null): VehicleLookupResult["fuel_type"] {
  if (!apiFuel) return "other";
  const fuel = String(apiFuel).toLowerCase();
  if (fuel.includes("plug-in") || fuel.includes("phev")) return "plug_in_hybrid";
  if (fuel.includes("hybrid")) return "hybrid";
  if (fuel.includes("electric") || fuel.includes("ev")) return "electric";
  if (fuel.includes("diesel")) return "diesel";
  if (fuel.includes("petrol") || fuel.includes("gasoline")) return "petrol";
  return "other";
}

export async function lookupUkVehicle(registration: string): Promise<{ data?: VehicleLookupResult; error?: string }> {
  // Normalize the registration: uppercase and remove all spaces/special chars (alphanumeric only)
  const normalizedReg = registration.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!normalizedReg) {
    return { error: "Please enter a valid vehicle registration." };
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.VEHICLE_DATA_API_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST || "uk-vehicle-data1.p.rapidapi.com";

  if (!rapidApiKey) {
    return { error: "Vehicle lookup is not configured yet. Please configure the RapidAPI key in .env." };
  }

  try {
    const response = await fetch("https://uk-vehicle-data1.p.rapidapi.com/cartax.api.v1.Public/GetInitialReport", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": rapidApiHost,
        "x-rapidapi-key": rapidApiKey,
      },
      body: JSON.stringify({ vrm: normalizedReg }),
    });

    if (!response.ok) {
      if (response.status === 404) return { error: "Vehicle not found. Please check the registration." };
      if (response.status === 401 || response.status === 403) return { error: "RapidAPI key is invalid or subscription is inactive. Please subscribe on RapidAPI." };
      if (response.status === 429) return { error: "API rate limit reached. Please try again later." };
      return { error: "Failed to communicate with vehicle lookup service." };
    }

    const data = await response.json();

    // Check if error or message is present
    if (data.error || data.message || data.status === "error" || data.statusCode === 404) {
      return { error: data.error || data.message || "Vehicle not found. Please check the registration." };
    }

    // Flexible extractor from various potential response structures
    const v = data.data || data.vehicle || data.result || data.Results || data.report || data;

    const make = v.make || v.Make || v.DvlaMake || v.vehicleMake || v.manufacturer || "Unknown";
    const model = v.model || v.Model || v.DvlaModel || v.vehicleModel || "Unknown";
    const rawYear = v.yearOfManufacture || v.year || v.Year || v.manufactureYear || v.YearOfManufacture || v.firstRegistrationYear || 0;
    const year = typeof rawYear === "string" ? parseInt(rawYear, 10) : Number(rawYear) || 0;
    const rawFuel = v.fuelType || v.FuelType || v.DvlaFuelType || v.fuel || "";
    const rawColour = v.colour || v.color || v.Colour || v.Color || v.CurrentColour || "Unknown";
    const rawEngine = v.engineCapacity || v.engineCapacityCc || v.EngineCapacityCc || v.cylinderCapacity || null;
    const engineCapacity = rawEngine ? Number(rawEngine) : null;
    const motExpiry = v.motExpiryDate || v.motExpiry || v.MotExpiryDate || null;

    if (make === "Unknown" && model === "Unknown" && year === 0) {
      return { error: "Vehicle details could not be retrieved for this registration." };
    }

    return {
      data: {
        registration: normalizedReg,
        make: String(make),
        model: String(model),
        year,
        fuel_type: mapFuelType(rawFuel),
        colour: String(rawColour),
        engine_capacity_cc: engineCapacity,
        mot_expiry: motExpiry ? String(motExpiry) : null,
      }
    };
  } catch (error) {
    console.error("Vehicle lookup error:", error);
    return { error: "An unexpected error occurred during vehicle lookup." };
  }
}
