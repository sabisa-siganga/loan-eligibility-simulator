import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import App from './App';
import { JOURNEY_SCREENS, resetJourney, setCurrentScreen } from './store/journeySlice';
import { createAppStore } from './store/store';

afterEach(() => {
  cleanup();
});

const renderApp = (store = createAppStore()) =>
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

describe('App shell', () => {
  it('renders the app name and starts on Loan details', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: 'Loan Eligibility Simulator' })).toBeInTheDocument();
    expect(screen.getByTestId('current-screen')).toHaveTextContent('Loan details');
  });

  it('returns to Loan details when the journey is reset', () => {
    const store = createAppStore({
      journey: { currentScreen: JOURNEY_SCREENS.yourBudget },
    });

    renderApp(store);

    expect(screen.getByTestId('current-screen')).toHaveTextContent('Your budget');

    act(() => {
      store.dispatch(resetJourney());
    });

    expect(screen.getByTestId('current-screen')).toHaveTextContent('Loan details');
    expect(store.getState().journey.currentScreen).toBe(JOURNEY_SCREENS.loanDetails);
  });

  it('keeps Loan details after navigating away and resetting', () => {
    const store = createAppStore();

    renderApp(store);

    act(() => {
      store.dispatch(setCurrentScreen(JOURNEY_SCREENS.yourResult));
    });
    expect(screen.getByTestId('current-screen')).toHaveTextContent('Your result');

    act(() => {
      store.dispatch(resetJourney());
    });
    expect(screen.getByTestId('current-screen')).toHaveTextContent('Loan details');
  });
});
