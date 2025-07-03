import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface SectionHeaderProps {
  title: string;
  onViewAll: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(
  ({ title, onViewAll }) => {
    const { colors } = useTheme();

    return (
      <View className="flex-row justify-between items-center mb-4 px-4">
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={onViewAll}
          className="px-3 py-1 rounded-full border"
          style={{
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          }}
          activeOpacity={0.7}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);
