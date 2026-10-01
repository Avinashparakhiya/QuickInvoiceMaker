import { create } from 'zustand';

interface SettingsState {
  defaultCurrencyCode: string;
  defaultCurrencySymbol: string;
  isBiometricEnabled: boolean;
  isHapticsEnabled: boolean;
  isAutoBackupEnabled: boolean;
  dateFormat: string;

  setCurrency: (code: string, symbol: string) => void;
  setBiometrics: (enabled: boolean) => void;
  setHaptics: (enabled: boolean) => void;
  setAutoBackup: (enabled: boolean) => void;
  setDateFormat: (format: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  defaultCurrencyCode: 'USD',
  defaultCurrencySymbol: '$',
  isBiometricEnabled: false,
  isHapticsEnabled: true,
  isAutoBackupEnabled: true,
  dateFormat: 'MMM dd, yyyy',

  setCurrency: (code, symbol) => set({ defaultCurrencyCode: code, defaultCurrencySymbol: symbol }),
  setBiometrics: (enabled) => set({ isBiometricEnabled: enabled }),
  setHaptics: (enabled) => set({ isHapticsEnabled: enabled }),
  setAutoBackup: (enabled) => set({ isAutoBackupEnabled: enabled }),
  setDateFormat: (format) => set({ dateFormat: format }),
}));
