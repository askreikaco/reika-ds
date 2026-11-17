import { useId, type ReactNode } from 'react';
import { InlineNotification, Stack, Toggle } from '@carbon/react';
import { Checkmark } from '@carbon/icons-react';

export type SettingsStatusKind = 'saved' | 'saving' | 'error';

export interface SettingsStatus {
  kind: SettingsStatusKind;
  /** Overrides the default text for the kind. Error text is the notice title, so it is a string. */
  text?: string;
}

export type SettingsRowKind = 'toggle' | 'labelValue' | 'action';

export interface SettingsRow {
  id: string;
  kind: SettingsRowKind;
  label: ReactNode;
  description?: ReactNode;
  /** toggle: current state. */
  checked?: boolean;
  /** toggle: called with the new state when the switch changes. */
  onToggle?: (checked: boolean) => void;
  /** labelValue: the value shown on the right. */
  value?: ReactNode;
  /** action: the control on the right (a button, a link). */
  action?: ReactNode;
}

export interface SettingsGroupLabels {
  /** Status text for saved. */
  saved?: string;
  /** Status text for saving. */
  saving?: string;
  /** Notice title for error. */
  error?: string;
}

const DEFAULT_LABELS: Required<SettingsGroupLabels> = {
  saved: 'Saved',
  saving: 'Saving',
  error: 'Could not save',
};

const SWITCH_SIZE = 'sm';
const ICON_SIZE = 16;

export interface SettingsGroupProps {
  title: string;
  description?: ReactNode;
  status?: SettingsStatus;
  footer?: ReactNode;
  rows: SettingsRow[];
  /** Built-in strings, English by default. */
  labels?: SettingsGroupLabels;
}

// One settings section: heading, optional status, a list of rows (switch, label and value, or action), optional footer.
export function SettingsGroup({ title, description, status, footer, rows, labels }: SettingsGroupProps) {
  const strings = { ...DEFAULT_LABELS, ...labels };
  const titleId = `${useId()}-title`;
  const statusText = status ? (status.text ?? strings[status.kind]) : '';

  return (
    <section className="rds-settings-group" aria-labelledby={titleId}>
      <Stack gap={3}>
        <div className="rds-settings-group__head">
          <div className="rds-settings-group__heading">
            <h2 id={titleId} className="rds-settings-group__title">
              {title}
            </h2>
            {description ? <p className="rds-settings-group__description">{description}</p> : null}
          </div>
          {status && status.kind !== 'error' ? (
            <span role="status" aria-live="polite" className={`rds-settings-group__status rds-settings-group__status--${status.kind}`}>
              {status.kind === 'saved' ? <Checkmark size={ICON_SIZE} aria-hidden="true" /> : null}
              {statusText}
            </span>
          ) : null}
        </div>
        {status && status.kind === 'error' ? (
          <InlineNotification kind="error" title={statusText} hideCloseButton lowContrast />
        ) : null}
        {rows.length > 0 ? (
          <ul className="rds-settings-group__rows">
            {rows.map((row) => {
              const labelId = `${row.id}-label`;
              return (
                <li key={row.id} className={`rds-settings-group__row rds-settings-group__row--${row.kind}`}>
                  <div className="rds-settings-group__text">
                    <span id={labelId} className="rds-settings-group__label">
                      {row.label}
                    </span>
                    {row.description ? <span className="rds-settings-group__description">{row.description}</span> : null}
                  </div>
                  {row.kind === 'toggle' ? (
                    <div className="rds-settings-group__control">
                      <Toggle
                        id={row.id}
                        size={SWITCH_SIZE}
                        hideLabel
                        aria-labelledby={labelId}
                        toggled={row.checked ?? false}
                        onToggle={(checked: boolean) => row.onToggle?.(checked)}
                      />
                    </div>
                  ) : null}
                  {row.kind === 'labelValue' && row.value ? <span className="rds-settings-group__value">{row.value}</span> : null}
                  {row.kind === 'action' && row.action ? <div className="rds-settings-group__control">{row.action}</div> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
        {footer ? <div className="rds-settings-group__footer">{footer}</div> : null}
      </Stack>
    </section>
  );
}
