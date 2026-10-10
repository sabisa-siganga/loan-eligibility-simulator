import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BudgetDraft, SubmittedBudget } from '../types/budget';
import type { SubmittedLoanDetails } from '../types/loan';

export const JOURNEY_SCREENS = {
  loanDetails: 'loanDetails',
  yourBudget: 'yourBudget',
  yourResult: 'yourResult',
} as const;

export type JourneyScreen = (typeof JOURNEY_SCREENS)[keyof typeof JOURNEY_SCREENS];

export const JOURNEY_SCREEN_LABELS: Record<JourneyScreen, string> = {
  loanDetails: 'Loan details',
  yourBudget: 'Your budget',
  yourResult: 'Your result',
};

export type EligibilityStatus = 'idle' | 'checking' | 'succeeded' | 'failed';

export type JourneyState = {
  currentScreen: JourneyScreen;
  submittedLoanDetails: SubmittedLoanDetails | null;
  budgetDraft: BudgetDraft | null;
  submittedBudget: SubmittedBudget | null;
  demoCreditScore: number | null;
  eligibilityStatus: EligibilityStatus;
  eligibilityRequestId: number;
  eligibilityError: string | null;
};

export const initialJourneyState: JourneyState = {
  currentScreen: JOURNEY_SCREENS.loanDetails,
  submittedLoanDetails: null,
  budgetDraft: null,
  submittedBudget: null,
  demoCreditScore: null,
  eligibilityStatus: 'idle',
  eligibilityRequestId: 0,
  eligibilityError: null,
};

const journeySlice = createSlice({
  name: 'journey',
  initialState: initialJourneyState,
  reducers: {
    setCurrentScreen: (state, action: PayloadAction<JourneyScreen>) => {
      state.currentScreen = action.payload;
    },
    submitLoanDetails: (state, action: PayloadAction<SubmittedLoanDetails>) => {
      state.submittedLoanDetails = action.payload;
      state.currentScreen = JOURNEY_SCREENS.yourBudget;
    },
    saveBudgetDraft: (state, action: PayloadAction<BudgetDraft>) => {
      state.budgetDraft = action.payload;
    },
    goBackToLoanDetails: (state, action: PayloadAction<BudgetDraft>) => {
      state.budgetDraft = action.payload;
      state.currentScreen = JOURNEY_SCREENS.loanDetails;
      state.eligibilityStatus = 'idle';
      state.eligibilityError = null;
    },
    submitBudgetAndStartCheck: (
      state,
      action: PayloadAction<{
        budget: SubmittedBudget;
        demoCreditScore: number | null;
      }>,
    ) => {
      state.submittedBudget = action.payload.budget;
      state.budgetDraft = null;
      if (action.payload.budget.requestDemoCreditCheck) {
        state.demoCreditScore = action.payload.demoCreditScore;
      } else {
        state.demoCreditScore = null;
      }
      state.eligibilityStatus = 'checking';
      state.eligibilityError = null;
      state.eligibilityRequestId += 1;
    },
    eligibilitySucceeded: (state, action: PayloadAction<{ requestId: number }>) => {
      if (action.payload.requestId !== state.eligibilityRequestId) {
        return;
      }
      state.eligibilityStatus = 'succeeded';
      state.currentScreen = JOURNEY_SCREENS.yourResult;
      state.eligibilityError = null;
    },
    eligibilityFailed: (state, action: PayloadAction<{ requestId: number; message: string }>) => {
      if (action.payload.requestId !== state.eligibilityRequestId) {
        return;
      }
      state.eligibilityStatus = 'failed';
      state.eligibilityError = action.payload.message;
    },
    resetJourney: () => initialJourneyState,
  },
});

export const {
  setCurrentScreen,
  submitLoanDetails,
  saveBudgetDraft,
  goBackToLoanDetails,
  submitBudgetAndStartCheck,
  eligibilitySucceeded,
  eligibilityFailed,
  resetJourney,
} = journeySlice.actions;

export default journeySlice.reducer;
