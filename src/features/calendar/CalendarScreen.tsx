import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Invoice } from '../../types';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();
  const { invoices, loadInvoices } = useInvoiceStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (activeOrg) {
      loadInvoices(activeOrg.id);
    }
  }, [activeOrg?.id]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Find invoices due on or issued on the selected date
  const dayInvoices = invoices.filter(
    (inv) => inv.dueDate === selectedDateStr || inv.issueDate === selectedDateStr
  );

  return (
    <View style={styles.container}>
      <Header
        title="Cashflow Calendar"
        subtitle="Track payment due dates & settlements"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calendar Month Header */}
        <Card variant="elevated" padding={16} style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity
              onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={styles.navArrow}
            >
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>

            <TouchableOpacity
              onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
              style={styles.navArrow}
            >
              <ChevronRight size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdaysRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.weekdayLabel}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {daysInMonth.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);

              // Check if any invoice is due on this day
              const dueOnDay = invoices.filter((i) => i.dueDate === dayStr);
              const hasOverdue = dueOnDay.some((i) => i.status === 'OVERDUE' || (i.status === 'UNPAID' && dayStr < format(new Date(), 'yyyy-MM-dd')));
              const hasDue = dueOnDay.some((i) => i.status === 'UNPAID' || i.status === 'PARTIAL');
              const hasPaid = invoices.some((i) => i.issueDate === dayStr && i.status === 'PAID');

              return (
                <TouchableOpacity
                  key={dayStr}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDate(day)}
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

                  {/* Status Indicator Dots */}
                  <View style={styles.dotsRow}>
                    {hasOverdue ? <View style={[styles.dot, { backgroundColor: colors.danger }]} /> : null}
                    {hasDue && !hasOverdue ? <View style={[styles.dot, { backgroundColor: colors.warning }]} /> : null}
                    {hasPaid ? <View style={[styles.dot, { backgroundColor: colors.success }]} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Selected Date Cashflow Activity */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>
              Activity on {format(selectedDate, 'MMM dd, yyyy')}
            </Text>
            <Badge label={`${dayInvoices.length} Invoices`} size="sm" />
          </View>

          {dayInvoices.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon size={24} color={colors.primaryDark} />}
              title="No Invoices On This Day"
              description="No invoice issue or due dates fall on this selected date."
            />
          ) : (
            dayInvoices.map((inv) => (
              <Card
                key={inv.id}
                variant="elevated"
                padding={14}
                onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                style={styles.invCard}
              >
                <View style={styles.invCardRow}>
                  <View>
                    <View style={styles.invHeaderRow}>
                      <Text style={styles.invNumber}>{inv.invoiceNumber}</Text>
                      <Badge status={inv.status} size="sm" />
                    </View>
                    <Text style={styles.invCustomer}>{inv.customerName || 'Walk-in'}</Text>
                    <Text style={styles.invDueSub}>
                      {inv.dueDate === selectedDateStr ? '⚡ Payment Due' : '📄 Issued Date'}
                    </Text>
                  </View>

                  <View style={styles.invRight}>
                    <Text style={styles.invAmount}>
                      {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                    </Text>
                    {inv.balanceDue > 0 ? (
                      <Text style={styles.balanceText}>
                        Bal: {formatCurrency(inv.balanceDue, inv.currencySymbol)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  calendarCard: {
    marginVertical: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitle: {
    ...typography.h3,
    color: colors.text,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    textAlign: 'center',
    width: `${100 / 7}%`,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellToday: {
    backgroundColor: colors.primarySoft,
  },
  dayText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  activitySection: {
    marginTop: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityTitle: {
    ...typography.h3,
    color: colors.text,
  },
  invCard: {
    marginBottom: 10,
  },
  invCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  invNumber: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  invCustomer: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  invDueSub: {
    ...typography.micro,
    color: colors.primaryDark,
    marginTop: 2,
    fontWeight: '600',
  },
  invRight: {
    alignItems: 'flex-end',
  },
  invAmount: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 16,
  },
  balanceText: {
    ...typography.micro,
    color: colors.danger,
    marginTop: 2,
  },
});
