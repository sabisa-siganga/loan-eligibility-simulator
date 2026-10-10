import { forwardRef } from 'react';
import { Calculator } from 'lucide-react';
import styles from './AppHeader.module.scss';

type AppHeaderProps = {
  onOpenHowItWorks: () => void;
};

const AppHeader = forwardRef<HTMLButtonElement, AppHeaderProps>(
  ({ onOpenHowItWorks }, howItWorksRef) => (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">
            <Calculator size={20} strokeWidth={2.25} />
          </span>
          <h1 className={styles.brandName}>Loan Eligibility Simulator</h1>
        </div>
        <button
          ref={howItWorksRef}
          type="button"
          className={styles.howItWorks}
          onClick={onOpenHowItWorks}
        >
          How it works
        </button>
      </div>
    </header>
  ),
);

AppHeader.displayName = 'AppHeader';

export default AppHeader;
