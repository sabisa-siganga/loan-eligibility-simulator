export const getAnnualRateForCreditScore = (score: number): number => {
  if (score >= 300 && score <= 499) {
    return 18.5;
  }
  if (score >= 500 && score <= 599) {
    return 16.5;
  }
  if (score >= 600 && score <= 699) {
    return 12.5;
  }
  if (score >= 700 && score <= 799) {
    return 11.5;
  }
  if (score >= 800 && score <= 850) {
    return 10.5;
  }
  throw new Error('Credit score is outside the supported range of 300 to 850.');
};
