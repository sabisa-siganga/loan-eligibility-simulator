import { useState } from 'react';
import AppHeader from './components/app-header';
import HowItWorksDialog from './components/how-it-works-dialog';
import ProgressStepper from './components/progress-stepper';
import LoanDetailsScreen from './screens/loan-details-screen';
import YourBudgetScreen from './screens/your-budget-screen';
import YourResultScreen from './screens/your-result-screen';
import { useAppSelector } from './store/hooks';
import { JOURNEY_SCREENS } from './store/journeySlice';
import { selectCurrentScreen } from './store/journeySelectors';
import styles from './App.module.scss';

const App = () => {
  const currentScreen = useAppSelector(selectCurrentScreen);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <div className={styles.app}>
      <AppHeader onOpenHowItWorks={() => setIsHowItWorksOpen(true)} />
      <ProgressStepper currentScreen={currentScreen} />
      <main className={styles.main}>
        {currentScreen === JOURNEY_SCREENS.loanDetails ? <LoanDetailsScreen /> : null}
        {currentScreen === JOURNEY_SCREENS.yourBudget ? <YourBudgetScreen /> : null}
        {currentScreen === JOURNEY_SCREENS.yourResult ? <YourResultScreen /> : null}
      </main>
      <HowItWorksDialog isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
    </div>
  );
};

export default App;
