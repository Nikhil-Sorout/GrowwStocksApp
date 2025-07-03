import { format, parseISO } from 'date-fns';

// Currency symbol mapping
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    GBX: 'p', // Pence
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    INR: '₹',
    CNY: '¥',
    HKD: 'HK$',
    SGD: 'S$',
    KRW: '₩',
    BRL: 'R$',
    MXN: '$',
    ZAR: 'R',
    RUB: '₽',
  };
  return symbols[currency] || currency;
};

// Get user's local timezone offset
// export const getUserLocalTimezoneOffset = (): number => {
//   return new Date().getTimezoneOffset() / -60; // Convert to hours from UTC
// };

// Market hours mapping (in local timezone)
// export const getMarketHours = (region: string): { open: string; close: string; timezone: string } => {
//   const marketHoursMap: Record<string, { open: string; close: string; timezone: string }> = {
//     'United States': { open: '09:30', close: '16:00', timezone: 'Eastern' },
//     'United Kingdom': { open: '08:00', close: '16:30', timezone: 'London' },
//     'Frankfurt': { open: '08:00', close: '20:00', timezone: 'Berlin' },
//     'Tokyo': { open: '09:00', close: '15:30', timezone: 'Tokyo' },
//     'Hong Kong': { open: '09:30', close: '16:00', timezone: 'Hong Kong' },
//     'Sydney': { open: '10:00', close: '16:00', timezone: 'Sydney' },
//     'Canada': { open: '09:30', close: '16:00', timezone: 'Eastern' },
//     'India': { open: '09:15', close: '15:30', timezone: 'Mumbai' },
//     'Singapore': { open: '09:00', close: '17:00', timezone: 'Singapore' },
//     'South Korea': { open: '09:00', close: '15:30', timezone: 'Seoul' },
//     'Brazil': { open: '10:00', close: '17:00', timezone: 'São Paulo' },
//     'Mexico': { open: '08:30', close: '15:00', timezone: 'Mexico City' },
//     'South Africa': { open: '09:00', close: '17:00', timezone: 'Johannesburg' },
//     'Russia': { open: '10:00', close: '18:45', timezone: 'Moscow' },
//     'Switzerland': { open: '09:00', close: '17:30', timezone: 'Zurich' },
//     'Sweden': { open: '09:00', close: '17:30', timezone: 'Stockholm' },
//     'Norway': { open: '09:00', close: '17:30', timezone: 'Oslo' },
//     'Denmark': { open: '09:00', close: '17:00', timezone: 'Copenhagen' },
//     'Netherlands': { open: '09:00', close: '17:30', timezone: 'Amsterdam' },
//     'France': { open: '09:00', close: '17:30', timezone: 'Paris' },
//     'Italy': { open: '09:00', close: '17:30', timezone: 'Rome' },
//     'Spain': { open: '09:00', close: '17:30', timezone: 'Madrid' },
//     'Australia': { open: '10:00', close: '16:00', timezone: 'Sydney' },
//     'New Zealand': { open: '10:00', close: '16:45', timezone: 'Auckland' },
//     'Xetra': { open: '09:00', close: '17:30', timezone: 'Berlin' },
//     // 'Euronext': { open: '09:00', close: '17:30', timezone: 'Paris' },
//     // 'Borsa Italiana': { open: '09:00', close: '17:30', timezone: 'Rome' },
//     // 'BME': { open: '09:00', close: '17:30', timezone: 'Madrid' },
//     // 'Nasdaq Stockholm': { open: '09:00', close: '17:30', timezone: 'Stockholm' },
//     // 'Oslo Børs': { open: '09:00', close: '17:30', timezone: 'Oslo' },
//     // 'Nasdaq Copenhagen': { open: '09:00', close: '17:30', timezone: 'Copenhagen' },
//   };

//   return marketHoursMap[region] || { open: '09:30', close: '16:00', timezone: 'Eastern' };
// };

// Format trading date (same across all timezones)
export const formatTradingDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d');
  } catch (error) {
    console.error('Error formatting trading date:', error);
    return dateString;
  }
};

// Get market status for a region
// export const getMarketStatus = (region: string): { isOpen: boolean; nextOpen: string; timezone: string } => {
//   const marketHours = getMarketHours(region);
//   const now = new Date();
//   const userOffset = getUserLocalTimezoneOffset();

//   // This is a simplified calculation - in a real app, you'd want more sophisticated market status logic
//   const isOpen = true; // Simplified for demo
//   const nextOpen = marketHours.open;

