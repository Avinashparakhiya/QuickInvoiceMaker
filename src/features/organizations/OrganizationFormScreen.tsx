import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useOrgStore } from '../../store/useOrgStore';
import { orgRepository } from '../../database/repositories/orgRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Organization } from '../../types';

export const OrganizationFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const organizationId = route.params?.organizationId;

  const { createOrg, updateOrg } = useOrgStore();

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [taxId, setTaxId] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfscSwift, setBankIfscSwift] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadOrgData(organizationId);
    }
  }, [organizationId]);

  const loadOrgData = async (id: string) => {
    const org = await orgRepository.getById(id);
    if (org) {
      setName(org.name);
      setDisplayName(org.displayName || '');
      setEmail(org.email || '');
      setPhone(org.phone || '');
      setWebsite(org.website || '');
      setStreet(org.addressStreet || '');
      setCity(org.addressCity || '');
      setState(org.addressState || '');
      setZip(org.addressZip || '');
      setCountry(org.addressCountry || 'United States');
      setTaxId(org.taxId || '');
      setCurrencySymbol(org.currencySymbol);
      setCurrencyCode(org.currencyCode);
      setInvoicePrefix(org.invoicePrefix);
      setBankName(org.bankName || '');
      setBankAccountNo(org.bankAccountNo || '');
      setBankIfscSwift(org.bankIfscSwift || '');
      setUpiVpa(org.upiVpa || '');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your business or legal name.');
      return;
    }

    setLoading(true);
    try {
      if (organizationId) {
        await updateOrg(organizationId, {
          name,
          displayName: displayName || name,
          email,
          phone,
          website,
          addressStreet: street,
          addressCity: city,
          addressState: state,
          addressZip: zip,
          addressCountry: country,
          taxId,
          currencySymbol,
          currencyCode,
          invoicePrefix,
          bankName,
          bankAccountNo,
          bankIfscSwift,
          upiVpa,
        });
      } else {
        const newId = `org-${Date.now()}`;
        await createOrg({
          id: newId,
          name,
          displayName: displayName || name,
          email,
          phone,
          website,
          addressStreet: street,
          addressCity: city,
          addressState: state,
          addressZip: zip,
          addressCountry: country,
          taxId,
          taxEnabled: true,
          taxType: 'EXCLUSIVE',
          currencyCode,
          currencySymbol,
          currencyPosition: 'BEFORE',
          decimalPlaces: 2,
          invoicePrefix,
          invoiceNextNumber: 1001,
          invoicePadding: 4,
          estimatePrefix: 'EST-',
          estimateNextNumber: 101,
          defaultPaymentTerms: 'NET_30',
          defaultTemplateId: 'classic_green',
          bankName,
          bankAccountNo,
          bankIfscSwift,
          upiVpa,
          isActive: true,
        });
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save business profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title={organizationId ? 'Edit Business Profile' : 'New Business Profile'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Business Identity */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Business Identity</Text>
          <Input
            label="Legal / Business Name"
            placeholder="e.g. Apex Creative Studio"
            value={name}
            onChangeText={setName}
            required
          />
          <Input
            label="Display / Trade Name"
            placeholder="e.g. Apex Studio"
            value={displayName}
            onChangeText={setDisplayName}
            hint="Short name used on header and badges"
          />
          <Input
            label="Tax / GST Number"
            placeholder="e.g. US-TAX-892144 or 27AAAAA0000A1Z5"
            value={taxId}
            onChangeText={setTaxId}
          />
        </Card>

        {/* Contact Details */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Contact Details</Text>
          <Input
            label="Billing Email"
            placeholder="billing@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Website"
            placeholder="www.company.com"
            value={website}
            onChangeText={setWebsite}
          />
        </Card>

        {/* Address */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Business Address</Text>
          <Input
            label="Street Address"
            placeholder="123 Main St, Suite 100"
            value={street}
            onChangeText={setStreet}
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="City"
                placeholder="San Francisco"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.col}>
              <Input
                label="State / Province"
                placeholder="CA"
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Postal / Zip Code"
                placeholder="94107"
                value={zip}
                onChangeText={setZip}
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.col}>
              <Input
                label="Country"
                placeholder="United States"
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>
        </Card>

        {/* Invoicing & Bank Details */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Currency & Banking</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Currency Symbol"
                placeholder="$"
                value={currencySymbol}
                onChangeText={setCurrencySymbol}
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.col}>
              <Input
                label="Invoice Prefix"
                placeholder="INV-"
                value={invoicePrefix}
                onChangeText={setInvoicePrefix}
              />
            </View>
          </View>
          <Input
            label="UPI ID / VPA (Optional)"
            placeholder="username@upi / business@bank"
            value={upiVpa}
            onChangeText={setUpiVpa}
            hint="Used to generate instant UPI QR code on invoice"
          />
          <Input
            label="Bank Name"
            placeholder="Silicon Valley Bank"
            value={bankName}
            onChangeText={setBankName}
          />
          <Input
            label="Account Number / IBAN"
            placeholder="9876543210"
            value={bankAccountNo}
            onChangeText={setBankAccountNo}
          />
        </Card>

        <Button
          title={organizationId ? 'Update Business Profile' : 'Save Business Profile'}
          onPress={handleSave}
          loading={loading}
          size="lg"
          fullWidth
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  gap: {
    width: 12,
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
});
