import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerNumberGuessTools } from './games/number-guess/mcp.js';

// 생성할 서버 정보
const server = new McpServer({
  name: 'mcp-games-server',
  version: '1.0.0',
});

// 도구 등록
registerNumberGuessTools(server);

// stdio 기반 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Games Server running on stdio"); // stdio 통신이므로 로그는 stderr로 출력해야 합니다.
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
