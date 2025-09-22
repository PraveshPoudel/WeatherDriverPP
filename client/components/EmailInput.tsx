import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  containerStyle?: object;
  inputStyle?: object;
}

export default function EmailInput({
  value,
  onChangeText,
  placeholder = 'Password',
  placeholderTextColor = Colors.soft,
  containerStyle = {},
  inputStyle = {},
}: EmailInputProps) {

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
        keyboardType="email-address"
        autoCapitalize="none"
      />
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
});