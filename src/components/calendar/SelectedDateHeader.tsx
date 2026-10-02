import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, isToday } from 'date-fns';

interface SelectedDateHeaderProps {
  selectedDate: Date;
  recordCount: number;
}

export const SelectedDateHeader: React.FC<SelectedDateHeaderProps> = ({
  selectedDate,
  recordCount,
}) => {
  const isCurrentDay = isToday(selectedDate);
  const countLabel = recordCount === 1 ? '1 Record' : `${recordCount} Records`;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.dateTitle}>
          {format(selectedDate, 'EEEE, MMM dd, yyyy')}
        </Text>
        <Text style={styles.subtitle}>
          {isCurrentDay ? "Today's schedule" : 'Scheduled activity'}
        </Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{countLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  left: {
    justifyContent: 'center',
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
});
