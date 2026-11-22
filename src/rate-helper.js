export const baseApiUrl = "https://api.frankfurter.dev/v2/";

export function buildCurrenciesUrl() {
    return baseApiUrl + "currencies";
}

export function buildRateUrl(fromCurrency, toCurrency) {
    return `${baseApiUrl}rate/${fromCurrency}/${toCurrency}`;
}

export function buildRatesUrl(startDate, endDate, baseCurrency, quoteCurrency) {
    return baseApiUrl + `rates?from=${startDate}&to=${endDate}&base=${baseCurrency}&quotes=${quoteCurrency}`;
}

export function findCurrency(listMataUang, isoCode) {
    return listMataUang.find(item => item.iso_code.toLowerCase() === isoCode.toLowerCase());
}

export function getCurrencyName(listMataUang, isoCode) {
    const currency = findCurrency(listMataUang, isoCode);
    return currency ? currency.name : "";
}

export function getCurrencyOptionLabel(item) {
    return `${item.iso_code} (${item.name})`;
}
