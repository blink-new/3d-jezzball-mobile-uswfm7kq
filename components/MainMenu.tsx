import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface MainMenuProps {
  onStartGame: () => void;
  onLevelSelect: () => void;
  onSettings: () => void;
}

export function MainMenu({ onStartGame, onLevelSelect, onSettings }: MainMenuProps) {
  const [selectedArena, setSelectedArena] = useState<'cube' | 'sphere' | 'pyramid'>('cube');

  const handleArenaSelect = (type: 'cube' | 'sphere' | 'pyramid') => {
    setSelectedArena(type);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>3D Jezzball</Text>
        <Text style={styles.subtitle}>Mobile Edition</Text>
      </View>

      <View style={styles.previewContainer}>
        <View style={styles.mockPreview}>
          <Text style={styles.previewText}>🎮</Text>
          <Text style={styles.previewSubtext}>3D Arena Preview</Text>
          <Text style={styles.arenaType}>{selectedArena.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.arenaSelector}>
        <Text style={styles.arenaSelectorTitle}>Select Arena Type</Text>
        <View style={styles.arenaButtons}>
          {(['cube', 'sphere', 'pyramid'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.arenaButton,
                selectedArena === type && styles.arenaButtonSelected,
              ]}
              onPress={() => handleArenaSelect(type)}
            >
              <Text style={[
                styles.arenaButtonText,
                selectedArena === type && styles.arenaButtonTextSelected,
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.menuButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={onStartGame}>
          <Text style={styles.primaryButtonText}>Start Game</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onLevelSelect}>
          <Text style={styles.secondaryButtonText}>Level Select</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onSettings}>
          <Text style={styles.secondaryButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Touch and drag to build walls • Trap the balls • Clear the arena
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6366F1',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  previewContainer: {
    height: height * 0.35,
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockPreview: {
    alignItems: 'center',
  },
  previewText: {
    fontSize: 64,
    marginBottom: 10,
  },
  previewSubtext: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 8,
  },
  arenaType: {
    color: '#6366F1',
    fontSize: 24,
    fontWeight: 'bold',
  },
  arenaSelector: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  arenaSelectorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  arenaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  arenaButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  arenaButtonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#F59E0B',
  },
  arenaButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  arenaButtonTextSelected: {
    color: '#FFFFFF',
  },
  menuButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});