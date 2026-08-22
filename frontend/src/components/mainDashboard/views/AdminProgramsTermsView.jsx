import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Calendar,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Building,
  Edit2,
  Trash2,
  AlertTriangle,
  Save,
  Check,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import "./AdminProgramsTermsView.css";

// TanStack Query Hooks
import {
  useAllPrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
} from "../../../hooks/usePrograms";
import {
  useAllAcademicTerms,
  useCreateAcademicTerm,
  useUpdateAcademicTerm,
  useDeleteAcademicTerm,
} from "../../../hooks/useAcademicTerms";
import { useAllInstitutions } from "../../../hooks/useInstitution";
import { useToast } from "../../../context/ToastContext";

// Reusable UI Components
import {
  Button,
  Select,
  SearchInput,
  StatCard,
  Card,
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

export default function AdminProgramsTermsView({ currentUser }) {
  // Navigation Section: "programs" or "terms"
  const [activeSection, setActiveSection] = useState("programs");

  const { success, info, error: showError } = useToast();

  // Queries
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

  const { data: allInstitutions = [] } = useAllInstitutions();

  // Mutations
  const createProgramMutation = useCreateProgram();
  const updateProgramMutation = useUpdateProgram();
  const deleteProgramMutation = useDeleteProgram();

  const createTermMutation = useCreateAcademicTerm();
  const updateTermMutation = useUpdateAcademicTerm();
  const deleteTermMutation = useDeleteAcademicTerm();

  // ----------------------------------------------------
  // Programs State & Handlers
  // ----------------------------------------------------
  const [programSearch, setProgramSearch] = useState("");
  const [programDegreeFilter, setProgramDegreeFilter] = useState("All");
  const [programStatusFilter, setProgramStatusFilter] = useState("All");

  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] = useState(false);
  const [createProgramForm, setCreateProgramForm] = useState({
    institution_id: "",
    code: "",
    name: "",
    degree_level: "BACHELOR",
    is_active: true,
  });

  const [isEditProgramModalOpen, setIsEditProgramModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [editProgramForm, setEditProgramForm] = useState({
    code: "",
    name: "",
    degree_level: "BACHELOR",
    is_active: true,
  });

  const [isDeleteProgramModalOpen, setIsDeleteProgramModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  // ----------------------------------------------------
  // Academic Terms State & Handlers
  // ----------------------------------------------------
  const [termSearch, setTermSearch] = useState("");
  const [termYearFilter, setTermYearFilter] = useState("All");

  const [isCreateTermModalOpen, setIsCreateTermModalOpen] = useState(false);
  const [createTermForm, setCreateTermForm] = useState({
    institution_id: "",
    code: "",
    name: "",
    start_date: "",
    end_date: "",
    application_year: new Date().getFullYear(),
  });

  const [isEditTermModalOpen, setIsEditTermModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [editTermForm, setEditTermForm] = useState({
    code: "",
    name: "",
    start_date: "",
    end_date: "",
    application_year: new Date().getFullYear(),
  });

  const [isDeleteTermModalOpen, setIsDeleteTermModalOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);

  // Institution mapping
  const defaultInstitutionId = allInstitutions[0]?.id || "";

  // ----------------------------------------------------
  // Programs Computations & Filter
  // ----------------------------------------------------
  const programStats = useMemo(() => {
    const progs = Array.isArray(allPrograms) ? allPrograms : [];
    const total = progs.length;
    const active = progs.filter((p) => p.is_active !== false).length;
    const inactive = total - active;
    const uniqueDegrees = new Set(
      progs.map((p) => p.degree_level).filter(Boolean)
    ).size;

    return { total, active, inactive, uniqueDegrees };
  }, [allPrograms]);

  const filteredPrograms = useMemo(() => {
    const progs = Array.isArray(allPrograms) ? allPrograms : [];
    return progs.filter((prog) => {
      // Degree level filter
      if (
        programDegreeFilter !== "All" &&
        prog.degree_level !== programDegreeFilter
      ) {
        return false;
      }

      // Status filter
      if (programStatusFilter === "Active" && prog.is_active === false) {
        return false;
      }
      if (programStatusFilter === "Inactive" && prog.is_active !== false) {
        return false;
      }

      // Search query
      if (programSearch.trim() !== "") {
        const q = programSearch.toLowerCase();
        const code = (prog.code || "").toLowerCase();
        const name = (prog.name || "").toLowerCase();
        const deg = (prog.degree_level || "").toLowerCase();
        return code.includes(q) || name.includes(q) || deg.includes(q);
      }

      return true;
    });
  }, [allPrograms, programDegreeFilter, programStatusFilter, programSearch]);

  // ----------------------------------------------------
  // Academic Terms Computations & Filter
  // ----------------------------------------------------
  const termStats = useMemo(() => {
    const terms = Array.isArray(allTerms) ? allTerms : [];
    const total = terms.length;
    const now = new Date().toISOString().split("T")[0];

    const currentOrUpcoming = terms.filter(
      (t) => !t.end_date || t.end_date >= now
    ).length;

    const uniqueYears = Array.from(
      new Set(terms.map((t) => t.application_year).filter(Boolean))
    ).sort((a, b) => b - a);

    return { total, currentOrUpcoming, uniqueYears };
  }, [allTerms]);

  const filteredTerms = useMemo(() => {
    const terms = Array.isArray(allTerms) ? allTerms : [];
    return terms.filter((term) => {
      // Year filter
      if (
        termYearFilter !== "All" &&
        String(term.application_year) !== String(termYearFilter)
      ) {
        return false;
      }

      // Search query
      if (termSearch.trim() !== "") {
        const q = termSearch.toLowerCase();
        const code = (term.code || "").toLowerCase();
        const name = (term.name || "").toLowerCase();
        const year = String(term.application_year || "");
        return code.includes(q) || name.includes(q) || year.includes(q);
      }

      return true;
    });
  }, [allTerms, termYearFilter, termSearch]);

  // ----------------------------------------------------
  // Program CRUD Handlers
  // ----------------------------------------------------
  const handleOpenCreateProgram = () => {
    setCreateProgramForm({
      institution_id: defaultInstitutionId,
      code: "",
      name: "",
      degree_level: "BACHELOR",
      is_active: true,
    });
    setIsCreateProgramModalOpen(true);
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!createProgramForm.code || !createProgramForm.name) {
      showError("Program code and name are required");
      return;
    }

    try {
      await createProgramMutation.mutateAsync({
        institution_id: createProgramForm.institution_id || defaultInstitutionId,
        code: createProgramForm.code.trim().toUpperCase(),
        name: createProgramForm.name.trim(),
        degree_level: createProgramForm.degree_level,
        is_active: createProgramForm.is_active,
      });
      setIsCreateProgramModalOpen(false);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const handleOpenEditProgram = (prog) => {
    setSelectedProgram(prog);
    setEditProgramForm({
      code: prog.code || "",
      name: prog.name || "",
      degree_level: prog.degree_level || "BACHELOR",
      is_active: prog.is_active !== false,
    });
    setIsEditProgramModalOpen(true);
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    if (!selectedProgram) return;

    try {
      await updateProgramMutation.mutateAsync({
        programId: selectedProgram.id,
        updates: {
          code: editProgramForm.code.trim().toUpperCase(),
          name: editProgramForm.name.trim(),
          degree_level: editProgramForm.degree_level,
          is_active: editProgramForm.is_active,
        },
      });
      setIsEditProgramModalOpen(false);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const handleDeleteProgram = async () => {
    if (!programToDelete) return;
    try {
      await deleteProgramMutation.mutateAsync(programToDelete.id);
      setIsDeleteProgramModalOpen(false);
      setProgramToDelete(null);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  // ----------------------------------------------------
  // Academic Term CRUD Handlers
  // ----------------------------------------------------
  const handleOpenCreateTerm = () => {
    setCreateTermForm({
      institution_id: defaultInstitutionId,
      code: "",
      name: "",
      start_date: "",
      end_date: "",
      application_year: new Date().getFullYear(),
    });
    setIsCreateTermModalOpen(true);
  };

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    if (!createTermForm.code || !createTermForm.name || !createTermForm.start_date || !createTermForm.end_date) {
      showError("Please fill in all required academic term fields");
      return;
    }

    if (createTermForm.end_date < createTermForm.start_date) {
      showError("End date must be greater than or equal to start date");
      return;
    }

    try {
      await createTermMutation.mutateAsync({
        institution_id: createTermForm.institution_id || defaultInstitutionId,
        code: createTermForm.code.trim().toUpperCase(),
        name: createTermForm.name.trim(),
        start_date: createTermForm.start_date,
        end_date: createTermForm.end_date,
        application_year: parseInt(createTermForm.application_year, 10),
      });
      setIsCreateTermModalOpen(false);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const formatDateForInput = (dateVal) => {
    if (!dateVal) return "";
    if (typeof dateVal === "string") {
      const trimmed = dateVal.trim();
      if (trimmed.includes("T")) return trimmed.split("T")[0];
      if (trimmed.includes(" ")) return trimmed.split(" ")[0];
      return trimmed;
    }
    if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
      return dateVal.toISOString().split("T")[0];
    }
    return String(dateVal);
  };

  const handleOpenEditTerm = (term) => {
    if (!term) return;
    setSelectedTerm(term);
    const rawStart = term.start_date ?? term.startDate ?? "";
    const rawEnd = term.end_date ?? term.endDate ?? "";
    const rawYear =
      term.application_year ?? term.applicationYear ?? new Date().getFullYear();

    setEditTermForm({
      code: term.code || "",
      name: term.name || "",
      start_date: formatDateForInput(rawStart),
      end_date: formatDateForInput(rawEnd),
      application_year: rawYear,
    });
    setIsEditTermModalOpen(true);
  };

  const handleUpdateTerm = async (e) => {
    e.preventDefault();
    if (!selectedTerm) return;

    if (editTermForm.end_date && editTermForm.start_date && editTermForm.end_date < editTermForm.start_date) {
      showError("End date must be greater than or equal to start date");
      return;
    }

    try {
      await updateTermMutation.mutateAsync({
        termId: selectedTerm.id,
        updates: {
          code: editTermForm.code.trim().toUpperCase(),
          name: editTermForm.name.trim(),
          start_date: editTermForm.start_date,
          end_date: editTermForm.end_date,
          application_year: parseInt(editTermForm.application_year, 10),
        },
      });
      setIsEditTermModalOpen(false);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  const handleDeleteTerm = async () => {
    if (!termToDelete) return;
    try {
      await deleteTermMutation.mutateAsync(termToDelete.id);
      setIsDeleteTermModalOpen(false);
      setTermToDelete(null);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  // Term timeline status helper
  const getTermTimelineStatus = (startDate, endDate) => {
    const today = new Date().toISOString().split("T")[0];
    if (!startDate || !endDate) return <StatusPill variant="neutral">Configured</StatusPill>;
    if (today < startDate) return <StatusPill variant="info" dot={true}>Upcoming</StatusPill>;
    if (today >= startDate && today <= endDate) return <StatusPill variant="success" dot={true}>Current</StatusPill>;
    return <StatusPill variant="neutral">Concluded</StatusPill>;
  };

  return (
    <div className="admin-academic-view">
      {/* Top Header Card */}
      <div className="admin-academic-header-card">
        <div className="academic-header-top">
          <div className="academic-header-titles">
            <div className="academic-badge-row">
              <span className="status-pill status-pill-info">
                <GraduationCap size={13} />
              </span>
              <h2>Programs & Academic Terms Management</h2>
            </div>
              
            <p>
              Maintain degree programs, degree levels, and academic term calendar windows for student admissions, course enrollment, and degree audits.
            </p>
          </div>

          {/* Section Switcher Tabs */}
          <div className="academic-tabs-switch">
            <button
              className={`tab-switch-btn ${activeSection === "programs" ? "active" : ""}`}
              onClick={() => setActiveSection("programs")}
            >
              <BookOpen size={16} />
              <span>Degree Programs ({programStats.total})</span>
            </button>
            <button
              className={`tab-switch-btn ${activeSection === "terms" ? "active" : ""}`}
              onClick={() => setActiveSection("terms")}
            >
              <CalendarDays size={16} />
              <span>Academic Terms ({termStats.total})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PROGRAMS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSection === "programs" && (
        <div className="academic-section-content">
          {/* Programs Stat Cards Grid */}
          <div className="academic-stats-grid">
            <StatCard
              label="Total Programs"
              value={programStats.total}
              icon={<GraduationCap size={18} />}
              iconVariant="purple"
              subtext="Catalog offerings"
              pill={<StatusPill variant="info">Programs</StatusPill>}
              loading={isProgramsLoading}
            />
            <StatCard
              label="Active Programs"
              value={programStats.active}
              icon={<CheckCircle2 size={18} />}
              iconVariant="green"
              subtext="Open for admission"
              pill={<StatusPill variant="success">● Active</StatusPill>}
              loading={isProgramsLoading}
            />
            <StatCard
              label="Degree Levels"
              value={programStats.uniqueDegrees}
              icon={<Layers size={18} />}
              iconVariant="blue"
              subtext="Bachelor, Master, etc."
              pill={<StatusPill variant="neutral">Levels</StatusPill>}
              loading={isProgramsLoading}
            />
            <StatCard
              label="Inactive Programs"
              value={programStats.inactive}
              icon={<Clock size={18} />}
              iconVariant="amber"
              subtext="Archived or phased out"
              pill={<StatusPill variant="neutral">Archived</StatusPill>}
              loading={isProgramsLoading}
            />
          </div>

          {/* Programs Table Card */}
          <Card
            title="Degree Programs Catalog"
            subtitle="Configure degree level designations, active enrollment status, and institutional codes"
            icon={<GraduationCap size={18} />}
            noPadding={true}
            headerAction={
              <div className="academic-header-count">
                <span className="font-mono">{filteredPrograms.length}</span> programs matching filters
              </div>
            }
          >
            {/* Toolbar */}
            <div className="academic-toolbar">
              <div className="toolbar-left">
                <div className="academic-search-box">
                  <SearchInput
                    placeholder="Search programs by code or title..."
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
                    onClear={() => setProgramSearch("")}
                    size="sm"
                    fullWidth={true}
                  />
                </div>

                <div className="academic-filter-select">
                  <Select
                    size="sm"
                    value={programDegreeFilter}
                    onChange={(e) => setProgramDegreeFilter(e.target.value)}
                    options={[
                      { value: "All", label: "All Degree Levels" },
                      { value: "BACHELOR", label: "Bachelor" },
                      { value: "MASTER", label: "Master" },
                      { value: "DOCTORATE", label: "Doctorate" },
                      { value: "CERTIFICATE", label: "Certificate" },
                      { value: "NON_DEGREE", label: "Non-Degree" },
                    ]}
                  />
                </div>

                <div className="academic-filter-select">
                  <Select
                    size="sm"
                    value={programStatusFilter}
                    onChange={(e) => setProgramStatusFilter(e.target.value)}
                    options={[
                      { value: "All", label: "All Statuses" },
                      { value: "Active", label: "Active Only" },
                      { value: "Inactive", label: "Inactive Only" },
                    ]}
                  />
                </div>
              </div>

              <div className="toolbar-right">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw size={14} className={isProgramsRefetching ? "spin-icon" : ""} />}
                  onClick={() => refetchPrograms()}
                  loading={isProgramsRefetching}
                  title="Refresh programs catalog"
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={15} />}
                  onClick={handleOpenCreateProgram}
                >
                  New Program
                </Button>
              </div>
            </div>

            {/* Programs Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Code</TableHead>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Degree Level</TableHead>
                  <TableHead>System ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead align="right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isProgramsLoading ? (
                  <TableLoadingState colSpan={6} message="Loading degree programs catalog..." />
                ) : filteredPrograms.length === 0 ? (
                  <TableEmptyState
                    colSpan={6}
                    message={
                      programSearch || programDegreeFilter !== "All" || programStatusFilter !== "All"
                        ? "No programs found matching the selected search and filter criteria."
                        : "No degree programs registered in this institution."
                    }
                    icon={<GraduationCap size={22} />}
                  />
                ) : (
                  filteredPrograms.map((prog) => (
                    <TableRow key={prog.id}>
                      {/* Code */}
                      <TableCell isMono={true}>
                        <span className="code-pill font-semibold">{prog.code}</span>
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        <span className="font-semibold text-dark">{prog.name}</span>
                      </TableCell>

                      {/* Degree Level */}
                      <TableCell>
                        <span className="degree-level-tag font-mono">
                          {prog.degree_level || "BACHELOR"}
                        </span>
                      </TableCell>

                      {/* ID */}
                      <TableCell isMono={true}>
                        <span className="id-snippet" title={prog.id}>
                          {prog.id ? `${prog.id.slice(0, 8)}...` : "—"}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
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

                      {/* Actions */}
                      <TableCell align="right">
                        <div className="action-buttons-group">
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={<Edit2 size={12} />}
                            onClick={() => handleOpenEditProgram(prog)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            icon={<Trash2 size={12} />}
                            onClick={() => {
                              setProgramToDelete(prog);
                              setIsDeleteProgramModalOpen(true);
                            }}
                            title="Delete program"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ACADEMIC TERMS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSection === "terms" && (
        <div className="academic-section-content">
          {/* Academic Terms Stat Cards Grid */}
          <div className="academic-stats-grid">
            <StatCard
              label="Total Academic Terms"
              value={termStats.total}
              icon={<Calendar size={18} />}
              iconVariant="green"
              subtext="Semester calendar windows"
              pill={<StatusPill variant="success">Terms</StatusPill>}
              loading={isTermsLoading}
            />
            <StatCard
              label="Active / Upcoming Terms"
              value={termStats.currentOrUpcoming}
              icon={<Clock size={18} />}
              iconVariant="blue"
              subtext="Current calendar dates"
              pill={<StatusPill variant="info">In-Progress</StatusPill>}
              loading={isTermsLoading}
            />
            <StatCard
              label="Application Years"
              value={termStats.uniqueYears.length}
              icon={<CalendarDays size={18} />}
              iconVariant="purple"
              subtext="Academic years tracked"
              pill={<StatusPill variant="neutral">Cycles</StatusPill>}
              loading={isTermsLoading}
            />
            <StatCard
              label="Date Validation"
              value="Enforced"
              icon={<CheckCircle2 size={18} />}
              iconVariant="amber"
              subtext="end_date >= start_date"
              pill={<StatusPill variant="success">Active Check</StatusPill>}
              loading={isTermsLoading}
            />
          </div>

          {/* Academic Terms Table Card */}
          <Card
            title="Academic Terms & Semesters"
            subtitle="Manage academic semester codes, application years, and start/end dates for enrollment and advising"
            icon={<Calendar size={18} />}
            noPadding={true}
            headerAction={
              <div className="academic-header-count">
                <span className="font-mono">{filteredTerms.length}</span> terms matching filters
              </div>
            }
          >
            {/* Toolbar */}
            <div className="academic-toolbar">
              <div className="toolbar-left">
                <div className="academic-search-box">
                  <SearchInput
                    placeholder="Search terms by code (e.g. 2025FA) or name..."
                    value={termSearch}
                    onChange={(e) => setTermSearch(e.target.value)}
                    onClear={() => setTermSearch("")}
                    size="sm"
                    fullWidth={true}
                  />
                </div>

                <div className="academic-filter-select">
                  <Select
                    size="sm"
                    value={termYearFilter}
                    onChange={(e) => setTermYearFilter(e.target.value)}
                    options={[
                      { value: "All", label: "All Application Years" },
                      ...termStats.uniqueYears.map((yr) => ({
                        value: String(yr),
                        label: `Year ${yr}`,
                      })),
                    ]}
                  />
                </div>
              </div>

              <div className="toolbar-right">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw size={14} className={isTermsRefetching ? "spin-icon" : ""} />}
                  onClick={() => refetchTerms()}
                  loading={isTermsRefetching}
                  title="Refresh terms calendar"
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={15} />}
                  onClick={handleOpenCreateTerm}
                >
                  New Academic Term
                </Button>
              </div>
            </div>

            {/* Academic Terms Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term Code</TableHead>
                  <TableHead>Term Name</TableHead>
                  <TableHead>Application Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Timeline Status</TableHead>
                  <TableHead align="right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTermsLoading ? (
                  <TableLoadingState colSpan={7} message="Loading academic terms..." />
                ) : filteredTerms.length === 0 ? (
                  <TableEmptyState
                    colSpan={7}
                    message={
                      termSearch || termYearFilter !== "All"
                        ? "No academic terms found matching your search and filter criteria."
                        : "No academic terms registered in this institution."
                    }
                    icon={<Calendar size={22} />}
                  />
                ) : (
                  filteredTerms.map((term) => (
                    <TableRow key={term.id}>
                      {/* Code */}
                      <TableCell isMono={true}>
                        <span className="term-code-pill font-semibold">{term.code}</span>
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        <span className="font-semibold text-dark">{term.name}</span>
                      </TableCell>

                      {/* Application Year */}
                      <TableCell isMono={true}>
                        <span className="year-pill font-mono">{term.application_year}</span>
                      </TableCell>

                      {/* Start Date */}
                      <TableCell isMono={true}>
                        <span className="date-badge">{term.start_date || "—"}</span>
                      </TableCell>

                      {/* End Date */}
                      <TableCell isMono={true}>
                        <span className="date-badge">{term.end_date || "—"}</span>
                      </TableCell>

                      {/* Timeline Status */}
                      <TableCell>
                        {getTermTimelineStatus(term.start_date, term.end_date)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <div className="action-buttons-group">
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={<Edit2 size={12} />}
                            onClick={() => handleOpenEditTerm(term)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="xs"
                            icon={<Trash2 size={12} />}
                            onClick={() => {
                              setTermToDelete(term);
                              setIsDeleteTermModalOpen(true);
                            }}
                            title="Delete academic term"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: PROGRAMS */}
      {/* ========================================================================= */}

      {/* Create Program Modal */}
      <Modal
        isOpen={isCreateProgramModalOpen}
        onClose={() => setIsCreateProgramModalOpen(false)}
        title="Create New Degree Program"
        subtitle="Register a new academic major or degree program in the catalog"
        icon={<GraduationCap size={18} />}
        size="md"
      >
        <form onSubmit={handleCreateProgram} className="academic-modal-form">
          <Input
            label="Program Code"
            placeholder="e.g. CS101 or BA-HIST"
            value={createProgramForm.code}
            onChange={(e) =>
              setCreateProgramForm({ ...createProgramForm, code: e.target.value })
            }
            helperText="Unique within institution"
            required
            fullWidth
          />

          <Input
            label="Program Full Name"
            placeholder="e.g. Computer Science (B.A.)"
            value={createProgramForm.name}
            onChange={(e) =>
              setCreateProgramForm({ ...createProgramForm, name: e.target.value })
            }
            required
            fullWidth
          />

          <div className="form-row-2">
            <Select
              label="Degree Level"
              value={createProgramForm.degree_level}
              onChange={(e) =>
                setCreateProgramForm({
                  ...createProgramForm,
                  degree_level: e.target.value,
                })
              }
              options={[
                { value: "BACHELOR", label: "Bachelor (Undergraduate)" },
                { value: "MASTER", label: "Master (Graduate)" },
                { value: "DOCTORATE", label: "Doctorate (Ph.D.)" },
                { value: "CERTIFICATE", label: "Certificate" },
                { value: "NON_DEGREE", label: "Non-Degree / Visiting" },
              ]}
              fullWidth
            />

            <Select
              label="Active Offering"
              value={createProgramForm.is_active ? "true" : "false"}
              onChange={(e) =>
                setCreateProgramForm({
                  ...createProgramForm,
                  is_active: e.target.value === "true",
                })
              }
              options={[
                { value: "true", label: "Active (Available)" },
                { value: "false", label: "Inactive (Archived)" },
              ]}
              fullWidth
            />
          </div>

          <div className="modal-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsCreateProgramModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<Plus size={15} />}
              loading={createProgramMutation.isPending}
            >
              Create Program
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Program Modal */}
      <Modal
        isOpen={isEditProgramModalOpen}
        onClose={() => setIsEditProgramModalOpen(false)}
        title="Edit Degree Program"
        subtitle={`Update catalog specifications for ${selectedProgram?.code || "Program"}`}
        icon={<GraduationCap size={18} />}
        size="md"
      >
        <form onSubmit={handleUpdateProgram} className="academic-modal-form">
          <Input
            label="Program Code"
            value={editProgramForm.code}
            onChange={(e) =>
              setEditProgramForm({ ...editProgramForm, code: e.target.value })
            }
            required
            fullWidth
          />

          <Input
            label="Program Full Name"
            value={editProgramForm.name}
            onChange={(e) =>
              setEditProgramForm({ ...editProgramForm, name: e.target.value })
            }
            required
            fullWidth
          />

          <div className="form-row-2">
            <Select
              label="Degree Level"
              value={editProgramForm.degree_level}
              onChange={(e) =>
                setEditProgramForm({
                  ...editProgramForm,
                  degree_level: e.target.value,
                })
              }
              options={[
                { value: "BACHELOR", label: "Bachelor (Undergraduate)" },
                { value: "MASTER", label: "Master (Graduate)" },
                { value: "DOCTORATE", label: "Doctorate (Ph.D.)" },
                { value: "CERTIFICATE", label: "Certificate" },
                { value: "NON_DEGREE", label: "Non-Degree / Visiting" },
              ]}
              fullWidth
            />

            <Select
              label="Active Status"
              value={editProgramForm.is_active ? "true" : "false"}
              onChange={(e) =>
                setEditProgramForm({
                  ...editProgramForm,
                  is_active: e.target.value === "true",
                })
              }
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              fullWidth
            />
          </div>

          <div className="modal-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsEditProgramModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<Save size={15} />}
              loading={updateProgramMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Program Confirmation Modal */}
      <Modal
        isOpen={isDeleteProgramModalOpen}
        onClose={() => setIsDeleteProgramModalOpen(false)}
        title="Delete Degree Program"
        subtitle="Are you sure you want to permanently delete this program?"
        icon={<AlertTriangle size={18} />}
        size="sm"
      >
        <div className="delete-confirm-body">
          <p>
            You are about to delete <strong>{programToDelete?.name} ({programToDelete?.code})</strong>.
          </p>
          <div className="delete-warning-box">
            <AlertTriangle size={16} />
            <span>
              If student applications or records reference this program, the database will block deletion.
            </span>
          </div>
          <div className="modal-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteProgramModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProgram}
              loading={deleteProgramMutation.isPending}
              icon={<Trash2 size={14} />}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODALS: ACADEMIC TERMS */}
      {/* ========================================================================= */}

      {/* Create Term Modal */}
      <Modal
        isOpen={isCreateTermModalOpen}
        onClose={() => setIsCreateTermModalOpen(false)}
        title="Create New Academic Term"
        subtitle="Define a new semester calendar window and application cycle"
        icon={<Calendar size={18} />}
        size="md"
      >
        <form onSubmit={handleCreateTerm} className="academic-modal-form">
          <div className="form-row-2">
            <Input
              label="Term Code"
              placeholder="e.g. 2026FA"
              value={createTermForm.code}
              onChange={(e) =>
                setCreateTermForm({ ...createTermForm, code: e.target.value })
              }
              helperText="Unique code pattern"
              required
              fullWidth
            />

            <Input
              label="Application Year"
              type="number"
              placeholder="e.g. 2026"
              value={createTermForm.application_year}
              onChange={(e) =>
                setCreateTermForm({
                  ...createTermForm,
                  application_year: e.target.value,
                })
              }
              required
              fullWidth
            />
          </div>

          <Input
            label="Term Full Name"
            placeholder="e.g. Fall 2026"
            value={createTermForm.name}
            onChange={(e) =>
              setCreateTermForm({ ...createTermForm, name: e.target.value })
            }
            required
            fullWidth
          />

          <div className="form-row-2">
            <Input
              label="Term Start Date"
              type="date"
              value={createTermForm.start_date || ""}
              onChange={(e) =>
                setCreateTermForm({ ...createTermForm, start_date: e.target.value })
              }
              required
              fullWidth
            />

            <Input
              label="Term End Date"
              type="date"
              value={createTermForm.end_date || ""}
              onChange={(e) =>
                setCreateTermForm({ ...createTermForm, end_date: e.target.value })
              }
              helperText="Must be >= Start Date"
              required
              fullWidth
            />
          </div>

          <div className="modal-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsCreateTermModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<Plus size={15} />}
              loading={createTermMutation.isPending}
            >
              Create Academic Term
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Term Modal */}
      <Modal
        isOpen={isEditTermModalOpen}
        onClose={() => setIsEditTermModalOpen(false)}
        title="Edit Academic Term"
        subtitle={`Update dates and specifications for ${selectedTerm?.code || "Term"}`}
        icon={<Calendar size={18} />}
        size="md"
      >
        <form onSubmit={handleUpdateTerm} className="academic-modal-form">
          <div className="form-row-2">
            <Input
              label="Term Code"
              value={editTermForm.code}
              onChange={(e) =>
                setEditTermForm({ ...editTermForm, code: e.target.value })
              }
              required
              fullWidth
            />

            <Input
              label="Application Year"
              type="number"
              value={editTermForm.application_year}
              onChange={(e) =>
                setEditTermForm({
                  ...editTermForm,
                  application_year: e.target.value,
                })
              }
              required
              fullWidth
            />
          </div>

          <Input
            label="Term Full Name"
            value={editTermForm.name}
            onChange={(e) =>
              setEditTermForm({ ...editTermForm, name: e.target.value })
            }
            required
            fullWidth
          />

          <div className="form-row-2">
            <Input
              label="Term Start Date"
              type="date"
              value={editTermForm.start_date || ""}
              onChange={(e) =>
                setEditTermForm({ ...editTermForm, start_date: e.target.value })
              }
              required
              fullWidth
            />

            <Input
              label="Term End Date"
              type="date"
              value={editTermForm.end_date || ""}
              onChange={(e) =>
                setEditTermForm({ ...editTermForm, end_date: e.target.value })
              }
              helperText="Must be >= Start Date"
              required
              fullWidth
            />
          </div>

          <div className="modal-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsEditTermModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={<Save size={15} />}
              loading={updateTermMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Term Confirmation Modal */}
      <Modal
        isOpen={isDeleteTermModalOpen}
        onClose={() => setIsDeleteTermModalOpen(false)}
        title="Delete Academic Term"
        subtitle="Are you sure you want to permanently delete this term?"
        icon={<AlertTriangle size={18} />}
        size="sm"
      >
        <div className="delete-confirm-body">
          <p>
            You are about to delete <strong>{termToDelete?.name} ({termToDelete?.code})</strong>.
          </p>
          <div className="delete-warning-box">
            <AlertTriangle size={16} />
            <span>
              If student applications or term records reference this semester, deletion will be blocked by foreign keys.
            </span>
          </div>
          <div className="modal-actions-row">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteTermModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTerm}
              loading={deleteTermMutation.isPending}
              icon={<Trash2 size={14} />}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
