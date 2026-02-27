import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleHashChange = () => {
      try {
        if (window.location.hash && window.location.hash.length > 1) {
          const hashData = window.location.hash.slice(1);
          const decodedStr = decodeURIComponent(atob(hashData));
          window.GAME_STATE = JSON.parse(decodedStr);
          setRefreshKey(prev => prev + 1); // Force re-render with new state
        }
      } catch (e) {
        console.error("Failed to parse state from hashchange:", e);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
