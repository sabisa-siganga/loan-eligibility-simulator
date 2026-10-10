import { Check } from 'lucide-react';
import {
  JOURNEY_SCREENS,
  JOURNEY_SCREEN_LABELS,
  type JourneyScreen,
} from '../../store/journeySlice';
import styles from './ProgressStepper.module.scss';

const STEPS: JourneyScreen[] = [
  JOURNEY_SCREENS.loanDetails,
  JOURNEY_SCREENS.yourBudget,
  JOURNEY_SCREENS.yourResult,
];

type ProgressStepperProps = {
  currentScreen: JourneyScreen;
};

const stepIndex = (screen: JourneyScreen): number => STEPS.indexOf(screen);

const ProgressStepper = ({ currentScreen }: ProgressStepperProps) => {
  const currentIndex = stepIndex(currentScreen);

  return (
    <ol className={styles.stepper} aria-label="Application progress">
      {STEPS.map((screen, index) => {
        const isComplete = index < currentIndex;
        const isActive = index === currentIndex;
        const stepClass = [
          styles.step,
          isActive ? styles.stepActive : '',
          isComplete ? styles.stepComplete : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={screen} className={stepClass}>
            <span className={styles.marker} aria-hidden="true">
              {isComplete ? <Check size={16} strokeWidth={2.5} /> : index + 1}
            </span>
            <span className={styles.label}>
              {JOURNEY_SCREEN_LABELS[screen]}
              {isActive ? <span className="visually-hidden"> (current)</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default ProgressStepper;
