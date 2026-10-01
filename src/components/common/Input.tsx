import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode | string;
  suffix?: React.ReactNode | string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  prefix,
  suffix,
  containerStyle,
  inputStyle,
  required,
  onFocus,
  onBlur,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.requiredAsterisk}> *</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
          restProps.editable === false ? styles.inputWrapperDisabled : null,
        ]}
      >
        {prefix ? (
          <View style={styles.prefixContainer}>
            {typeof prefix === 'string' ? (
              <Text style={styles.prefixText}>{prefix}</Text>
            ) : (
              prefix
            )}
          </View>
        ) : null}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...restProps}
        />

        {suffix ? (
          <View style={styles.suffixContainer}>
            {typeof suffix === 'string' ? (
              <Text style={styles.suffixText}>{suffix}</Text>
            ) : (
              suffix
            )}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  requiredAsterisk: {
    color: colors.danger,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.gray100,
    borderColor: colors.borderLight,
  },
  prefixContainer: {
    marginRight: 8,
  },
  prefixText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  input: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text,
    paddingVertical: 10,
  },
  suffixContainer: {
    marginLeft: 8,
  },
  suffixText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.captionRegular,
    color: colors.danger,
    marginTop: 4,
    marginLeft: 2,
  },
  hintText: {
    ...typography.captionRegular,
    color: colors.textMuted,
    marginTop: 4,
    marginLeft: 2,
  },
});
