import React from 'react';
import { View, Text } from 'react-native';

interface ChartDataPoint {
  x: number;
  y: number;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  width = 350,
  height = 200,
  color = '#3B82F6',
}) => {
  if (!data || data.length < 2) {
    return (
      <View className="items-center justify-center" style={{ width, height }}>
        <Text className="text-gray-500 dark:text-gray-400">No chart data available</Text>
      </View>
    );
  }

  // Find min and max values for scaling
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const rangeY = maxY - minY;

  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * (width - 40) + 20; // 20px padding on each side
    const y = height - 40 - ((point.y - minY) / rangeY) * (height - 40); // 20px padding on each side
    return { x, y };
  });

  // Create SVG-like path using View components
  const pathSegments = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    pathSegments.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          left: prev.x,
          top: prev.y,
          width: curr.x - prev.x,
          height: 2,
          backgroundColor: color,
          transform: [
            {
              rotate: `${Math.atan2(curr.y - prev.y, curr.x - prev.x)}rad`,
            },
          ],
        }}
      />
    );
  }

  return (
    <View className="items-center justify-center" style={{ width, height }}>
      <View className="relative" style={{ width, height }}>
        {/* Chart background */}
        <View
          className="absolute bg-gray-100 dark:bg-gray-800 rounded-lg"
          style={{ width, height }}
        />
        
        {/* Chart line */}
        {pathSegments}
        
        {/* Data points */}
        {points.map((point, index) => (
          <View
            key={index}
            className="absolute bg-white dark:bg-gray-700 rounded-full border-2"
            style={{
              left: point.x - 4,
              top: point.y - 4,
              width: 8,
              height: 8,
              borderColor: color,
            }}
          />
        ))}
        
        {/* Y-axis labels */}
        <View className="absolute left-2 top-2 bottom-2 justify-between">
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            ₹{maxY.toFixed(0)}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            ₹{minY.toFixed(0)}
          </Text>
        </View>
        
        {/* X-axis labels */}
        <View className="absolute left-2 right-2 bottom-2 flex-row justify-between">
          <Text className="text-xs text-gray-600 dark:text-gray-400">30d ago</Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400">Today</Text>
        </View>
      </View>
    </View>
  );
}; 