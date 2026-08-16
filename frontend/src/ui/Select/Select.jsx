import React from "react";
import { ChevronDown } from "lucide-react";
import "./Select.css";

/**
 * Reusable Select / Dropdown component for Student CRM
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {React.ReactNode} [props.icon] - Left icon (e.g. Filter)
 * @param {Array<{value: string|number, label: string, disabled?: boolean}>} [props.options]
 * @param {'sm'|'md'} [props.size='sm']
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.className='']
 * @param {string} [props.selectClassName='']
 * @param {React.ReactNode} [props.children]
 */
export default function Select({
  label,
  error,
  helperText,
  icon = null,
  options = [],
  size = "sm",
  fullWidth = false,
  className = "",
  selectClassName = "",
  value,
  onChange,
  disabled = false,
  id,
  name,
  placeholder,
  children,
  ...rest
}) {
  const selectId = id || (name ? `select-${name}` : undefined);

  return (
    <div className={`ui-select-wrapper ${fullWidth ? "ui-select-full" : ""} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="ui-select-label">
          {label}
        </label>
      )}

      <div className={`ui-select-container ui-select-${size} ${error ? "ui-select-has-error" : ""} ${disabled ? "ui-select-disabled" : ""}`}>
        {icon && <span className="ui-select-left-icon">{icon}</span>}

        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`ui-select-input ${icon ? "ui-select-with-icon" : ""} ${selectClassName}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options && options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <span className="ui-select-chevron">
          <ChevronDown size={14} />
        </span>
      </div>

      {error && <span className="ui-select-error-text">{error}</span>}
      {!error && helperText && <span className="ui-select-helper-text">{helperText}</span>}
    </div>
  );
}
