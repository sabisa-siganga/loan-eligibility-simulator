import { configureStore } from '@reduxjs/toolkit';
import journeyReducer, { initialJourneyState } from './journeySlice';
import type { JourneyState } from './journeySlice';

const rootReducer = {
  journey: journeyReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export const createAppStore = (preloadedState?: { journey?: Partial<JourneyState> }) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState?.journey
      ? {
          journey: {
            ...initialJourneyState,
            ...preloadedState.journey,
          },
        }
      : undefined,
    devTools: import.meta.env.DEV,
  });
