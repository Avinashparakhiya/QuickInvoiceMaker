import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export type DateRangeType = 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'LAST_30_DAYS' | 'ALL_TIME';

export interface DateRangeOption {
  label: string;
  value: DateRangeType;
}

interface DateRangeFilterProps {
  selectedValue: DateRangeType;
  onSelect: (value: DateRangeType) => void;
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { label: 'This Month', value: 'THIS_MONTH' },
  { label: 'This Quarter', value: 'THIS_QUARTER' },
  { label: 'This Year', value: 'THIS_YEAR' },
  { label: 'Last 30 Days', value: 'LAST_30_DAYS' },
  { label: 'All Time', value: 'ALL_TIME' },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedValue,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollRow}
      >
        {DATE_RANGE_OPTIONS.map((option) => {
          const isActive = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.75}
              onPress={() => onSelect(option.value)}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    paddingTop: 4,
  },
  scrollRow: {
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  chipText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipTextInactive: {
    color: '#64748B',
    fontWeight: '600',
  },
});
