import { useState, useEffect } from 'react';

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
    let bgClass = 'bg-white hover:bg-slate-50 border-slate-200 shadow-[0_5px_0_rgb(226,232,240)] active:shadow-[0_0px_0_rgb(226,232,240)]';
    let textClass = 'text-slate-700';

    if (value === 'X') {
      bgClass = 'bg-blue-50 border-blue-200 shadow-[0_5px_0_rgb(191,219,254)] active:shadow-[0_0px_0_rgb(191,219,254)]';
      textClass = 'text-blue-500';
    } else if (value === 'O') {
      bgClass = 'bg-red-50 border-red-200 shadow-[0_5px_0_rgb(254,202,202)] active:shadow-[0_0px_0_rgb(254,202,202)]';
      textClass = 'text-red-500';
    }

    return (
      <div key={index} className="relative w-full pt-[100%]">
        <button
          className={`absolute inset-0 w-full h-full text-4xl font-bold rounded-2xl border-2 transition-all flex items-center justify-center active:translate-y-[5px] disabled:opacity-50 disabled:pointer-events-none ${bgClass} ${textClass}`}
          onClick={() => handleCellClick(index)}
          disabled={state.isGameOver || value !== null}
        >
          {value || ''}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[340px] toss-card">
      <div className="flex flex-col items-center gap-1 mb-5">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 m-0">Tic-Tac-Toe</h2>
        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Mini Game</span>
      </div>

      <div className="text-sm text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-2xl text-center font-medium shadow-inner">
        {state.message}
      </div>

      <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm w-full">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => renderCell(index))}
      </div>

      {state.isGameOver && (
        <div className="mt-6 pt-5 border-t border-slate-100 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <button
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-md transition-all active:scale-95"
            onClick={() => {
              const runCommand = "Start Tic-Tac-Toe";
              if (window.openai) window.openai.sendMessage(runCommand);
              else alert(runCommand);
            }}
          >
            Play Again 🚀
          </button>
        </div>
      )}
    </div>
  );
}
