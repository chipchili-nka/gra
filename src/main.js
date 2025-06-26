
import './style.css';
import { createGameBoard } from './modules/game.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  createGameBoard(root);
});
