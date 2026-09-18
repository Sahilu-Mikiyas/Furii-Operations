// Multi-Currency HUD Engine (USD, Polish Złoty PLN, Ethiopian Birr ETB)

export type CurrencyCode = "USD" | "PLN" | "ETB";

export interface ExchangeRates {
  usdToPln: number;
  usdToEtb: number;
}

export const DEFAULT_RATES: ExchangeRates = {
  usdToPln: 3.95,
  usdToEtb: 145.0, // Updated market reference
};

const RATES_STORAGE_KEY = "mission_exchange_rates";
const CURRENCY_PREF_KEY = "mission_display_currency";

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  PLN: "zł",
  ETB: "ETB",
};

export function getExchangeRates(): ExchangeRates {
  if (typeof window === "undefined") return DEFAULT_RATES;
  try {
    const raw = localStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) return DEFAULT_RATES;
    const parsed = JSON.parse(raw);
    return {
      usdToPln: Number(parsed.usdToPln) || DEFAULT_RATES.usdToPln,
      usdToEtb: Number(parsed.usdToEtb) || DEFAULT_RATES.usdToEtb,
    };
  } catch {
    return DEFAULT_RATES;
  }
}

export const loadExchangeRates = getExchangeRates;

export function saveExchangeRates(rates: ExchangeRates): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates));
  } catch {}
}

export function getDisplayCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD";
  try {
    const raw = localStorage.getItem(CURRENCY_PREF_KEY);
    if (raw === "USD" || raw === "PLN" || raw === "ETB") return raw;
    return "USD";
  } catch {
    return "USD";
  }
}

export const loadDisplayCurrency = getDisplayCurrency;

export function setDisplayCurrency(currency: CurrencyCode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENCY_PREF_KEY, currency);
  } catch {}
}

export const saveDisplayCurrency = setDisplayCurrency;

export function convertAmount(amountInUSD: number, targetCurrency: CurrencyCode, rates: ExchangeRates = getExchangeRates()): number {
  if (targetCurrency === "USD") return amountInUSD;
  if (targetCurrency === "PLN") return amountInUSD * rates.usdToPln;
  if (targetCurrency === "ETB") return amountInUSD * rates.usdToEtb;
  return amountInUSD;
}

export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates = getExchangeRates(),
): number {
  if (from === to) return amount;
  const inUsd =
    from === "USD" ? amount : from === "PLN" ? amount / rates.usdToPln : amount / rates.usdToEtb;
  if (to === "USD") return inUsd;
  if (to === "PLN") return inUsd * rates.usdToPln;
  return inUsd * rates.usdToEtb;
}

export function formatCurrency(amountInUSD: number, targetCurrency: CurrencyCode = "USD", rates?: ExchangeRates): string {
  const effectiveRates = rates || getExchangeRates();
  const converted = convertAmount(amountInUSD, targetCurrency, effectiveRates);

  if (targetCurrency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(converted);
  }

  if (targetCurrency === "PLN") {
    return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(converted)} zł`;
  }

  if (targetCurrency === "ETB") {
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(converted)} ETB`;
  }

  return `$${Math.round(amountInUSD).toLocaleString()}`;
}

/** Formats a USD amount and displays its ETB equivalent in brackets, e.g. "$10,000 (1,450,000 ETB)" */
export function formatUSDWithETB(amountInUSD: number, rates?: ExchangeRates): string {
  const effectiveRates = rates || getExchangeRates();
  const etbValue = amountInUSD * effectiveRates.usdToEtb;
  const usdFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amountInUSD);
  const etbFormatted = `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(etbValue)} ETB`;
  return `${usdFormatted} (${etbFormatted})`;
}

/** Formats an ETB amount and displays its USD equivalent in brackets, e.g. "300,000 ETB ($2,069)" */
export function formatETBWithUSD(amountInETB: number, rates?: ExchangeRates): string {
  const effectiveRates = rates || getExchangeRates();
  const usdValue = effectiveRates.usdToEtb > 0 ? amountInETB / effectiveRates.usdToEtb : 0;
  const etbFormatted = `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amountInETB)} ETB`;
  const usdFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usdValue);
  return `${etbFormatted} (${usdFormatted})`;
}

/** Formats an amount with dual conversion depending on selected primary currency */
export function formatCurrencyWithDual(amountInUSD: number, primaryCurrency: CurrencyCode = "USD", rates?: ExchangeRates): string {
  const effectiveRates = rates || getExchangeRates();
  if (primaryCurrency === "USD") {
    return formatUSDWithETB(amountInUSD, effectiveRates);
  }
  if (primaryCurrency === "ETB") {
    const etbAmount = amountInUSD * effectiveRates.usdToEtb;
    return formatETBWithUSD(etbAmount, effectiveRates);
  }
  if (primaryCurrency === "PLN") {
    const plnAmount = amountInUSD * effectiveRates.usdToPln;
    const plnFormatted = `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(plnAmount)} zł`;
    const usdFormatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amountInUSD);
    const etbFormatted = `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amountInUSD * effectiveRates.usdToEtb)} ETB`;
    return `${plnFormatted} (${usdFormatted} · ${etbFormatted})`;
  }
  return formatUSDWithETB(amountInUSD, effectiveRates);
}
