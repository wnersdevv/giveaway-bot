const UNIT_PATTERN = /(\d+)\s*(hafta|hf|w|g[uü]n|g|saat|sa|h|dakika|dk|m|saniye|sn|s)\b/gi;

const UNIT_MS = {
  hafta: 604800000,
  hf: 604800000,
  w: 604800000,
  gun: 86400000,
  gün: 86400000,
  g: 86400000,
  saat: 3600000,
  sa: 3600000,
  h: 3600000,
  dakika: 60000,
  dk: 60000,
  m: 60000,
  saniye: 1000,
  sn: 1000,
  s: 1000,
};

function parseDuration(input) {
  if (!input || typeof input !== "string") return null;

  const normalized = input.trim().toLowerCase();
  let totalMs = 0;
  let matched = false;

  for (const match of normalized.matchAll(UNIT_PATTERN)) {
    const amount = parseInt(match[1], 10);
    const unit = match[2];
    const unitMs = UNIT_MS[unit];
    if (!unitMs || Number.isNaN(amount)) continue;
    totalMs += amount * unitMs;
    matched = true;
  }

  if (!matched || totalMs <= 0) return null;
  return totalMs;
}

function formatDuration(ms) {
  if (ms <= 0) return "0 saniye";

  const units = [
    { label: "hafta", ms: 604800000 },
    { label: "gün", ms: 86400000 },
    { label: "saat", ms: 3600000 },
    { label: "dakika", ms: 60000 },
    { label: "saniye", ms: 1000 },
  ];

  const parts = [];
  let remaining = ms;

  for (const unit of units) {
    const amount = Math.floor(remaining / unit.ms);
    if (amount > 0) {
      parts.push(`${amount} ${unit.label}`);
      remaining -= amount * unit.ms;
    }
  }

  return parts.slice(0, 2).join(" ") || "0 saniye";
}

module.exports = { parseDuration, formatDuration };
