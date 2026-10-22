import './style.css';
import { Game } from './core/Game';

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game();
    // Expose for debugging if needed
    (window as any).__DINO_GAME__ = game;
    console.log('🦖 Dino Dash: Wild Frontier initialized successfully!');
  } catch (err) {
    console.error('Failed to initialize Dino Dash:', err);
  }
});
