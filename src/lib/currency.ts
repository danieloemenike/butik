import currency from "currency.js"

type MoneyInput = number | string

const FALLBACK_CURRENCIES = [
	"NGN",
	"USD",
	"EUR",
	"GBP",
	"CAD",
	"AUD",
	"GHS",
	"KES",
	"ZAR",
	"XOF",
	"XAF",
] as const

let cachedCodes: string[] | null = null

export function listCurrencyCodes(): string[] {
	if (cachedCodes) return cachedCodes
	try {
		if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
			cachedCodes = (
				Intl as typeof Intl & { supportedValuesOf(k: string): string[] }
			)
				.supportedValuesOf("currency")
				.slice()
				.sort((a, b) => a.localeCompare(b))
			return cachedCodes
		}
	} catch {
		/* ignore */
	}
	cachedCodes = [...FALLBACK_CURRENCIES]
	return cachedCodes
}

export function isValidCurrencyCode(code: string): boolean {
	const normalized = code.trim().toUpperCase()
	if (!/^[A-Z]{3}$/.test(normalized)) return false
	return listCurrencyCodes().includes(normalized)
}

export function normalizeCurrencyCode(code: string | null | undefined): string {
	const normalized = (code ?? "NGN").trim().toUpperCase()
	return isValidCurrencyCode(normalized) ? normalized : "NGN"
}

export function currencyLabel(code: string): string {
	const normalized = normalizeCurrencyCode(code)
	try {
		const names = new Intl.DisplayNames(["en"], { type: "currency" })
		const name = names.of(normalized)
		return name ? `${normalized} — ${name}` : normalized
	} catch {
		return normalized
	}
}

export function currencyOptions(): Array<{ value: string; label: string }> {
	return listCurrencyCodes().map((code) => ({
		value: code,
		label: currencyLabel(code),
	}))
}

function moneyPrecision(currencyCode: string): number {
	try {
		const fmt = new Intl.NumberFormat("en", {
			style: "currency",
			currency: normalizeCurrencyCode(currencyCode),
		})
		const opts = fmt.resolvedOptions()
		return typeof opts.maximumFractionDigits === "number"
			? opts.maximumFractionDigits
			: 2
	} catch {
		return 2
	}
}

/** Parse a money amount safely via currency.js. */
export function parseMoney(amount: MoneyInput, currencyCode = "NGN") {
	return currency(amount, {
		symbol: "",
		precision: moneyPrecision(currencyCode),
	})
}

export function formatMoney(
	amount: MoneyInput,
	currencyCode: string = "NGN",
	locale = "en"
): string {
	const code = normalizeCurrencyCode(currencyCode)
	const value = parseMoney(amount, code).value
	try {
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency: code,
			minimumFractionDigits: moneyPrecision(code),
		}).format(value)
	} catch {
		return `${code} ${value.toFixed(2)}`
	}
}
