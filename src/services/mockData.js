// Mock data for market trends
export const generateMockMarketTrends = (symbol) => {
    const basePrice = 150 + Math.random() * 50;
    const data = [];

    // Generate 24 hours of data points
    for (let i = 0; i < 24; i++) {
        const time = new Date();
        time.setHours(time.getHours() - (23 - i));

        const volatility = 2;
        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;

        data.push({
            name: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2))
        });
    }

    return data;
};