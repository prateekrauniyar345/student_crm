import React from "react";
import "./Card.css";

/**
 * Reusable Card component for Student CRM
 * @param {Object} props
 * @param {React.ReactNode} [props.title]
 * @param {React.ReactNode} [props.subtitle]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} [props.headerAction]
 * @param {React.ReactNode} [props.footer]
 * @param {boolean} [props.noPadding=false]
 * @param {string} [props.className='']
 * @param {string} [props.headerClassName='']
 * @param {string} [props.bodyClassName='']
 * @param {React.ReactNode} props.children
 */
export default function Card({
  title,
  subtitle,
  icon,
  headerAction,
  footer,
  noPadding = false,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  children,
  ...rest
}) {
  const hasHeader = title || subtitle || icon || headerAction;

  return (
    <div className={`ui-card ${className}`} {...rest}>
      {hasHeader && (
        <div className={`ui-card-header ${headerClassName}`}>
          <div className="ui-card-header-main">
            {icon && <div className="ui-card-header-icon">{icon}</div>}
            <div>
              {title && <h3 className="ui-card-title">{title}</h3>}
              {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="ui-card-header-action">{headerAction}</div>}
        </div>
      )}

      <div className={`ui-card-body ${noPadding ? "ui-card-body-no-padding" : ""} ${bodyClassName}`}>
        {children}
      </div>

      {footer && <div className="ui-card-footer">{footer}</div>}
    </div>
  );
}
