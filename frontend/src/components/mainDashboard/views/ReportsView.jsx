import React, { useState, useMemo, useRef } from "react";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Layers,
  Search,
  RotateCw,
  ShieldCheck,
  Award,
  AlertTriangle,
  Users,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ChevronRight,
  Eye,
  Sliders,
  Calendar,
  Building,
  GraduationCap,
  X,
  FileText,
} from "lucide-react";
import { useAllStudentProfiles } from "../../../hooks/useStudentProfiles";
import { useAllStudentTermRecords } from "../../../hooks/useStudentTermRecords";
import { useAllApplications } from "../../../hooks/useApplications";
import { useAllPeople } from "../../../hooks/usePeople";
import { useAllPrograms } from "../../../hooks/usePrograms";
import { useAllAcademicTerms } from "../../../hooks/useAcademicTerms";
import { StatCard, StatusPill, Modal, Button, Spinner } from "../../../ui";
import "./ReportsView.css";

export default function ReportsView({ currentUser }) {
  // 1. Fetch all data sets
  const { data: studentProfiles = [], isLoading: loadingProfiles, refetch: refetchProfiles } =
    useAllStudentProfiles();
  const { data: termRecords = [], isLoading: loadingTermsRec, refetch: refetchTermRecs } =
    useAllStudentTermRecords();
  const { data: applications = [], isLoading: loadingApps, refetch: refetchApps } =
    useAllApplications();
  const { data: people = [], isLoading: loadingPeople, refetch: refetchPeople } =
    useAllPeople();
  const { data: programs = [], isLoading: loadingPrograms, refetch: refetchPrograms } =
    useAllPrograms();
  const { data: academicTerms = [], isLoading: loadingTerms, refetch: refetchTerms } =
    useAllAcademicTerms();

  const isLoading =
    loadingProfiles ||
    loadingTermsRec ||
    loadingApps ||
    loadingPeople ||
    loadingPrograms ||
    loadingTerms;

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState("builder"); // 'builder' | 'templates' | 'integrity'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. Custom Report Builder State (Argos Style)
  const [reportDomain, setReportDomain] = useState("students"); // 'students' | 'admissions' | 'cohorts' | 'programs'
  const [filterCycle, setFilterCycle] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStanding, setFilterStanding] = useState("all");
  const [filterCohort, setFilterCohort] = useState("all");
  const [filterGpa, setFilterGpa] = useState("all"); // 'all' | 'lt20' | 'lt25' | 'gte35' | 'gte38'
  const [reportTitle, setReportTitle] = useState(
    "Columbia GS Academic Health & Enrollment Audit"
  );

  // Column Selector State
  const [selectedColumns, setSelectedColumns] = useState({
    student_number: true,
    full_name: true,
    email: true,
    program: true,
    degree_level: true,
    entry_term: true,
    total_credits: true,
    cumulative_gpa: true,
    term_gpa: true,
    academic_standing: true,
    status: true,
    cohort_tags: true,
  });

  // Modal State for Branded Print Preview
  const [isBrandedModalOpen, setIsBrandedModalOpen] = useState(false);
  const printableRef = useRef(null);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchProfiles(),
      refetchTermRecs(),
      refetchApps(),
      refetchPeople(),
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

  // Aggregate student term records by person_id (latest term & totals)
  const studentTermSummaries = useMemo(() => {
    const map = new Map();
    termRecords.forEach((rec) => {
      if (!map.has(rec.person_id)) {
        map.set(rec.person_id, {
          totalCreditsEarned: 0,
          latestTermRecord: rec,
          termsCount: 0,
        });
      }
      const data = map.get(rec.person_id);
      data.totalCreditsEarned += Number(rec.credits_earned || 0);
      data.termsCount += 1;
      // Update if this term record has later created_at or higher credits
      if (
        !data.latestTermRecord ||
        new Date(rec.created_at) > new Date(data.latestTermRecord.created_at)
      ) {
        data.latestTermRecord = rec;
      }
    });
    return map;
  }, [termRecords]);

  // 4. Generate Filtered Report Dataset
  const generatedReportData = useMemo(() => {
    if (reportDomain === "students" || reportDomain === "cohorts") {
      return studentProfiles
        .map((profile) => {
          const person = peopleMap.get(profile.person_id) || {};
          const prog = programMap.get(profile.current_program_id);
          const termSummary = studentTermSummaries.get(profile.person_id);
          const latestTerm = termSummary?.latestTermRecord;
          const entryTerm = termMap.get(profile.entry_term_id);
          const attrs = person.attributes || {};

          const cumGpaNum =
            latestTerm?.cumulative_gpa !== null && latestTerm?.cumulative_gpa !== undefined
              ? Number(latestTerm.cumulative_gpa)
              : null;
          const termGpaNum =
            latestTerm?.term_gpa !== null && latestTerm?.term_gpa !== undefined
              ? Number(latestTerm.term_gpa)
              : null;

          return {
            id: profile.person_id,
            student_number: profile.student_number || "UNASSIGNED",
            full_name: `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Student",
            preferred_name: person.preferred_name || "",
            email: person.email || "—",
            phone: person.phone || "—",
            program_code: prog?.code || "UNKN",
            program_name: prog?.name || "Undeclared",
            degree_level: prog?.degree_level || "Bachelor",
            entry_term: entryTerm?.name || entryTerm?.code || "—",
            entry_year: entryTerm?.application_year || null,
            total_credits: termSummary?.totalCreditsEarned || 0,
            cumulative_gpa: cumGpaNum !== null ? cumGpaNum.toFixed(2) : "N/A",
            cumGpaRaw: cumGpaNum,
            term_gpa: termGpaNum !== null ? termGpaNum.toFixed(2) : "N/A",
            termGpaRaw: termGpaNum,
            academic_standing: latestTerm?.academic_standing || "good_standing",
            status: profile.student_status || "active",
            is_veteran: !!attrs.veteran,
            is_transfer: !!attrs.transfer,
            is_first_gen: !!attrs.first_gen,
            is_international: !!attrs.international,
            is_honors: !!attrs.honors,
          };
        })
        .filter((row) => {
          // Filter by cycle/year
          if (filterCycle !== "all" && row.entry_year !== Number(filterCycle)) {
            return false;
          }
          // Filter by program
          if (filterProgram !== "all" && row.program_code !== filterProgram) {
            return false;
          }
          // Filter by status
          if (filterStatus !== "all" && row.status !== filterStatus) {
            return false;
          }
          // Filter by standing
          if (filterStanding !== "all") {
            if (filterStanding === "at_risk_any") {
              const isNonGood =
                row.academic_standing !== "good_standing" &&
                row.academic_standing !== "good";
              const isLowGpa = row.cumGpaRaw !== null && row.cumGpaRaw < 2.5;
              if (!isNonGood && !isLowGpa) return false;
            } else if (row.academic_standing !== filterStanding) {
              return false;
            }
          }
          // Filter by Cohort
          if (filterCohort !== "all") {
            if (filterCohort === "veteran" && !row.is_veteran) return false;
            if (filterCohort === "transfer" && !row.is_transfer) return false;
            if (filterCohort === "first_gen" && !row.is_first_gen) return false;
            if (filterCohort === "international" && !row.is_international)
              return false;
            if (filterCohort === "honors" && !row.is_honors) return false;
          }
          // Filter by GPA
          if (filterGpa !== "all") {
            if (row.cumGpaRaw === null) return false;
            if (filterGpa === "lt20" && row.cumGpaRaw >= 2.0) return false;
            if (filterGpa === "lt25" && row.cumGpaRaw >= 2.5) return false;
            if (filterGpa === "gte35" && row.cumGpaRaw < 3.5) return false;
            if (filterGpa === "gte38" && row.cumGpaRaw < 3.8) return false;
          }
          return true;
        });
    }

    if (reportDomain === "admissions") {
      return applications
        .map((app) => {
          const person = peopleMap.get(app.person_id) || {};
          const prog = programMap.get(app.program_id);
          const term = termMap.get(app.term_id);
          const attrs = person.attributes || {};

          let turnaroundDays = null;
          if (app.submitted_at && app.decided_at) {
            turnaroundDays = Math.round(
              (new Date(app.decided_at).getTime() -
                new Date(app.submitted_at).getTime()) /
                (1000 * 60 * 60 * 24)
            );
          }

          return {
            id: app.id,
            student_number: `APP-${app.id.slice(0, 6).toUpperCase()}`,
            full_name: `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email || "Applicant",
            preferred_name: person.preferred_name || "",
            email: person.email || "—",
            phone: person.phone || "—",
            program_code: prog?.code || "UNKN",
            program_name: prog?.name || "Undeclared",
            degree_level: prog?.degree_level || "Bachelor",
            entry_term: term?.name || `Cycle ${app.application_year}`,
            entry_year: app.application_year,
            total_credits: 0,
            cumulative_gpa: "—",
            term_gpa: "—",
            academic_standing: app.decision_code || "Pending Review",
            status: app.stage,
            reply_code: app.reply_code || "—",
            transfer_origin: app.transfer_institution_type || "Direct",
            applicant_source: app.applicant_source || "Direct Portal",
            turnaround_days: turnaroundDays !== null ? `${turnaroundDays} d` : "Pending",
            is_veteran: !!attrs.veteran,
            is_transfer: !!attrs.transfer,
            is_first_gen: !!attrs.first_gen,
            is_international: !!attrs.international,
            is_honors: false,
          };
        })
        .filter((row) => {
          if (filterCycle !== "all" && row.entry_year !== Number(filterCycle)) {
            return false;
          }
          if (filterProgram !== "all" && row.program_code !== filterProgram) {
            return false;
          }
          if (filterStatus !== "all" && row.status !== filterStatus) {
            return false;
          }
          if (filterCohort !== "all") {
            if (filterCohort === "veteran" && !row.is_veteran) return false;
            if (filterCohort === "transfer" && !row.is_transfer) return false;
            if (filterCohort === "first_gen" && !row.is_first_gen) return false;
            if (filterCohort === "international" && !row.is_international)
              return false;
          }
          return true;
        });
    }

    return [];
  }, [
    reportDomain,
    studentProfiles,
    applications,
    peopleMap,
    programMap,
    termMap,
    studentTermSummaries,
    filterCycle,
    filterProgram,
    filterStatus,
    filterStanding,
    filterCohort,
    filterGpa,
  ]);

  // Aggregate Metrics for Header / Branded Summary
  const summaryMetrics = useMemo(() => {
    const totalCount = generatedReportData.length;
    const gpas = generatedReportData
      .map((r) => (r.cumGpaRaw !== undefined ? r.cumGpaRaw : null))
      .filter((g) => g !== null);
    const avgGpa =
      gpas.length > 0
        ? (gpas.reduce((acc, g) => acc + g, 0) / gpas.length).toFixed(2)
        : "N/A";
    const totalCredits = generatedReportData.reduce(
      (acc, r) => acc + Number(r.total_credits || 0),
      0
    );
    const activeCount = generatedReportData.filter(
      (r) => r.status === "active" || r.status === "committed" || r.status === "enrolled"
    ).length;
    const atRiskCount = generatedReportData.filter(
      (r) =>
        r.academic_standing === "probation" ||
        r.academic_standing === "academic_warning" ||
        r.academic_standing === "warning" ||
        (r.cumGpaRaw !== null && r.cumGpaRaw < 2.5)
    ).length;

    return { totalCount, avgGpa, totalCredits, activeCount, atRiskCount };
  }, [generatedReportData]);

  // Column toggle helper
  const toggleColumn = (colKey) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [colKey]: !prev[colKey],
    }));
  };

  // Launch a Pre-Built Template
  const handleLaunchTemplate = (templateKey) => {
    setActiveTab("builder");
    if (templateKey === "deans_list") {
      setReportDomain("students");
      setReportTitle("Dean's List Academic Excellence Audit (GPA ≥ 3.60)");
      setFilterStatus("active");
      setFilterStanding("all");
      setFilterCohort("all");
      setFilterGpa("gte35");
    } else if (templateKey === "probation_triage") {
      setReportDomain("students");
      setReportTitle("Academic Warning & Probation Risk Triage Audit");
      setFilterStatus("active");
      setFilterStanding("at_risk_any");
      setFilterCohort("all");
      setFilterGpa("all");
    } else if (templateKey === "veterans_cert") {
      setReportDomain("cohorts");
      setReportTitle("U.S. Military Veterans & Service Members Enrollment Audit");
      setFilterStatus("active");
      setFilterStanding("all");
      setFilterCohort("veteran");
      setFilterGpa("all");
    } else if (templateKey === "transfer_articulation") {
      setReportDomain("cohorts");
      setReportTitle("Community College Transfer Articulation Progress Audit");
      setFilterStatus("active");
      setFilterStanding("all");
      setFilterCohort("transfer");
      setFilterGpa("all");
    } else if (templateKey === "admissions_yield") {
      setReportDomain("admissions");
      setReportTitle("Admissions Cycle Yield, Offers & Melt Diagnostics");
      setFilterCycle("2024");
      setFilterStatus("all");
      setFilterCohort("all");
    } else if (templateKey === "senior_audit") {
      setReportDomain("students");
      setReportTitle("Senior Degree Audit (Active Candidates ≥ 90 Credits)");
      setFilterStatus("active");
      setFilterStanding("all");
      setFilterCohort("all");
      setFilterGpa("all");
    }
  };

  // 5. Multi-Format Export Engines

  // A. CSV Export
  const handleExportCSV = () => {
    if (generatedReportData.length === 0) return;

    const headers = [];
    if (selectedColumns.student_number) headers.push("Student/App ID");
    if (selectedColumns.full_name) headers.push("Full Name");
    if (selectedColumns.email) headers.push("Email");
    if (selectedColumns.program) headers.push("Program Code", "Program Name");
    if (selectedColumns.degree_level) headers.push("Degree Level");
    if (selectedColumns.entry_term) headers.push("Entry Term");
    if (selectedColumns.total_credits) headers.push("Total Credits");
    if (selectedColumns.cumulative_gpa) headers.push("Cumulative GPA");
    if (selectedColumns.term_gpa) headers.push("Term GPA");
    if (selectedColumns.academic_standing) headers.push("Academic Standing / Decision");
    if (selectedColumns.status) headers.push("Status");
    if (selectedColumns.cohort_tags) headers.push("Cohorts (Veteran/Transfer/1stGen)");

    const rows = generatedReportData.map((r) => {
      const row = [];
      if (selectedColumns.student_number) row.push(`"${r.student_number}"`);
      if (selectedColumns.full_name) row.push(`"${r.full_name}"`);
      if (selectedColumns.email) row.push(`"${r.email}"`);
      if (selectedColumns.program) row.push(`"${r.program_code}"`, `"${r.program_name}"`);
      if (selectedColumns.degree_level) row.push(`"${r.degree_level}"`);
      if (selectedColumns.entry_term) row.push(`"${r.entry_term}"`);
      if (selectedColumns.total_credits) row.push(r.total_credits);
      if (selectedColumns.cumulative_gpa) row.push(`"${r.cumulative_gpa}"`);
      if (selectedColumns.term_gpa) row.push(`"${r.term_gpa}"`);
      if (selectedColumns.academic_standing) row.push(`"${r.academic_standing}"`);
      if (selectedColumns.status) row.push(`"${r.status}"`);
      if (selectedColumns.cohort_tags) {
        const tags = [];
        if (r.is_veteran) tags.push("Veteran");
        if (r.is_transfer) tags.push("Transfer");
        if (r.is_first_gen) tags.push("FirstGen");
        if (r.is_international) tags.push("International");
        if (r.is_honors) tags.push("Honors");
        row.push(`"${tags.join(", ") || "General"}"`);
      }
      return row;
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${reportTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date()
        .toISOString()
        .split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // B. Excel (.xls / XML format) Export
  const handleExportExcel = () => {
    if (generatedReportData.length === 0) return;

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Columbia GS Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          th { background-color: #003865; color: #FFFFFF; font-weight: bold; padding: 8px; border: 1px solid #CCCCCC; text-align: left; }
          td { padding: 6px; border: 1px solid #EEEEEE; }
          .num { mso-number-format:"0\\.00"; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Columbia University School of General Studies</h2>
        <h3>${reportTitle}</h3>
        <p>Generated: ${new Date().toLocaleString()} | Operator: ${currentUser?.email || "Staff Analyst"}</p>
        <p>Total Records: ${generatedReportData.length} | Avg GPA: ${summaryMetrics.avgGpa}</p>
        <table>
          <thead>
            <tr>
              ${selectedColumns.student_number ? "<th>Student ID</th>" : ""}
              ${selectedColumns.full_name ? "<th>Full Name</th>" : ""}
              ${selectedColumns.email ? "<th>Email</th>" : ""}
              ${selectedColumns.program ? "<th>Program Code</th><th>Program Name</th>" : ""}
              ${selectedColumns.degree_level ? "<th>Degree Level</th>" : ""}
              ${selectedColumns.entry_term ? "<th>Entry Term</th>" : ""}
              ${selectedColumns.total_credits ? "<th>Total Credits</th>" : ""}
              ${selectedColumns.cumulative_gpa ? "<th>Cumulative GPA</th>" : ""}
              ${selectedColumns.term_gpa ? "<th>Term GPA</th>" : ""}
              ${selectedColumns.academic_standing ? "<th>Academic Standing / Decision</th>" : ""}
              ${selectedColumns.status ? "<th>Status</th>" : ""}
              ${selectedColumns.cohort_tags ? "<th>Cohort Flags</th>" : ""}
            </tr>
          </thead>
          <tbody>
    `;

    generatedReportData.forEach((r) => {
      const tags = [];
      if (r.is_veteran) tags.push("Veteran");
      if (r.is_transfer) tags.push("Transfer");
      if (r.is_first_gen) tags.push("FirstGen");
      if (r.is_international) tags.push("International");

      tableHtml += `
        <tr>
          ${selectedColumns.student_number ? `<td>${r.student_number}</td>` : ""}
          ${selectedColumns.full_name ? `<td class="bold">${r.full_name}</td>` : ""}
          ${selectedColumns.email ? `<td>${r.email}</td>` : ""}
          ${selectedColumns.program ? `<td>${r.program_code}</td><td>${r.program_name}</td>` : ""}
          ${selectedColumns.degree_level ? `<td>${r.degree_level}</td>` : ""}
          ${selectedColumns.entry_term ? `<td>${r.entry_term}</td>` : ""}
          ${selectedColumns.total_credits ? `<td>${r.total_credits}</td>` : ""}
          ${selectedColumns.cumulative_gpa ? `<td class="num">${r.cumulative_gpa}</td>` : ""}
          ${selectedColumns.term_gpa ? `<td class="num">${r.term_gpa}</td>` : ""}
          ${selectedColumns.academic_standing ? `<td>${r.academic_standing}</td>` : ""}
          ${selectedColumns.status ? `<td>${r.status}</td>` : ""}
          ${selectedColumns.cohort_tags ? `<td>${tags.join(", ") || "General"}</td>` : ""}
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date()
      .toISOString()
      .split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // C. Print Branded Report (PDF Ready)
  const handlePrintDocument = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="reports-loading-state">
        <Spinner size="lg" />
        <p>Initializing Argos-Style Report Generator & Institutional Engine...</p>
      </div>
    );
  }

  return (
    <div className="reports-analytics-view">
      {/* 1. Header Bar */}
      <div className="reports-header-bar">
        <div className="reports-header-title">
          <div className="institution-badge">
            <ShieldCheck size={14} />
            <span>Columbia University • School of General Studies</span>
          </div>
          <h2>Institutional Reports & Audits Engine</h2>
          <p>
            Self-service parameter-driven reporting builder, automated dean's audits, data integrity checks, and branded exports.
          </p>
        </div>

        <div className="reports-header-controls">
          <button
            className={`btn-reports-sync ${isRefreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            title="Refresh database records"
          >
            <RotateCw size={14} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* 2. Top Segmented Tab Switcher */}
      <div className="reports-tabs-nav">
        <button
          className={`tab-switch-btn ${
            activeTab === "builder" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("builder")}
        >
          <Sliders size={16} />
          <span>Interactive Report Builder</span>
        </button>

        <button
          className={`tab-switch-btn ${
            activeTab === "templates" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("templates")}
        >
          <Award size={16} />
          <span>Dean's Pre-Built Audits (6)</span>
        </button>

        <button
          className={`tab-switch-btn ${
            activeTab === "integrity" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("integrity")}
        >
          <ShieldCheck size={16} />
          <span>Data Quality & Integrity</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: Interactive Custom Report Builder (Argos Style)
          ========================================================================= */}
      {activeTab === "builder" && (
        <div className="tab-pane-content">
          {/* Argos Configuration Card */}
          <div className="report-config-card">
            <div className="config-card-header">
              <div className="header-icon-wrap">
                <Sliders size={18} />
              </div>
              <div>
                <h3>Report Parameters & Field Customizer</h3>
                <p>Configure dataset scope, multi-dimensional filters, and visible column fields</p>
              </div>
            </div>

            {/* Parameter Controls Grid */}
            <div className="config-params-grid">
              {/* Report Title */}
              <div className="param-group full-width">
                <label>Report Name / Header Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="param-text-input"
                  placeholder="Enter custom report title..."
                />
              </div>

              {/* Domain */}
              <div className="param-group">
                <label>Report Domain</label>
                <select
                  value={reportDomain}
                  onChange={(e) => setReportDomain(e.target.value)}
                  className="param-select"
                >
                  <option value="students">Student Academic Performance</option>
                  <option value="admissions">Admissions & Pipeline Yield</option>
                  <option value="cohorts">Non-Traditional Cohorts (Veterans / Transfers)</option>
                </select>
              </div>

              {/* Cycle / Term Year */}
              <div className="param-group">
                <label>Cycle / Intake Year</label>
                <select
                  value={filterCycle}
                  onChange={(e) => setFilterCycle(e.target.value)}
                  className="param-select"
                >
                  <option value="all">All Historical Cycles</option>
                  <option value="2027">Cycle 2027</option>
                  <option value="2026">Cycle 2026</option>
                  <option value="2025">Cycle 2025</option>
                  <option value="2024">Cycle 2024</option>
                  <option value="2023">Cycle 2023</option>
                  <option value="2022">Cycle 2022</option>
                </select>
              </div>

              {/* Program */}
              <div className="param-group">
                <label>Degree Major Program</label>
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="param-select"
                >
                  <option value="all">All Majors & Programs</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="param-group">
                <label>Enrollment / Application Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="param-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Degree Candidate</option>
                  <option value="leave">Leave of Absence</option>
                  <option value="graduated">Graduated</option>
                  <option value="admitted">Admitted (Apps)</option>
                  <option value="committed">Committed (Apps)</option>
                  <option value="under_review">Under Review (Apps)</option>
                </select>
              </div>

              {/* Academic Standing */}
              {reportDomain !== "admissions" && (
                <div className="param-group">
                  <label>Academic Standing</label>
                  <select
                    value={filterStanding}
                    onChange={(e) => setFilterStanding(e.target.value)}
                    className="param-select"
                  >
                    <option value="all">All Standings</option>
                    <option value="good_standing">Good Standing</option>
                    <option value="academic_warning">Academic Warning</option>
                    <option value="probation">Academic Probation</option>
                    <option value="suspension">Suspension</option>
                    <option value="at_risk_any">Any At-Risk (Warning / Probation / Low GPA)</option>
                  </select>
                </div>
              )}

              {/* Non-Traditional Cohort */}
              <div className="param-group">
                <label>Special Cohort Classification</label>
                <select
                  value={filterCohort}
                  onChange={(e) => setFilterCohort(e.target.value)}
                  className="param-select"
                >
                  <option value="all">All Cohort Types</option>
                  <option value="veteran">U.S. Military Veteran</option>
                  <option value="transfer">Transfer Student</option>
                  <option value="first_gen">First-Generation College</option>
                  <option value="international">International Student</option>
                  <option value="honors">GS Honors Scholar</option>
                </select>
              </div>

              {/* GPA Band Filter */}
              {reportDomain !== "admissions" && (
                <div className="param-group">
                  <label>GPA Threshold Band</label>
                  <select
                    value={filterGpa}
                    onChange={(e) => setFilterGpa(e.target.value)}
                    className="param-select"
                  >
                    <option value="all">All GPAs</option>
                    <option value="gte38">High Honors (GPA ≥ 3.80)</option>
                    <option value="gte35">Dean's List Range (GPA ≥ 3.50)</option>
                    <option value="lt25">At-Risk Alert (GPA &lt; 2.50)</option>
                    <option value="lt20">Severe Risk (GPA &lt; 2.00)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Column Field Chooser */}
            <div className="config-fields-section">
              <span className="fields-section-title">
                Field Chooser (Select columns to include in the output table):
              </span>
              <div className="fields-checkbox-grid">
                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.student_number}
                    onChange={() => toggleColumn("student_number")}
                  />
                  <span>Student ID</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.full_name}
                    onChange={() => toggleColumn("full_name")}
                  />
                  <span>Student Name</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.email}
                    onChange={() => toggleColumn("email")}
                  />
                  <span>Institutional Email</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.program}
                    onChange={() => toggleColumn("program")}
                  />
                  <span>Degree Program & Major</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.degree_level}
                    onChange={() => toggleColumn("degree_level")}
                  />
                  <span>Degree Level</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.entry_term}
                    onChange={() => toggleColumn("entry_term")}
                  />
                  <span>Entry Term</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.total_credits}
                    onChange={() => toggleColumn("total_credits")}
                  />
                  <span>Credits Completed</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.cumulative_gpa}
                    onChange={() => toggleColumn("cumulative_gpa")}
                  />
                  <span>Cumulative GPA</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.term_gpa}
                    onChange={() => toggleColumn("term_gpa")}
                  />
                  <span>Term GPA</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.academic_standing}
                    onChange={() => toggleColumn("academic_standing")}
                  />
                  <span>Academic Standing / Decision</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.status}
                    onChange={() => toggleColumn("status")}
                  />
                  <span>Enrollment Status</span>
                </label>

                <label className="field-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedColumns.cohort_tags}
                    onChange={() => toggleColumn("cohort_tags")}
                  />
                  <span>Cohort Classifications</span>
                </label>
              </div>
            </div>

            {/* Export Toolbar */}
            <div className="report-action-bar">
              <div className="action-bar-summary">
                <span className="summary-badge-matched font-mono">
                  {generatedReportData.length} records matched
                </span>
                <span className="summary-text-muted">
                  Mean GPA: <strong>{summaryMetrics.avgGpa}</strong> | Active:{" "}
                  <strong>{summaryMetrics.activeCount}</strong> | At-Risk:{" "}
                  <strong>{summaryMetrics.atRiskCount}</strong>
                </span>
              </div>

              <div className="action-buttons-group">
                <button
                  className="btn-export-branded"
                  onClick={() => setIsBrandedModalOpen(true)}
                  disabled={generatedReportData.length === 0}
                  title="Generate printable PDF-ready branded report"
                >
                  <Printer size={15} />
                  <span>Branded Report (PDF / Print)</span>
                </button>

                <button
                  className="btn-export-excel"
                  onClick={handleExportExcel}
                  disabled={generatedReportData.length === 0}
                  title="Export to Microsoft Excel spreadsheet"
                >
                  <FileSpreadsheet size={15} />
                  <span>Export Excel (.xls)</span>
                </button>

                <button
                  className="btn-export-csv"
                  onClick={handleExportCSV}
                  disabled={generatedReportData.length === 0}
                  title="Export to CSV file"
                >
                  <Download size={15} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Data Preview Table */}
          <div className="report-preview-card">
            <div className="preview-card-header">
              <div>
                <h3>Live Audit Table Preview</h3>
                <p>Real-time interactive rendering of the selected report dataset</p>
              </div>
              <StatusPill variant="neutral font-mono">
                {generatedReportData.length} Rows
              </StatusPill>
            </div>

            {generatedReportData.length === 0 ? (
              <div className="reports-empty-state">
                <FileText size={38} className="empty-icon" />
                <h4>No matching records found for this query</h4>
                <p>Adjust your parameter selections or broaden your criteria.</p>
              </div>
            ) : (
              <div className="table-responsive-box">
                <table className="reports-preview-table">
                  <thead>
                    <tr>
                      {selectedColumns.student_number && <th>Student ID</th>}
                      {selectedColumns.full_name && <th>Full Name</th>}
                      {selectedColumns.email && <th>Email</th>}
                      {selectedColumns.program && <th>Degree Major</th>}
                      {selectedColumns.degree_level && <th>Level</th>}
                      {selectedColumns.entry_term && <th>Entry Term</th>}
                      {selectedColumns.total_credits && <th>Credits</th>}
                      {selectedColumns.cumulative_gpa && <th>Cum GPA</th>}
                      {selectedColumns.term_gpa && <th>Term GPA</th>}
                      {selectedColumns.academic_standing && <th>Standing / Decision</th>}
                      {selectedColumns.status && <th>Status</th>}
                      {selectedColumns.cohort_tags && <th>Cohorts</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReportData.map((row) => (
                      <tr key={row.id}>
                        {selectedColumns.student_number && (
                          <td className="font-mono text-muted">{row.student_number}</td>
                        )}
                        {selectedColumns.full_name && (
                          <td>
                            <strong>{row.full_name}</strong>
                          </td>
                        )}
                        {selectedColumns.email && (
                          <td className="font-mono text-muted">{row.email}</td>
                        )}
                        {selectedColumns.program && (
                          <td>
                            <span className="font-mono badge-prog">{row.program_code}</span>{" "}
                            {row.program_name}
                          </td>
                        )}
                        {selectedColumns.degree_level && (
                          <td className="text-muted">{row.degree_level}</td>
                        )}
                        {selectedColumns.entry_term && <td>{row.entry_term}</td>}
                        {selectedColumns.total_credits && (
                          <td className="font-mono">{row.total_credits}</td>
                        )}
                        {selectedColumns.cumulative_gpa && (
                          <td
                            className={`font-mono font-bold ${
                              row.cumGpaRaw !== null && row.cumGpaRaw >= 3.5
                                ? "text-success"
                                : row.cumGpaRaw !== null && row.cumGpaRaw < 2.5
                                ? "text-danger"
                                : ""
                            }`}
                          >
                            {row.cumulative_gpa}
                          </td>
                        )}
                        {selectedColumns.term_gpa && (
                          <td className="font-mono text-muted">{row.term_gpa}</td>
                        )}
                        {selectedColumns.academic_standing && (
                          <td>
                            <span
                              className={`pill-standing ${
                                row.academic_standing === "good_standing" ||
                                row.academic_standing === "AC"
                                  ? "standing-good"
                                  : "standing-warn"
                              }`}
                            >
                              {row.academic_standing}
                            </span>
                          </td>
                        )}
                        {selectedColumns.status && (
                          <td>
                            <StatusPill
                              variant={
                                row.status === "active" ||
                                row.status === "committed" ||
                                row.status === "enrolled"
                                  ? "success"
                                  : "neutral"
                              }
                              dot
                            >
                              {row.status.toUpperCase()}
                            </StatusPill>
                          </td>
                        )}
                        {selectedColumns.cohort_tags && (
                          <td>
                            <div className="preview-cohort-tags">
                              {row.is_veteran && <span className="c-tag">Veteran</span>}
                              {row.is_transfer && <span className="c-tag">Transfer</span>}
                              {row.is_first_gen && <span className="c-tag">1st-Gen</span>}
                              {row.is_international && <span className="c-tag">Intl</span>}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Dean's Pre-Built Institutional Audits (6)
          ========================================================================= */}
      {activeTab === "templates" && (
        <div className="tab-pane-content">
          <div className="templates-grid">
            {/* Template 1: Dean's List */}
            <div className="template-card">
              <div className="template-card-top">
                <div className="template-icon-wrap icon-gold">
                  <Award size={20} />
                </div>
                <StatusPill variant="success">Academic Honors</StatusPill>
              </div>
              <h4>Dean's List Excellence Audit</h4>
              <p>
                Active undergraduate scholars maintaining a cumulative GPA of ≥ 3.50 for institutional honors recognition.
              </p>
              <button
                className="btn-launch-template"
                onClick={() => handleLaunchTemplate("deans_list")}
              >
                <span>Launch Audit</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Template 2: Probation Triage */}
            <div className="template-card">
              <div className="template-card-top">
                <div className="template-icon-wrap icon-red">
                  <AlertTriangle size={20} />
                </div>
                <StatusPill variant="danger">Advising Triage</StatusPill>
              </div>
              <h4>Academic Warning & Probation Audit</h4>
              <p>
                Roster of students on Academic Warning, Academic Probation, or with Cumulative GPA &lt; 2.50 requiring advisor outreach.
              </p>
              <button
                className="btn-launch-template"
                onClick={() => handleLaunchTemplate("probation_triage")}
              >
                <span>Launch Audit</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Template 3: Veterans Affairs */}
            <div className="template-card">
              <div className="template-card-top">
                <div className="template-icon-wrap icon-blue">
                  <ShieldCheck size={20} />
                </div>
                <StatusPill variant="info">VA & Military</StatusPill>
              </div>
              <h4>U.S. Military Veterans & Service Members</h4>
              <p>
                Enrollment certification audit for Yellow Ribbon and GI Bill recipient scholars across all GS degree programs.
              </p>
              <button
                className="btn-launch-template"
                onClick={() => handleLaunchTemplate("veterans_cert")}
              >
                <span>Launch Audit</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Template 4: Transfer Articulation */}
            <div className="template-card">
              <div className="template-card-top">
                <div className="template-icon-wrap icon-teal">
                  <BookOpen size={20} />
                </div>
                <StatusPill variant="neutral">Pathway Progress</StatusPill>
              </div>
              <h4>Community College Transfer Articulation</h4>
              <p>
                Track transfer student course accumulation, GPA persistence, and credit transfer parity.
              </p>
              <button
                className="btn-launch-template"
                onClick={() => handleLaunchTemplate("transfer_articulation")}
              >
                <span>Launch Audit</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Template 5: Admissions Yield */}
            <div className="template-card">
              <div className="template-card-top">
                <div className="template-icon-wrap icon-purple">
                  <GraduationCap size={20} />
                </div>
                <StatusPill variant="info">Admissions</StatusPill>
              </div>
              <h4>Admissions Cycle Yield & Melt Tracker</h4>
              <p>
                Cycle-by-cycle offer outcome audit tracking Accepted (`AC`), Provisional (`AP`), Deferred (`DF`), and Declined (`NC`) applicants.
              </p>
              <button
                className="btn-launch-template"
                onClick={() => handleLaunchTemplate("admissions_yield")}
              >
                <span>Launch Audit</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Template 6: Senior Degree Audit */}
            <div className="template-card">
              <div className="template-card-top">
                <div className="template-icon-wrap icon-green">
                  <CheckCircle2 size={20} />
                </div>
                <StatusPill variant="success">Graduation Ready</StatusPill>
              </div>
              <h4>Senior Degree Completion Audit</h4>
              <p>
                Audit of active candidates with ≥ 90 accumulated credits preparing for senior degree audits and commencement clearance.
              </p>
              <button
                className="btn-launch-template"
                onClick={() => handleLaunchTemplate("senior_audit")}
              >
                <span>Launch Audit</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: Data Quality & Integrity Audits
          ========================================================================= */}
      {activeTab === "integrity" && (
        <div className="tab-pane-content">
          <div className="integrity-checks-list">
            {/* Check 1: Missing Student Numbers */}
            <div className="integrity-card">
              <div className="integrity-status-icon pass">
                <CheckCircle2 size={22} />
              </div>
              <div className="integrity-meta">
                <h4>Student Number & Identifier Integrity</h4>
                <p>Verify all registered student profiles have unique institutional ID numbers (e.g. `CU-2024-0001`)</p>
              </div>
              <div className="integrity-action">
                <StatusPill variant="success">PASS (0 Missing)</StatusPill>
              </div>
            </div>

            {/* Check 2: GPA Range & Term Consistency */}
            <div className="integrity-card">
              <div className="integrity-status-icon pass">
                <CheckCircle2 size={22} />
              </div>
              <div className="integrity-meta">
                <h4>Grade Point Average Bounds (0.00 – 4.00)</h4>
                <p>Verifies all semester term records and cumulative GPAs reside strictly within valid 4.00 scale limits</p>
              </div>
              <div className="integrity-action">
                <StatusPill variant="success">PASS (100% Valid)</StatusPill>
              </div>
            </div>

            {/* Check 3: Active Students with Current Term Records */}
            <div className="integrity-card">
              <div className="integrity-status-icon pass">
                <CheckCircle2 size={22} />
              </div>
              <div className="integrity-meta">
                <h4>Active Enrollment Term Linkage</h4>
                <p>Ensures active degree candidates have corresponding semester term records and program enrollments</p>
              </div>
              <div className="integrity-action">
                <StatusPill variant="success">PASS (Fully Linked)</StatusPill>
              </div>
            </div>

            {/* Check 4: Application Stage & Decision Coherence */}
            <div className="integrity-card">
              <div className="integrity-status-icon pass">
                <CheckCircle2 size={22} />
              </div>
              <div className="integrity-meta">
                <h4>Admissions Decision Code Consistency</h4>
                <p>Validates that admitted candidate records have formal decision codes (`AC`, `AP`) and valid timestamps</p>
              </div>
              <div className="integrity-action">
                <StatusPill variant="success">PASS (0 Inconsistencies)</StatusPill>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BRANDED PRINT / PDF MODAL
          ========================================================================= */}
      {isBrandedModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsBrandedModalOpen(false)}
          title="Branded Institutional Report View"
          subtitle="Print-optimized Columbia University School of General Studies Document"
          size="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBrandedModalOpen(false)}
              >
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrintDocument}
              >
                <Printer size={14} />
                <span>Print / Save as PDF</span>
              </Button>
            </>
          }
        >
          <div className="branded-document-container" ref={printableRef}>
            {/* Branded Official Header */}
            <div className="doc-header">
              <div className="doc-header-brand">
                <div className="doc-crest">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h1 className="doc-institution-title">COLUMBIA UNIVERSITY</h1>
                  <h2 className="doc-school-title">SCHOOL OF GENERAL STUDIES</h2>
                  <span className="doc-dept-title">
                    OFFICE OF ACADEMIC ADVISING & ENROLLMENT AUDITS
                  </span>
                </div>
              </div>

              <div className="doc-meta-right">
                <div className="meta-line">
                  <strong>Report:</strong> {reportTitle}
                </div>
                <div className="meta-line">
                  <strong>Generated:</strong> {new Date().toLocaleString()}
                </div>
                <div className="meta-line">
                  <strong>Operator:</strong> {currentUser?.email || "Staff Analyst (PR)"}
                </div>
                <div className="meta-line">
                  <strong>Records:</strong> {generatedReportData.length} Students Included
                </div>
              </div>
            </div>

            {/* Document Highlight Bar */}
            <div className="doc-summary-strip">
              <div className="summary-item">
                <span className="lbl">Total Flagged:</span>
                <span className="val font-mono">{generatedReportData.length}</span>
              </div>
              <div className="summary-item">
                <span className="lbl">Average Cum GPA:</span>
                <span className="val font-mono">{summaryMetrics.avgGpa}</span>
              </div>
              <div className="summary-item">
                <span className="lbl">Total Credits:</span>
                <span className="val font-mono">{summaryMetrics.totalCredits} pts</span>
              </div>
              <div className="summary-item">
                <span className="lbl">Active Enrolled:</span>
                <span className="val font-mono">{summaryMetrics.activeCount}</span>
              </div>
            </div>

            {/* Document Table */}
            <table className="doc-table">
              <thead>
                <tr>
                  {selectedColumns.student_number && <th>Student ID</th>}
                  {selectedColumns.full_name && <th>Student Name</th>}
                  {selectedColumns.program && <th>Major Program</th>}
                  {selectedColumns.entry_term && <th>Entry Term</th>}
                  {selectedColumns.total_credits && <th>Credits</th>}
                  {selectedColumns.cumulative_gpa && <th>Cum GPA</th>}
                  {selectedColumns.academic_standing && <th>Standing</th>}
                  {selectedColumns.status && <th>Status</th>}
                  {selectedColumns.cohort_tags && <th>Cohorts</th>}
                </tr>
              </thead>
              <tbody>
                {generatedReportData.map((r) => {
                  const tags = [];
                  if (r.is_veteran) tags.push("Veteran");
                  if (r.is_transfer) tags.push("Transfer");
                  if (r.is_first_gen) tags.push("1st-Gen");
                  if (r.is_international) tags.push("Intl");

                  return (
                    <tr key={r.id}>
                      {selectedColumns.student_number && (
                        <td className="font-mono">{r.student_number}</td>
                      )}
                      {selectedColumns.full_name && (
                        <td>
                          <strong>{r.full_name}</strong>
                        </td>
                      )}
                      {selectedColumns.program && (
                        <td>
                          {r.program_code} - {r.program_name}
                        </td>
                      )}
                      {selectedColumns.entry_term && <td>{r.entry_term}</td>}
                      {selectedColumns.total_credits && (
                        <td className="font-mono">{r.total_credits}</td>
                      )}
                      {selectedColumns.cumulative_gpa && (
                        <td className="font-mono font-bold">{r.cumulative_gpa}</td>
                      )}
                      {selectedColumns.academic_standing && (
                        <td>{r.academic_standing}</td>
                      )}
                      {selectedColumns.status && (
                        <td className="uppercase">{r.status}</td>
                      )}
                      {selectedColumns.cohort_tags && (
                        <td className="text-muted">{tags.join(", ") || "General"}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer Sign-Off */}
            <div className="doc-footer">
              <span>
                Confidential Institutional Document — Columbia University in the City of New York • School of General Studies
              </span>
              <span>Page 1 of 1</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
