import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Check, X, ArrowDownUp } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export type SortOptionKey =
  | 'NEWEST'
  | 'OLDEST'
  | 'HIGHEST_AMOUNT'
  | 'LOWEST_AMOUNT'
  | 'DUE_DATE';

interface SortOption {
  key: SortOptionKey;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'NEWEST', label: 'Newest First' },
  { key: 'OLDEST', label: 'Oldest First' },
  { key: 'HIGHEST_AMOUNT', label: 'Highest Amount' },
  { key: 'LOWEST_AMOUNT', label: 'Lowest Amount' },
  { key: 'DUE_DATE', label: 'Due Date' },
];

interface SortBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedSort: SortOptionKey;
  onSelectSort: (key: SortOptionKey) => void;
}

export const SortBottomSheet: React.FC<SortBottomSheetProps> = ({
  visible,
  onClose,
  selectedSort,
  onSelectSort,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <ArrowDownUp size={18} color="#15803D" />
                  <Text style={styles.title}>Sort Invoices</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsList}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = selectedSort === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectSort(option.key);
                        onClose();
                      }}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {isSelected && <Check size={18} color="#22C55E" strokeWidth={2.5} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    paddingTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  optionRowSelected: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderBottomColor: 'transparent',
  },
  optionText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#15803D',
    fontWeight: '700',
  },
});
