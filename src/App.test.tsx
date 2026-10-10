import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    expect(screen.getByTestId('loan-details-screen')).toBeInTheDocument();
  });

  it('returns to Loan details when the journey is reset', () => {
    const store = createAppStore({
      journey: {
        currentScreen: JOURNEY_SCREENS.yourBudget,
        submittedLoanDetails: {
          amount: 50_000,
          termMonths: 24,
          purpose: 'homeImprovement',
          annualRateUsed: 12.5,
        },
      },
    });

    renderApp(store);

    expect(screen.getByTestId('your-budget-screen')).toBeInTheDocument();

    act(() => {
      store.dispatch(resetJourney());
    });

    expect(screen.getByTestId('loan-details-screen')).toBeInTheDocument();
    expect(store.getState().journey.currentScreen).toBe(JOURNEY_SCREENS.loanDetails);
    expect(store.getState().journey.submittedLoanDetails).toBeNull();
  });

  it('keeps Loan details after navigating away and resetting', () => {
    const store = createAppStore();

    renderApp(store);

    act(() => {
      store.dispatch(setCurrentScreen(JOURNEY_SCREENS.yourResult));
    });
    expect(screen.getByTestId('your-result-screen')).toBeInTheDocument();

    act(() => {
      store.dispatch(resetJourney());
    });
    expect(screen.getByTestId('loan-details-screen')).toBeInTheDocument();
  });

  it('opens How it works and returns focus to the header control on close', async () => {
    const user = userEvent.setup();
    renderApp();

    const openButton = screen.getByRole('button', { name: /How it works/i });
    await user.click(openButton);
    expect(screen.getByRole('dialog', { name: /How it works/i })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByRole('dialog', { name: /How it works/i })).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
  });
});
