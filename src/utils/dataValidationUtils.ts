// Utility functions to handle NaN, null, and empty values in company data

/**
 * Check if a value is valid (not null, undefined, NaN, or empty string)
 */
export const isValidValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  // Check for NaN
  if (typeof value === 'number' && isNaN(value)) {
    return false;
  }

  // Check for string 'NaN'
  if (typeof value === 'string' && value.toLowerCase() === 'nan') {
    return false;
  }

  // Check for string 'None'
  if (typeof value === 'string' && value.toLowerCase() === 'none') {
    return false;
  }

  return true;
};

/**
 * Get a safe string value, returning 'N/A' if invalid
 */
export const getSafeString = (
  value: any,
  defaultValue: string = 'N/A'
): string => {
  return isValidValue(value) ? String(value) : defaultValue;
};

/**
 * Get a safe number value, returning 0 if invalid
 */
export const getSafeNumber = (value: any, defaultValue: number = 0): number => {
  if (!isValidValue(value)) {
    return defaultValue;
  }

  const num = parseFloat(String(value));
  return isNaN(num) ? defaultValue : num;
};

/**
 * Check if company info has valid data for a specific section
 */
export const hasValidCompanyData = (
  companyInfo: any,
  requiredFields: string[]
): boolean => {
  if (!companyInfo) {
    return false;
  }

  // Check if at least one required field has valid data
  return requiredFields.some(field => isValidValue(companyInfo[field]));
};

/**
 * Check if company info has valid financial metrics
 */
export const hasValidFinancialMetrics = (companyInfo: any): boolean => {
  const financialFields = [
    'MarketCapitalization',
    'PERatio',
    'EPS',
    'ForwardPE',
    'DividendYield',
    'DividendPerShare',
    'Beta',
    '52WeekHigh',
    '52WeekLow',
    '50DayMovingAverage',
    '200DayMovingAverage',
    'BookValue',
    'RevenueTTM',
    'EBITDA',
    'ProfitMargin',
    'ReturnOnEquityTTM',
  ];

  return hasValidCompanyData(companyInfo, financialFields);
};

/**
 * Check if company info has valid analyst ratings
 */
export const hasValidAnalystRatings = (companyInfo: any): boolean => {
  const analystFields = [
    'AnalystTargetPrice',
    'AnalystRatingStrongBuy',
    'AnalystRatingBuy',
    'AnalystRatingHold',
    'AnalystRatingSell',
    'AnalystRatingStrongSell',
  ];

  return hasValidCompanyData(companyInfo, analystFields);
};

/**
 * Check if company info has valid basic information
 */
export const hasValidBasicInfo = (companyInfo: any): boolean => {
  const basicFields = [
    'Sector',
    'Industry',
    'Exchange',
    'Country',
    'Address',
    'Name',
    'Description',
  ];

  return hasValidCompanyData(companyInfo, basicFields);
};

/**
 * Get total analyst count safely
 */
export const getTotalAnalystCount = (companyInfo: any): number => {
  if (!companyInfo) return 0;

  const ratings = [
    'AnalystRatingStrongBuy',
    'AnalystRatingBuy',
    'AnalystRatingHold',
    'AnalystRatingSell',
    'AnalystRatingStrongSell',
  ];

  return ratings.reduce((total, field) => {
    return total + getSafeNumber(companyInfo[field], 0);
  }, 0);
};
