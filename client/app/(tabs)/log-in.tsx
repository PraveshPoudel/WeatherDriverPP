import { Colors } from "@/constants/Colors";
import React, { JSX, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import AppButton from "@/components/AppButton";
import { StatusBar } from "expo-status-bar";
import PasswordInput from "@/components/PasswordInput";
import EmailInput from "@/components/EmailInput";

export default function LogIn(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    router.navigate("/(tabs)/map");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Log in</Text>
      <Text style={styles.label}>Email</Text>
      <EmailInput
        containerStyle={styles.inputContainer}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>Password</Text>
      <PasswordInput
        containerStyle={styles.inputContainer}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.rightSide}>
        <TouchableOpacity
          onPress={() => router.navigate("/(tabs)/forgot-password")}
        >
          <Text style={styles.boldLink}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <AppButton
        title="Log in"
        buttonStyle={styles.button}
        onPress={handleSignUp}
      />
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>Or log in with</Text>
        <View style={styles.separatorLine} />
      </View>
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../../assets/images/facebook-logo.png")}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../../assets/images/google-logo.png")}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../../assets/images/apple-logo.png")}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.navigate("/(tabs)/sign-up")}>
          <Text style={styles.signUpLink}>
            Don't have an account? <Text style={styles.boldLink}>Sign up</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
    color: Colors.bold,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    alignSelf: "flex-start",
    width: "100%",
    color: Colors.bold,
  },
  inputContainer: {
    marginBottom: 20,
  },
  rightSide: {
    alignSelf: "flex-end",
    bottom: 5,
  },
  button: {
    marginVertical: 10,
    marginBottom: 10,
    width: "100%",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "80%",
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.soft,
  },
  separatorText: {
    marginHorizontal: 10,
    color: Colors.regular,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginBottom: 20,
  },
  socialButton: {
    padding: 10,
    backgroundColor: Colors.input,
    borderRadius: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
  footer: {
    position: "sticky",
    bottom: -70,
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
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
});
