import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  FileText,
  FileSpreadsheet,
  UserPlus,
  CreditCard,
  Receipt,
  ChevronRight,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { KPIStatCard } from '../../components/kpi/KPIStatCard';
import { OrgSwitcherModal } from '../../components/common/OrgSwitcherModal';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getDueStatusText } from '../../utils/dates';
import { Invoice } from '../../types';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg, initialize } = useOrgStore();
  const {
    kpiSummary,
    dueSoonInvoices,
    recentInvoices,
    loadDashboardData,
    isLoading,
  } = useInvoiceStore();

  const [orgSwitcherVisible, setOrgSwitcherVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (activeOrg) {
      loadDashboardData(activeOrg.id);
    }
  }, [activeOrg?.id]);

  const onRefresh = async () => {
    if (!activeOrg) return;
    setRefreshing(true);
    await loadDashboardData(activeOrg.id);
    setRefreshing(false);
  };

  const currencySymbol = activeOrg?.currencySymbol || '$';

  return (
    <View style={styles.container}>
      <Header
        activeOrg={activeOrg}
        onPressOrgSwitcher={() => setOrgSwitcherVisible(true)}
        onPressSettings={() => navigation.navigate('Settings')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {/* Primary CTA Banner */}
        <Card variant="softGreen" padding={18} style={styles.primaryCtaCard}>
          <View style={styles.primaryCtaRow}>
            <View style={styles.primaryCtaTextContainer}>
              <Text style={styles.primaryCtaTitle}>Fast Billing in 60s</Text>
              <Text style={styles.primaryCtaSubtitle}>
                Create, customize & share professional invoices instantly
              </Text>
            </View>
            <Button
              title="+ Create"
              onPress={() => navigation.navigate('InvoiceCreate', {})}
              size="md"
              style={styles.ctaButton}
            />
          </View>
        </Card>

        {/* KPI Grid (2x2) */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KPIStatCard
              title="Total Sales"
              amount={kpiSummary?.totalSales || 0}
              currencySymbol={currencySymbol}
              count={
                (kpiSummary?.paidCount || 0) +
                (kpiSummary?.partialCount || 0) +
                (kpiSummary?.unpaidCount || 0)
              }
              icon={<TrendingUp size={20} color={colors.primaryDark} />}
              tone="green"
              onPress={() => navigation.navigate('TransactionsTab')}
            />
            <View style={styles.kpiGap} />
            <KPIStatCard
              title="Total Collected"
              amount={kpiSummary?.totalPaid || 0}
              currencySymbol={currencySymbol}
              count={kpiSummary?.paidCount || 0}
              icon={<CheckCircle2 size={20} color="#0369A1" />}
              tone="blue"
              onPress={() => navigation.navigate('TransactionsTab')}
            />
          </View>

          <View style={styles.kpiRow}>
            <KPIStatCard
              title="Outstanding"
              amount={kpiSummary?.outstanding || 0}
              currencySymbol={currencySymbol}
              count={(kpiSummary?.unpaidCount || 0) + (kpiSummary?.partialCount || 0)}
              icon={<Clock size={20} color="#B45309" />}
              tone="amber"
              onPress={() => navigation.navigate('TransactionsTab')}
            />
            <View style={styles.kpiGap} />
            <KPIStatCard
              title="Overdue"
              amount={kpiSummary?.overdue || 0}
              currencySymbol={currencySymbol}
              count={kpiSummary?.overdueCount || 0}
              icon={<AlertTriangle size={20} color="#B91C1C" />}
              tone="red"
              onPress={() => navigation.navigate('TransactionsTab')}
            />
          </View>
        </View>

        {/* Status Breakdown Bar */}
        <View style={styles.statusChipsContainer}>
          <View style={[styles.statusChip, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.statusChipCount, { color: '#15803D' }]}>
              {kpiSummary?.paidCount || 0}
            </Text>
            <Text style={[styles.statusChipLabel, { color: '#15803D' }]}>Paid</Text>
          </View>

          <View style={[styles.statusChip, { backgroundColor: '#E0F2FE' }]}>
            <Text style={[styles.statusChipCount, { color: '#0369A1' }]}>
              {kpiSummary?.partialCount || 0}
            </Text>
            <Text style={[styles.statusChipLabel, { color: '#0369A1' }]}>Partial</Text>
          </View>

          <View style={[styles.statusChip, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statusChipCount, { color: '#B45309' }]}>
              {kpiSummary?.unpaidCount || 0}
            </Text>
            <Text style={[styles.statusChipLabel, { color: '#B45309' }]}>Unpaid</Text>
          </View>

          <View style={[styles.statusChip, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statusChipCount, { color: '#B91C1C' }]}>
              {kpiSummary?.overdueCount || 0}
            </Text>
            <Text style={[styles.statusChipLabel, { color: '#B91C1C' }]}>Overdue</Text>
          </View>
        </View>

        {/* Quick Action Shortcuts */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('InvoiceCreate', {})}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primarySoft }]}>
              <FileText size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.quickActionLabel}>Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EstimateList')}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E0F2FE' }]}>
              <FileSpreadsheet size={20} color="#0369A1" />
            </View>
            <Text style={styles.quickActionLabel}>Quotes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ExpenseList')}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
              <Receipt size={20} color="#B91C1C" />
            </View>
            <Text style={styles.quickActionLabel}>Expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('RecordPayment', {})}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <CreditCard size={20} color="#B45309" />
            </View>
            <Text style={styles.quickActionLabel}>Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CustomerList')}
            style={styles.quickActionItem}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
              <UserPlus size={20} color="#6D28D9" />
            </View>
            <Text style={styles.quickActionLabel}>Clients</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Due Soon Invoices */}
        {dueSoonInvoices.length > 0 ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Due Soon (Next 7 Days)</Text>
              <Text style={styles.badgeCount}>{dueSoonInvoices.length}</Text>
            </View>

            {dueSoonInvoices.map((inv: Invoice) => {
              const dueInfo = getDueStatusText(inv.dueDate);
              return (
                <Card
                  key={inv.id}
                  variant="elevated"
                  padding={14}
                  onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                  style={styles.invoiceCard}
                >
                  <View style={styles.invTopRow}>
                    <View>
                      <Text style={styles.invNumber}>{inv.invoiceNumber}</Text>
                      <Text style={styles.invCustomer}>{inv.customerName || 'Walk-in Customer'}</Text>
                    </View>
                    <View style={styles.invRightAlign}>
                      <Text style={styles.invAmount}>
                        {formatCurrency(inv.balanceDue, inv.currencySymbol)}
                      </Text>
                      <Text style={styles.invDueText}>{dueInfo.text}</Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : null}

        {/* Recent Invoices */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TransactionsTab')}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>

          {recentInvoices.length === 0 ? (
            <EmptyState
              icon={<FileText size={28} color={colors.primaryDark} />}
              title="No Invoices Yet"
              description="Create your first invoice in under 60 seconds with 12+ professional templates."
              actionTitle="+ Create Invoice"
              onAction={() => navigation.navigate('InvoiceCreate', {})}
            />
          ) : (
            recentInvoices.map((inv: Invoice) => (
              <Card
                key={inv.id}
                variant="elevated"
                padding={14}
                onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                style={styles.invoiceCard}
              >
                <View style={styles.invTopRow}>
                  <View style={styles.invLeft}>
                    <View style={styles.invTitleRow}>
                      <Text style={styles.invNumber}>{inv.invoiceNumber}</Text>
                      <Badge status={inv.status} size="sm" />
                    </View>
                    <Text numberOfLines={1} style={styles.invCustomer}>
                      {inv.customerName || 'No customer specified'}
                    </Text>
                    <Text style={styles.invDateText}>
                      Issued: {formatDate(inv.issueDate, 'MMM dd')} • Due: {formatDate(inv.dueDate, 'MMM dd')}
                    </Text>
                  </View>

                  <View style={styles.invRightAlign}>
                    <Text style={styles.invAmount}>
                      {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                    </Text>
                    {inv.status === 'PARTIAL' ? (
                      <Text style={styles.invBalanceSub}>
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

      {/* Organization Switcher Bottom Sheet */}
      <OrgSwitcherModal
        visible={orgSwitcherVisible}
        onClose={() => setOrgSwitcherVisible(false)}
        onAddNewOrg={() => navigation.navigate('OrganizationForm', {})}
      />
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
  primaryCtaCard: {
    marginVertical: 12,
  },
  primaryCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCtaTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  primaryCtaTitle: {
    ...typography.h3,
    color: colors.primaryDarker,
    marginBottom: 4,
  },
  primaryCtaSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  ctaButton: {
    minWidth: 100,
  },
  kpiGrid: {
    marginVertical: 8,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  kpiGap: {
    width: 12,
  },
  statusChipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusChip: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusChipLabel: {
    ...typography.micro,
    marginTop: 2,
    fontWeight: '600',
  },
  sectionContainer: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  badgeCount: {
    ...typography.caption,
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
    marginRight: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  quickActionItem: {
    width: 68,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    ...typography.micro,
    color: colors.text,
    fontWeight: '600',
  },
  invoiceCard: {
    marginBottom: 10,
  },
  invTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invLeft: {
    flex: 1,
    paddingRight: 12,
  },
  invTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  invNumber: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  invCustomer: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  invDateText: {
    ...typography.micro,
    color: colors.textMuted,
  },
  invRightAlign: {
    alignItems: 'flex-end',
  },
  invAmount: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 16,
  },
  invDueText: {
    ...typography.captionRegular,
    color: colors.danger,
    marginTop: 2,
    fontWeight: '500',
  },
  invBalanceSub: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
