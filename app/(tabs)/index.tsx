import { useAppTheme } from '@/contexts/AppThemeContext';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type Vehicle = {
  make: string;
  model: string;
  fuelType: string;
  euroStatus: string | null;
  year: number;
};

const ZONES = {
  ULEZ: {
    name: 'ULEZ Zone',
    dailyCharge: '£12.50',
    bounds: { minLat: 51.38, maxLat: 51.64, minLng: -0.35, maxLng: 0.15 },
  },
  CONGESTION: {
    name: 'Congestion Charge Zone',
    dailyCharge: '£15.00',
    bounds: { minLat: 51.505, maxLat: 51.52, minLng: -0.115, maxLng: -0.065 },
  },
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

const checkCongestionCompliance = (vehicle: Vehicle): boolean => {
  return vehicle.fuelType === 'ELECTRIC';
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

const isInsideZone = (lat: number, lng: number, zone: typeof ZONES.ULEZ): boolean => {
  return (
    lat >= zone.bounds.minLat &&
    lat <= zone.bounds.maxLat &&
    lng >= zone.bounds.minLng &&
    lng <= zone.bounds.maxLng
  );
};

const sendZoneNotification = async (zoneName: string, charge: string, isCompliant: boolean | null) => {
  if (zoneName === 'ULEZ' && isCompliant) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ Entering ${zoneName}`,
      body: isCompliant
        ? `Your vehicle is exempt from the ${zoneName} charge.`
        : `Daily charge of ${charge} applies. Pay at tfl.gov.uk before midnight.`,
      sound: true,
    },
    trigger: null,
  });
};

export default function HomeScreen() {
  const { colors, mode } = useAppTheme();

  const [registration, setRegistration] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState('');
  const [activeZones, setActiveZones] = useState<string[]>([]);
  const [tracking, setTracking] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const previousZonesRef = useRef<string[]>([]);
  const vehicleRef = useRef<Vehicle | null>(null);

  useEffect(() => {
    vehicleRef.current = vehicle;
  }, [vehicle]);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    };
    requestNotificationPermission();
  }, []);

  const isCompliant = vehicle ? checkUlezCompliance(vehicle) : null;
  const isCongestionCompliant = vehicle ? checkCongestionCompliance(vehicle) : null;

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Location permission denied. Please enable in settings.');
      return;
    }

    setTracking(true);
    setLocationError('');

    await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (newLocation) => {
        setLocation(newLocation);
        const { latitude, longitude } = newLocation.coords;

        const zonesEntered: string[] = [];
        if (isInsideZone(latitude, longitude, ZONES.ULEZ)) zonesEntered.push('ULEZ');
        if (isInsideZone(latitude, longitude, ZONES.CONGESTION)) zonesEntered.push('CONGESTION');

        const previousZones = previousZonesRef.current;
        zonesEntered.forEach((zone) => {
          if (!previousZones.includes(zone)) {
            const zoneData = zone === 'ULEZ' ? ZONES.ULEZ : ZONES.CONGESTION;
            const currentVehicle = vehicleRef.current;
            const compliant = currentVehicle ? checkUlezCompliance(currentVehicle) : null;
            sendZoneNotification(zoneData.name, zoneData.dailyCharge, compliant);
          }
        });

        previousZonesRef.current = zonesEntered;
        setActiveZones(zonesEntered);
      }
    );
  };

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

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.accent }]}>ZoneAlert</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>UK Charging Zone Tracker</Text>

      <View style={[styles.notifBanner, { backgroundColor: colors.card }]}>
        <Text style={[styles.notifText, { color: colors.textSecondary }]}>
          {notificationsEnabled ? '🔔 Notifications enabled' : '🔕 Notifications disabled — check settings'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Vehicle</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.accent }]}
          placeholder="e.g. AB12 CDE"
          placeholderTextColor={colors.textMuted}
          value={registration}
          onChangeText={setRegistration}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent }]} onPress={handleCheck}>
          <Text style={styles.buttonText}>Check Vehicle</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />}
        {error !== '' && <Text style={[styles.errorText, { color: colors.accent }]}>{error}</Text>}

        {vehicle && (
          <View style={[styles.resultCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>{vehicle.make} {vehicle.model}</Text>
            <Text style={[styles.vehicleDetail, { color: colors.textSecondary }]}>Year: {vehicle.year}</Text>
            <Text style={[styles.vehicleDetail, { color: colors.textSecondary }]}>Fuel: {vehicle.fuelType}</Text>
            <Text style={[styles.vehicleDetail, { color: colors.textSecondary }]}>Euro Status: {vehicle.euroStatus ?? 'N/A'}</Text>

            <View style={[styles.complianceBadge, { backgroundColor: isCompliant ? '#1a4731' : '#4a1a1a' }]}>
              <Text style={styles.complianceText}>
                {isCompliant ? '✅ ULEZ Compliant' : '❌ NOT ULEZ Compliant'}
              </Text>
            </View>

            <View style={[styles.complianceBadge, { backgroundColor: isCongestionCompliant ? '#1a4731' : '#4a1a1a' }]}>
              <Text style={styles.complianceText}>
                {isCongestionCompliant ? '✅ Congestion Charge Exempt' : '❌ Congestion Charge Applies'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Zone Tracking</Text>

        {!tracking ? (
          <TouchableOpacity style={[styles.trackButton, { backgroundColor: colors.cardAlt, borderColor: colors.accentAlt }]} onPress={startTracking}>
            <Text style={[styles.buttonText, { color: mode === 'light' ? '#000000' : '#ffffff' }]}>📍 Start Tracking</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.trackingActive, { backgroundColor: colors.cardAlt }]}>
            <Text style={[styles.trackingText, { color: colors.accentAlt }]}>🟢 Tracking Active</Text>
            {location && (
              <Text style={[styles.coordText, { color: colors.textSecondary }]}>
                Lat: {location.coords.latitude.toFixed(4)} | Lng: {location.coords.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        )}

        {locationError !== '' && <Text style={[styles.errorText, { color: colors.accent }]}>{locationError}</Text>}

        {tracking && (
          <View style={styles.zoneStatus}>
            <View style={[styles.zonePill, { backgroundColor: activeZones.includes('ULEZ') ? '#4a1a1a' : '#1a3a2a', borderColor: activeZones.includes('ULEZ') ? colors.accent : colors.accentAlt }]}>
              <Text style={styles.zoneText}>
                {activeZones.includes('ULEZ') ? '⚠️ Inside ULEZ' : '✅ Outside ULEZ'}
              </Text>
              {activeZones.includes('ULEZ') && !isCompliant && vehicle && (
                <Text style={styles.chargeText}>Charge: {ZONES.ULEZ.dailyCharge}</Text>
              )}
              {activeZones.includes('ULEZ') && isCompliant && (
                <Text style={styles.chargeText}>Your vehicle is exempt</Text>
              )}
            </View>

            <View style={[styles.zonePill, { backgroundColor: activeZones.includes('CONGESTION') ? '#4a1a1a' : '#1a3a2a', borderColor: activeZones.includes('CONGESTION') ? colors.accent : colors.accentAlt }]}>
              <Text style={styles.zoneText}>
                {activeZones.includes('CONGESTION') ? '⚠️ Inside Congestion Zone' : '✅ Outside Congestion Zone'}
              </Text>
              {activeZones.includes('CONGESTION') && (
                <Text style={styles.chargeText}>Charge: {ZONES.CONGESTION.dailyCharge}</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  notifBanner: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  notifText: {
    fontSize: 13,
  },
  section: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    fontSize: 18,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
  trackButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vehicleDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  complianceBadge: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  complianceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  trackingActive: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  trackingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  coordText: {
    fontSize: 12,
    marginTop: 6,
  },
  zoneStatus: {
    marginTop: 16,
    gap: 12,
  },
  zonePill: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  zoneText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  chargeText: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});