import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import {
  BodyText,
  BrandButton,
  Card,
  DisplayText,
  Eyebrow,
  FONTS,
  useScreenInsets,
} from '@/components/ui';
import { TIERS } from '@/constants/content';

export default function PricingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { top, bottom } = useScreenInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: top + 20, paddingBottom: bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Eyebrow>Simple pricing</Eyebrow>
        <DisplayText size={28}>
          Pick the plan that fits your business
        </DisplayText>
        <BodyText size={15} style={{ marginTop: 10 }}>
          Every plan ships with managed hosting, a conversion-first website,
          and a team that treats your business like Main Street matters.
        </BodyText>
      </View>

      {TIERS.map((tier, i) => (
        <Animated.View
          key={tier.id}
          entering={FadeInDown.delay(100 + i * 90).duration(450)}
          style={styles.section}
        >
          <Card
            style={
              tier.highlighted
                ? { borderColor: colors.primary, borderWidth: 2 }
                : undefined
            }
          >
            {tier.highlighted ? (
              <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                <Text style={styles.badgeText}>MOST POPULAR</Text>
              </View>
            ) : null}
            <Text style={[styles.tierName, { color: colors.foreground }]}>
              {tier.name}
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {tier.price}
              </Text>
              <Text style={[styles.cadence, { color: colors.mutedForeground }]}>
                {tier.cadence}
              </Text>
            </View>
            <BodyText size={14} style={{ marginBottom: 14 }}>
              {tier.tagline}
            </BodyText>
            {tier.features.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Feather name="check-circle" size={16} color={colors.accent} />
                <Text style={[styles.featureText, { color: colors.foreground }]}>
                  {f}
                </Text>
              </View>
            ))}
            <BrandButton
              testID={`tier-${tier.id}`}
              label={tier.highlighted ? 'Request a demo' : 'Talk to us'}
              variant={tier.highlighted ? 'primary' : 'secondary'}
              icon="arrow-right"
              onPress={() =>
                router.push(tier.highlighted ? '/(tabs)/demo' : '/(tabs)/contact')
              }
              style={{ marginTop: 16 }}
            />
          </Card>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#451a03',
  },
  tierName: {
    fontFamily: FONTS.displaySemi,
    fontSize: 19,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 6,
  },
  price: {
    fontFamily: FONTS.display,
    fontSize: 34,
  },
  cadence: {
    fontFamily: FONTS.body,
    fontSize: 13,
    marginBottom: 6,
    flexShrink: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 9,
  },
  featureText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    flex: 1,
  },
});
