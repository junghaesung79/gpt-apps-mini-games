import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TicTacToeGame } from './index.js';
import fs from 'fs';
import path from 'path';

function getEncodedState(game: TicTacToeGame) {
  const currentState = game.getState();
  const injectionState = {
    gameType: 'tic-tac-toe',
    message: currentState.message,
    board: currentState.board,
    status: currentState.status,
    isGameOver: currentState.status !== 'playing'
  };
  return Buffer.from(encodeURIComponent(JSON.stringify(injectionState))).toString('base64');
}

export function registerTicTacToeTools(server: McpServer) {
  const game = new TicTacToeGame();

  // --- UI Widget Resource 등록 ---
  // 등록된 URI가 서로 충돌하지 않도록 'ui://widget/tic-tac-toe.html' 로 분리하여 제공합니다.
  server.resource(
    'tic-tac-toe-ui',
    'ui://widget/tic-tac-toe.html',
    { mimeType: 'text/html+skybridge' },
    async (uri) => {
      try {
        const htmlPath = path.resolve(process.cwd(), 'ui/dist/index.html');
        let html = fs.readFileSync(htmlPath, 'utf-8');

        const currentState = game.getState();
        const injectionState = {
          gameType: 'tic-tac-toe',
          message: currentState.message,
          board: currentState.board,
          status: currentState.status,
          isGameOver: currentState.status !== 'playing'
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
        console.error('Failed to load UI HTML for Tic-Tac-Toe:', error);
        throw error;
      }
    }
  );

  server.registerTool(
    'start_tic_tac_toe',
    {
      description: 'Start a new Tic-Tac-Toe game. You will play as X against the AI (O).',
      annotations: { destructiveHint: true },
      _meta: {
        "openai/outputTemplate": "ui://widget/tic-tac-toe.html",
        ui: {
          resourceUri: "ui://widget/tic-tac-toe.html",
          csp: "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'",
          domain: "localhost"
        }
      }
    },
    async () => {
      const result = game.start();
      const encoded = getEncodedState(game);
      return {
        content: [{ type: 'text', text: result.message }],
        _meta: {
          "openai/outputTemplate": `ui://widget/tic-tac-toe.html#${encoded}`,
        }
      };
    }
  );

  server.registerTool(
    'play_tic_tac_toe',
    {
      description: 'Place your X on the Tic-Tac-Toe board. Index goes from 0-8 (0=top-left, 8=bottom-right).',
      inputSchema: {
        position: z.number().int().min(0).max(8).describe('Cell index (0-8) to place your X.')
      },
      annotations: { destructiveHint: true },
      _meta: {
        "openai/outputTemplate": "ui://widget/tic-tac-toe.html",
        ui: {
          resourceUri: "ui://widget/tic-tac-toe.html",
          csp: "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'",
          domain: "localhost"
        }
      }
    },
    async ({ position }) => {
      const result = game.play(position);
      const encoded = getEncodedState(game);
      return {
        content: [{ type: 'text', text: result.message }],
        _meta: {
          "openai/outputTemplate": `ui://widget/tic-tac-toe.html#${encoded}`,
        }
      };
    }
  );

  server.registerTool(
    'get_tic_tac_toe_status',
    {
      description: 'Get the current status and board of the Tic-Tac-Toe game.',
      annotations: { readOnlyHint: true },
      _meta: {
        "openai/outputTemplate": "ui://widget/tic-tac-toe.html",
        ui: {
          resourceUri: "ui://widget/tic-tac-toe.html",
          csp: "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self'",
          domain: "localhost"
        }
      }
    },
    async () => {
      const result = game.getState();
      const encoded = getEncodedState(game);
      return {
        content: [{ type: 'text', text: result.message }],
        _meta: {
          "openai/outputTemplate": `ui://widget/tic-tac-toe.html#${encoded}`,
        }
      };
    }
  );
}
