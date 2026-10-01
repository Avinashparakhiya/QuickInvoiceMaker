import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onDismiss,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#15803D" />;
      case 'error':
        return <AlertCircle size={18} color="#B91C1C" />;
      case 'info':
        return <Info size={18} color="#0369A1" />;
    }
  };

  const getContainerStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#DCFCE7',
          borderColor: '#BBF7D0',
        };
      case 'error':
        return {
          backgroundColor: '#FEE2E2',
          borderColor: '#FECACA',
        };
      case 'info':
        return {
          backgroundColor: '#E0F2FE',
          borderColor: '#BAE6FD',
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        getContainerStyle(),
        shadows.elevated,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.icon}>{getIcon()}</View>
        <Text numberOfLines={2} style={styles.message}>
          {message}
        </Text>
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeBtn}>
        <X size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 32,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
});
