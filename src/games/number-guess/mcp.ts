import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { NumberGuessGame } from './index.js';
import fs from 'fs';
import path from 'path';

export function registerNumberGuessTools(server: McpServer) {
  // 인메모리로 게임 상태를 유지할 싱글톤 인스턴스 (학습용이므로 서버당 1개 상태로 시작)
  const game = new NumberGuessGame();

  // --- UI Widget Resource 등록 ---
  // ChatGPT가 outputTemplate URI를 요청할 때 호출됩니다.
  server.resource(
    'number-guess-ui',
    'ui://widget/index.html',
    { mimeType: 'text/html+skybridge' },
    async (uri) => {
      try {
        const htmlPath = path.resolve(process.cwd(), 'ui/dist/index.html');
        let html = fs.readFileSync(htmlPath, 'utf-8');

        // 싱글톤 게임 상태를 HTML 렌더링 시점에 주입합니다.
        const currentState = game.getState();
        const injectionState = {
          message: game.getStatus().message || 'Waiting for first guess...',
          attempts: currentState.attempts,
          maxAttempts: currentState.maxAttempts,
          isGameOver: !currentState.isActive && currentState.attempts > 0,
        };

        const scriptTag = `<script>window.GAME_STATE = ${JSON.stringify(injectionState)};</script>`;
        html = html.replace('<head>', `<head>${scriptTag}`);

        return {
          contents: [{
            uri: uri.href,
            mimeType: 'text/html+skybridge',
            text: html
          }]
        };
      } catch (error) {
        console.error('Failed to load UI HTML:', error);
        throw error;
      }
    }
  );

  server.registerTool(
    'start_number_guess',
    {
      description: 'Start a new Number Guessing Game (1-100)',
      annotations: { destructiveHint: true },
      _meta: {
        "openai/outputTemplate": "ui://widget/index.html",
        ui: { resourceUri: "ui://widget/index.html" }
      }
    },
    async () => {
      const result = game.start();
      return {
        content: [{ type: 'text', text: result.message }],
        _meta: {
          "openai/outputTemplate": "ui://widget/index.html",
          ui: { resourceUri: "ui://widget/index.html" }
        }
      };
    }
  );

  server.registerTool(
    'make_guess',
    {
      description: 'Guess a number in the Number Guessing Game',
      inputSchema: {
        guess: z.number().int().min(1).max(100).describe('Your number guess (1-100)')
      },
      annotations: { destructiveHint: true },
      _meta: {
        "openai/outputTemplate": "ui://widget/index.html",
        ui: { resourceUri: "ui://widget/index.html" }
      }
    },
    async ({ guess }) => {
      const result = game.guess(guess);
      return {
        content: [{ type: 'text', text: result.message }],
        _meta: {
          "openai/outputTemplate": "ui://widget/index.html",
          ui: { resourceUri: "ui://widget/index.html" }
        }
      };
    }
  );

  server.registerTool(
    'get_number_guess_status',
    {
      description: 'Get the current status of the Number Guessing Game',
      annotations: { readOnlyHint: true },
      _meta: {
        "openai/outputTemplate": "ui://widget/index.html",
        ui: { resourceUri: "ui://widget/index.html" }
      }
    },
    async () => {
      const result = game.getStatus();
      return {
        content: [{ type: 'text', text: result.message }],
        _meta: {
          "openai/outputTemplate": "ui://widget/index.html",
          ui: { resourceUri: "ui://widget/index.html" }
        }
      };
    }
  );
}
