import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useCustomAlert } from '../hooks/useCustomAlert';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
  icon?: string;
  errorType?: 'network' | 'api' | 'cache' | 'general';
  showDetails?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(
  ({
    title = 'Unable to Load Data',
    message = 'We encountered an issue while loading the requested information. Please check your connection and try again.',
    onRetry,
    showRetryButton = true,
    icon = 'trending-up',
    errorType = 'general',
    showDetails = false,
  }) => {
    const { colors } = useTheme();
    const { showConfirmAlert, AlertComponent } = useCustomAlert();
    const getErrorIcon = () => {
      switch (errorType) {
        case 'network':
          return 'wifi';
        case 'api':
          return 'key';
        case 'cache':
          return 'save';
        default:
          return 'trending-up';
      }
    };

    const getErrorTitle = () => {
      switch (errorType) {
        case 'network':
          return 'Network Error';
        case 'api':
          return 'API Error';
        case 'cache':
          return 'Cache Error';
        default:
          return title;
      }
    };

    const getErrorMessage = () => {
      switch (errorType) {
        case 'network':
          return 'Unable to connect to the server. Please check your internet connection and try again.';
        case 'api':
          return 'There was an issue with the API request. This might be due to rate limiting or invalid API key.';
        case 'cache':
          return 'Unable to load cached data. The cache may be corrupted or expired.';
        default:
          return message;
      }
    };

    const handleShowDetails = () => {
      if (showDetails) {
        showConfirmAlert(
          'Error Details',
          `Type: ${errorType}\n\n${getErrorMessage()}\n\nIf this problem persists, please check your settings or contact support.`,
          undefined,
          undefined,
          'OK'
        );
      }
    };

    return (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <AlertComponent />
        <View
          className="p-8 rounded-2xl items-center max-w-80 border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {/* Icon */}
          <Ionicons
            name={getErrorIcon() as any}
            size={64}
            color={colors.textSecondary}
            style={{ marginBottom: 16, opacity: 0.6 }}
          />

          {/* Title */}
          <Text
            className="text-xl font-medium mb-3 text-center"
            style={{ color: colors.text }}
          >
            {getErrorTitle()}
          </Text>

          {/* Message */}
          <Text
            className="text-center mb-6 leading-5"
            style={{ color: colors.textSecondary }}
          >
            {getErrorMessage()}
          </Text>

          {/* Action Buttons */}
          {showRetryButton && onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              className="px-6 py-3 rounded-lg mb-3"
              style={{
                backgroundColor: colors.primary,
              }}
              activeOpacity={0.8}
            >
              <Text
                className="font-medium text-center"
                style={{ color: colors.primaryText }}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          )}

          {showDetails && (
            <TouchableOpacity
              onPress={() => {
                showConfirmAlert(
                  'Error Details',
                  `Type: ${errorType}\nMessage: ${getErrorMessage()}\n\nThis information can help with troubleshooting.`,
                  undefined,
                  undefined,
                  'OK'
                );
              }}
              className="px-4 py-2"
              activeOpacity={0.7}
            >
              <Text className="text-sm" style={{ color: colors.textTertiary }}>
                Show Details
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

// Specialized error states
export const NetworkErrorState: React.FC<{ onRetry?: () => void }> = React.memo(
  ({ onRetry }) => (
    <ErrorState errorType="network" onRetry={onRetry} showDetails={true} />
  )
);

export const ApiErrorState: React.FC<{ onRetry?: () => void }> = React.memo(
  ({ onRetry }) => (
    <ErrorState errorType="api" onRetry={onRetry} showDetails={true} />
  )
);

export const CacheErrorState: React.FC<{ onRetry?: () => void }> = React.memo(
  ({ onRetry }) => (
    <ErrorState errorType="cache" onRetry={onRetry} showDetails={true} />
  )
);
