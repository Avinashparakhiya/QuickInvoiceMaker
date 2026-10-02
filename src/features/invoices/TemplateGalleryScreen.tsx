import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Palette, Sparkles, Sliders, Eye } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useOrgStore } from '../../store/useOrgStore';
import { orgRepository } from '../../database/repositories/orgRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';
import { TemplateId } from '../../types';

interface TemplateItem {
  id: TemplateId;
  name: string;
  category: 'Modern' | 'Classic' | 'Professional';
  accentColor: string;
  headerStyle: 'solid' | 'minimal' | 'card' | 'navy' | 'bold' | 'serif' | 'receipt' | 'sage';
  description: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'classic_green',
    name: 'Modern 1',
    category: 'Modern',
    accentColor: '#22C55E',
    headerStyle: 'solid',
    description: 'Clean emerald banner with modern typography',
  },
  {
    id: 'minimal_slate',
    name: 'Modern 2',
    category: 'Modern',
    accentColor: '#475569',
    headerStyle: 'minimal',
    description: 'Ultra minimal thin slate lines & clean white layout',
  },
  {
    id: 'modern_card',
    name: 'Classic 1',
    category: 'Classic',
    accentColor: '#0284C7',
    headerStyle: 'card',
    description: 'Elevated card blocks with soft rounded corners',
  },
  {
    id: 'business_pro',
    name: 'Classic 2',
    category: 'Classic',
    accentColor: '#1E293B',
    headerStyle: 'navy',
    description: 'Corporate deep navy banner for enterprise billing',
  },
  {
    id: 'gst_india',
    name: 'Professional 1',
    category: 'Professional',
    accentColor: '#15803D',
    headerStyle: 'solid',
    description: 'Indian GST / Tax invoice with HSN & CGST/SGST columns',
  },
  {
    id: 'service_detailed',
    name: 'Professional 2',
    category: 'Professional',
    accentColor: '#6D28D9',
    headerStyle: 'minimal',
    description: 'Hourly rates and detailed service description layout',
  },
  {
    id: 'retail_compact',
    name: 'Minimal',
    category: 'Modern',
    accentColor: '#0F172A',
    headerStyle: 'minimal',
    description: 'Dense items table with SKU and unit pricing',
  },
  {
    id: 'freelancer_chic',
    name: 'Business',
    category: 'Classic',
    accentColor: '#059669',
    headerStyle: 'card',
    description: 'Freelancer portfolio style with branding showcase',
  },
  {
    id: 'editorial_serif',
    name: 'Colorful',
    category: 'Modern',
    accentColor: '#E11D48',
    headerStyle: 'serif',
    description: 'Luxury editorial serif style with double line borders',
  },
  {
    id: 'bold_contrast',
    name: 'Bold Contrast',
    category: 'Professional',
    accentColor: '#000000',
    headerStyle: 'bold',
    description: 'High contrast dark header with sharp green accents',
  },
  {
    id: 'receipt_slip',
    name: 'Thermal Slip',
    category: 'Professional',
    accentColor: '#334155',
    headerStyle: 'receipt',
    description: 'Compact thermal receipt format with clean divider lines',
  },
  {
    id: 'simple_sage',
    name: 'Simple Sage',
    category: 'Modern',
    accentColor: '#10B981',
    headerStyle: 'sage',
    description: 'Soft sage green background for everyday trades',
  },
];

