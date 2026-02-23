import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerNumberGuessTools } from './games/number-guess/mcp.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // CORS 허용 (GPT 앱과 통신 시 필수)

// MCP 서버 인스턴스 생성
const server = new McpServer({
  name: 'mcp-games-server',
  version: '1.0.0',
});

// 도구 등록
registerNumberGuessTools(server);

// --- SSE Transport 관리 ---
// 연결된 각 세션(클라이언트)별 transport 객체를 저장
const transports = new Map<string, SSEServerTransport>();

// 1. SSE 연결 수립 (GPT가 맨 처음 접속하는 엔드포인트)
app.get('/sse', async (req, res) => {
  // 고유한 세션 ID 발급
  const sessionId = Math.random().toString(36).substring(7);

  // 클라이언트가 메시지를 보낼 때 자신만의 세션 ID를 파라미터로 붙여서 찾을 수 있게 해줍니다.
  const transport = new SSEServerTransport(`/messages?sessionId=${sessionId}`, res);
  transports.set(sessionId, transport);

  await server.connect(transport);

  // 클라이언트 측 연결 해제 대응
  req.on('close', () => {
    console.log(`SSE connection closed by client (sessionId: ${sessionId})`);
    transports.delete(sessionId);
  });
});

// 2. 메시지 수신 (GPT가 Tool 실행 등을 요청하는 엔드포인트)
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);

  if (!transport) {
    res.status(404).send('Session not found or expired.');
    return;
  }

  // MCP 통신을 위해 메시지를 Transport로 전달
  await transport.handlePostMessage(req, res);
});

// --- Health Check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GPT Games MCP Proxy (SSE) is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 MCP Games Server (SSE) is running on http://localhost:${PORT}`);
  console.log(`   SSE Endpoint: http://localhost:${PORT}/sse`);
  console.log(`   Health Check: http://localhost:${PORT}/health`);
});
