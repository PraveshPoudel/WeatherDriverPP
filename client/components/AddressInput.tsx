import React, { useCallback, useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, StyleProp, TextStyle, ViewStyle, Keyboard } from 'react-native';
import axios from 'axios';
import { Colors } from '@/constants/Colors';

interface Suggestion {
  description: string;
}

interface AddressInputProps {
  placeholder: string;
  placeholderTextColor?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export default function AddressInput({ placeholder, placeholderTextColor, value, onChangeText, onFocus, onBlur, style, inputStyle }: AddressInputProps) {

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const debounce = (func: (value: string) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout | null;

    return (value: string) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(value), delay);
    };
  };

  const fetchSuggestions = useCallback(
    debounce(async (value: string) => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
          {
            params: {
              input: value,
              key: GOOGLE_MAPS_API_KEY,
            },
          }
        );

        if (response.data.predictions) {
          setSuggestions(response.data.predictions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 1000),
    []
  );

  const handleInputChange = (text: string) => {
    onChangeText(text);
    fetchSuggestions(text);
  };

  const handleSuggestionPress = (description: string) => {
    onChangeText(description);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const renderSuggestionItem = ({ item }: { item: Suggestion }) => (
    <TouchableOpacity onPress={() => handleSuggestionPress(item.description)} style={styles.suggestionItem}>
      <Text style={styles.suggestionText} >{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={style}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? Colors.soft}
        value={value}
        onChangeText={handleInputChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.description}
          renderItem={renderSuggestionItem}
					keyboardShouldPersistTaps={'always'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.input,
    color: Colors.bold,
  },
  suggestionItem: {
    width: '80%',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.soft,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignSelf: 'center',
  },
  suggestionText: {
    color: Colors.regular,
  },
});