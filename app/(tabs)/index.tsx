import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [registration, setRegistration] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (registration.trim() !== '') {
      setSaved(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ZoneAlert</Text>
      <Text style={styles.subtitle}>Enter your vehicle registration</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. AB12 CDE"
        placeholderTextColor="#999"
        value={registration}
        onChangeText={setRegistration}
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Registration</Text>
      </TouchableOpacity>

      {saved && (
        <Text style={styles.confirmation}>
          ✅ Registration {registration} saved!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#16213e',
    color: '#fff',
    fontSize: 18,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e94560',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#e94560',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmation: {
    color: '#4ecca3',
    fontSize: 16,
    marginTop: 8,
  },
});