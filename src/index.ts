import express from 'express';
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerNumberGuessTools } from './games/number-guess/mcp.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // CROS 허용 (GPT 앱과 통신 시 필수)

// MCP 서버 인스턴스 생성
const server = new McpServer({
  name: 'mcp-games-server',
  version: '1.0.0',
});

// 도구 등록 (기존에 만들어둔 mcp.ts 함수 재사용)
registerNumberGuessTools(server);

// --- SSE Transport 관리 ---
// 연결된 각 세션(클라이언트)별 transport 객체를 저장
let transport: SSEServerTransport;

// 1. SSE 연결 수립 (GPT가 맨 처음 접속하는 엔드포인트)
app.get('/sse', async (req, res) => {
  transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);

  // 클라이언트 측 연결 해제 대응
  req.on('close', () => {
    console.log('SSE connection closed by client');
  });
});

// 2. 메시지 수신 (GPT가 Tool 실행 등을 요청하는 엔드포인트)
// 주의: SSEServerTransport는 자체적으로 메시지 처리를 담당하므로
// Body 파싱 미들웨어 동작 방식에 유의하거나, raw 바디를 전달해야 할 수 있습니다. 
// 가장 간단한 방식은 transport 내부 핸들러에 위임하는 것입니다.
app.post('/messages', async (req, res) => {
  if (!transport) {
    res.status(400).send('No active SSE connection.');
    return;
  }
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
