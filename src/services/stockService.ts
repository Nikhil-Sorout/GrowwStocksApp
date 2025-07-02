import { Stock, StockChartData, StockInfo, SearchResult } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://www.alphavantage.co/query',
  // API_KEY: 'demo', // Replace with your actual API key
  // API_KEY: '', // Replace with your actual API key
  // API_KEY: 'K3CO58DSGDMBR2AA', // Replace with your actual API key
  API_KEY: '2QFT4QQ4K71R7I4Y',
  RATE_LIMIT: 25,
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH_DEBOUNCE_DELAY: 500,
};

// Cache and rate limiting
interface CacheEntry {
  data: any;
  timestamp: number;
}

interface RateLimitInfo {
  requestsMade: number;
  lastResetDate: string;
}

// Storage keys
const CACHE_STORAGE_KEY = '@groww_api_cache';
const RATE_LIMIT_STORAGE_KEY = '@groww_rate_limit';

let apiCache: Record<string, CacheEntry> = {};
let rateLimitInfo: RateLimitInfo = {
  requestsMade: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
};

let searchDebounceTimer: NodeJS.Timeout | null = null;

// Initialize cache from AsyncStorage
const initializeCache = async (): Promise<void> => {
  try {
    const [cachedData, rateLimitData] = await Promise.all([
      AsyncStorage.getItem(CACHE_STORAGE_KEY),
      AsyncStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    ]);

    if (cachedData) {
      apiCache = JSON.parse(cachedData);
      console.log(`📦 Loaded ${Object.keys(apiCache).length} cache entries from storage`);
    }

    if (rateLimitData) {
      rateLimitInfo = JSON.parse(rateLimitData);
      console.log(`📊 Loaded rate limit info: ${rateLimitInfo.requestsMade} requests made on ${rateLimitInfo.lastResetDate}`);
    }
  } catch (error) {
    console.error('Error loading cache from storage:', error);
    // Reset to defaults if loading fails
    apiCache = {};
    rateLimitInfo = {
      requestsMade: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
    };
  }
};

// Save cache to AsyncStorage
const saveCacheToStorage = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(apiCache)),
      AsyncStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(rateLimitInfo))
    ]);
  } catch (error) {
    console.error('Error saving cache to storage:', error);
  }
};

// Initialize cache on module load
initializeCache();

// Helper functions
const isCacheValid = (entry: CacheEntry): boolean => {
  return (Date.now() - entry.timestamp) < API_CONFIG.CACHE_DURATION;
};

const checkRateLimit = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  if (rateLimitInfo.lastResetDate !== today) {
    rateLimitInfo.requestsMade = 0;
    rateLimitInfo.lastResetDate = today;
    saveCacheToStorage(); // Save updated rate limit info
  }
  return rateLimitInfo.requestsMade < API_CONFIG.RATE_LIMIT;
};

const makeApiCall = async (endpoint: string): Promise<any> => {
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }
  
  if (data['Note']) {
    throw new Error(data['Note']);
  }
  
  return data;
};

const getCachedOrFetch = async (cacheKey: string, apiEndpoint: string): Promise<any> => {
  const cached = apiCache[cacheKey];
  
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }
  
  if (!checkRateLimit()) {
    return cached?.data || Promise.reject(new Error('Rate limit exceeded'));
  }
  
  try {
    const response = await makeApiCall(apiEndpoint);
    
    apiCache[cacheKey] = { data: response, timestamp: Date.now() };
    rateLimitInfo.requestsMade++;
    
    // Save updated cache and rate limit info to storage
    await saveCacheToStorage();
    
    return response;
  } catch (error) {
    console.error(`API request failed for ${cacheKey}:`, error);
    
    if (cached) {
      return cached.data;
    } else {
      return Promise.reject(error);
    }
  }
};

// Simplified stock conversion - only essential fields
const convertApiDataToStock = (apiData: any): Stock => {
  const currentPrice = parseFloat(apiData.price) || 0;
  const changeAmount = parseFloat(apiData.change_amount) || 0;
  const changePercent = parseFloat(apiData.change_percentage) || 0;
  const volume = parseInt(apiData.volume) || 0;
  
  return {
    id: apiData.ticker,
    symbol: apiData.ticker,
    name: apiData.ticker,
    currentPrice,
    change: changeAmount,
    changePercent,
    marketCap: 0,
    peRatio: 0,
    volume,
    high: currentPrice * 1.01,
    low: currentPrice * 0.99,
    open: currentPrice - changeAmount,
    previousClose: currentPrice - changeAmount,
  };
};

