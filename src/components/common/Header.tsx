import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { ArrowLeft, ChevronDown, Settings as SettingsIcon, Bell, Plus, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Organization } from '../../types';
import { useResponsive } from '../../utils/useResponsive';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  activeOrg?: Organization | null;
  onPressOrgSwitcher?: () => void;
  onPressSettings?: () => void;
  onPressNotifications?: () => void;
  onPressSearch?: () => void;
  onPressQuickCreate?: () => void;
  rightAction?: React.ReactNode;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  activeOrg,
  onPressOrgSwitcher,
  onPressSettings,
  onPressNotifications,
  onPressSearch,
  onPressQuickCreate,
  rightAction,
}) => {
  const { isWideScreen, isDesktop, contentMaxWidth } = useResponsive();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
        ) : activeOrg ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressOrgSwitcher}
            style={styles.orgHeaderContainer}
          >
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <View style={styles.orgNameRow}>
              <Text numberOfLines={1} style={styles.orgName}>
                {activeOrg.displayName || activeOrg.name}
              </Text>
              <ChevronDown size={16} color={colors.textSecondary} style={styles.chevron} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        )}

        {showBack && title ? (
          <View style={styles.centerTitleContainer}>
            <Text numberOfLines={1} style={styles.centerTitle}>
              {title}
            </Text>
            {subtitle ? (
              <Text numberOfLines={1} style={styles.centerSubtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.rightContainer}>
          {rightAction ? (
            rightAction
          ) : (
            <View style={styles.rightIcons}>
              {isWideScreen && onPressQuickCreate ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onPressQuickCreate}
                  style={styles.headerPrimaryBtn}
                >
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.headerPrimaryBtnText}>New Invoice</Text>
                </TouchableOpacity>
              ) : null}

              {onPressSearch ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onPressSearch}
                  style={styles.iconButton}
                >
                  <Search size={19} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPressNotifications}
                style={styles.iconButton}
              >
                <Bell size={19} color={colors.textSecondary} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>

              {onPressSettings ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onPressSettings}
                  style={styles.iconButton}
                >
                  <SettingsIcon size={19} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    width: '100%',
    alignSelf: 'center',
  },
  headerPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  headerPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  orgHeaderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgName: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    maxWidth: 220,
    letterSpacing: -0.4,
  },
  chevron: {
    marginLeft: 5,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
  },
  centerTitleContainer: {
    position: 'absolute',
    left: 64,
    right: 64,
    alignItems: 'center',
  },
  centerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  centerSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 11,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
