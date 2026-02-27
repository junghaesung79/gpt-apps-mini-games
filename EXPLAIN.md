# 🧩 GPT Mini Games 프로젝트 구조 및 작동 원리 (EXPLAIN)

이 문서는 현재 구축된 **GPT Apps (MCP 기반) 미니 게임 프로젝트**의 전체 아키텍처와 파일 구조를 상세히 설명하는 가이드입니다. 향후 불필요한 코드를 줄이고 성능을 최적화하기 위해, **어떤 파일이 무슨 역할을 하는지** 완벽히 파악하는 것을 목표로 합니다.

---

## 🗂️ 전체 디렉토리 구조 요약

```text
gpt-mini-games/
├── package.json          # [Root] 백엔드 패키지 설정
├── tsconfig.json         # [Root] 백엔드 타입스크립트 설정
├── src/                  # [Backend] MCP 서버 및 게임 로직
│   ├── index.ts          # Express 서버 및 SSE 통신 진입점
│   └── games/            # 개별 게임 모듈 디렉토리
│       ├── number-guess/ 
│       │   ├── index.ts  # 숫자 야구 게임 코어 로직
│       │   └── mcp.ts    # ChatGPT용 Tool 명세 및 UI 렌더링 연결부
│       └── tic-tac-toe/
│           ├── index.ts  # 틱택토 게임 코어 로직
│           └── mcp.ts    # 틱택토용 Tool 명세 및 UI 렌더링 연결부
│
└── ui/                   # [Frontend] ChatGPT 내부에 그려질 React UI 앱
    ├── package.json      # 프론트엔드 패키지 설정
    ├── vite.config.ts    # Vite 번들링 설정 (Single File Output)
    ├── index.html        # UI 렌더링 엔트리 HTML
    └── src/
        ├── main.tsx      # React 진입점
        ├── App.tsx       # 동적 게임 UI 라우팅 (게임 종류에 따라 화면 조건부 렌더링)
        ├── App.css       # 전역 스타일시트
        └── components/   # 개별 게임 프론트엔드 컴포넌트
            ├── NumberGuessGame.tsx
            └── TicTacToeGame.tsx
```

---

## 📱 ChatGPT 인앱(In-App) UI 레이아웃 생존 전략 (Iframe Strategy)

ChatGPT 위젯은 단순한 웹페이지가 아니라 모바일 앱과 데스크탑 웹의 **제한된 Iframe(모래상자)** 안에서 렌더링됩니다. 따라서 일반적인 웹 개발과는 다른 엄격한 CSS 전략이 필요하며, 우리 프로젝트는 이를 완벽히 대비해두었습니다.

### 1. 절대 `100vh`를 사용하지 말 것 (Iframe 팽창 방지)
*   **문제**: ChatGPT 앱 내부의 Iframe은 내부 컨텐츠의 높이에 맞춰 동적으로 스스로의 높이를 조절(Auto-resizing)하려 합니다. 이때 프론트엔드에서 `height: 100vh`를 주석버리면 Iframe 사이즈 계산 충돌이 발생하여 화면이 무한히 길어지거나 스크롤이 두 개가 생깁니다.
*   **우리 프로젝트의 해결책**: `ui/src/index.css`와 `App.css`에서 `min-height: 100%`를 사용하고, 바깥쪽(`body`)의 팽창 여백을 `padding: 16px` 조여서 컨텐츠 스스로가 높이를 결정하도록 유도했습니다.

### 2. 이중 스크롤(Double Scrollbars) 차단
*   **문제**: 모바일이나 데스크탑에서 위젯 자체 스크롤 창과 ChatGPT 대화창 스크롤이 겹치면 최악의 사용자 경험(스크롤 갇힘 현상)이 발생합니다.
*   **우리 프로젝트의 해결책**: `body` 레벨에 `overflow: hidden`과 `overscroll-behavior: none`을 선언하여, 위젯 자체의 스크롤을 원천 차단했습니다. 오직 우리의 게임 보드 UI 덩어리만 화면 중앙에 딱 맞게(max-w-[340px]) 안착되도록 설계했습니다.

### 3. 반응형 가로폭 (Mobile Friendly Width)
*   **문제**: ChatGPT 모바일 앱 화면은 매우 좁습니다. (아이폰 SE 기준 가로 320px). 넓게 고정된 UI는 모바일에서 잘려 나갑니다.
*   **우리 프로젝트의 해결책**: 게임 컴포넌트(`NumberGuessGame`, `TicTacToeGame`)의 최상단 껍데기(`toss-card`)에 `w-full max-w-[340px]` 속성을 주었습니다. 데스크탑에서는 최대 340px로 예쁘게 고정되고, 모바일 같이 좁은 화면에서는 좌우 여백 없이 `100% (w-full)`로 부드럽게 축빙됩니다.

