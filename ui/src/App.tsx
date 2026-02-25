import { NumberGuessGame } from './components/NumberGuessGame';
import { TicTacToeGame } from './components/TicTacToeGame';
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
  const gameType = window.GAME_STATE?.gameType || 'number-guess';

  return (
    <div className="flex justify-center items-center w-full min-h-screen bg-transparent p-4">
      {gameType === 'tic-tac-toe' ? (
        <TicTacToeGame />
      ) : (
        <NumberGuessGame />
      )}
    </div>
  );
}

export default App;
