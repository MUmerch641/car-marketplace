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

  const rapidApiKey = (process.env.RAPIDAPI_KEY || process.env.VEHICLE_DATA_API_KEY || process.env.EXPO_PUBLIC_RAPIDAPI_KEY || process.env.EXPO_PUBLIC_VEHICLE_DATA_API_KEY || "").trim();
  const rapidApiHost = (process.env.RAPIDAPI_HOST || process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "uk-vehicle-data1.p.rapidapi.com").trim();

  if (!rapidApiKey) {
    return { error: "Vehicle lookup is currently unavailable. Please contact Shaz for help." };
  }

  try {
    const response = await fetch(`https://${rapidApiHost}/cartax.api.v1.Public/GetInitialReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": rapidApiHost,
        "x-rapidapi-key": rapidApiKey,
      },
      body: JSON.stringify({ vrm: normalizedReg }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      if (response.status === 404) return { error: "Vehicle not found. Please check the registration." };
      if (response.status === 401 || response.status === 403) return { error: "Vehicle lookup is currently unavailable. Please contact Shaz for help." };
      if (response.status === 429) return { error: "Vehicle lookup is busy. Please try again later." };
      return { error: "Failed to communicate with vehicle lookup service." };
    }

    const data = await response.json();

    // Check if error or message is present
    if (!data || typeof data !== "object" || Array.isArray(data)) return { error: "Vehicle lookup returned an invalid response. Please try again." };
    if (data.error || data.message || data.status === "error" || data.statusCode === 404) {
      return { error: "Vehicle not found. Please check the registration." };
    }

    // The provider returns the same fields inside several wrapper shapes.
    const result = data.data || data.vehicle || data.result || data.Results || data.report || data;
    if (!result || typeof result !== "object" || Array.isArray(result)) return { error: "Vehicle not found. Please check the registration." };
    const v = result.VehicleRegistration || result.VehicleData || result;
    if (!v || typeof v !== "object" || Array.isArray(v)) return { error: "Vehicle not found. Please check the registration." };

    const make = v.make || v.Make || v.DvlaMake || v.vehicleMake || v.manufacturer;
    const model = v.model || v.Model || v.DvlaModel || v.vehicleModel;
    if (!make || !model) return { error: "Vehicle details could not be retrieved for this registration. Please check the plate and try again." };
    const rawYear = v.yearOfManufacture || v.year || v.Year || v.manufactureYear || v.YearOfManufacture || v.firstRegistrationYear || 0;
    const parsedYear = typeof rawYear === "string" ? parseInt(rawYear, 10) : Number(rawYear);
    const year = Number.isInteger(parsedYear) && parsedYear > 0 && parsedYear <= 32767 ? parsedYear : 0;
    const rawFuel = v.fuelType || v.FuelType || v.DvlaFuelType || v.fuel || "";
    const rawColour = v.colour || v.color || v.Colour || v.Color || v.CurrentColour || "Unknown";
    const rawEngine = v.engineCapacity || v.engineCapacityCc || v.EngineCapacityCc || v.cylinderCapacity || null;
    const engineCapacity = rawEngine ? Number(String(rawEngine).replace(/[^0-9.]/g, "")) : null;
    const motExpiry = v.motExpiryDate || v.motExpiry || v.MotExpiryDate || null;

    return {
      data: {
        registration: normalizedReg,
        make: String(make).trim(),
        model: String(model).trim(),
        year,
        fuel_type: mapFuelType(rawFuel),
        colour: String(rawColour),
        engine_capacity_cc: engineCapacity && Number.isSafeInteger(engineCapacity) && engineCapacity > 0 && engineCapacity <= 2147483647 ? engineCapacity : null,
        mot_expiry: motExpiry ? String(motExpiry) : null,
      }
    };
  } catch (error) {
    console.error("Vehicle lookup failed:", error instanceof Error ? error.name : "Unknown error");
    return { error: "Could not retrieve vehicle details. Please try again." };
  }
}