---

## 🧠 1. 백엔드 (Backend): `src/` 디렉토리
ChatGPT가 던지는 자연어를 분석하여 **함수(Tool)를 실행**하고, 브라우저가 접속할 **통신창구(SSE)를 열어주는** 두뇌 라우팅 파트입니다.

### `src/index.ts`
- **역할**: 가장 핵심이 되는 MCP 서버이자 Express 웹 서버입니다.
- **핵심 동작**:
  1. `Express` 앱을 생성하고 3000번 포트로 구동합니다.
  2. `/sse` 엔드포인트를 열어 ChatGPT가 지속적으로 통신할 수 있는 실시간 연결(Server-Sent Events) 파이프를 구축합니다.
  3. 프론트엔드 컴파일 결과물인 `ui/dist/` 폴더를 정적 파일로 서빙하여, ChatGPT가 위젯을 띄울 수 있도록 허용합니다.

### `src/games/` (모듈화된 게임 폴더)
각 게임별로 비즈니스 로직(`index.ts`)과 ChatGPT와의 인터페이스 명세(`mcp.ts`)가 분리되어 있습니다.

#### `index.ts` (비즈니스 로직)
- **역할**: 순수한 게임의 규칙(State Management, Win/Loss 판단)만 들어있습니다.
- **특징**: ChatGPT나 외부 네트워크와 무관하게, `game.start()`, `game.play()` 함수만으로 테스트할 수 있도록 객체 지향적으로 구성되었습니다.

#### `mcp.ts` (툴 & UI 브릿지)
- **역할**: ChatGPT에게 "나한테 이런 기능(Tool)이 있으니 써먹어라" 라고 알려주는 명세서입니다.
- **핵심 동작**:
  - `server.registerTool(...)`을 통해 도구의 이름(`play_tic_tac_toe`), 설명, 파라미터 타입을 Zod 문법으로 정의합니다.
  - ChatGPT가 이 도구를 실행(Execute)할 때, 앞선 `index.ts`의 로직을 호출합니다.
  - **결정적 역할**: 실행을 마치고 성공/실패 텍스트를 리턴할 때, `_meta: { "openai/outputTemplate": "ui://widget/..." }` 라는 UI 렌더링용 프로토콜을 함께 주입하여 **"텍스트로 말하지 말고 저 예쁜 위젯을 그려서 보여줘"**라고 명령합니다.

---

## 🎨 2. 프론트엔드 (Frontend UI): `ui/` 디렉토리
ChatGPT 화면 내부 샌드박스(Iframe) 안에서 실제로 렌더링되는 **버튼, 색상, 애니메이션 화면들**입니다.

### `ui/vite.config.ts`
- **역할**: 빌드 도구인 Vite의 설정 파일입니다.
- **최적화 포인트**: `vite-plugin-singlefile` 플러그인을 사용하여, 수많은 JS/CSS 파일을 쪼개지 않고 **단 하나의 `index.html`**로 뭉치도록(Inlining) 만듭니다. 이는 ChatGPT가 외부 리소스(JS/CSS)를 불러오다 막히는 보안 이슈를 우회하기 위한 조치입니다.

### `ui/src/App.tsx`
- **역할**: 위젯의 부모(컨테이너) 역할을 수행하는 게이트웨이 컴포넌트입니다.
- **핵심 동작**: 백엔드에서 주입해 준 전역 변수 `window.GAME_STATE`를 읽어들입니다. 이 데이터의 `gameType`이 `"NUMBER_GUESS"`인지 `"TIC_TAC_TOE"`인지 판열하여, 해당하는 하위 컴포넌트를 조건부로 화면에 그려줍니다.

### `ui/src/components/*.tsx`
- **역할**: 각 게임의 실제 UI 덩어리입니다. 화면의 Grid 배열 구상, 승리/패배 시 나타나는 축하 색상, 사용자가 "X" 버튼을 클릭했을 때의 이벤트 핸들러(onClick) 등이 정의되어 있습니다.
- **데이터 흐름**: 여기서 버튼을 누르면 `window.openai.sendMessage({ ... })` 함수를 통해 ChatGPT(바깥쪽 부모창)로 텍스트 프롬프트를 전송하게 되고, ChatGPT가 다시 백엔드(MCP 서버)로 툴 실행을 지시하는 **순환 구조**를 가집니다.

---

## 🚀 앞으로 최적화(Optimization) 해볼 수 있는 방향 아이디어

이제 구조를 파악하셨으니, 아래와 같은 방향으로 최적화 및 고도화를 진행할 수 있습니다.

