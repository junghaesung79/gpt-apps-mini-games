import { useState, useEffect } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Badge } from '@openai/apps-sdk-ui/components/Badge';

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
    <div className="w-full max-w-[320px] rounded-2xl border border-default bg-surface shadow-lg p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="heading-lg m-0 font-bold">Number Baseball</h2>
        </div>
        <Badge color={isWarning ? "danger" : state.isGameOver ? "secondary" : "success"}>
          {state.attempts} / {state.maxAttempts}
        </Badge>
      </div>

      <div className="text-secondary text-base mb-5 leading-relaxed bg-surface-hover p-3 rounded-lg border border-subtle">
        {state.message}
      </div>

      <div className="flex justify-end p-4 bg-tertiary rounded-xl mb-4 text-3xl font-mono text-primary min-h-[64px] items-center border border-subtle">
        {inputVal || <span className="text-tertiary text-lg">Enter number</span>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button
            key={num}
            variant="soft"
            color="secondary"
            size="lg"
            className="text-xl font-medium"
            onClick={() => handleKeyClick(num)}
            disabled={state.isGameOver}
          >
            {num}
          </Button>
        ))}
        <Button variant="soft" color="danger" size="lg" className="text-lg font-bold" onClick={handleClear} disabled={state.isGameOver}>C</Button>
        <Button variant="soft" color="secondary" size="lg" className="text-xl font-medium" onClick={() => handleKeyClick(0)} disabled={state.isGameOver}>0</Button>
        <Button color="primary" size="lg" className="text-lg font-bold" onClick={handleSubmit} disabled={state.isGameOver || inputVal.length === 0}>OK</Button>
      </div>

      {state.isGameOver && (
        <div className="mt-4 pt-4 border-t border-subtle text-center">
          <p className="text-sm text-secondary font-medium">To play again, type something like "Restart game".</p>
        </div>
      )}
    </div>
  );
}
