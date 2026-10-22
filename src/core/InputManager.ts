import { EventBus } from './EventBus';

export class InputManager {
  public isJumpPressed: boolean = false;
  public jumpJustPressed: boolean = false;
  public isCrouchPressed: boolean = false;
  
  private keysDown: Set<string> = new Set();

  constructor() {
    this.initKeyboard();
  }

  private initKeyboard(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.code;

      // Prevent page scrolling on navigation keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
      }

      if (!this.keysDown.has(key)) {
        this.keysDown.add(key);

        if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW') {
          this.isJumpPressed = true;
          this.jumpJustPressed = true;
          EventBus.emit('inputJump');
        }

        if (key === 'ArrowDown' || key === 'KeyS') {
          this.isCrouchPressed = true;
          EventBus.emit('inputCrouchStart');
        }

        if (key === 'KeyV') {
          EventBus.emit('inputToggleCamera');
        }

        if (key === 'Escape' || key === 'KeyP') {
          EventBus.emit('inputTogglePause');
        }

        if (key === 'KeyR') {
          EventBus.emit('inputRestart');
        }

        if (key === 'KeyM') {
          EventBus.emit('inputToggleMute');
        }
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      const key = e.code;
      this.keysDown.delete(key);

      if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW') {
        this.isJumpPressed = false;
        EventBus.emit('inputJumpRelease');
      }

      if (key === 'ArrowDown' || key === 'KeyS') {
        this.isCrouchPressed = false;
        EventBus.emit('inputCrouchEnd');
      }
    });
  }

  // Called at the end of each game frame to clear single-frame triggers
  public endFrame(): void {
    this.jumpJustPressed = false;
  }

  // Virtual touch triggers
  public triggerJump(): void {
    this.isJumpPressed = true;
    this.jumpJustPressed = true;
    EventBus.emit('inputJump');
  }

  public releaseJump(): void {
    this.isJumpPressed = false;
    EventBus.emit('inputJumpRelease');
  }

  public triggerCrouchStart(): void {
    this.isCrouchPressed = true;
    EventBus.emit('inputCrouchStart');
  }

  public triggerCrouchEnd(): void {
    this.isCrouchPressed = false;
    EventBus.emit('inputCrouchEnd');
  }

  public dispose(): void {
    this.keysDown.clear();
  }
}
