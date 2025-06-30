import { Stock, StockChartData } from '../types';

// Mock stock data
const mockStocks: Stock[] = [
  {
    id: '1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    currentPrice: 2456.80,
    change: 45.20,
    changePercent: 1.87,
    marketCap: 1650000,
    peRatio: 18.5,
    volume: 1250000,
    high: 2480.00,
    low: 2410.00,
    open: 2415.00,
    previousClose: 2411.60,
  },
  {
    id: '2',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    currentPrice: 3890.50,
    change: -23.40,
    changePercent: -0.60,
    marketCap: 1420000,
    peRatio: 25.2,
    volume: 890000,
    high: 3920.00,
    low: 3870.00,
    open: 3910.00,
    previousClose: 3913.90,
  },
  {
    id: '3',
    symbol: 'HDFC',
    name: 'HDFC Bank Ltd',
    currentPrice: 1650.75,
    change: 32.15,
    changePercent: 1.99,
    marketCap: 920000,
    peRatio: 16.8,
    volume: 2100000,
    high: 1665.00,
    low: 1620.00,
    open: 1625.00,
    previousClose: 1618.60,
  },
  {
    id: '4',
    symbol: 'INFY',
    name: 'Infosys Ltd',
    currentPrice: 1456.90,
    change: -18.70,
    changePercent: -1.27,
    marketCap: 610000,
    peRatio: 22.1,
    volume: 1500000,
    high: 1475.00,
    low: 1440.00,
    open: 1470.00,
    previousClose: 1475.60,
  },
  {
    id: '5',
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    currentPrice: 890.25,
    change: 15.80,
    changePercent: 1.81,
    marketCap: 620000,
    peRatio: 15.3,
    volume: 1800000,
    high: 895.00,
    low: 875.00,
    open: 880.00,
    previousClose: 874.45,
  },
  {
    id: '6',
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd',
    currentPrice: 2450.00,
    change: -45.20,
    changePercent: -1.81,
    marketCap: 580000,
    peRatio: 45.2,
    volume: 450000,
    high: 2500.00,
    low: 2440.00,
    open: 2490.00,
    previousClose: 2495.20,
  },
  {
    id: '7',
    symbol: 'ITC',
    name: 'ITC Ltd',
    currentPrice: 420.50,
    change: 8.90,
    changePercent: 2.16,
    marketCap: 520000,
    peRatio: 18.9,
    volume: 3200000,
    high: 425.00,
    low: 415.00,
    open: 415.50,
    previousClose: 411.60,
  },
  {
    id: '8',
    symbol: 'SBIN',
    name: 'State Bank of India',
    currentPrice: 650.75,
    change: -12.30,
    changePercent: -1.85,
    marketCap: 580000,
    peRatio: 12.5,
    volume: 2800000,
    high: 665.00,
    low: 645.00,
    open: 660.00,
    previousClose: 663.05,
  },
];

export const getTopGainers = (): Stock[] => {
  return mockStocks
    .filter(stock => stock.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 10);
};

export const getTopLosers = (): Stock[] => {
  return mockStocks
    .filter(stock => stock.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 10);
};

export const getAllStocks = (): Stock[] => {
  return mockStocks;
};

export const getStockById = (id: string): Stock | undefined => {
  return mockStocks.find(stock => stock.id === id);
};

export const getStockChartData = (stockId: string): StockChartData[] => {
  // Generate mock chart data for the last 30 days
  const data: StockChartData[] = [];
  const basePrice = mockStocks.find(s => s.id === stockId)?.currentPrice || 1000;
  
  for (let i = 29; i >= 0; i--) {
    const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000);
    const randomChange = (Math.random() - 0.5) * 0.1; // ±5% change
    const price = basePrice * (1 + randomChange);
    
    data.push({
      timestamp,
      price: Math.round(price * 100) / 100,
    });
  }
  
  return data;
};

export const searchStocks = (query: string): Stock[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockStocks.filter(
    stock =>
      stock.name.toLowerCase().includes(lowercaseQuery) ||
      stock.symbol.toLowerCase().includes(lowercaseQuery)
  );
}; 