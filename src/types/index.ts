export interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface Watchlist {
  id: string;
  name: string;
  stocks: Stock[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StockChartData {
  timestamp: number;
  price: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export type TabParamList = {
  Explore: undefined;
  Watchlist: undefined;
  Product: { stock: Stock };
  ViewAll: { type: 'gainers' | 'losers' };
}; 