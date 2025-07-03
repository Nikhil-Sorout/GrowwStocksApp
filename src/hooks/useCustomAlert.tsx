import React, { useState, useCallback } from 'react';
import { CustomAlert } from '../components/CustomAlert';

interface AlertConfig {
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

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((config: Omit<AlertConfig, 'visible'>) => {
    setAlertConfig({ ...config, visible: true });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const showSuccessAlert = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      showAlert({
        title,
        message,
        type: 'success',
        onConfirm: () => {
          hideAlert();
          onConfirm?.();
        },
      });
    },
    [showAlert, hideAlert]
  );

  const showErrorAlert = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      showAlert({
        title,
        message,
        type: 'error',
        onConfirm: () => {
          hideAlert();
          onConfirm?.();
        },
      });
    },
    [showAlert, hideAlert]
  );

  const showWarningAlert = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      onCancel?: () => void
    ) => {
      showAlert({
        title,
        message,
        type: 'warning',
        onConfirm: () => {
          hideAlert();
          onConfirm?.();
        },
        onCancel: () => {
          hideAlert();
          onCancel?.();
        },
        showCancel: true,
        confirmText: 'Continue',
        cancelText: 'Cancel',
      });
    },
    [showAlert, hideAlert]
  );

  const showConfirmAlert = useCallback(
    (
      title: string,
      message: string,
      onConfirm?: () => void,
      onCancel?: () => void,
      confirmText?: string,
      cancelText?: string
    ) => {
      showAlert({
        title,
        message,
        type: 'info',
        onConfirm: () => {
          hideAlert();
          onConfirm?.();
        },
        onCancel: () => {
          hideAlert();
          onCancel?.();
        },
        showCancel: true,
        confirmText: confirmText || 'Confirm',
        cancelText: cancelText || 'Cancel',
      });
    },
    [showAlert, hideAlert]
  );

  const AlertComponent = useCallback(
    () => (
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
      />
    ),
    [alertConfig]
  );

  return {
    showAlert,
    hideAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showConfirmAlert,
    AlertComponent,
  };
};
