import * as THREE from 'three';
import { ObstacleFactory, ObstacleInstance, ObstacleType } from './ObstacleFactory';
import { CollisionMath, BoundingBox3D } from '../utils/Collisions';
import { EventBus } from '../core/EventBus';

export class ObstacleManager {
  public group: THREE.Group;
  private obstacles: ObstacleInstance[] = [];
  private nextSpawnX: number = 75; // Initial obstacle spawns 75m ahead for smooth warm-up
  private spawnAheadDistance: number = 140; // Maintain obstacles up to 140m ahead

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'ObstacleManager';
  }

  public update(
    delta: number,
    playerX: number,
    playerY: number,
    playerZ: number,
    isCrouching: boolean,
    speed: number,
    distance: number
  ): boolean {
    // 1. Update animated obstacles (Pterosaurs)
    this.obstacles.forEach(obs => {
      if (obs.pterosaurRef) {
        obs.pterosaurRef.update(delta);
      }
    });

    // 2. Procedural Spawning ahead of player
    while (this.nextSpawnX < playerX + this.spawnAheadDistance) {
      const type = this.pickObstacleType(distance);
      const obs = ObstacleFactory.createObstacle(type, this.nextSpawnX);
      this.obstacles.push(obs);
      this.group.add(obs.group);

      // Safe reaction distance based on player speed
      const minGap = Math.max(22, speed * 1.25);
      const gapJitter = Math.random() * (speed * 0.7);
      this.nextSpawnX += minGap + gapJitter;
    }

    // 3. Collision Detection
    const playerBox: BoundingBox3D = CollisionMath.getPlayerBox(
      playerX,
      playerY,
      playerZ,
      isCrouching
    );

    let hasCollided = false;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];

      // Quick early out if obstacle is too far
      if (Math.abs(obs.posX - playerX) > 4.0) continue;

      const obsBox: BoundingBox3D = CollisionMath.getObstacleBox(
        obs.posX,
        obs.posY,
        obs.posZ,
        obs.width,
        obs.height,
        obs.depth
      );

      if (CollisionMath.checkAABB(playerBox, obsBox, 0.12)) {
        hasCollided = true;
        EventBus.emit('obstacleCollision', {
          obstacleType: obs.type,
          obstacleId: obs.id
        });
        break;
      }
    }

    // 4. Recycle obstacles that fell behind
    const recycleThreshold = playerX - 25;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.posX < recycleThreshold) {
        this.group.remove(obs.group);
        obs.group.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
          }
        });
        this.obstacles.splice(i, 1);
      }
    }

    return hasCollided;
  }

  private pickObstacleType(distance: number): ObstacleType {
    const roll = Math.random();

    if (distance < 120) {
      // Early warm-up: small cacti and rock clusters
      return roll < 0.65 ? 'cactus_small' : 'rock_cluster';
    } else if (distance < 300) {
      // Mid-stage: add large cacti and high pterosaurs
      if (roll < 0.35) return 'cactus_small';
      if (roll < 0.65) return 'cactus_large';
      if (roll < 0.85) return 'rock_cluster';
      return 'pterosaur_high'; // Must crouch/duck!
    } else {
      // Advanced stage: full repertoire
      if (roll < 0.28) return 'cactus_small';
      if (roll < 0.52) return 'cactus_large';
      if (roll < 0.70) return 'rock_cluster';
      if (roll < 0.86) return 'pterosaur_high';
      return 'pterosaur_low';
    }
  }

  public reset(): void {
    this.obstacles.forEach(obs => {
      this.group.remove(obs.group);
      obs.group.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
    });
    this.obstacles = [];
    this.nextSpawnX = 75;
  }
}
