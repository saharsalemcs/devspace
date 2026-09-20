export { cn } from "cn";

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function isSafeRedirect(
  path: string | null | undefined,
): path is string {
  return (
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
  );
}
