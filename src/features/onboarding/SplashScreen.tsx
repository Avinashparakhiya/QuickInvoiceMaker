import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const splashScale = useRef(new Animated.Value(0.85)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Splash image smoothly appears and scales to full size
      Animated.parallel([
        Animated.spring(splashScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(splashOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 2. Footer fades in
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      // 3. Display duration
      Animated.delay(1200),
    ]).start(() => {
      onFinish();
    });
  }, []);

  const imageSize = Math.min(width * 0.82, 380);

  return (
    <View style={styles.container}>
      {/* Decorative ambient background glows */}
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      {/* Centered Splash Image */}
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            opacity: splashOpacity,
            transform: [{ scale: splashScale }],
          },
        ]}
      >
        <Image
          source={require('../../../assets/splash-icon.png')}
          style={{ width: imageSize, height: imageSize }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Bottom Version Pill */}
      <Animated.View style={[styles.bottomBrand, { opacity: footerOpacity }]}>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>⚡ Quick Invoice Maker • Fast & Offline</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgGlowTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#ECFDF5',
    opacity: 0.7,
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#F0FDF4',
    opacity: 0.7,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBrand: {
    position: 'absolute',
    bottom: 36,
    alignItems: 'center',
  },
  versionBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.2,
  },
});
