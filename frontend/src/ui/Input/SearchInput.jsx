import React from "react";
import { Search, X } from "lucide-react";
import "./Input.css";

/**
 * Reusable SearchInput component for Student CRM
 * @param {Object} props
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {Function} [props.onClear]
 * @param {string} [props.placeholder='Search...']
 * @param {'sm'|'md'} [props.size='sm']
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.className='']
 */
export default function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  size = "sm",
  fullWidth = false,
  className = "",
  disabled = false,
  ...rest
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div
      className={`ui-search-input-wrapper ui-input-${size} ${
        fullWidth ? "ui-input-full" : ""
      } ${disabled ? "ui-input-disabled" : ""} ${className}`}
    >
      <Search size={size === "sm" ? 14 : 16} className="ui-search-left-icon" />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="ui-search-field"
        {...rest}
      />

      {value && !disabled && (
        <button
          type="button"
          className="ui-search-clear-btn"
          onClick={handleClear}
          title="Clear search"
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
