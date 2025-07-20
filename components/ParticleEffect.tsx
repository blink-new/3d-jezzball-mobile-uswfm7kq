import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ParticleEffectProps {
  active: boolean;
  position: [number, number];
  type: 'explosion' | 'trail' | 'powerup';
  color?: string;
}

export function ParticleEffect({ 
  active, 
  position, 
  type, 
  color = '#F59E0B' 
}: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = [];
      const particleCount = type === 'explosion' ? 12 : type === 'powerup' ? 8 : 4;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = type === 'explosion' ? 3 + Math.random() * 4 : 
                     type === 'powerup' ? 2 + Math.random() * 2 : 
                     1 + Math.random() * 2;
        
        newParticles.push({
          id: `particle_${i}_${Date.now()}`,
          x: position[0],
          y: position[1],
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          maxLife: 1.0,
          color: type === 'powerup' ? ['#F59E0B', '#6366F1', '#10B981'][Math.floor(Math.random() * 3)] : color,
          size: type === 'explosion' ? 4 + Math.random() * 4 : 
                type === 'powerup' ? 3 + Math.random() * 3 : 
                2 + Math.random() * 2,
        });
      }
      
      setParticles(newParticles);
    }
  }, [active, position, type, color]);

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prevParticles => {
        const updatedParticles = prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            life: particle.life - 0.02,
          }))
          .filter(particle => particle.life > 0);

        return updatedParticles;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [particles.length]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life,
              borderRadius: particle.size / 2,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});