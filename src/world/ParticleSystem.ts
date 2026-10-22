import * as THREE from 'three';
import { EventBus } from '../core/EventBus';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  maxLife: number;
  life: number;
  color: THREE.Color;
}

export class ParticleSystem {
  public group: THREE.Group;
  private particles: Particle[] = [];
  private maxParticles: number = 250;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;

  private posArray: Float32Array;
  private colorArray: Float32Array;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'ParticleSystem';

    this.posArray = new Float32Array(this.maxParticles * 3);
    this.colorArray = new Float32Array(this.maxParticles * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.posArray, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorArray, 3));

    this.material = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);

    this.setupEvents();
  }

  private setupEvents(): void {
    EventBus.on('dinoStep', (data: { side: string }) => {
      // Small dust puff at dino feet
      this.emitDustPuff(0, 0.1, data.side === 'left' ? 0.38 : -0.38, 4, 0.8);
    });

    EventBus.on('dinoLand', () => {
      // Big shockwave dust burst
      this.emitDustPuff(0, 0.1, 0, 18, 2.2);
    });

    EventBus.on('dinoHit', () => {
      // Violent dust scatter
      this.emitDustPuff(0, 0.2, 0, 24, 3.0);
    });
  }

  public emitDustPuff(
    originX: number,
    originY: number,
    originZ: number,
    count: number,
    spread: number
  ): void {
    const baseColor = new THREE.Color(0xd49b6a);

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // Recycle oldest
      }

      const p: Particle = {
        position: new THREE.Vector3(
          originX + (Math.random() - 0.5) * 0.4,
          originY + Math.random() * 0.2,
          originZ + (Math.random() - 0.5) * 0.4
        ),
        velocity: new THREE.Vector3(
          -2.0 + (Math.random() - 0.5) * spread * 2, // Drift backward behind running dino
          1.0 + Math.random() * spread * 1.5,
          (Math.random() - 0.5) * spread * 1.5
        ),
        size: 0.4 + Math.random() * 0.5,
        maxLife: 0.45 + Math.random() * 0.35,
        life: 0,
        color: baseColor.clone().offsetHSL(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        )
      };

      this.particles.push(p);
    }
  }

  public update(delta: number, playerX: number): void {
    let activeIdx = 0;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= 3.5 * delta; // Gravity
      p.velocity.x *= 0.96; // Drag
      p.velocity.z *= 0.96;

      // Keep above ground
      if (p.position.y < 0.05) {
        p.position.y = 0.05;
        p.velocity.y = 0;
      }

      const progress = p.life / p.maxLife;
      const alpha = 1.0 - progress;

      // Update buffer
      const idx3 = activeIdx * 3;
      this.posArray[idx3] = playerX + p.position.x;
      this.posArray[idx3 + 1] = p.position.y;
      this.posArray[idx3 + 2] = p.position.z;

      this.colorArray[idx3] = p.color.r * alpha;
      this.colorArray[idx3 + 1] = p.color.g * alpha;
      this.colorArray[idx3 + 2] = p.color.b * alpha;

      activeIdx++;
    }

    // Clear unused slots
    for (let j = activeIdx; j < this.maxParticles; j++) {
      const j3 = j * 3;
      this.posArray[j3] = 0;
      this.posArray[j3 + 1] = -1000;
      this.posArray[j3 + 2] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }
}
