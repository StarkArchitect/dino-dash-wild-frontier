import * as THREE from 'three';
import { EventBus } from '../core/EventBus';

export type CameraMode = 'side' | 'third';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  private currentMode: CameraMode = 'side';
  private targetMode: CameraMode = 'side';

  // Smooth transition tracking
  private isTransitioning: boolean = false;
  private transitionTime: number = 0;
  private transitionDuration: number = 0.55;

  private startPos: THREE.Vector3 = new THREE.Vector3();
  private startTarget: THREE.Vector3 = new THREE.Vector3();
  private startFOV: number = 60;

  private currentLookTarget: THREE.Vector3 = new THREE.Vector3();

  // Screen shake
  private shakeIntensity: number = 0;
  private shakeDecay: number = 6.0;

  // Mode settings
  public thirdPersonFOV: number = 70;
  public sideViewFOV: number = 55;

  constructor(aspect: number, initialMode: CameraMode = 'side', initialFOV: number = 70) {
    this.thirdPersonFOV = initialFOV;
    this.currentMode = initialMode;
    this.targetMode = initialMode;

    const fov = initialMode === 'side' ? this.sideViewFOV : this.thirdPersonFOV;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);

    // Initial positioning
    if (initialMode === 'side') {
      this.camera.position.set(-2.0, 4.2, 17.0);
      this.currentLookTarget.set(7.5, 2.2, 0);
    } else {
      this.camera.position.set(-10.5, 4.8, 0);
      this.currentLookTarget.set(16.0, 2.0, 0);
    }
    this.camera.lookAt(this.currentLookTarget);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    EventBus.on('inputToggleCamera', () => {
      this.toggleMode();
    });

    EventBus.on('cameraModeToggled', (mode: CameraMode) => {
      if (mode !== this.targetMode) {
        this.setMode(mode);
      }
    });

    EventBus.on('dinoHit', () => {
      this.addShake(0.8);
    });

    EventBus.on('dinoLand', () => {
      this.addShake(0.18);
    });
  }

  public setMode(mode: CameraMode): void {
    if (this.targetMode === mode && !this.isTransitioning) return;

    this.startPos.copy(this.camera.position);
    this.startTarget.copy(this.currentLookTarget);
    this.startFOV = this.camera.fov;

    this.targetMode = mode;
    this.isTransitioning = true;
    this.transitionTime = 0;
  }

  public toggleMode(): CameraMode {
    const next = this.currentMode === 'side' ? 'third' : 'side';
    this.setMode(next);
    EventBus.emit('cameraModeChanged', next);
    return next;
  }

  public getMode(): CameraMode {
    return this.currentMode;
  }

  public addShake(amount: number): void {
    this.shakeIntensity = Math.min(1.5, this.shakeIntensity + amount);
  }

  public setFOV(fov: number): void {
    this.thirdPersonFOV = fov;
    if (this.currentMode === 'third' && !this.isTransitioning) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  public update(delta: number, playerX: number, playerY: number, playerZ: number): void {
    // Decay screen shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * delta);
    }
    const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 0.4;
    const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 0.4;

    // Calculate ideal camera coordinates relative to player in each mode
    // Side view: looks at player from side + Z offset, looking slightly forward (+X)
    const sidePos = new THREE.Vector3(playerX - 2.5, 4.5, 17.5);
    const sideLook = new THREE.Vector3(playerX + 7.5, 2.2, 0);

    // Third person: behind player (-X offset), looking ahead (+X offset)
    const thirdPos = new THREE.Vector3(playerX - 10.5, 4.6 + playerY * 0.25, playerZ);
    const thirdLook = new THREE.Vector3(playerX + 18.0, 2.0, playerZ);

    if (this.isTransitioning) {
      this.transitionTime += delta;
      const t = Math.min(1.0, this.transitionTime / this.transitionDuration);

      // Smooth cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const targetPos = this.targetMode === 'side' ? sidePos : thirdPos;
      const targetLook = this.targetMode === 'side' ? sideLook : thirdLook;
      const targetFOV = this.targetMode === 'side' ? this.sideViewFOV : this.thirdPersonFOV;

      this.camera.position.lerpVectors(this.startPos, targetPos, ease);
      this.currentLookTarget.lerpVectors(this.startTarget, targetLook, ease);
      this.camera.fov = THREE.MathUtils.lerp(this.startFOV, targetFOV, ease);
      this.camera.updateProjectionMatrix();

      if (t >= 1.0) {
        this.isTransitioning = false;
        this.currentMode = this.targetMode;
      }
    } else {
      // Normal continuous frame follow
      if (this.currentMode === 'side') {
        // Smooth dampening along X
        this.camera.position.x = sidePos.x;
        this.camera.position.y = sidePos.y;
        this.camera.position.z = sidePos.z;
        this.currentLookTarget.copy(sideLook);
        this.camera.fov = this.sideViewFOV;
      } else {
        // Third Person chase
        this.camera.position.x = thirdPos.x;
        this.camera.position.y = thirdPos.y;
        this.camera.position.z = thirdPos.z;
        this.currentLookTarget.copy(thirdLook);
        this.camera.fov = this.thirdPersonFOV;
      }
      this.camera.updateProjectionMatrix();
    }

    // Apply look target + shake
    const finalLook = this.currentLookTarget.clone();
    finalLook.x += shakeX;
    finalLook.y += shakeY;
    this.camera.lookAt(finalLook);
  }

  public onResize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
