import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = React.memo(
  ({ visible, onClose }) => {
    const { theme, setTheme, colors } = useTheme();

    const themes: {
      value: Theme;
      label: string;
      icon: string;
      description: string;
    }[] = [
      {
        value: 'light',
        label: 'Light',
        icon: 'sunny',
        description: 'Always use light theme',
      },
      {
        value: 'dark',
        label: 'Dark',
        icon: 'moon',
        description: 'Always use dark theme',
      },
      // {
      //   value: 'system',
      //   label: 'System',
      //   icon: 'settings',
      //   description: 'Follow system settings'
      // }
    ];

    const handleThemeSelect = (selectedTheme: Theme) => {
      setTheme(selectedTheme);
      onClose();
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className="rounded-2xl p-6 mx-4 w-80"
            style={{
              backgroundColor: colors.surface,
            }}
          >
            <Text
              className="text-xl font-bold mb-4 text-center"
              style={{ color: colors.text }}
            >
              Choose Theme
            </Text>

            <View className="space-y-3 gap-2">
              {themes.map(themeOption => (
                <TouchableOpacity
                  key={themeOption.value}
                  onPress={() => handleThemeSelect(themeOption.value)}
                  className="p-4 rounded-xl border-2"
                  style={{
                    borderColor:
                      theme === themeOption.value
                        ? colors.primary
                        : colors.border,
                    backgroundColor:
                      theme === themeOption.value
                        ? colors.primary + '20'
                        : colors.surface,
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={themeOption.icon as any}
                      size={24}
                      color={
                        theme === themeOption.value
                          ? colors.primary
                          : colors.textSecondary
                      }
                      style={{ marginRight: 12 }}
                    />
                    <View className="flex-1">
                      <Text
                        className="font-semibold text-base"
                        style={{
                          color:
                            theme === themeOption.value
                              ? colors.primary
                              : colors.text,
                        }}
                      >
                        {themeOption.label}
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {themeOption.description}
                      </Text>
                    </View>
                    {theme === themeOption.value && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="mt-6 p-3 rounded-lg border"
              style={{
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
            >
              <Text
                className="text-center font-medium"
                style={{ color: colors.text }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);
