export interface ExchangeRates {
    [key: string]: number;
}

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
    try {
        // Fetch rates for Tether (USDT) which is our USD proxy
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=eur,jpy,gbp,cny'
        );

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();

        // Structure: { tether: { eur: 0.95, jpy: 148.5, ... } }
        const rates = data.tether;

        return {
            USD: 1, // Base
            EUR: rates.eur,
            JPY: rates.jpy,
            GBP: rates.gbp,
            CNY: rates.cny
        };
    } catch (error) {
        console.error('Exchange Rate API Error:', error);
        // Fallback rates if API fails
        return {
            USD: 1,
            EUR: 0.92,
            JPY: 145.0,
            GBP: 0.79,
            CNY: 7.20
        };
    }
};
