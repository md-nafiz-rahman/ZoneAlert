import { useAppTheme } from '@/contexts/AppThemeContext';
import * as Notifications from 'expo-notifications';
import { Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { mode, colors, toggleTheme } = useAppTheme();

  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Test Notification',
        body: 'This is what a zone alert will look like.',
        sound: true,
      },
      trigger: null,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.accent }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Preferences and app info
      </Text>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>
              {mode === 'dark' ? 'Currently on' : 'Currently off'}
            </Text>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#3a3a4e', true: colors.accentAlt }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>

        <TouchableOpacity
          style={[styles.testButton, { borderColor: colors.accentAlt, backgroundColor: colors.cardAlt }]}
          onPress={sendTestNotification}
        >
          <Text style={[styles.testButtonText, { color: colors.text }]}>
            Send Test Notification
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          ZoneAlert tracks ULEZ and Congestion Charge zones for UK drivers,
          checking your vehicle's compliance and alerting you as you enter
          each zone.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://tfl.gov.uk/modes/driving/check-your-vehicle')}
        >
          <Text style={[styles.link, { color: colors.accentAlt }]}>
            Check your vehicle on TfL.gov.uk →
          </Text>
        </TouchableOpacity>
        <Text style={[styles.versionText, { color: colors.textMuted }]}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 32,
  },
  section: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 13,
  },
  testButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  link: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
  },
});