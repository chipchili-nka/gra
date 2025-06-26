
export function createGameBoard(root, width = 10, height = 10, mineCount = 10) {
  const gameState = {
    board: [],
    isGameOver: false,
    isGameWon: false,
    mineCount,
    width,
    height
  };

  const gameContainer = document.createElement('div');
  gameContainer.classList.add('game-container');
  
  const statusBar = document.createElement('div');
  statusBar.classList.add('status-bar');
  
  const mineCounter = document.createElement('div');
  mineCounter.classList.add('mine-counter');
  mineCounter.textContent = `Mines: ${mineCount}`;
  
  const resetButton = document.createElement('button');
  resetButton.classList.add('reset-button');
  resetButton.textContent = 'Reset Game';
  resetButton.addEventListener('click', () => {
    createGameBoard(root, width, height, mineCount);
  });
  
  const statusMessage = document.createElement('div');
  statusMessage.classList.add('status-message');
  
  statusBar.appendChild(mineCounter);
  statusBar.appendChild(resetButton);
  statusBar.appendChild(statusMessage);
  
  const boardElement = document.createElement('div');
  boardElement.classList.add('board');

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const cell = {
        x, y,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        element: document.createElement('div'),
        neighborMines: 0
      };
      cell.element.classList.add('cell');
      cell.element.addEventListener('click', () => revealCell(cell, gameState, boardElement, mineCounter, statusMessage));
      cell.element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleFlag(cell, gameState, mineCounter);
      });
      boardElement.appendChild(cell.element);
      row.push(cell);
    }
    gameState.board.push(row);
  }

  plantMines(gameState.board, mineCount);
  calculateNeighborMines(gameState.board);

  gameContainer.appendChild(statusBar);
  gameContainer.appendChild(boardElement);
  
  root.innerHTML = '';
  root.appendChild(gameContainer);
}

function plantMines(board, mineCount) {
  let planted = 0;
  const width = board[0].length;
  const height = board.length;

  while (planted < mineCount) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const cell = board[y][x];
    if (!cell.isMine) {
      cell.isMine = true;
      planted++;
    }
  }
}

function calculateNeighborMines(board) {
  const directions = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],          [1, 0],
    [-1, 1],  [0, 1],  [1, 1],
  ];

  for (const row of board) {
    for (const cell of row) {
      let count = 0;
      for (const [dx, dy] of directions) {
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        if (board[ny] && board[ny][nx] && board[ny][nx].isMine) count++;
      }
      cell.neighborMines = count;
    }
  }
}

function revealCell(cell, gameState, boardElement, mineCounter, statusMessage) {
  if (cell.isRevealed || cell.isFlagged || gameState.isGameOver) return;
  
  cell.isRevealed = true;
  cell.element.classList.add('revealed');

  if (cell.isMine) {
    cell.element.textContent = '💣';
    cell.element.classList.add('mine');
    gameState.isGameOver = true;
    statusMessage.textContent = 'Game Over! Click Reset to play again.';
    statusMessage.classList.add('game-over');
    
    // Reveal all mines
    for (const row of gameState.board) {
      for (const c of row) {
        if (c.isMine && !c.isRevealed) {
          c.element.textContent = '💣';
          c.element.classList.add('mine');
        }
      }
    }
    return;
  }

  if (cell.neighborMines > 0) {
    cell.element.textContent = cell.neighborMines;
    cell.element.classList.add(`number-${cell.neighborMines}`);
  } else {
    cell.element.textContent = '';
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],          [1, 0],
      [-1, 1],  [0, 1],  [1, 1],
    ];
    for (const [dx, dy] of directions) {
      const nx = cell.x + dx;
      const ny = cell.y + dy;
      if (gameState.board[ny] && gameState.board[ny][nx]) {
        revealCell(gameState.board[ny][nx], gameState, boardElement, mineCounter, statusMessage);
      }
    }
  }
  
  // Check win condition
  checkWinCondition(gameState, statusMessage);
}

function toggleFlag(cell, gameState, mineCounter) {
  if (cell.isRevealed || gameState.isGameOver) return;
  
  cell.isFlagged = !cell.isFlagged;
  
  if (cell.isFlagged) {
    cell.element.textContent = '🚩';
    cell.element.classList.add('flagged');
    gameState.mineCount--;
  } else {
    cell.element.textContent = '';
    cell.element.classList.remove('flagged');
    gameState.mineCount++;
  }
  
  mineCounter.textContent = `Mines: ${gameState.mineCount}`;
}

function checkWinCondition(gameState, statusMessage) {
  let revealedCount = 0;
  const totalCells = gameState.width * gameState.height;
  const totalMines = gameState.width * gameState.height - gameState.mineCount;
  
  for (const row of gameState.board) {
    for (const cell of row) {
      if (cell.isRevealed && !cell.isMine) {
        revealedCount++;
      }
    }
  }
  
  // Win condition: all non-mine cells are revealed
  if (revealedCount === totalMines) {
    gameState.isGameWon = true;
    gameState.isGameOver = true;
    statusMessage.textContent = 'Congratulations! You won! 🎉';
    statusMessage.classList.add('game-won');
    
    // Auto-flag remaining mines
    for (const row of gameState.board) {
      for (const cell of row) {
        if (cell.isMine && !cell.isFlagged) {
          cell.element.textContent = '🚩';
          cell.element.classList.add('flagged');
        }
      }
    }
  }
}