1. **상태 동기화 레이어 정리 (State Hydration)**
   백엔드(`mcp.ts`)에서 주입되는 `window.GAME_STATE`의 형태(Type)를 `App.tsx`에서 명확한 인터페이스(`interface GameState`)로 고정하면, 런타임 에러를 획기적으로 줄일 수 있습니다.
2. **UI 번들 파일 용량 다이어트**
   Vite 빌드 아웃풋 크기를 줄이기 위해, 사용하지 않는 Tailwind 클래스나 무거운 아이콘 라이브러리(Lucide 등)의 트리 쉐이킹(Tree Shaking) 설정을 좀 더 강하게 걸어줄 수 있습니다.
3. **Session 관리 고도화**
   현재 `mcp.ts`는 인메모리(서버 램)에 1개의 게임 인스턴스만 보관하는 싱글톤 방식입니다. 만약 유저가 늘어나면 Redis나 Sqlite를 연동하여 `sessionId`별로 게임 데이터를 DB(Storage)에 저장해야 안전한 운영 환경이 됩니다. 

---

## 🏛️ 구조적 적합성: OpenAI 지침 및 엔터프라이즈 앱과의 비교

이 프로젝트의 구조는 **OpenAI Apps SDK 공식 지침(Guidelines)** 및 실제 **스토어에 입점된 엔터프라이즈(기업용) 앱들의 모범 사례(Best Practices)**를 매우 충실하게 따르고 있습니다. 그 이유는 다음과 같습니다.

### 1. 완벽한 백엔드-프론트엔드 분리 (Decoupling)
*   **현재 구조**: 로직을 수행하는 `src/`(Node.js)와 UI를 그리는 `ui/`(React)가 디렉토리부터 빌드 파이프라인까지 완벽히 분리되어 있습니다.
*   **OpenAI 지침 일치**: OpenAI는 앱 프론트엔드가 ChatGPT라는 샌드박스 내부(`iframe` 유사 환경)에서 구동됨을 강조합니다. 따라서 백엔드 API와 화면을 그리는 정적 자산(HTML/JS)을 명확하게 분리하여 서빙(`ui://` 프로토콜)하는 현재 방식이 공식 권장 아키텍처입니다.

### 2. 단일 파일(Inlining) 번들링 (보안 및 렌더링 최적화)
*   **현재 구조**: `vite-plugin-singlefile`을 사용하여 CSS와 JS를 하나의 `index.html` 파일로 압축(인라인)하여 서빙합니다.
*   **엔터프라이즈 사례 일치**: 외부 CDN이나 여러 개의 별도 JS 파일을 로드하는 방식은 ChatGPT 앱의 엄격한 CSP(Content Security Policy)에 의해 차단될 수 있습니다. 캔바(Canva), 깃허브(GitHub) 등 상위 기업 앱들도 위젯 렌더링 시 **모든 스크립트가 내장된 단일 문서를 반환**하여 렌더링 속도를 극대화하고 보안 제약을 우회하는 방식을 사용합니다.

### 3. 무상태(Stateless) 도구 선언과 메타데이터 주입
*   **현재 구조**: `mcp.ts`에서 `server.registerTool`을 할 때 `destructiveHint` (상태 변경 경고)와 `_meta` (출력 템플릿 지정)를 사전에 스키마로 명확히 정의합니다.
*   **OpenAI 지침 일치**: OpenAI 앱 등록 심사 과정에서 가장 중요하게 보는 것이 "이 툴이 사용자의 데이터를 위험하게 수정하는가?"(`destructiveHint`) 입니다. 이를 명시적으로 선언한 점, 그리고 위젯을 띄우기 위한 `openai/outputTemplate` 명세를 정확히 지킨 점은 공식 SDK 스펙과 100% 일치합니다.

### 4. SSE (Server-Sent Events) 프로토콜 채택
*   **현재 구조**: 기존의 Stdio(표준 입출력) 방식이 아닌 HTTP 기반의 SSE를 사용하여 MCP 서버를 구동합니다.
*   **엔터프라이즈 기조**: 로컬 머신에서 CLI로만 쓸 때는 Stdio가 편하지만, 실제 AWS나 Vercel 같은 클라우드 환경에 앱을 배포하여 전 세계 사용자의 ChatGPT와 통신하려면 **반드시 HTTP 기반의 원격 브릿지(SSE)**가 필요합니다. 이 프로젝트는 이미 그 기반을 완벽하게 다져두었습니다.

### 결론
현재의 뼈대는 장난감(Toy project) 수준이 아니라, 언제든 **실제 서비스 환경(Production)으로 스케일업 할 수 있는 엔터프라이즈급 아키텍처**입니다. 여기서 최적화를 진행한다면 구조를 뒤엎는 것이 아니라, **세션 DB 추가(Redis), 로거 연동, 타입 엄격성 강화** 등 "살을 붇이는" 작업이 될 것입니다.
