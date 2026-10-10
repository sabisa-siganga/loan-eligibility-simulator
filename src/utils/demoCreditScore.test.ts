import { describe, expect, it } from 'vitest';
import { DEMO_CREDIT_SCORES } from '../types/budget';
import { pickDemoCreditScore } from './demoCreditScore';

describe('pickDemoCreditScore', () => {
  it('returns each supported demo score for matching random buckets', () => {
    DEMO_CREDIT_SCORES.forEach((score, index) => {
      const random = () => (index + 0.1) / DEMO_CREDIT_SCORES.length;
      expect(pickDemoCreditScore(random)).toBe(score);
    });
  });
});
