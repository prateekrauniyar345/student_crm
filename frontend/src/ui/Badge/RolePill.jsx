import React from "react";
import { rolePillsStatusStyle } from "../../utils/styleGuide";
import "./Badge.css";

/**
 * Reusable RolePill component for displaying CRM roles with standardized styling
 * @param {Object} props
 * @param {string} props.role - e.g. "Admin", "Analyst", "Advisor", "Faculty", "Viewer"
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className='']
 */
export default function RolePill({ role = "Viewer", icon = null, className = "", ...rest }) {
  // Normalize role casing
  const normalizedRole =
    role && typeof role === "string"
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : "Viewer";

  const styleClass = rolePillsStatusStyle[normalizedRole] || "status-pill status-pill-warning";

  return (
    <span className={`${styleClass} ${className}`} {...rest}>
      {icon && <span className="ui-status-pill-icon">{icon}</span>}
      <span>{normalizedRole}</span>
    </span>
  );
}
