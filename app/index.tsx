import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { MainMenu } from '@/components/MainMenu';
import GameScreen from './game';

type Screen = 'menu' | 'game' | 'levelSelect' | 'settings';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleLevelSelect = () => {
    Alert.alert('Level Select', 'Level selection coming soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings menu coming soon!');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'game':
        return <GameScreen onBackToMenu={handleBackToMenu} />;
      case 'menu':
      default:
        return (
          <MainMenu
            onStartGame={handleStartGame}
            onLevelSelect={handleLevelSelect}
            onSettings={handleSettings}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
}); 