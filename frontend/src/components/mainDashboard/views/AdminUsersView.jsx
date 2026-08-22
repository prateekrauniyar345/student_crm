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
  Lock,
  Save,
} from "lucide-react";
import "./AdminUsersView.css";

// TanStack Query Hooks
import { useAllUsers, useUpdateUser } from "../../../hooks/useUsers";
import {
  useInstitutionMemberships,
  useAllInstitutions,
  useUpdateMembership,
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

export default function AdminUsersView({ currentUser }) {
  // State for search, filters, copy actions, and modals
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "Advisor",
    department: "Academic Advising",
    institutionId: "",
  });

  // Manage User Modal State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSavingManage, setIsSavingManage] = useState(false);
  const [manageForm, setManageForm] = useState({
    userId: "",
    fullName: "",
    preferredFirstName: "",
    email: "",
    phoneNumber: "",
    role: "Advisor",
    department: "Academic Advising",
    institutionId: "",
    institutionName: "",
    userTimezone: "America/New_York",
    original: {
      fullName: "",
      preferredFirstName: "",
      phoneNumber: "",
      role: "Advisor",
      department: "Academic Advising",
      userTimezone: "America/New_York",
    },
  });

  // Toast for notifications
  const { success, info, error: showError } = useToast();

  // Getting all users
  const {
    data: allUsersData = [],
    isLoading: isUsersLoading,
    isRefetching: isUsersRefetching,
    refetch: refetchUsers,
  } = useAllUsers();

  // Get all memberships and institutions
  const {
    data: membershipsData = [],
    isLoading: isMembershipsLoading,
    isRefetching: isMembershipsRefetching,
    refetch: refetchMemberships,
  } = useInstitutionMemberships();

  // Get all institutions 
  const { data: institutionsData = [] } = useAllInstitutions();

  // Mutations for updating users, memberships, and institutions
  const updateUserMutation = useUpdateUser();
  const updateMembershipMutation = useUpdateMembership();
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

  // Map user memberships & institutions for quick lookup
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

  // Aggregate Stats Calculations
  const stats = useMemo(() => {
    const users = Array.isArray(allUsersData) ? allUsersData : [];
    const totalStaff = users.length;
    const activeStaff = users.filter((u) => u.is_active !== false).length;

    let adminCount = 0;
    let analystCount = 0;
    let advisorCount = 0;
    let facultyCount = 0;
    let viewerCount = 0;

    users.forEach((user) => {
      const membership = membershipsByUser.get(user.id);
      const role = membership?.role || "Viewer";
      if (role === "Admin") adminCount++;
      else if (role === "Analyst") analystCount++;
      else if (role === "Advisor") advisorCount++;
      else if (role === "Faculty") facultyCount++;
      else viewerCount++;
    });

    return {
      totalStaff,
      activeStaff,
      adminCount,
      analystCount,
      advisorCount,
      facultyCount,
      viewerCount,
    };
  }, [allUsersData, membershipsByUser]);

  // Filter Users by Search & Role
  const filteredUsers = useMemo(() => {
    const users = Array.isArray(allUsersData) ? allUsersData : [];
    return users.filter((user) => {
      const membership = membershipsByUser.get(user.id);
      const role = membership?.role || "Viewer";

      // Filter by role
      if (roleFilter !== "All" && role !== roleFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const fullName = (user.full_name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const department = (membership?.department || "").toLowerCase();
        const id = (user.id || "").toLowerCase();
        return (
          fullName.includes(q) ||
          email.includes(q) ||
          department.includes(q) ||
          id.includes(q)
        );
      }

      return true;
    });
  }, [allUsersData, membershipsByUser, roleFilter, searchQuery]);

  // Copy User ID Helper
  const handleCopyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      info("User ID copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      showError("Failed to copy ID");
    }
  };

  // Open Manage Modal
  const handleOpenManageModal = (user) => {
    const membership = membershipsByUser.get(user.id);
    const institution = institutionsMap.get(membership?.institutionId || membership?.institution_id);

    setSelectedUser(user);
    setManageForm({
      userId: user.id,
      fullName: user.full_name || "",
      preferredFirstName: user.preferred_first_name || "",
      email: user.email || "",
      phoneNumber: user.phone_number || "",
      role: membership?.role || "Viewer",
      department: membership?.department || "",
      institutionId: membership?.institutionId || membership?.institution_id || (institutionsData[0]?.id || ""),
      institutionName: institution?.name || "Columbia University",
      userTimezone: user.user_timezone || "America/New_York",
      original: {
        fullName: user.full_name || "",
        preferredFirstName: user.preferred_first_name || "",
        phoneNumber: user.phone_number || "",
        role: membership?.role || "Viewer",
        department: membership?.department || "",
        userTimezone: user.user_timezone || "America/New_York",
      },
    });
    setIsManageModalOpen(true);
  };

  // Save Manage User Changes
  const handleSaveManageUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSavingManage(true);
    try {
      const userUpdates = {};
      let hasUserUpdates = false;

      if (manageForm.fullName !== manageForm.original.fullName) {
        userUpdates.full_name = manageForm.fullName.trim();
        hasUserUpdates = true;
      }
      if (manageForm.preferredFirstName !== manageForm.original.preferredFirstName) {
        userUpdates.preferred_first_name = manageForm.preferredFirstName.trim() || null;
        hasUserUpdates = true;
      }
      if (manageForm.phoneNumber !== manageForm.original.phoneNumber) {
        userUpdates.phone_number = manageForm.phoneNumber.trim() || null;
        hasUserUpdates = true;
      }
      if (manageForm.userTimezone !== manageForm.original.userTimezone) {
        userUpdates.user_timezone = manageForm.userTimezone;
        hasUserUpdates = true;
      }

      if (hasUserUpdates) {
        await updateUserMutation.mutateAsync({
          userId: selectedUser.id,
          updatePayload: userUpdates,
        });
      }

      const membership = membershipsByUser.get(selectedUser.id);
      const targetInstitutionId = manageForm.institutionId || membership?.institutionId || institutionsData[0]?.id;

      if (membership && targetInstitutionId) {
        const membershipUpdates = {};
        let hasMembershipUpdates = false;

        if (manageForm.role !== manageForm.original.role) {
          membershipUpdates.role = manageForm.role;
          hasMembershipUpdates = true;
        }
        if (manageForm.department !== manageForm.original.department) {
          membershipUpdates.department = manageForm.department.trim() || null;
          hasMembershipUpdates = true;
        }

        if (hasMembershipUpdates) {
          await updateMembershipMutation.mutateAsync({
            institutionId: targetInstitutionId,
            userId: selectedUser.id,
            data: membershipUpdates,
          });
        }
      }

      setIsManageModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to update staff member";
      showError(msg);
    } finally {
      setIsSavingManage(false);
    }
  };

  // Helper for Initials
  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "ST";
  };

  return (
    <div className="admin-view">
      {/* Top Header Card */}
      <div className="admin-users-header-card">
        <div className="admin-users-header-top">
          <div className="admin-users-header-titles">
            <div className="admin-users-badge-row">
              <span className="status-pill status-pill-info">
                <Users size={13} />
              </span>
              <h2>Staff & User Access Management</h2>
            </div>
            <p>
              Manage user accounts, assign institutional roles (Admin, Analyst, Advisor, Faculty, Viewer), and control operational permissions across your institution.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Responsive Stat Cards */}
      <div className="admin-stats-grid">
        <StatCard
          label="Total Staff"
          value={stats.totalStaff}
          icon={<Users size={18} />}
          iconVariant="blue"
          subtext={`${stats.activeStaff} Active Staff`}
          pill={<StatusPill variant="success">● Active</StatusPill>}
          loading={isLoading}
        />
        <StatCard
          label="Admins"
          value={stats.adminCount}
          icon={<ShieldCheck size={18} />}
          iconVariant="danger"
          subtext="Full System Access"
          pill={<RolePill role="Admin" />}
          loading={isLoading}
        />
        <StatCard
          label="Analysts"
          value={stats.analystCount}
          icon={<TrendingUp size={18} />}
          iconVariant="purple"
          subtext="SQL Query & Reports"
          pill={<RolePill role="Analyst" />}
          loading={isLoading}
        />
        <StatCard
          label="Advisors"
          value={stats.advisorCount}
          icon={<UserCheck size={18} />}
          iconVariant="green"
          subtext="Student Interactions"
          pill={<RolePill role="Advisor" />}
          loading={isLoading}
        />
        <StatCard
          label="Faculty"
          value={stats.facultyCount}
          icon={<GraduationCap size={18} />}
          iconVariant="blue"
          subtext="Academic Read-Only"
          pill={<RolePill role="Faculty" />}
          loading={isLoading}
        />
        <StatCard
          label="Viewers"
          value={stats.viewerCount}
          icon={<Eye size={18} />}
          iconVariant="amber"
          subtext="Basic Read Access"
          pill={<RolePill role="Viewer" />}
          loading={isLoading}
        />
      </div>

      {/* Main Staff Table Card */}
      <Card
        title="Staff & Operator Directory"
        subtitle="Manage CRM user accounts, institutional memberships, and operational access levels"
        icon={<ShieldCheck size={18} />}
        noPadding={true}
        className="admin-content-card"
        headerAction={
          <div className="admin-header-badge">
            <span className="font-mono">{filteredUsers.length}</span> staff members
          </div>
        }
      >
        {/* Table Toolbar */}
        <div className="admin-toolbar">
          <div className="toolbar-left">
            <div className="admin-search-box">
              <SearchInput
                placeholder="Search staff by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
                size="sm"
                fullWidth={true}
              />
            </div>

            <div className="admin-filter-group">
              <Select
                size="sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: "All", label: "All Roles" },
                  { value: "Admin", label: "Admin" },
                  { value: "Analyst", label: "Analyst" },
                  { value: "Advisor", label: "Advisor" },
                  { value: "Faculty", label: "Faculty" },
                  { value: "Viewer", label: "Viewer" },
                ]}
              />
            </div>
          </div>

          <div className="toolbar-right">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} className={isRefetching ? "spin-icon" : ""} />}
              onClick={handleRefresh}
              loading={isRefetching}
              title="Refresh staff roster"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<UserPlus size={15} />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Staff
            </Button>
          </div>
        </div>

        {/* Staff Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User / Email</TableHead>
              <TableHead>System ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableLoadingState colSpan={7} message="Loading staff directory..." />
            ) : filteredUsers.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                message={
                  searchQuery || roleFilter !== "All"
                    ? "No staff members found matching your search criteria."
                    : "No staff records registered in this institution."
                }
                icon={<Users size={20} />}
              />
            ) : (
              filteredUsers.map((user) => {
                const membership = membershipsByUser.get(user.id);
                const role = membership?.role || "Viewer";
                const department = membership?.department || "General Administration";
                const institution = institutionsMap.get(
                  membership?.institutionId || membership?.institution_id
                );
                const institutionName = institution?.code || institution?.name || "CU";
                const isActive = user.is_active !== false;

                return (
                  <TableRow key={user.id}>
                    {/* User / Email */}
                    <TableCell>
                      <div className="user-cell">
                        <div className="user-initials">
                          {getInitials(user.full_name, user.email)}
                        </div>
                        <div className="user-meta">
                          <span className="user-name">
                            {user.full_name || "Unnamed Staff Member"}
                            {user.preferred_first_name && (
                              <span className="user-preferred">
                                ({user.preferred_first_name})
                              </span>
                            )}
                          </span>
                          <span className="user-email">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* System ID */}
                    <TableCell isMono={true}>
                      <div className="id-cell">
                        <span className="id-text" title={user.id}>
                          {user.id ? `${user.id.slice(0, 8)}...` : "—"}
                        </span>
                        {user.id && (
                          <button
                            type="button"
                            className="id-copy-btn"
                            onClick={() => handleCopyId(user.id)}
                            title="Copy UUID"
                            aria-label="Copy User ID"
                          >
                            {copiedId === user.id ? (
                              <Check size={12} className="copy-success" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        )}
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <RolePill role={role} />
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <span className="department-text">{department}</span>
                    </TableCell>

                    {/* Institution */}
                    <TableCell>
                      <span className="institution-badge">{institutionName}</span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {isActive ? (
                        <StatusPill variant="success" dot={true}>
                          Active
                        </StatusPill>
                      ) : (
                        <StatusPill variant="neutral" dot={true}>
                          Inactive
                        </StatusPill>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleOpenManageModal(user)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Invite Staff Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Staff Member"
        subtitle="Grant CRM access to an advising officer, data analyst, or faculty member"
        icon={<UserPlus size={18} />}
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            info("Invitation link generated and dispatched to staff email.");
            setIsInviteModalOpen(false);
          }}
          className="admin-modal-form"
        >
          <Input
            label="Full Legal Name"
            placeholder="e.g. Eleanor Vance"
            value={inviteForm.fullName}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, fullName: e.target.value })
            }
            required
            fullWidth
          />

          <Input
            label="Enterprise Email Address"
            type="email"
            placeholder="e.g. evance@columbia.edu"
            value={inviteForm.email}
            onChange={(e) =>
              setInviteForm({ ...inviteForm, email: e.target.value })
            }
            required
            fullWidth
          />

          <div className="form-row-2">
            <Select
              label="Assigned Role"
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, role: e.target.value })
              }
              options={[
                { value: "Advisor", label: "Advisor (Interactions & Tasks)" },
                { value: "Analyst", label: "Analyst (SQL Queries & Reports)" },
                { value: "Faculty", label: "Faculty (Academic Read-Only)" },
                { value: "Admin", label: "Admin (Full System Control)" },
                { value: "Viewer", label: "Viewer (Read-Only Portal)" },
              ]}
              fullWidth
            />

            <Input
              label="Department / Unit"
              placeholder="e.g. Academic Advising"
              value={inviteForm.department}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, department: e.target.value })
              }
              fullWidth
            />
          </div>

          <div className="modal-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<UserPlus size={15} />}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage User Modal */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Manage Staff Member"
        subtitle={`Configure permissions and profile details for ${selectedUser?.full_name || selectedUser?.email || "User"}`}
        icon={<ShieldCheck size={18} />}
        size="lg"
      >
        <form onSubmit={handleSaveManageUser} className="admin-modal-form">
          <div className="manage-user-header-info">
            <div className="manage-user-avatar">
              {getInitials(manageForm.fullName, manageForm.email)}
            </div>
            <div className="manage-user-meta">
              <h4>{manageForm.fullName || "Staff Member"}</h4>
              <span className="manage-email font-mono">{manageForm.email}</span>
              <span className="manage-uuid font-mono">ID: {manageForm.userId}</span>
            </div>
          </div>

          <div className="form-row-2">
            <Input
              label="Full Name"
              value={manageForm.fullName}
              onChange={(e) =>
                setManageForm({ ...manageForm, fullName: e.target.value })
              }
              required
              fullWidth
            />

            <Input
              label="Preferred First Name"
              placeholder="Optional nickname"
              value={manageForm.preferredFirstName}
              onChange={(e) =>
                setManageForm({
                  ...manageForm,
                  preferredFirstName: e.target.value,
                })
              }
              fullWidth
            />
          </div>

          <div className="form-row-2">
            <Input
              label="Phone Number"
              placeholder="e.g. +1 (212) 555-0199"
              value={manageForm.phoneNumber}
              onChange={(e) =>
                setManageForm({ ...manageForm, phoneNumber: e.target.value })
              }
              fullWidth
            />

            <Select
              label="User Timezone"
              value={manageForm.userTimezone}
              onChange={(e) =>
                setManageForm({ ...manageForm, userTimezone: e.target.value })
              }
              options={[
                { value: "America/New_York", label: "Eastern (America/New_York)" },
                { value: "America/Chicago", label: "Central (America/Chicago)" },
                { value: "America/Denver", label: "Mountain (America/Denver)" },
                { value: "America/Los_Angeles", label: "Pacific (America/Los_Angeles)" },
                { value: "America/Anchorage", label: "Alaska (America/Anchorage)" },
                { value: "America/Phoenix", label: "Arizona (America/Phoenix)" },
                { value: "Pacific/Honolulu", label: "Hawaii (Pacific/Honolulu)" },
              ]}
              fullWidth
            />
          </div>

          <div className="manage-section-divider">
            <span>Membership & Permissions</span>
          </div>

          <div className="form-row-2">
            <Select
              label="Role Assignment"
              value={manageForm.role}
              onChange={(e) =>
                setManageForm({ ...manageForm, role: e.target.value })
              }
              options={[
                { value: "Advisor", label: "Advisor (Interactions & Tasks)" },
                { value: "Analyst", label: "Analyst (SQL Queries & Reports)" },
                { value: "Faculty", label: "Faculty (Academic Read-Only)" },
                { value: "Admin", label: "Admin (Full System Control)" },
                { value: "Viewer", label: "Viewer (Read-Only Access)" },
              ]}
              fullWidth
            />

            <Input
              label="Department"
              value={manageForm.department}
              onChange={(e) =>
                setManageForm({ ...manageForm, department: e.target.value })
              }
              fullWidth
            />
          </div>

          <div className="modal-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsManageModalOpen(false)}
              disabled={isSavingManage}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<Save size={15} />}
              loading={isSavingManage}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
