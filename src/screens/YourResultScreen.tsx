import styles from './YourResultScreen.module.scss';

/**
 * Placeholder destination after a successful eligibility check.
 * Full result UI lands in the Screen 3 change.
 */
const YourResultScreen = () => (
  <section className={styles.placeholder} data-testid="your-result-screen">
    <h2>Your result</h2>
    <p>Eligibility check complete. Result details will appear here.</p>
  </section>
);

export default YourResultScreen;
