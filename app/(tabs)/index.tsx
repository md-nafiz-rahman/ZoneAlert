import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Vehicle = {
  make: string;
  model: string;
  fuelType: string;
  euroStatus: string | null;
  year: number;
};

const mockVehicleDatabase: Record<string, Vehicle> = {
  'AB12CDE': { make: 'TOYOTA', model: 'COROLLA', fuelType: 'PETROL', euroStatus: 'EURO 4', year: 2008 },
  'XY21ABC': { make: 'BMW', model: '3 SERIES', fuelType: 'DIESEL', euroStatus: 'EURO 5', year: 2013 },
  'LK71DEF': { make: 'FORD', model: 'FOCUS', fuelType: 'DIESEL', euroStatus: 'EURO 6', year: 2019 },
  'EV22ELC': { make: 'TESLA', model: 'MODEL 3', fuelType: 'ELECTRIC', euroStatus: null, year: 2022 },
  'OLD1GHJ': { make: 'VAUXHALL', model: 'ASTRA', fuelType: 'PETROL', euroStatus: 'EURO 3', year: 2003 },
};

const checkUlezCompliance = (vehicle: Vehicle): boolean => {
  if (vehicle.fuelType === 'ELECTRIC') return true;
  if (vehicle.fuelType === 'PETROL') {
    return ['EURO 4', 'EURO 5', 'EURO 6'].includes(vehicle.euroStatus ?? '');
  }
  if (vehicle.fuelType === 'DIESEL') {
    return vehicle.euroStatus === 'EURO 6';
  }
  return false;
};

const mockDvlaApiCall = (registration: string): Promise<Vehicle> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const vehicle = mockVehicleDatabase[registration.toUpperCase().replace(/\s/g, '')];
      if (vehicle) {
        resolve(vehicle);
      } else {
        reject(new Error('Vehicle not found'));
      }
    }, 1500);
  });
};

export default function HomeScreen() {
  const [registration, setRegistration] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (registration.trim() === '') return;
    setLoading(true);
    setVehicle(null);
    setError('');
    try {
      const result = await mockDvlaApiCall(registration);
      setVehicle(result);
    } catch (err) {
      setError('Vehicle not found. Please check the registration.');
    } finally {
      setLoading(false);
    }
  };

  const isCompliant = vehicle ? checkUlezCompliance(vehicle) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ZoneAlert</Text>
      <Text style={styles.subtitle}>Check your ULEZ compliance</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. AB12 CDE"
        placeholderTextColor="#999"
        value={registration}
        onChangeText={setRegistration}
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.button} onPress={handleCheck}>
        <Text style={styles.buttonText}>Check Vehicle</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#e94560" style={{ marginTop: 20 }} />
      )}

      {error !== '' && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {vehicle && (
        <View style={styles.resultCard}>
          <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
          <Text style={styles.vehicleDetail}>Year: {vehicle.year}</Text>
          <Text style={styles.vehicleDetail}>Fuel: {vehicle.fuelType}</Text>
          <Text style={styles.vehicleDetail}>Euro Status: {vehicle.euroStatus ?? 'N/A'}</Text>

          <View style={[styles.complianceBadge, isCompliant ? styles.compliant : styles.nonCompliant]}>
            <Text style={styles.complianceText}>
              {isCompliant ? '✅ ULEZ Compliant' : '❌ NOT ULEZ Compliant'}
            </Text>
          </View>

          {!isCompliant && (
            <Text style={styles.warningText}>
              ⚠️ Daily charge applies if driving in the ULEZ zone. Remember to pay at tfl.gov.uk
            </Text>
          )}
        </View>
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
  resultCard: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  vehicleDetail: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  complianceBadge: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  compliant: {
    backgroundColor: '#1a4731',
  },
  nonCompliant: {
    backgroundColor: '#4a1a1a',
  },
  complianceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  warningText: {
    marginTop: 12,
    fontSize: 13,
    color: '#f0a500',
    textAlign: 'center',
  },
  errorText: {
    color: '#e94560',
    fontSize: 14,
    marginTop: 8,
  },
});