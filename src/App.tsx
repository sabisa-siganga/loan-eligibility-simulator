import { useState } from 'react';
import AppHeader from './components/AppHeader';
import HowItWorksDialog from './components/HowItWorksDialog';
import ProgressStepper from './components/ProgressStepper';
import LoanDetailsScreen from './screens/LoanDetailsScreen';
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
      </main>
      <HowItWorksDialog isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
    </div>
  );
};

export default App;
