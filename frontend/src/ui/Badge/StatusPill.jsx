import React from "react";
import "./Badge.css";

/**
 * Reusable StatusPill component for Student CRM
 * @param {Object} props
 * @param {'success'|'info'|'warning'|'danger'|'neutral'} [props.variant='neutral']
 * @param {React.ReactNode} [props.icon]
 * @param {boolean} [props.dot=false]
 * @param {string} [props.className='']
 * @param {React.ReactNode} props.children
 */
export default function StatusPill({
  variant = "neutral",
  icon = null,
  dot = false,
  className = "",
  children,
  ...rest
}) {
  return (
    <span className={`ui-status-pill ui-status-pill-${variant} ${className}`} {...rest}>
      {dot && <span className="ui-status-pill-dot" aria-hidden="true" />}
      {icon && <span className="ui-status-pill-icon">{icon}</span>}
      <span className="ui-status-pill-text">{children}</span>
    </span>
  );
}
