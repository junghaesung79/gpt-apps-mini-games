import { useState, useEffect } from 'react';

export function NumberGuessGame() {
  const [state] = useState(window.GAME_STATE as any || {
    message: 'Game starting...',
    attempts: 0,
    maxAttempts: 10,
    isGameOver: false,
    lastGuess: undefined
  });

  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    if (!window.GAME_STATE) {
      console.warn("No GAME_STATE injected. Running with default dummy state.");
    }
  }, []);

  const handleKeyClick = (num: number) => {
    if (state.isGameOver) return;
    setInputVal(prev => prev + num.toString());
  };

  const handleClear = () => setInputVal('');

  const handleSubmit = () => {
    if (!inputVal || state.isGameOver) return;
    const runCommand = `I guess ${inputVal}`;
    // In actual ChatGPT context, window.openai.sendMessage would be used here over alert
    if (window.openai) {
      window.openai.sendMessage(runCommand);
    } else {
      alert(`In ChatGPT, you would send: "${runCommand}"`);
    }
    setInputVal('');
  };

  const isWarning = state.attempts >= state.maxAttempts - 2;

  return (
    <div className="w-full max-w-[340px] toss-card">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-bold text-slate-800 m-0">Number Baseball</h2>
          <span className="text-xs font-medium text-slate-400">Guess 1 to 100</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${isWarning ? "bg-red-100 text-red-600" : state.isGameOver ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-600"}`}>
          {state.attempts} / {state.maxAttempts}
        </div>
      </div>

      <div className="text-sm text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-2xl text-center font-medium shadow-inner">
        {state.message}
      </div>

      <div className="flex justify-end p-4 bg-slate-100 rounded-2xl mb-5 text-4xl font-mono text-slate-800 min-h-[72px] items-center tracking-widest shadow-inner">
        {inputVal || <span className="text-slate-300 text-xl font-sans tracking-normal">0</span>}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className="h-14 bg-white border-2 border-slate-200 hover:bg-slate-50 rounded-2xl text-2xl font-semibold text-slate-700 shadow-[0_4px_0_rgb(226,232,240)] active:shadow-[0_0px_0_rgb(226,232,240)] active:translate-y-[4px] disabled:opacity-50 disabled:pointer-events-none transition-all"
            onClick={() => handleKeyClick(num)}
            disabled={state.isGameOver}
          >
            {num}
          </button>
        ))}
        <button
          className="h-14 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl text-xl font-bold border-2 border-red-200 shadow-[0_4px_0_rgb(254,202,202)] active:shadow-[0_0px_0_rgb(254,202,202)] active:translate-y-[4px] disabled:opacity-50 transition-all"
          onClick={handleClear}
          disabled={state.isGameOver}
        >
          C
        </button>
        <button
          className="h-14 bg-white border-2 border-slate-200 hover:bg-slate-50 rounded-2xl text-2xl font-semibold text-slate-700 shadow-[0_4px_0_rgb(226,232,240)] active:shadow-[0_0px_0_rgb(226,232,240)] active:translate-y-[4px] disabled:opacity-50 transition-all"
          onClick={() => handleKeyClick(0)}
          disabled={state.isGameOver}
        >
          0
        </button>
        <button
          className="h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xl font-bold border-2 border-blue-600 shadow-[0_4px_0_rgb(37,99,235)] active:shadow-[0_0px_0_rgb(37,99,235)] active:translate-y-[4px] disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-100 disabled:border-slate-300 disabled:shadow-[0_4px_0_rgb(203,213,225)] transition-all"
          onClick={handleSubmit}
          disabled={state.isGameOver || inputVal.length === 0}
        >
          OK
        </button>
      </div>

      {state.isGameOver && (
        <div className="mt-8 pt-5 border-t border-slate-100 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <button
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl border-2 border-slate-900 shadow-[0_4px_0_rgb(15,23,42)] active:shadow-[0_0px_0_rgb(15,23,42)] active:translate-y-[4px] transition-all"
            onClick={() => {
              const runCommand = "Restart Number Baseball";
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
