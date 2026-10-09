import type { RootState } from './store';
import { JOURNEY_SCREEN_LABELS } from './journeySlice';

export { JOURNEY_SCREEN_LABELS };

export const selectCurrentScreen = (state: RootState) => state.journey.currentScreen;
