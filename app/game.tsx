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
import { PowerUpStore } from '@/components/PowerUpStore';
import { AchievementToast } from '@/components/AchievementToast';
import { ParticleEffect } from '@/components/ParticleEffect';

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
  isShielded?: boolean;
}

interface PowerUpState {
  slowMotion: { active: boolean; endTime: number };
  speedBoost: { active: boolean; endTime: number };
  multiWall: { active: boolean; endTime: number };
  shield: { active: boolean; endTime: number };
}

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  duration: number;
  type: 'slowMotion' | 'speedBoost' | 'multiWall' | 'shield';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ParticleState {
  active: boolean;
  position: [number, number];
  type: 'explosion' | 'trail' | 'powerup';
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
  const [clearedAreas, setClearedAreas] = useState<{x: number, y: number, width: number, height: number}[]>([]);
  const [showPowerUpStore, setShowPowerUpStore] = useState(false);
  const [ownedPowerUps, setOwnedPowerUps] = useState<{ [key: string]: number }>({
    slowMotion: 2,
    speedBoost: 1,
    multiWall: 0,
    shield: 1,
  });
  const [powerUpStates, setPowerUpStates] = useState<PowerUpState>({
    slowMotion: { active: false, endTime: 0 },
    speedBoost: { active: false, endTime: 0 },
    multiWall: { active: false, endTime: 0 },
    shield: { active: false, endTime: 0 },
  });
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [particles, setParticles] = useState<ParticleState[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  
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

  // Achievement definitions
  const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_wall', title: 'First Steps', description: 'Build your first wall', icon: '🧱', rarity: 'common' },
    { id: 'level_5', title: 'Getting Started', description: 'Reach level 5', icon: '🎯', rarity: 'common' },
    { id: 'power_user', title: 'Power User', description: 'Use 10 power-ups', icon: '⚡', rarity: 'rare' },
    { id: 'wall_master', title: 'Wall Master', description: 'Build 100 walls', icon: '🏗️', rarity: 'rare' },
    { id: 'gem_collector', title: 'Gem Collector', description: 'Collect 1000 gems', icon: '💎', rarity: 'epic' },
    { id: 'perfectionist', title: 'Perfectionist', description: 'Clear 100% of an arena', icon: '✨', rarity: 'legendary' },
  ];

  // Achievement checking
  const checkAchievements = (newScore: number, newLevel: number, wallsBuilt: number, gemsTotal: number) => {
    const toCheck = [
      { id: 'first_wall', condition: wallsBuilt >= 1 },
      { id: 'level_5', condition: newLevel >= 5 },
      { id: 'wall_master', condition: wallsBuilt >= 100 },
      { id: 'gem_collector', condition: gemsTotal >= 1000 },
      { id: 'perfectionist', condition: areaCleared >= 100 },
    ];

    toCheck.forEach(({ id, condition }) => {
      if (condition && !unlockedAchievements.includes(id)) {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) {
          setUnlockedAchievements(prev => [...prev, id]);
          setCurrentAchievement(achievement);
          
          // Add particle effect
          setParticles(prev => [...prev, {
            active: true,
            position: [width / 2, height / 2],
            type: 'powerup'
          }]);
          
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }
    });
  };

  // Add particle effect helper
  const addParticleEffect = (position: [number, number], type: 'explosion' | 'trail' | 'powerup') => {
    setParticles(prev => [...prev, { active: true, position, type }]);
    
    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.slice(1));
    }, 2000);
  };

  // Calculate cleared areas based on walls and ball positions
  const calculateClearedAreas = (currentWalls: Wall[], currentBalls: Ball[]) => {
    // Simple area calculation - create rectangles around walls that don't contain balls
    const newClearedAreas: {x: number, y: number, width: number, height: number}[] = [];
    
    // For each wall, check if it creates a safe zone (no balls nearby)
    currentWalls.forEach(wall => {
      const wallLength = Math.sqrt(
        Math.pow(wall.end[0] - wall.start[0], 2) + Math.pow(wall.end[1] - wall.start[1], 2)
      );
      
      // Create a rectangular area around the wall
      const centerX = (wall.start[0] + wall.end[0]) / 2;
      const centerY = (wall.start[1] + wall.end[1]) / 2;
      const areaSize = Math.min(wallLength / 2, 50); // Limit area size
      
      // Check if any balls are in this area
      const hasBalls = currentBalls.some(ball => {
        const distance = Math.sqrt(
          Math.pow(ball.position[0] - centerX, 2) + Math.pow(ball.position[1] - centerY, 2)
        );
        return distance < areaSize + ball.radius;
      });
      
      if (!hasBalls && wallLength > 30) { // Only count significant walls
        newClearedAreas.push({
          x: centerX - areaSize,
          y: centerY - areaSize,
          width: areaSize * 2,
          height: areaSize * 2,
        });
      }
    });
    
    setClearedAreas(newClearedAreas);
    
    // Calculate total cleared percentage
    const totalGameArea = (width - 20) * (height * 0.6); // Game area size
    const clearedArea = newClearedAreas.reduce((total, area) => total + (area.width * area.height), 0);
    const clearedPercentage = Math.min(100, (clearedArea / totalGameArea) * 100);
    
    return clearedPercentage;
  };

  // Power-up functions
  const usePowerUp = (type: 'slowMotion' | 'speedBoost' | 'multiWall' | 'shield') => {
    if (ownedPowerUps[type] > 0) {
      const currentTime = Date.now();
      const duration = type === 'slowMotion' ? 10000 : 
                      type === 'speedBoost' ? 15000 : 
                      type === 'multiWall' ? 20000 : 25000;
      
      setPowerUpStates(prev => ({
        ...prev,
        [type]: { active: true, endTime: currentTime + duration }
      }));
      
      setOwnedPowerUps(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handlePowerUpPurchase = (powerUp: PowerUp) => {
    if (gems >= powerUp.cost) {
      setGems(prev => prev - powerUp.cost);
      setOwnedPowerUps(prev => ({
        ...prev,
        [powerUp.type]: (prev[powerUp.type] || 0) + 1
      }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Check for expired power-ups
  useEffect(() => {
    const checkPowerUps = () => {
      const currentTime = Date.now();
      setPowerUpStates(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          const powerUp = newState[key as keyof PowerUpState];
          if (powerUp.active && currentTime > powerUp.endTime) {
            powerUp.active = false;
            powerUp.endTime = 0;
          }
        });
        return newState;
      });
    };

    const interval = setInterval(checkPowerUps, 100);
    return () => clearInterval(interval);
  }, []);

  // Wall collision detection
  const checkWallCollision = (ballPos: [number, number], ballRadius: number, walls: Wall[]) => {
    for (const wall of walls) {
      const { start, end } = wall;
      const wallLength = Math.sqrt(
        Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
      );
      
      // Vector from start to end of wall
      const wallVec = [(end[0] - start[0]) / wallLength, (end[1] - start[1]) / wallLength];
      
      // Vector from start of wall to ball
      const ballVec = [ballPos[0] - start[0], ballPos[1] - start[1]];
      
      // Project ball position onto wall
      const projection = ballVec[0] * wallVec[0] + ballVec[1] * wallVec[1];
      
      if (projection >= 0 && projection <= wallLength) {
        // Find closest point on wall to ball
        const closestPoint = [
          start[0] + projection * wallVec[0],
          start[1] + projection * wallVec[1]
        ];
        
        // Check distance from ball to closest point
        const distance = Math.sqrt(
          Math.pow(ballPos[0] - closestPoint[0], 2) + 
          Math.pow(ballPos[1] - closestPoint[1], 2)
        );
        
        if (distance <= ballRadius + 2) { // 2 is half wall thickness
          return { collision: true, wall, closestPoint };
        }
      }
    }
    return { collision: false };
  };

  // Game physics loop
  useEffect(() => {
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (gameState === 'playing') {
        setBalls(prevBalls => {
          const newBalls = prevBalls.map(ball => {
            let newPosition = [...ball.position] as [number, number];
            let newVelocity = [...ball.velocity] as [number, number];

            // Apply slow motion effect
            const speedMultiplier = powerUpStates.slowMotion.active ? 0.3 : 1.0;
            
            // Apply velocity with speed modifier
            newPosition[0] += newVelocity[0] * speedMultiplier;
            newPosition[1] += newVelocity[1] * speedMultiplier;

            // Check wall collisions
            const wallCollision = checkWallCollision(newPosition, ball.radius, walls);
            if (wallCollision.collision && wallCollision.wall) {
              // Reflect velocity based on wall normal
              const wall = wallCollision.wall;
              const wallVec = [
                wall.end[0] - wall.start[0],
                wall.end[1] - wall.start[1]
              ];
              const wallLength = Math.sqrt(wallVec[0] * wallVec[0] + wallVec[1] * wallVec[1]);
              const wallNormal = [-wallVec[1] / wallLength, wallVec[0] / wallLength];
              
              // Reflect velocity
              const dotProduct = newVelocity[0] * wallNormal[0] + newVelocity[1] * wallNormal[1];
              newVelocity[0] -= 2 * dotProduct * wallNormal[0];
              newVelocity[1] -= 2 * dotProduct * wallNormal[1];
              
              // Move ball away from wall
              newPosition[0] = ball.position[0];
              newPosition[1] = ball.position[1];
              
              // Destroy wall if not shielded
              if (!wall.isShielded && !powerUpStates.shield.active) {
                setWalls(prevWalls => prevWalls.filter(w => w.id !== wall.id));
              }
            }

            // Define game area boundaries (with padding for UI)
            const gameAreaLeft = 10;
            const gameAreaRight = width - 10;
            const gameAreaTop = 10;
            const gameAreaBottom = height * 0.8 - 10; // Leave space for power-up bar
            
            // Bounce off game area boundaries
            if (newPosition[0] + ball.radius > gameAreaRight || newPosition[0] - ball.radius < gameAreaLeft) {
              newVelocity[0] *= -1;
              newPosition[0] = Math.max(gameAreaLeft + ball.radius, Math.min(gameAreaRight - ball.radius, newPosition[0]));
            }
            
            if (newPosition[1] + ball.radius > gameAreaBottom || newPosition[1] - ball.radius < gameAreaTop) {
              newVelocity[1] *= -1;
              newPosition[1] = Math.max(gameAreaTop + ball.radius, Math.min(gameAreaBottom - ball.radius, newPosition[1]));
            }

            return {
              ...ball,
              position: newPosition,
              velocity: newVelocity,
            };
          });
          
          // Recalculate cleared areas with new ball positions
          setTimeout(() => {
            const newClearedPercentage = calculateClearedAreas(walls, newBalls);
            setAreaCleared(newClearedPercentage);
          }, 0);
          
          return newBalls;
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, walls, powerUpStates]);

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
      const baseWall: Wall = {
        id: `wall_${Date.now()}`,
        start: buildStart,
        end: [touchX, touchY],
        isComplete: true,
        isShielded: powerUpStates.shield.active,
      };
      
      const newWalls = [baseWall];
      
      // Multi-wall power-up: create additional parallel walls
      if (powerUpStates.multiWall.active) {
        const wallVec = [touchX - buildStart[0], touchY - buildStart[1]];
        const wallLength = Math.sqrt(wallVec[0] * wallVec[0] + wallVec[1] * wallVec[1]);
        const wallNormal = [-wallVec[1] / wallLength, wallVec[0] / wallLength];
        
        // Add parallel walls
        for (let i = 1; i <= 2; i++) {
          const offset = i * 30; // 30 pixels apart
          newWalls.push({
            id: `wall_${Date.now()}_${i}`,
            start: [
              buildStart[0] + wallNormal[0] * offset,
              buildStart[1] + wallNormal[1] * offset
            ],
            end: [
              touchX + wallNormal[0] * offset,
              touchY + wallNormal[1] * offset
            ],
            isComplete: true,
            isShielded: powerUpStates.shield.active,
          });
        }
      }
      
      setWalls(prev => {
        const updatedWalls = [...prev, ...newWalls];
        
        // Add particle effect for wall building
        addParticleEffect([touchX, touchY], 'explosion');
        
        // Recalculate cleared areas
        const newClearedPercentage = calculateClearedAreas(updatedWalls, balls);
        setAreaCleared(newClearedPercentage);
        
        // Check achievements
        checkAchievements(score + (10 * newWalls.length), level, updatedWalls.length, gems);
        
        return updatedWalls;
      });
      setScore(prev => prev + (10 * newWalls.length));
    }
    
    setIsBuilding(false);
    setBuildStart(null);
    setCurrentBuildEnd(null);
  };

  const nextLevel = () => {
    if (areaCleared >= targetArea) {
      setLevel(prev => prev + 1);
      setAreaCleared(0);
      setClearedAreas([]);
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
        {/* Game Area Boundaries */}
        <View style={styles.gameAreaBoundary} />
        
        {/* Cleared Areas */}
        {clearedAreas.map((area, index) => (
          <View
            key={`cleared-${index}`}
            style={[
              styles.clearedArea,
              {
                left: area.x,
                top: area.y,
                width: area.width,
                height: area.height,
              },
            ]}
          />
        ))}
        
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
                wall.isShielded && styles.shieldedWall,
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
        <TouchableOpacity 
          style={[
            styles.powerUpButton,
            powerUpStates.slowMotion.active && styles.powerUpButtonActive,
            ownedPowerUps.slowMotion === 0 && styles.powerUpButtonDisabled,
          ]}
          onPress={() => usePowerUp('slowMotion')}
          disabled={ownedPowerUps.slowMotion === 0 || powerUpStates.slowMotion.active}
        >
          <Text style={styles.powerUpText}>⏰ Slow</Text>
          <Text style={styles.powerUpCount}>{ownedPowerUps.slowMotion}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.powerUpButton,
            powerUpStates.speedBoost.active && styles.powerUpButtonActive,
            ownedPowerUps.speedBoost === 0 && styles.powerUpButtonDisabled,
          ]}
          onPress={() => usePowerUp('speedBoost')}
          disabled={ownedPowerUps.speedBoost === 0 || powerUpStates.speedBoost.active}
        >
          <Text style={styles.powerUpText}>⚡ Speed</Text>
          <Text style={styles.powerUpCount}>{ownedPowerUps.speedBoost}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.powerUpButton,
            powerUpStates.multiWall.active && styles.powerUpButtonActive,
            ownedPowerUps.multiWall === 0 && styles.powerUpButtonDisabled,
          ]}
          onPress={() => usePowerUp('multiWall')}
          disabled={ownedPowerUps.multiWall === 0 || powerUpStates.multiWall.active}
        >
          <Text style={styles.powerUpText}>🧱 Multi</Text>
          <Text style={styles.powerUpCount}>{ownedPowerUps.multiWall}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.powerUpButton,
            powerUpStates.shield.active && styles.powerUpButtonActive,
            ownedPowerUps.shield === 0 && styles.powerUpButtonDisabled,
          ]}
          onPress={() => usePowerUp('shield')}
          disabled={ownedPowerUps.shield === 0 || powerUpStates.shield.active}
        >
          <Text style={styles.powerUpText}>🛡️ Shield</Text>
          <Text style={styles.powerUpCount}>{ownedPowerUps.shield}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.storeButton}
          onPress={() => setShowPowerUpStore(true)}
        >
          <Text style={styles.storeButtonText}>🏪</Text>
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
      
      {/* Particle Effects */}
      {particles.map((particle, index) => (
        <ParticleEffect
          key={index}
          active={particle.active}
          position={particle.position}
          type={particle.type}
        />
      ))}
      
      <PowerUpStore
        visible={showPowerUpStore}
        onClose={() => setShowPowerUpStore(false)}
        gems={gems}
        onPurchase={handlePowerUpPurchase}
        ownedPowerUps={ownedPowerUps}
      />
      
      <AchievementToast
        achievement={currentAchievement}
        onComplete={() => setCurrentAchievement(null)}
      />
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
  gameAreaBoundary: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 2,
    borderColor: '#475569',
    borderStyle: 'dashed',
    borderRadius: 8,
    opacity: 0.5,
  },
  clearedArea: {
    position: 'absolute',
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // Green with transparency
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 4,
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
    minWidth: 50,
    position: 'relative',
  },
  powerUpButtonActive: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  powerUpButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.5,
  },
  powerUpText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '600',
  },
  powerUpCount: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  storeButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 40,
  },
  storeButtonText: {
    fontSize: 16,
  },
  shieldedWall: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
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