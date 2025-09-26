import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import WDButton from "../../components/ui/WDButton";
import { colors, spacing, type, radius } from "../../theme/tokens";

export default function SignInScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <Text style={styles.h1}>Welcome back</Text>
      <TextInput placeholder="Email" placeholderTextColor={colors.muted} style={styles.input} />
      <TextInput placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry style={styles.input} />
      <WDButton label="Sign In" onPress={() => navigation.replace("Main")} />
      <Text style={styles.sub} onPress={() => navigation.navigate("SignUp")}>Create an account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.md },
  h1: { ...type.h1, color: colors.text, marginTop: spacing.xl },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 48
  },
  sub: { ...type.body, color: colors.muted, textAlign: "center", marginTop: spacing.sm }
});
