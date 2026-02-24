import { GameResult, GameState } from '../../core/types.js';

export interface NumberGuessState extends GameState {
  targetNumber: number;
  attempts: number;
  maxAttempts: number;
}

export class NumberGuessGame {
  private state: NumberGuessState;

  constructor(maxAttempts: number = 10) {
    this.state = this.getInitialState(maxAttempts);
  }

  private getInitialState(maxAttempts: number): NumberGuessState {
    return {
      isActive: false,
      targetNumber: 0,
      attempts: 0,
      maxAttempts,
    };
  }

  public start(): GameResult {
    const target = Math.floor(Math.random() * 100) + 1; // 1 ~ 100
    this.state = {
      isActive: true,
      targetNumber: target,
      attempts: 0,
      maxAttempts: this.state.maxAttempts,
    };
    return {
      success: true,
      message: `게임이 시작되었습니다! 1부터 100 사이의 숫자를 맞춰보세요. (최대 시도 횟수: ${this.state.maxAttempts})`,
    };
  }

  public guess(number: number): GameResult {
    if (!this.state.isActive) {
      return { success: false, message: '진행 중인 게임이 없습니다. 먼저 게임을 시작해주세요.' };
    }

    this.state.attempts++;

    if (number === this.state.targetNumber) {
      this.state.isActive = false; // 게임 종료
      return {
        success: true,
        message: `정답입니다! ${this.state.attempts}번 만에 맞췄습니다. (정답: ${this.state.targetNumber})`,
      };
    }

    if (this.state.attempts >= this.state.maxAttempts) {
      this.state.isActive = false; // 게임 종료
      return {
        success: true, // 로직 자체는 성공적으로 실행됨
        message: `실패했습니다! 최대 시도 횟수(${this.state.maxAttempts})를 초과했습니다. 정답은 ${this.state.targetNumber} 였습니다.`,
      };
    }

    const hint = number > this.state.targetNumber ? 'Down!' : 'Up!';
    return {
      success: true,
      message: `${hint} (현재 시도 횟수: ${this.state.attempts}/${this.state.maxAttempts})`,
    };
  }

  public getState() {
    return this.state;
  }

  public getStatus(): GameResult {
    if (!this.state.isActive) {
      return { success: false, message: '진행 중인 게임이 없습니다.' };
    }
    return {
      success: true,
      message: `현재 숫자 범위는 1~100 입니다. (현재 시도 횟수: ${this.state.attempts}/${this.state.maxAttempts})`,
    };
  }
}
