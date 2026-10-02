import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  getDay,
} from 'date-fns';
import { Invoice, Payment } from '../../types';

interface MonthCalendarProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  invoices: Invoice[];
  payments: Payment[];
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  currentMonth,
  onMonthChange,
  selectedDate,
  onSelectDate,
  invoices,
  payments,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.card}>
      {/* Month Header Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onMonthChange(subMonths(currentMonth, 1))}
          style={styles.navArrow}
        >
          <ChevronLeft size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onMonthChange(addMonths(currentMonth, 1))}
          style={styles.navArrow}
        >
          <ChevronRight size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels (Sun-Sat) */}
      <View style={styles.weekdaysRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekdayLabel}>
            {day}
          </Text>
        ))}
      </View>

      {/* 7-Column Date Grid */}
      <View style={styles.daysGrid}>
        {/* Blank offset cells */}
        {Array.from({ length: startDayOfWeek }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.dayCellEmpty} />
        ))}

        {/* Month Day Cells */}
        {daysInMonth.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          // Calculate activity dots
          const dueOnDay = invoices.filter((i) => i.dueDate === dayStr);
          const hasOverdue = dueOnDay.some(
            (i) => i.status === 'OVERDUE' || (i.status === 'UNPAID' && dayStr < todayStr)
          );
          const hasDue = dueOnDay.some(
            (i) => (i.status === 'UNPAID' || i.status === 'PARTIAL') && dayStr >= todayStr
          );
          const hasPaid = invoices.some((i) => i.issueDate === dayStr && i.status === 'PAID');
          const hasPayment = payments.some((p) => p.paymentDate === dayStr);

          return (
            <TouchableOpacity
              key={dayStr}
              activeOpacity={0.75}
              onPress={() => onSelectDate(day)}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isCurrentDay && !isSelected && styles.dayCellToday,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isCurrentDay && !isSelected && styles.dayTextToday,
                ]}
              >
                {format(day, 'd')}
              </Text>

              {/* Event Dots */}
              <View style={styles.dotsRow}>
                {hasPaid && <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />}
                {hasDue && <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />}
                {hasOverdue && <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />}
                {hasPayment && <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend Bar */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>Paid</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Due Soon</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Overdue</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Received</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  weekdayLabel: {
    color: '#64748B',
    textAlign: 'center',
    width: `${100 / 7}%`,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: `${100 / 7}%`,
    height: 44,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 1,
  },
  dayCellSelected: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCellToday: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  dayText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayTextToday: {
    color: '#15803D',
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
