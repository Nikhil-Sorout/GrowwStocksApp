import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
}) => {
  const { colors } = useTheme();

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: colors.success };
      case 'error':
        return { name: 'close-circle', color: colors.error };
      case 'warning':
        return { name: 'warning', color: colors.warning };
      case 'info':
      default:
        return { name: 'information-circle', color: colors.primary };
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: colors.success, color: colors.successText };
      case 'error':
        return { backgroundColor: colors.error, color: colors.errorText };
      case 'warning':
        return { backgroundColor: colors.warning, color: colors.warningText };
      case 'info':
      default:
        return { backgroundColor: colors.primary, color: colors.primaryText };
    }
  };

  const iconConfig = getIconConfig();
  const buttonStyle = getButtonStyle();

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="rounded-2xl p-6 mx-4 max-w-80"
          style={{
            backgroundColor: colors.surface,
            minWidth: 280,
            maxWidth: Dimensions.get('window').width - 32,
          }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <Ionicons
              name={iconConfig.name as any}
              size={48}
              color={iconConfig.color}
            />
          </View>

          {/* Title */}
          <Text
            className="text-xl font-bold text-center mb-3"
            style={{ color: colors.text }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            className="text-center mb-6 leading-5"
            style={{ color: colors.textSecondary }}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-row space-x-3 gap-2">
            {showCancel && (
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-3 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
                activeOpacity={0.7}
              >
                <Text
                  className="text-center font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleConfirm}
              className={`py-3 rounded-lg ${showCancel ? 'flex-1' : 'w-full'}`}
              style={{
                backgroundColor: buttonStyle.backgroundColor,
              }}
              activeOpacity={0.8}
            >
              <Text
                className="text-center font-medium"
                style={{ color: buttonStyle.color }}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Convenience functions for different alert types
export const showSuccessAlert = (
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  return (
    <CustomAlert
      visible={true}
      title={title}
      message={message}
      type="success"
      onConfirm={onConfirm}
    />
  );
};

export const showErrorAlert = (
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  return (
    <CustomAlert
      visible={true}
      title={title}
      message={message}
      type="error"
      onConfirm={onConfirm}
    />
  );
};

export const showWarningAlert = (
  title: string,
  message: string,
  onConfirm?: () => void,
  onCancel?: () => void
) => {
  return (
    <CustomAlert
      visible={true}
      title={title}
      message={message}
      type="warning"
      onConfirm={onConfirm}
      onCancel={onCancel}
      showCancel={true}
      confirmText="Continue"
      cancelText="Cancel"
    />
  );
};

export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm?: () => void,
  onCancel?: () => void,
  confirmText?: string,
  cancelText?: string
) => {
  return (
    <CustomAlert
      visible={true}
      title={title}
      message={message}
      type="info"
      onConfirm={onConfirm}
      onCancel={onCancel}
      showCancel={true}
      confirmText={confirmText || 'Confirm'}
      cancelText={cancelText || 'Cancel'}
    />
  );
};
