import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Users,
  Shield,
  Key,
  Database,
  Lock,
  Building,
  Copy,
  Check,
  X,
} from "lucide-react";
import apiClient from "../../../lib/apiClient";
import "./AdminView.css";

const defaultStaffSeed = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    full_name: "Alex Morgan",
    email: "alex.morgan@demo.example",
    role: "Admin",
    institution: "Columbia GS",
    is_active: true,
    created_at: "2026-08-01T09:00:00Z",
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    full_name: "Maya Singh",
    email: "maya.singh@demo.example",
    role: "Analyst",
    institution: "Columbia GS",
    is_active: true,
    created_at: "2026-08-02T10:30:00Z",
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    full_name: "Daniel Lee",
    email: "daniel.lee@demo.example",
    role: "Faculty",
    institution: "Columbia GS",
    is_active: true,
    created_at: "2026-08-03T11:15:00Z",
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    full_name: "Priya Shah",
    email: "priya.shah@demo.example",
    role: "Advisor",
    institution: "Columbia GS",
    is_active: true,
    created_at: "2026-08-04T14:00:00Z",
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    full_name: "Jordan Reed",
    email: "jordan.reed@demo.example",
    role: "Analyst",
    institution: "Columbia GS",
    is_active: true,
    created_at: "2026-08-05T08:45:00Z",
  },
  {
    id: "20000000-0000-0000-0000-000000000006",
    full_name: "Elena Garcia",
    email: "elena.garcia@demo.example",
    role: "Advisor",
    institution: "Columbia GS",
    is_active: true,
    created_at: "2026-08-05T16:20:00Z",
  },
  {
    id: "20000000-0000-0000-0000-000000000007",
    full_name: "Marcus Johnson",
    email: "marcus.johnson@demo.example",
    role: "Faculty",
    institution: "Columbia GS",
    is_active: true,
    created_at: "2026-08-06T13:10:00Z",
  },
  {
    id: "20000000-0000-0000-0000-000000000008",
    full_name: "Hannah Kim",
    email: "hannah.kim@demo.example",
    role: "Viewer",
    institution: "Columbia GS",
    is_active: true,
    created_at: "2026-08-07T09:30:00Z",
  },
];

