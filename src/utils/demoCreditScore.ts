import { DEMO_CREDIT_SCORES, type DemoCreditScore } from '../types/budget';

export const pickDemoCreditScore = (random: () => number = Math.random): DemoCreditScore => {
  const index = Math.floor(random() * DEMO_CREDIT_SCORES.length);
  return DEMO_CREDIT_SCORES[Math.min(index, DEMO_CREDIT_SCORES.length - 1)];
};
