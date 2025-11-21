import { CurrencyConfig } from "../constants/currency";

export function formatMoney(
  amount: number,
  options?: {
    symbol?: string;
    locale?: string;
    position?: "before" | "after";
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {

  // merge defaults + overrides
  const {
    symbol = CurrencyConfig.symbol,
    locale = CurrencyConfig.locale,
    position = CurrencyConfig.position,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options || {};

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return position === "before"
    ? `${symbol}${formatted}`
    : `${formatted} ${symbol}`;
}
