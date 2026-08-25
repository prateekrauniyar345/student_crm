import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  GraduationCap,
  AlertTriangle,
  Award,
  BookOpen,
  RotateCw,
  Eye,
  Edit,
  Mail,
  Phone,
  Download,
  X,
  ShieldCheck,
  UserCheck,
  FileText,
  User,
  Layers,
} from "lucide-react";
import {
  useAllStudentProfiles,
  useUpdateStudentProfile,
} from "../../../hooks/useStudentProfiles";
import { useAllPeople, useUpdatePerson } from "../../../hooks/usePeople";
import { useAllStudentTermRecords } from "../../../hooks/useStudentTermRecords";
import { useAllApplications } from "../../../hooks/useApplications";
import { useAllPrograms } from "../../../hooks/usePrograms";
import { useAllAcademicTerms } from "../../../hooks/useAcademicTerms";
import { StatCard, StatusPill, Modal, Button, Spinner } from "../../../ui";
import "./StudentsRosterView.css";

export default function StudentsRosterView({ currentUser }) {
  // 1. Data queries
  const {
    data: studentProfiles = [],
    isLoading: isLoadingProfiles,
    refetch: refetchProfiles,
  } = useAllStudentProfiles();

  const {
    data: people = [],
    isLoading: isLoadingPeople,
    refetch: refetchPeople,
  } = useAllPeople();

  const {
    data: termRecords = [],
    isLoading: isLoadingRecords,
    refetch: refetchRecords,
  } = useAllStudentTermRecords();

  const {
    data: applications = [],
    isLoading: isLoadingApps,
    refetch: refetchApps,
  } = useAllApplications();

  const {
    data: programs = [],
    isLoading: isLoadingPrograms,
    refetch: refetchPrograms,
  } = useAllPrograms();

  const {
    data: academicTerms = [],
    isLoading: isLoadingTerms,
    refetch: refetchTerms,
  } = useAllAcademicTerms();

  // Mutations
  const updateProfileMutation = useUpdateStudentProfile();
  const updatePersonMutation = useUpdatePerson();

  // 2. Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStanding, setSelectedStanding] = useState("all");
  const [selectedCohort, setSelectedCohort] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. Modal / Drawer states
  const [drawerStudent, setDrawerStudent] = useState(null);
  const [drawerTab, setDrawerTab] = useState("transcript"); // 'transcript' | 'admissions' | 'contact'
  const [editModalStudent, setEditModalStudent] = useState(null);

  // Form states for edit modal
  const [editFormData, setEditFormData] = useState({
    student_status: "active",
    current_program_id: "",
    expected_graduation_date: "",
    student_number: "",
    preferred_name: "",
    phone: "",
  });

  const isLoading =
    isLoadingProfiles ||
    isLoadingPeople ||
    isLoadingRecords ||
    isLoadingApps ||
    isLoadingPrograms ||
    isLoadingTerms;

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchProfiles(),
      refetchPeople(),
      refetchRecords(),
      refetchApps(),
      refetchPrograms(),
      refetchTerms(),
    ]);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Lookup maps
  const peopleMap = useMemo(() => {
    const map = new Map();
    people.forEach((p) => map.set(p.id, p));
    return map;
  }, [people]);

  const programMap = useMemo(() => {
    const map = new Map();
    programs.forEach((p) => map.set(p.id, p));
    return map;
  }, [programs]);

  const termMap = useMemo(() => {
    const map = new Map();
    academicTerms.forEach((t) => map.set(t.id, t));
    return map;
  }, [academicTerms]);

  // Join full student composite data
  const fullStudents = useMemo(() => {
    return studentProfiles.map((sp) => {
      const person = peopleMap.get(sp.person_id) || {};
      const currentProg = programMap.get(sp.current_program_id);
      const entryTerm = termMap.get(sp.entry_term_id);

      // Student term records
      const studentRecords = termRecords.filter(
        (r) => r.person_id === sp.person_id
      );

      // Sort by term start_date descending
      studentRecords.sort((a, b) => {
        const termA = termMap.get(a.term_id);
        const termB = termMap.get(b.term_id);
        const dateA = termA?.start_date ? new Date(termA.start_date) : new Date(0);
        const dateB = termB?.start_date ? new Date(termB.start_date) : new Date(0);
        return dateB - dateA;
      });

      // Find latest completed term record
      const latestRecord =
        studentRecords.find(
          (r) =>
            r.cumulative_gpa !== null &&
            r.cumulative_gpa !== undefined &&
            r.credits_attempted > 0
        ) ||
        studentRecords[0] ||
        null;

      // Accumulated earned credits across all completed terms
      const totalCreditsEarned = studentRecords.reduce(
        (acc, r) => acc + (Number(r.credits_earned) || 0),
        0
      );

      const cumGpa =
        latestRecord?.cumulative_gpa !== null &&
        latestRecord?.cumulative_gpa !== undefined
          ? Number(latestRecord.cumulative_gpa)
          : null;

      const termGpa =
        latestRecord?.term_gpa !== null &&
        latestRecord?.term_gpa !== undefined
          ? Number(latestRecord.term_gpa)
          : null;

      const standing =
        latestRecord?.academic_standing ||
        (cumGpa !== null && cumGpa < 2.0
          ? "probation"
          : cumGpa !== null && cumGpa < 2.5
          ? "warning"
          : "good");

      const isAtRisk =
        sp.student_status === "active" &&
        (standing === "warning" ||
          standing === "probation" ||
          standing === "suspension" ||
          (cumGpa !== null && cumGpa < 2.5));

      // Parse cohort attributes from person.attributes JSONB
      const attrs = person.attributes || {};
      const isVeteran = !!(attrs.veteran || attrs.military_service || attrs.is_veteran);
      const isTransfer = !!(attrs.transfer || attrs.is_transfer || attrs.transfer_student);
      const isFirstGen = !!(attrs.first_gen || attrs.first_generation || attrs.is_first_gen);
      const isInternational = !!(attrs.international || attrs.is_international);
      const isHonors = !!(attrs.honors || attrs.gs_honors);

      // Student applications
      const studentApps = applications.filter(
        (a) => a.person_id === sp.person_id
      );

      return {
        profile: sp,
        person,
        personId: sp.person_id,
        fullName:
          person.first_name && person.last_name
            ? `${person.first_name} ${person.last_name}`
            : person.email || "Unknown Student",
        preferredName: person.preferred_name || null,
        email: person.email || "—",
        phone: person.phone || "—",
        studentNumber: sp.student_number || "—",
        status: sp.student_status || "active",
        program: currentProg,
        programCode: currentProg?.code || "UNKN",
        programName: currentProg?.name || "Undeclared",
        degreeLevel: currentProg?.degree_level || "Bachelor",
        entryTerm,
        entryTermName: entryTerm?.name || entryTerm?.code || "—",
        expectedGrad: sp.expected_graduation_date || null,
        cumGpa,
        termGpa,
        standing,
        isAtRisk,
        totalCreditsEarned,
        advisorMeetings: latestRecord?.advisor_meetings || 0,
        records: studentRecords,
        latestRecord,
        applications: studentApps,
        cohorts: {
          isVeteran,
          isTransfer,
          isFirstGen,
          isInternational,
          isHonors,
        },
      };
    });
  }, [studentProfiles, peopleMap, programMap, termMap, termRecords, applications]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalCount = fullStudents.length;
    const activeCandidates = fullStudents.filter((s) => s.status === "active");
    const activeCount = activeCandidates.length;
    const activeRate =
      totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) + "%" : "0%";

    const nonTraditionalCount = fullStudents.filter(
      (s) =>
        s.cohorts.isVeteran ||
        s.cohorts.isTransfer ||
        s.cohorts.isFirstGen ||
        s.cohorts.isInternational
    ).length;

    const attentionNeededCount = fullStudents.filter((s) => s.isAtRisk).length;

    return {
      totalCount,
      activeCount,
      activeRate,
      nonTraditionalCount,
      attentionNeededCount,
    };
  }, [fullStudents]);

  // Filtered Students Roster
  const filteredStudents = useMemo(() => {
    return fullStudents.filter((st) => {
      // 1. Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = st.fullName.toLowerCase().includes(query);
        const matchPreferred = st.preferredName?.toLowerCase().includes(query);
        const matchEmail = st.email.toLowerCase().includes(query);
        const matchId = st.studentNumber.toLowerCase().includes(query);
        const matchProg =
          st.programName.toLowerCase().includes(query) ||
          st.programCode.toLowerCase().includes(query);
        if (
          !matchName &&
          !matchPreferred &&
          !matchEmail &&
          !matchId &&
          !matchProg
        ) {
          return false;
        }
      }

      // 2. Program filter
      if (
        selectedProgram !== "all" &&
        st.profile.current_program_id !== selectedProgram
      ) {
        return false;
      }

      // 3. Status filter
      if (selectedStatus !== "all" && st.status !== selectedStatus) {
        return false;
      }

      // 4. Standing filter
      if (selectedStanding !== "all" && st.standing !== selectedStanding) {
        return false;
      }

      // 5. Cohort filter
      if (selectedCohort !== "all") {
        if (selectedCohort === "veteran" && !st.cohorts.isVeteran) return false;
        if (selectedCohort === "transfer" && !st.cohorts.isTransfer) return false;
        if (selectedCohort === "first_gen" && !st.cohorts.isFirstGen) return false;
        if (selectedCohort === "international" && !st.cohorts.isInternational)
          return false;
        if (selectedCohort === "honors" && !st.cohorts.isHonors) return false;
      }

      return true;
    });
  }, [
    fullStudents,
    searchTerm,
    selectedProgram,
    selectedStatus,
    selectedStanding,
    selectedCohort,
  ]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedProgram("all");
    setSelectedStatus("all");
    setSelectedStanding("all");
    setSelectedCohort("all");
  };

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setEditModalStudent(student);
    setEditFormData({
      student_status: student.status,
      current_program_id: student.profile.current_program_id || "",
      expected_graduation_date: student.expectedGrad || "",
      student_number: student.studentNumber !== "—" ? student.studentNumber : "",
      preferred_name: student.preferredName || "",
      phone: student.phone !== "—" ? student.phone : "",
    });
  };

  // Save Edit Modal
  const handleSaveEdit = async () => {
    if (!editModalStudent) return;

    try {
      // 1. Update Student Profile
      await updateProfileMutation.mutateAsync({
        personId: editModalStudent.personId,
        updates: {
          student_status: editFormData.student_status,
          current_program_id: editFormData.current_program_id || null,
          expected_graduation_date:
            editFormData.expected_graduation_date || null,
          student_number: editFormData.student_number,
        },
      });

      // 2. Update Person details
      await updatePersonMutation.mutateAsync({
        personId: editModalStudent.personId,
        updates: {
          preferred_name: editFormData.preferred_name || null,
          phone: editFormData.phone || null,
        },
      });

      // Close modal
      setEditModalStudent(null);
    } catch (err) {
      console.error("Failed to update student profile:", err);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      "Student ID",
      "Full Name",
      "Preferred Name",
      "Email",
      "Phone",
      "Program Code",
      "Program Name",
      "Degree Level",
      "Status",
      "Entry Term",
      "Expected Graduation",
      "Credits Earned",
      "Cumulative GPA",
      "Academic Standing",
      "Veteran",
      "Transfer",
      "First Gen",
      "International",
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.studentNumber}"`,
      `"${s.fullName}"`,
      `"${s.preferredName || ""}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.programCode}"`,
      `"${s.programName}"`,
      `"${s.degreeLevel}"`,
      `"${s.status}"`,
      `"${s.entryTermName}"`,
      `"${s.expectedGrad || ""}"`,
      s.totalCreditsEarned,
      s.cumGpa !== null ? s.cumGpa.toFixed(2) : "N/A",
      `"${s.standing}"`,
      s.cohorts.isVeteran ? "Yes" : "No",
      s.cohorts.isTransfer ? "Yes" : "No",
      s.cohorts.isFirstGen ? "Yes" : "No",
      s.cohorts.isInternational ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `columbia_gs_student_roster_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="roster-loading-state">
        <Spinner size="lg" />
        <p>Loading Columbia GS Student Directory & Degree Audits...</p>
      </div>
    );
  }

  return (
    <div className="students-roster-view">
      {/* 1. Header Banner */}
      <div className="roster-header-bar">
        <div className="roster-header-title">
          <div className="institution-badge">
            <ShieldCheck size={14} />
            <span>Columbia University • School of General Studies</span>
          </div>
          <h2>Student Roster & Degree Audits</h2>
          <p>
            Comprehensive directory of active degree candidates, non-traditional student cohorts, and longitudinal transcripts.
          </p>
        </div>

        <div className="roster-header-actions">
          <button
            className="btn-export-csv"
            onClick={handleExportCSV}
            title="Export filtered student roster to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            className={`btn-sync-roster ${isRefreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            title="Refresh student directory"
          >
            <RotateCw size={14} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Summary Grid (4 Cards) */}
      <div className="roster-kpi-grid">
        <StatCard
          label="Total Student Profiles"
          value={kpis.totalCount}
          icon={<Users size={18} />}
          iconVariant="blue"
          subtext="Institutional student records"
          pill={
            <StatusPill variant="neutral">
              All Cohorts
            </StatusPill>
          }
        />

        <StatCard
          label="Active Degree Candidates"
          value={kpis.activeCount}
          icon={<GraduationCap size={18} />}
          iconVariant="green"
          subtext={`${kpis.activeRate} matriculation rate`}
          pill={
            <StatusPill variant="success" dot>
              Active
            </StatusPill>
          }
        />

        <StatCard
          label="Non-Traditional Cohorts"
          value={kpis.nonTraditionalCount}
          icon={<Award size={18} />}
          iconVariant="purple"
          subtext="Transfer, Veteran & 1st-Gen"
          pill={
            <StatusPill variant="info">
              Columbia GS
            </StatusPill>
          }
        />

        <StatCard
          label="Academic Attention Needed"
          value={kpis.attentionNeededCount}
          icon={<AlertTriangle size={18} />}
          iconVariant={kpis.attentionNeededCount > 0 ? "danger" : "green"}
          subtext="Warning, probation, or GPA < 2.50"
          pill={
            <StatusPill
              variant={kpis.attentionNeededCount > 0 ? "warning" : "success"}
            >
              {kpis.attentionNeededCount > 0 ? "Action Required" : "All Healthy"}
            </StatusPill>
          }
        />
      </div>

      {/* 3. Multi-Dimensional Search & Filter Bar */}
      <div className="roster-filter-card">
        <div className="filter-search-row">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name, ID (CU-2024-0001), email, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="roster-search-input"
            />
            {searchTerm && (
              <button
                className="btn-clear-search"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-controls-group">
            {/* Program Filter */}
            <div className="select-wrapper">
              <Layers size={13} className="select-icon" />
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="roster-select"
                aria-label="Filter by degree program"
              >
                <option value="all">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="select-wrapper">
              <UserCheck size={13} className="select-icon" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="roster-select"
                aria-label="Filter by student status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="leave">Leave of Absence</option>
                <option value="graduated">Graduated</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Standing Filter */}
            <div className="select-wrapper">
              <ShieldCheck size={13} className="select-icon" />
              <select
                value={selectedStanding}
                onChange={(e) => setSelectedStanding(e.target.value)}
                className="roster-select"
                aria-label="Filter by academic standing"
              >
                <option value="all">All Standings</option>
                <option value="good">Good Standing</option>
                <option value="warning">Academic Warning</option>
                <option value="probation">Probation</option>
                <option value="suspension">Suspension</option>
              </select>
            </div>

            {/* Cohort Filter */}
            <div className="select-wrapper">
              <Award size={13} className="select-icon" />
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="roster-select"
                aria-label="Filter by cohort badge"
              >
                <option value="all">All Cohorts</option>
                <option value="veteran">🎖️ Veteran</option>
                <option value="transfer">🔄 Transfer</option>
                <option value="first_gen">🌟 First-Gen</option>
                <option value="international">🌐 International</option>
                <option value="honors">🏆 GS Honors</option>
              </select>
            </div>

            {(searchTerm ||
              selectedProgram !== "all" ||
              selectedStatus !== "all" ||
              selectedStanding !== "all" ||
              selectedCohort !== "all") && (
              <button
                className="btn-reset-filters"
                onClick={handleResetFilters}
                title="Reset all filters"
              >
                <RotateCw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="filter-summary-row">
          <span className="results-count">
            Showing <strong>{filteredStudents.length}</strong> of{" "}
            <strong>{fullStudents.length}</strong> students
          </span>
          {selectedCohort !== "all" && (
            <span className="active-filter-badge">
              Cohort: {selectedCohort.replace("_", "-").toUpperCase()}
            </span>
          )}
          {selectedStanding !== "all" && (
            <span className="active-filter-badge">
              Standing: {selectedStanding.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* 4. Student Roster Table */}
      <div className="roster-table-card">
        {filteredStudents.length === 0 ? (
          <div className="roster-empty-state">
            <Users size={36} className="empty-icon" />
            <h3>No matching students found</h3>
            <p>Try adjusting your search query, program, status, or cohort filters.</p>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="roster-table-wrapper">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Student & Cohorts</th>
                  <th>Student ID</th>
                  <th>Degree Program</th>
                  <th>Entry Term</th>
                  <th>Credits</th>
                  <th>Cum. GPA</th>
                  <th>Status & Standing</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st) => {
                  const isProbation =
                    st.standing === "probation" || st.standing === "suspension";
                  const isWarning = st.standing === "warning";

                  return (
                    <tr
                      key={st.personId}
                      className={`roster-row ${st.isAtRisk ? "row-at-risk" : ""}`}
                    >
                      {/* Name & Cohorts */}
                      <td>
                        <div className="student-identity-cell">
                          <div className="student-name-row">
                            <span className="student-full-name">{st.fullName}</span>
                            {st.preferredName && (
                              <span className="student-preferred-name">
                                ("{st.preferredName}")
                              </span>
                            )}
                          </div>
                          <span className="student-email">{st.email}</span>

                          {/* Cohort Badges */}
                          <div className="cohort-tags-row">
                            {st.cohorts.isVeteran && (
                              <span
                                className="cohort-tag tag-veteran"
                                title="U.S. Military Veteran"
                              >
                                🎖️ Veteran
                              </span>
                            )}
                            {st.cohorts.isTransfer && (
                              <span
                                className="cohort-tag tag-transfer"
                                title="Transfer Student"
                              >
                                Transfer
                              </span>
                            )}
                            {st.cohorts.isFirstGen && (
                              <span
                                className="cohort-tag tag-firstgen"
                                title="First-Generation College Student"
                              >
                                🌟 First-Gen
                              </span>
                            )}
                            {st.cohorts.isInternational && (
                              <span
                                className="cohort-tag tag-international"
                                title="International Student"
                              >
                                🌐 International
                              </span>
                            )}
                            {st.cohorts.isHonors && (
                              <span
                                className="cohort-tag tag-honors"
                                title="School of General Studies Honors"
                              >
                                🏆 Honors
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td>
                        <span className="student-id-mono font-mono">
                          {st.studentNumber}
                        </span>
                      </td>

                      {/* Degree Program */}
                      <td>
                        <div className="program-cell">
                          <span className="program-code-pill font-mono">
                            {st.programCode}
                          </span>
                          <span className="program-full-title">
                            {st.programName}
                          </span>
                          <span className="degree-level-sub">
                            {st.degreeLevel}
                          </span>
                        </div>
                      </td>

                      {/* Entry Term */}
                      <td>
                        <div className="entry-term-cell">
                          <span className="entry-term-title">
                            {st.entryTermName}
                          </span>
                          {st.expectedGrad && (
                            <span className="grad-date-sub font-mono">
                              Grad: {st.expectedGrad.split("-")[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Credits */}
                      <td>
                        <div className="credits-cell font-mono">
                          <strong>{st.totalCreditsEarned}</strong>
                          <span className="credits-sub">earned</span>
                        </div>
                      </td>

                      {/* Cum. GPA */}
                      <td>
                        <div className="gpa-cell font-mono">
                          <span
                            className={`gpa-value ${
                              st.cumGpa !== null && st.cumGpa < 2.0
                                ? "text-danger font-bold"
                                : st.cumGpa !== null && st.cumGpa < 2.5
                                ? "text-warning font-bold"
                                : "font-bold"
                            }`}
                          >
                            {st.cumGpa !== null ? st.cumGpa.toFixed(2) : "—"}
                          </span>
                          {st.termGpa !== null && (
                            <span className="term-gpa-sub">
                              Term: {st.termGpa.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status & Standing */}
                      <td>
                        <div className="status-standing-cell">
                          <StatusPill
                            variant={
                              st.status === "active"
                                ? "success"
                                : st.status === "leave"
                                ? "warning"
                                : st.status === "graduated"
                                ? "info"
                                : "neutral"
                            }
                            dot
                          >
                            {st.status.charAt(0).toUpperCase() +
                              st.status.slice(1)}
                          </StatusPill>

                          <StatusPill
                            variant={
                              isProbation
                                ? "danger"
                                : isWarning
                                ? "warning"
                                : "success"
                            }
                          >
                            {st.standing.charAt(0).toUpperCase() +
                              st.standing.slice(1)}
                          </StatusPill>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="action-buttons-group">
                          <button
                            className="btn-action-view"
                            onClick={() => setDrawerStudent(st)}
                            title="Open 360° Academic Transcript Drawer"
                          >
                            <Eye size={14} />
                            <span>360° View</span>
                          </button>
                          <button
                            className="btn-action-edit"
                            onClick={() => handleOpenEdit(st)}
                            title="Edit Student Profile"
                          >
                            <Edit size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Student 360° Slide-Over Drawer */}
      {drawerStudent && (
        <div className="drawer-overlay" onClick={() => setDrawerStudent(null)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            aria-label="Student 360 Degree Profile"
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-student-hero">
                <div className="drawer-avatar">
                  {drawerStudent.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="drawer-hero-info">
                  <div className="drawer-name-row">
                    <h3>{drawerStudent.fullName}</h3>
                    {drawerStudent.preferredName && (
                      <span className="drawer-preferred">
                        ("{drawerStudent.preferredName}")
                      </span>
                    )}
                  </div>
                  <span className="drawer-email font-mono">
                    {drawerStudent.email}
                  </span>
                  <div className="drawer-pills-row">
                    <StatusPill
                      variant={
                        drawerStudent.status === "active" ? "success" : "warning"
                      }
                      dot
                    >
                      {drawerStudent.status.toUpperCase()}
                    </StatusPill>
                    <StatusPill
                      variant={
                        drawerStudent.standing === "probation" ||
                        drawerStudent.standing === "suspension"
                          ? "danger"
                          : drawerStudent.standing === "warning"
                          ? "warning"
                          : "success"
                      }
                    >
                      {drawerStudent.standing.toUpperCase()} STANDING
                    </StatusPill>
                    <span className="drawer-id-tag font-mono">
                      {drawerStudent.studentNumber}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="btn-drawer-close"
                onClick={() => setDrawerStudent(null)}
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="drawer-quick-stats">
              <div className="quick-stat-box">
                <span className="stat-box-label">CUMULATIVE GPA</span>
                <span className="stat-box-val font-mono">
                  {drawerStudent.cumGpa !== null
                    ? drawerStudent.cumGpa.toFixed(2)
                    : "N/A"}
                </span>
              </div>
              <div className="quick-stat-box">
                <span className="stat-box-label">CREDITS EARNED</span>
                <span className="stat-box-val font-mono">
                  {drawerStudent.totalCreditsEarned} / 120
                </span>
              </div>
              <div className="quick-stat-box">
                <span className="stat-box-label">ENTRY TERM</span>
                <span className="stat-box-val font-mono">
                  {drawerStudent.entryTermName}
                </span>
              </div>
              <div className="quick-stat-box">
                <span className="stat-box-label">ADVISOR MTGS</span>
                <span className="stat-box-val font-mono">
                  {drawerStudent.advisorMeetings}
                </span>
              </div>
            </div>

            {/* Drawer Tabs Navigation */}
            <div className="drawer-tabs-nav">
              <button
                className={`drawer-tab-btn ${
                  drawerTab === "transcript" ? "active-tab" : ""
                }`}
                onClick={() => setDrawerTab("transcript")}
              >
                <FileText size={15} />
                <span>Academic Transcript ({drawerStudent.records.length})</span>
              </button>
              <button
                className={`drawer-tab-btn ${
                  drawerTab === "admissions" ? "active-tab" : ""
                }`}
                onClick={() => setDrawerTab("admissions")}
              >
                <BookOpen size={15} />
                <span>
                  Admissions Backstory ({drawerStudent.applications.length})
                </span>
              </button>
              <button
                className={`drawer-tab-btn ${
                  drawerTab === "contact" ? "active-tab" : ""
                }`}
                onClick={() => setDrawerTab("contact")}
              >
                <User size={15} />
                <span>Contact & Cohorts</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="drawer-body">
              {/* Tab 1: Academic Transcript */}
              {drawerTab === "transcript" && (
                <div className="tab-transcript-panel">
                  <div className="transcript-section-title">
                    <h4>Longitudinal Semester History</h4>
                    <p>
                      Chronological academic terms, grade point averages, and standing transitions.
                    </p>
                  </div>

                  {drawerStudent.records.length === 0 ? (
                    <div className="drawer-empty-tab">
                      <p>No completed term records on file for this student.</p>
                    </div>
                  ) : (
                    <div className="transcript-table-wrap">
                      <table className="transcript-table">
                        <thead>
                          <tr>
                            <th>Academic Term</th>
                            <th>Program at Term</th>
                            <th>Attempted</th>
                            <th>Earned</th>
                            <th>Term GPA</th>
                            <th>Cum. GPA</th>
                            <th>Standing</th>
                            <th>Advisor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drawerStudent.records.map((rec) => {
                            const term = termMap.get(rec.term_id);
                            const prog = programMap.get(rec.program_id);
                            return (
                              <tr key={rec.id}>
                                <td>
                                  <strong>
                                    {term?.name || term?.code || "Term"}
                                  </strong>
                                </td>
                                <td>
                                  <span className="font-mono badge-program-tag">
                                    {prog?.code || drawerStudent.programCode}
                                  </span>
                                </td>
                                <td className="font-mono">
                                  {rec.credits_attempted} cr
                                </td>
                                <td className="font-mono font-bold">
                                  {rec.credits_earned} cr
                                </td>
                                <td className="font-mono">
                                  {rec.term_gpa !== null
                                    ? Number(rec.term_gpa).toFixed(2)
                                    : "—"}
                                </td>
                                <td className="font-mono font-bold">
                                  <span
                                    className={
                                      rec.cumulative_gpa !== null &&
                                      Number(rec.cumulative_gpa) < 2.0
                                        ? "text-danger"
                                        : rec.cumulative_gpa !== null &&
                                          Number(rec.cumulative_gpa) < 2.5
                                        ? "text-warning"
                                        : ""
                                    }
                                  >
                                    {rec.cumulative_gpa !== null
                                      ? Number(rec.cumulative_gpa).toFixed(2)
                                      : "—"}
                                  </span>
                                </td>
                                <td>
                                  <StatusPill
                                    variant={
                                      rec.academic_standing === "probation" ||
                                      rec.academic_standing === "suspension"
                                        ? "danger"
                                        : rec.academic_standing === "warning"
                                        ? "warning"
                                        : "success"
                                    }
                                    dot
                                  >
                                    {rec.academic_standing
                                      ? rec.academic_standing.toUpperCase()
                                      : "GOOD"}
                                  </StatusPill>
                                </td>
                                <td>
                                  <span className="font-mono text-muted">
                                    {rec.advisor_meetings || 0} mtgs
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Admissions Backstory */}
              {drawerTab === "admissions" && (
                <div className="tab-admissions-panel">
                  <div className="transcript-section-title">
                    <h4>Admissions Intake Record</h4>
                    <p>
                      Historical application submission, decision codes, and matriculation confirmations.
                    </p>
                  </div>

                  {drawerStudent.applications.length === 0 ? (
                    <div className="drawer-empty-tab">
                      <p>No formal application record linked to this person.</p>
                    </div>
                  ) : (
                    <div className="applications-card-list">
                      {drawerStudent.applications.map((app) => {
                        const appProg = programMap.get(app.program_id);
                        return (
                          <div key={app.id} className="app-detail-card">
                            <div className="app-detail-header">
                              <div>
                                <h5>
                                  Cycle {app.application_year} Application •{" "}
                                  {appProg?.name || "Program"}
                                </h5>
                                <span className="app-meta font-mono">
                                  Submitted:{" "}
                                  {app.submitted_at
                                    ? new Date(
                                        app.submitted_at
                                      ).toLocaleDateString()
                                    : "Incomplete"}
                                </span>
                              </div>
                              <StatusPill variant="info">
                                {app.stage.toUpperCase()}
                              </StatusPill>
                            </div>

                            <div className="app-grid-details">
                              <div className="app-stat-row">
                                <span className="app-label">Decision Code:</span>
                                <span className="app-val font-mono">
                                  {app.decision_code
                                    ? `${app.decision_code} (Accepted)`
                                    : "Pending"}
                                </span>
                              </div>
                              <div className="app-stat-row">
                                <span className="app-label">Reply Code:</span>
                                <span className="app-val font-mono">
                                  {app.reply_code
                                    ? `${app.reply_code} (Confirmed Yes)`
                                    : "None"}
                                </span>
                              </div>
                              <div className="app-stat-row">
                                <span className="app-label">
                                  Applicant Source:
                                </span>
                                <span className="app-val">
                                  {app.applicant_source || "Direct Portal"}
                                </span>
                              </div>
                              <div className="app-stat-row">
                                <span className="app-label">
                                  Transfer Institution:
                                </span>
                                <span className="app-val">
                                  {app.transfer_institution_type
                                    ? app.transfer_institution_type
                                        .replace("_", " ")
                                        .toUpperCase()
                                    : "First-Year Applicant"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Contact & Cohorts */}
              {drawerTab === "contact" && (
                <div className="tab-contact-panel">
                  <div className="transcript-section-title">
                    <h4>Student Information & Identity</h4>
                    <p>Institutional contact data and non-traditional cohort tags.</p>
                  </div>

                  <div className="contact-info-card">
                    <div className="contact-grid">
                      <div className="contact-item">
                        <span className="contact-label">Email Address</span>
                        <div className="contact-val-group">
                          <Mail size={14} className="contact-icon" />
                          <span className="font-mono">{drawerStudent.email}</span>
                        </div>
                      </div>

                      <div className="contact-item">
                        <span className="contact-label">Phone Number</span>
                        <div className="contact-val-group">
                          <Phone size={14} className="contact-icon" />
                          <span className="font-mono">{drawerStudent.phone}</span>
                        </div>
                      </div>

                      <div className="contact-item">
                        <span className="contact-label">Date of Birth</span>
                        <span className="font-mono">
                          {drawerStudent.person.date_of_birth || "Not Provided"}
                        </span>
                      </div>

                      <div className="contact-item">
                        <span className="contact-label">Expected Graduation</span>
                        <span className="font-mono">
                          {drawerStudent.expectedGrad || "Not Specified"}
                        </span>
                      </div>
                    </div>

                    <div className="cohorts-deep-breakdown">
                      <h5>Non-Traditional Cohort Classifications</h5>
                      <div className="cohorts-badges-large">
                        <div
                          className={`cohort-box ${
                            drawerStudent.cohorts.isVeteran ? "active-cohort" : ""
                          }`}
                        >
                          <span>U.S. Military Veteran</span>
                          <strong>
                            {drawerStudent.cohorts.isVeteran ? "Verified" : "No"}
                          </strong>
                        </div>
                        <div
                          className={`cohort-box ${
                            drawerStudent.cohorts.isTransfer ? "active-cohort" : ""
                          }`}
                        >
                          <span>Transfer Student</span>
                          <strong>
                            {drawerStudent.cohorts.isTransfer ? "Verified" : "No"}
                          </strong>
                        </div>
                        <div
                          className={`cohort-box ${
                            drawerStudent.cohorts.isFirstGen ? "active-cohort" : ""
                          }`}
                        >
                          <span>First-Generation</span>
                          <strong>
                            {drawerStudent.cohorts.isFirstGen ? "Yes" : "No"}
                          </strong>
                        </div>
                        <div
                          className={`cohort-box ${
                            drawerStudent.cohorts.isInternational
                              ? "active-cohort"
                              : ""
                          }`}
                        >
                          <span>International Student</span>
                          <strong>
                            {drawerStudent.cohorts.isInternational ? "Yes" : "No"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="drawer-footer">
              <a
                href={`mailto:${drawerStudent.email}`}
                className="btn-drawer-email"
                target="_blank"
                rel="noreferrer"
              >
                <Mail size={14} />
                <span>Email Student</span>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleOpenEdit(drawerStudent);
                }}
              >
                <Edit size={14} />
                <span>Edit Profile</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDrawerStudent(null)}
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Edit Student Profile Modal */}
      {editModalStudent && (
        <Modal
          isOpen={true}
          onClose={() => setEditModalStudent(null)}
          title={`Edit Student Profile`}
          subtitle={`${editModalStudent.studentNumber} • ${editModalStudent.fullName}`}
          size="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalStudent(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={
                  updateProfileMutation.isPending ||
                  updatePersonMutation.isPending
                }
                onClick={handleSaveEdit}
              >
                Save Student Changes
              </Button>
            </>
          }
        >
          <div className="edit-form-grid">
            {/* Student Number */}
            <div className="form-group">
              <label>Student Number (ID) *</label>
              <input
                type="text"
                className="form-input font-mono"
                value={editFormData.student_number}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    student_number: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Enrollment Status *</label>
              <select
                className="form-select"
                value={editFormData.student_status}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    student_status: e.target.value,
                  })
                }
                required
              >
                <option value="active">Active</option>
                <option value="leave">Leave of Absence</option>
                <option value="graduated">Graduated</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Current Program */}
            <div className="form-group">
              <label>Current Degree Program *</label>
              <select
                className="form-select"
                value={editFormData.current_program_id}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    current_program_id: e.target.value,
                  })
                }
                required
              >
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.code} - {prog.name} ({prog.degree_level})
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Graduation Date */}
            <div className="form-group">
              <label>Expected Graduation Date</label>
              <input
                type="date"
                className="form-input font-mono"
                value={editFormData.expected_graduation_date}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    expected_graduation_date: e.target.value,
                  })
                }
              />
            </div>

            {/* Preferred Name */}
            <div className="form-group">
              <label>Preferred Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex"
                value={editFormData.preferred_name}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    preferred_name: e.target.value,
                  })
                }
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-input font-mono"
                placeholder="+1 (212) 555-0199"
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
