import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stock } from '../types';
import { formatPriceWithCurrency } from '../utils/timezoneUtils';
import { useTheme } from '../hooks/useTheme';

interface StockCardProps {
  stock: Stock;
  onPress: (stock: Stock) => void;
}

export const StockCard: React.FC<StockCardProps> = React.memo(
  ({ stock, onPress }) => {
    const { colors } = useTheme();
    const isPositive = stock.changePercent >= 0;

    const formatVolume = (vol: number) => {
      if (!vol || isNaN(vol)) return '0K';
      return `${(vol / 1000).toFixed(0)}K`;
    };

    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 12,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
          borderWidth: 1,
          borderColor: colors.border,
          width: '100%',
        }}
        onPress={() => onPress(stock)}
        activeOpacity={0.7}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 18, fontWeight: '600', color: colors.text }}
            >
              {stock.symbol}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              {stock.name}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {stock.exchange || 'NYSE/NASDAQ'} • {stock.currency || 'USD'}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            {formatPriceWithCurrency(stock.currentPrice, stock.currency)}
          </Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: isPositive
                ? colors.success + '20'
                : colors.error + '20',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: isPositive ? colors.success : colors.error,
              }}
            >
              {isPositive ? '+' : ''}
              {stock.changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textTertiary }}>
            Vol: {formatVolume(stock.volume)}
          </Text>
          {/* <Text style={{ fontSize: 12, color: colors.textTertiary }}>
          {stock.region || 'US'}
        </Text> */}
        </View>
      </TouchableOpacity>
    );
  }
);
