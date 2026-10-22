import * as THREE from 'three';
import { GameStateManager, State } from './GameState';
import { EventBus } from './EventBus';
import { InputManager } from './InputManager';
import { RendererManager, GraphicsPreset } from '../graphics/RendererManager';
import { CameraController } from '../graphics/CameraController';
import { LightingManager } from '../graphics/LightingManager';
import { WorldGenerator } from '../world/WorldGenerator';
import { ParticleSystem } from '../world/ParticleSystem';
import { DinoCharacter } from '../entities/DinoCharacter';
import { DinoAnimator } from '../entities/DinoAnimator';
import { ObstacleManager } from '../entities/ObstacleManager';
import { CoinManager } from '../entities/CoinManager';
import { DinoVariant } from '../entities/DinoCatalog';
import { SoundEngine } from '../audio/SoundEngine';
import { UIManager } from '../ui/UIManager';
import { FPSMonitor } from '../utils/FPSMonitor';
import { Storage } from '../utils/Storage';

export class Game {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public rendererMgr: RendererManager;
  public cameraCtrl: CameraController;
  public lightingMgr: LightingManager;
  public worldGen: WorldGenerator;
  public particleSys: ParticleSystem;
  public dino: DinoCharacter;
  public animator: DinoAnimator;
  public obstacleMgr: ObstacleManager;
  public coinMgr: CoinManager;
  public soundEngine: SoundEngine;
  public gameState: GameStateManager;
  public inputMgr: InputManager;
  public uiMgr: UIManager;
  public fpsMonitor: FPSMonitor;

  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private playerX: number = 0;
  private previewAngle: number = 0;

  constructor() {
    this.container = document.getElementById('game-container')!;
    this.scene = new THREE.Scene();

    const settings = Storage.getSettings();

    // 1. Graphics & Camera
    this.rendererMgr = new RendererManager(this.container, settings.graphicsPreset);
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.cameraCtrl = new CameraController(aspect, settings.cameraMode, settings.fov);
    this.lightingMgr = new LightingManager(this.scene);

    // 2. World & Particles
    this.worldGen = new WorldGenerator();
    this.scene.add(this.worldGen.group);

    this.particleSys = new ParticleSystem();
    this.scene.add(this.particleSys.group);

    // 3. Dinosaur Character & Animation
    const initialEquippedId = Storage.getEquippedDino();
    this.dino = new DinoCharacter(initialEquippedId);
    this.scene.add(this.dino.group);
    this.animator = new DinoAnimator(this.dino);

    // 4. Obstacles & Coins
    this.obstacleMgr = new ObstacleManager();
    this.scene.add(this.obstacleMgr.group);

    this.coinMgr = new CoinManager();
    this.scene.add(this.coinMgr.group);

    // 5. Core Systems
    this.gameState = new GameStateManager();
    this.animator.setJumpForceModifier(this.gameState.equippedVariant.stats.jumpForceModifier);

    this.inputMgr = new InputManager();
    this.soundEngine = new SoundEngine();
    this.uiMgr = new UIManager(this.gameState);
    this.fpsMonitor = new FPSMonitor();
    this.fpsMonitor.setPreset(`UHD ${settings.graphicsPreset.toUpperCase()}`);

    this.setupListeners();
    this.onWindowResize();
    window.addEventListener('resize', () => this.onWindowResize());

    // Start in TITLE mode
    this.gameState.setState(State.TITLE);
    this.startLoop();
  }

  private setupListeners(): void {
    // Start Run
    EventBus.on('requestStartRun', () => {
      this.startNewRun();
    });

    // Pause / Resume
    EventBus.on('inputTogglePause', () => {
      const state = this.gameState.getState();
      if (state === State.PLAYING) {
        this.gameState.setState(State.PAUSED);
      } else if (state === State.PAUSED) {
        this.gameState.setState(State.PLAYING);
      }
    });

    EventBus.on('requestResume', () => {
      if (this.gameState.getState() === State.PAUSED) {
        this.gameState.setState(State.PLAYING);
      }
    });

    // Restart
    EventBus.on('inputRestart', () => {
      const state = this.gameState.getState();
      if (state === State.GAME_OVER || state === State.PAUSED) {
        this.startNewRun();
      }
    });

    EventBus.on('requestRestart', () => {
      this.startNewRun();
    });

    EventBus.on('requestReturnMenu', () => {
      this.gameState.setState(State.TITLE);
      this.resetToTitle();
    });

    // Controls
    EventBus.on('inputJump', () => {
      if (this.gameState.getState() === State.PLAYING) {
        this.animator.jump();
      } else if (this.gameState.getState() === State.TITLE) {
        this.startNewRun();
      } else if (this.gameState.getState() === State.GAME_OVER) {
        this.startNewRun();
      }
    });

    EventBus.on('inputCrouchStart', () => {
      if (this.gameState.getState() === State.PLAYING) {
        this.animator.setCrouch(true);
      }
    });

    EventBus.on('inputCrouchEnd', () => {
      if (this.gameState.getState() === State.PLAYING) {
        this.animator.setCrouch(false);
      }
    });

    // Settings adjustments
    EventBus.on('graphicsPresetChanged', (preset: GraphicsPreset) => {
      this.rendererMgr.applyPreset(preset);
      this.lightingMgr.setShadowQuality(preset === 'low' ? 'off' : preset);
      this.fpsMonitor.setPreset(`UHD ${preset.toUpperCase()}`);
    });

    EventBus.on('fovChanged', (fov: number) => {
      this.cameraCtrl.setFOV(fov);
    });

    EventBus.on('volumeChanged', ({ sfx, ambient }) => {
      this.soundEngine.setVolumes(sfx, ambient);
    });

    // Character variant changed
    EventBus.on('dinoEquippedChanged', (variant: DinoVariant) => {
      this.dino.applyVariant(variant);
      this.animator.setJumpForceModifier(variant.stats.jumpForceModifier);
    });

    // Coin collection FX
    EventBus.on('coinCollected', ({ posX, posY }) => {
      this.particleSys.emitDustPuff(posX, posY, 0, 6, 1.2);
    });

    // Shield deflection FX
    EventBus.on('shieldDeflect', () => {
      this.cameraCtrl.addShake(0.4);
      this.particleSys.emitDustPuff(this.playerX, this.animator.posY + 1.2, 0, 16, 2.5);
    });
  }

