import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Icon appears with scale + fade
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Title slides up + fades in
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(600),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative background shapes */}
      <View style={styles.bgShapeTopRight} />
      <View style={styles.bgShapeBottomLeft} />
      <View style={styles.bgShapeCenter} />

      <View style={styles.content}>
        {/* Animated invoice icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <View style={styles.iconDocument}>
            <View style={styles.iconDocumentInner}>
              {/* Document lines */}
              <View style={styles.iconLine1} />
              <View style={styles.iconLine2} />
              <View style={styles.iconLine3} />
              {/* Green checkmark circle */}
              <View style={styles.checkCircle}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.appNameBold}>Quick Invoice Maker</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: taglineOpacity, marginTop: 8 }}>
          <Text style={styles.tagline}>Create Professional Invoices in Seconds</Text>
        </Animated.View>
      </View>

      {/* Bottom branding */}
      <Animated.View style={[styles.bottomBrand, { opacity: taglineOpacity }]}>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v1.0 • Offline First</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Background decorative shapes
  bgShapeTopRight: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#ECFDF5',
    opacity: 0.8,
  },
  bgShapeBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#F0FDF4',
    opacity: 0.8,
  },
  bgShapeCenter: {
    position: 'absolute',
    top: height * 0.15,
    left: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ECFDF5',
    opacity: 0.6,
  },

  // Icon
  iconContainer: {
    marginBottom: 32,
  },
  iconDocument: {
    width: 104,
    height: 124,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  iconDocumentInner: {
    width: '100%',
    alignItems: 'flex-start',
  },
  iconLine1: {
    width: '80%',
    height: 6,
    backgroundColor: '#A7F3D0',
    borderRadius: 3,
    marginBottom: 10,
  },
  iconLine2: {
    width: '60%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 10,
  },
  iconLine3: {
    width: '70%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  checkCircle: {
    position: 'absolute',
    bottom: -8,
    right: -12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  appNameBold: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  // Bottom
  bottomBrand: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  versionBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
});

