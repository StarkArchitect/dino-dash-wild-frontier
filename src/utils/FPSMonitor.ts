export class FPSMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;
  private domElement: HTMLElement | null = null;
  private presetLabel: HTMLElement | null = null;

  constructor() {
    this.domElement = document.getElementById('fps-counter');
    this.presetLabel = document.getElementById('preset-label');
  }

  public update(): void {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;

      if (this.domElement) {
        this.domElement.textContent = `${this.fps} FPS`;
        if (this.fps < 30) {
          this.domElement.style.color = '#ef4444';
        } else if (this.fps < 50) {
          this.domElement.style.color = '#f59e0b';
        } else {
          this.domElement.style.color = '#10b981';
        }
      }
    }
  }

  public setPreset(name: string): void {
    if (this.presetLabel) {
      this.presetLabel.textContent = name;
    }
  }

  public getFPS(): number {
    return this.fps;
  }
}
