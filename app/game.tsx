import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  PanResponder,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface Ball {
  id: string;
  position: [number, number];
  velocity: [number, number];
  radius: number;
  color: string;
}

interface Wall {
  id: string;
  start: [number, number];
  end: [number, number];
  isComplete: boolean;
}

interface GameScreenProps {
  onBackToMenu: () => void;
}

export default function GameScreen({ onBackToMenu }: GameScreenProps) {
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gems, setGems] = useState(100);
  const [areaCleared, setAreaCleared] = useState(0);
  const [targetArea, setTargetArea] = useState(75);
  
  const [balls, setBalls] = useState<Ball[]>([
    {
      id: 'ball1',
      position: [width * 0.3, height * 0.4],
      velocity: [2, 1.5],
      radius: 15,
      color: '#F59E0B',
    },
    {
      id: 'ball2',
      position: [width * 0.7, height * 0.6],
      velocity: [-1.5, 2],
      radius: 12,
      color: '#6366F1',
    },
  ]);
  
  const [walls, setWalls] = useState<Wall[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStart, setBuildStart] = useState<[number, number] | null>(null);
  const [currentBuildEnd, setCurrentBuildEnd] = useState<[number, number] | null>(null);

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Game physics loop
  useEffect(() => {
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (gameState === 'playing') {
        setBalls(prevBalls => 
          prevBalls.map(ball => {
            let newPosition = [...ball.position] as [number, number];
            let newVelocity = [...ball.velocity] as [number, number];

            // Apply velocity
            newPosition[0] += newVelocity[0];
            newPosition[1] += newVelocity[1];

            // Bounce off screen boundaries
            if (newPosition[0] + ball.radius > width || newPosition[0] - ball.radius < 0) {
              newVelocity[0] *= -1;
              newPosition[0] = Math.max(ball.radius, Math.min(width - ball.radius, newPosition[0]));
            }
            
            if (newPosition[1] + ball.radius > height * 0.8 || newPosition[1] - ball.radius < height * 0.2) {
              newVelocity[1] *= -1;
              newPosition[1] = Math.max(height * 0.2 + ball.radius, Math.min(height * 0.8 - ball.radius, newPosition[1]));
            }

            return {
              ...ball,
              position: newPosition,
              velocity: newVelocity,
            };
          })
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  const handleTouchStart = (event: any) => {
    if (gameState !== 'playing') return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const touchX = event.nativeEvent.locationX;
    const touchY = event.nativeEvent.locationY;
    
    setIsBuilding(true);
    setBuildStart([touchX, touchY]);
    setCurrentBuildEnd([touchX, touchY]);
  };

  const handleTouchMove = (event: any) => {
    if (!isBuilding || !buildStart) return;
    
    const touchX = event.nativeEvent.locationX;
    const touchY = event.nativeEvent.locationY;
    
    setCurrentBuildEnd([touchX, touchY]);
  };

  const handleTouchEnd = (event: any) => {
    if (!isBuilding || !buildStart) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const touchX = event.nativeEvent.locationX;
    const touchY = event.nativeEvent.locationY;
    
    const distance = Math.sqrt(
      Math.pow(touchX - buildStart[0], 2) + Math.pow(touchY - buildStart[1], 2)
    );
    
    if (distance > 20) { // Minimum wall length
      const newWall: Wall = {
        id: `wall_${Date.now()}`,
        start: buildStart,
        end: [touchX, touchY],
        isComplete: true,
      };
      
      setWalls(prev => [...prev, newWall]);
      setScore(prev => prev + 10);
      setAreaCleared(prev => Math.min(100, prev + 3));
    }
    
    setIsBuilding(false);
    setBuildStart(null);
    setCurrentBuildEnd(null);
  };

  const nextLevel = () => {
    if (areaCleared >= targetArea) {
      setLevel(prev => prev + 1);
      setAreaCleared(0);
      setTargetArea(Math.min(90, targetArea + 5));
      setGems(prev => prev + 50);
      setWalls([]);
      
      // Add more balls
      if (level % 2 === 0) {
        setBalls(prev => [...prev, {
          id: `ball_${Date.now()}`,
          position: [Math.random() * width * 0.8 + width * 0.1, Math.random() * height * 0.4 + height * 0.3],
          velocity: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4],
          radius: 10 + Math.random() * 8,
          color: Math.random() > 0.5 ? '#F59E0B' : '#6366F1',
        }]);
      }
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: handleTouchStart,
    onPanResponderMove: handleTouchMove,
    onPanResponderRelease: handleTouchEnd,
  });

  const progressPercentage = (areaCleared / targetArea) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBackToMenu}>
            <Text style={styles.buttonText}>← Menu</Text>
          </TouchableOpacity>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Level {level}</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>
          
          <View style={styles.gemsContainer}>
            <Text style={styles.gemsValue}>{gems} 💎</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            Area Cleared: {areaCleared}% / {targetArea}%
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(100, progressPercentage)}%` }
              ]} 
            />
          </View>
        </View>
      </View>
      
      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Balls */}
        {balls.map(ball => (
          <View
            key={ball.id}
            style={[
              styles.ball,
              {
                left: ball.position[0] - ball.radius,
                top: ball.position[1] - ball.radius,
                width: ball.radius * 2,
                height: ball.radius * 2,
                backgroundColor: ball.color,
                borderRadius: ball.radius,
              },
            ]}
          />
        ))}
        
        {/* Completed Walls */}
        {walls.map(wall => {
          const length = Math.sqrt(
            Math.pow(wall.end[0] - wall.start[0], 2) + 
            Math.pow(wall.end[1] - wall.start[1], 2)
          );
          const angle = Math.atan2(
            wall.end[1] - wall.start[1], 
            wall.end[0] - wall.start[0]
          ) * 180 / Math.PI;
          
          return (
            <View
              key={wall.id}
              style={[
                styles.wall,
                {
                  left: wall.start[0],
                  top: wall.start[1] - 2,
                  width: length,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}
        
        {/* Building Wall Preview */}
        {isBuilding && buildStart && currentBuildEnd && (
          <View
            style={[
              styles.buildingWall,
              {
                left: buildStart[0],
                top: buildStart[1] - 2,
                width: Math.sqrt(
                  Math.pow(currentBuildEnd[0] - buildStart[0], 2) + 
                  Math.pow(currentBuildEnd[1] - buildStart[1], 2)
                ),
                transform: [{
                  rotate: `${Math.atan2(
                    currentBuildEnd[1] - buildStart[1], 
                    currentBuildEnd[0] - buildStart[0]
                  ) * 180 / Math.PI}deg`
                }],
              },
            ]}
          />
        )}
      </View>
      
      {/* Power-up buttons */}
      <View style={styles.powerUpBar}>
        <TouchableOpacity style={styles.powerUpButton}>
          <Text style={styles.powerUpText}>⏰ Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.powerUpButton}>
          <Text style={styles.powerUpText}>⚡ Speed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.powerUpButton}>
          <Text style={styles.powerUpText}>🧱 Multi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.powerUpButton}>
          <Text style={styles.powerUpText}>🛡️ Shield</Text>
        </TouchableOpacity>
      </View>
      
      {areaCleared >= targetArea && (
        <View style={styles.levelComplete}>
          <Text style={styles.levelCompleteText}>Level Complete!</Text>
          <TouchableOpacity style={styles.nextLevelButton} onPress={nextLevel}>
            <Text style={styles.nextLevelButtonText}>Next Level</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  hud: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  scoreValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gemsContainer: {
    alignItems: 'flex-end',
  },
  gemsValue: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  ball: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  wall: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#6366F1',
    borderRadius: 2,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  buildingWall: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    opacity: 0.7,
  },
  powerUpBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#334155',
    justifyContent: 'space-around',
  },
  powerUpButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  powerUpText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  levelComplete: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: '#6366F1',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  levelCompleteText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nextLevelButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextLevelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});