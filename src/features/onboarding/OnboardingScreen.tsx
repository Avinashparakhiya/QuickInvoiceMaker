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
import { FileText, Building2, Zap, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface OnboardingPage {
  id: string;
  icon: React.ReactNode;
  iconBgColor: string;
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
}

const pages: OnboardingPage[] = [
  {
    id: 'welcome',
    icon: <FileText size={44} color="#10B981" strokeWidth={1.8} />,
    iconBgColor: '#ECFDF5',
    badge: '⚡ ULTRA-FAST INVOICING',
    title: 'Create & Share Invoices',
    titleHighlight: 'in under 60 seconds',
    subtitle:
      'Craft stunning, client-ready PDF invoices with 12+ professional templates, automatic tax & discounts, and instant WhatsApp or Email dispatch.',
  },
  {
    id: 'organizations',
    icon: <Building2 size={44} color="#10B981" strokeWidth={1.8} />,
    iconBgColor: '#ECFDF5',
    badge: '🏢 MULTI-ORGANIZATION',
    title: 'Manage Multiple',
    titleHighlight: 'Businesses & Brands',
    subtitle:
      'Seamlessly switch between unlimited business entities. Each organization maintains its own logo, currency, numbering sequences, and tax rules.',
  },
  {
    id: 'speed',
    icon: <ShieldCheck size={44} color="#10B981" strokeWidth={1.8} />,
    iconBgColor: '#ECFDF5',
    badge: '🔒 100% PRIVATE & OFFLINE',
    title: 'Complete Financial Peace',
    titleHighlight: 'Without Cloud Lag',
    subtitle:
      'Your financial data stays securely on your device with high-performance SQLite storage. Track payments, credit notes, and export comprehensive audit reports.',
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
      {/* Top Bar with Skip */}
      <View style={styles.topBar}>
        <View style={styles.topBrand}>
          <Text style={styles.topBrandText}>Quick Invoice</Text>
        </View>
        {!isLastPage && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onComplete}
            style={styles.skipTopBtn}
          >
            <Text style={styles.skipTopText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

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
            </View>

            {/* Feature Badge */}
            <View style={styles.badgeWrapper}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{page.badge}</Text>
              </View>
            </View>

            {/* Text content */}
            <View style={styles.textContent}>
              <Text style={styles.pageTitle}>
                {page.title}{' '}
                <Text style={styles.pageTitleHighlight}>{page.titleHighlight}</Text>
              </Text>
              <Text style={styles.pageSubtitle}>{page.subtitle}</Text>
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
              outputRange: [8, 26],
            });
            const dotOpacity = dotAnimations[i].interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 1],
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
          activeOpacity={0.88}
          onPress={handleNext}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>
            {isLastPage ? 'Get Started' : 'Continue'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  topBrand: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topBrandText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: -0.2,
  },
  skipTopBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipTopText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  carousel: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  // Illustration
  illustrationArea: {
    alignItems: 'center',
    marginBottom: 28,
    position: 'relative',
  },
  bgCircleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircleInner: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },

  // Badge
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  badgePill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },

  // Text
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  pageTitleHighlight: {
    color: '#059669',
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },

  // Bottom controls
  bottomControls: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  nextButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#10B981',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
});

