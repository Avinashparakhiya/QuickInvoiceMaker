import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  UserPlus,
  CreditCard,
  PackagePlus,
  FileSpreadsheet,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { KPIStatCard } from '../../components/kpi/KPIStatCard';
import { CashflowOverviewCard } from '../../components/dashboard/CashflowOverviewCard';
import { InvoiceStatusDonut } from '../../components/dashboard/InvoiceStatusDonut';
import { UpcomingInvoiceCard } from '../../components/dashboard/UpcomingInvoiceCard';
import { InvoiceCard } from '../../components/dashboard/InvoiceCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { OrgSwitcherModal } from '../../components/common/OrgSwitcherModal';
import { EmptyState } from '../../components/common/EmptyState';
import { AmbientBackground } from '../../components/common/ScreenBackground';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Invoice } from '../../types';
import { useResponsive } from '../../utils/useResponsive';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isWideScreen, contentMaxWidth, horizontalPadding } = useResponsive();
  const { activeOrg, initialize } = useOrgStore();
  const {
    kpiSummary,
    dueSoonInvoices,
    recentInvoices,
    loadDashboardData,
    setFilterStatus,
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

  const totalInvoicesCount =
    (kpiSummary?.paidCount || 0) +
    (kpiSummary?.unpaidCount || 0) +
    (kpiSummary?.partialCount || 0) +
    (kpiSummary?.overdueCount || 0);

  const handleStatusPress = (status: string) => {
    setFilterStatus(status);
    navigation.navigate('TransactionsTab');
  };

  const renderDueSoonSection = () => {
    if (dueSoonInvoices.length === 0) {
      return (
        <View style={styles.sectionContainer}>
          <SectionHeader title="Upcoming Due Dates" />
          <View style={styles.emptyUpcomingCard}>
            <View style={styles.emptyUpcomingIconBox}>
              <CheckCircle2 size={20} color="#22C55E" />
            </View>
            <View style={styles.emptyUpcomingTextContainer}>
              <Text style={styles.emptyUpcomingTitle}>You're all caught up</Text>
              <Text style={styles.emptyUpcomingSubtitle}>No invoices are due soon.</Text>
            </View>
          </View>
        </View>
      );
    }

    const displayedInvoices = dueSoonInvoices.slice(0, 3);
    const hasMore = dueSoonInvoices.length > 3;

    return (
      <View style={styles.sectionContainer}>
        <SectionHeader
          title="Upcoming Due Dates"
          badge={dueSoonInvoices.length}
          actionText={hasMore ? 'View All' : undefined}
          onAction={() => {
            setFilterStatus('UNPAID');
            navigation.navigate('TransactionsTab');
          }}
        />

        {displayedInvoices.map((inv: Invoice) => (
          <UpcomingInvoiceCard
            key={inv.id}
            invoice={inv}
            onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
          />
        ))}
      </View>
    );
  };

  const renderRecentInvoicesSection = () => (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Recent Invoices"
        actionText="See All"
        onAction={() => {
          setFilterStatus('ALL');
          navigation.navigate('TransactionsTab');
        }}
      />

      {recentInvoices.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} color="#15803D" />}
          title="No invoices yet"
          description="Create your first professional invoice in seconds."
          actionTitle="+ Create Invoice"
          onAction={() => navigation.navigate('InvoiceCreate', {})}
        />
      ) : (
        recentInvoices.map((inv: Invoice) => (
          <InvoiceCard
            key={inv.id}
            invoice={inv}
            onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
          />
        ))
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
      <AmbientBackground />
      {/* 1. Header with greeting, org name, notification & settings */}
      <Header
        activeOrg={activeOrg}
        onPressOrgSwitcher={() => setOrgSwitcherVisible(true)}
        onPressSettings={() => navigation.navigate('Settings')}
        onPressNotifications={() => navigation.navigate('NotificationSettings')}
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
        {/* Financial Summary (2x2 grid on mobile, 4 columns on desktop) */}
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

        {/* 4. Cashflow Overview Card */}
        <CashflowOverviewCard
          kpiSummary={kpiSummary}
          currencySymbol={currencySymbol}
          onPress={() => navigation.navigate('ReportsTab')}
        />

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
            {/* 5. Invoice Status Donut Chart */}
            <InvoiceStatusDonut
              kpiSummary={kpiSummary}
              onSelectStatus={handleStatusPress}
            />

            {/* 6. Upcoming Due Dates */}
            {renderDueSoonSection()}

            {/* 7. Recent Invoices */}
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
    paddingTop: 12,
    paddingBottom: 96,
  },
  kpiGrid: {
    marginBottom: 4,
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
    marginTop: 4,
  },
  desktopLeftCol: {
    flex: 1.35,
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
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionsTitle: {
    color: '#64748B',
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
    color: '#0F172A',
  },
  sectionContainer: {
    marginTop: 6,
    marginBottom: 12,
  },
  emptyUpcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyUpcomingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyUpcomingTextContainer: {
    flex: 1,
  },
  emptyUpcomingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  emptyUpcomingSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
});
