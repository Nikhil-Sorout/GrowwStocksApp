import React, { useState, useRef, useCallback } from 'react';
import { View, FlatList, Dimensions, Text } from 'react-native';
import { StockCard } from './StockCard';
import { Stock } from '../types';

interface HorizontalStockListProps {
  data: Stock[];
  onStockPress: (stock: Stock) => void;
  itemWidth?: number;
  spacing?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const HorizontalStockList: React.FC<HorizontalStockListProps> =
  React.memo(({ data, onStockPress, itemWidth = 160, spacing = 12 }) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 5 });
    const flatListRef = useRef<FlatList>(null);

    const renderItem = useCallback(
      ({ item }: { item: Stock }) => (
        <View
          className="border rounded-lg shadow-sm"
          style={{ width: itemWidth, marginRight: spacing }}
        >
          <StockCard stock={item} onPress={onStockPress} />
        </View>
      ),
      [itemWidth, spacing, onStockPress]
    );

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const firstIndex = viewableItems[0].index;
        const lastIndex = viewableItems[viewableItems.length - 1].index;
        setVisibleRange({ start: firstIndex, end: lastIndex });
      }
    }, []);

    const viewabilityConfig = {
      itemVisiblePercentThreshold: 50,
    };

    const getItemLayout = useCallback(
      (data: any, index: number) => ({
        length: itemWidth + spacing,
        offset: (itemWidth + spacing) * index,
        index,
      }),
      [itemWidth, spacing]
    );

    return (
      <View>
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          initialNumToRender={
            Math.ceil(screenWidth / (itemWidth + spacing)) + 1
          }
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          decelerationRate="fast"
          snapToInterval={itemWidth + spacing}
          snapToAlignment="start"
        />
        {data.length > Math.ceil(screenWidth / (itemWidth + spacing)) && (
          <View className="items-center mt-2">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Scroll for more →
            </Text>
          </View>
        )}
      </View>
    );
  });
