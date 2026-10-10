import { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Calculator, Shield, User } from 'lucide-react';
import CheckboxField from '../../components/checkbox-field';
import MoneyInput from '../../components/money-input';
import SelectField from '../../components/select-field';
import WholeNumberInput from '../../components/whole-number-input';
import { checkEligibility } from '../../services/eligibility';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  eligibilityFailed,
  eligibilitySucceeded,
  goBackToLoanDetails,
  resetJourney,
  submitBudgetAndStartCheck,
} from '../../store/journeySlice';
import {
  selectBudgetDraft,
  selectDemoCreditScore,
  selectEligibilityError,
  selectEligibilityRequestId,
  selectEligibilityStatus,
  selectSubmittedLoanDetails,
} from '../../store/journeySelectors';
import {
  EMPLOYMENT_STATUSES,
  EMPLOYMENT_STATUS_LABELS,
  emptyBudgetFormValues,
  INCOME_SOURCE_LABELS,
  INCOME_SOURCES,
  INCOME_SOURCES_REQUIRING_DURATION,
  type BudgetFormInput,
  type IncomeSource,
} from '../../types/budget';
import { LOAN_PURPOSE_LABELS } from '../../types/loan';
import {
  budgetDetailsFormSchema,
  type BudgetDetailsFormValues,
} from '../../utils/budgetDetailsSchema';
import { pickDemoCreditScore } from '../../utils/demoCreditScore';
import { formatMoneyDisplay } from '../../utils/formatMoney';
import styles from './YourBudgetScreen.module.scss';

const employmentOptions = EMPLOYMENT_STATUSES.map((value) => ({
  value,
  label: EMPLOYMENT_STATUS_LABELS[value],
}));

const incomeSourceOptions = INCOME_SOURCES.map((value) => ({
  value,
  label: INCOME_SOURCE_LABELS[value],
}));

const FIELD_ORDER: Array<keyof BudgetFormInput> = [
  'monthlyIncome',
  'livingExpenses',
  'existingDebtRepayments',
  'age',
  'employmentStatus',
  'employmentDurationMonths',
  'businessDurationMonths',
  'incomeSource',
  'incomeDurationMonths',
  'creditScore',
];

