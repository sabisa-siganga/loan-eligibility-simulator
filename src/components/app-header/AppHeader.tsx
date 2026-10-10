import { forwardRef } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '../ui/button';
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
        <Button
          ref={howItWorksRef}
          variant="soft"
          className={styles.howItWorks}
          onClick={onOpenHowItWorks}
        >
          How it works
        </Button>
      </div>
    </header>
  ),
);

AppHeader.displayName = 'AppHeader';

export default AppHeader;
