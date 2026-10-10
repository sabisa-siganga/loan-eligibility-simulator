import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EstimateSummaryCard from '../components/EstimateSummaryCard';
import LinkedSliderField from '../components/LinkedSliderField';
import SelectField from '../components/SelectField';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { submitLoanDetails } from '../store/journeySlice';
import { selectSubmittedLoanDetails } from '../store/journeySelectors';
import { LOAN_PURPOSE_LABELS, LOAN_PURPOSES } from '../types/loan';
import { calculateRepayment, isValidLoanEstimateInput } from '../utils/calculateRepayment';
import {
  loanDetailsFormSchema,
  type LoanDetailsFormInput,
  type LoanDetailsFormValues,
} from '../utils/loanDetailsSchema';
import { PRODUCT_SETTINGS } from '../utils/productSettings';
import styles from './LoanDetailsScreen.module.scss';

const purposeOptions = LOAN_PURPOSES.map((value) => ({
  value,
  label: LOAN_PURPOSE_LABELS[value],
}));

const LoanDetailsScreen = () => {
  const dispatch = useAppDispatch();
  const submittedLoanDetails = useAppSelector(selectSubmittedLoanDetails);

  const defaultValues: LoanDetailsFormInput = useMemo(
    () =>
      submittedLoanDetails
        ? {
            amount: submittedLoanDetails.amount,
            termMonths: submittedLoanDetails.termMonths,
            purpose: submittedLoanDetails.purpose,
          }
        : {
            amount: PRODUCT_SETTINGS.defaultAmount,
            termMonths: PRODUCT_SETTINGS.defaultTermMonths,
            purpose: '',
          },
    [submittedLoanDetails],
  );

  const [annualRate, setAnnualRate] = useState<number>(
    submittedLoanDetails?.annualRateUsed ?? PRODUCT_SETTINGS.exampleAnnualRate,
  );

  const {
    control,
    handleSubmit,
    watch,
    setFocus,
    formState: { errors },
  } = useForm<LoanDetailsFormInput, unknown, LoanDetailsFormValues>({
    resolver: zodResolver(loanDetailsFormSchema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const amount = watch('amount');
  const termMonths = watch('termMonths');

  const canEstimate =
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

  const estimate = useMemo(() => {
    if (!canEstimate || amount === null || termMonths === null) {
      return null;
    }

    return calculateRepayment({
      principal: amount,
      termMonths,
      annualRatePercent: annualRate,
    });
  }, [amount, termMonths, annualRate, canEstimate]);

  const onValidSubmit = (values: LoanDetailsFormValues) => {
    dispatch(
      submitLoanDetails({
        amount: values.amount,
        termMonths: values.termMonths,
        purpose: values.purpose,
        annualRateUsed: annualRate,
      }),
    );
  };

  const onInvalidSubmit = () => {
    const order: Array<keyof LoanDetailsFormInput> = ['amount', 'termMonths', 'purpose'];
    const firstInvalid = order.find((field) => errors[field]);
    if (firstInvalid) {
      setFocus(firstInvalid);
    }
  };

  return (
    <section className={styles.screen} data-testid="loan-details-screen">
      <div className={styles.intro}>
        <h2 className={styles.title}>See how a loan could fit your budget</h2>
        <p className={styles.subtitle}>Explore repayments before checking your budget.</p>
      </div>

      <div className={styles.layout}>
        <form
          className={styles.form}
          noValidate
          onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        >
          <p className={styles.requiredNote}>
            <span className={styles.requiredMark}>*</span> Required field
          </p>

          <Controller
            name="amount"
            control={control}
            render={({ field, fieldState }) => (
              <LinkedSliderField
                ref={field.ref}
                label="Loan amount (R)"
                mode="money"
                name={field.name}
                value={field.value}
                min={PRODUCT_SETTINGS.minAmount}
                max={PRODUCT_SETTINGS.maxAmount}
                minLabel="R5,000"
                maxLabel="R300,000"
                required
                error={fieldState.error?.message}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />

          <Controller
            name="termMonths"
            control={control}
            render={({ field, fieldState }) => (
              <LinkedSliderField
                ref={field.ref}
                label="Repayment term (months)"
                mode="term"
                name={field.name}
                value={field.value}
                min={PRODUCT_SETTINGS.minTermMonths}
                max={PRODUCT_SETTINGS.maxTermMonths}
                minLabel="6"
                maxLabel="60"
                required
                error={fieldState.error?.message}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />

          <Controller
            name="purpose"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                ref={field.ref}
                label="Loan purpose"
                name={field.name}
                value={field.value}
                options={purposeOptions}
                placeholder="Select a purpose"
                helperText="Purpose does not change this estimate."
                required
                error={fieldState.error?.message}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </form>

        <EstimateSummaryCard
          amount={canEstimate ? amount : null}
          termMonths={canEstimate ? termMonths : null}
          estimate={estimate}
          annualRate={annualRate}
          onAnnualRateChange={setAnnualRate}
          onContinue={handleSubmit(onValidSubmit, onInvalidSubmit)}
        />
      </div>
    </section>
  );
};

export default LoanDetailsScreen;
