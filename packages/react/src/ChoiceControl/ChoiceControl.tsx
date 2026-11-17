import { useId } from 'react';
import { ContentSwitcher, Dropdown, RadioButton, RadioButtonGroup, Switch, Tag } from '@carbon/react';

export interface ChoiceOption {
  id: string;
  label: string;
  disabled?: boolean;
}

export type ChoiceVariant = 'segmented' | 'dropdown' | 'radio' | 'chips' | 'range';
export type ChoiceSize = 'sm' | 'md' | 'lg';

export interface ChoiceControlProps {
  /**
   * segmented: Carbon ContentSwitcher. dropdown: Carbon Dropdown. radio: Carbon RadioButtonGroup.
   * chips: toggle buttons (aria-pressed). range: segmented, with the fixed ranges passed as options.
   */
  variant: ChoiceVariant;
  options: ChoiceOption[];
  /** id of the selected option. */
  value: string;
  onChange: (id: string) => void;
  size?: ChoiceSize;
  /** Shows the selected option as text, with no control. */
  readonly?: boolean;
  /** Accessible name of the group (and the visible label for dropdown and radio). */
  label: string;
}

// One choice from a short list. The variant decides the control; the options and value are the same for all.
export function ChoiceControl({ variant, options, value, onChange, size = 'md', readonly = false, label }: ChoiceControlProps) {
  const baseId = useId();
  const selectedIndex = options.findIndex((option) => option.id === value);
  const selected = options[selectedIndex] ?? null;

  if (readonly) {
    return (
      <div className={`rds-choice rds-choice--${variant}`}>
        <p className="rds-choice__label">{label}</p>
        <p className="rds-choice__readonly">{selected?.label ?? ''}</p>
      </div>
    );
  }

  // Dropdown: disabled options are left out of the list (Carbon Dropdown cannot disable one item).
  if (variant === 'dropdown') {
    return (
      <div className="rds-choice rds-choice--dropdown">
        <Dropdown
          id={`${baseId}-dropdown`}
          titleText={label}
          label={label}
          size={size}
          items={options.filter((option) => !option.disabled)}
          itemToString={(item) => item?.label ?? ''}
          selectedItem={selected && !selected.disabled ? selected : null}
          onChange={({ selectedItem }) => {
            if (selectedItem) onChange(selectedItem.id);
          }}
        />
      </div>
    );
  }

  if (variant === 'radio') {
    return (
      <div className="rds-choice rds-choice--radio">
        <RadioButtonGroup
          name={`${baseId}-radio`}
          legendText={label}
          valueSelected={value}
          onChange={(next) => onChange(String(next))}
          orientation="horizontal"
        >
          {options.map((option) => (
            <RadioButton key={option.id} value={option.id} id={`${baseId}-${option.id}`} labelText={option.label} disabled={option.disabled} />
          ))}
        </RadioButtonGroup>
      </div>
    );
  }

  if (variant === 'chips') {
    return (
      <div className="rds-choice rds-choice--chips" role="group" aria-label={label}>
        <div className="rds-choice__chips">
          {options.map((option) => {
            const pressed = option.id === value;
            return (
              <Tag
                key={option.id}
                as="button"
                type="blue"
                disabled={option.disabled}
                aria-pressed={pressed}
                onClick={() => onChange(option.id)}
                className="rds-choice__chip"
              >
                {option.label}
              </Tag>
            );
          })}
        </div>
      </div>
    );
  }

  // segmented and range: the same Carbon ContentSwitcher. range differs only in the options it is given.
  return (
    <div className={`rds-choice rds-choice--${variant}`}>
      <ContentSwitcher
        size={size}
        aria-label={label}
        selectedIndex={Math.max(0, selectedIndex)}
        onChange={({ index }) => {
          const option = options[index ?? -1];
          if (option) onChange(option.id);
        }}
      >
        {options.map((option) => (
          <Switch key={option.id} name={option.id} text={option.label} disabled={option.disabled} />
        ))}
      </ContentSwitcher>
    </div>
  );
}
