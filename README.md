# 🎮 GPT Apps Mini-Games (MCP Server)

이 프로젝트는 **Model Context Protocol (MCP)**를 기반으로 구축된 텍스트 기반 게임 서버입니다. GPT Apps 환경에서 동작하도록 설계되었으며, 현재 여러 게임을 확장 가능하도록 모듈형 아키텍처를 채택하고 있습니다.

## 🚀 주요 기능
- **멀티 게임 지원**: 하나의 서버에서 여러 가지 게임(숫자 추측 등)을 관리 가능.
- **상태 유지(Stateful)**: 서버 메모리상에서 게임의 진행 상태(시도 횟수, 정답 등)를 유지.
- **MCP 표준 준수**: Claude Desktop, GPTs 등 MCP 클라이언트와 완벽하게 호환되는 Tool 인터페이스 제공.

## 🕹️ 현재 제공되는 게임
### 1. 숫자 추측 게임 (Number Guessing)
- **설명**: 1~100 사이의 난수를 맞추는 게임입니다.
- **제공 도구(Tools)**:
  - `start_number_guess`: 게임 시작
  - `make_guess`: 숫자 제출 및 Up/Down 힌트 확인
  - `get_number_guess_status`: 현재 상황 확인

## 🛠️ 개발 환경 설정

### 필수 준비물
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### 설치 및 빌드
```bash
# 의존성 설치
npm install

# TypeScript 컴파일 (빌드)
npm run build
```

### 실행 및 테스트
#### 1. 로컬 실행
```bash
npm start
```

#### 2. MCP Inspector로 테스트
MCP 공식 인스펙터를 사용하여 브라우저 환경에서 도구를 테스트할 수 있습니다.
```bash
npx @modelcontextprotocol/inspector node build/index.js
```

## 📂 프로젝트 구조
```text
src/
├── core/             # 공통 타입 및 인터페이스
├── games/            # 개별 게임 모듈 (폴더별로 독립적)
│   └── number-guess/ # 숫자 추측 게임 로직 및 MCP 도구 정의
└── index.ts          # MCP 서버 초기화 및 도구 등록 엔트리 포인트
```

## 🗺️ 향후 로드맵
- [ ] SSE(HTTP) Transport 적용으로 외부 배포 대응
- [ ] '끝말잇기', '단어 맞추기' 등 신규 게임 모듈 추가
- [ ] GPT Store 등록 가이드 추가

## 📄 라이선스
MIT License
