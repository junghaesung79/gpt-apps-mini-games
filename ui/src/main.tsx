import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Extract state from URL hash if provided (solves caching issues in ChatGPT iframe)
try {
  if (window.location.hash && window.location.hash.length > 1) {
    const hashData = window.location.hash.slice(1);
    // Decode base64 and URI encoding safely
    const decodedStr = decodeURIComponent(atob(hashData));
    window.GAME_STATE = JSON.parse(decodedStr);
  }
} catch (e) {
  console.error("Failed to parse state from hash:", e);
}

// Local development mock state
if (import.meta.env.DEV && !window.GAME_STATE) {
  window.GAME_STATE = {
    gameType: 'tic-tac-toe', // Change to 'number-guess' to test the other UI
    message: '[DEV MOCK] Game started. Choose an empty cell.',
    board: Array(9).fill(null),
    status: 'playing',
    attempts: 3,
    maxAttempts: 10
  };

  window.openai = {
    sendMessage: (msg) => {
      console.log(`[DEV MOCK] API Message Sent: ${msg}`);
      alert(`[DEV MOCK] Message sent to ChatGPT:\n"${msg}"\n(This will be forwarded to the server in a real environment.)`);
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
