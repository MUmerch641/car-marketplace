/**
 * Shaz Brand Configuration
 *
 * Centralised brand constants for consistent usage across the application.
 */

/* ── Brand Identity ───────────────────────────────────────────────────────── */

export const brand = {
  name: "Shaz",
  tagline: "Car care on your terms.",
};

/* ── Contact ──────────────────────────────────────────────────────────────── */

export const contact = {
  email: "support@shaz.co.uk",
  phone: "+44 800 123 4567",
  phoneHref: "+448001234567",
  address: "123 Market Square, London, W1D 4AQ, United Kingdom",
  isPlaceholder: true,
};

/* ── Receipt/Invoice Reference Format ─────────────────────────────────────── */

export const receipt = {
  prefix: "SH-RCT",
  year: new Date().getFullYear().toString(),
};