export const TemplateGalleryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { activeOrg, updateOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Modern' | 'Classic' | 'Professional'>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    route.params?.currentTemplateId || activeOrg?.defaultTemplateId || 'classic_green'
  );
  const [saving, setSaving] = useState(false);

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    if (selectedCategory === 'All') return true;
    return tpl.category === selectedCategory;
  });

  const handleSelectTemplate = (id: TemplateId) => {
    setSelectedTemplate(id);
    if (route.params?.onSelectTemplate) {
      route.params.onSelectTemplate(id);
    }
  };

  const handleSaveAsDefault = async () => {
    if (!activeOrg) return;
    setSaving(true);
    try {
      await updateOrg(activeOrg.id, {
        defaultTemplateId: selectedTemplate,
      });
      Alert.alert(
        'Default Template Updated',
        `All new invoices for "${activeOrg.displayName || activeOrg.name}" will use this template.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save default template.');
    } finally {
      setSaving(false);
    }
  };

  const renderThumbnail = (item: TemplateItem) => {
    return (
      <View style={styles.paperThumbnail}>
        {/* Header simulation */}
        {item.headerStyle === 'solid' && (
          <View style={[styles.thumbHeaderSolid, { backgroundColor: item.accentColor }]}>
            <View style={styles.thumbWhiteDot} />
            <View style={styles.thumbWhiteBar} />
          </View>
        )}
        {item.headerStyle === 'navy' && (
          <View style={[styles.thumbHeaderSolid, { backgroundColor: '#1E293B' }]}>
            <View style={styles.thumbWhiteDot} />
            <View style={styles.thumbWhiteBar} />
          </View>
        )}
        {item.headerStyle === 'minimal' && (
          <View style={styles.thumbHeaderMinimal}>
            <View style={[styles.thumbColorDot, { backgroundColor: item.accentColor }]} />
            <View style={styles.thumbSlateBar} />
          </View>
        )}
        {item.headerStyle === 'card' && (
          <View style={styles.thumbHeaderCard}>
            <View style={[styles.thumbCardBox, { borderColor: item.accentColor }]} />
          </View>
        )}
        {item.headerStyle === 'bold' && (
          <View style={[styles.thumbHeaderSolid, { backgroundColor: '#000000' }]}>
            <View style={[styles.thumbColorDot, { backgroundColor: '#22C55E' }]} />
            <View style={styles.thumbWhiteBar} />
          </View>
        )}
        {item.headerStyle === 'serif' && (
          <View style={styles.thumbHeaderSerif}>
            <View style={[styles.thumbSerifLine, { borderColor: item.accentColor }]} />
          </View>
        )}
        {item.headerStyle === 'receipt' && (
          <View style={styles.thumbHeaderReceipt}>
            <View style={styles.thumbCenterDot} />
            <View style={styles.thumbCenterBar} />
          </View>
        )}
        {item.headerStyle === 'sage' && (
          <View style={[styles.thumbHeaderSolid, { backgroundColor: '#059669' }]}>
            <View style={styles.thumbWhiteDot} />
            <View style={styles.thumbWhiteBar} />
          </View>
        )}

        {/* Paper Body simulation */}
        <View style={styles.thumbBody}>
          <View style={styles.thumbMetaRow}>
            <View style={styles.thumbLineShort} />
            <View style={styles.thumbLineShort} />
          </View>

          {/* Table rows */}
          <View style={styles.thumbTable}>
            <View style={styles.thumbTableHeader} />
            <View style={styles.thumbTableRow} />
            <View style={styles.thumbTableRow} />
            <View style={styles.thumbTableRow} />
          </View>

          {/* Total row */}
          <View style={styles.thumbTotalRow}>
            <View style={styles.thumbLineTiny} />
            <View style={[styles.thumbTotalVal, { backgroundColor: item.accentColor }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Select Template"
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Category Tabs */}
      <View style={[styles.categoryBar, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
        {(['All', 'Modern', 'Classic', 'Professional'] as const).map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryTab,
                isSelected && styles.categoryTabActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2-Column Template Grid */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.listContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedTemplate === item.id;

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectTemplate(item.id)}
              style={[
                styles.templateCard,
                isSelected && styles.templateCardSelected,
              ]}
            >
              {/* Top Check Badge when selected */}
              {isSelected ? (
                <View style={styles.checkBadge}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3.5} />
                </View>
              ) : null}

              {/* Realistic Paper Thumbnail */}
              {renderThumbnail(item)}

              {/* Template Label */}
              <View style={styles.labelContainer}>
                <Text numberOfLines={1} style={[styles.templateName, isSelected && styles.templateNameSelected]}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Bottom Save CTA Bar */}
      <View style={[styles.bottomBar, { maxWidth: Math.min(contentMaxWidth, 800), alignSelf: 'center', width: '100%' }]}>
        <Button
          title={`Set "${TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'Template'}" as Default`}
          onPress={handleSaveAsDefault}
          loading={saving}
          icon={<Check size={18} color="#FFFFFF" strokeWidth={3} />}
          style={styles.saveBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  templateCard: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  templateCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  paperThumbnail: {
    width: '100%',
    height: 140,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  thumbHeaderSolid: {
    height: 28,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  thumbWhiteDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  thumbWhiteBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  thumbHeaderMinimal: {
    height: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thumbColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  thumbSlateBar: {
    width: 36,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
  },
  thumbHeaderCard: {
    height: 24,
    padding: 4,
  },
  thumbCardBox: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
  },
  thumbHeaderSerif: {
    height: 22,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  thumbSerifLine: {
    width: '100%',
    borderBottomWidth: 1.5,
  },
  thumbHeaderReceipt: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thumbCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#475569',
    marginBottom: 2,
  },
  thumbCenterBar: {
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  thumbBody: {
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  thumbMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  thumbLineShort: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  thumbTable: {
    gap: 3,
  },
  thumbTableHeader: {
    width: '100%',
    height: 5,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 2,
  },
  thumbTableRow: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F1F5F9',
  },
  thumbTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  thumbLineTiny: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  thumbTotalVal: {
    width: 28,
    height: 6,
    borderRadius: 2,
  },
  labelContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  templateName: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  templateNameSelected: {
    color: '#15803D',
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtn: {
    width: '100%',
  },
});