//   return {
//     isOpen,
//     nextOpen,
//     timezone: marketHours.timezone
//   };
// };

// Format price with currency symbol
export const formatPriceWithCurrency = (
  price: number,
  currency: string = 'USD'
): string => {
  if (!price || isNaN(price)) return `${getCurrencySymbol(currency)}0.00`;

  const symbol = getCurrencySymbol(currency);

  // Handle different decimal places for different currencies
  if (currency === 'JPY' || currency === 'KRW') {
    return `${symbol}${price.toFixed(0)}`;
  } else if (currency === 'GBX') {
    return `${symbol}${price.toFixed(0)}`;
  } else {
    return `${symbol}${price.toFixed(2)}`;
  }
};

// Test function to verify the new approach
// export const testTradingDateApproach = () => {
//   console.log('Testing trading date approach...');

//   // Test that dates are the same across regions
//   const testDate = '2025-07-02';
//   const usDate = formatTradingDate(testDate);
//   const ukDate = formatTradingDate(testDate);
//   const japanDate = formatTradingDate(testDate);

//   console.log('US Date:', usDate);
//   console.log('UK Date:', ukDate);
//   console.log('Japan Date:', japanDate);
//   console.log('All dates should be the same:', usDate === ukDate && ukDate === japanDate);

//   // Test market hours
//   const usHours = getMarketHours('United States');
//   const ukHours = getMarketHours('United Kingdom');
//   const japanHours = getMarketHours('Tokyo');

//   console.log('US Market Hours:', usHours);
//   console.log('UK Market Hours:', ukHours);
//   console.log('Japan Market Hours:', japanHours);

//   // Test currency formatting
//   console.log('USD 123.45:', formatPriceWithCurrency(123.45, 'USD'));
//   console.log('EUR 123.45:', formatPriceWithCurrency(123.45, 'EUR'));
//   console.log('GBX 250:', formatPriceWithCurrency(250, 'GBX'));
//   console.log('JPY 12345:', formatPriceWithCurrency(12345, 'JPY'));
// };

// Get market timezone from region
// export const getMarketTimezoneFromRegion = (region: string): string => {
//   const timezoneMap: Record<string, string> = {
//     'United States': 'Eastern',
//     'United Kingdom': 'London',
//     'Frankfurt': 'Berlin',
//     'Tokyo': 'Tokyo',
//     'Hong Kong': 'Hong Kong',
//     'Sydney': 'Sydney',
//     'Canada': 'Eastern',
//     'India': 'Mumbai',
//     'Singapore': 'Singapore',
//     'South Korea': 'Seoul',
//     'Brazil': 'São Paulo',
//     'Mexico': 'Mexico City',
//     'South Africa': 'Johannesburg',
//     'Russia': 'Moscow',
//     'Switzerland': 'Zurich',
//     'Sweden': 'Stockholm',
//     'Norway': 'Oslo',
//     'Denmark': 'Copenhagen',
//     'Netherlands': 'Amsterdam',
//     'France': 'Paris',
//     'Italy': 'Rome',
//     'Spain': 'Madrid',
//     'Australia': 'Sydney',
//     'New Zealand': 'Auckland',
//   };

//   return timezoneMap[region] || 'Eastern';
// };

// Get exchange from region
// export const getExchangeFromRegion = (region: string): string => {
//   const exchangeMap: Record<string, string> = {
//     'United States': 'NYSE/NASDAQ',
//     'United Kingdom': 'LSE',
//     'Frankfurt': 'FWB',
//     'Tokyo': 'TSE',
//     'Hong Kong': 'HKEX',
//     'Sydney': 'ASX',
//     'Canada': 'TSX',
//     'India': 'NSE/BSE',
//     'Singapore': 'SGX',
//     'South Korea': 'KRX',
//     'Brazil': 'B3',
//     'Mexico': 'BMV',
//     'South Africa': 'JSE',
//     'Russia': 'MOEX',
//     'Switzerland': 'SIX',
//     'Sweden': 'Nasdaq Stockholm',
//     'Norway': 'Oslo Børs',
//     'Denmark': 'Nasdaq Copenhagen',
//     'Netherlands': 'Euronext Amsterdam',
//     'France': 'Euronext Paris',
//     'Italy': 'Borsa Italiana',
//     'Spain': 'BME',
//     'Australia': 'ASX',
//     'New Zealand': 'NZX',
//   };

//   return exchangeMap[region] || 'NYSE/NASDAQ';
// };
