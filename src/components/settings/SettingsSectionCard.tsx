import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export interface SettingItem {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  onPress: () => void;
}

interface SettingsSectionCardProps {
  title: string;
  items: SettingItem[];
}

export const SettingsSectionCard: React.FC<SettingsSectionCardProps> = ({
  title,
  items,
}) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.card}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <TouchableOpacity
              key={item.title}
              activeOpacity={0.7}
              onPress={item.onPress}
              style={[
                styles.row,
                !isLast && styles.rowBorder,
              ]}
            >
              {/* Pastel Icon Box */}
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                {item.icon}
              </View>

              {/* Text Info */}
              <View style={styles.textCol}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.itemSubtitle}>
                  {item.subtitle}
                </Text>
              </View>

              {/* Chevron */}
              <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 66,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textCol: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
  },
});
