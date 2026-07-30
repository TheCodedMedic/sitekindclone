import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colorTokens from '@/constants/colors';
import {
  BodyText,
  BrandButton,
  Card,
  DisplayText,
  Eyebrow,
  FONTS,
  useScreenInsets,
} from '@/components/ui';
import {
  CAPABILITIES,
  CTA_BAND,
  HERO,
  STATS,
  TESTIMONIAL,
} from '@/constants/content';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { top, bottom } = useScreenInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: top + 20, paddingBottom: bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.section}>
        <View style={styles.brandRow}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.brandMark}
          />
          <Text style={[styles.brandName, { color: colors.foreground }]}>
            sitekind
          </Text>
        </View>
        <Eyebrow>{HERO.eyebrow}</Eyebrow>
        <DisplayText size={30}>{HERO.headline}</DisplayText>
        <BodyText size={16} style={styles.heroSub}>
          {HERO.subheadline}
        </BodyText>
        <View style={styles.ctaRow}>
          <BrandButton
            testID="hero-pricing"
            label={HERO.primaryCta}
            icon="arrow-right"
            onPress={() => router.push('/(tabs)/pricing')}
          />
          <BrandButton
            testID="hero-demo"
            label={HERO.secondaryCta}
            variant="secondary"
            onPress={() => router.push('/(tabs)/demo')}
          />
        </View>
      </Animated.View>

      {/* Stat strip */}
      <Animated.View
        entering={FadeInDown.delay(120).duration(500)}
        style={styles.section}
      >
        <View style={styles.statGrid}>
          {STATS.map((s) => (
            <View
              key={s.value}
              style={[
                styles.statCell,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colorTokens.radiusCard,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Capabilities */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={styles.section}
      >
        <Eyebrow>What you get</Eyebrow>
        <DisplayText size={24} style={{ marginBottom: 16 }}>
          One subscription. A whole front office.
        </DisplayText>
        {CAPABILITIES.map((cap) => (
          <Card key={cap.title} style={styles.capCard}>
            <View
              style={[
                styles.capIcon,
                { backgroundColor: colors[cap.tint] ?? colors.secondary },
              ]}
            >
              <Feather name={cap.icon} size={20} color={colors.accent} />
            </View>
            <View style={styles.capBody}>
              <Text style={[styles.capTitle, { color: colors.foreground }]}>
                {cap.title}
              </Text>
              <BodyText size={14}>{cap.body}</BodyText>
            </View>
          </Card>
        ))}
      </Animated.View>

      {/* Testimonial */}
      <Animated.View
        entering={FadeInDown.delay(260).duration(500)}
        style={styles.section}
      >
        <Card
          style={{
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          }}
        >
          <Feather name="trending-up" size={22} color={colors.accent} />
          <Text style={[styles.quote, { color: colors.foreground }]}>
            {TESTIMONIAL.quote}
          </Text>
          <BodyText size={13}>{TESTIMONIAL.attribution}</BodyText>
        </Card>
      </Animated.View>

      {/* CTA band */}
      <Animated.View
        entering={FadeInDown.delay(320).duration(500)}
        style={styles.section}
      >
        <Card
          style={{
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            paddingVertical: 28,
          }}
        >
          <Text style={styles.ctaTitle}>{CTA_BAND.title}</Text>
          <Text style={styles.ctaBody}>{CTA_BAND.body}</Text>
          <BrandButton
            testID="cta-demo"
            label="Request a demo"
            variant="accent"
            icon="arrow-right"
            onPress={() => router.push('/(tabs)/demo')}
            style={{ marginTop: 18 }}
          />
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
  },
  brandName: {
    fontFamily: FONTS.display,
    fontSize: 21,
  },
  heroSub: {
    marginTop: 12,
  },
  ctaRow: {
    marginTop: 22,
    gap: 12,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCell: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    padding: 16,
  },
  statValue: {
    fontFamily: FONTS.display,
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 17,
  },
  capCard: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  capIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capBody: {
    flex: 1,
  },
  capTitle: {
    fontFamily: FONTS.displaySemi,
    fontSize: 16,
    marginBottom: 4,
  },
  quote: {
    fontFamily: FONTS.display,
    fontSize: 24,
    marginTop: 10,
    marginBottom: 6,
  },
  ctaTitle: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 8,
  },
  ctaBody: {
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.9)',
  },
});
