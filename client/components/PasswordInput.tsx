import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  containerStyle?: object;
  inputStyle?: object;
  iconStyle?: object;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconNameOff?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
}

export default function passwordInput({
  value,
  onChangeText,
  placeholder = 'Password',
  placeholderTextColor = Colors.soft,
  containerStyle = {},
  inputStyle = {},
  iconStyle = {},
  iconName = 'eye-outline',
  iconNameOff = 'eye-off-outline',
  iconSize = 24,
  iconColor = Colors.bold,
}: PasswordInputProps) {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        style={[styles.icon, iconStyle]}
      >
        {showPassword ? (
          <Ionicons name={iconName} size={iconSize} color={iconColor} />
        ) : (
          <Ionicons name={iconNameOff} size={iconSize} color={iconColor} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.input,
    color: Colors.bold,
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});