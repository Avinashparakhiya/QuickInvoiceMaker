import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { SvgXml } from 'react-native-svg';
import { PenTool, Trash2, Check, RefreshCw, Stamp, ShieldCheck } from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { SignaturePadModal } from '../../components/common/SignaturePadModal';
import { useOrgStore } from '../../store/useOrgStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';

export const SignatureSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg, updateOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [signatureUri, setSignatureUri] = useState<string | undefined>(activeOrg?.signatureUri);
  const [signatoryName, setSignatoryName] = useState<string>(
    activeOrg?.displayName || activeOrg?.name || 'Authorized Signatory'
  );
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Authorized Signatory');
  const [includeByDefault, setIncludeByDefault] = useState<boolean>(true);
  const [padModalVisible, setPadModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveSignature = (dataUri: string) => {
    setSignatureUri(dataUri);
  };

  const handleClearSignature = () => {
    Alert.alert('Remove Signature', 'Are you sure you want to remove the saved signature?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setSignatureUri(undefined),
      },
    ]);
  };

  const handleSaveSettings = async () => {
    if (!activeOrg) return;
    setSaving(true);
    try {
      await updateOrg(activeOrg.id, {
        signatureUri: signatureUri || undefined,
      });
      Alert.alert('Signature Saved', 'Digital signature and signatory preferences updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save signature settings.');
    } finally {
      setSaving(false);
    }
  };

  const renderSignaturePreview = () => {
    if (!signatureUri) {
      return (
        <View style={styles.emptySignBox}>
          <PenTool size={32} color={colors.textMuted} />
          <Text style={styles.emptySignText}>No digital signature configured yet.</Text>
          <Text style={styles.emptySignSub}>
            Draw your signature to embed it automatically into all client PDF invoices.
          </Text>
        </View>
      );
    }

    if (signatureUri.startsWith('data:image/svg+xml')) {
      const decodedSvg = decodeURIComponent(signatureUri.replace('data:image/svg+xml;utf8,', ''));
      return (
        <View style={styles.signaturePreviewBox}>
          <SvgXml xml={decodedSvg} width="100%" height={110} />
        </View>
      );
    }

    return (
      <View style={styles.signaturePreviewBox}>
        <Image source={{ uri: signatureUri }} style={styles.signatureImage} resizeMode="contain" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Digital Signature & Stamp"
        subtitle={`Workspace: ${activeOrg?.displayName || activeOrg?.name || 'Current'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <Card variant="softGreen" padding={16} style={styles.card}>
          <View style={styles.infoRow}>
            <ShieldCheck size={24} color={colors.primaryDarker} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoTitle}>Legally Binding Invoicing</Text>
              <Text style={styles.infoDesc}>
                Add your official handwritten signature to give client invoices and proposals a formal, verified appearance.
              </Text>
            </View>
          </View>
        </Card>

        {/* Current Signature Card */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Digital Signature</Text>
            {signatureUri ? (
              <TouchableOpacity onPress={handleClearSignature} style={styles.deleteIconBtn}>
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            ) : null}
          </View>

          {renderSignaturePreview()}

          <View style={styles.signBtnRow}>
            <Button
              title={signatureUri ? 'Redraw Signature' : '+ Draw Signature'}
              onPress={() => setPadModalVisible(true)}
              icon={<PenTool size={16} color="#FFFFFF" />}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Signatory Person Details */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Signatory Details</Text>
          <Input
            label="Authorized Signatory Name"
            placeholder="e.g. Sarah Jenkins"
            value={signatoryName}
            onChangeText={setSignatoryName}
            containerStyle={{ marginBottom: 12 }}
          />

          <Input
            label="Designation / Title"
            placeholder="e.g. Managing Director / Founder"
            value={signatoryTitle}
            onChangeText={setSignatoryTitle}
          />
        </Card>

        {/* Live Mock Invoice Signature Block */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionTitle}>Invoice Document Preview</Text>
          <Text style={styles.previewHint}>
            This is how your signature block will appear on PDF invoices and estimates:
          </Text>

          <View style={styles.mockInvoiceBox}>
            <View style={styles.mockSignBlock}>
              {signatureUri ? (
                signatureUri.startsWith('data:image/svg+xml') ? (
                  <SvgXml
                    xml={decodeURIComponent(signatureUri.replace('data:image/svg+xml;utf8,', ''))}
                    width={160}
                    height={60}
                  />
                ) : (
                  <Image source={{ uri: signatureUri }} style={{ width: 160, height: 60 }} resizeMode="contain" />
                )
              ) : (
                <View style={{ height: 40, justifyContent: 'center' }}>
                  <Text style={{ fontStyle: 'italic', color: '#94A3B8', fontSize: 12 }}>
                    [Signature Placeholder]
                  </Text>
                </View>
              )}
              <View style={styles.mockSignLine} />
              <Text style={styles.mockSignName}>{signatoryName || 'Authorized Signatory'}</Text>
              <Text style={styles.mockSignTitle}>{signatoryTitle || 'Designation'}</Text>
              <Text style={styles.mockSignOrg}>{activeOrg?.displayName || activeOrg?.name || 'Company Name'}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Sticky Save CTA */}
      <View style={[styles.footer, { maxWidth: Math.min(contentMaxWidth, 800), alignSelf: 'center', width: '100%' }]}>
        <Button
          title="Save Signature Preferences"
          onPress={handleSaveSettings}
          loading={saving}
          icon={<Check size={18} color="#FFFFFF" strokeWidth={3} />}
          fullWidth
          size="lg"
        />
      </View>

      {/* Signature Pad Modal */}
      <SignaturePadModal
        visible={padModalVisible}
        onClose={() => setPadModalVisible(false)}
        onSave={handleSaveSignature}
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
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDarker,
  },
  infoDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  deleteIconBtn: {
    padding: 6,
  },
  emptySignBox: {
    height: 120,
    backgroundColor: '#FAFBFD',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 12,
  },
  emptySignText: {
    ...typography.bodySemiBold,
    color: colors.text,
    marginTop: 6,
    fontSize: 13,
  },
  emptySignSub: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 2,
  },
  signaturePreviewBox: {
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 12,
  },
  signatureImage: {
    width: '100%',
    height: 100,
  },
  signBtnRow: {
    flexDirection: 'row',
  },
  previewHint: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  mockInvoiceBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    alignItems: 'flex-end',
  },
  mockSignBlock: {
    alignItems: 'center',
    minWidth: 180,
  },
  mockSignLine: {
    width: 160,
    height: 1.5,
    backgroundColor: '#0F172A',
    marginTop: 6,
    marginBottom: 4,
  },
  mockSignName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  mockSignTitle: {
    fontSize: 11,
    color: '#64748B',
  },
  mockSignOrg: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
