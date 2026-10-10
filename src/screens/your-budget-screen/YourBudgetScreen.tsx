import { Fragment, useEffect, useMemo, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, Calculator, Shield, User } from 'lucide-react';
import MoneyInput from '../../components/money-input';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Select } from '../../components/ui/select';
import WholeNumberInput from '../../components/whole-number-input';
import { checkEligibility, ELIGIBILITY_CHECK_FAILED_MESSAGE } from '../../services/eligibility';
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
import { POLICY_THRESHOLDS } from '../../utils/policyThresholds';
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

  const summaryParts = submittedLoan
    ? [
        formatMoneyDisplay(submittedLoan.amount),
        `${submittedLoan.termMonths} months`,
        LOAN_PURPOSE_LABELS[submittedLoan.purpose],
      ]
    : null;

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
          message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
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

      <p
        className={styles.summary}
        data-testid="loan-summary"
        aria-label={summaryParts ? summaryParts.join(' • ') : undefined}
      >
        {summaryParts
          ? summaryParts.map((part, index) => (
              <Fragment key={part}>
                {index > 0 ? (
                  <span className={styles.summarySep} aria-hidden="true">
                    •
                  </span>
                ) : null}
                <span aria-hidden="true">{part}</span>
              </Fragment>
            ))
          : 'Loan details unavailable'}
      </p>

      {eligibilityError ? (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={24} aria-hidden="true" />
          <div className={styles.errorBannerBody}>
            <p className={styles.errorBannerHeading}>Check could not finish</p>
            <p className={styles.errorBannerText}>{eligibilityError}</p>
          </div>
          <Button
            variant="secondary"
            className={styles.tryAgain}
            onClick={() => {
              void handleSubmit(onValidSubmit, onInvalidSubmit)();
            }}
          >
            Try again
          </Button>
        </div>
      ) : null}

      <form
        className={styles.layout}
        noValidate
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
      >
        <div className={styles.formColumn}>
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
                    type="number"
                    min={POLICY_THRESHOLDS.minAge}
                    max={POLICY_THRESHOLDS.maxAge}
                    step={1}
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
                  <Select
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
              <div className={styles.conditionalReveal}>
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
              </div>
            ) : null}

            {showBusinessDuration ? (
              <div className={styles.conditionalReveal}>
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
              </div>
            ) : null}

            {needsIncomeSource ? (
              <div className={styles.conditionalReveal}>
                <Controller
                  name="incomeSource"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Select
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
              </div>
            ) : null}

            {showIncomeDuration ? (
              <div className={styles.conditionalReveal}>
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
              </div>
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
                  <Checkbox
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
              <div className={styles.conditionalReveal}>
                <Controller
                  name="requestDemoCreditCheck"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      ref={field.ref}
                      label="Check my credit score"
                      name={field.name}
                      checked={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            ) : null}
          </div>
        </div>

        <aside className={styles.sidebar} aria-label="Why we ask">
          <h3 className={styles.sidebarTitle}>Why we ask</h3>
          <ul className={styles.sidebarList}>
            <li className={styles.sidebarItem}>
              <span className={styles.sidebarIconWrap}>
                <User size={20} aria-hidden="true" />
              </span>
              <span>Your income and costs help us estimate affordability.</span>
            </li>
            <li className={styles.sidebarItem}>
              <span className={styles.sidebarIconWrap}>
                <Calculator size={20} aria-hidden="true" />
              </span>
              <span>Count each cost once.</span>
            </li>
            <li className={styles.sidebarItem}>
              <span className={styles.sidebarIconWrap}>
                <Shield size={20} aria-hidden="true" />
              </span>
              <span>Your information stays on this device.</span>
            </li>
          </ul>
        </aside>

        <div className={styles.actions}>
          <div className={styles.secondaryActions}>
            <Button variant="link" onClick={onBack}>
              Back
            </Button>
            <Button variant="link" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className={styles.primaryGroup}>
            <Button type="submit" className={styles.primaryButton} disabled={isChecking}>
              {isChecking ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Checking…
                </>
              ) : (
                <>
                  Check estimated eligibility
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </Button>
            <p className={styles.footnote}>Includes interest; excludes fees and insurance.</p>
          </div>
        </div>
      </form>
    </section>
  );
};

export default YourBudgetScreen;
