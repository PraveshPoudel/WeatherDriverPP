import React, { useState, useEffect, JSX } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '@/components/BackButton';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';

type Profile = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  zip: string;
};

const EditProfileScreen = (): JSX.Element => {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    zip: ''
  });

  const STORAGE_KEYS: { [K in keyof Profile]: string } = {
    fullName: 'profile_fullName',
    username: 'profile_username',
    email: 'profile_email',
    phone: 'profile_phone',
    country: 'profile_country',
    city: 'profile_city',
    address: 'profile_address',
    zip: 'profile_zip',
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const loadedProfile: Partial<Profile> = {};
        for (const key in STORAGE_KEYS) {
          const value = await AsyncStorage.getItem(STORAGE_KEYS[key as keyof Profile]);
          if (value !== null) {
            loadedProfile[key as keyof Profile] = value;
          }
        }
        setProfile(prev => ({ ...prev, ...loadedProfile }));
      } catch (error) {
        console.error('Failed to load profile from AsyncStorage', error);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    AsyncStorage.setItem(STORAGE_KEYS[field], value).catch(err =>
      console.error(`Error saving ${field} to storage`, err)
    );
  };

  const handleSave = async () => {
    try {
      const allEmpty = Object.values(profile).every(value => value.trim() === '');
      if (allEmpty) {
        Alert.alert('Error', 'Please fill in at least one field before submitting.');
        return;
      }

      for (const key in profile) {
        const typedKey = key as keyof Profile;
        const value = profile[typedKey] || '';
        await AsyncStorage.setItem(STORAGE_KEYS[typedKey], value);
      }

      console.log('Saved profile:', profile);
      router.push('/(tabs)/profile');
    } catch (error) {
      console.error('Failed to save profile', error);
      Alert.alert('Error', 'An error occurred while saving your profile.');
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      {/* Back Arrow */}
      <BackButton
        buttonStyle={styles.backButton}
        onPress={() => router.navigate("/(tabs)/map")}
        accessibilityLabel="Back to map screen"
      />

      <Text style={styles.title}>Edit profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={Colors.regular}
        value={profile.fullName}
        onChangeText={(text) => handleChange('fullName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={Colors.regular}
        value={profile.username}
        onChangeText={(text) => handleChange('username', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.regular}
        value={profile.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor={Colors.regular}
        value={profile.phone}
        onChangeText={(text) => handleChange('phone', text)}
        keyboardType="phone-pad"
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Country"
          placeholderTextColor={Colors.regular}
          value={profile.country}
          onChangeText={(text) => handleChange('country', text)}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="City"
          placeholderTextColor={Colors.regular}
          value={profile.city}
          onChangeText={(text) => handleChange('city', text)}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Address line 1"
        placeholderTextColor={Colors.regular}
        value={profile.address}
        onChangeText={(text) => handleChange('address', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Zip Code"
        placeholderTextColor={Colors.regular}
        value={profile.zip}
        onChangeText={(text) => handleChange('zip', text)}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>SUBMIT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 30,
    color: Colors.bold,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.input,
    backgroundColor: Colors.input,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    color: Colors.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
