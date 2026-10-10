import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
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

export type JourneyState = {
  currentScreen: JourneyScreen;
  submittedLoanDetails: SubmittedLoanDetails | null;
};

export const initialJourneyState: JourneyState = {
  currentScreen: JOURNEY_SCREENS.loanDetails,
  submittedLoanDetails: null,
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
    resetJourney: () => initialJourneyState,
  },
});

export const { setCurrentScreen, submitLoanDetails, resetJourney } = journeySlice.actions;

export default journeySlice.reducer;
