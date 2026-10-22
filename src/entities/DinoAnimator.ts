import * as THREE from 'three';
import { DinoCharacter } from './DinoCharacter';
import { EventBus } from '../core/EventBus';

export type AnimState = 'idle' | 'run' | 'jump' | 'fall' | 'land' | 'crouch' | 'hit';

export class DinoAnimator {
  private character: DinoCharacter;
  private currentState: AnimState = 'idle';
  private targetState: AnimState = 'idle';

  // Animation timelines
  private runTime: number = 0;
  private jumpTime: number = 0;
  private landTime: number = 0;
  private hitTime: number = 0;

  // Jump physics variables
  public isGrounded: boolean = true;
  public verticalVelocity: number = 0;
  public gravity: number = -38.0; // Snappy, responsive gravity
  public baseJumpForce: number = 17.5; // Jump takeoff impulse
  public jumpForce: number = 17.5;
  public posY: number = 0;

  // Crouch state
  public isCrouching: boolean = false;

  // Footstep tracking for SFX and dust
  private lastLeftFootDown: boolean = false;
  private lastRightFootDown: boolean = false;

  constructor(character: DinoCharacter) {
    this.character = character;
  }

  public setJumpForceModifier(modifier: number = 1.0): void {
    this.jumpForce = this.baseJumpForce * modifier;
  }

  public setState(state: AnimState): void {
    if (this.currentState === 'hit') return; // Cannot cancel death animation
    this.targetState = state;
    this.currentState = state;

    if (state === 'jump') {
      this.jumpTime = 0;
    } else if (state === 'land') {
      this.landTime = 0;
    } else if (state === 'hit') {
      this.hitTime = 0;
    }
  }

  public getState(): AnimState {
    return this.currentState;
  }

  public jump(): boolean {
    if (!this.isGrounded || this.currentState === 'hit') return false;
    this.isGrounded = false;
    this.verticalVelocity = this.jumpForce;
    this.setState('jump');
    EventBus.emit('dinoJump', { posY: this.posY });
    return true;
  }

  public setCrouch(crouch: boolean): void {
    if (this.currentState === 'hit') return;
    this.isCrouching = crouch;
    if (this.isGrounded) {
      this.setState(crouch ? 'crouch' : 'run');
    }
  }

  public triggerHit(): void {
    this.setState('hit');
    EventBus.emit('dinoHit');
  }

  public reset(): void {
    this.currentState = 'idle';
    this.targetState = 'idle';
    this.isGrounded = true;
    this.verticalVelocity = 0;
    this.posY = 0;
    this.isCrouching = false;
    this.runTime = 0;
    this.character.group.position.set(0, 0, 0);
    this.character.resetPose();
  }

  public update(delta: number, runSpeed: number): void {
    // 1. Vertical Physics & Jump Arc
    if (!this.isGrounded) {
      this.verticalVelocity += this.gravity * delta;
      this.posY += this.verticalVelocity * delta;

      if (this.posY <= 0) {
        // Landing impact!
        this.posY = 0;
        this.verticalVelocity = 0;
        this.isGrounded = true;
        this.setState(this.isCrouching ? 'crouch' : 'land');
        EventBus.emit('dinoLand', {
          posX: this.character.group.position.x,
          posZ: this.character.group.position.z
        });
      } else {
        if (this.verticalVelocity < 0 && this.currentState !== 'fall' && this.currentState !== 'hit') {
          this.setState('fall');
        }
      }
    }

    // Apply root vertical translation
    this.character.group.position.y = this.posY;

    // 2. State-specific bone articulation
    if (this.currentState === 'hit') {
      this.animateHit(delta);
    } else if (this.currentState === 'crouch') {
      this.animateCrouch(delta, runSpeed);
    } else if (this.currentState === 'jump') {
      this.animateJump(delta);
    } else if (this.currentState === 'fall') {
      this.animateFall(delta);
    } else if (this.currentState === 'land') {
      this.animateLand(delta, runSpeed);
    } else if (this.currentState === 'run') {
      this.animateRun(delta, runSpeed);
    } else {
      this.animateIdle(delta);
    }
  }

  private animateRun(delta: number, speed: number): void {
    // Step frequency scales with running speed
    const cycleFreq = (speed / 16) * 11.5;
    this.runTime += delta * cycleFreq;

    const angle = this.runTime;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);

    // Spine and Hip Bobbing
    this.character.pelvis.position.y = 1.45 + Math.abs(sinA) * 0.12;
    this.character.pelvis.rotation.z = sinA * 0.05;
    this.character.pelvis.rotation.y = cosA * 0.04;

    // Left Leg Cycle
    this.character.leftThigh.rotation.z = sinA * 0.65;
    this.character.leftShin.rotation.z = sinA < 0 ? Math.sin(angle) * 0.8 : -0.2;
    this.character.leftFoot.rotation.z = -sinA * 0.35;

    // Right Leg Cycle (180 deg out of phase)
    this.character.rightThigh.rotation.z = -sinA * 0.65;
    this.character.rightShin.rotation.z = sinA > 0 ? -Math.sin(angle) * 0.8 : -0.2;
    this.character.rightFoot.rotation.z = sinA * 0.35;

    // Forearm predator pump
    this.character.leftShoulder.rotation.z = 0.4 - sinA * 0.28;
    this.character.rightShoulder.rotation.z = 0.4 + sinA * 0.28;

