import React from "react";
import "./Card.css";

/**
 * Reusable StatCard component for Student CRM dashboards
 * @param {Object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {React.ReactNode} [props.icon]
 * @param {'blue'|'green'|'amber'|'purple'|'danger'|'neutral'} [props.iconVariant='blue']
 * @param {React.ReactNode} [props.subtext]
 * @param {React.ReactNode} [props.pill]
 * @param {boolean} [props.loading=false]
 * @param {string} [props.className='']
 * @param {Function} [props.onClick]
 */
export default function StatCard({
  label,
  value,
  icon,
  iconVariant = "blue",
  subtext,
  pill,
  loading = false,
  className = "",
  onClick,
  ...rest
}) {
  return (
    <div
      className={`ui-stat-card ${onClick ? "ui-stat-card-clickable" : ""} ${className}`}
      onClick={onClick}
      {...rest}
    >
      <div className="ui-stat-header">
        <span className="ui-stat-label">{label}</span>
        {icon && (
          <div className={`ui-stat-icon-box ui-stat-icon-${iconVariant}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="ui-stat-value font-mono">
        {loading ? <span className="ui-stat-loading-placeholder">—</span> : value}
      </div>

      {(subtext || pill) && (
        <div className="ui-stat-footer">
          {pill && <div className="ui-stat-pill-wrap">{pill}</div>}
          {subtext && <span className="ui-stat-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
