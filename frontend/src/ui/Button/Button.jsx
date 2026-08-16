import React from "react";
import "./Button.css";

/**
 * Reusable Button component for Student CRM
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'} [props.variant='primary']
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='sm']
 * @param {React.ReactNode} [props.icon]
 * @param {'left'|'right'} [props.iconPosition='left']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.className='']
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variant = "primary",
  size = "sm",
  icon = null,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  children,
  type = "button",
  onClick,
  title,
  ...rest
}) {
  const classes = [
    "ui-btn",
    `ui-btn-${variant}`,
    `ui-btn-${size}`,
    fullWidth ? "ui-btn-full" : "",
    loading ? "ui-btn-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      {...rest}
    >
      {loading ? (
        <span className="ui-btn-spinner" aria-hidden="true" />
      ) : (
        icon && iconPosition === "left" && (
          <span className="ui-btn-icon ui-btn-icon-left">{icon}</span>
        )
      )}
      {children && <span className="ui-btn-text">{children}</span>}
      {!loading && icon && iconPosition === "right" && (
        <span className="ui-btn-icon ui-btn-icon-right">{icon}</span>
      )}
    </button>
  );
}
