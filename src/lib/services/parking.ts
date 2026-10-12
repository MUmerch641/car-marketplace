export const PARKING_LOCATIONS = [
  { value: "home_driveway", label: "My home driveway" },
  { value: "private_residential_car_park", label: "Private residential car park" },
  { value: "private_workplace_car_park", label: "Private workplace car park" },
  { value: "private_land", label: "Private land" },
  { value: "other", label: "Other" },
] as const;

export type ParkingLocation = (typeof PARKING_LOCATIONS)[number]["value"];

export function isParkingLocation(value: string): value is ParkingLocation {
  return PARKING_LOCATIONS.some((location) => location.value === value);
}

export function parkingLocationLabel(value: string | null | undefined) {
  return PARKING_LOCATIONS.find((location) => location.value === value)?.label ?? "Not provided";
}

// Keep visit details compatible with the existing booking RPC and visible
// to the app and assigned inspector, without depending on a new schema.
const visitNotesMarker = "Visit and parking details";
const customerNotesMarker = "Additional notes";

export function formatVisitNotes(input: {
  visitType: string;
  parkingLocation: ParkingLocation;
  levelSurfaceAccess: boolean;
  parkingAccessNotes: string;
  notes: string;
}) {
  return [
    visitNotesMarker,
    `Visit: ${input.visitType === "work" ? "Work" : "Home"}`,
    `Parking: ${input.parkingLocation}`,
    `Parking location: ${parkingLocationLabel(input.parkingLocation)}`,
    `Level surface with access all around: ${input.levelSurfaceAccess ? "Yes" : "No"}`,
    `Access instructions: ${input.parkingAccessNotes.trim() || "None"}`,
    customerNotesMarker,
    input.notes.trim(),
  ].join("\n");
}

export function readVisitNotes(notes: string | null | undefined) {
  const empty = { visitType: null, parkingLocation: null, levelSurfaceAccess: null, parkingAccessNotes: null, notes: notes ?? "" };
  if (!notes?.startsWith(`${visitNotesMarker}\n`)) return empty;
  const divider = notes.indexOf(`\n${customerNotesMarker}\n`);
  if (divider === -1) return empty;
  const details = notes.slice(visitNotesMarker.length + 1, divider);
  const location = details.match(/^Parking: (.+)$/m)?.[1];
  const level = details.match(/^Level surface with access all around: (Yes|No)$/m)?.[1];
  const accessStart = details.indexOf("\nAccess instructions: ");
  const access = accessStart === -1 ? null : details.slice(accessStart + "\nAccess instructions: ".length);
  return {
    visitType: details.match(/^Visit: (Home|Work)$/m)?.[1] ?? null,
    parkingLocation: location && isParkingLocation(location) ? location : null,
    levelSurfaceAccess: level ? level === "Yes" : null,
    parkingAccessNotes: access === "None" ? null : access,
    notes: notes.slice(divider + customerNotesMarker.length + 2),
  };
}
