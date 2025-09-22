import { Colors } from "@/constants/Colors";
import React, { JSX } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AppButton from "@/components/AppButton";
import { StatusBar } from "expo-status-bar";

export default function PasswordChanged(): JSX.Element {
  const router = useRouter();

  const handleSignUp = () => {
    router.navigate("/(tabs)/log-in");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Password changed</Text>
      <Text style={styles.subtitle}>
        Your password has been changed successfully
      </Text>
      <AppButton
        buttonStyle={styles.button}
        onPress={handleSignUp}
        title="Back to login"
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
    color: Colors.bold,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    width: "75%",
    color: Colors.regular,
  },
  button: {
    marginVertical: 10,
    width: "100%",
  },
});
