import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { MainMenu } from '@/components/MainMenu';
import { LevelSelect } from '@/components/LevelSelect';
import { Settings } from '@/components/Settings';
import GameScreen from './game';

type Screen = 'menu' | 'game' | 'levelSelect' | 'settings';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [currentLevel, setCurrentLevel] = useState(3); // Player has unlocked up to level 3

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleLevelSelect = () => {
    setCurrentScreen('levelSelect');
  };

  const handleSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  const handleSelectLevel = (level: any) => {
    // Start game with selected level
    setCurrentScreen('game');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'game':
        return <GameScreen onBackToMenu={handleBackToMenu} />;
      case 'levelSelect':
        return (
          <LevelSelect
            onBackToMenu={handleBackToMenu}
            onSelectLevel={handleSelectLevel}
            currentLevel={currentLevel}
          />
        );
      case 'settings':
        return <Settings onBackToMenu={handleBackToMenu} />;
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