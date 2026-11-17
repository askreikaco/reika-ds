import { useId, type ReactNode } from 'react';
import {
  Checkbox,
  DatePicker,
  DatePickerInput,
  FileUploaderButton,
  FormLabel,
  NumberInput,
  Select,
  SelectItem,
  TextArea,
  TextInput,
} from '@carbon/react';

export interface FieldOption {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface FieldLabels {
  /** Suffix shown on the label of an optional field. */
  optional?: string;
  /** File kind: text on the file button. */
  chooseFile?: string;
}

const DEFAULT_LABELS: Required<FieldLabels> = { optional: 'optional', chooseFile: 'Choose file' };

interface FieldCommon {
  /** Visible label. */
  label: string;
  helper?: string;
  /** Error text. Also marks the field invalid. */
  error?: string;
  required?: boolean;
  /** Adds "(optional)" to the label. */
  optional?: boolean;
  disabled?: boolean;
  labels?: FieldLabels;
}

// One form field per kind. Kind-specific props are on the matching union member.
export type FieldProps = FieldCommon &
  (
    | { kind: 'text' | 'email' | 'tel'; value: string; onChange: (value: string) => void; placeholder?: string; autoComplete?: string }
    | { kind: 'number'; value: number | null; onChange: (value: number | null) => void; min?: number; max?: number; step?: number }
    | { kind: 'textarea'; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }
    | { kind: 'select'; value: string; onChange: (value: string) => void; options: FieldOption[]; placeholder?: string }
    | { kind: 'checkbox'; checked: boolean; onChange: (checked: boolean) => void }
    | { kind: 'date'; value: string; onChange: (value: string) => void; min?: string; max?: string }
    | { kind: 'file'; onChange: (files: File[]) => void; accept?: string; multiple?: boolean }
  );

// Local date as YYYY-MM-DD (no time zone shift, unlike toISOString).
function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromIsoDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

// Label, helper and error for every kind. Carbon inputs get them through their own props (so Carbon links them
// with aria-describedby); checkbox and file have no such props, so they get the same text below.
export function Field(props: FieldProps) {
  const { label, helper, error, required = false, optional = false, disabled = false, labels } = props;
  const L = { ...DEFAULT_LABELS, ...labels };
  const id = useId();
  const labelText = optional ? `${label} (${L.optional})` : label;
  const invalid = Boolean(error);
  const helperEl = helper && !invalid ? <p className="rds-field__helper">{helper}</p> : null;
  const errorEl = error ? (
    <p className="rds-field__error" role="alert">
      {error}
    </p>
  ) : null;

  let control: ReactNode;
  switch (props.kind) {
    case 'text':
    case 'email':
    case 'tel':
      control = (
        <TextInput
          id={id}
          type={props.kind}
          labelText={labelText}
          value={props.value}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          onChange={(event) => props.onChange(event.target.value)}
          helperText={helper}
          invalid={invalid}
          invalidText={error}
          required={required}
          disabled={disabled}
        />
      );
      break;
    case 'number':
      control = (
        <NumberInput
          id={id}
          label={labelText}
          value={props.value ?? ''}
          allowEmpty
          min={props.min}
          max={props.max}
          step={props.step}
          onChange={(_event, state) => {
            const next = typeof state.value === 'number' && !Number.isNaN(state.value) ? state.value : null;
            props.onChange(next);
          }}
          helperText={helper}
          invalid={invalid}
          invalidText={error}
          required={required}
          disabled={disabled}
        />
      );
      break;
    case 'textarea':
      control = (
        <TextArea
          id={id}
          labelText={labelText}
          value={props.value}
          rows={props.rows ?? 4}
          placeholder={props.placeholder}
          onChange={(event) => props.onChange(event.target.value)}
          helperText={helper}
          invalid={invalid}
          invalidText={error}
          required={required}
          disabled={disabled}
        />
      );
      break;
    case 'select':
      control = (
        <Select
          id={id}
          labelText={labelText}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          helperText={helper}
          invalid={invalid}
          invalidText={error}
          required={required}
          disabled={disabled}
        >
          {props.placeholder !== undefined ? <SelectItem value="" text={props.placeholder} disabled /> : null}
          {props.options.map((option) => (
            <SelectItem key={option.id} value={option.id} text={option.label} disabled={option.disabled} />
          ))}
        </Select>
      );
      break;
    case 'checkbox':
      control = (
        <>
          <Checkbox
            id={id}
            labelText={labelText}
            checked={props.checked}
            onChange={(_event, state) => props.onChange(state.checked)}
            disabled={disabled}
          />
          {helperEl}
          {errorEl}
        </>
      );
      break;
    case 'date':
      control = (
        <DatePicker
          datePickerType="single"
          dateFormat="Y-m-d"
          value={fromIsoDate(props.value)}
          minDate={props.min ? fromIsoDate(props.min) : undefined}
          maxDate={props.max ? fromIsoDate(props.max) : undefined}
          onChange={(dates) => {
            const [first] = dates;
            props.onChange(first ? toIsoDate(first) : '');
          }}
        >
          <DatePickerInput
            id={id}
            labelText={labelText}
            placeholder="yyyy-mm-dd"
            helperText={helper}
            invalid={invalid}
            invalidText={error}
            disabled={disabled}
          />
        </DatePicker>
      );
      break;
    case 'file':
      control = (
        <>
          <div role="group" aria-label={labelText}>
          <FormLabel>{labelText}</FormLabel>
          <FileUploaderButton
            id={id}
            labelText={L.chooseFile}
            buttonKind="tertiary"
            accept={props.accept ? props.accept.split(',').map((item) => item.trim()) : undefined}
            multiple={props.multiple}
            disabled={disabled}
            onChange={(event) => props.onChange(Array.from(event.target.files ?? []))}
          />
          </div>
          {helperEl}
          {errorEl}
        </>
      );
      break;
  }

  return (
    <div className={`rds-field rds-field--${props.kind}`}>
      {control}
    </div>
  );
}
