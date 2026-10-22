import * as THREE from 'three';
import { DinoCharacter } from '../entities/DinoCharacter';
import { DinoAnimator } from '../entities/DinoAnimator';
import { DinoVariant } from '../entities/DinoCatalog';

export class ShopPreview {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private dino: DinoCharacter;
  private animator: DinoAnimator;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private rotationAngle: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    // Soft gradient or transparent background
    this.scene.background = new THREE.Color(0x181412);
    this.scene.fog = new THREE.FogExp2(0x181412, 0.04);

    const width = this.canvas.clientWidth || 400;
    const height = this.canvas.clientHeight || 340;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    this.camera.position.set(0, 1.6, 5.2);
    this.camera.lookAt(0, 1.1, 0);

    // Setup Lighting
    const ambient = new THREE.AmbientLight(0xfff7ed, 1.2);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 2.4);
    dirLight.position.set(4, 5, 4);
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-4, 3, -4);
    this.scene.add(rimLight);

    // Pedestal disc
    const pedestalGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.6,
      metalness: 0.3
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.1, 0);
    this.scene.add(pedestal);

    // Golden trim ring on pedestal
    const ringGeo = new THREE.TorusGeometry(1.85, 0.03, 8, 32);
    ringGeo.rotateX(Math.PI * 0.5);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, 0);
    this.scene.add(ring);

    // Dinosaur Model
    this.dino = new DinoCharacter('classic_rex');
    this.scene.add(this.dino.group);
    this.animator = new DinoAnimator(this.dino);
    this.animator.setState('idle');

    this.initRenderer();
  }

  private initRenderer(): void {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'default'
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.resize();
    } catch (e) {
      console.warn('WebGL init failed for ShopPreview:', e);
    }
  }

  public setVariant(variant: DinoVariant): void {
    this.dino.applyVariant(variant);
    // Show shield aura on preview if dino has defensive shield
    this.dino.setShieldVisible(variant.stats.shieldCharges > 0);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.resize();
    this.tick();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resize(): void {
    if (!this.renderer) return;
    const width = this.canvas.clientWidth || 400;
    const height = this.canvas.clientHeight || 340;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private tick(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // Slow 360-degree rotation to showcase model from all angles
    this.rotationAngle += delta * 0.75;
    this.dino.group.rotation.y = this.rotationAngle;

    // Animate idle breathing
    this.animator.update(delta, 0);
    this.dino.updateShieldAura(delta);

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animFrameId = requestAnimationFrame(() => this.tick());
  }

  public dispose(): void {
    this.stop();
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
