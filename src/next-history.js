export function createHistoryId(fromCurrency, toCurrency) {
    return `${fromCurrency}-${toCurrency}`;
}

export function createHistoryItem(fromCurrency, toCurrency) {
    return {
        id: createHistoryId(fromCurrency, toCurrency),
        from: `${fromCurrency}`,
        to: `${toCurrency}`
    };
}

// Mengembalikan array riwayat baru tanpa memutasi array asal
export function nextHistory(riwayat, fromCurrency, toCurrency) {
    const id = createHistoryId(fromCurrency, toCurrency);
    const isFound = riwayat.some(item => item.id === id);

    if (isFound) {
        return { riwayat: [...riwayat], isFound };
    }

    return {
        riwayat: [...riwayat, createHistoryItem(fromCurrency, toCurrency)],
        isFound
    };
}
