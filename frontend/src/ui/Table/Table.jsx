import React from "react";
import "./Table.css";

/**
 * Reusable Table components for Student CRM
 */

export function Table({ className = "", children, ...rest }) {
  return (
    <div className="ui-table-wrapper">
      <table className={`ui-table ${className}`} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...rest }) {
  return (
    <thead className={`ui-table-header ${className}`} {...rest}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...rest }) {
  return (
    <tbody className={`ui-table-body ${className}`} {...rest}>
      {children}
    </tbody>
  );
}

export function TableRow({ className = "", isClickable = false, children, ...rest }) {
  return (
    <tr
      className={`ui-table-row ${isClickable ? "ui-table-row-clickable" : ""} ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className = "",
  align = "left",
  width,
  children,
  ...rest
}) {
  return (
    <th
      style={width ? { width } : undefined}
      className={`ui-table-th ui-table-align-${align} ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className = "",
  align = "left",
  isMono = false,
  children,
  ...rest
}) {
  return (
    <td
      className={`ui-table-td ui-table-align-${align} ${isMono ? "font-mono" : ""} ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

export function TableEmptyState({
  colSpan = 1,
  message = "No records found matching your criteria.",
  icon = null,
  className = "",
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={`ui-table-empty-cell ${className}`}>
        <div className="ui-table-empty-content">
          {icon && <div className="ui-table-empty-icon">{icon}</div>}
          <p>{message}</p>
        </div>
      </td>
    </tr>
  );
}

export function TableLoadingState({ colSpan = 1, message = "Loading data..." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="ui-table-loading-cell">
        <div className="ui-table-loading-content">
          <span className="ui-table-spinner" />
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}
