export interface FearAndGreedIndex {
    value: string;
    value_classification: string;
    timestamp: string;
    time_until_update: string;
}

export const fetchFearAndGreedIndex = async (): Promise<FearAndGreedIndex> => {
    const response = await fetch('https://api.alternative.me/fng/');
    if (!response.ok) {
        throw new Error('Failed to fetch Fear & Greed Index');
    }
    const data = await response.json();
    return data.data[0];
};