    // Head stabilization
    this.character.neck.rotation.z = 0.35 - Math.abs(sinA) * 0.08;
    this.character.head.rotation.z = Math.abs(sinA) * 0.06;

    // Lower Jaw breathing
    this.character.jaw.rotation.z = 0.08 + Math.sin(angle * 0.5) * 0.06;

    // Dynamic Sinuous Tail counter-balance
    this.character.tailSegments.forEach((seg, i) => {
      const segDelay = i * 0.45;
      seg.rotation.y = Math.sin(angle - segDelay) * 0.14;
      seg.rotation.z = -0.05 + Math.cos(angle * 2 - segDelay) * 0.06;
    });

    // Check Footstep ground contact for dust particles
    const leftFootDown = sinA < -0.85;
    if (leftFootDown && !this.lastLeftFootDown) {
      EventBus.emit('dinoStep', { side: 'left' });
    }
    this.lastLeftFootDown = leftFootDown;

    const rightFootDown = sinA > 0.85;
    if (rightFootDown && !this.lastRightFootDown) {
      EventBus.emit('dinoStep', { side: 'right' });
    }
    this.lastRightFootDown = rightFootDown;
  }

  private animateCrouch(delta: number, speed: number): void {
    const cycleFreq = (speed / 16) * 11.5;
    this.runTime += delta * cycleFreq;
    const sinA = Math.sin(this.runTime);

    // Drop pelvis significantly for low profile
    this.character.pelvis.position.y = 0.92;
    this.character.pelvis.rotation.z = -0.32; // Body leans forward low

    // Neck extended horizontal
    this.character.neck.rotation.z = 0.05;
    this.character.head.rotation.z = 0.12;

    // Legs folded tight in low sprint
    this.character.leftThigh.rotation.z = sinA * 0.45 + 0.3;
    this.character.leftShin.rotation.z = -0.65;
    this.character.rightThigh.rotation.z = -sinA * 0.45 + 0.3;
    this.character.rightShin.rotation.z = -0.65;

    // Forearms tucked against flanks
    this.character.leftShoulder.rotation.z = 0.8;
    this.character.rightShoulder.rotation.z = 0.8;

    // Tail held low and straight back
    this.character.tailSegments.forEach((seg, i) => {
      seg.rotation.y = Math.sin(this.runTime - i * 0.4) * 0.08;
      seg.rotation.z = -0.02;
    });
  }

  private animateJump(delta: number): void {
    this.jumpTime += delta;

    // Tuck legs in mid-air
    this.character.pelvis.position.y = 1.45;
    this.character.pelvis.rotation.z = -0.1;
    this.character.leftThigh.rotation.z = 0.55;
    this.character.leftShin.rotation.z = -0.85;
    this.character.rightThigh.rotation.z = 0.45;
    this.character.rightShin.rotation.z = -0.75;

    // Head raised, jaw open roaring
    this.character.neck.rotation.z = 0.45;
    this.character.jaw.rotation.z = 0.28;

    // Tail raised upward for aerodynamic balance
    this.character.tailSegments.forEach((seg, i) => {
      seg.rotation.z = 0.12 - i * 0.02;
      seg.rotation.y = 0;
    });
  }

  private animateFall(delta: number): void {
    // Reaching down towards ground
    this.character.leftThigh.rotation.z = -0.1;
    this.character.leftShin.rotation.z = -0.2;
    this.character.rightThigh.rotation.z = -0.15;
    this.character.rightShin.rotation.z = -0.25;

    this.character.neck.rotation.z = 0.2;
    this.character.head.rotation.z = -0.1;

    this.character.tailSegments.forEach(seg => {
      seg.rotation.z = -0.1;
    });
  }

  private animateLand(delta: number, speed: number): void {
    this.landTime += delta;
    const progress = Math.min(1.0, this.landTime / 0.14);

    // Compression squash
    const compression = Math.sin(progress * Math.PI) * 0.25;
    this.character.pelvis.position.y = 1.45 - compression;
    this.character.leftShin.rotation.z = -0.4 * (1 - progress);
    this.character.rightShin.rotation.z = -0.4 * (1 - progress);

    if (progress >= 1.0) {
      this.setState(this.isCrouching ? 'crouch' : 'run');
    }
  }

  private animateHit(delta: number): void {
    this.hitTime += delta;
    const t = Math.min(1.0, this.hitTime / 0.6);

    // Violent recoil: spine arches back, head snaps up, collapses backward
    this.character.pelvis.rotation.z = 0.8 * t;
    this.character.pelvis.position.y = 1.45 * (1 - t * 0.6);
    this.character.spine.rotation.z = 0.6 * t;
    this.character.neck.rotation.z = -0.5 * t;
    this.character.jaw.rotation.z = 0.5 * t;

    this.character.leftThigh.rotation.z = -0.8 * t;
    this.character.rightThigh.rotation.z = -0.6 * t;

    this.character.tailSegments.forEach(seg => {
      seg.rotation.z = 0.3 * t;
    });
  }

  private animateIdle(delta: number): void {
    this.runTime += delta * 2.0;
    const breathe = Math.sin(this.runTime) * 0.03;

    this.character.pelvis.position.y = 1.45 + breathe;
    this.character.spine.rotation.z = -0.15 + breathe;
    this.character.jaw.rotation.z = 0.04 + breathe * 0.5;

    this.character.tailSegments.forEach((seg, i) => {
      seg.rotation.y = Math.sin(this.runTime * 0.7 - i * 0.3) * 0.08;
    });
  }
}
