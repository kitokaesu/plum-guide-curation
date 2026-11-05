export const ROLES = ["GUEST", "HOST", "SPECIALIST", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const PROPERTY_STATUSES = [
  "DRAFT",
  "INSPECTION_PENDING",
  "APPROVED",
  "REJECTED",
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const BOOKING_STATUSES = ["CONFIRMED", "CANCELLED", "COMPLETED"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const SLOT_STATUSES = ["AVAILABLE", "BOOKED", "COMPLETED", "CANCELLED"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

/** A home must score at least this on the 150-point Plum Test to be approved. */
export const PLUM_PASS_SCORE = 85;

export const ROLE_LABELS: Record<Role, string> = {
  GUEST: "Guest",
  HOST: "Host",
  SPECIALIST: "Plum specialist",
  ADMIN: "Administrator",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  DRAFT: "Draft",
  INSPECTION_PENDING: "Inspection scheduled",
  APPROVED: "Plum Approved",
  REJECTED: "Not approved",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isPropertyStatus(value: unknown): value is PropertyStatus {
  return (
    typeof value === "string" &&
    (PROPERTY_STATUSES as readonly string[]).includes(value)
  );
}
