type Player = 'X' | 'O' | null;
type GameStatus = 'playing' | 'x_won' | 'o_won' | 'draw';

export interface TicTacToeState {
  board: Player[];
  status: GameStatus;
  message: string;
}

export class TicTacToeGame {
  private board: Player[];
  private status: GameStatus;
  private message: string;

  constructor() {
    this.board = Array(9).fill(null);
    this.status = 'playing';
    this.message = 'Waiting to start...';
  }

  public getState(): TicTacToeState {
    return {
      board: [...this.board],
      status: this.status,
      message: this.message,
    };
  }

  public start(): TicTacToeState {
    this.board = Array(9).fill(null);
    this.status = 'playing';
    this.message = 'Game started! You are X. Make your move.';
    return this.getState();
  }

  public play(position: number): TicTacToeState {
    if (this.status !== 'playing') {
      this.message = 'Game is already over. Please start a new game.';
      return this.getState();
    }

    if (position < 0 || position > 8 || this.board[position] !== null) {
      this.message = 'Invalid move. Please choose an empty cell (0-8).';
      return this.getState();
    }

    // User move
    this.board[position] = 'X';
    if (this.checkWin('X')) {
      this.status = 'x_won';
      this.message = 'Congratulations! You won! 🎉';
      return this.getState();
    }

    if (this.isBoardFull()) {
      this.status = 'draw';
      this.message = "It's a draw! 🤝";
      return this.getState();
    }

    // AI move
    this.makeAIMove();

    if (this.checkWin('O')) {
      this.status = 'o_won';
      this.message = 'AI won! Better luck next time. 🤖';
      return this.getState();
    }

    if (this.isBoardFull()) {
      this.status = 'draw';
      this.message = "It's a draw! 🤝";
      return this.getState();
    }

    this.message = 'Your turn! You are X.';
    return this.getState();
  }

  private makeAIMove() {
    // Simple AI: pick first available empty spot
    // For a slightly better AI, it could prioritize center or winning moves, but random/first is fine for demonstration.
    const emptyIndices = [];
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) emptyIndices.push(i);
    }

    if (emptyIndices.length > 0) {
      // Pick a random empty cell
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      this.board[randomIndex] = 'O';
    }
  }

  private checkWin(player: Player): boolean {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    return winPatterns.some(pattern => {
      const [a, b, c] = pattern;
      return this.board[a] === player && this.board[b] === player && this.board[c] === player;
    });
  }

  private isBoardFull(): boolean {
    return this.board.every(cell => cell !== null);
  }
}