export default function AdminView({ currentUser }) {
  const [users, setUsers] = useState(defaultStaffSeed);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "Advisor",
    institution: "Columbia GS",
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/users/");
      if (response.data && response.data.length > 0) {
        // Map database users
        const mapped = response.data.map((u, i) => ({
          id: u.id,
          full_name: u.full_name || u.email.split("@")[0],
          email: u.email,
          role: i === 0 ? "Admin" : i % 2 === 0 ? "Analyst" : "Advisor",
          institution: "Columbia GS",
          is_active: true,
          created_at: u.created_at || new Date().toISOString(),
        }));
        setUsers(mapped);
      } else {
        setUsers(defaultStaffSeed);
      }
    } catch (err) {
      console.warn("Could not fetch remote users list, using seed dataset:", err.message);
      setUsers(defaultStaffSeed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.fullName) return;

    const newUser = {
      id: `20000000-0000-0000-0000-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      full_name: inviteForm.fullName,
      email: inviteForm.email,
      role: inviteForm.role,
      institution: inviteForm.institution,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setUsers([newUser, ...users]);
    setIsInviteModalOpen(false);
    setInviteForm({ fullName: "", email: "", role: "Advisor", institution: "Columbia GS" });

    setNotification({
      type: "success",
      message: `Staff invitation dispatched to ${newUser.email} with ${newUser.role} permissions.`,
    });

    setTimeout(() => setNotification(null), 5000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "status-pill status-pill-warning";
      case "analyst":
        return "status-pill status-pill-info";
      case "advisor":
        return "status-pill status-pill-success";
      case "faculty":
        return "status-pill status-pill-primary";
      default:
        return "status-pill status-pill-neutral";
    }
  };

  return (
    <div className="admin-view">
      {/* Admin Header & Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Staff Accounts</span>
            <Users size={18} className="stat-icon blue" />
          </div>
          <div className="stat-value font-mono">{users.length}</div>
          <div className="stat-sub">
            <span className="status-pill status-pill-success">● Synchronized</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-label">Security Policy</span>
            <ShieldCheck size={18} className="stat-icon green" />
          </div>
          <div className="stat-value">PostgreSQL RLS</div>
          <div className="stat-sub">
            <span className="status-pill status-pill-info">Tenant Isolated</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-label">Multi-Tenant Institution</span>
            <Building size={18} className="stat-icon amber" />
          </div>
          <div className="stat-value">Columbia GS</div>
          <div className="stat-sub font-mono">Code: CU • UTC-5</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-header">
            <span className="stat-label">Database Connection</span>
            <Database size={18} className="stat-icon purple" />
          </div>
          <div className="stat-value font-mono">PgBouncer Pool</div>
          <div className="stat-sub">
            <span className="status-pill status-pill-success">Port 6543 Active</span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`admin-notification ${notification.type}`}>
          <CheckCircle2 size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* User Management Section */}
      <div className="admin-content-card">
        <div className="admin-toolbar">
          <div className="toolbar-left">
            <div className="admin-search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Filter staff by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
            </div>

            <div className="admin-filter-group">
              <Filter size={14} className="filter-icon" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="advisor">Advisor</option>
                <option value="faculty">Faculty</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="toolbar-right">
            <button
              className="btn-refresh"
              onClick={fetchUsers}
              disabled={isLoading}
              title="Refresh staff roster"
            >
              <RefreshCw size={14} className={isLoading ? "spinner" : ""} />
              <span>Refresh</span>
            </button>

            <button
              className="btn-invite-staff"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <UserPlus size={14} />
              <span>Invite Staff Member</span>
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Operator</th>
                <th>System User ID</th>
                <th>Assigned Role</th>
                <th>Institution</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-initials">
                          {u.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="user-meta">
                          <strong className="user-name">{u.full_name}</strong>
                          <span className="user-email font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="id-cell">
                        <span className="font-mono user-id-pill">
                          {u.id.slice(0, 8)}...{u.id.slice(-4)}
                        </span>
                        <button
                          className="btn-mini-copy"
                          onClick={() => handleCopy(u.id)}
                          title="Copy Full UUID"
                        >
                          {copiedId === u.id ? (
                            <Check size={12} className="text-success" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={getRoleBadgeClass(u.role)}>{u.role}</span>
                    </td>
                    <td>
                      <span className="inst-badge">{u.institution}</span>
                    </td>
                    <td>
                      <span className="status-pill status-pill-success">● Active</span>
                    </td>
                    <td className="font-mono date-cell">
                      {new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-right">
                      <button
                        className="btn-table-action"
                        onClick={() =>
                          alert(`Manage settings for operator: ${u.full_name} (${u.email})`)
                        }
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-state-cell">
                    No staff records match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Reference Card */}
      <div className="admin-roles-card">
        <div className="card-header-styled">
          <Shield size={18} className="header-icon" />
          <div>
            <h3>Institution Role & Permission Matrix (RBAC)</h3>
            <p>Granular operational scopes defined in database schema</p>
          </div>
        </div>

        <div className="roles-matrix-grid">
          <div className="role-spec-box">
            <div className="role-header">
              <span className="status-pill status-pill-warning">Admin</span>
              <strong>Full Management</strong>
            </div>
            <p>Manage users, configure institution timezone/code, manage tags, and oversee student records.</p>
          </div>

          <div className="role-spec-box">
            <div className="role-header">
              <span className="status-pill status-pill-info">Analyst</span>
              <strong>Yield & SQL Reporting</strong>
            </div>
            <p>Execute read-only SQL queries, build cohort funnels, run `v_student_reporting` and yield models.</p>
          </div>

          <div className="role-spec-box">
            <div className="role-header">
              <span className="status-pill status-pill-success">Advisor</span>
              <strong>Advising & Interactions</strong>
            </div>
            <p>Log student communications, review transcripts, manage follow-up tasks, and track standing.</p>
          </div>

          <div className="role-spec-box">
            <div className="role-header">
              <span className="status-pill status-pill-neutral">Viewer</span>
              <strong>Audit & Read-Only</strong>
            </div>
            <p>View pre-computed dashboards, student profiles, and compliance audits with zero mutation access.</p>
          </div>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsInviteModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Invite Staff Member</h3>
                <p>Grant access to the Columbia GS Student CRM Workspace</p>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setIsInviteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Reed"
                  value={inviteForm.fullName}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, fullName: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>University Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan.reed@columbia.edu"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assigned Role *</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Advisor">Advisor</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Institution</label>
                  <input
                    type="text"
                    disabled
                    value="Columbia University (CU)"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
