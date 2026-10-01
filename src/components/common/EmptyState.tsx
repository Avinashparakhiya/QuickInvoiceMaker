import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  secondaryActionTitle?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  secondaryActionTitle,
  onSecondaryAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionTitle && onAction ? (
        <View style={styles.buttonGroup}>
          <Button
            title={actionTitle}
            onPress={onAction}
            variant="primary"
            size="md"
            style={styles.actionBtn}
          />
          {secondaryActionTitle && onSecondaryAction ? (
            <Button
              title={secondaryActionTitle}
              onPress={onSecondaryAction}
              variant="outline"
              size="md"
              style={styles.secondaryBtn}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
    fontSize: 13,
  },
  buttonGroup: {
    marginTop: 18,
    width: '100%',
    maxWidth: 240,
    gap: 8,
  },
  actionBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
});
