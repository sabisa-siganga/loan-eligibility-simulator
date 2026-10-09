import styles from './App.module.scss';
import { JOURNEY_SCREEN_LABELS, selectCurrentScreen } from './store/journeySelectors';
import { useAppSelector } from './store/hooks';

const App = () => {
  const currentScreen = useAppSelector(selectCurrentScreen);
  const screenLabel = JOURNEY_SCREEN_LABELS[currentScreen];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.brand}>Loan Eligibility Simulator</h1>
      </header>
      <main className={styles.main}>
        <p className={styles.screenLabel} data-testid="current-screen">
          {screenLabel}
        </p>
      </main>
    </div>
  );
};

export default App;
