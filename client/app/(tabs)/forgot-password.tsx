import { Colors } from "@/constants/Colors";
import React, { JSX, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import EmailInput from "@/components/EmailInput";
import { StatusBar } from "expo-status-bar";
import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";

export default function ForgotPassword(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleForgotPassword = () => {
    console.log("Email:", email);
    router.navigate("/(tabs)/code-input");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <BackButton
        buttonStyle={styles.backButton}
        onPress={() => router.navigate("/(tabs)/log-in")}
        accessibilityLabel="Back to login"
      />
      <Text style={styles.title}>Forgot password?</Text>
      <Text style={styles.subtitle}>
        Don't worry! It happens. Please enter the email associated with your
        account.
      </Text>
      <Text style={styles.label}>Email</Text>
      <EmailInput
        containerStyle={styles.inputContainer}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <AppButton title="Send Code" onPress={handleForgotPassword} />
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.navigate("/(tabs)/log-in")}
          accessibilityLabel="Log in"
        >
          <Text style={styles.signUpLink}>
            Remember password? <Text style={styles.boldLink}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
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
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 100, // Circular
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
    color: Colors.bold,
  },
  inputContainer: {
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  signUpLink: {
    color: Colors.regular,
  },
  boldLink: {
    fontWeight: "bold",
    color: Colors.bold,
  },
});
