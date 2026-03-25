/**
 * A formatter to format to double decimal
 */
// Formats numbers as currency
export const currencyNumberFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format;

/**
 * Instanciate a currency formatter
 */
// Creates a currency formatter for a specific language
export const currencyFormatterFactory = (
  langCode: string,
  currency?: string
) => {
  try {
    return new Intl.NumberFormat(langCode, {
      style: "currency",
      currency: currency,
    });
  } catch (e) {
    const f = new Intl.NumberFormat(langCode, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return {
      format: (num: number) => `${currency} ${currencyNumberFormatter(num)}`,
      formatToParts: (num: number) => [
        { type: "currency", value: currency },
        { type: "literal", value: " " },
        ...f.formatToParts(num),
      ],
    };
  }
};

// Creates a decimal formatter for a specific language
export const decimalFormatterFactory = (langCode: string) => {
  try {
    return new Intl.NumberFormat(langCode, {
      style: "decimal",
    });
  } catch (e) {
    const f = new Intl.NumberFormat(langCode, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return {
      format: (num: number) => `${currencyNumberFormatter(num)}`,
      formatToParts: (num: number) => [...f.formatToParts(num)],
    };
  }
};