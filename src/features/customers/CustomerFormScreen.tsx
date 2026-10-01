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
import { customerRepository } from '../../database/repositories/customerRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export const CustomerFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const customerId = route.params?.customerId;
  const { activeOrg } = useOrgStore();

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
      Alert.alert('Required Field', 'Please enter customer or contact name.');
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
          name,
          companyName,
          email,
          phone,
          billingStreet: street,
          billingCity: city,
          billingState: state,
          billingZip: zip,
          billingCountry: country,
          taxId,
          notes,
        });
      } else {
        const newId = `cust-${Date.now()}`;
        await customerRepository.create({
          id: newId,
          organizationId: activeOrg.id,
          name,
          companyName,
          email,
          phone,
          billingStreet: street,
          billingCity: city,
          billingState: state,
          billingZip: zip,
          billingCountry: country,
          taxId,
          notes,
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Basic Information</Text>
          <Input
            label="Contact Person Name"
            placeholder="e.g. John Doe"
            value={name}
            onChangeText={setName}
            required
          />
          <Input
            label="Company Name (Optional)"
            placeholder="e.g. Acme Corporation"
            value={companyName}
            onChangeText={setCompanyName}
          />
          <Input
            label="Email Address"
            placeholder="john@company.com"
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
            label="Tax / GST Number"
            placeholder="e.g. TAX-ID-99"
            value={taxId}
            onChangeText={setTaxId}
          />
        </Card>

        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Billing Address</Text>
          <Input
            label="Street Address"
            placeholder="456 Park Avenue"
            value={street}
            onChangeText={setStreet}
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="City"
                placeholder="New York"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={styles.gap} />
            <View style={styles.col}>
              <Input
                label="State"
                placeholder="NY"
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Input
                label="Postal / Zip Code"
                placeholder="10001"
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

        <Button
          title={customerId ? 'Update Customer' : 'Save Customer'}
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
