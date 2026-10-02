import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  User,
  Building,
  Mail,
  Phone,
  FileText,
  MapPin,
  Check,
  AlignLeft,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useOrgStore } from '../../store/useOrgStore';
import { customerRepository } from '../../database/repositories/customerRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useResponsive } from '../../utils/useResponsive';

export const CustomerFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const customerId = route.params?.customerId;
  const { activeOrg } = useOrgStore();
  const { contentMaxWidth } = useResponsive();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [taxId, setTaxId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadCustomer(customerId);
    }
  }, [customerId]);

  const loadCustomer = async (id: string) => {
    const cust = await customerRepository.getById(id);
    if (cust) {
      setName(cust.name);
      setCompanyName(cust.companyName || '');
      setEmail(cust.email || '');
      setPhone(cust.phone || '');
      setStreet(cust.billingStreet || '');
      setCity(cust.billingCity || '');
      setState(cust.billingState || '');
      setZip(cust.billingZip || '');
      setCountry(cust.billingCountry || 'United States');
      setTaxId(cust.taxId || '');
      setNotes(cust.notes || '');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter contact or customer name.');
      return;
    }
    if (!activeOrg) {
      Alert.alert('Error', 'No active business profile selected.');
      return;
    }

    setLoading(true);
    try {
      if (customerId) {
        await customerRepository.update(customerId, {
          name: name.trim(),
          companyName: companyName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          billingStreet: street.trim() || undefined,
          billingCity: city.trim() || undefined,
          billingState: state.trim() || undefined,
          billingZip: zip.trim() || undefined,
          billingCountry: country.trim() || undefined,
          taxId: taxId.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        const newId = `cust-${Date.now()}`;
        await customerRepository.create({
          id: newId,
          organizationId: activeOrg.id,
          name: name.trim(),
          companyName: companyName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          billingStreet: street.trim() || undefined,
          billingCity: city.trim() || undefined,
          billingState: state.trim() || undefined,
          billingZip: zip.trim() || undefined,
          billingCountry: country.trim() || undefined,
          taxId: taxId.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save customer.');
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
        title={customerId ? 'Edit Customer' : 'New Customer'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* Card 1: Contact Information */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <User size={16} color="#15803D" />
            </View>
            <Text style={styles.cardTitle}>Contact Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Person Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. John Doe"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Name (Optional)</Text>
            <TextInput
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Acme Corporation LLC"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={styles.textInput}
            />
          </View>
        </View>

        {/* Card 2: Tax & Business Details */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <FileText size={16} color="#B45309" />
            </View>
            <Text style={styles.cardTitle}>Tax Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tax ID / GSTIN / VAT Number</Text>
            <TextInput
              value={taxId}
              onChangeText={setTaxId}
              placeholder="e.g. GSTIN123456789"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>
        </View>

        {/* Card 3: Billing Address */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <MapPin size={16} color="#0369A1" />
            </View>
            <Text style={styles.cardTitle}>Billing Address</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Street Address</Text>
            <TextInput
              value={street}
              onChangeText={setStreet}
              placeholder="456 Park Avenue, Suite 100"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="New York"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.inputLabel}>State / Province</Text>
              <TextInput
                value={state}
                onChangeText={setState}
                placeholder="NY"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Postal / Zip Code</Text>
              <TextInput
                value={zip}
                onChangeText={setZip}
                placeholder="10001"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                value={country}
                onChangeText={setCountry}
                placeholder="United States"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />
            </View>
          </View>
        </View>

        {/* Card 4: Notes */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
              <AlignLeft size={16} color="#6D28D9" />
            </View>
            <Text style={styles.cardTitle}>Internal Notes</Text>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add client preferences, payment terms or delivery notes..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={[styles.textInput, { minHeight: 70, textAlignVertical: 'top' }]}
            />
          </View>
        </View>

        {/* Save Button */}
        <Button
          title={customerId ? 'Update Customer' : 'Save Customer'}
          onPress={handleSave}
          loading={loading}
          icon={<Check size={18} color="#FFFFFF" strokeWidth={3} />}
          size="lg"
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 13,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtn: {
    width: '100%',
    marginTop: 4,
    marginBottom: 24,
  },
});
