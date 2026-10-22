import * as THREE from 'three';
import { Coin } from './Coin';
import { EventBus } from '../core/EventBus';

export type CoinPatternType = 'arc' | 'low_line' | 'ribbon' | 'high_arch';

export class CoinManager {
  public group: THREE.Group;
  private coins: Coin[] = [];
  private nextSpawnX: number = 40; // Initial coins spawn 40m ahead
  private spawnAheadDistance: number = 130;
  private consecutiveStreak: number = 0;
  private streakTimeout: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CoinManager';
  }

  public update(
    delta: number,
    playerX: number,
    playerY: number,
    playerZ: number,
    coinRadiusModifier: number = 1.0,
    coinEarningsModifier: number = 1.0
  ): number {
    let coinsCollectedThisFrame = 0;

    // 1. Streak timing
    if (this.streakTimeout > 0) {
      this.streakTimeout -= delta;
      if (this.streakTimeout <= 0) {
        this.consecutiveStreak = 0;
      }
    }

    // 2. Procedural Spawning
    while (this.nextSpawnX < playerX + this.spawnAheadDistance) {
      this.spawnPattern(this.nextSpawnX);
      // Gap to next pattern: 28 to 48 meters
      this.nextSpawnX += 30 + Math.random() * 22;
    }

    // 3. Magnet Attraction & Collection Collision Check
    const effectiveMagnetRadius = 2.4 * coinRadiusModifier;
    const effectivePickupRadius = 1.35;
    const playerTargetY = playerY + 1.1; // Dino center of mass

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];

      // Update coin animation & magnet flight
      const isAnimDone = coin.update(delta, playerX, playerY, playerZ);
      if (isAnimDone) {
        this.group.remove(coin.group);
        this.coins.splice(i, 1);
        continue;
      }

      if (coin.collected) continue;

      // Distance calculation (3D euclidean)
      const dx = coin.posX - playerX;
      const dy = coin.posY - playerTargetY;
      const dz = coin.posZ - playerZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Check magnet activation
      if (dist <= effectiveMagnetRadius && !coin.isAttracted) {
        coin.attract();
      }

      // Check collection
      if (dist <= effectivePickupRadius) {
        coin.triggerCollect();
        this.consecutiveStreak++;
        this.streakTimeout = 1.4; // 1.4s streak window

        const earned = Math.max(1, Math.round(1 * coinEarningsModifier));
        coinsCollectedThisFrame += earned;

        EventBus.emit('coinCollected', {
          amount: earned,
          streak: this.consecutiveStreak,
          posX: coin.posX,
          posY: coin.posY
        });
      }
    }

    // 4. Recycle coins that fell behind
    const recycleX = playerX - 25;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (coin.posX < recycleX) {
        this.group.remove(coin.group);
        coin.dispose();
        this.coins.splice(i, 1);
      }
    }

    return coinsCollectedThisFrame;
  }

  private spawnPattern(startX: number): void {
    const roll = Math.random();
    let pattern: CoinPatternType = 'ribbon';

    if (roll < 0.35) {
      pattern = 'arc';
    } else if (roll < 0.65) {
      pattern = 'low_line';
    } else if (roll < 0.85) {
      pattern = 'ribbon';
    } else {
      pattern = 'high_arch';
    }

    switch (pattern) {
      case 'arc': {
        // Jump arc of 5 coins
        const count = 5;
        const spacing = 2.4;
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1); // 0 to 1
          // Parabola: peaks at y=2.8
          const arcY = 1.0 + Math.sin(t * Math.PI) * 1.9;
          const coin = new Coin(startX + i * spacing, arcY, 0);
          this.coins.push(coin);
          this.group.add(coin.group);
        }
        break;
      }

      case 'low_line': {
        // Low runner line for crouching under flyers
        const count = 4;
        const spacing = 2.2;
        for (let i = 0; i < count; i++) {
          const coin = new Coin(startX + i * spacing, 0.7, 0);
          this.coins.push(coin);
          this.group.add(coin.group);
        }
        break;
      }

      case 'high_arch': {
        // High arch over boulders
        const count = 6;
        const spacing = 2.2;
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1);
          const arcY = 1.2 + Math.sin(t * Math.PI) * 2.3;
          const coin = new Coin(startX + i * spacing, arcY, 0);
          this.coins.push(coin);
          this.group.add(coin.group);
        }
        break;
      }

      case 'ribbon':
      default: {
        // Straight sprint cluster
        const count = 4;
        const spacing = 2.0;
        for (let i = 0; i < count; i++) {
          const coin = new Coin(startX + i * spacing, 1.35, 0);
          this.coins.push(coin);
          this.group.add(coin.group);
        }
        break;
      }
    }
  }

  public reset(): void {
    this.coins.forEach(coin => {
      this.group.remove(coin.group);
      coin.dispose();
    });
    this.coins = [];
    this.nextSpawnX = 40;
    this.consecutiveStreak = 0;
    this.streakTimeout = 0;
  }
}