// Search functionality
export const debouncedSearchStocks = (query: string, callback: (results: SearchResult[]) => void): void => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  
  searchDebounceTimer = setTimeout(async () => {
    try {
      const results = await searchStocks(query);
      callback(results);
    } catch (error) {
      console.error('Search failed:', error);
      callback([]);
    }
  }, API_CONFIG.SEARCH_DEBOUNCE_DELAY);
};

export const searchStocks = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  
  const cacheKey = `search_${query.toLowerCase().trim()}`;
  const apiEndpoint = `${API_CONFIG.BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_CONFIG.API_KEY}`;
  
  try {
    const response = await getCachedOrFetch(cacheKey, apiEndpoint);
    
    return response.bestMatches?.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      marketOpen: match['5. marketOpen'],
      marketClose: match['6. marketClose'],
      timezone: match['7. timezone'],
      currency: match['8. currency'],
      matchScore: match['9. matchScore'],
    })) || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

// Stock data fetching
export const fetchStockData = async (): Promise<any> => {
  const cacheKey = 'stock_data';
  const apiEndpoint = `${API_CONFIG.BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_CONFIG.API_KEY}`;
  return await getCachedOrFetch(cacheKey, apiEndpoint);
};

export const fetchCompanyInfo = async (symbol: string): Promise<StockInfo> => {
  const cacheKey = `stock_info_${symbol.toUpperCase()}`;
  const apiEndpoint = `${API_CONFIG.BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_CONFIG.API_KEY}`;
  return await getCachedOrFetch(cacheKey, apiEndpoint);
};

// Stock list functions
export const getTopGainers = async (): Promise<Stock[]> => {
  try {
    const data = await fetchStockData();
    return data.top_gainers?.map((item: any) => convertApiDataToStock(item)) || [];
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    return [];
  }
};

export const getTopLosers = async (): Promise<Stock[]> => {
  try {
    const data = await fetchStockData();
    return data.top_losers?.map((item: any) => convertApiDataToStock(item)) || [];
  } catch (error) {
    console.error('Error fetching top losers:', error);
    return [];
  }
};

export const getMostActivelyTraded = async (): Promise<Stock[]> => {
  try {
    const data = await fetchStockData();
    return data.most_actively_traded?.map((item: any) => convertApiDataToStock(item)) || [];
  } catch (error) {
    console.error('Error fetching most actively traded:', error);
    return [];
  }
};

export const getAllStocks = async (): Promise<Stock[]> => {
  try {
    const data = await fetchStockData();
    const allStocks = [
      ...(data.top_gainers || []),
      ...(data.top_losers || []),
      ...(data.most_actively_traded || [])
    ];
    
    // Use a Map to ensure unique stocks by ticker
    const uniqueStocks = new Map<string, any>();
    
    allStocks.forEach((item: any) => {
      if (!uniqueStocks.has(item.ticker)) {
        uniqueStocks.set(item.ticker, item);
      }
    });
    
    return Array.from(uniqueStocks.values()).map((item: any) => convertApiDataToStock(item));
  } catch (error) {
    console.error('Error fetching all stocks:', error);
    return [];
  }
};

