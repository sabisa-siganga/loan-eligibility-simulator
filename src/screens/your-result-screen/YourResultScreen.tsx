import { useEffect, useId, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Info, XCircle } from 'lucide-react';
import LinkedSliderField from '../../components/linked-slider-field';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { editBudgetDetails, resetJourney, updateSubmittedLoanDetails } from '../../store/journeySlice';
import {
  selectDemoCreditScore,
  selectSubmittedBudget,
  selectSubmittedLoanDetails,
} from '../../store/journeySelectors';
import { deriveResultViewModel } from '../../utils/deriveResultViewModel';
import { isValidLoanEstimateInput } from '../../utils/calculateRepayment';
import { PRODUCT_SETTINGS } from '../../utils/productSettings';
import styles from './YourResultScreen.module.scss';

const YourResultScreen = () => {
  const dispatch = useAppDispatch();
  const loan = useAppSelector(selectSubmittedLoanDetails);
  const budget = useAppSelector(selectSubmittedBudget);
  const demoCreditScore = useAppSelector(selectDemoCreditScore);
  const costId = useId();

  const [amount, setAmount] = useState<number | null>(loan?.amount ?? null);
  const [termMonths, setTermMonths] = useState<number | null>(loan?.termMonths ?? null);
  const [amountError, setAmountError] = useState<string | undefined>();
  const [termError, setTermError] = useState<string | undefined>();
  const [isCostOpen, setIsCostOpen] = useState(false);

  const loanAmount = loan?.amount;
  const loanTermMonths = loan?.termMonths;

  useEffect(() => {
    if (loanAmount !== undefined) {
      setAmount(loanAmount);
    }
    if (loanTermMonths !== undefined) {
      setTermMonths(loanTermMonths);
    }
  }, [loanAmount, loanTermMonths]);

  const adjustIsValid =
    amount !== null &&
    termMonths !== null &&
    isValidLoanEstimateInput(
      amount,
      termMonths,
      PRODUCT_SETTINGS.minAmount,
      PRODUCT_SETTINGS.maxAmount,
      PRODUCT_SETTINGS.minTermMonths,
      PRODUCT_SETTINGS.maxTermMonths,
    );

  useEffect(() => {
    if (!adjustIsValid || amount === null || termMonths === null || !loan) {
      return;
    }
    if (amount === loan.amount && termMonths === loan.termMonths) {
      return;
    }
    dispatch(updateSubmittedLoanDetails({ amount, termMonths }));
  }, [adjustIsValid, amount, termMonths, loan, dispatch]);

  const viewModel = useMemo(() => {
    if (!loan || !budget || !adjustIsValid) {
      return null;
    }
    return deriveResultViewModel({
      loan,
      budget,
      demoCreditScore,
    });
  }, [loan, budget, demoCreditScore, adjustIsValid]);

  const validateAmount = (value: number | null) => {
    if (value === null) {
      setAmountError('Enter a loan amount.');
      return;
    }
    if (
      value < PRODUCT_SETTINGS.minAmount ||
      value > PRODUCT_SETTINGS.maxAmount ||
      !Number.isInteger(value)
    ) {
      setAmountError(
        `Enter an amount from R${PRODUCT_SETTINGS.minAmount.toLocaleString('en-ZA')} to R${PRODUCT_SETTINGS.maxAmount.toLocaleString('en-ZA')}.`,
      );
      return;
    }
    setAmountError(undefined);
  };

  const validateTerm = (value: number | null) => {
    if (value === null) {
      setTermError('Enter a repayment term.');
      return;
    }
    if (
      value < PRODUCT_SETTINGS.minTermMonths ||
      value > PRODUCT_SETTINGS.maxTermMonths ||
      !Number.isInteger(value)
    ) {
      setTermError(
        `Enter a term from ${PRODUCT_SETTINGS.minTermMonths} to ${PRODUCT_SETTINGS.maxTermMonths} months.`,
      );
      return;
    }
    setTermError(undefined);
  };

  if (!loan || !budget) {
    return (
      <section className={styles.screen} data-testid="your-result-screen">
        <p>Result details are unavailable. Start again to check a loan.</p>
        <button
          type="button"
          className={styles.startAgain}
          onClick={() => dispatch(resetJourney())}
        >
          Start again
        </button>
      </section>
    );
  }

  const moneyLeftBoxClass = [
    styles.moneyLeftBox,
    viewModel?.showBufferNote ? styles.moneyLeftBoxTight : '',
    viewModel && viewModel.moneyLeft < 0 ? styles.moneyLeftBoxShortfall : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={styles.screen} data-testid="your-result-screen">
      <div className={styles.intro}>
        <h2 className={styles.title}>Your result</h2>

        {viewModel ? (
          <div className={styles.status}>
            <div className={styles.statusRow}>
              {viewModel.isEligible ? (
                <CheckCircle2 className={styles.statusIconPass} size={28} aria-hidden="true" />
              ) : (
                <XCircle className={styles.statusIconFail} size={28} aria-hidden="true" />
              )}
              <p className={viewModel.isEligible ? styles.statusLabelPass : styles.statusLabelFail}>
                {viewModel.statusLabel}
              </p>
            </div>
            {viewModel.statusExplanation ? (
              <p className={styles.statusExplanation}>{viewModel.statusExplanation}</p>
            ) : null}
            {viewModel.failureMessages.length > 0 ? (
              <ul className={styles.failures}>
                {viewModel.failureMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}
            {viewModel.cannotFixByAdjustingLoan ? (
              <p className={styles.adjustNote}>
                Changing the loan amount or term will not fix this.
              </p>
            ) : null}
          </div>
        ) : (
          <p className={styles.invalidNotice}>Enter a valid amount and term.</p>
        )}
      </div>

      {viewModel?.showTightBudgetWarning ? (
        <div className={styles.warning} role="status">
          <AlertTriangle color="#B86E00" size={20} aria-hidden="true" />
          <div>
            <div className={styles.warningTitle}>Tight budget</div>
            <div>
              This repayment fits your budget, but leaves little money for unexpected costs.
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Your loan summary</h3>
          {viewModel ? (
            <>
              <div>
                <p className={styles.monthlyLabel}>Monthly repayment</p>
                <p className={styles.monthlyValue}>{viewModel.monthlyRepaymentDisplay}</p>
              </div>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>Loan amount</dt>
                  <dd>{viewModel.loanAmountDisplay}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Term</dt>
                  <dd>{viewModel.termDisplay}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Annual interest</dt>
                  <dd>{viewModel.annualRateDisplay}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Total interest</dt>
                  <dd>{viewModel.totalInterestDisplay}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Total repayment</dt>
                  <dd>{viewModel.totalRepaymentDisplay}</dd>
                </div>
              </dl>
              <p className={styles.footnote}>
                <Info size={14} aria-hidden="true" />
                <span>Includes interest. Excludes fees and insurance.</span>
              </p>
              <div>
                <button
                  type="button"
                  className={styles.accordionButton}
                  aria-expanded={isCostOpen}
                  aria-controls={costId}
                  onClick={() => setIsCostOpen((open) => !open)}
                >
                  Cost breakdown
                  {isCostOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isCostOpen ? (
                  <div id={costId} className={styles.accordionPanel}>
                    <dl className={styles.rows}>
                      <div className={styles.row}>
                        <dt>Monthly repayment</dt>
                        <dd>{viewModel.monthlyRepaymentDisplay}</dd>
                      </div>
                      <div className={styles.row}>
                        <dt>Total interest</dt>
                        <dd>{viewModel.totalInterestDisplay}</dd>
                      </div>
                      <div className={styles.row}>
                        <dt>Total repayment</dt>
                        <dd>{viewModel.totalRepaymentDisplay}</dd>
                      </div>
                    </dl>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <p className={styles.invalidNotice}>Enter a valid amount and term.</p>
          )}

          <div className={styles.adjustBlock}>
            <h3 className={styles.cardTitle}>Adjust your loan</h3>
            <LinkedSliderField
              label="Loan amount (R)"
              mode="money"
              value={amount}
              min={PRODUCT_SETTINGS.minAmount}
              max={PRODUCT_SETTINGS.maxAmount}
              minLabel="R5,000"
              maxLabel="R300,000"
              required
              error={amountError}
              onChange={(value) => {
                setAmount(value);
                validateAmount(value);
              }}
              onBlur={() => validateAmount(amount)}
            />
            <LinkedSliderField
              label="Repayment term (months)"
              mode="term"
              value={termMonths}
              min={PRODUCT_SETTINGS.minTermMonths}
              max={PRODUCT_SETTINGS.maxTermMonths}
              minLabel="6"
              maxLabel="60"
              required
              error={termError}
              onChange={(value) => {
                setTermMonths(value);
                validateTerm(value);
              }}
              onBlur={() => validateTerm(termMonths)}
            />
            <p className={styles.helper}>
              <Info size={14} aria-hidden="true" />
              <span>A longer term can lower monthly repayments but increase total interest.</span>
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Your monthly budget</h3>
          {viewModel ? (
            <>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>Take-home income</dt>
                  <dd>{viewModel.incomeDisplay}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Living expenses</dt>
                  <dd>-{viewModel.livingExpensesDisplay}</dd>
                </div>
                <div className={styles.row}>
                  <dt>Existing debt repayments</dt>
                  <dd>-{viewModel.existingDebtDisplay}</dd>
                </div>
                <div className={styles.row}>
                  <dt>New loan repayment</dt>
                  <dd>-{viewModel.newRepaymentDisplay}</dd>
                </div>
              </dl>

              <div className={moneyLeftBoxClass}>
                <p className={styles.moneyLeftLabel}>{viewModel.moneyLeftLabel}</p>
                <p className={styles.moneyLeftValue}>{viewModel.moneyLeftDisplay}</p>
                {viewModel.showBufferNote ? (
                  <p className={styles.bufferNote}>
                    <AlertTriangle size={16} aria-hidden="true" />
                    <span>Below the R1,000 buffer.</span>
                  </p>
                ) : null}
              </div>

              <hr className={styles.divider} />

              <div>
                <p className={styles.monthlyLabel}>Share of income spent on debt repayments</p>
                <p className={styles.moneyLeftValue}>
                  {viewModel.debtShareDisplay ?? viewModel.debtShareUnavailableMessage}
                </p>
              </div>

              <hr className={styles.divider} />

              <div>
                <h3 className={styles.cardTitle}>Your credit score</h3>
                {viewModel.creditScoreDisplay ? (
                  <p className={styles.creditScore}>{viewModel.creditScoreDisplay}</p>
                ) : null}
                {viewModel.creditScoreCaption ? (
                  <p className={styles.creditCaption}>{viewModel.creditScoreCaption}</p>
                ) : null}
                <p className={styles.footnote}>
                  <Info size={14} aria-hidden="true" />
                  <span>{viewModel.rateExplanation}</span>
                </p>
              </div>
            </>
          ) : (
            <p className={styles.invalidNotice}>Enter a valid amount and term.</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.editButton}
          onClick={() => dispatch(editBudgetDetails())}
        >
          Edit your details
        </button>
        <button
          type="button"
          className={styles.startAgain}
          onClick={() => dispatch(resetJourney())}
        >
          Start again
        </button>
      </div>
    </section>
  );
};

export default YourResultScreen;
