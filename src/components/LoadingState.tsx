import React from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  showPulse?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = React.memo(
  ({
    title = 'Loading...',
    subtitle,
    showPulse = true,
    size = 'large',
    color,
  }) => {
    const { colors } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const spinnerColor = color || colors.primary;

    useEffect(() => {
      if (showPulse) {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();
        return () => pulseAnimation.stop();
      }
    }, [showPulse, pulseAnim]);

    return (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <Animated.View className="items-center" style={{ opacity: pulseAnim }}>
          {/* Loading Spinner */}
          <View className="mb-4">
            <ActivityIndicator size={size} color={spinnerColor} />
          </View>

          {/* Title */}
          <Text
            className="text-lg font-medium mb-2 text-center"
            style={{ color: colors.text }}
          >
            {title}
          </Text>

          {/* Subtitle */}
          {subtitle && (
            <Text
              className="text-center leading-5"
              style={{ color: colors.textSecondary }}
            >
              {subtitle}
            </Text>
          )}

          {/* Loading Dots Animation */}
          <View className="flex-row mt-4 space-x-1">
            {[0, 1, 2].map(index => (
              <Animated.View
                key={index}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: colors.textTertiary,
                  opacity: pulseAnim,
                  transform: [{ scale: pulseAnim }],
                }}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    );
  }
);

// Specialized loading states
export const StockLoadingState: React.FC<{ symbol?: string }> = ({
  symbol,
}) => (
  <LoadingState
    title={`Loading ${symbol || 'Stock'} Data`}
    subtitle="Fetching real-time market information"
    showPulse={true}
  />
);

export const SearchLoadingState: React.FC<{ query: string }> = ({ query }) => (
  <LoadingState
    title="Searching Stocks"
    subtitle={`Looking for "${query}"...`}
    showPulse={true}
  />
);

export const ChartLoadingState: React.FC = () => (
  <LoadingState
    title="Loading Chart Data"
    subtitle="Preparing price history visualization"
    showPulse={true}
  />
);

export const CacheLoadingState: React.FC = () => (
  <LoadingState
    title="Updating Cache"
    subtitle="Refreshing stored data"
    showPulse={true}
  />
);
