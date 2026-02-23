import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { NumberGuessGame } from './index.js';

export function registerNumberGuessTools(server: McpServer) {
  // 인메모리로 게임 상태를 유지할 싱글톤 인스턴스 (학습용이므로 서버당 1개 상태로 시작)
  const game = new NumberGuessGame();

  server.tool(
    'start_number_guess',
    'Start a new Number Guessing Game (1-100)',
    {},
    async () => {
      const result = game.start();
      return {
        content: [{ type: 'text', text: result.message }],
      };
    }
  );

  server.tool(
    'make_guess',
    'Guess a number in the Number Guessing Game',
    {
      guess: z.number().int().min(1).max(100).describe('Your number guess (1-100)'),
    },
    async ({ guess }) => {
      const result = game.guess(guess);
      return {
        content: [{ type: 'text', text: result.message }],
      };
    }
  );

  server.tool(
    'get_number_guess_status',
    'Get the current status of the Number Guessing Game',
    {},
    async () => {
      const result = game.getStatus();
      return {
        content: [{ type: 'text', text: result.message }],
      };
    }
  );
}
