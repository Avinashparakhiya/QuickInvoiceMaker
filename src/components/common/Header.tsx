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
import { ArrowLeft, ChevronDown, Settings as SettingsIcon, Bell } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Organization } from '../../types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  activeOrg?: Organization | null;
  onPressOrgSwitcher?: () => void;
  onPressSettings?: () => void;
  onPressNotifications?: () => void;
  rightAction?: React.ReactNode;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
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
  rightAction,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPressNotifications}
                style={styles.iconButton}
              >
                <Bell size={20} color={colors.textSecondary} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
              {onPressSettings ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onPressSettings}
                  style={styles.iconButton}
                >
                  <SettingsIcon size={20} color={colors.textSecondary} />
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    maxWidth: 220,
  },
  chevron: {
    marginLeft: 4,
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
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