// Helper to fetch a single stock by symbol from the API
export const fetchSingleStock = async (symbol: string): Promise<Stock | undefined> => {
  try {
    // Use the same API as searchStocks but for a single symbol
    const apiEndpoint = `${API_CONFIG.BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(symbol)}&apikey=${API_CONFIG.API_KEY}`;
    const response = await getCachedOrFetch(`search_${symbol.toLowerCase()}`, apiEndpoint);
    if (response.bestMatches && response.bestMatches.length > 0) {
      const match = response.bestMatches.find((m: any) => m['1. symbol'].toUpperCase() === symbol.toUpperCase());
      if (match) {
        // Map to Stock object (minimal fields)
        return {
          id: match['1. symbol'],
          symbol: match['1. symbol'],
          name: match['2. name'],
          currentPrice: 0,
          change: 0,
          changePercent: 0,
          marketCap: 0,
          peRatio: 0,
          volume: 0,
          high: 0,
          low: 0,
          open: 0,
          previousClose: 0,
        };
      }
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching single stock:', error);
    return undefined;
  }
};

export const getStockById = async (id: string): Promise<Stock | undefined> => {
  try {
    const allStocks = await getAllStocks();
    let stock = allStocks.find(stock => stock.id === id);
    if (!stock) {
      // Try to fetch from API if not found locally
      stock = await fetchSingleStock(id);
    }
    return stock;
  } catch (error) {
    console.error('Error fetching stock by ID:', error);
    return undefined;
  }
};

// New function to get stock by symbol
export const getStockBySymbol = async (symbol: string): Promise<Stock | undefined> => {
  try {
    const allStocks = await getAllStocks();
    return allStocks.find(stock => stock.symbol.toUpperCase() === symbol.toUpperCase());
  } catch (error) {
    console.error('Error fetching stock by symbol:', error);
    return undefined;
  }
};

// Chart data generation
export const getStockChartData = async (stockId: string): Promise<StockChartData[]> => {
  try {
    const stock = await getStockById(stockId);
    if (!stock) {
      console.error('Stock not found:', stockId);
      return [];
    }
    console.log("Stock Symbol", stock.symbol);
    // Fetch real time series data from Alpha Vantage
    const timeSeriesData = await fetchTimeSeriesData(stock.symbol);
    // console.log("Time Series Data", timeSeriesData);
    return timeSeriesData;
  } catch (error) {
    console.error('Error generating chart data:', error);
    // Fallback to generated data if API fails
    const stock = await getStockById(stockId);
    const basePrice = stock?.currentPrice || 1000;
    
    return Array.from({ length: 30 }, (_, i) => {
      const timestamp = Date.now() - ((29 - i) * 24 * 60 * 60 * 1000);
      const randomChange = (Math.random() - 0.5) * 0.05; // Reduced volatility for more realistic data
      const price = basePrice * (1 + randomChange);
      
      return {
        timestamp,
        price: Math.round(price * 100) / 100,
      };
    });
  }
};

// New function to fetch time series data from Alpha Vantage
export const fetchTimeSeriesData = async (symbol: string): Promise<StockChartData[]> => {
  const cacheKey = `time_series_${symbol.toUpperCase()}`;
  const apiEndpoint = `${API_CONFIG.BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_CONFIG.API_KEY}`;
  
  try {
    const response = await getCachedOrFetch(cacheKey, apiEndpoint);
    
    if (!response['Time Series (Daily)']) {
      throw new Error('No time series data available');
    }

    const timeSeriesData = response['Time Series (Daily)'];
    const dates = Object.keys(timeSeriesData).sort().reverse(); // Sort by date, newest first
    
    if (dates.length === 0) {
      throw new Error('No dates available in time series data');
    }
    
    // Take the most recent 30 days of data
    const last30Days = dates.slice(0, Math.min(30, dates.length));
    
    return last30Days.map((date) => {
      const dayData = timeSeriesData[date];
      const closePrice = parseFloat(dayData['4. close']);
      const timestamp = new Date(date).getTime();
      
      if (isNaN(closePrice)) {
        console.warn(`Invalid close price for date ${date}: ${dayData['4. close']}`);
        return null;
      }
      
      return {
        timestamp,
        price: closePrice,
      };
    }).filter((item): item is StockChartData => item !== null).reverse(); // Reverse to show oldest to newest for chart
  } catch (error) {
    console.error('Error fetching time series data:', error);
    throw error;
  }
};

// Cache management
export const clearCache = async (): Promise<void> => {
  apiCache = {};
  rateLimitInfo = {
    requestsMade: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
  };
  
  try {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_STORAGE_KEY),
      AsyncStorage.removeItem(RATE_LIMIT_STORAGE_KEY)
    ]);
    console.log('Cache cleared from memory and storage');
  } catch (error) {
    console.error('Error clearing cache from storage:', error);
    console.log('Cache cleared from memory only');
  }
};

export const getCacheInfo = (): { cacheSize: number; rateLimitInfo: RateLimitInfo; cacheEntries: Record<string, { age: string; isValid: boolean }> } => {
  const cacheEntries: Record<string, { age: string; isValid: boolean }> = {};
  
  Object.keys(apiCache).forEach(key => {
    const entry = apiCache[key];
    const ageInMinutes = Math.round((Date.now() - entry.timestamp) / 1000 / 60);
    cacheEntries[key] = {
      age: `${ageInMinutes} minutes`,
      isValid: isCacheValid(entry)
    };
  });
  
  return {
    cacheSize: Object.keys(apiCache).length,
    rateLimitInfo,
    cacheEntries,
  };
};

// Debug function to log detailed cache status
export const logCacheStatus = (): void => {
  const cacheInfo = getCacheInfo();
  console.log('Cache Status:', cacheInfo);
}; 