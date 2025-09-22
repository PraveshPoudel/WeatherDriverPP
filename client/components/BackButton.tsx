import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface AppButtonProps {
  onPress: () => void;
  buttonStyle?: object;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
	accessibilityLabel?: string;
}

export default function BackButton({
  onPress,
  buttonStyle,
  iconName = 'arrow-back',
  iconSize = 24,
  iconColor = Colors.regular,
	accessibilityLabel = "Back button"
}: AppButtonProps): JSX.Element {

  return (
		<TouchableOpacity
			style={[styles.button, buttonStyle]}
			onPress={onPress}
			accessibilityLabel={accessibilityLabel}
		>
		<Ionicons name={iconName} size={iconSize} color={iconColor} />
		</TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 100, // Circular
  },
});