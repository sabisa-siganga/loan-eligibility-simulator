import type { RootState } from './store';
import { JOURNEY_SCREEN_LABELS } from './journeySlice';

export { JOURNEY_SCREEN_LABELS };

export const selectCurrentScreen = (state: RootState) => state.journey.currentScreen;

export const selectSubmittedLoanDetails = (state: RootState) => state.journey.submittedLoanDetails;

export const selectBudgetDraft = (state: RootState) => state.journey.budgetDraft;

export const selectSubmittedBudget = (state: RootState) => state.journey.submittedBudget;

export const selectDemoCreditScore = (state: RootState) => state.journey.demoCreditScore;

export const selectEligibilityStatus = (state: RootState) => state.journey.eligibilityStatus;

export const selectEligibilityRequestId = (state: RootState) => state.journey.eligibilityRequestId;

export const selectEligibilityError = (state: RootState) => state.journey.eligibilityError;
