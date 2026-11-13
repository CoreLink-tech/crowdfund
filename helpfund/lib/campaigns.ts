/** Shared campaign types and display helpers (no demo data). */

export type Campaign = {
  slug: string;
  title: string;
  organizer: string;
  location: string;
  category: string;
  raised: number;
  goal: number;
  donors: number;
  daysLeft: number;
  image: string;
  featured?: boolean;
  verified?: boolean;
  story: string[];
};

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function progressPercent(raised: number, goal: number) {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}
