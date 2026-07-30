import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import colorTokens from '@/constants/colors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FONTS = {
  display: 'BricolageGrotesque_700Bold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  body: 'NunitoSans_400Regular',
  bodySemi: 'NunitoSans_600SemiBold',
  bodyBold: 'NunitoSans_700Bold',
} as const;

/** Top inset that also works in the web preview (67px web status bar). */
export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  const top = Platform.OS === 'web' ? 67 : insets.top;
  // Room for the floating/absolute tab bar + web home indicator.
  const bottom = (Platform.OS === 'web' ? 34 : insets.bottom) + 78;
  return { top, bottom };
}

export function Eyebrow({ children }: { children: string }) {
  const colors = useColors();
  return (
    <View style={styles.eyebrowRow}>
      <View style={[styles.eyebrowDash, { backgroundColor: colors.warning }]} />
      <Text style={[styles.eyebrowText, { color: colors.primary }]}>
        {children}
      </Text>
    </View>
  );
}

export function DisplayText({
  children,
  size = 28,
  style,
}: {
  children: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const colors = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: FONTS.display,
          fontSize: size,
          lineHeight: size * 1.15,
          color: colors.foreground,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  muted = true,
  size = 15,
  style,
}: {
  children: string;
  muted?: boolean;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const colors = useColors();
  return (
    <Text
      style={[
        {
          fontFamily: FONTS.body,
          fontSize: size,
          lineHeight: size * 1.5,
          color: muted ? colors.mutedForeground : colors.foreground,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: colorTokens.radiusCard,
          padding: 20,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  icon?: React.ComponentProps<typeof Feather>['name'];
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function BrandButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  testID,
}: ButtonProps) {
  const colors = useColors();
  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }, [onPress]);

  const isSecondary = variant === 'secondary';
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'accent'
        ? colors.warning
        : 'transparent';
  const fg =
    variant === 'primary'
      ? colors.primaryForeground
      : variant === 'accent'
        ? '#451a03'
        : colors.accent;

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderWidth: isSecondary ? 1.5 : 0,
          borderColor: colors.accent,
          borderRadius: colorTokens.radius,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
          {icon ? <Feather name={icon} size={17} color={fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  multiline?: boolean;
  error?: string;
  optional?: boolean;
  testID?: string;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = 'sentences',
  multiline = false,
  error,
  optional = false,
  testID,
}: FieldProps) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.fieldLabelRow}>
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        {optional ? (
          <Text style={[styles.fieldOptional, { color: colors.mutedForeground }]}>
            optional
          </Text>
        ) : null}
      </View>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.input,
            color: colors.foreground,
            borderRadius: colorTokens.radius,
            height: multiline ? 96 : 50,
            textAlignVertical: multiline ? 'top' : 'center',
            paddingTop: multiline ? 12 : 0,
          },
        ]}
      />
      {error ? (
        <Text style={[styles.fieldError, { color: colors.destructive }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  eyebrowDash: {
    width: 22,
    height: 3,
    borderRadius: 2,
  },
  eyebrowText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
  },
  fieldOptional: {
    fontFamily: FONTS.body,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
  },
  fieldError: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12,
    marginTop: 4,
  },
});
