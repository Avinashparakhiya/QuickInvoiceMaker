import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { colors } from '../../theme/colors';

/**
 * Global background image asset reference.
 * Any change to assets/background.png will instantly update across all screens in the app.
 */
export const APP_BACKGROUND_IMAGE = require('../../../assets/background.png');

interface AmbientBackgroundProps {
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

/**
 * AmbientBackground renders the background asset directly from assets/background.png.
 * Configured with pointerEvents="none" and zIndex: -1 so touch/scrolling is never blocked.
 */
export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  style,
  imageStyle,
  resizeMode = 'cover',
}) => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.ambientWrapper, style]} pointerEvents="none">
      <Image
        source={APP_BACKGROUND_IMAGE}
        style={[StyleSheet.absoluteFillObject, styles.bgImage, imageStyle]}
        resizeMode={resizeMode}
      />
    </View>
  );
};

interface ScreenBackgroundProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * ScreenBackground wraps a screen container with the asset-based background.
 */
export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ style, children }) => {
  return (
    <View style={[styles.container, style]}>
      <AmbientBackground />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F8FAF9',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
});
