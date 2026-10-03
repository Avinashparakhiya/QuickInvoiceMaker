import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PASTEL_PALETTE = [
  { bg: '#E0F2FE', text: '#0369A1' }, // Light Blue
  { bg: '#FEF3C7', text: '#B45309' }, // Light Orange/Amber
  { bg: '#DCFCE7', text: '#15803D' }, // Light Green
  { bg: '#F3E8FF', text: '#7E22CE' }, // Light Purple
  { bg: '#FFEDD5', text: '#C2410C' }, // Soft Peach
  { bg: '#FEE2E2', text: '#B91C1C' }, // Soft Rose
];

export const getCustomerInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'WK';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PASTEL_PALETTE.length;
  return PASTEL_PALETTE[index];
};

interface CustomerAvatarProps {
  name?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  name = 'Walk-in',
  size = 42,
  backgroundColor,
  textColor,
}) => {
  const initials = getCustomerInitials(name);
  const colorTheme = getAvatarColor(name);

  const finalBg = backgroundColor || colorTheme.bg;
  const finalText = textColor || colorTheme.text;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: finalBg,
        },
      ]}
    >
      <Text style={[styles.text, { color: finalText, fontSize: Math.max(12, size * 0.35) }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
