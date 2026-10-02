import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FileSpreadsheet, Share2 } from 'lucide-react-native';

interface ExportButtonsStripProps {
  onExportCsv: () => void;
  onExportPdf: () => void;
  exporting?: boolean;
}

export const ExportButtonsStrip: React.FC<ExportButtonsStripProps> = ({
  onExportCsv,
  onExportPdf,
  exporting = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Export CSV Button */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onExportCsv}
        disabled={exporting}
        style={[styles.button, styles.csvButton]}
      >
        {exporting ? (
          <ActivityIndicator size="small" color="#15803D" />
        ) : (
          <>
            <FileSpreadsheet size={17} color="#15803D" strokeWidth={2.2} />
            <Text style={styles.csvButtonText}>Export CSV</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Statement PDF Button */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onExportPdf}
        disabled={exporting}
        style={[styles.button, styles.pdfButton]}
      >
        {exporting ? (
          <ActivityIndicator size="small" color="#15803D" />
        ) : (
          <>
            <Share2 size={17} color="#15803D" strokeWidth={2.2} />
            <Text style={styles.pdfButtonText}>Statement PDF</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  csvButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  csvButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: -0.1,
  },
  pdfButton: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  pdfButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: -0.1,
  },
});
