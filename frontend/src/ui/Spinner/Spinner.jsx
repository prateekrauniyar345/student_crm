import React from "react";
import "./Spinner.css";

/**
 * Reusable Spinner component for loading states
 * @param {Object} props
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='md']
 * @param {'primary'|'secondary'|'white'} [props.variant='primary']
 * @param {string} [props.message]
 * @param {boolean} [props.centered=false]
 * @param {string} [props.className='']
 */
export default function Spinner({
  size = "md",
  variant = "primary",
  message,
  centered = false,
  className = "",
}) {
  const content = (
    <div className={`ui-spinner-wrap ${className}`}>
      <span
        className={`ui-spinner ui-spinner-${size} ui-spinner-${variant}`}
        role="status"
        aria-label={message || "Loading"}
      />
      {message && <span className="ui-spinner-message">{message}</span>}
    </div>
  );

  if (centered) {
    return <div className="ui-spinner-centered">{content}</div>;
  }

  return content;
}
