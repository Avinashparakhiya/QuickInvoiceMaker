import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { MonthSummaryCard } from '../../components/calendar/MonthSummaryCard';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { SelectedDateHeader } from '../../components/calendar/SelectedDateHeader';
import { CalendarActivityCard } from '../../components/calendar/CalendarActivityCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Invoice, Payment } from '../../types';
import { useResponsive } from '../../utils/useResponsive';
import { format, isToday, isSameMonth } from 'date-fns';

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { contentMaxWidth, horizontalPadding, isWideScreen } = useResponsive();
  const { activeOrg } = useOrgStore();
  const { invoices, loadInvoices } = useInvoiceStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!activeOrg) return;
    await loadInvoices(activeOrg.id);
    const p = await paymentRepository.getByOrg(activeOrg.id);
    setPayments(p);
  };

  useEffect(() => {
    if (activeOrg && isFocused) {
      loadData();
    }
  }, [activeOrg?.id, isFocused]);

  const onRefresh = async () => {
    if (!activeOrg) return;
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const currencySymbol = activeOrg?.currencySymbol || '$';
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const currentMonthStr = format(currentMonth, 'yyyy-MM');

  // Month-level totals
  const monthInvoices = useMemo(() => {
    return invoices.filter(
      (i) => i.dueDate.startsWith(currentMonthStr) || i.issueDate.startsWith(currentMonthStr)
    );
  }, [invoices, currentMonthStr]);

  const monthDueAmount = useMemo(() => {
    return monthInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  }, [monthInvoices]);

  const monthCollectedAmount = useMemo(() => {
    return payments
      .filter((p) => p.paymentDate.startsWith(currentMonthStr))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments, currentMonthStr]);

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

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with title, active org, and Today button */}
      <Header
        title="Cashflow Calendar"
        subtitle={activeOrg?.displayName || activeOrg?.name || 'Workspace'}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleJumpToToday}
            style={styles.todayButton}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { maxWidth: contentMaxWidth, paddingHorizontal: horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* 2. Top 3-Column Month Summary Card */}
        <MonthSummaryCard
          collected={monthCollectedAmount}
          due={monthDueAmount}
          totalInvoices={monthInvoices.length}
          currencySymbol={currencySymbol}
        />

        {/* 3. Responsive Content: Desktop 2-Columns vs Mobile Stack */}
        {isWideScreen ? (
          <View style={styles.desktopColumns}>
            {/* Left Column: Month Calendar */}
            <View style={styles.desktopLeftCol}>
              <MonthCalendar
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                invoices={invoices}
                payments={payments}
              />
            </View>

            {/* Right Column: Selected Date Activity */}
            <View style={styles.desktopRightCol}>
              <SelectedDateHeader
                selectedDate={selectedDate}
                recordCount={totalDayActivity}
              />

              {totalDayActivity === 0 ? (
                <EmptyState
                  icon={<CalendarIcon size={32} color="#15803D" />}
                  title="No Activity On This Day"
                  description="No invoice due dates or payment receipts fall on this selected date."
                  actionTitle="+ Create Invoice"
                  onAction={() => navigation.navigate('InvoiceCreate', {})}
                />
              ) : (
                <>
                  {dayInvoices.map((inv) => (
                    <CalendarActivityCard
                      key={`inv-${inv.id}`}
                      type="INVOICE"
                      invoice={inv}
                      selectedDateStr={selectedDateStr}
                      onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                    />
                  ))}

                  {dayPayments.map((p) => (
                    <CalendarActivityCard
                      key={`pay-${p.id}`}
                      type="PAYMENT"
                      payment={p}
                      currencySymbol={currencySymbol}
                      onPress={() => navigation.navigate('PaymentList')}
                    />
                  ))}
                </>
              )}
            </View>
          </View>
        ) : (
          <>
            {/* Month Calendar Grid */}
            <MonthCalendar
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              invoices={invoices}
              payments={payments}
            />

            {/* Selected Date Activity Header */}
            <SelectedDateHeader
              selectedDate={selectedDate}
              recordCount={totalDayActivity}
            />

            {/* Selected Date Activities */}
            {totalDayActivity === 0 ? (
              <EmptyState
                icon={<CalendarIcon size={32} color="#15803D" />}
                title="No Activity On This Day"
                description="No invoice due dates or payment receipts fall on this selected date."
                actionTitle="+ Create Invoice"
                onAction={() => navigation.navigate('InvoiceCreate', {})}
              />
            ) : (
              <>
                {dayInvoices.map((inv) => (
                  <CalendarActivityCard
                    key={`inv-${inv.id}`}
                    type="INVOICE"
                    invoice={inv}
                    selectedDateStr={selectedDateStr}
                    onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                  />
                ))}

                {dayPayments.map((p) => (
                  <CalendarActivityCard
                    key={`pay-${p.id}`}
                    type="PAYMENT"
                    payment={p}
                    currencySymbol={currencySymbol}
                    onPress={() => navigation.navigate('PaymentList')}
                  />
                ))}
              </>
            )}
          </>
        )}
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 8,
    paddingBottom: 96,
  },
  desktopColumns: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopLeftCol: {
    flex: 1.25,
  },
  desktopRightCol: {
    flex: 1,
  },
});
