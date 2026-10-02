import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { FileText, Building2, Zap, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingPage {
  id: string;
  icon: React.ReactNode;
  bgColor: string;
  iconBgColor: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
}

const pages: OnboardingPage[] = [
  {
    id: 'welcome',
    icon: <FileText size={48} color="#22C55E" strokeWidth={1.5} />,
    bgColor: '#FFFFFF',
    iconBgColor: '#DCFCE7',
    title: 'Create & Send Invoices',
    titleHighlight: 'with Ease',
    subtitle:
      'Professional invoices in under 60 seconds. 12 beautiful templates, instant PDF generation, and one-tap sharing.',
  },
  {
    id: 'organizations',
    icon: <Building2 size={48} color="#22C55E" strokeWidth={1.5} />,
    bgColor: '#FFFFFF',
    iconBgColor: '#F0FDF4',
    title: 'Manage Multiple',
    titleHighlight: 'Businesses',
    subtitle:
      'Switch between organizations seamlessly. Each business gets its own customers, invoices, templates, and financial reports.',
  },
  {
    id: 'speed',
    icon: <Zap size={48} color="#22C55E" strokeWidth={1.5} />,
    bgColor: '#FFFFFF',
    iconBgColor: '#DCFCE7',
    title: 'Fast. Simple.',
    titleHighlight: 'Professional.',
    subtitle:
      'Track payments, send reminders, export reports, and manage expenses — all offline, all on your device.',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dotAnimations = useRef(pages.map(() => new Animated.Value(0))).current;

  // Animate the active dot
  React.useEffect(() => {
    dotAnimations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === activeIndex ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
  }, [activeIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < pages.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < pages.length - 1) {
      scrollRef.current?.scrollTo({
        x: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else {
      onComplete();
    }
  };

  const isLastPage = activeIndex === pages.length - 1;

  return (
    <View style={styles.container}>
      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
        bounces={false}
      >
        {pages.map((page) => (
          <View key={page.id} style={[styles.page, { width: SCREEN_WIDTH }]}>
            {/* Illustration area */}
            <View style={styles.illustrationArea}>
              <View style={styles.bgCircleOuter}>
                <View style={styles.bgCircleInner}>
                  <View style={[styles.iconCircle, { backgroundColor: page.iconBgColor }]}>
                    {page.icon}
                  </View>
                </View>
              </View>

              {/* Floating decorative elements */}
              <View style={styles.floatingDoc1}>
                <View style={styles.miniDocLine} />
                <View style={[styles.miniDocLine, { width: 16 }]} />
              </View>
              <View style={styles.floatingDoc2}>
                <View style={styles.miniDocLine} />
                <View style={[styles.miniDocLine, { width: 12 }]} />
                <View style={[styles.miniDocLine, { width: 18 }]} />
              </View>
            </View>

            {/* Text content */}
            <View style={styles.textContent}>
              <Text style={styles.pageTitle}>
                {page.title}{'\n'}
                <Text style={styles.pageTitleHighlight}>{page.titleHighlight}</Text>
              </Text>
              <Text style={styles.pageSubtitle}>Fast. Simple. Professional.</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Dot indicators */}
        <View style={styles.dotsContainer}>
          {pages.map((_, i) => {
            const dotWidth = dotAnimations[i].interpolate({
              inputRange: [0, 1],
              outputRange: [8, 24],
            });
            const dotOpacity = dotAnimations[i].interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onComplete}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Skip button below */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onComplete}
          style={styles.skipButtonBottom}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButtonBottom: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  carousel: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Illustration
  illustrationArea: {
    alignItems: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  bgCircleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },

  // Floating decorative mini documents
  floatingDoc1: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 36,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingDoc2: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    width: 40,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  miniDocLine: {
    width: 20,
    height: 3,
    backgroundColor: '#DCFCE7',
    borderRadius: 2,
  },

  // Text
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  pageTitleHighlight: {
    color: '#22C55E',
  },
  pageSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },

  // Bottom controls
  bottomControls: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#22C55E',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
