import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';

interface SettingsProps {
  onBackToMenu: () => void;
}

export function Settings({ onBackToMenu }: SettingsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [particleEffects, setParticleEffects] = useState(true);
  const [showFPS, setShowFPS] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Normal' | 'Hard'>('Normal');

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all game progress? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Progress Reset', 'All progress has been reset.');
          }
        },
      ]
    );
  };

  const handleRestorePurchases = () => {
    Alert.alert('Restore Purchases', 'Checking for previous purchases...');
  };

  const SettingRow = ({ 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    type = 'switch' 
  }: {
    title: string;
    subtitle?: string;
    value: boolean | string;
    onValueChange: (value: any) => void;
    type?: 'switch' | 'select';
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onValueChange}
          trackColor={{ false: '#374151', true: '#6366F1' }}
          thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
        />
      ) : (
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>{value as string}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToMenu}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio & Haptics</Text>
          
          <SettingRow
            title="Sound Effects"
            subtitle="Enable game sound effects"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
          />
          
          <SettingRow
            title="Haptic Feedback"
            subtitle="Vibration feedback for touch interactions"
            value={hapticEnabled}
            onValueChange={setHapticEnabled}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Graphics</Text>
          
          <SettingRow
            title="Particle Effects"
            subtitle="Visual effects for ball trails and explosions"
            value={particleEffects}
            onValueChange={setParticleEffects}
          />
          
          <SettingRow
            title="Show FPS"
            subtitle="Display frame rate counter"
            value={showFPS}
            onValueChange={setShowFPS}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gameplay</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Difficulty</Text>
              <Text style={styles.settingSubtitle}>Affects ball speed and physics</Text>
            </View>
            <View style={styles.difficultySelector}>
              {(['Easy', 'Normal', 'Hard'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty === level && styles.difficultyButtonSelected,
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    difficulty === level && styles.difficultyButtonTextSelected,
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleResetProgress}>
            <Text style={styles.actionButtonText}>Reset Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleRestorePurchases}>
            <Text style={styles.actionButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.01.20</Text>
          </View>
          
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E293B',
  },
  backButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
  },
  selectButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 4,
  },
  difficultyButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  difficultyButtonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#F59E0B',
  },
  difficultyButtonText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  difficultyButtonTextSelected: {
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
});