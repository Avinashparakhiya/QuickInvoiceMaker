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

  const getOrgInitials = (name?: string) => {
    if (!name) return 'QI';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const orgName = activeOrg?.displayName || activeOrg?.name || 'Quick Invoice';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            style={styles.backButton}
          >
            <ArrowLeft size={18} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
        ) : activeOrg ? (
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPressOrgSwitcher}
            style={styles.orgHeaderContainer}
          >
            <View style={styles.orgAvatarBox}>
              <Text style={styles.orgAvatarText}>{getOrgInitials(orgName)}</Text>
              <View style={styles.orgActiveDot} />
            </View>
            <View style={styles.orgTextCol}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <View style={styles.orgNameRow}>
                <Text numberOfLines={1} style={styles.orgName}>
                  {orgName}
                </Text>
                <View style={styles.chevronPill}>
                  <ChevronDown size={14} color={colors.textSecondary} strokeWidth={2.2} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        )}

        {showBack && title ? (
          <View style={styles.centerTitleContainer} pointerEvents="none">
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
                  <Search size={18} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPressNotifications}
                style={styles.iconButton}
              >
                <Bell size={18} color={colors.textSecondary} strokeWidth={2} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>

              {onPressSettings ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onPressSettings}
                  style={styles.iconButton}
                >
                  <SettingsIcon size={18} color={colors.textSecondary} strokeWidth={2} />
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.7)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
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
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  headerPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orgAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orgAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: -0.2,
  },
  orgActiveDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  orgTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 1,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orgName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    maxWidth: 200,
    letterSpacing: -0.3,
  },
  chevronPill: {
    padding: 2,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginLeft: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 1,
  },
  centerTitleContainer: {
    position: 'absolute',
    left: 60,
    right: 60,
    alignItems: 'center',
  },
  centerTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  centerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