const YourBudgetScreen = () => {
  const dispatch = useAppDispatch();
  const submittedLoan = useAppSelector(selectSubmittedLoanDetails);
  const budgetDraft = useAppSelector(selectBudgetDraft);
  const existingDemoScore = useAppSelector(selectDemoCreditScore);
  const eligibilityStatus = useAppSelector(selectEligibilityStatus);
  const eligibilityRequestId = useAppSelector(selectEligibilityRequestId);
  const eligibilityError = useAppSelector(selectEligibilityError);
  const abortRef = useRef<AbortController | null>(null);

  const defaultValues = useMemo(() => budgetDraft ?? emptyBudgetFormValues(), [budgetDraft]);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setFocus,
    formState: { errors },
  } = useForm<BudgetFormInput, unknown, BudgetDetailsFormValues>({
    resolver: zodResolver(budgetDetailsFormSchema) as Resolver<
      BudgetFormInput,
      unknown,
      BudgetDetailsFormValues
    >,
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const employmentStatus = useWatch({ control, name: 'employmentStatus' });
  const incomeSource = useWatch({ control, name: 'incomeSource' });
  const creditScoreUnknown = useWatch({ control, name: 'creditScoreUnknown' });
  const isChecking = eligibilityStatus === 'checking';

  const needsIncomeSource = employmentStatus === 'unemployed' || employmentStatus === 'retired';
  const showEmploymentDuration = employmentStatus === 'employed';
  const showBusinessDuration = employmentStatus === 'selfEmployed';
  const showIncomeDuration =
    needsIncomeSource &&
    incomeSource !== '' &&
    INCOME_SOURCES_REQUIRING_DURATION.includes(incomeSource as IncomeSource);
  const isNoIncome = needsIncomeSource && incomeSource === 'noIncome';

  const wasNoIncomeRef = useRef(false);

  useEffect(() => {
    if (isNoIncome) {
      setValue('monthlyIncome', 0, { shouldValidate: true });
      setValue('incomeDurationMonths', null);
    } else if (wasNoIncomeRef.current) {
      setValue('monthlyIncome', null, { shouldValidate: false });
    }
    wasNoIncomeRef.current = isNoIncome;
  }, [isNoIncome, setValue]);

  useEffect(() => {
    if (!showEmploymentDuration) {
      setValue('employmentDurationMonths', null);
    }
  }, [showEmploymentDuration, setValue]);

  useEffect(() => {
    if (!showBusinessDuration) {
      setValue('businessDurationMonths', null);
    }
  }, [showBusinessDuration, setValue]);

  useEffect(() => {
    if (!needsIncomeSource) {
      setValue('incomeSource', '');
      setValue('incomeDurationMonths', null);
    }
  }, [needsIncomeSource, setValue]);

  useEffect(() => {
    if (!showIncomeDuration) {
      setValue('incomeDurationMonths', null);
    }
  }, [showIncomeDuration, setValue]);

  useEffect(() => {
    if (creditScoreUnknown) {
      setValue('creditScore', null);
    } else {
      setValue('requestDemoCreditCheck', false);
    }
  }, [creditScoreUnknown, setValue]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  const summaryText = submittedLoan
    ? `${formatMoneyDisplay(submittedLoan.amount)} • ${submittedLoan.termMonths} months • ${LOAN_PURPOSE_LABELS[submittedLoan.purpose]}`
    : 'Loan details unavailable';

  const onBack = () => {
    dispatch(goBackToLoanDetails(getValues()));
  };

  const onCancel = () => {
    abortRef.current?.abort();
    dispatch(resetJourney());
  };

  const onInvalidSubmit = () => {
    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      setFocus(firstInvalid);
    }
  };

  const onValidSubmit = async (values: BudgetDetailsFormValues) => {
    if (isChecking) {
      return;
    }

    let demoScore: number | null = null;
    if (values.requestDemoCreditCheck) {
      demoScore = existingDemoScore ?? pickDemoCreditScore();
    }

    dispatch(
      submitBudgetAndStartCheck({
        budget: values,
        demoCreditScore: demoScore,
      }),
    );

    const nextRequestId = eligibilityRequestId + 1;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await checkEligibility(
        { requestId: nextRequestId },
        { signal: controller.signal },
      );

      if (result.ok) {
        dispatch(eligibilitySucceeded({ requestId: result.requestId }));
      } else {
        dispatch(
          eligibilityFailed({
            requestId: result.requestId,
            message: result.message,
          }),
        );
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      dispatch(
        eligibilityFailed({
          requestId: nextRequestId,
          message: 'We could not check eligibility. Please try again.',
        }),
      );
    }
  };

  return (
    <section className={styles.screen} data-testid="your-budget-screen">
      <div className={styles.intro}>
        <h2 className={styles.title}>Your budget</h2>
        <p className={styles.subtitle}>Tell us about your monthly income and costs.</p>
      </div>

      <p className={styles.summary} data-testid="loan-summary">
        {summaryText}
      </p>

      {eligibilityError ? (
        <p className={styles.errorBanner} role="alert">
          {eligibilityError}
        </p>
      ) : null}

      <div className={styles.layout}>
        <form
          className={styles.formColumn}
          noValidate
          onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        >
          <p className={styles.requiredNote}>
            <span className={styles.requiredMark}>*</span> Required field
          </p>

          <div className={styles.group}>
            <h3 className={styles.groupTitle}>Your monthly budget</h3>
            <div className={styles.row}>
              <Controller
                name="monthlyIncome"
                control={control}
                render={({ field, fieldState }) => (
                  <MoneyInput
                    ref={field.ref}
                    label="Monthly take-home income (R)"
                    name={field.name}
                    value={field.value}
                    required
                    readOnly={isNoIncome}
                    helperText="After tax and payslip deductions."
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                name="livingExpenses"
                control={control}
                render={({ field, fieldState }) => (
                  <MoneyInput
                    ref={field.ref}
                    label="Monthly living expenses (R)"
                    name={field.name}
                    value={field.value}
                    required
                    helperText="Food, rent and transport. Exclude debt repayments. Enter 0 if none."
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>
            <Controller
              name="existingDebtRepayments"
              control={control}
              render={({ field, fieldState }) => (
                <MoneyInput
                  ref={field.ref}
                  label="Existing monthly debt repayments (R)"
                  name={field.name}
                  value={field.value}
                  required
                  helperText="Monthly payments, not the total debt balance. Enter 0 if none."
                  error={fieldState.error?.message}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>

          <div className={styles.group}>
            <h3 className={styles.groupTitle}>Your circumstances</h3>
            <div className={styles.row}>
              <Controller
                name="age"
                control={control}
                render={({ field, fieldState }) => (
                  <WholeNumberInput
                    ref={field.ref}
                    label="Age (years)"
                    name={field.name}
                    value={field.value}
                    required
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                name="employmentStatus"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectField
                    ref={field.ref}
                    label="Employment status"
                    name={field.name}
                    value={field.value}
                    options={employmentOptions}
                    placeholder="Select employment status"
                    required
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            {showEmploymentDuration ? (
              <Controller
                name="employmentDurationMonths"
                control={control}
                render={({ field, fieldState }) => (
                  <WholeNumberInput
                    ref={field.ref}
                    label="Employment duration (months)"
                    name={field.name}
                    value={field.value}
                    required
                    helperText="Months in your current job. Minimum 3 months to qualify."
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            ) : null}

            {showBusinessDuration ? (
              <Controller
                name="businessDurationMonths"
                control={control}
                render={({ field, fieldState }) => (
                  <WholeNumberInput
                    ref={field.ref}
                    label="Months running the business"
                    name={field.name}
                    value={field.value}
                    required
                    helperText="Minimum 3 months running the business to qualify."
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            ) : null}

            {needsIncomeSource ? (
              <Controller
                name="incomeSource"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectField
                    ref={field.ref}
                    label="Income source"
                    name={field.name}
                    value={field.value}
                    options={incomeSourceOptions}
                    placeholder="Select an income source"
                    required
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            ) : null}

            {showIncomeDuration ? (
              <Controller
                name="incomeDurationMonths"
                control={control}
                render={({ field, fieldState }) => (
                  <WholeNumberInput
                    ref={field.ref}
                    label="Months receiving this income"
                    name={field.name}
                    value={field.value}
                    required
                    helperText="Minimum 6 months receiving this income to qualify."
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            ) : null}
          </div>

          <div className={styles.group}>
            <h3 className={styles.groupTitle}>Your credit score</h3>
            <div className={styles.creditRow}>
              {!creditScoreUnknown ? (
                <Controller
                  name="creditScore"
                  control={control}
                  render={({ field, fieldState }) => (
                    <WholeNumberInput
                      ref={field.ref}
                      label="Credit score"
                      name={field.name}
                      value={field.value}
                      required
                      helperText="Enter a score from 300 to 850. Your score affects the interest rate and monthly repayment."
                      error={fieldState.error?.message}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              ) : (
                <div />
              )}
              <Controller
                name="creditScoreUnknown"
                control={control}
                render={({ field }) => (
                  <CheckboxField
                    ref={field.ref}
                    label="I don't know my credit score"
                    name={field.name}
                    checked={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>
            {creditScoreUnknown ? (
              <Controller
                name="requestDemoCreditCheck"
                control={control}
                render={({ field }) => (
                  <CheckboxField
                    ref={field.ref}
                    label="Check my credit score"
                    name={field.name}
                    checked={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            ) : null}
          </div>

          <div className={styles.actions}>
            <div className={styles.secondaryActions}>
              <button type="button" className={styles.linkButton} onClick={onBack}>
                Back
              </button>
              <span className={styles.divider} aria-hidden="true" />
              <button type="button" className={styles.linkButton} onClick={onCancel}>
                Cancel
              </button>
            </div>
            <div className={styles.primaryGroup}>
              <button type="submit" className={styles.primaryButton} disabled={isChecking}>
                {isChecking ? 'Checking…' : 'Check estimated eligibility'}
                {!isChecking ? <ArrowRight size={18} aria-hidden="true" /> : null}
              </button>
              <p className={styles.footnote}>Includes interest; excludes fees and insurance.</p>
            </div>
          </div>
        </form>

        <aside className={styles.sidebar} aria-label="Why we ask">
          <h3 className={styles.sidebarTitle}>Why we ask</h3>
          <ul className={styles.sidebarList}>
            <li className={styles.sidebarItem}>
              <User className={styles.sidebarIcon} size={18} aria-hidden="true" />
              <span>Your income and costs help us estimate affordability.</span>
            </li>
            <li className={styles.sidebarItem}>
              <Calculator className={styles.sidebarIcon} size={18} aria-hidden="true" />
              <span>Count each cost once.</span>
            </li>
            <li className={styles.sidebarItem}>
              <Shield className={styles.sidebarIcon} size={18} aria-hidden="true" />
              <span>Your information stays on this device.</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
};

export default YourBudgetScreen;
