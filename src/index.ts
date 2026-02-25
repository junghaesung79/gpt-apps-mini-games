import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerNumberGuessTools } from './games/number-guess/mcp.js';
import { registerTicTacToeTools } from './games/tic-tac-toe/mcp.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json()); // JSON Body Parser 추가

// MCP 서버 설정 (도구 정보를 가지고 있는 마스터 서버)
const server = new McpServer({
  name: 'mcp-games-server',
  version: '1.0.0',
});

// 모든 게임 도구 등록
registerNumberGuessTools(server);
registerTicTacToeTools(server);

// --- SSE Transport 관리 ---
// 세션별로 활성화된 transport 객체들을 보관
const transportMap = new Map<string, SSEServerTransport>();

// 1. SSE 연결 수립
app.get('/sse', async (req, res) => {
  // Transport 인스턴스를 생성하면 내부적으로 Session ID(UUID)가 생성됩니다.
  const transport = new SSEServerTransport('/messages', res);
  const sessionId = transport.sessionId;

  transportMap.set(sessionId, transport);

  // 서버 인스턴스에 transport 연결
  try {
    await server.connect(transport);
  } catch (error) {
    console.error(`Failed to connect transport for session ${sessionId}:`, error);
  }

  // 연결 종료 시 정리
  req.on('close', () => {
    console.log(`SSE connection closed: ${sessionId}`);
    transportMap.delete(sessionId);
  });
});

// 2. 메시지 수신 (id별로 전송)
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transportMap.get(sessionId);

  console.log(`[POST /messages] Received request for sessionId: ${sessionId}`);
  console.log(`[POST /messages] Currently active sessions: ${Array.from(transportMap.keys()).join(', ')}`);

  if (!transport) {
    res.status(404).send('Invalid or expired sessionId');
    return;
  }

  // 해당 세션의 transport로 메시지 전달 (express.json()에 의해 파싱된 body를 직접 전달)
  await transport.handlePostMessage(req, res, req.body);
});

// --- Health Check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', activeSessions: transportMap.size });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MCP Games Server (Fixed SSE) is running on http://0.0.0.0:${PORT}`);
  console.log(`   SSE Endpoint: http://localhost:${PORT}/sse`);
});
