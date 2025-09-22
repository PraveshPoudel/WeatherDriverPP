import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const PrivacyPolicyScreen = ({ }) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => router.navigate('/(tabs)/profile')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} />
      </TouchableOpacity>

      <Text style={styles.title}>Privacy Policy</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>1. Types data we collect</Text>
        <Text style={styles.sectionText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Text>
        <Text style={styles.sectionText}>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of your personal data</Text>
        <Text style={styles.sectionText}>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae.
        </Text>
        <Text style={styles.sectionText}>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
        </Text>

        <Text style={styles.sectionTitle}>3. Disclosure of your personal data</Text>
        <Text style={styles.sectionText}>
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
        </Text>
        <Text style={styles.sectionText}>
          Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
        </Text>
        <Text style={styles.sectionText}>
          Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
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
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
    color: '#333',
  },
});

export default PrivacyPolicyScreen;
