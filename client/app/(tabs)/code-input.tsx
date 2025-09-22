import React, { useState, useEffect, JSX } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";

export default function CodeInput(): JSX.Element {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = Array.from({ length: 4 }, () =>
    React.createRef<TextInput>()
  );

  const handleChangeText = (index: number, text: string) => {
    if (text.length <= 1) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      if (text && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleVerify = () => {
    console.log("Verification code:", code.join(""));
    router.navigate("/(tabs)/reset-password");
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <BackButton
        buttonStyle={styles.backButton}
        onPress={() => router.navigate("/(tabs)/forgot-password")}
        accessibilityLabel="Back to login"
      />
      <Text style={styles.boldText}>Please check your email</Text>
      <Text style={styles.subHeading}>
        We've sent a code to{" "}
        <Text style={{ fontWeight: "bold" }}>email@example.com</Text>
      </Text>
      <View style={styles.codeInputContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={inputRefs[index]}
            style={styles.codeInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChangeText(index, text)}
            onFocus={() => {
              if (code[index] === "") {
                inputRefs[index].current?.setNativeProps({
                  selection: { start: 0, end: 0 },
                });
              }
            }}
          />
        ))}
      </View>
      <AppButton
        title="Verify"
        onPress={handleVerify}
        buttonStyle={styles.verifyButton}
      />
      <Text style={styles.cooldownText}>
        <Text style={{ fontWeight: "bold" }}>Send code again in </Text>
        {String(Math.floor(cooldown / 60)).padStart(2, "0")}:
        {String(cooldown % 60).padStart(2, "0")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 100, // Circular
  },
  boldText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.bold,
  },
  subHeading: {
    fontSize: 16,
    color: Colors.regular,
    marginBottom: 30,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: Colors.input,
    color: Colors.bold,
    marginHorizontal: 10,
  },
  verifyButton: {
    marginBottom: 10,
  },
  cooldownText: {
    fontSize: 14,
    color: Colors.regular,
  },
});
