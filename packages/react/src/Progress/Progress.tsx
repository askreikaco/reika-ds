import { ProgressBar, ProgressIndicator, ProgressStep } from '@carbon/react';

export type ProgressKind = 'bar' | 'steps';
export type ProgressStepState = 'done' | 'current' | 'pending';

export interface ProgressStepItem {
  label: string;
  description?: string;
  state: ProgressStepState;
}

export interface ProgressLabels {
  /** Screen-reader state text for a done step. */
  done?: string;
  /** Screen-reader state text for the current step. */
  current?: string;
  /** Screen-reader state text for a pending step. */
  pending?: string;
}

const DEFAULT_LABELS: Required<ProgressLabels> = {
  done: 'Done',
  current: 'Current',
  pending: 'Pending',
};

export interface ProgressProps {
  /** bar: one horizontal bar. steps: a list of steps with their state. */
  kind: ProgressKind;
  /** bar only: current value. Without it the bar is indeterminate. */
  value?: number;
  /** bar only: maximum value (Carbon default 100). */
  max?: number;
  /** bar: visible label. steps: accessible name of the step list. */
  label?: string;
  /** Text under the bar, or under the steps. */
  helper?: string;
  /** steps only. */
  steps?: ProgressStepItem[];
  /** steps only: stacked top to bottom. */
  vertical?: boolean;
  /** Built-in strings, English by default. */
  labels?: ProgressLabels;
}

// Carbon ProgressIndicator keys for the state text that Carbon reads to screen readers.
const CARBON_KEY = {
  complete: 'carbon.progress-step.complete',
  current: 'carbon.progress-step.current',
  incomplete: 'carbon.progress-step.incomplete',
} as const;

// The index Carbon treats as current: the current step, else the first pending one, else past the end (all done).
function currentIndexOf(steps: ProgressStepItem[]): number {
  const current = steps.findIndex((step) => step.state === 'current');
  if (current >= 0) return current;
  const pending = steps.findIndex((step) => step.state === 'pending');
  return pending >= 0 ? pending : steps.length;
}

// One progress bar (Carbon ProgressBar) or one list of steps (Carbon ProgressIndicator with ProgressStep).
export function Progress({ kind, value, max, label, helper, steps = [], vertical = false, labels }: ProgressProps) {
  const strings = { ...DEFAULT_LABELS, ...labels };

  if (kind === 'bar') {
    return (
      <div className="rds-progress rds-progress--bar">
        <ProgressBar label={label ?? ''} hideLabel={!label} helperText={helper} value={value} max={max} />
      </div>
    );
  }

  const translateWithId = (id: string): string => {
    switch (id) {
      case CARBON_KEY.complete:
        return strings.done;
      case CARBON_KEY.current:
        return strings.current;
      case CARBON_KEY.incomplete:
        return strings.pending;
      default:
        return id;
    }
  };

  return (
    <div
      className={`rds-progress rds-progress--steps${vertical ? ' rds-progress--vertical' : ''}`}
      role="group"
      aria-label={label}
    >
      <ProgressIndicator currentIndex={currentIndexOf(steps)} vertical={vertical}>
        {steps.map((step, index) => (
          <ProgressStep
            key={`${index}-${step.label}`}
            label={step.label}
            description={step.description}
            complete={step.state === 'done'}
            current={step.state === 'current'}
            translateWithId={translateWithId}
          />
        ))}
      </ProgressIndicator>
      {helper ? <p className="rds-progress__helper">{helper}</p> : null}
    </div>
  );
}
