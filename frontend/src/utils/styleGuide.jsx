// src/utils/styleGuide.jsx

/**
 * Standardized status and role pill CSS classes across Student CRM
 * Distinct color coding for each operational role:
 * - Admin: Danger / Crimson Red
 * - Analyst: Purple / Violet
 * - Advisor: Success / Emerald Green
 * - Faculty: Info / Brand Blue
 * - Viewer: Warning / Warm Amber
 */
export const rolePillsStatusStyle = {
  Admin: "status-pill status-pill-danger",
  admin: "status-pill status-pill-danger",
  Analyst: "status-pill status-pill-purple",
  analyst: "status-pill status-pill-purple",
  Advisor: "status-pill status-pill-success",
  advisor: "status-pill status-pill-success",
  Faculty: "status-pill status-pill-info",
  faculty: "status-pill status-pill-info",
  Viewer: "status-pill status-pill-warning",
  viewer: "status-pill status-pill-warning",
};

/**
 * Semantic variant mapping for UI component props (e.g. StatusPill variant)
 */
export const roleVariantMap = {
  Admin: "danger",
  admin: "danger",
  Analyst: "purple",
  analyst: "purple",
  Advisor: "success",
  advisor: "success",
  Faculty: "info",
  faculty: "info",
  Viewer: "warning",
  viewer: "warning",
};

/**
 * Helper to get the CSS class for any role string safely
 * @param {string} role 
 * @returns {string} CSS classes for the role pill
 */
export const getRolePillClass = (role) => {
  if (!role || typeof role !== "string") {
    return "status-pill status-pill-warning";
  }
  const normalized = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  return rolePillsStatusStyle[normalized] || "status-pill status-pill-warning";
};
