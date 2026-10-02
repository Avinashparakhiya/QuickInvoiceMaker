import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  FileText,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  PlusCircle,
  UserPlus,
  CreditCard,
  PackagePlus,
  FileSpreadsheet,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { KPIStatCard } from '../../components/kpi/KPIStatCard';
import { InvoiceStatusDonut } from '../../components/dashboard/InvoiceStatusDonut';
import { OrgSwitcherModal } from '../../components/common/OrgSwitcherModal';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getDueStatusText } from '../../utils/dates';
import { Invoice, InvoiceStatus } from '../../types';
import { useResponsive } from '../../utils/useResponsive';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isWideScreen, isDesktop, contentMaxWidth, horizontalPadding } = useResponsive();
  const { activeOrg, initialize } = useOrgStore();
  const {
    kpiSummary,
    dueSoonInvoices,
    recentInvoices,
    loadDashboardData,
    setFilterStatus,
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

  const totalInvoicesCount =
    (kpiSummary?.paidCount || 0) +
    (kpiSummary?.unpaidCount || 0) +
    (kpiSummary?.partialCount || 0) +
    (kpiSummary?.overdueCount || 0);

  const handleStatusPress = (status: string) => {
    setFilterStatus(status);
    navigation.navigate('TransactionsTab');
  };

  const getStatusItemTheme = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return {
          iconBg: '#DCFCE7',
          iconColor: '#16A34A',
          statusColor: '#16A34A',
          statusText: 'Paid',
          Icon: CheckCircle2,
        };
      case 'PARTIAL':
        return {
          iconBg: '#E0F2FE',
          iconColor: '#0284C7',
          statusColor: '#0284C7',
          statusText: 'Partial',
          Icon: FileText,
        };
      case 'OVERDUE':
        return {
          iconBg: '#FEE2E2',
          iconColor: '#EF4444',
          statusColor: '#EF4444',
          statusText: 'Overdue',
          Icon: AlertTriangle,
        };
      case 'UNPAID':
      default:
        return {
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
          statusColor: '#D97706',
          statusText: 'Unpaid',
          Icon: FileText,
        };
    }
  };

  const renderDueSoonSection = () => {
    if (dueSoonInvoices.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming Due Dates</Text>
          <Text style={styles.badgeCount}>{dueSoonInvoices.length}</Text>
        </View>

        {dueSoonInvoices.map((inv: Invoice) => {
          const dueInfo = getDueStatusText(inv.dueDate);
          return (
            <TouchableOpacity
              key={inv.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
              style={styles.invoiceCard}
            >
              <View style={[styles.invIconBox, { backgroundColor: '#FEE2E2' }]}>
                <AlertCircle size={20} color="#EF4444" />
              </View>

              <View style={styles.invDetails}>
                <Text numberOfLines={1} style={styles.invNumber}>
                  {inv.invoiceNumber}
                </Text>
                <Text numberOfLines={1} style={styles.invCustomer}>
                  {inv.customerName || 'Walk-in Customer'}
                </Text>
              </View>

              <View style={styles.invRightAlign}>
                <Text style={styles.invAmount}>
                  {formatCurrency(inv.balanceDue, inv.currencySymbol)}
                </Text>
                <Text style={styles.invDueText}>{dueInfo.text}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderRecentInvoicesSection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Invoices</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setFilterStatus('ALL');
            navigation.navigate('TransactionsTab');
          }}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={14} color={colors.primaryDark} />
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
        recentInvoices.map((inv: Invoice) => {
          const theme = getStatusItemTheme(inv.status);
          const StatusIcon = theme.Icon;

          return (
            <TouchableOpacity
              key={inv.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
              style={styles.invoiceCard}
            >
              <View style={[styles.invIconBox, { backgroundColor: theme.iconBg }]}>
                <StatusIcon size={20} color={theme.iconColor} />
              </View>

              <View style={styles.invDetails}>
                <Text numberOfLines={1} style={styles.invNumber}>
                  {inv.invoiceNumber}
                </Text>
                <Text numberOfLines={1} style={styles.invCustomer}>
                  {inv.customerName || 'Walk-in Customer'}
                </Text>
              </View>

              <View style={styles.invRightAlign}>
                <Text style={styles.invAmount}>
                  {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                </Text>
                <Text style={[styles.invStatusLabel, { color: theme.statusColor }]}>
                  {theme.statusText}
                </Text>
                <Text style={styles.invDateText}>
                  {formatDate(inv.issueDate, 'dd MMM, yyyy')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const renderQuickActionsBar = () => {
    if (!isWideScreen) return null;
    return (
      <View style={styles.quickActionsCard}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('InvoiceCreate', {})}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: '#DCFCE7' }]}>
              <PlusCircle size={20} color="#16A34A" />
            </View>
            <Text style={styles.quickActionLabel}>+ Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('EstimateCreate', {})}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: '#E0F2FE' }]}>
              <FileSpreadsheet size={20} color="#0284C7" />
            </View>
            <Text style={styles.quickActionLabel}>+ Estimate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('RecordPayment', {})}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: '#FEF3C7' }]}>
              <CreditCard size={20} color="#D97706" />
            </View>
            <Text style={styles.quickActionLabel}>+ Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('CustomerForm', {})}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: '#F3E8FF' }]}>
              <UserPlus size={20} color="#9333EA" />
            </View>
            <Text style={styles.quickActionLabel}>+ Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('ItemForm', {})}
          >
            <View style={[styles.quickActionIconBox, { backgroundColor: '#F1F5F9' }]}>
              <PackagePlus size={20} color="#475569" />
            </View>
            <Text style={styles.quickActionLabel}>+ Product</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        activeOrg={activeOrg}
        onPressOrgSwitcher={() => setOrgSwitcherVisible(true)}
        onPressSettings={() => navigation.navigate('Settings')}
        onPressQuickCreate={() => navigation.navigate('InvoiceCreate', {})}
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
        {/* KPI Row (Responsive: 4 columns on wide screens, 2x2 on mobile) */}
        {isWideScreen ? (
          <View style={styles.kpiRowWide}>
            <KPIStatCard
              title="Total Sales"
              amount={kpiSummary?.totalSales || 0}
              currencySymbol={currencySymbol}
              tone="green"
              style={styles.kpiCardWide}
              onPress={() => handleStatusPress('ALL')}
            />
            <KPIStatCard
              title="Outstanding"
              amount={kpiSummary?.outstanding || 0}
              currencySymbol={currencySymbol}
              tone="amber"
              style={styles.kpiCardWide}
              onPress={() => handleStatusPress('UNPAID')}
            />
            <KPIStatCard
              title="Overdue"
              amount={kpiSummary?.overdue || 0}
              currencySymbol={currencySymbol}
              tone="red"
              style={styles.kpiCardWide}
              onPress={() => handleStatusPress('OVERDUE')}
            />
            <KPIStatCard
              title="Total Invoices"
              value={totalInvoicesCount}
              isCurrency={false}
              tone="slate"
              style={styles.kpiCardWide}
              onPress={() => handleStatusPress('ALL')}
            />
          </View>
        ) : (
          <View style={styles.kpiGrid}>
            <View style={styles.kpiRow}>
              <KPIStatCard
                title="Total Sales"
                amount={kpiSummary?.totalSales || 0}
                currencySymbol={currencySymbol}
                tone="green"
                onPress={() => handleStatusPress('ALL')}
              />
              <View style={styles.kpiGap} />
              <KPIStatCard
                title="Outstanding"
                amount={kpiSummary?.outstanding || 0}
                currencySymbol={currencySymbol}
                tone="amber"
                onPress={() => handleStatusPress('UNPAID')}
              />
            </View>

            <View style={styles.kpiRow}>
              <KPIStatCard
                title="Overdue"
                amount={kpiSummary?.overdue || 0}
                currencySymbol={currencySymbol}
                tone="red"
                onPress={() => handleStatusPress('OVERDUE')}
              />
              <View style={styles.kpiGap} />
              <KPIStatCard
                title="Total Invoices"
                value={totalInvoicesCount}
                isCurrency={false}
                tone="slate"
                onPress={() => handleStatusPress('ALL')}
              />
            </View>
          </View>
        )}

        {/* Content Layout: 2-Columns on Wide Screen, Single Stack on Mobile */}
        {isWideScreen ? (
          <View style={styles.desktopColumns}>
            {/* Left Column: Quick Actions + Recent Invoices */}
            <View style={styles.desktopLeftCol}>
              {renderQuickActionsBar()}
              {renderRecentInvoicesSection()}
            </View>

            {/* Right Column: Invoice Status Donut + Upcoming Due Dates */}
            <View style={styles.desktopRightCol}>
              <InvoiceStatusDonut
                kpiSummary={kpiSummary}
                onSelectStatus={handleStatusPress}
              />
              {renderDueSoonSection()}
            </View>
          </View>
        ) : (
          <>
            {/* Invoice Status Donut Chart */}
            <InvoiceStatusDonut
              kpiSummary={kpiSummary}
              onSelectStatus={handleStatusPress}
            />

            {/* Due Soon Section */}
            {renderDueSoonSection()}

            {/* Recent Invoices Section */}
            {renderRecentInvoicesSection()}
          </>
        )}
      </ScrollView>

      {/* Organization Switcher Modal */}
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
    width: '100%',
    alignSelf: 'center',
    paddingTop: 8,
    paddingBottom: 40,
  },
  kpiGrid: {
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  kpiGap: {
    width: 10,
  },
  kpiRowWide: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  kpiCardWide: {
    flex: 1,
  },
  desktopColumns: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopLeftCol: {
    flex: 1.4,
  },
  desktopRightCol: {
    flex: 1,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionsTitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 10,
  },
  quickActionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  sectionContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  badgeCount: {
    ...typography.caption,
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '700',
    fontSize: 11,
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
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  invIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  invDetails: {
    flex: 1,
    paddingRight: 8,
  },
  invNumber: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  invCustomer: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 13,
  },
  invRightAlign: {
    alignItems: 'flex-end',
  },
  invAmount: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  invStatusLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  invDateText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  invDueText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },
});
