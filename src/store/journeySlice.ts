import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
};

const initialState: JourneyState = {
  currentScreen: JOURNEY_SCREENS.loanDetails,
};

const journeySlice = createSlice({
  name: 'journey',
  initialState,
  reducers: {
    setCurrentScreen: (state, action: PayloadAction<JourneyScreen>) => {
      state.currentScreen = action.payload;
    },
    resetJourney: () => initialState,
  },
});

export const { setCurrentScreen, resetJourney } = journeySlice.actions;
export default journeySlice.reducer;
