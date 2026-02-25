import { useState, useEffect } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';

export function TicTacToeGame() {
  const [state] = useState(window.GAME_STATE as any || {
    gameType: 'tic-tac-toe',
    message: 'Game started! You are X. Make your move.',
    board: Array(9).fill(null),
    status: 'playing',
    isGameOver: false
  });

  useEffect(() => {
    if (!window.GAME_STATE) {
      console.warn("No GAME_STATE injected. Running Tic-Tac-Toe with default state.");
    }
  }, []);

  const handleCellClick = (index: number) => {
    if (state.isGameOver || state.board[index] !== null) return;

    const runCommand = `Play tic-tac-toe at index ${index}`;
    // Support auto-sending in true SDK environment
    if (window.openai) {
      window.openai.sendMessage(runCommand);
    } else {
      alert(`In ChatGPT, you would send: "${runCommand}"`);
    }
  };

  const renderCell = (index: number) => {
    const value = state.board[index];
    let color: 'primary' | 'danger' | 'secondary' = 'secondary';
    let variant: 'solid' | 'soft' = 'soft';

    if (value === 'X') {
      color = 'primary';
      variant = 'solid';
    } else if (value === 'O') {
      color = 'danger';
      variant = 'solid';
    }

    return (
      <Button
        key={index}
        color={color}
        variant={variant}
        size="lg"
        className={`h-20 text-3xl font-bold transition-all ${!value && !state.isGameOver ? 'hover:bg-surface-hover' : ''}`}
        onClick={() => handleCellClick(index)}
        disabled={state.isGameOver || value !== null}
      >
        {value || ''}
      </Button>
    );
  };

  return (
    <div className="w-full max-w-[320px] rounded-2xl border border-default bg-surface shadow-lg p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="heading-lg m-0 font-bold text-center w-full">Tic-Tac-Toe</h2>
      </div>

      <div className="text-secondary text-base mb-5 leading-relaxed bg-surface-hover p-3 rounded-lg border border-subtle text-center font-medium">
        {state.message}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-tertiary p-3 rounded-xl border border-subtle">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => renderCell(index))}
      </div>

      {state.isGameOver && (
        <div className="mt-5 pt-4 border-t border-subtle text-center">
          <p className="text-sm text-secondary font-medium">Type "Start Tic-Tac-Toe" to play again.</p>
        </div>
      )}
    </div>
  );
}
