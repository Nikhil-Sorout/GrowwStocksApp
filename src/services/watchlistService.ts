import AsyncStorage from '@react-native-async-storage/async-storage';
import { Watchlist, Stock } from '../types';

const WATCHLIST_STORAGE_KEY = '@groww_watchlists';

export const getWatchlists = async (): Promise<Watchlist[]> => {
  try {
    const data = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (data) {
      const watchlists = JSON.parse(data);
      return watchlists.map((wl: any) => ({
        ...wl,
        createdAt: new Date(wl.createdAt),
        updatedAt: new Date(wl.updatedAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting watchlists:', error);
    return [];
  }
};

export const saveWatchlists = async (watchlists: Watchlist[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlists));
  } catch (error) {
    console.error('Error saving watchlists:', error);
  }
};

export const createWatchlist = async (name: string): Promise<Watchlist> => {
  const watchlists = await getWatchlists();
  const newWatchlist: Watchlist = {
    id: Date.now().toString(),
    name,
    stocks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  watchlists.push(newWatchlist);
  await saveWatchlists(watchlists);
  return newWatchlist;
};

export const addStockToWatchlist = async (
  watchlistId: string,
  stock: Stock
): Promise<boolean> => {
  try {
    const watchlists = await getWatchlists();
    const watchlistIndex = watchlists.findIndex(wl => wl.id === watchlistId);
    
    if (watchlistIndex === -1) return false;
    
    // Check if stock already exists in watchlist
    const stockExists = watchlists[watchlistIndex].stocks.some(s => s.id === stock.id);
    if (stockExists) return false;
    
    watchlists[watchlistIndex].stocks.push(stock);
    watchlists[watchlistIndex].updatedAt = new Date();
    
    await saveWatchlists(watchlists);
    return true;
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    return false;
  }
};

export const removeStockFromWatchlist = async (
  watchlistId: string,
  stockId: string
): Promise<boolean> => {
  try {
    const watchlists = await getWatchlists();
    const watchlistIndex = watchlists.findIndex(wl => wl.id === watchlistId);
    
    if (watchlistIndex === -1) return false;
    
    watchlists[watchlistIndex].stocks = watchlists[watchlistIndex].stocks.filter(
      s => s.id !== stockId
    );
    watchlists[watchlistIndex].updatedAt = new Date();
    
    await saveWatchlists(watchlists);
    return true;
  } catch (error) {
    console.error('Error removing stock from watchlist:', error);
    return false;
  }
};

export const deleteWatchlist = async (watchlistId: string): Promise<boolean> => {
  try {
    const watchlists = await getWatchlists();
    const filteredWatchlists = watchlists.filter(wl => wl.id !== watchlistId);
    await saveWatchlists(filteredWatchlists);
    return true;
  } catch (error) {
    console.error('Error deleting watchlist:', error);
    return false;
  }
};

export const isStockInWatchlist = async (
  watchlistId: string,
  stockId: string
): Promise<boolean> => {
  try {
    const watchlists = await getWatchlists();
    const watchlist = watchlists.find(wl => wl.id === watchlistId);
    return watchlist ? watchlist.stocks.some(s => s.id === stockId) : false;
  } catch (error) {
    console.error('Error checking if stock is in watchlist:', error);
    return false;
  }
}; 