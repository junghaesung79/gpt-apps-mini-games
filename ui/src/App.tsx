import { useState } from 'react';
import { NumberGuessGame } from './components/NumberGuessGame';
import { TicTacToeGame } from './components/TicTacToeGame';
import { DevPanel } from './components/DevPanel';
import './App.css';

// Type expansion to account for the new gameType attribute injected by the server
declare global {
  interface Window {
    GAME_STATE?: {
      gameType?: 'number-guess' | 'tic-tac-toe';
      // common or varied payload depending on game
      [key: string]: any;
    };
    openai?: {
      sendMessage: (message: string) => void;
    };
  }
}

function App() {
  const [, setRefreshKey] = useState(0);
  const gameType = window.GAME_STATE?.gameType || 'number-guess';

  return (
    <div className="flex justify-center items-center w-full min-h-full bg-transparent p-4">
      {gameType === 'tic-tac-toe' ? (
        <TicTacToeGame key={gameType + window.GAME_STATE?.status + window.GAME_STATE?.attempts} />
      ) : (
        <NumberGuessGame key={gameType + window.GAME_STATE?.status + window.GAME_STATE?.attempts} />
      )}

      {import.meta.env.DEV && (
        <DevPanel onStateChange={() => setRefreshKey(prev => prev + 1)} />
      )}
    </div>
  );
}

export default App;