  private startNewRun(): void {
    this.playerX = 0;
    this.dino.group.position.set(0, 0, 0);
    this.animator.reset();
    this.animator.setState('run');

    this.gameState.startRun();
    this.dino.applyVariant(this.gameState.equippedVariant);
    this.animator.setJumpForceModifier(this.gameState.equippedVariant.stats.jumpForceModifier);
    this.dino.setShieldVisible(this.gameState.shieldChargesRemaining > 0);

    this.obstacleMgr.reset();
    this.coinMgr.reset();
    this.worldGen.reset();
    this.cameraCtrl.setMode(this.gameState.cameraMode);
  }

  private resetToTitle(): void {
    this.playerX = 0;
    this.dino.group.position.set(0, 0, 0);
    this.animator.reset();
    this.animator.setState('idle');
    this.dino.applyVariant(this.gameState.equippedVariant);
    this.dino.setShieldVisible(false);
    this.obstacleMgr.reset();
    this.coinMgr.reset();
    this.worldGen.reset();
  }

  private startLoop(): void {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.tick(t));
  }

  private tick(now: number): void {
    if (!this.isRunning) return;

    const delta = Math.min(0.1, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.update(delta);
    this.render();

    this.inputMgr.endFrame();
    this.fpsMonitor.update();

    requestAnimationFrame((t) => this.tick(t));
  }

  private update(delta: number): void {
    const state = this.gameState.getState();

    if (state === State.PLAYING) {
      // 1. Advance Game State & Metrics
      this.gameState.update(delta);
      const speed = this.gameState.currentSpeed;
      this.playerX += speed * delta;
      this.dino.group.position.x = this.playerX;

      // 2. Animate Dinosaur & Shield Aura
      this.animator.update(delta, speed);
      const hasActiveShield = this.gameState.shieldChargesRemaining > 0 || this.gameState.invulnerabilityTimer > 0;
      this.dino.setShieldVisible(hasActiveShield);
      this.dino.updateShieldAura(delta);

      // 3. World, Obstacles & Coins
      this.worldGen.update(this.playerX);
      this.particleSys.update(delta, this.playerX);

      // Coins update
      const stats = this.gameState.equippedVariant.stats;
      const coinsEarned = this.coinMgr.update(
        delta,
        this.playerX,
        this.animator.posY,
        this.dino.group.position.z,
        stats.coinRadiusModifier,
        stats.coinEarningsModifier
      );
      if (coinsEarned > 0) {
        this.gameState.addRunCoin(coinsEarned);
      }

      // Obstacle collision check
      const hasCollided = this.obstacleMgr.update(
        delta,
        this.playerX,
        this.animator.posY,
        this.dino.group.position.z,
        this.animator.isCrouching,
        speed,
        this.gameState.distance
      );

      if (hasCollided) {
        const survived = this.gameState.absorbHitWithShield();
        if (!survived) {
          this.animator.triggerHit();
          this.gameState.triggerGameOver();
        }
      }

      // 4. Lighting & Day/Night Atmosphere
      this.lightingMgr.update(this.gameState.timeOfDay, this.playerX);

      // 5. Camera Follow & Shake
      this.cameraCtrl.update(
        delta,
        this.playerX,
        this.animator.posY,
        this.dino.group.position.z
      );

    } else if (state === State.GAME_OVER) {
      this.animator.update(delta, 0);
      this.particleSys.update(delta, this.playerX);
      this.dino.setShieldVisible(false);
      this.cameraCtrl.update(
        delta,
        this.playerX,
        this.animator.posY,
        this.dino.group.position.z
      );

    } else if (state === State.TITLE) {
      // 3D Dino Showcase Preview
      this.previewAngle += delta * 0.35;
      this.animator.update(delta, 0);
      this.dino.setShieldVisible(false);

      const camDist = 7.5;
      const camHeight = 2.4;
      this.cameraCtrl.camera.position.set(
        Math.cos(this.previewAngle) * camDist,
        camHeight,
        Math.sin(this.previewAngle) * camDist
      );
      this.cameraCtrl.camera.lookAt(0, 1.2, 0);
      this.lightingMgr.update(0.15, 0);
    }
  }

  private render(): void {
    this.rendererMgr.render(this.scene, this.cameraCtrl.camera);
  }

  private onWindowResize(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.rendererMgr.resize();
    this.cameraCtrl.onResize(width / height);
  }

  public dispose(): void {
    this.isRunning = false;
    this.rendererMgr.dispose();
  }
}
