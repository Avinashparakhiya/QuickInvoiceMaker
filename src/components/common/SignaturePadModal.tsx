import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  Platform,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { X, RotateCcw, Trash2, Check, PenTool } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Button } from './Button';

interface SignaturePadModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signatureDataUri: string) => void;
  title?: string;
  initialSignature?: string;
}

interface Stroke {
  path: string;
  color: string;
  width: number;
}

const COLOR_OPTIONS = [
  { label: 'Black', value: '#0F172A' },
  { label: 'Navy Blue', value: '#1E3A8A' },
  { label: 'Emerald Green', value: '#15803D' },
];

const STROKE_WIDTH_OPTIONS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 3.5 },
  { label: 'Bold', value: 5 },
];

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  visible,
  onClose,
  onSave,
  title = 'Digital Signature Pad',
}) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#0F172A');
  const [strokeWidth, setStrokeWidth] = useState<number>(3.5);
  const [canvasLayout, setCanvasLayout] = useState({ width: 340, height: 200 });

  const currentPathRef = useRef<string>('');
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        pointsRef.current = [{ x: locationX, y: locationY }];
        const startPath = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        currentPathRef.current = startPath;
        setCurrentPath(startPath);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        pointsRef.current.push({ x: locationX, y: locationY });

        // Build quadratic bezier curves for smoothness
        const pts = pointsRef.current;
        if (pts.length > 2) {
          const p1 = pts[pts.length - 2];
          const p2 = pts[pts.length - 1];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const newSegment = ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
          currentPathRef.current += newSegment;
          setCurrentPath(currentPathRef.current);
        } else {
          currentPathRef.current += ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
          setCurrentPath(currentPathRef.current);
        }
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current) {
          setStrokes((prev) => [
            ...prev,
            {
              path: currentPathRef.current,
              color: selectedColor,
              width: strokeWidth,
            },
          ]);
          currentPathRef.current = '';
          setCurrentPath('');
          pointsRef.current = [];
        }
      },
    })
  ).current;

  const handleClear = () => {
    setStrokes([]);
    setCurrentPath('');
    currentPathRef.current = '';
    pointsRef.current = [];
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleSaveSignature = () => {
    if (strokes.length === 0 && !currentPath) {
      Alert.alert('Empty Signature', 'Please draw your signature before saving.');
      return;
    }

    // Build SVG document
    const pathsSvg = strokes
      .map(
        (s) =>
          `<path d="${s.path}" stroke="${s.color}" stroke-width="${s.width}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
      )
      .join('');

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasLayout.width} ${canvasLayout.height}" width="${canvasLayout.width}" height="${canvasLayout.height}">${pathsSvg}</svg>`;

    // Encode to data URI
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    onSave(dataUri);
    handleClear();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <PenTool size={18} color={colors.primaryDarker} />
              </View>
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Draw your signature inside the box using your finger or stylus.
          </Text>

          {/* Color & Width Controls */}
          <View style={styles.toolbar}>
            <View style={styles.colorGroup}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => setSelectedColor(c.value)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c.value },
                    selectedColor === c.value && styles.colorOptionSelected,
                  ]}
                />
              ))}
            </View>

            <View style={styles.widthGroup}>
              {STROKE_WIDTH_OPTIONS.map((w) => (
                <TouchableOpacity
                  key={w.label}
                  onPress={() => setStrokeWidth(w.value)}
                  style={[
                    styles.widthOption,
                    strokeWidth === w.value && styles.widthOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.widthOptionText,
                      strokeWidth === w.value && styles.widthOptionTextSelected,
                    ]}
                  >
                    {w.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Drawing Canvas */}
          <View
            style={styles.canvasContainer}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setCanvasLayout({ width: Math.round(width), height: Math.round(height) });
            }}
            {...panResponder.panHandlers}
          >
            <Svg style={StyleSheet.absoluteFill}>
              {strokes.map((stroke, index) => (
                <Path
                  key={index}
                  d={stroke.path}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              {currentPath ? (
                <Path
                  d={currentPath}
                  stroke={selectedColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ) : null}
            </Svg>

            {/* Signature Guideline */}
            <View style={styles.signLineBox}>
              <View style={styles.signLine} />
              <Text style={styles.signLineText}>Sign Above This Line</Text>
            </View>
          </View>

          {/* Canvas Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleUndo}
              disabled={strokes.length === 0}
              style={[styles.smallBtn, strokes.length === 0 && styles.smallBtnDisabled]}
            >
              <RotateCcw size={15} color={strokes.length === 0 ? colors.textMuted : colors.textSecondary} />
              <Text style={[styles.smallBtnText, strokes.length === 0 && styles.smallBtnTextDisabled]}>
                Undo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClear}
              disabled={strokes.length === 0}
              style={[styles.smallBtn, strokes.length === 0 && styles.smallBtnDisabled]}
            >
              <Trash2 size={15} color={strokes.length === 0 ? colors.textMuted : colors.danger} />
              <Text style={[styles.smallBtnText, strokes.length === 0 ? styles.smallBtnTextDisabled : { color: colors.danger }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Save / Cancel */}
          <View style={styles.footerRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Apply Signature"
              onPress={handleSaveSignature}
              icon={<Check size={18} color="#FFFFFF" strokeWidth={2.5} />}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorOption: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  colorOptionSelected: {
    borderColor: colors.primary,
    transform: [{ scale: 1.15 }],
  },
  widthGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  widthOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  widthOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  widthOptionText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  widthOptionTextSelected: {
    color: '#FFFFFF',
  },
  canvasContainer: {
    height: 200,
    backgroundColor: '#FAFBFD',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  signLineBox: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  signLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 4,
  },
  signLineText: {
    ...typography.micro,
    color: '#94A3B8',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smallBtnDisabled: {
    opacity: 0.5,
  },
  smallBtnText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  smallBtnTextDisabled: {
    color: colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
  },
});
