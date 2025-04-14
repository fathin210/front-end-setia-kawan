export const safeArray = (data) => Array.isArray(data) ? data : []

export const formatCurrency = (value, locale = "id-ID", currency = "IDR") => {
  const numericValue = Number(value);
  if (isNaN(numericValue)) return "Invalid Number";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(numericValue);
};
