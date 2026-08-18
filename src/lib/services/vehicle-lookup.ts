/**
 * Vehicle lookup abstraction for UK number plates using Vehicle Data Global.
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
  const fuel = apiFuel.toLowerCase();
  if (fuel.includes("plug-in") || fuel.includes("phev")) return "plug_in_hybrid";
  if (fuel.includes("hybrid")) return "hybrid";
  if (fuel.includes("electric")) return "electric";
  if (fuel.includes("diesel")) return "diesel";
  if (fuel.includes("petrol")) return "petrol";
  return "other";
}

export async function lookupUkVehicle(registration: string): Promise<{ data?: VehicleLookupResult; error?: string }> {
  // Normalize the registration: uppercase and remove all spaces/special chars (alphanumeric only)
  const normalizedReg = registration.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!normalizedReg) {
    return { error: "Please enter a valid vehicle registration." };
  }

  const apiKey = process.env.VEHICLE_DATA_API_KEY;
  if (!apiKey) {
    return { error: "Vehicle lookup is not configured yet. Please configure the DVLA API credentials." };
  }

  try {
    const url = new URL("https://uk.api.vehicledataglobal.com/r2/lookup");
    url.searchParams.append("ApiKey", apiKey);
    url.searchParams.append("PackageName", "VehicleDetails");
    url.searchParams.append("Vrm", normalizedReg);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return { error: "Vehicle not found." };
      if (response.status === 401 || response.status === 403) return { error: "Vehicle lookup service configuration error (Invalid API key)." };
      if (response.status === 429) return { error: "Vehicle lookup limit exceeded. Please try again later." };
      return { error: "Failed to communicate with vehicle lookup service." };
    }

    const data = await response.json();

    // Handle provider status codes cleanly
    const statusCode = data.StatusCode;
    if (statusCode) {
      if (statusCode === "ItemNotFound") return { error: "Vehicle not found. Please check the registration." };
      if (statusCode === "SandboxValidationFailure") return { error: "Sandbox validation failure: Invalid registration." };
      if (statusCode === "KeyInvalid" || statusCode === "PackageInvalid") return { error: "Vehicle lookup configuration error (Invalid API Key or Package)." };
      if (statusCode === "DailyLimitExceeded" || statusCode === "RateLimitExceeded") return { error: "Vehicle lookup limit exceeded. Please try again later." };
      if (statusCode === "AccountInactive") return { error: "Vehicle lookup service account is inactive." };
      if (statusCode === "ProviderFailure" || statusCode === "TemporaryProviderFailure") return { error: "Vehicle lookup service is temporarily unavailable." };
      if (statusCode !== "Success" && !data.Results) return { error: `Vehicle lookup failed: ${data.StatusMessage || statusCode}` };
    }

    if (!data.Results || !data.Results.VehicleDetails) {
      return { error: "Invalid response from vehicle lookup service." };
    }

    const vd = data.Results.VehicleDetails;
    const vi = vd.VehicleIdentification || {};
    const hc = vd.VehicleHistory?.ColourDetails || {};
    const td = vd.DvlaTechnicalDetails || {};
    const md = data.Results.ModelDetails || {};

    const resultMake = vi.DvlaMake || "Unknown";
    const resultModel = vi.DvlaModel || md.ModelIdentification || "Unknown";
    const resultYear = vi.YearOfManufacture ? parseInt(vi.YearOfManufacture, 10) : 0;
    const resultFuel = mapFuelType(vi.DvlaFuelType);
    const resultColour = hc.CurrentColour || "Unknown";
    const resultEngine = td.EngineCapacityCc ? parseInt(td.EngineCapacityCc, 10) : null;
    const resultReg = vi.Vrm || normalizedReg;

    return {
      data: {
        registration: resultReg,
        make: resultMake,
        model: resultModel,
        year: resultYear,
        fuel_type: resultFuel,
        colour: resultColour,
        engine_capacity_cc: resultEngine,
        mot_expiry: null,
      }
    };
  } catch (_error) {
    // Keep API key out of logs
    console.error("Vehicle lookup failed due to network or parsing error.");
    return { error: "An unexpected error occurred during vehicle lookup." };
  }
}
