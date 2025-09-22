import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  buttonStyle?: object;
  textStyle?: object;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
}

export default function AppButton({
  title,
  onPress,
  buttonStyle,
  textStyle,
  iconName,
  iconSize = 24,
  iconColor = '#FFF',
}: AppButtonProps): JSX.Element {
  return (
    <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
      <View style={styles.buttonContent}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={iconSize}
            color={iconColor}
            style={[styles.icon, iconName && styles.buttonMargin]}
          />
        )}
        {title.length > 0 && (<Text style={[styles.buttonText, textStyle]}>{title}</Text>)}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'roboto-regular',
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.background,
  },
  buttonMargin: {
    marginLeft: 8,
  },
  icon: {
    marginRight: 8,
  },
});