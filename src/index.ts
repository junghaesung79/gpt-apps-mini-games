import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { NumberGuessGame } from './games/number-guess/index.js';

// --- Session Manager ---
// GPT와의 대화(세션)마다 다른 게임 상태를 가지도록 관리합니다.
const gameSessions = new Map<string, NumberGuessGame>();

function getGameSession(sessionId: string): NumberGuessGame {
  if (!gameSessions.has(sessionId)) {
    gameSessions.set(sessionId, new NumberGuessGame());
  }
  return gameSessions.get(sessionId)!;
}

// --- Server Setup ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // GPT 도메인 등에서의 접근 허용
app.use(express.json()); // JSON 바디 파싱

// --- Health Check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GPT Games Server is running' });
});

// --- API Endpoints: Number Guessing Game ---
// GPT Actions에서 호출할 엔드포인트들

// 1. 게임 시작
app.post('/api/number-guess/start', (req, res) => {
  const sessionId = req.headers['x-session-id'] as string || uuidv4();
  const game = getGameSession(sessionId);
  
  const result = game.start();
  
  res.json({
    sessionId, // 클라이언트(GPT)에게 세션 ID를 돌려주어 다음 요청 때 사용하게 함
    ...result,
  });
});

// 2. 숫자 추측
app.post('/api/number-guess/guess', (req, res) => {
  const sessionId = req.headers['x-session-id'] as string;
  const { guess } = req.body;

  if (!sessionId) {
    res.status(400).json({ success: false, message: 'Missing x-session-id header' });
    return;
  }
  if (typeof guess !== 'number' || guess < 1 || guess > 100) {
    res.status(400).json({ success: false, message: 'Invalid guess. Must be a number between 1 and 100' });
    return;
  }

  const game = getGameSession(sessionId);
  const result = game.guess(guess);
  
  // 게임이 끝나면 세션 정리 방안도 추후 고려할 수 있음 (현재는 리셋 가능하도록 유지)
  res.json(result);
});

// 3. 상태 확인
app.get('/api/number-guess/status', (req, res) => {
  const sessionId = req.headers['x-session-id'] as string;

  if (!sessionId) {
    res.status(400).json({ success: false, message: 'Missing x-session-id header' });
    return;
  }

  const game = getGameSession(sessionId);
  const result = game.getStatus();
  
  res.json(result);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Games Server API is running on http://localhost:${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/health`);
});
