import { useState } from 'react';

// 미리 정의된 다양한 UI 테스트 케이스 (Mock States)
const MOCK_SCENARIOS = {
  'tic-tac-toe (Empty)': {
    gameType: 'tic-tac-toe',
    message: 'Game started! You are X. Make your move.',
    board: Array(9).fill(null),
    status: 'playing',
  },
  'tic-tac-toe (Playing)': {
    gameType: 'tic-tac-toe',
    message: 'Your turn! You are X.',
    board: ['X', 'O', null, null, 'X', null, null, null, 'O'],
    status: 'playing',
  },
  'tic-tac-toe (X Won)': {
    gameType: 'tic-tac-toe',
    message: 'Congratulations! You won! 🎉',
    board: ['X', 'O', null, 'O', 'X', null, null, null, 'X'],
    status: 'x_won',
  },
  'tic-tac-toe (O Won)': {
    gameType: 'tic-tac-toe',
    message: 'AI won! Better luck next time. 🤖',
    board: ['O', 'O', 'O', 'X', 'X', null, null, 'X', null],
    status: 'o_won',
  },
  'number-guess (Start)': {
    gameType: 'number-guess',
    message: 'Game starting... Guess a number!',
    attempts: 0,
    maxAttempts: 10,
    isGameOver: false,
  },
  'number-guess (Warning)': {
    gameType: 'number-guess',
    message: 'Too high! Try again.',
    attempts: 8,
    maxAttempts: 10,
    isGameOver: false,
  },
  'number-guess (Lose)': {
    gameType: 'number-guess',
    message: 'Game Over! The number was 42.',
    attempts: 10,
    maxAttempts: 10,
    isGameOver: true,
  },
};

export function DevPanel({ onStateChange }: { onStateChange: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  // 현재 환경이 개발(DEV) 모드가 아니면 아예 렌더링하지 않음 (프로덕션 안전장치)
  if (!import.meta.env.DEV) return null;

  const applyMock = (scenarioKey: keyof typeof MOCK_SCENARIOS) => {
    window.GAME_STATE = MOCK_SCENARIOS[scenarioKey] as any;
    onStateChange(); // App.tsx에 상태가 바뀌었음을 알림 (리렌더링 트리거)
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 font-mono"
      >
        🛠 DevPanel
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border-2 border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col font-sans">
      <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold text-sm m-0">🛠 UI Mock Scenarios</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white">✕</button>
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto bg-slate-50">
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          This panel is only visible in the local development environment (npm run dev). You can quickly test various mock states here.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Tic-Tac-Toe</h4>
            <div className="flex flex-col gap-2">
              {Object.keys(MOCK_SCENARIOS)
                .filter(k => k.startsWith('tic'))
                .map(key => (
                  <button
                    key={key}
                    onClick={() => applyMock(key as any)}
                    className="text-left px-3 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    {key.replace('tic-tac-toe ', '')}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Number Guess</h4>
            <div className="flex flex-col gap-2">
              {Object.keys(MOCK_SCENARIOS)
                .filter(k => k.startsWith('num'))
                .map(key => (
                  <button
                    key={key}
                    onClick={() => applyMock(key as any)}
                    className="text-left px-3 py-2 bg-white border border-slate-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    {key.replace('number-guess ', '')}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
