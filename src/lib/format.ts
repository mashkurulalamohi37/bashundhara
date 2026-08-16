export const bdt = (value: number, compact = false) =>
  compact
    ? `৳${new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`
    : `৳${new Intl.NumberFormat("en-IN").format(value)}`;

export const num = (value: number) => new Intl.NumberFormat("en-IN").format(value);

export const titleize = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");