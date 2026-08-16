import React from "react";
import "./Input.css";

/**
 * Reusable Input component for Student CRM
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {'sm'|'md'} [props.size='sm']
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.className='']
 * @param {string} [props.inputClassName='']
 */
export default function Input({
  label,
  error,
  helperText,
  leftIcon = null,
  rightIcon = null,
  size = "sm",
  fullWidth = false,
  className = "",
  inputClassName = "",
  disabled = false,
  type = "text",
  id,
  name,
  ...rest
}) {
  const inputId = id || (name ? `input-${name}` : undefined);

  return (
    <div className={`ui-input-wrapper ${fullWidth ? "ui-input-full" : ""} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
        </label>
      )}

      <div
        className={`ui-input-container ui-input-${size} ${
          error ? "ui-input-has-error" : ""
        } ${disabled ? "ui-input-disabled" : ""}`}
      >
        {leftIcon && <span className="ui-input-icon ui-input-icon-left">{leftIcon}</span>}

        <input
          id={inputId}
          name={name}
          type={type}
          disabled={disabled}
          className={`ui-input-field ${leftIcon ? "ui-input-with-left-icon" : ""} ${
            rightIcon ? "ui-input-with-right-icon" : ""
          } ${inputClassName}`}
          {...rest}
        />

        {rightIcon && <span className="ui-input-icon ui-input-icon-right">{rightIcon}</span>}
      </div>

      {error && <span className="ui-input-error-text">{error}</span>}
      {!error && helperText && <span className="ui-input-helper-text">{helperText}</span>}
    </div>
  );
}
