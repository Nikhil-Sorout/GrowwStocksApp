import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
  onViewAll: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onViewAll }) => {
  return (
    <View className="flex-row justify-between items-center mb-4 px-4">
      <Text className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </Text>
      <TouchableOpacity
        onPress={onViewAll}
        className="bg-blue-500 px-3 py-1 rounded-full"
        activeOpacity={0.7}
      >
        <Text className="text-sm font-medium text-white">
          View All
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 