import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  duration: number;
  type: 'slowMotion' | 'speedBoost' | 'multiWall' | 'shield';
}

interface PowerUpStoreProps {
  visible: boolean;
  onClose: () => void;
  gems: number;
  onPurchase: (powerUp: PowerUp) => void;
  ownedPowerUps: { [key: string]: number };
}

const POWER_UPS: PowerUp[] = [
  {
    id: 'slowMotion',
    name: 'Slow Motion',
    description: 'Slows down all balls for 10 seconds',
    icon: '⏰',
    cost: 25,
    duration: 10000,
    type: 'slowMotion',
  },
  {
    id: 'speedBoost',
    name: 'Speed Boost',
    description: 'Build walls 2x faster for 15 seconds',
    icon: '⚡',
    cost: 20,
    duration: 15000,
    type: 'speedBoost',
  },
  {
    id: 'multiWall',
    name: 'Multi-Wall',
    description: 'Build multiple walls simultaneously',
    icon: '🧱',
    cost: 35,
    duration: 20000,
    type: 'multiWall',
  },
  {
    id: 'shield',
    name: 'Shield',
    description: 'Protects walls from ball destruction',
    icon: '🛡️',
    cost: 30,
    duration: 25000,
    type: 'shield',
  },
];

export function PowerUpStore({ 
  visible, 
  onClose, 
  gems, 
  onPurchase, 
  ownedPowerUps 
}: PowerUpStoreProps) {
  const handlePurchase = (powerUp: PowerUp) => {
    if (gems >= powerUp.cost) {
      onPurchase(powerUp);
    } else {
      Alert.alert(
        'Insufficient Gems',
        `You need ${powerUp.cost} gems to purchase this power-up. You have ${gems} gems.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Power-Up Store</Text>
            <View style={styles.gemsDisplay}>
              <Text style={styles.gemsText}>{gems} 💎</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollView}>
            {POWER_UPS.map((powerUp) => {
              const owned = ownedPowerUps[powerUp.id] || 0;
              const canAfford = gems >= powerUp.cost;

              return (
                <View key={powerUp.id} style={styles.powerUpCard}>
                  <View style={styles.powerUpHeader}>
                    <Text style={styles.powerUpIcon}>{powerUp.icon}</Text>
                    <View style={styles.powerUpInfo}>
                      <Text style={styles.powerUpName}>{powerUp.name}</Text>
                      <Text style={styles.powerUpDescription}>
                        {powerUp.description}
                      </Text>
                      <Text style={styles.powerUpDuration}>
                        Duration: {powerUp.duration / 1000}s
                      </Text>
                    </View>
                  </View>

                  <View style={styles.powerUpFooter}>
                    <View style={styles.ownedContainer}>
                      <Text style={styles.ownedText}>Owned: {owned}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.purchaseButton,
                        !canAfford && styles.purchaseButtonDisabled,
                      ]}
                      onPress={() => handlePurchase(powerUp)}
                      disabled={!canAfford}
                    >
                      <Text style={[
                        styles.purchaseButtonText,
                        !canAfford && styles.purchaseButtonTextDisabled,
                      ]}>
                        {powerUp.cost} 💎
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#334155',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gemsDisplay: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gemsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  powerUpCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  powerUpHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  powerUpIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  powerUpInfo: {
    flex: 1,
  },
  powerUpName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  powerUpDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  powerUpDuration: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
  },
  powerUpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownedContainer: {
    backgroundColor: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownedText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  purchaseButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#475569',
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  purchaseButtonTextDisabled: {
    color: '#64748B',
  },
  footer: {
    padding: 16,
    backgroundColor: '#334155',
  },
  closeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});