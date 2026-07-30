import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
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
import { CONTACT } from '@/constants/content';
import { createLead } from '@workspace/api-client-react';
import colorTokens from '@/constants/colors';

export default function ContactScreen() {
  const colors = useColors();
  const { top, bottom } = useScreenInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = async () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email';
    if (!message.trim()) e.message = 'Tell us a little about your business';
    setErrors(e);
    if (Object.keys(e).length > 0 || sending) return;
    setSending(true);
    setSubmitError(null);
    try {
      await createLead({
        source: 'mobile-contact',
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setSent(true);
    } catch {
      setSubmitError("Couldn't send your message — check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <View
        style={[styles.successWrap, { backgroundColor: colors.background, paddingTop: top }]}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.successInner}>
          <View style={[styles.successIcon, { backgroundColor: colors.sky }]}>
            <Feather name="mail" size={32} color={colors.accent} />
          </View>
          <DisplayText size={26} style={{ textAlign: 'center' }}>
            Message received
          </DisplayText>
          <BodyText size={15} style={{ textAlign: 'center', marginTop: 10 }}>
            {`Thanks for reaching out — we reply within one business day. Need us sooner? Email ${CONTACT.email}.`}
          </BodyText>
          <BrandButton
            testID="contact-again"
            label="Write another message"
            variant="secondary"
            onPress={() => {
              setName('');
              setEmail('');
              setMessage('');
              setSent(false);
            }}
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
        <Eyebrow>Say hello</Eyebrow>
        <DisplayText size={28}>{CONTACT.title}</DisplayText>
        <BodyText size={15} style={{ marginTop: 10 }}>
          {CONTACT.body}
        </BodyText>
      </View>

      <View style={styles.section}>
        <Field
          label="Your name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrors((e) => ({ ...e, name: undefined }));
          }}
          placeholder="Jordan Smith"
          autoCapitalize="words"
          error={errors.name}
          testID="contact-name"
        />
        <Field
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setErrors((e) => ({ ...e, email: undefined }));
          }}
          placeholder="you@business.com"
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
          testID="contact-email"
        />
        <Field
          label="How can we help?"
          value={message}
          onChangeText={(v) => {
            setMessage(v);
            setErrors((e) => ({ ...e, message: undefined }));
          }}
          placeholder="Tell us about your business and what you're looking for…"
          multiline
          error={errors.message}
          testID="contact-message"
        />
        <BrandButton
          testID="contact-submit"
          label={sending ? 'Sending…' : 'Send message'}
          icon="send"
          disabled={sending}
          onPress={() => {
            void submit();
          }}
        />
        {submitError ? (
          <BodyText
            size={13}
            style={{ marginTop: 10, color: colorTokens.light.destructive }}
          >
            {submitError}
          </BodyText>
        ) : null}
      </View>

      <View style={styles.section}>
        <Card>
          <Text style={[styles.directTitle, { color: colors.foreground }]}>
            Prefer email?
          </Text>
          <Pressable
            testID="contact-mailto"
            onPress={() => Linking.openURL(`mailto:${CONTACT.email}`)}
            style={({ pressed }) => [styles.mailRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="mail" size={16} color={colors.primary} />
            <Text style={[styles.mailText, { color: colors.primary }]}>
              {CONTACT.email}
            </Text>
          </Pressable>
        </Card>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  directTitle: {
    fontFamily: FONTS.displaySemi,
    fontSize: 16,
    marginBottom: 8,
  },
  mailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  mailText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 15,
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
