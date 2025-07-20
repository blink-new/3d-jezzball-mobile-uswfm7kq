import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Level {
  id: number;
  name: string;
  arenaType: 'cube' | 'sphere' | 'pyramid' | 'hexagon';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  ballCount: number;
  targetArea: number;
  unlocked: boolean;
  completed: boolean;
  bestScore?: number;
}

interface LevelSelectProps {
  onBackToMenu: () => void;
  onSelectLevel: (level: Level) => void;
  currentLevel: number;
}

const LEVELS: Level[] = [
  { id: 1, name: 'First Steps', arenaType: 'cube', difficulty: 'Easy', ballCount: 2, targetArea: 75, unlocked: true, completed: true, bestScore: 1250 },
  { id: 2, name: 'Building Momentum', arenaType: 'cube', difficulty: 'Easy', ballCount: 3, targetArea: 75, unlocked: true, completed: true, bestScore: 2100 },
  { id: 3, name: 'Triple Threat', arenaType: 'cube', difficulty: 'Medium', ballCount: 3, targetArea: 80, unlocked: true, completed: false },
  { id: 4, name: 'Sphere Challenge', arenaType: 'sphere', difficulty: 'Medium', ballCount: 4, targetArea: 80, unlocked: true, completed: false },
  { id: 5, name: 'Curved Chaos', arenaType: 'sphere', difficulty: 'Medium', ballCount: 4, targetArea: 85, unlocked: false, completed: false },
  { id: 6, name: 'Pyramid Power', arenaType: 'pyramid', difficulty: 'Hard', ballCount: 5, targetArea: 85, unlocked: false, completed: false },
  { id: 7, name: 'Angular Assault', arenaType: 'pyramid', difficulty: 'Hard', ballCount: 5, targetArea: 90, unlocked: false, completed: false },
  { id: 8, name: 'Hexagon Haven', arenaType: 'hexagon', difficulty: 'Expert', ballCount: 6, targetArea: 90, unlocked: false, completed: false },
  { id: 9, name: 'Master\'s Trial', arenaType: 'hexagon', difficulty: 'Expert', ballCount: 7, targetArea: 95, unlocked: false, completed: false },
  { id: 10, name: 'Ultimate Challenge', arenaType: 'cube', difficulty: 'Expert', ballCount: 8, targetArea: 95, unlocked: false, completed: false },
];

export function LevelSelect({ onBackToMenu, onSelectLevel, currentLevel }: LevelSelectProps) {
  const getArenaIcon = (type: string) => {
    switch (type) {
      case 'cube': return '🟦';
      case 'sphere': return '🔵';
      case 'pyramid': return '🔺';
      case 'hexagon': return '⬡';
      default: return '🟦';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      case 'Expert': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const handleLevelSelect = (level: Level) => {
    if (level.unlocked) {
      onSelectLevel(level);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToMenu}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Level Select</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.levelsGrid}>
          {LEVELS.map((level) => {
            const isUnlocked = level.id <= currentLevel || level.unlocked;
            
            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  !isUnlocked && styles.levelCardLocked,
                  level.completed && styles.levelCardCompleted,
                ]}
                onPress={() => handleLevelSelect(level)}
                disabled={!isUnlocked}
              >
                <View style={styles.levelHeader}>
                  <Text style={styles.levelNumber}>{level.id}</Text>
                  <Text style={styles.arenaIcon}>{getArenaIcon(level.arenaType)}</Text>
                </View>

                <Text style={[
                  styles.levelName,
                  !isUnlocked && styles.levelNameLocked,
                ]}>
                  {level.name}
                </Text>

                <View style={styles.levelDetails}>
                  <View style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(level.difficulty) },
                    !isUnlocked && styles.difficultyBadgeLocked,
                  ]}>
                    <Text style={styles.difficultyText}>{level.difficulty}</Text>
                  </View>
                  
                  <Text style={[
                    styles.arenaType,
                    !isUnlocked && styles.arenaTypeLocked,
                  ]}>
                    {level.arenaType}
                  </Text>
                </View>

                <View style={styles.levelStats}>
                  <Text style={[
                    styles.statText,
                    !isUnlocked && styles.statTextLocked,
                  ]}>
                    Balls: {level.ballCount}
                  </Text>
                  <Text style={[
                    styles.statText,
                    !isUnlocked && styles.statTextLocked,
                  ]}>
                    Target: {level.targetArea}%
                  </Text>
                </View>

                {level.bestScore && (
                  <View style={styles.bestScore}>
                    <Text style={styles.bestScoreText}>
                      Best: {level.bestScore.toLocaleString()}
                    </Text>
                  </View>
                )}

                {level.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓</Text>
                  </View>
                )}

                {!isUnlocked && (
                  <View style={styles.lockedOverlay}>
                    <Text style={styles.lockedIcon}>🔒</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  scrollContent: {
    padding: 16,
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
    position: 'relative',
  },
  levelCardLocked: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  levelCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#1E293B',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelNumber: {
    color: '#6366F1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  arenaIcon: {
    fontSize: 24,
  },
  levelName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  levelNameLocked: {
    color: '#475569',
  },
  levelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyBadgeLocked: {
    backgroundColor: '#374151',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  arenaType: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  arenaTypeLocked: {
    color: '#475569',
  },
  levelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  statTextLocked: {
    color: '#475569',
  },
  bestScore: {
    alignItems: 'center',
    marginTop: 4,
  },
  bestScoreText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 32,
  },
});