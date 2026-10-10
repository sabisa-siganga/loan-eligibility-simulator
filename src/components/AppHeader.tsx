import { Calculator } from 'lucide-react';
import styles from './AppHeader.module.scss';

type AppHeaderProps = {
  onOpenHowItWorks: () => void;
};

const AppHeader = ({ onOpenHowItWorks }: AppHeaderProps) => (
  <header className={styles.header}>
    <div className={styles.brand}>
      <span className={styles.brandIcon} aria-hidden="true">
        <Calculator size={18} strokeWidth={2.25} />
      </span>
      <h1 className={styles.brandName}>Loan Eligibility Simulator</h1>
    </div>
    <button type="button" className={styles.howItWorks} onClick={onOpenHowItWorks}>
      How it works
    </button>
  </header>
);

export default AppHeader;
