import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, ChevronDown, Info } from 'lucide-react';
import type { RepaymentEstimate } from '../../types/loan';
import { formatMoneyDisplay, formatTermLabel } from '../../utils/formatMoney';
import { PRODUCT_SETTINGS } from '../../utils/productSettings';
import { Button } from '../ui/button';
import styles from './EstimateSummaryCard.module.scss';

type EstimateSummaryCardProps = {
  amount: number | null;
  termMonths: number | null;
  estimate: RepaymentEstimate | null;
  annualRate: number;
  onAnnualRateChange: (rate: number) => void;
  onContinue: () => void;
};

const EstimateSummaryCard = ({
  amount,
  termMonths,
  estimate,
  annualRate,
  onAnnualRateChange,
  onContinue,
}: EstimateSummaryCardProps) => {
  const [isCostOpen, setIsCostOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const costId = useId();
  const exploreId = useId();
  const rateSliderId = useId();

  const rateLabel =
    annualRate === PRODUCT_SETTINGS.exampleAnnualRate
      ? `Using an example annual rate of ${annualRate}%.`
      : `Using an explored example annual rate of ${annualRate}%.`;

  const rateProgress =
    ((annualRate - PRODUCT_SETTINGS.exploreRateMin) /
      (PRODUCT_SETTINGS.exploreRateMax - PRODUCT_SETTINGS.exploreRateMin)) *
    100;

  return (
    <aside className={styles.card} aria-label="Estimated repayment">
      {estimate && amount !== null && termMonths !== null ? (
        <>
          <div>
            <p className={styles.monthlyLabel}>Estimated monthly repayment</p>
            <p className={styles.monthlyValue}>{formatMoneyDisplay(estimate.monthlyPayment)}</p>
            <p className={styles.rateNote}>{rateLabel}</p>
          </div>

          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>Loan amount</dt>
              <dd>{formatMoneyDisplay(amount)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Term</dt>
              <dd>{formatTermLabel(termMonths)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Total interest</dt>
              <dd>{formatMoneyDisplay(estimate.totalInterest)}</dd>
            </div>
            <div className={styles.row}>
              <dt>Total repayment</dt>
              <dd>{formatMoneyDisplay(estimate.totalRepayment)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className={styles.placeholder}>Enter a valid amount and term to see an estimate.</p>
      )}

      <div className={styles.accordion}>
        <button
          type="button"
          className={styles.accordionButton}
          aria-expanded={isCostOpen}
          aria-controls={costId}
          onClick={() => setIsCostOpen((open) => !open)}
        >
          Cost breakdown
          <ChevronDown
            className={styles.accordionChevron}
            data-open={isCostOpen}
            size={18}
            aria-hidden="true"
          />
        </button>
        {isCostOpen ? (
          <div id={costId} className={styles.accordionPanel}>
            {estimate ? (
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>Monthly repayment</dt>
                  <dd>{formatMoneyDisplay(estimate.monthlyPayment)}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Total interest</dt>
                  <dd>{formatMoneyDisplay(estimate.totalInterest)}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Total repayment</dt>
                  <dd>{formatMoneyDisplay(estimate.totalRepayment)}</dd>
                </div>
              </dl>
            ) : (
              <p>Enter a valid amount and term to see the cost breakdown.</p>
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.accordion}>
        <button
          type="button"
          className={styles.accordionButton}
          aria-expanded={isExploreOpen}
          aria-controls={exploreId}
          onClick={() => setIsExploreOpen((open) => !open)}
        >
          Explore interest rate
          <ChevronDown
            className={styles.accordionChevron}
            data-open={isExploreOpen}
            size={18}
            aria-hidden="true"
          />
        </button>
        {isExploreOpen ? (
          <div id={exploreId} className={styles.accordionPanel}>
            <div className={styles.exploreControls}>
              <p>
                This is an example rate scenario for exploring repayments, not an offer or your
                personalised rate.
              </p>
              <label className={styles.exploreLabel} htmlFor={rateSliderId}>
                Example annual rate:{' '}
                <span className={styles.exploreValue}>{annualRate.toFixed(1)}%</span>
              </label>
              <input
                id={rateSliderId}
                className={styles.slider}
                type="range"
                min={PRODUCT_SETTINGS.exploreRateMin}
                max={PRODUCT_SETTINGS.exploreRateMax}
                step={PRODUCT_SETTINGS.exploreRateStep}
                value={annualRate}
                style={{ '--slider-progress': `${rateProgress}%` } as CSSProperties}
                onChange={(event) => onAnnualRateChange(Number(event.target.value))}
              />
              <div className={styles.exploreActions}>
                <span aria-hidden="true">
                  {PRODUCT_SETTINGS.exploreRateMin}% – {PRODUCT_SETTINGS.exploreRateMax}%
                </span>
                {annualRate !== PRODUCT_SETTINGS.exampleAnnualRate ? (
                  <Button
                    variant="link"
                    className={styles.restoreButton}
                    onClick={() => onAnnualRateChange(PRODUCT_SETTINGS.exampleAnnualRate)}
                  >
                    Restore {PRODUCT_SETTINGS.exampleAnnualRate}% example rate
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <p className={styles.footnote}>Includes interest. Excludes fees and insurance.</p>

      <div className={styles.infoBanner}>
        <Info size={24} aria-hidden="true" />
        <span>Affordability has not been checked yet.</span>
      </div>

      <Button className={styles.continue} onClick={onContinue}>
        Continue to your budget
        <ArrowRight size={18} aria-hidden="true" />
      </Button>
    </aside>
  );
};

export default EstimateSummaryCard;
