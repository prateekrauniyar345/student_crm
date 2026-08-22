import React, { useMemo } from "react";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Calendar,
  Building,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle2,
  Database,
  Sparkles,
  TrendingUp,
  UserCheck,
  Shield,
  Layers,
  BookOpen,
  Lock,
} from "lucide-react";
import "./AdminOverviewView.css";

// TanStack Query Hooks
import { useAllUsers } from "../../../hooks/useUsers";
import { useAllPrograms } from "../../../hooks/usePrograms";
import { useAllAcademicTerms } from "../../../hooks/useAcademicTerms";
import {
  useAllInstitutions,
  useInstitutionMemberships,
} from "../../../hooks/useInstitution";
import { useToast } from "../../../context/ToastContext";

// Reusable UI Components
import {
  Button,
  StatCard,
  Card,
  RolePill,
  StatusPill,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  TableLoadingState,
} from "../../../ui";

export default function AdminOverviewView({ currentUser, setActiveTab }) {
  const { info, error: showError } = useToast();

  // Queries
  const {
    data: allUsers = [],
    isLoading: isUsersLoading,
    isRefetching: isUsersRefetching,
    refetch: refetchUsers,
  } = useAllUsers();

  const {
    data: allPrograms = [],
    isLoading: isProgramsLoading,
    isRefetching: isProgramsRefetching,
    refetch: refetchPrograms,
  } = useAllPrograms();

  const {
    data: allTerms = [],
    isLoading: isTermsLoading,
    isRefetching: isTermsRefetching,
    refetch: refetchTerms,
  } = useAllAcademicTerms();

  const {
    data: allInstitutions = [],
    isLoading: isInstitutionsLoading,
    refetch: refetchInstitutions,
  } = useAllInstitutions();

  const {
    data: allMemberships = [],
    isLoading: isMembershipsLoading,
    refetch: refetchMemberships,
  } = useInstitutionMemberships();

  const isLoading =
    isUsersLoading ||
    isProgramsLoading ||
    isTermsLoading ||
    isInstitutionsLoading ||
    isMembershipsLoading;

  const isRefetching =
    isUsersRefetching || isProgramsRefetching || isTermsRefetching;

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refetchUsers(),
        refetchPrograms(),
        refetchTerms(),
        refetchInstitutions(),
        refetchMemberships(),
      ]);
      info("Admin overview metrics refreshed");
    } catch (err) {
      showError("Failed to refresh admin metrics");
    }
  };

  // Computations
  const stats = useMemo(() => {
    const users = Array.isArray(allUsers) ? allUsers : [];
    const programs = Array.isArray(allPrograms) ? allPrograms : [];
    const terms = Array.isArray(allTerms) ? allTerms : [];
    const memberships = Array.isArray(allMemberships) ? allMemberships : [];

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.is_active !== false).length;

    const totalPrograms = programs.length;
    const activePrograms = programs.filter((p) => p.is_active !== false).length;

    const totalTerms = terms.length;
    const uniqueYears = new Set(
      terms.map((t) => t.application_year).filter(Boolean)
    ).size;

    let adminCount = 0;
    let analystCount = 0;
    let advisorCount = 0;
    let facultyCount = 0;
    let viewerCount = 0;

    memberships.forEach((m) => {
      const role = m.role || "Viewer";
      if (role === "Admin") adminCount++;
      else if (role === "Analyst") analystCount++;
      else if (role === "Advisor") advisorCount++;
      else if (role === "Faculty") facultyCount++;
      else viewerCount++;
    });

    return {
      totalUsers,
      activeUsers,
      totalPrograms,
      activePrograms,
      totalTerms,
      uniqueYears,
      totalInstitutions: allInstitutions.length || 1,
      adminCount,
      analystCount,
      advisorCount,
      facultyCount,
      viewerCount,
    };
  }, [allUsers, allPrograms, allTerms, allMemberships, allInstitutions]);

  // Preview slices
  const previewPrograms = useMemo(() => {
    return Array.isArray(allPrograms) ? allPrograms.slice(0, 5) : [];
  }, [allPrograms]);

  const previewTerms = useMemo(() => {
    return Array.isArray(allTerms) ? allTerms.slice(0, 5) : [];
  }, [allTerms]);

  return (
    <div className="admin-overview-view">
      {/* Welcome & Admin Console Header */}
      <div className="admin-overview-header-card">
        <div className="header-badge-row">
          <span className="status-pill status-pill-danger">
            <ShieldCheck size={13} />
            <span>Admin Control Panel</span>
          </span>
          <span className="overview-env-tag font-mono">Tenant Mode: Active</span>
        </div>

        <div className="header-main-flex">
          <div>
            <h2>Institutional Administration Overview</h2>
            <p>
              Real-time summary of staff accounts, academic degree programs, and academic term calendar configurations across your institution.
            </p>
          </div>

          <div className="header-actions">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} className={isRefetching ? "spin-icon" : ""} />}
              onClick={handleRefreshAll}
              loading={isRefetching}
            >
              Refresh All
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Users size={15} />}
              onClick={() => setActiveTab("admin-users")}
            >
              Manage Users
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<GraduationCap size={15} />}
              onClick={() => setActiveTab("admin-programs-terms")}
            >
              Programs & Terms
            </Button>
          </div>
        </div>
      </div>

      {/* 4 High-Level Top Stat Cards */}
      <div className="admin-overview-stats-grid">
        <StatCard
          label="Total System Users"
          value={stats.totalUsers}
          icon={<Users size={20} />}
          iconVariant="blue"
          subtext={`${stats.activeUsers} Active staff accounts`}
          pill={<StatusPill variant="success">● Active</StatusPill>}
          loading={isLoading}
          onClick={() => setActiveTab("admin-users")}
          className="clickable-stat-card"
        />

        <StatCard
          label="Academic Programs"
          value={stats.totalPrograms}
          icon={<GraduationCap size={20} />}
          iconVariant="purple"
          subtext={`${stats.activePrograms} Degree offerings`}
          pill={<StatusPill variant="info">Programs</StatusPill>}
          loading={isLoading}
          onClick={() => setActiveTab("admin-programs-terms")}
          className="clickable-stat-card"
        />

        <StatCard
          label="Academic Terms"
          value={stats.totalTerms}
          icon={<Calendar size={20} />}
          iconVariant="green"
          subtext={`${stats.uniqueYears} Application years`}
          pill={<StatusPill variant="success">Terms</StatusPill>}
          loading={isLoading}
          onClick={() => setActiveTab("admin-programs-terms")}
          className="clickable-stat-card"
        />

        <StatCard
          label="Institutions & Tenants"
          value={stats.totalInstitutions}
          icon={<Building size={20} />}
          iconVariant="amber"
          subtext="Columbia University Standard"
          pill={<StatusPill variant="neutral">Tenancy</StatusPill>}
          loading={isLoading}
        />
      </div>

      {/* 2-Column Split Grid */}
      <div className="admin-overview-split-grid">
        {/* Left Column: Quick Snapshots */}
        <div className="overview-column">
          {/* Programs Snapshot */}
          <Card
            title="Degree Programs Snapshot"
            subtitle="Configured academic offerings and degree levels"
            icon={<GraduationCap size={18} />}
            noPadding={true}
            headerAction={
              <Button
                variant="ghost"
                size="xs"
                icon={<ArrowRight size={13} />}
                iconPosition="right"
                onClick={() => setActiveTab("admin-programs-terms")}
              >
                View all ({stats.totalPrograms})
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Degree Level</TableHead>
                  <TableHead align="right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableLoadingState colSpan={4} message="Loading programs..." />
                ) : previewPrograms.length === 0 ? (
                  <TableEmptyState
                    colSpan={4}
                    message="No programs registered yet."
                    icon={<GraduationCap size={20} />}
                  />
                ) : (
                  previewPrograms.map((prog) => (
                    <TableRow
                      key={prog.id}
                      isClickable={true}
                      onClick={() => setActiveTab("admin-programs-terms")}
                    >
                      <TableCell isMono={true}>
                        <span className="font-semibold">{prog.code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="program-name-text">{prog.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="degree-level-pill font-mono">
                          {prog.degree_level || "BACHELOR"}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        {prog.is_active !== false ? (
                          <StatusPill variant="success" dot={true}>
                            Active
                          </StatusPill>
                        ) : (
                          <StatusPill variant="neutral" dot={true}>
                            Inactive
                          </StatusPill>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Academic Terms Snapshot */}
          <Card
            title="Academic Terms Schedule"
            subtitle="Semester calendar windows and application cycles"
            icon={<Calendar size={18} />}
            noPadding={true}
            headerAction={
              <Button
                variant="ghost"
                size="xs"
                icon={<ArrowRight size={13} />}
                iconPosition="right"
                onClick={() => setActiveTab("admin-programs-terms")}
              >
                View all ({stats.totalTerms})
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term Code</TableHead>
                  <TableHead>Term Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead align="right">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableLoadingState colSpan={5} message="Loading terms..." />
                ) : previewTerms.length === 0 ? (
                  <TableEmptyState
                    colSpan={5}
                    message="No academic terms configured."
                    icon={<Calendar size={20} />}
                  />
                ) : (
                  previewTerms.map((term) => (
                    <TableRow
                      key={term.id}
                      isClickable={true}
                      onClick={() => setActiveTab("admin-programs-terms")}
                    >
                      <TableCell isMono={true}>
                        <span className="term-code-badge">{term.code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="term-name-text">{term.name}</span>
                      </TableCell>
                      <TableCell isMono={true}>
                        <span className="year-tag">{term.application_year || "—"}</span>
                      </TableCell>
                      <TableCell isMono={true}>
                        <span className="date-text">{term.start_date || "—"}</span>
                      </TableCell>
                      <TableCell align="right" isMono={true}>
                        <span className="date-text">{term.end_date || "—"}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right Column: Roles Breakdown & System Parameters */}
        <div className="overview-column">
          {/* Staff Roles Distribution */}
          <Card
            title="Staff Access & Role Distribution"
            subtitle="Granular permissions matrix for active personnel"
            icon={<ShieldCheck size={18} />}
            headerAction={
              <Button
                variant="ghost"
                size="xs"
                icon={<ArrowRight size={13} />}
                iconPosition="right"
                onClick={() => setActiveTab("admin-users")}
              >
                Staff Directory
              </Button>
            }
          >
            <div className="roles-breakdown-list">
              <div className="role-stat-item">
                <div className="role-stat-left">
                  <RolePill role="Admin" />
                  <span className="role-desc">Full system administration & tenancy</span>
                </div>
                <span className="role-count font-mono">{stats.adminCount}</span>
              </div>

              <div className="role-stat-item">
                <div className="role-stat-left">
                  <RolePill role="Analyst" />
                  <span className="role-desc">SQL analytics, reporting views, AI co-pilot</span>
                </div>
                <span className="role-count font-mono">{stats.analystCount}</span>
              </div>

              <div className="role-stat-item">
                <div className="role-stat-left">
                  <RolePill role="Advisor" />
                  <span className="role-desc">Student interaction logging & task queue</span>
                </div>
                <span className="role-count font-mono">{stats.advisorCount}</span>
              </div>

              <div className="role-stat-item">
                <div className="role-stat-left">
                  <RolePill role="Faculty" />
                  <span className="role-desc">Student term records & course clearance</span>
                </div>
                <span className="role-count font-mono">{stats.facultyCount}</span>
              </div>

              <div className="role-stat-item">
                <div className="role-stat-left">
                  <RolePill role="Viewer" />
                  <span className="role-desc">Read-only institutional audit view</span>
                </div>
                <span className="role-count font-mono">{stats.viewerCount}</span>
              </div>
            </div>
          </Card>

          {/* System & Architecture Status */}
          <Card
            title="System & Database Architecture"
            subtitle="Active server services and relational parameters"
            icon={<Database size={18} />}
          >
            <div className="system-specs-list">
              <div className="spec-row">
                <span className="spec-label">Database Engine</span>
                <span className="spec-value font-mono">PostgreSQL 15+ (asyncpg)</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">API Gateway</span>
                <span className="spec-value font-mono">FastAPI /api/v1 (Python 3.13)</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Authentication Layer</span>
                <span className="spec-value font-mono">Supabase Auth (Bearer JWT)</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Multi-Tenancy</span>
                <span className="spec-value font-mono">Enabled (public.institutions)</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Date Validation Engine</span>
                <span className="spec-value font-mono">Active (end_date &gt;= start_date)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
