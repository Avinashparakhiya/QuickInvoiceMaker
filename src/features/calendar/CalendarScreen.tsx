import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  CreditCard,
  FileText,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Invoice, Payment } from '../../types';
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

const AVATAR_COLORS = [
  { bg: '#DCFCE7', text: '#15803D' },
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#FEE2E2', text: '#B91C1C' },
  { bg: '#F3E8FF', text: '#7E22CE' },
];

const getAvatarTheme = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string) => {
  if (!name) return 'WK';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg } = useOrgStore();
  const { invoices, loadInvoices } = useInvoiceStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (activeOrg) {
      loadInvoices(activeOrg.id);
      paymentRepository.getByOrg(activeOrg.id).then(setPayments);
    }
  }, [activeOrg?.id]);

  const currencySymbol = activeOrg?.currencySymbol || '$';

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Month-level totals
  const currentMonthStr = format(currentMonth, 'yyyy-MM');
  const monthInvoices = useMemo(() => {
    return invoices.filter((i) => i.dueDate.startsWith(currentMonthStr) || i.issueDate.startsWith(currentMonthStr));
  }, [invoices, currentMonthStr]);

  const monthDueAmount = useMemo(() => {
    return monthInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  }, [monthInvoices]);

  const monthPaidAmount = useMemo(() => {
    return monthInvoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }, [monthInvoices]);

  // Activity for the selected day
  const dayInvoices = useMemo(() => {
    return invoices.filter(
      (inv) => inv.dueDate === selectedDateStr || inv.issueDate === selectedDateStr
    );
  }, [invoices, selectedDateStr]);

  const dayPayments = useMemo(() => {
    return payments.filter((p) => p.paymentDate === selectedDateStr);
  }, [payments, selectedDateStr]);

  const totalDayActivity = dayInvoices.length + dayPayments.length;

  return (
    <View style={styles.container}>
      <Header
        title="Cashflow Calendar"
        subtitle={activeOrg?.displayName || activeOrg?.name || 'Workspace'}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              const now = new Date();
              setCurrentMonth(now);
              setSelectedDate(now);
            }}
            style={styles.todayButton}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Summary KPI Bar */}
        <View style={styles.monthKpiBar}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Month Collected</Text>
            <Text numberOfLines={1} style={[styles.kpiValue, { color: colors.success }]}>
              {formatCurrency(monthPaidAmount, currencySymbol)}
            </Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Month Due</Text>
            <Text numberOfLines={1} style={[styles.kpiValue, { color: colors.warning }]}>
              {formatCurrency(monthDueAmount, currencySymbol)}
            </Text>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiItem}>
            <Text style={styles.kpiLabel}>Total Invoices</Text>
            <Text style={styles.kpiValue}>{monthInvoices.length}</Text>
          </View>
        </View>

        {/* Calendar Month Card */}
        <Card variant="elevated" padding={16} style={styles.calendarCard}>
          {/* Navigation & Month Title */}
          <View style={styles.monthHeader}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={styles.navArrow}
            >
              <ChevronLeft size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.monthTitleWrapper}>
              <Text style={styles.monthTitle}>
                {format(currentMonth, 'MMMM yyyy')}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
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
            {/* Blank filler cells for starting day offset */}
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCellEmpty} />
            ))}

            {/* Actual Month Days */}
            {daysInMonth.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);

              // Check activity for this day
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

                  {/* Multi-color Activity Dots */}
                  <View style={styles.dotsRow}>
                    {hasOverdue && <View style={[styles.dot, { backgroundColor: colors.danger }]} />}
                    {hasDue && <View style={[styles.dot, { backgroundColor: colors.warning }]} />}
                    {hasPaid && <View style={[styles.dot, { backgroundColor: colors.success }]} />}
                    {hasPayment && <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Color Legend Bar */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Paid</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>Due Soon</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
              <Text style={styles.legendText}>Overdue</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Received</Text>
            </View>
          </View>
        </Card>

        {/* Selected Date Cashflow Activity */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={styles.activityTitle}>
                {format(selectedDate, 'EEEE, MMM dd, yyyy')}
              </Text>
              <Text style={styles.activitySubtitle}>
                {isToday(selectedDate) ? 'Today’s schedule' : 'Scheduled activity'}
              </Text>
            </View>
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>{totalDayActivity} Records</Text>
            </View>
          </View>

          {totalDayActivity === 0 ? (
            <Card variant="elevated" padding={20} style={styles.emptyActivityCard}>
              <EmptyState
                icon={<CalendarIcon size={28} color={colors.primary} />}
                title="No Activity On This Day"
                description="No invoice due dates or payment receipts fall on this selected date."
                actionTitle="+ Create Invoice"
                onAction={() => navigation.navigate('InvoiceCreate', {})}
              />
            </Card>
          ) : (
            <>
              {/* Day Invoices */}
              {dayInvoices.map((inv) => {
                const avatarTheme = getAvatarTheme(inv.customerName || 'Customer');
                const initials = getInitials(inv.customerName || 'Customer');
                const isDueToday = inv.dueDate === selectedDateStr;

                return (
                  <TouchableOpacity
                    key={inv.id}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                    style={styles.cardWrapper}
                  >
                    <Card variant="elevated" padding={14} style={styles.activityCard}>
                      <View style={styles.cardRow}>
                        <View style={[styles.avatarCircle, { backgroundColor: avatarTheme.bg }]}>
                          <Text style={[styles.avatarText, { color: avatarTheme.text }]}>{initials}</Text>
                        </View>

                        <View style={styles.cardLeft}>
                          <View style={styles.invTitleRow}>
                            <Text numberOfLines={1} style={styles.invCustomer}>
                              {inv.customerName || 'Walk-in'}
                            </Text>
                          </View>
                          <View style={styles.metaRow}>
                            <Text style={styles.invNumber}>{inv.invoiceNumber}</Text>
                            <Text style={styles.dotSeparator}>•</Text>
                            <Text style={styles.dueStatusText}>
                              {isDueToday ? '⚡ Due Date' : '📄 Issue Date'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardRight}>
                          <Text style={styles.invAmount}>
                            {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                          </Text>
                          <View style={styles.badgeWrapper}>
                            <Badge status={inv.status} size="sm" />
                          </View>
                          {inv.balanceDue > 0 && inv.status !== 'UNPAID' && (
                            <Text style={styles.balanceDueText}>
                              Due: {formatCurrency(inv.balanceDue, inv.currencySymbol)}
                            </Text>
                          )}
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}

              {/* Day Payments */}
              {dayPayments.map((p) => {
                const avatarTheme = getAvatarTheme(p.customerName || 'Payment');
                const initials = getInitials(p.customerName || 'Payment');

                return (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('PaymentList')}
                    style={styles.cardWrapper}
                  >
                    <Card variant="elevated" padding={14} style={styles.activityCard}>
                      <View style={styles.cardRow}>
                        <View style={[styles.avatarCircle, { backgroundColor: avatarTheme.bg }]}>
                          <Text style={[styles.avatarText, { color: avatarTheme.text }]}>{initials}</Text>
                        </View>

                        <View style={styles.cardLeft}>
                          <Text numberOfLines={1} style={styles.invCustomer}>
                            {p.customerName || 'Payment Received'}
                          </Text>
                          <View style={styles.metaRow}>
                            <Text style={styles.invNumber}>{p.paymentNumber}</Text>
                            {p.invoiceNumber && (
                              <>
                                <Text style={styles.dotSeparator}>•</Text>
                                <Text style={styles.dueStatusText}>#{p.invoiceNumber}</Text>
                              </>
                            )}
                          </View>
                        </View>

                        <View style={styles.cardRight}>
                          <Text style={[styles.invAmount, { color: colors.success }]}>
                            +{formatCurrency(p.amount, currencySymbol)}
                          </Text>
                          <View style={styles.methodBadge}>
                            <Text style={styles.methodText}>
                              {p.paymentMethod.replace(/_/g, ' ')}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </>
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
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDarker,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  monthKpiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  kpiDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  calendarCard: {
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitleWrapper: {
    alignItems: 'center',
  },
  monthTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
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
    ...typography.micro,
    color: colors.textSecondary,
    textAlign: 'center',
    width: `${100 / 7}%`,
    fontWeight: '700',
    fontSize: 11,
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
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCellToday: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
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
    height: 5,
    alignItems: 'center',
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
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activitySection: {
    marginTop: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  activityTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  activityBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDarker,
  },
  emptyActivityCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  cardWrapper: {
    marginBottom: 10,
  },
  activityCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 8,
  },
  invTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  invCustomer: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDarker,
  },
  dotSeparator: {
    marginHorizontal: 5,
    color: '#94A3B8',
    fontSize: 10,
  },
  dueStatusText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  invAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  badgeWrapper: {
    marginTop: 4,
  },
  balanceDueText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 2,
  },
  methodBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  methodText: {
    fontSize: 10,
    color: '#B45309',
    fontWeight: '700',
  },
});
