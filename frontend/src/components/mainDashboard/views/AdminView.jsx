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
import "./AdminView.css";

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

export default function AdminView({ currentUser }) {
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

  // toast for notifications
  const { success, info, error: showError } = useToast();

  // gettting all the users
  const {
    data: allUsersData = [],
    isLoading: isUsersLoading,
    isRefetching: isUsersRefetching,
    refetch: refetchUsers,
  } = useAllUsers();

  console.log("allUsersData is : ", allUsersData);


  // get all memberships and institutions
  const {
    data: membershipsData = [],
    isLoading: isMembershipsLoading,
    isRefetching: isMembershipsRefetching,
    refetch: refetchMemberships,
  } = useInstitutionMemberships();


  // get all the institutions 
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

      // Determine role and department from membership or user fallback
      const role = membership?.role || user.role || "Viewer";
      const department = membership?.department || "General Operations";
      const institutionName = institution?.name
        ? `${institution.name} (${institution.code || "CU"})`
        : "Columbia GS (CU)";

      return {
        ...user,
        role,
        department,
        institutionName,
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
        roleFilter === "All" || roleFilter === "all" || (u.role || "").toLowerCase() === roleFilter.toLowerCase();

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

  console.log("selected user is : ", selectedUser);

  // Open Manage Modal for a specific selected user
  const handleOpenManage = (user) => {
    setSelectedUser(user);

    //instId = institution id of the user memebership institution
    const instId = user.membership?.institutionId || user.membership?.institution_id || institutionsData?.[0]?.id || "";
    console.log("instId is : ", instId);
    // get the matched institution from the institutionsMap using the instId
    const matchedInst = institutionsMap.get(instId);
    console.log("matchedInst is : ", matchedInst);
    const currentTz = user.user_timezone || "America/New_York";
    const currentRole = user.membership?.role || user.role || "Viewer";
    const currentDept = user.membership?.department || user.department || "General Operations";

    const initialValues = {
      userId: user.id,
      fullName: user.full_name || "",
      preferredFirstName: user.preferred_first_name || "",
      email: user.email || "",
      phoneNumber: user.phone_number || "",
      role: currentRole,
      department: currentDept,
      institutionId: instId,
      institutionName: user.institutionName || (matchedInst ? `${matchedInst.name} (${matchedInst.code})` : "Columbia University (CU)"),
      userTimezone: currentTz,
    };

    setManageForm({
      ...initialValues,
      original: {
        fullName: initialValues.fullName,
        preferredFirstName: initialValues.preferredFirstName,
        phoneNumber: initialValues.phoneNumber,
        role: initialValues.role,
        department: initialValues.department,
        userTimezone: initialValues.userTimezone,
      },
    });
    setIsManageModalOpen(true);
  };

  // Handle saving updates from Manage User Modal
  const handleSaveManage = async (e) => {
    e.preventDefault();
    if (!manageForm.userId) return;

    const updateUserPayload = {};
    let hasUserChanges = false;
    let hasMembershipChanges = false;

    // Detect individual user profile changes
    if (manageForm.fullName !== manageForm.original.fullName) {
      updateUserPayload.full_name = manageForm.fullName;
      hasUserChanges = true;
    }
    if (manageForm.preferredFirstName !== manageForm.original.preferredFirstName) {
      updateUserPayload.preferred_first_name = manageForm.preferredFirstName || "";
      hasUserChanges = true;
    }
    if (manageForm.phoneNumber !== manageForm.original.phoneNumber) {
      updateUserPayload.phone_number = manageForm.phoneNumber || "";
      hasUserChanges = true;
    }
    if (manageForm.userTimezone !== manageForm.original.userTimezone) {
      updateUserPayload.user_timezone = manageForm.userTimezone;
      hasUserChanges = true;
    }

    // Detect membership (role / department) changes
    if (
      manageForm.role !== manageForm.original.role ||
      manageForm.department !== manageForm.original.department
    ) {
      hasMembershipChanges = true;
    }

    if (!hasUserChanges && !hasMembershipChanges) {
      info("No changes to save");
      setIsManageModalOpen(false);
      return;
    }

    setIsSavingManage(true);
    try {
      const promises = [];

      // 1. Update specific user profile fields
      if (hasUserChanges) {
        promises.push(
          updateUserMutation.mutateAsync({
            userId: manageForm.userId,
            updatePayload: updateUserPayload,
          })
        );
      }

      // 2. Update or create membership for specific user's role and department
      if (hasMembershipChanges && manageForm.institutionId) {
        if (selectedUser?.membership) {
          promises.push(
            updateMembershipMutation.mutateAsync({
              institutionId: manageForm.institutionId,
              userId: manageForm.userId,
              data: {
                role: manageForm.role,
                department: manageForm.department,
              },
            })
          );
        } else {
          promises.push(
            createMembershipMutation.mutateAsync({
              institution_id: manageForm.institutionId,
              user_id: manageForm.userId,
              role: manageForm.role,
              department: manageForm.department,
            })
          );
        }
      }

      await Promise.all(promises);
      setIsManageModalOpen(false);
    } catch (err) {
      console.error("Failed to update staff member:", err);
    } finally {
      setIsSavingManage(false);
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

  // Role options for select dropdowns
  const roleSelectOptions = [
    { value: "All", label: "All Roles" },
    { value: "Admin", label: "Admin" },
    { value: "Analyst", label: "Analyst" },
    { value: "Advisor", label: "Advisor" },
    { value: "Faculty", label: "Faculty" },
    { value: "Viewer", label: "Viewer" },
  ];

  const roleAssignmentOptions = [
    { value: "Admin", label: "Admin - Full Management" },
    { value: "Analyst", label: "Analyst - Yield & SQL Reporting" },
    { value: "Advisor", label: "Advisor - Advising & Interactions" },
    { value: "Faculty", label: "Faculty - Academic Review" },
    { value: "Viewer", label: "Viewer - Audit & Read-Only" },
  ];

  // Timezone options for select dropdown
  const timezoneOptions = [
    { value: "America/New_York", label: "America/New_York (Eastern Time - UTC-5)" },
    { value: "America/Chicago", label: "America/Chicago (Central Time - UTC-6)" },
    { value: "America/Denver", label: "America/Denver (Mountain Time - UTC-7)" },
    { value: "America/Phoenix", label: "America/Phoenix (Mountain Standard - UTC-7)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (Pacific Time - UTC-8)" },
    { value: "America/Anchorage", label: "America/Anchorage (Alaska Time - UTC-9)" },
    { value: "Pacific/Honolulu", label: "Pacific/Honolulu (Hawaii Time - UTC-10)" },
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
          iconVariant="purple"
          loading={isLoading}
          pill={<StatusPill variant="purple">Yield & Reports</StatusPill>}
          subtext="Ad-hoc SQL & analytics"
        />

        {/* Faculty */}
        <StatCard
          label="Total Faculty"
          value={roleStats.faculty}
          icon={<GraduationCap size={16} />}
          iconVariant="blue"
          loading={isLoading}
          pill={<StatusPill variant="info">Academic Units</StatusPill>}
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
          iconVariant="amber"
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
              <TableHead>Institution</TableHead>
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

                  {/* Institution */}
                  <TableCell>
                    <div className="inst-meta-cell">
                      <span className="inst-badge">{u.institutionName}</span>
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

                  {/* Manage Button */}
                  <TableCell align="right">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenManage(u)}
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

      {/* 🛠️ Reusable Manage Staff Member Modal */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Manage Staff Member"
        subtitle={`Adjust role, department, and operational settings for ${manageForm.fullName || manageForm.email}`}
        icon={<UserCheck size={18} />}
        size="md"
      >
        <form onSubmit={handleSaveManage} className="modal-form">
          {/* Read-Only Operator Identity Summary */}
          <div className="manage-identity-banner">
            <div className="manage-identity-meta">
              <span className="manage-identity-label">System User</span>
              <strong className="manage-identity-val">{manageForm.fullName || "Operator"}</strong>
              <span className="manage-identity-sub font-mono">{manageForm.email}</span>
            </div>
            <div className="manage-identity-id">
              <span className="manage-identity-label">UUID</span>
              <span className="font-mono user-id-pill">
                {manageForm.userId ? `${manageForm.userId.slice(0, 8)}...${manageForm.userId.slice(-4)}` : "—"}
              </span>
            </div>
          </div>

          {/* Full Name Input */}
          <Input
            label="Full Legal / Display Name *"
            required
            placeholder="e.g. Jordan Reed"
            value={manageForm.fullName}
            onChange={(e) =>
              setManageForm({ ...manageForm, fullName: e.target.value })
            }
            fullWidth
          />

          {/* Preferred Name & Phone */}
          <div className="form-row">
            <Input
              label="Preferred First Name"
              placeholder="e.g. Jordan"
              value={manageForm.preferredFirstName}
              onChange={(e) =>
                setManageForm({ ...manageForm, preferredFirstName: e.target.value })
              }
              fullWidth
            />

            <Input
              label="Contact Phone"
              placeholder="+1 (212) 854-2772"
              value={manageForm.phoneNumber}
              onChange={(e) =>
                setManageForm({ ...manageForm, phoneNumber: e.target.value })
              }
              fullWidth
            />
          </div>

          {/* Role & Department */}
          <div className="form-row">
            {/* Reusable Select Dropdown for Role Assignment */}
            <Select
              label="Assigned CRM Role *"
              value={manageForm.role}
              onChange={(e) =>
                setManageForm({ ...manageForm, role: e.target.value })
              }
              options={roleAssignmentOptions}
              fullWidth
            />

            {/* Department Input */}
            <Input
              label="Department & Unit"
              placeholder="e.g. Academic Advising"
              value={manageForm.department}
              onChange={(e) =>
                setManageForm({ ...manageForm, department: e.target.value })
              }
              fullWidth
            />
          </div>

          {/* Locked Institution Scope */}
          <div className="locked-institution-group">
            <Input
              label="Institution"
              disabled
              value={manageForm.institutionName}
              fullWidth
            />
          </div>

          {/* User's Personal Timezone Dropdown */}
          <Select
            label="Staff Member Timezone"
            value={manageForm.userTimezone}
            onChange={(e) =>
              setManageForm({ ...manageForm, userTimezone: e.target.value })
            }
            options={timezoneOptions}
            icon={<Clock size={14} />}
            helperText="Personal timezone for this staff member's notifications and scheduling"
            fullWidth
          />

          <div className="modal-form-actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsManageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSavingManage}
              icon={<Save size={14} />}
            >
              {isSavingManage ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

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
              options={roleAssignmentOptions}
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

          {/* Reusable Select Dropdown for Institution Assignment */}
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
