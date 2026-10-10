import { Dialog } from '../ui/dialog';
import styles from './HowItWorksDialog.module.scss';

type HowItWorksDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HowItWorksDialog = ({ isOpen, onClose }: HowItWorksDialogProps) => (
  <Dialog isOpen={isOpen} onClose={onClose} title="How it works">
    <ol className={styles.list}>
      <li>Choose a loan amount, term and purpose to explore estimated repayments.</li>
      <li>
        Enter your take-home income, living costs and debt repayments. Count each cost once — rent
        belongs under living expenses, home-loan repayments under debt.
      </li>
      <li>Review whether the loan could fit your budget, then adjust amount or term if needed.</li>
      <li>
        Estimates include interest but exclude fees and insurance. A longer term can lower the
        monthly repayment but increase total interest.
      </li>
      <li>Refreshing the page clears the details you entered on this device.</li>
    </ol>
  </Dialog>
);

export default HowItWorksDialog;
