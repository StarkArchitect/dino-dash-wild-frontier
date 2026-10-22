import * as THREE from 'three';

export class Coin {
  public group: THREE.Group;
  public posX: number;
  public posY: number;
  public posZ: number;
  public initialY: number;
  public collected: boolean = false;
  public isAttracted: boolean = false;

  private coinMesh: THREE.Mesh;
  private innerRim: THREE.Mesh;
  private animTime: number = Math.random() * Math.PI * 2;
  private collectAnimProgress: number = 0;

  // Shared cached materials and geometries for optimal Intel UHD performance
  private static sharedMaterial: THREE.MeshStandardMaterial | null = null;
  private static sharedInnerMaterial: THREE.MeshStandardMaterial | null = null;
  private static sharedOuterGeo: THREE.CylinderGeometry | null = null;
  private static sharedInnerGeo: THREE.CylinderGeometry | null = null;

  constructor(x: number, y: number, z: number = 0) {
    this.posX = x;
    this.posY = y;
    this.initialY = y;
    this.posZ = z;

    this.group = new THREE.Group();
    this.group.position.set(x, y, z);

    if (!Coin.sharedMaterial) {
      Coin.sharedMaterial = new THREE.MeshStandardMaterial({
        color: 0xffc72c,
        roughness: 0.22,
        metalness: 0.88,
        emissive: 0x92400e,
        emissiveIntensity: 0.35
      });

      Coin.sharedInnerMaterial = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.18,
        metalness: 0.95,
        emissive: 0xb45309,
        emissiveIntensity: 0.45
      });

      // Disc geometry standing upright facing sideways
      Coin.sharedOuterGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16);
      Coin.sharedOuterGeo.rotateZ(Math.PI * 0.5);

      Coin.sharedInnerGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.10, 8);
      Coin.sharedInnerGeo.rotateZ(Math.PI * 0.5);
    }

    this.coinMesh = new THREE.Mesh(Coin.sharedOuterGeo!, Coin.sharedMaterial!);
    this.coinMesh.castShadow = true;
    this.innerRim = new THREE.Mesh(Coin.sharedInnerGeo!, Coin.sharedInnerMaterial!);

    this.group.add(this.coinMesh);
    this.group.add(this.innerRim);
  }

  public update(delta: number, playerX: number, playerY: number, playerZ: number): boolean {
    if (this.collected) {
      // Collection pickup burst animation: quick float up, expand and vanish
      this.collectAnimProgress += delta * 4.5;
      this.group.position.y += delta * 3.5;
      const s = Math.max(0, 1.0 + this.collectAnimProgress * 0.8 - this.collectAnimProgress * this.collectAnimProgress);
      this.group.scale.set(s, s, s);
      this.group.rotation.y += delta * 15.0;
      return this.collectAnimProgress >= 1.0; // Return true when animation completes
    }

    this.animTime += delta;

    // Spin animation
    this.group.rotation.y += delta * 3.8;

    if (this.isAttracted) {
      // Smooth magnetic attraction flight towards dino chest
      const targetY = playerY + 1.2;
      const targetZ = playerZ;
      const targetX = playerX;

      const attractSpeed = Math.min(1.0, delta * 14.0);
      this.posX += (targetX - this.posX) * attractSpeed;
      this.posY += (targetY - this.posY) * attractSpeed;
      this.posZ += (targetZ - this.posZ) * attractSpeed;
      this.group.position.set(this.posX, this.posY, this.posZ);
    } else {
      // Gentle levitation bobbing
      this.posY = this.initialY + Math.sin(this.animTime * 4.0) * 0.12;
      this.group.position.y = this.posY;
    }

    return false;
  }

  public attract(): void {
    this.isAttracted = true;
  }

  public triggerCollect(): void {
    this.collected = true;
  }

  public dispose(): void {
    // Individual coin geometries/materials are shared, so we only remove from scene
  }
}
