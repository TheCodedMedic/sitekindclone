import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colorTokens from '@/constants/colors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import {
  BodyText,
  BrandButton,
  Card,
  DisplayText,
  Eyebrow,
  Field,
  FONTS,
  useScreenInsets,
} from '@/components/ui';
import { createLead } from '@workspace/api-client-react';

type Path = 'has-site' | 'no-site';

interface FormState {
  domain: string;
  businessName: string;
  description: string;
  city: string;
  state: string;
  radius: string;
  phone: string;
  name: string;
  email: string;
  notes: string;
}

const EMPTY: FormState = {
  domain: '',
  businessName: '',
  description: '',
  city: '',
  state: '',
  radius: '',
  phone: '',
  name: '',
  email: '',
  notes: '',
};

export default function DemoScreen() {
  const colors = useColors();
  const { top, bottom } = useScreenInsets();
  const [step, setStep] = useState(0);
  const [path, setPath] = useState<Path | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitLead = async () => {
    if (!validateStep3() || sending) return;
    setSending(true);
    setSubmitError(null);
    try {
      await createLead({
        source: 'mobile-demo',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        businessName: form.businessName.trim() || undefined,
        message: form.notes.trim() || undefined,
        details: {
          path,
          ...(form.domain.trim() ? { domain: form.domain.trim() } : {}),
          ...(form.description.trim() ? { description: form.description.trim() } : {}),
          ...(form.city.trim() ? { city: form.city.trim() } : {}),
          ...(form.state.trim() ? { state: form.state.trim() } : {}),
          ...(form.radius.trim() ? { radius: form.radius.trim() } : {}),
        },
      });
      setSubmitted(true);
    } catch {
      setSubmitError("Couldn't send your request — check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const set = (key: keyof FormState) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep2 = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (path === 'has-site' && !form.domain.trim()) e.domain = 'Enter your domain';
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const restart = () => {
    setForm(EMPTY);
    setPath(null);
    setStep(0);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <View
        style={[
          styles.successWrap,
          { backgroundColor: colors.background, paddingTop: top },
        ]}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.successInner}>
          <View style={[styles.successIcon, { backgroundColor: colors.mint }]}>
            <Feather name="check" size={34} color={colors.accent} />
          </View>
          <DisplayText size={26} style={{ textAlign: 'center' }}>
            Your free report is on its way
          </DisplayText>
          <BodyText size={15} style={{ textAlign: 'center', marginTop: 10 }}>
            {`Thanks, ${form.name.trim()}. We'll review ${form.businessName.trim()} and reach out at ${form.email.trim()} within one business day.`}
          </BodyText>
          <BrandButton
            testID="demo-restart"
            label="Start another request"
            variant="secondary"
            onPress={restart}
            style={{ marginTop: 24 }}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: top + 20, paddingBottom: bottom }}
      bottomOffset={40}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Eyebrow>Free demo</Eyebrow>
        <DisplayText size={28}>Build it for me — see my free report</DisplayText>
        <View style={styles.stepper}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                {
                  backgroundColor: i <= step ? colors.primary : colors.border,
                  width: i === step ? 26 : 10,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {step === 0 ? (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.section}>
          <BodyText size={15} style={{ marginBottom: 16 }}>
            First things first — where is your business today?
          </BodyText>
          {(
            [
              {
                id: 'has-site' as Path,
                icon: 'globe' as const,
                title: 'I have a website',
                body: "We'll audit it and show you exactly what an upgrade wins you.",
              },
              {
                id: 'no-site' as Path,
                icon: 'plus-circle' as const,
                title: "I don't have a website",
                body: "We'll build your demo from scratch — live in 24 hours.",
              },
            ]
          ).map((opt) => (
            <Pressable
              key={opt.id}
              testID={`path-${opt.id}`}
              onPress={() => setPath(opt.id)}
              style={({ pressed }) => [
                styles.pathCard,
                {
                  backgroundColor: colors.card,
                  borderColor: path === opt.id ? colors.primary : colors.border,
                  borderWidth: path === opt.id ? 2 : 1,
                  borderRadius: colorTokens.radiusCard,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather
                name={opt.icon}
                size={22}
                color={path === opt.id ? colors.primary : colors.mutedForeground}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pathTitle, { color: colors.foreground }]}>
                  {opt.title}
                </Text>
                <BodyText size={13}>{opt.body}</BodyText>
              </View>
            </Pressable>
          ))}
          <BrandButton
            testID="demo-next-1"
            label="Continue"
            icon="arrow-right"
            disabled={!path}
            onPress={() => setStep(1)}
            style={{ marginTop: 8 }}
          />
        </Animated.View>
      ) : null}

      {step === 1 ? (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.section}>
          {path === 'has-site' ? (
            <Field
              label="Website domain"
              value={form.domain}
              onChangeText={set('domain')}
              placeholder="yourbusiness.com"
              autoCapitalize="none"
              keyboardType="url"
              error={errors.domain}
              testID="field-domain"
            />
          ) : null}
          <Field
            label="Business name"
            value={form.businessName}
            onChangeText={set('businessName')}
            placeholder="Smith Plumbing Co."
            error={errors.businessName}
            testID="field-business"
          />
          <Field
            label="What do you do?"
            value={form.description}
            onChangeText={set('description')}
            placeholder="Residential plumbing, water heaters, emergency calls…"
            multiline
            optional
            testID="field-description"
          />
          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <Field
                label="City"
                value={form.city}
                onChangeText={set('city')}
                placeholder="Austin"
                error={errors.city}
                testID="field-city"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="State"
                value={form.state}
                onChangeText={set('state')}
                placeholder="TX"
                autoCapitalize="words"
                error={errors.state}
                testID="field-state"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field
                label="Service radius"
                value={form.radius}
                onChangeText={set('radius')}
                placeholder="25 miles"
                optional
                testID="field-radius"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Business phone"
                value={form.phone}
                onChangeText={set('phone')}
                placeholder="(512) 555-0134"
                keyboardType="phone-pad"
                optional
                testID="field-phone"
              />
            </View>
          </View>
          <View style={styles.navRow}>
            <BrandButton
              label="Back"
              variant="secondary"
              onPress={() => setStep(0)}
              style={{ flex: 1 }}
              testID="demo-back-2"
            />
            <BrandButton
              label="Continue"
              icon="arrow-right"
              onPress={() => {
                if (validateStep2()) setStep(2);
              }}
              style={{ flex: 2 }}
              testID="demo-next-2"
            />
          </View>
        </Animated.View>
      ) : null}

      {step === 2 ? (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.section}>
          <Card style={{ marginBottom: 16, padding: 14 }}>
            <BodyText size={13}>Requesting a free report for</BodyText>
            <Text style={[styles.summaryBiz, { color: colors.foreground }]}>
              {form.businessName.trim() || 'Your business'}
              {form.city.trim() ? ` · ${form.city.trim()}, ${form.state.trim()}` : ''}
            </Text>
          </Card>
          <Field
            label="Your name"
            value={form.name}
            onChangeText={set('name')}
            placeholder="Jordan Smith"
            autoCapitalize="words"
            error={errors.name}
            testID="field-name"
          />
          <Field
            label="Email"
            value={form.email}
            onChangeText={set('email')}
            placeholder="you@business.com"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
            testID="field-email"
          />
          <Field
            label="Anything else we should know?"
            value={form.notes}
            onChangeText={set('notes')}
            placeholder="Busy season, competitors, goals…"
            multiline
            optional
            testID="field-notes"
          />
          <View style={styles.navRow}>
            <BrandButton
              label="Back"
              variant="secondary"
              onPress={() => setStep(1)}
              style={{ flex: 1 }}
              testID="demo-back-3"
            />
            <BrandButton
              label={sending ? 'Sending…' : 'Get my free report'}
              icon="send"
              disabled={sending}
              onPress={() => {
                void submitLead();
              }}
              style={{ flex: 2 }}
              testID="demo-submit"
            />
          </View>
          {submitError ? (
            <BodyText
              size={13}
              style={{ marginTop: 10, color: colorTokens.light.destructive }}
            >
              {submitError}
            </BodyText>
          ) : null}
        </Animated.View>
      ) : null}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stepper: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  stepDot: {
    height: 10,
    borderRadius: 5,
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    marginBottom: 12,
  },
  pathTitle: {
    fontFamily: FONTS.displaySemi,
    fontSize: 16,
    marginBottom: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  summaryBiz: {
    fontFamily: FONTS.displaySemi,
    fontSize: 16,
    marginTop: 2,
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  successInner: {
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
