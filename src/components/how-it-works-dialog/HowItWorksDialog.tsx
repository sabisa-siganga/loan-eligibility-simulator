import { useEffect, useId, useRef } from 'react';
import styles from './HowItWorksDialog.module.scss';

type HowItWorksDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HowItWorksDialog = ({ isOpen, onClose }: HowItWorksDialogProps) => {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className={styles.title}>
          How it works
        </h2>
        <ol className={styles.list}>
          <li>Choose a loan amount, term and purpose to explore estimated repayments.</li>
          <li>
            Enter your take-home income, living costs and debt repayments. Count each cost once —
            rent belongs under living expenses, home-loan repayments under debt.
          </li>
          <li>
            Review whether the loan could fit your budget, then adjust amount or term if needed.
          </li>
          <li>
            Estimates include interest but exclude fees and insurance. A longer term can lower the
            monthly repayment but increase total interest.
          </li>
          <li>Refreshing the page clears the details you entered on this device.</li>
        </ol>
        <button ref={closeButtonRef} type="button" className={styles.close} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default HowItWorksDialog;
