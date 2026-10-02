import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { useResponsive } from '../../../utils/useResponsive';

interface StepProgressBarProps {
  currentStep: number; // 0 = Customer, 1 = Items, 2 = Preview
  onStepPress?: (step: number) => void;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onStepPress,
}) => {
  const { contentMaxWidth } = useResponsive();
  const steps = [
    { index: 0, label: 'Customer' },
    { index: 1, label: 'Items' },
    { index: 2, label: 'Preview' },
  ];

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.index;
          const isActive = currentStep === step.index;
          const isPending = currentStep < step.index;

          return (
            <React.Fragment key={step.index}>
              <TouchableOpacity
                activeOpacity={isCompleted ? 0.7 : 1}
                onPress={() => isCompleted && onStepPress?.(step.index)}
                style={[
                  styles.stepItem,
                  isActive && styles.stepItemActive,
                ]}
              >
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                    isPending && styles.circlePending,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.circleNumber,
                        isActive && styles.circleNumberActive,
                        isPending && styles.circleNumberPending,
                      ]}
                    >
                      {step.index + 1}
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isActive && styles.stepLabelActive,
                    isPending && styles.stepLabelPending,
                  ]}
                >
                  {step.label}
                </Text>
              </TouchableOpacity>

              {idx < steps.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    currentStep > idx ? styles.lineCompleted : styles.linePending,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D7E5DC',
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 768,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  stepItemActive: {
    backgroundColor: '#DCFCE7',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  circleCompleted: {
    backgroundColor: colors.primary,
  },
  circleActive: {
    backgroundColor: colors.primary,
  },
  circlePending: {
    backgroundColor: '#E2E8F0',
  },
  circleNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  circleNumberActive: {
    color: '#FFFFFF',
  },
  circleNumberPending: {
    color: '#94A3B8',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#15803D',
  },
  stepLabelActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  stepLabelPending: {
    color: '#94A3B8',
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    maxWidth: 36,
  },
  lineCompleted: {
    backgroundColor: colors.primary,
  },
  linePending: {
    backgroundColor: '#E2E8F0',
  },
});
