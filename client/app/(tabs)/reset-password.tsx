import { Colors } from "@/constants/Colors";
import React, { JSX, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import PasswordInput from "@/components/PasswordInput";
import AppButton from "@/components/AppButton";
import { StatusBar } from "expo-status-bar";
import BackButton from "@/components/BackButton";

export default function ResetPassword(): JSX.Element {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordReset = () => {
    console.log("New Password:", password);
    console.log("Confirm New Password:", confirmPassword);
    router.navigate("/(tabs)/password-changed");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <BackButton
        buttonStyle={styles.backButton}
        onPress={() => router.navigate("/(tabs)/code-input")}
        accessibilityLabel="Back to login"
      />
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Please type something you'll remember</Text>
      <Text style={styles.label}>New password</Text>
      <PasswordInput
        containerStyle={styles.passwordInputContainer}
        placeholder="Create Password"
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.label}>Confirm new password</Text>
      <PasswordInput
        containerStyle={styles.passwordInputContainer}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <AppButton
        buttonStyle={styles.button}
        onPress={handlePasswordReset}
        title="Reset Password"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
    color: Colors.bold,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    alignSelf: "flex-start",
    color: Colors.regular,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    alignSelf: "flex-start",
    width: "100%",
    color: Colors.bold,
  },
  passwordInputContainer: {
    marginBottom: 15,
  },
  button: {
    paddingVertical: 10,
    marginVertical: 10,
    width: "100%",
  },
});
