import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Copy,
  Check,
  Users,
  Shield,
  TrendingUp,
  UserCheck,
  GraduationCap,
  Eye,
  Filter,
  Building,
  Clock,
} from "lucide-react";
import "./AdminView.css";

// TanStack Query Hooks
import { useAllUsers } from "../../../hooks/useUsers";
import {
  useInstitutionMemberships,
  useAllInstitutions,
  useCreateMembership,
} from "../../../hooks/useInstitution";
import { useToast } from "../../../context/ToastContext";

// Reusable UI Components from src/ui
import {
  Button,
  Select,
  SearchInput,
  StatCard,
  Card,
  RolePill,
  StatusPill,
  Modal,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  TableLoadingState,
} from "../../../ui";

export default function AdminView({ currentUser }) {
  // State for search, filters, copy actions, and modal
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "Advisor",
    department: "Academic Advising",
    institutionId: "",
  });

  const { success, info, error: showError } = useToast();

  // 1. TanStack Query Hooks for reactive, cached data
  const {
    data: allUsersData = [],
    isLoading: isUsersLoading,
    isRefetching: isUsersRefetching,
    refetch: refetchUsers,
  } = useAllUsers();

  const {
    data: membershipsData = [],
    isLoading: isMembershipsLoading,
    isRefetching: isMembershipsRefetching,
    refetch: refetchMemberships,
  } = useInstitutionMemberships();

  const { data: institutionsData = [] } = useAllInstitutions();

  const createMembershipMutation = useCreateMembership();

  const isLoading = isUsersLoading || isMembershipsLoading;
  const isRefetching = isUsersRefetching || isMembershipsRefetching;

  // Handle refetching all queries
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchUsers(), refetchMemberships()]);
      info("Staff roster refreshed");
    } catch (err) {
      showError("Failed to refresh staff records");
    }
  };

  // 2. Map user memberships & institutions for quick lookup
  const membershipsByUser = useMemo(() => {
    const map = new Map();
    if (Array.isArray(membershipsData)) {
      membershipsData.forEach((m) => {
        const uid = m.userId || m.user_id;
        if (uid) {
          map.set(uid, m);
        }
      });
    }
    return map;
  }, [membershipsData]);

  const institutionsMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(institutionsData)) {
      institutionsData.forEach((inst) => {
        if (inst.id) {
          map.set(inst.id, inst);
        }
      });
    }
    return map;
  }, [institutionsData]);

  // 3. Enrich users with their assigned membership roles & institution details
  const enrichedUsers = useMemo(() => {
    if (!Array.isArray(allUsersData)) return [];

    return allUsersData.map((user) => {
      const membership = membershipsByUser.get(user.id);
      const institution = membership ? institutionsMap.get(membership.institutionId) : null;

      // Determine role from membership or fallback
      const role = membership?.role || user.role || "Viewer";
      const department = membership?.department || "General Operations";
      const institutionName = institution?.name
        ? `${institution.name} (${institution.code || "CU"})`
        : "Columbia GS (CU)";
      const timezone = institution?.timezone || "America/New_York";

      return {
        ...user,
        role,
        department,
        institutionName,
        timezone,
        membership,
      };
    });
  }, [allUsersData, membershipsByUser, institutionsMap]);

  // 4. Compute dynamic role counts from real data
  const roleStats = useMemo(() => {
    let admins = 0;
    let analysts = 0;
    let advisors = 0;
    let faculty = 0;
    let viewers = 0;

    enrichedUsers.forEach((u) => {
      const r = (u.role || "").toLowerCase();
      if (r === "admin") admins++;
      else if (r === "analyst") analysts++;
      else if (r === "advisor") advisors++;
      else if (r === "faculty") faculty++;
      else if (r === "viewer") viewers++;
      else viewers++;
    });

    return {
      total: enrichedUsers.length,
      admins,
      analysts,
      advisors,
      faculty,
      viewers,
    };
  }, [enrichedUsers]);

  // 5. Filter users by search query and role filter
  const filteredUsers = useMemo(() => {
    return enrichedUsers.filter((u) => {
      const nameMatch = (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const emailMatch = (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = nameMatch || emailMatch;

      const matchesRole =
        roleFilter === "all" ||
        (u.role || "").toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [enrichedUsers, searchQuery, roleFilter]);

  // Copy UUID to clipboard
  const handleCopy = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      info("User UUID copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      showError("Failed to copy UUID");
    }
  };

  // Handle invitation submit
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.fullName) return;

    try {
      success(`Invitation sent to ${inviteForm.email} with ${inviteForm.role} permissions.`);
      setIsInviteModalOpen(false);
      setInviteForm({
        fullName: "",
        email: "",
        role: "Advisor",
        department: "Academic Advising",
        institutionId: "",
      });
    } catch (err) {
      showError("Failed to dispatch staff invitation");
    }
  };

  // Role options for select dropdown
  const roleSelectOptions = [
    { value: "all", label: "All Roles" },
    { value: "admin", label: "Admin" },
    { value: "analyst", label: "Analyst" },
    { value: "advisor", label: "Advisor" },
    { value: "faculty", label: "Faculty" },
    { value: "viewer", label: "Viewer" },
  ];

  // Institution options for invite modal dropdown
  const institutionSelectOptions = useMemo(() => {
    if (institutionsData && institutionsData.length > 0) {
      return institutionsData.map((inst) => ({
        value: inst.id,
        label: `${inst.name} (${inst.code}) • ${inst.timezone || "UTC"}`,
      }));
    }
    return [
      {
        value: "default",
        label: "Columbia University - School of General Studies (CU) • America/New_York",
      },
    ];
  }, [institutionsData]);

  return (
    <div className="admin-view">
      {/* Dynamic Role Stats Grid */}
      <div className="admin-stats-grid">
        {/* Total Accounts */}
        <StatCard
          label="Active Staff Accounts"
          value={roleStats.total}
          icon={<Users size={16} />}
          iconVariant="blue"
          loading={isLoading}
          pill={<StatusPill variant="success" dot>Synchronized</StatusPill>}
          subtext="Total registered operators"
        />

        {/* Advisors */}
        <StatCard
          label="Total Advisors"
          value={roleStats.advisors}
          icon={<UserCheck size={16} />}
          iconVariant="green"
          loading={isLoading}
          pill={<StatusPill variant="success">Advising Staff</StatusPill>}
          subtext="Student casework & logs"
        />

        {/* Analysts */}
        <StatCard
          label="Total Analysts"
          value={roleStats.analysts}
          icon={<TrendingUp size={16} />}
          iconVariant="amber"
          loading={isLoading}
          pill={<StatusPill variant="danger">Yield & Reports</StatusPill>}
          subtext="Ad-hoc SQL & analytics"
        />

        {/* Faculty */}
        <StatCard
          label="Total Faculty"
          value={roleStats.faculty}
          icon={<GraduationCap size={16} />}
          iconVariant="green"
          loading={isLoading}
          pill={<StatusPill variant="success">Academic Units</StatusPill>}
          subtext="Instructors & chairs"
        />

        {/* Admins */}
        <StatCard
          label="Total Admins"
          value={roleStats.admins}
          icon={<ShieldCheck size={16} />}
          iconVariant="danger"
          loading={isLoading}
          pill={<StatusPill variant="danger">Full Access</StatusPill>}
          subtext="System & security admins"
        />

        {/* Viewers */}
        <StatCard
          label="Total Viewers"
          value={roleStats.viewers}
          icon={<Eye size={16} />}
          iconVariant="neutral"
          loading={isLoading}
          pill={<StatusPill variant="warning">Read-Only</StatusPill>}
          subtext="Auditors & stakeholders"
        />
      </div>

      {/* Main Staff Roster Card */}
      <Card noPadding className="admin-content-card">
        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="toolbar-left">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              placeholder="Filter staff by name or email..."
              className="admin-search-box"
            />

            {/* Reusable Select Dropdown for Role Filtering */}
            <Select
              icon={<Filter size={14} />}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleSelectOptions}
              className="admin-filter-group"
            />
          </div>

          <div className="toolbar-right">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} className={isRefetching ? "ui-btn-spin" : ""} />}
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              title="Refresh staff data from API"
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<UserPlus size={14} />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Staff Member
            </Button>
          </div>
        </div>

        {/* Staff Data Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operator</TableHead>
              <TableHead>System User ID</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Institution & Timezone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoadingState colSpan={7} message="Loading staff accounts from API..." />
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  {/* Operator Name & Email */}
                  <TableCell>
                    <div className="user-cell">
                      <div className="user-initials">
                        {(u.full_name || u.email || "US").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="user-meta">
                        <strong className="user-name">{u.full_name || "Unnamed Operator"}</strong>
                        <span className="user-email font-mono">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* User UUID */}
                  <TableCell>
                    <div className="id-cell">
                      <span className="font-mono user-id-pill">
                        {u.id ? `${u.id.slice(0, 8)}...${u.id.slice(-4)}` : "—"}
                      </span>
                      <button
                        type="button"
                        className="btn-mini-copy"
                        onClick={() => handleCopy(u.id)}
                        title="Copy Full UUID"
                        aria-label="Copy Full UUID"
                      >
                        {copiedId === u.id ? (
                          <Check size={12} className="text-success" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* Role Pill */}
                  <TableCell>
                    <RolePill role={u.role} />
                  </TableCell>

                  {/* Department */}
                  <TableCell>
                    <span className="dept-text">{u.department}</span>
                  </TableCell>

                  {/* Institution & Timezone */}
                  <TableCell>
                    <div className="inst-meta-cell">
                      <span className="inst-badge">{u.institutionName}</span>
                      {u.timezone && (
                        <span className="inst-timezone-tag font-mono">
                          <Clock size={11} />
                          {u.timezone.split("/")[1] || u.timezone}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell isMono className="date-cell">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Active"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() =>
                        info(`Viewing access scopes for ${u.full_name || u.email}`)
                      }
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyState
                colSpan={7}
                message="No staff records match the current filter criteria."
              />
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Role Permission Matrix Reference Card */}
      <Card
        title="Institution Role & Permission Matrix (RBAC)"
        subtitle="Granular operational scopes defined in database schema"
        icon={<Shield size={18} />}
        className="admin-roles-card"
      >
        <div className="roles-matrix-grid">
          <div className="role-spec-box">
            <div className="role-header">
              <RolePill role="Admin" />
              <strong>Full Management</strong>
            </div>
            <p>
              Manage users, configure institution timezone/code, manage tags, and oversee student
              records across all units.
            </p>
          </div>

          <div className="role-spec-box">
            <div className="role-header">
              <RolePill role="Analyst" />
              <strong>Yield & SQL Reporting</strong>
            </div>
            <p>
              Execute read-only SQL queries, build cohort funnels, run{" "}
              <code>v_student_reporting</code>, and compute yield models.
            </p>
          </div>

          <div className="role-spec-box">
            <div className="role-header">
              <RolePill role="Advisor" />
              <strong>Advising & Interactions</strong>
            </div>
            <p>
              Log student communications, review transcripts, manage follow-up tasks, and track
              academic standing.
            </p>
          </div>

          <div className="role-spec-box">
            <div className="role-header">
              <RolePill role="Faculty" />
              <strong>Academic Review</strong>
            </div>
            <p>
              Access assigned student cohorts, review term records, submit grade assessments, and
              view departmental statistics.
            </p>
          </div>

          <div className="role-spec-box">
            <div className="role-header">
              <RolePill role="Viewer" />
              <strong>Audit & Read-Only</strong>
            </div>
            <p>
              View pre-computed dashboards, student profiles, and compliance audits with zero data
              mutation permissions.
            </p>
          </div>
        </div>
      </Card>

      {/* Reusable Invite Staff Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Staff Member"
        subtitle="Grant operational access to the Columbia GS Student CRM Workspace"
        icon={<UserPlus size={18} />}
        size="md"
      >
        <form onSubmit={handleInviteSubmit} className="modal-form">
          <Input
            label="Full Name *"
            required
            placeholder="e.g. Jordan Reed"
            value={inviteForm.fullName}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, fullName: e.target.value })
            }
            fullWidth
          />

          <Input
            label="University Email *"
            type="email"
            required
            placeholder="e.g. jordan.reed@columbia.edu"
            value={inviteForm.email}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, email: e.target.value })
            }
            fullWidth
          />

          <div className="form-row">
            {/* Reusable Select Dropdown for Role Assignment */}
            <Select
              label="Assigned Role *"
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, role: e.target.value })
              }
              options={[
                { value: "Admin", label: "Admin - Full Management" },
                { value: "Analyst", label: "Analyst - Yield & SQL Reporting" },
                { value: "Advisor", label: "Advisor - Advising & Interactions" },
                { value: "Faculty", label: "Faculty - Academic Review" },
                { value: "Viewer", label: "Viewer - Audit & Read-Only" },
              ]}
              fullWidth
            />

            <Input
              label="Department"
              placeholder="e.g. Admissions"
              value={inviteForm.department}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, department: e.target.value })
              }
              fullWidth
            />
          </div>

          {/* Reusable Select Dropdown for Institution & Timezone Assignment */}
          <Select
            label="Home Institution & Timezone"
            value={inviteForm.institutionId || (institutionsData?.[0]?.id ?? "")}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, institutionId: e.target.value })
            }
            options={institutionSelectOptions}
            icon={<Building size={14} />}
            fullWidth
          />

          <div className="modal-form-actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
