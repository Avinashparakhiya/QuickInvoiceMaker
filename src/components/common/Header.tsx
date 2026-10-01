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
import { ArrowLeft, ChevronDown, Settings as SettingsIcon } from 'lucide-react-native';
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
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  activeOrg,
  onPressOrgSwitcher,
  onPressSettings,
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
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        ) : activeOrg ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressOrgSwitcher}
            style={styles.orgSwitcher}
          >
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>
                {activeOrg.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.orgInfo}>
              <View style={styles.orgNameRow}>
                <Text numberOfLines={1} style={styles.orgName}>
                  {activeOrg.displayName || activeOrg.name}
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} style={styles.chevron} />
              </View>
              <Text style={styles.orgSubtitle}>Tap to switch business</Text>
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
          ) : onPressSettings ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPressSettings}
              style={styles.iconButton}
            >
              <SettingsIcon size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orgAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  orgAvatarText: {
    ...typography.h3,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  orgInfo: {
    flex: 1,
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 16,
    maxWidth: 200,
  },
  chevron: {
    marginLeft: 4,
  },
  orgSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 11,
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
