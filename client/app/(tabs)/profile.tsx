import React, { useState, useCallback, JSX } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import AppButton from '@/components/AppButton';
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

export default function ProfileScreen(): JSX.Element {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    zip: '',
  });

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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

  const AVATAR_KEY = 'profile_avatar';

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const loadedProfile: Partial<Profile> = {};
          for (const key in STORAGE_KEYS) {
            const value = await AsyncStorage.getItem(STORAGE_KEYS[key as keyof Profile]);
            if (value !== null) {
              loadedProfile[key as keyof Profile] = value;
            }
          }
          const avatar = await AsyncStorage.getItem(AVATAR_KEY);
          if (avatar) setAvatarUri(avatar);

          setProfile(prev => ({ ...prev, ...loadedProfile }));
        } catch (error) {
          console.error('Failed to load profile from AsyncStorage', error);
        }
      };

      loadProfile();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => router.replace('/'),
      },
    ]);
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ').filter(part => part.trim() !== '');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        await AsyncStorage.setItem(AVATAR_KEY, uri);
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Profile section */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{getInitials(profile.fullName || '')}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.editIcon} onPress={() => router.navigate('/(tabs)/edit-profile')}>
          <Ionicons name="pencil" size={16} color="black" />
        </TouchableOpacity>

        <Text style={styles.name}>{profile.fullName || 'Unnamed User'}</Text>
      </View>

      {/* Main options */}
      <View style={styles.card}>
        <ProfileOption
          title="Plan a drive"
          icon={<Ionicons name="car-outline" size={20} color={Colors.bold} />}
          onPress={() => router.navigate('/(tabs)/map')}
        />
        <ProfileOption
          title="Saved drives"
          icon={<MaterialCommunityIcons name="bookmark-outline" size={20} color={Colors.bold} />}
          onPress={() => router.navigate('/(tabs)/saved-drives')}
        />
        <ProfileOption
          title="Weather alerts"
          icon={<Ionicons name="warning-outline" size={20} color={Colors.bold} />}
          onPress={() => router.navigate('/(tabs)/weather-alerts')}
        />
        <ProfileOption
          title="Settings"
          icon={<Ionicons name="settings-outline" size={20} color={Colors.bold} />}
          onPress={() => router.navigate('/(tabs)/settings')}
        />
      </View>

      {/* Support options */}
      <View style={styles.card}>
        <ProfileOption
          title="Privacy policy"
          icon={<FontAwesome5 name="lock" size={18} color={Colors.bold} />}
          onPress={() => router.push('/(tabs)/privacy-policy')}
        />
      </View>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <AppButton
          title="LOG OUT"
          buttonStyle={styles.logoutButton}
          textStyle={styles.logoutText}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}

const ProfileOption = ({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: JSX.Element;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.optionRow} onPress={onPress}>
    {icon}
    <Text style={styles.optionText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Colors.input,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  initialsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  editIcon: {
    position: 'absolute',
    right: 115,
    top: 50,
    backgroundColor: Colors.input,
    padding: 5,
    borderRadius: 12,
  },
  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.bold,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.bold,
  },
  logoutContainer: {
    marginTop: 'auto',
  },
  logoutButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
