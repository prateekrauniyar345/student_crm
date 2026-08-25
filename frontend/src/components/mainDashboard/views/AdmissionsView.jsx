import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Award,
  Users,
  Clock,
  RotateCw,
  Download,
  Filter,
  Search,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Globe,
  FileSpreadsheet,
  Edit,
  X,
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import {
  useAllApplications,
  useUpdateApplication,
} from "../../../hooks/useApplications";
import { useAllPeople } from "../../../hooks/usePeople";
import { useAllPrograms } from "../../../hooks/usePrograms";
import { useAllAcademicTerms } from "../../../hooks/useAcademicTerms";
import { useAllStudentProfiles } from "../../../hooks/useStudentProfiles";
import { StatCard, StatusPill, Modal, Button, Spinner } from "../../../ui";
import "./AdmissionsView.css";

export default function AdmissionsView({ currentUser }) {
  // 1. Data queries
  const {
    data: applications = [],
    isLoading: isLoadingApps,
    refetch: refetchApps,
  } = useAllApplications();

  const {
    data: people = [],
    isLoading: isLoadingPeople,
    refetch: refetchPeople,
  } = useAllPeople();

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

  const {
    data: studentProfiles = [],
    isLoading: isLoadingProfiles,
    refetch: refetchProfiles,
  } = useAllStudentProfiles();

  // Mutation
  const updateAppMutation = useUpdateApplication();

  // 2. State controls
  const [selectedCycle, setSelectedCycle] = useState(2024);
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [activeTab, setActiveTab] = useState("funnel"); // 'funnel' | 'pathways' | 'roster'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Roster sub-filters
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterStage, setRosterStage] = useState("all");
  const [rosterDecision, setRosterDecision] = useState("all");
  const [rosterReply, setRosterReply] = useState("all");
  const [rosterTransferType, setRosterTransferType] = useState("all");

  // Edit Modal State
  const [editModalApp, setEditModalApp] = useState(null);
  const [editFormData, setEditFormData] = useState({
    stage: "submitted",
    decision_code: "",
    reply_code: "",
    applicant_source: "",
    transfer_institution_type: "",
    decided_at: "",
  });

  const isLoading =
    isLoadingApps ||
    isLoadingPeople ||
    isLoadingPrograms ||
    isLoadingTerms ||
    isLoadingProfiles;

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchApps(),
      refetchPeople(),
      refetchPrograms(),
      refetchTerms(),
      refetchProfiles(),
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

  // 3. Computed Analytics based on Global Filters (Cycle & Program)
  const analyticsData = useMemo(() => {
    // Filter applications by Cycle and Program
    const filteredApps = applications.filter((app) => {
      const matchCycle =
        selectedCycle === "all" || app.application_year === Number(selectedCycle);
      const matchProg =
        selectedProgram === "all" || app.program_id === selectedProgram;
      return matchCycle && matchProg;
    });

    const totalApplications = filteredApps.length;

    // Prior Cycle applications for YoY comparison
    const priorYear =
      selectedCycle !== "all" ? Number(selectedCycle) - 1 : null;
    const priorYearApps = priorYear
      ? applications.filter((app) => {
          const matchCycle = app.application_year === priorYear;
          const matchProg =
            selectedProgram === "all" || app.program_id === selectedProgram;
          return matchCycle && matchProg;
        })
      : [];
    const priorCount = priorYearApps.length;
    let yoyGrowth = null;
    if (priorYear && priorCount > 0) {
      const g = ((totalApplications - priorCount) / priorCount) * 100;
      yoyGrowth = (g >= 0 ? "+" : "") + g.toFixed(1) + "%";
    }

    // Decided and Admitted Pools
    const decidedApps = filteredApps.filter(
      (a) => a.decision_code !== null && a.decision_code !== undefined
    );
    const admittedApps = filteredApps.filter(
      (a) =>
        a.decision_code === "AC" ||
        a.decision_code === "AP" ||
        a.stage === "admitted"
    );

    const admitRateNum =
      decidedApps.length > 0
        ? (admittedApps.length / decidedApps.length) * 100
        : totalApplications > 0 && admittedApps.length > 0
        ? (admittedApps.length / totalApplications) * 100
        : 0;
    const admitRate = `${admitRateNum.toFixed(1)}%`;

    // Committed Pool (Yield)
    const committedApps = admittedApps.filter(
      (a) =>
        a.reply_code === "Y" ||
        a.stage === "committed" ||
        a.stage === "enrolled"
    );
    const yieldRateNum =
      admittedApps.length > 0
        ? (committedApps.length / admittedApps.length) * 100
        : 0;
    const yieldRate = `${yieldRateNum.toFixed(1)}%`;

    // Melt / Declined Pool
    const meltApps = admittedApps.filter(
      (a) =>
        a.reply_code === "NC" ||
        a.reply_code === "NS" ||
        a.reply_code === "DF" ||
        a.stage === "withdrawn"
    );
    const meltRateNum =
      admittedApps.length > 0
        ? (meltApps.length / admittedApps.length) * 100
        : 0;
    const meltRate = `${meltRateNum.toFixed(1)}%`;

    // Decision Velocity: Days from submitted_at to decided_at
    const velocityList = decidedApps
      .filter((a) => a.submitted_at && a.decided_at)
      .map((a) => {
        const sub = new Date(a.submitted_at).getTime();
        const dec = new Date(a.decided_at).getTime();
        return Math.max(0, (dec - sub) / (1000 * 60 * 60 * 24));
      });

    const avgVelocity =
      velocityList.length > 0
        ? (velocityList.reduce((acc, v) => acc + v, 0) / velocityList.length).toFixed(1)
        : "—";

    // 4. Decision Code Breakdown
    const decisionCounts = {
      AC: 0,
      AP: 0,
      WL: 0,
      RH: 0,
      pending: 0,
    };
    filteredApps.forEach((a) => {
      if (a.decision_code === "AC") decisionCounts.AC += 1;
      else if (a.decision_code === "AP") decisionCounts.AP += 1;
      else if (a.decision_code === "WL") decisionCounts.WL += 1;
      else if (a.decision_code === "RH") decisionCounts.RH += 1;
      else decisionCounts.pending += 1;
    });

    // 5. Offer Outcome Breakdown (Admitted Pool)
    const replyCounts = {
      Y: 0,
      NC: 0,
      DF: 0,
      NS: 0,
      NR: 0,
    };
    admittedApps.forEach((a) => {
      if (a.reply_code === "Y") replyCounts.Y += 1;
      else if (a.reply_code === "NC") replyCounts.NC += 1;
      else if (a.reply_code === "DF") replyCounts.DF += 1;
      else if (a.reply_code === "NS") replyCounts.NS += 1;
      else replyCounts.NR += 1;
    });

    // 6. Complete Funnel Progression Stages
    const underReviewCount = filteredApps.filter(
      (a) =>
        a.stage === "under_review" ||
        a.stage === "admitted" ||
        a.stage === "committed" ||
        a.stage === "enrolled" ||
        a.stage === "waitlisted" ||
        a.stage === "denied"
    ).length;

    const enrolledPeopleCount = people.filter(
      (p) => p.lifecycle_stage === "enrolled"
    ).length;
    const matriculatedCount = Math.min(
      committedApps.length,
      enrolledPeopleCount > 0 ? enrolledPeopleCount : committedApps.length
    );

    const funnelStages = [
      {
        label: "Applications Submitted",
        count: totalApplications,
        sub: "Total applicant files received",
        pct: 100,
        color: "var(--color-primary)",
      },
      {
        label: "Under Committee Review",
        count: underReviewCount > 0 ? underReviewCount : totalApplications,
        sub: "Admissions reader workflow",
        pct:
          totalApplications > 0
            ? Math.round(
                ((underReviewCount > 0 ? underReviewCount : totalApplications) /
                  totalApplications) *
                  100
              )
            : 0,
        color: "#0284C7",
      },
      {
        label: "Offers Extended (AC + AP)",
        count: admittedApps.length,
        sub: `Admit Rate: ${admitRate}`,
        pct:
          totalApplications > 0
            ? Math.round((admittedApps.length / totalApplications) * 100)
            : 0,
        color: "#0D9488",
      },
      {
        label: "Confirmed Commitments",
        count: committedApps.length,
        sub: `Yield Rate: ${yieldRate}`,
        pct:
          totalApplications > 0
            ? Math.round((committedApps.length / totalApplications) * 100)
            : 0,
        color: "var(--color-success)",
      },
      {
        label: "Matriculated / Enrolled",
        count: matriculatedCount,
        sub: "Orientation & Course Registration",
        pct:
          totalApplications > 0
            ? Math.round((matriculatedCount / totalApplications) * 100)
            : 0,
        color: "#16A34A",
      },
    ];

    // 7. Transfer Origin Pathway Performance
    const transferTypeMap = new Map();
    filteredApps.forEach((a) => {
      const type = a.transfer_institution_type || "first_year_or_other";
      if (!transferTypeMap.has(type)) {
        transferTypeMap.set(type, {
          type,
          label:
            type === "community_college"
              ? "Community College Articulation"
              : type === "four_year"
              ? "4-Year College Transfer"
              : type === "international"
              ? "International Institution"
              : "First-Year / Direct Intake",
          apps: 0,
          admitted: 0,
          committed: 0,
          velocities: [],
        });
      }
      const item = transferTypeMap.get(type);
      item.apps += 1;
      if (a.decision_code === "AC" || a.decision_code === "AP" || a.stage === "admitted") {
        item.admitted += 1;
      }
      if (a.reply_code === "Y" || a.stage === "committed" || a.stage === "enrolled") {
        item.committed += 1;
      }
      if (a.submitted_at && a.decided_at) {
        const days =
          (new Date(a.decided_at).getTime() - new Date(a.submitted_at).getTime()) /
          (1000 * 60 * 60 * 24);
        if (days >= 0) item.velocities.push(days);
      }
    });

    const transferPathways = Array.from(transferTypeMap.values()).map((p) => ({
      ...p,
      admitRate: p.apps > 0 ? ((p.admitted / p.apps) * 100).toFixed(1) + "%" : "0.0%",
      yieldRate:
        p.admitted > 0
          ? ((p.committed / p.admitted) * 100).toFixed(1) + "%"
          : "0.0%",
      avgDays:
        p.velocities.length > 0
          ? (
              p.velocities.reduce((acc, v) => acc + v, 0) / p.velocities.length
            ).toFixed(1) + " days"
          : "—",
    }));

    // 8. Recruitment Channels Breakdown (applicant_source)
    const sourceMap = new Map();
    filteredApps.forEach((a) => {
      const src = a.applicant_source || "Direct Portal";
      if (!sourceMap.has(src)) {
        sourceMap.set(src, {
          source: src,
          apps: 0,
          admitted: 0,
          committed: 0,
        });
      }
      const item = sourceMap.get(src);
      item.apps += 1;
      if (a.decision_code === "AC" || a.decision_code === "AP" || a.stage === "admitted") {
        item.admitted += 1;
      }
      if (a.reply_code === "Y" || a.stage === "committed" || a.stage === "enrolled") {
        item.committed += 1;
      }
    });

    const recruitmentSources = Array.from(sourceMap.values()).map((s) => ({
      ...s,
      admitRate: s.apps > 0 ? ((s.admitted / s.apps) * 100).toFixed(1) + "%" : "0.0%",
      yieldRate:
        s.admitted > 0
          ? ((s.committed / s.admitted) * 100).toFixed(1) + "%"
          : "0.0%",
    }));

    // 9. Program Demand & Yield Matrix
    const progMatrix = programs.map((prog) => {
      const progApps = filteredApps.filter((a) => a.program_id === prog.id);
      const progAdmitted = progApps.filter(
        (a) =>
          a.decision_code === "AC" ||
          a.decision_code === "AP" ||
          a.stage === "admitted"
      );
      const progCommitted = progAdmitted.filter(
        (a) =>
          a.reply_code === "Y" ||
          a.stage === "committed" ||
          a.stage === "enrolled"
      );

      const progVelocities = progApps
        .filter((a) => a.submitted_at && a.decided_at)
        .map(
          (a) =>
            (new Date(a.decided_at).getTime() - new Date(a.submitted_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        .filter((d) => d >= 0);

      return {
        id: prog.id,
        code: prog.code,
        name: prog.name,
        degreeLevel: prog.degree_level,
        appsCount: progApps.length,
        admittedCount: progAdmitted.length,
        admitRate:
          progApps.length > 0
            ? ((progAdmitted.length / progApps.length) * 100).toFixed(1) + "%"
            : "0.0%",
        committedCount: progCommitted.length,
        yieldRate:
          progAdmitted.length > 0
            ? ((progCommitted.length / progAdmitted.length) * 100).toFixed(1) + "%"
            : "0.0%",
        avgDays:
          progVelocities.length > 0
            ? (
                progVelocities.reduce((acc, v) => acc + v, 0) /
                progVelocities.length
              ).toFixed(1) + " d"
            : "—",
      };
    });

    progMatrix.sort((a, b) => b.appsCount - a.appsCount);

    return {
      totalApplications,
      priorCount,
      yoyGrowth,
      admittedAppsCount: admittedApps.length,
      admitRate,
      committedAppsCount: committedApps.length,
      yieldRate,
      meltRate,
      avgVelocity,
      decisionCounts,
      replyCounts,
      funnelStages,
      transferPathways,
      recruitmentSources,
      progMatrix,
      filteredApps,
    };
  }, [applications, selectedCycle, selectedProgram, people, programs]);

  // 4. Filtered Applications for Tab 3 Roster
  const filteredRosterApps = useMemo(() => {
    return analyticsData.filteredApps.filter((app) => {
      const person = peopleMap.get(app.person_id) || {};
      const prog = programMap.get(app.program_id);

      // Search
      if (rosterSearch.trim()) {
        const query = rosterSearch.toLowerCase().trim();
        const fullName = `${person.first_name || ""} ${person.last_name || ""}`.toLowerCase();
        const email = (person.email || "").toLowerCase();
        const progName = (prog?.name || "").toLowerCase();
        const progCode = (prog?.code || "").toLowerCase();

        if (
          !fullName.includes(query) &&
          !email.includes(query) &&
          !progName.includes(query) &&
          !progCode.includes(query)
        ) {
          return false;
        }
      }

      // Stage
      if (rosterStage !== "all" && app.stage !== rosterStage) {
        return false;
      }

      // Decision
      if (rosterDecision !== "all" && app.decision_code !== rosterDecision) {
        return false;
      }

      // Reply
      if (rosterReply !== "all" && app.reply_code !== rosterReply) {
        return false;
      }

      // Transfer Type
      if (
        rosterTransferType !== "all" &&
        app.transfer_institution_type !== rosterTransferType
      ) {
        return false;
      }

      return true;
    });
  }, [
    analyticsData.filteredApps,
    rosterSearch,
    rosterStage,
    rosterDecision,
    rosterReply,
    rosterTransferType,
    peopleMap,
    programMap,
  ]);

  // Reset Roster Filters
  const handleResetRosterFilters = () => {
    setRosterSearch("");
    setRosterStage("all");
    setRosterDecision("all");
    setRosterReply("all");
    setRosterTransferType("all");
  };

  // Open Edit Decision Modal
  const handleOpenEdit = (app) => {
    setEditModalApp(app);
    setEditFormData({
      stage: app.stage || "submitted",
      decision_code: app.decision_code || "",
      reply_code: app.reply_code || "",
      applicant_source: app.applicant_source || "",
      transfer_institution_type: app.transfer_institution_type || "",
      decided_at: app.decided_at
        ? new Date(app.decided_at).toISOString().split("T")[0]
        : "",
    });
  };

  // Save Edit Decision
  const handleSaveEdit = async () => {
    if (!editModalApp) return;

    try {
      await updateAppMutation.mutateAsync({
        applicationId: editModalApp.id,
        updates: {
          stage: editFormData.stage,
          decision_code: editFormData.decision_code || null,
          reply_code: editFormData.reply_code || null,
          applicant_source: editFormData.applicant_source || null,
          transfer_institution_type:
            editFormData.transfer_institution_type || null,
          decided_at: editFormData.decided_at
            ? new Date(editFormData.decided_at).toISOString()
            : null,
        },
      });

      setEditModalApp(null);
    } catch (err) {
      console.error("Failed to update application:", err);
    }
  };

  // CSV Export for filtered applications
  const handleExportCSV = () => {
    if (filteredRosterApps.length === 0) return;

    const headers = [
      "Application ID",
      "Applicant Name",
      "Email",
      "Program Code",
      "Program Name",
      "Application Year",
      "Stage",
      "Decision Code",
      "Reply Code",
      "Transfer Institution Type",
      "Applicant Source",
      "Submitted Date",
      "Decided Date",
    ];

    const rows = filteredRosterApps.map((a) => {
      const p = peopleMap.get(a.person_id) || {};
      const prog = programMap.get(a.program_id) || {};
      return [
        `"${a.id}"`,
        `"${p.first_name || ""} ${p.last_name || ""}"`,
        `"${p.email || ""}"`,
        `"${prog.code || ""}"`,
        `"${prog.name || ""}"`,
        a.application_year,
        `"${a.stage}"`,
        `"${a.decision_code || ""}"`,
        `"${a.reply_code || ""}"`,
        `"${a.transfer_institution_type || ""}"`,
        `"${a.applicant_source || ""}"`,
        `"${a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : ""}"`,
        `"${a.decided_at ? new Date(a.decided_at).toLocaleDateString() : ""}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `columbia_gs_admissions_yield_cycle_${selectedCycle}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="admissions-loading-state">
        <Spinner size="lg" />
        <p>Loading Columbia GS Admissions Funnel & Yield Engine...</p>
      </div>
    );
  }

  return (
    <div className="admissions-analytics-view">
      {/* 1. Header Bar with Global Selectors */}
      <div className="admissions-header-bar">
        <div className="admissions-header-title">
          <div className="institution-badge">
            <ShieldCheck size={14} />
            <span>Columbia University • School of General Studies</span>
          </div>
          <h2>Admissions & Yield Analytics</h2>
          <p>
            Comprehensive enrollment funnel diagnostics, transfer pathway yields, decision velocity, and applicant decision queue.
          </p>
        </div>

        <div className="admissions-header-controls">
          {/* Cycle Selector */}
          <div className="header-select-group">
            <Calendar size={13} className="header-select-icon" />
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="admissions-global-select"
              aria-label="Select admissions cycle year"
            >
              <option value="2027">Cycle 2027</option>
              <option value="2026">Cycle 2026</option>
              <option value="2025">Cycle 2025</option>
              <option value="2024">Cycle 2024</option>
              <option value="2023">Cycle 2023</option>
              <option value="2022">Cycle 2022</option>
              <option value="all">All Historical Cycles</option>
            </select>
          </div>

          {/* Program Selector */}
          <div className="header-select-group">
            <Layers size={13} className="header-select-icon" />
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="admissions-global-select"
              aria-label="Filter by degree program"
            >
              <option value="all">All Degree Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-admissions-export"
            onClick={handleExportCSV}
            title="Export admissions data to CSV"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          <button
            className={`btn-admissions-sync ${isRefreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            title="Sync latest admissions data"
          >
            <RotateCw size={14} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Summary Strip */}
      <div className="admissions-kpi-grid">
        <StatCard
          label="Total Applications"
          value={analyticsData.totalApplications}
          icon={<Users size={18} />}
          iconVariant="blue"
          subtext={
            analyticsData.yoyGrowth
              ? `${analyticsData.yoyGrowth} YoY vs Cycle ${Number(selectedCycle) - 1}`
              : selectedCycle !== "all"
              ? `Admissions cycle ${selectedCycle}`
              : "All recorded cycles"
          }
          pill={
            <StatusPill variant="neutral">
              {selectedCycle !== "all" ? `Cycle ${selectedCycle}` : "All Time"}
            </StatusPill>
          }
        />

        <StatCard
          label="Admit Rate (AC + AP)"
          value={analyticsData.admitRate}
          icon={<Award size={18} />}
          iconVariant="amber"
          subtext={`${analyticsData.admittedAppsCount} admitted of ${analyticsData.totalApplications} apps`}
          pill={
            <StatusPill variant="info">
              Selective
            </StatusPill>
          }
        />

        <StatCard
          label="Yield Rate (Reply Y)"
          value={analyticsData.yieldRate}
          icon={<TrendingUp size={18} />}
          iconVariant="green"
          subtext={`${analyticsData.committedAppsCount} deposited commitments`}
          pill={
            <StatusPill variant="success" dot>
              Matriculating
            </StatusPill>
          }
        />

        <StatCard
          label="Melt / Decline Rate"
          value={analyticsData.meltRate}
          icon={<AlertCircle size={18} />}
          iconVariant="purple"
          subtext="Offers declined, deferred, or no-show"
          pill={
            <StatusPill variant="neutral">
              Attrition
            </StatusPill>
          }
        />

        <StatCard
          label="Avg Decision Velocity"
          value={
            analyticsData.avgVelocity !== "—"
              ? `${analyticsData.avgVelocity} Days`
              : "—"
          }
          icon={<Clock size={18} />}
          iconVariant="blue"
          subtext="Submitted to decision release"
          pill={
            <StatusPill variant="neutral">
              Turnaround
            </StatusPill>
          }
        />
      </div>

      {/* 3. Main 3-Tab Segmented Switcher */}
      <div className="admissions-tabs-nav">
        <button
          className={`tab-switch-btn ${
            activeTab === "funnel" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("funnel")}
        >
          <BarChart3 size={16} />
          <span>Executive Funnel & Decisions</span>
        </button>

        <button
          className={`tab-switch-btn ${
            activeTab === "pathways" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("pathways")}
        >
          <Globe size={16} />
          <span>Transfer Pathways & Cohorts</span>
        </button>

        <button
          className={`tab-switch-btn ${
            activeTab === "roster" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("roster")}
        >
          <FileSpreadsheet size={16} />
          <span>
            Applications Roster & Queue ({filteredRosterApps.length})
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: Executive Funnel & Decision Distribution
          ========================================================================= */}
      {activeTab === "funnel" && (
        <div className="tab-pane-content">
          <div className="funnel-analytics-grid">
            {/* Complete Funnel Card */}
            <div className="admissions-card">
              <div className="card-top-header">
                <div>
                  <h3>Admissions Pipeline & Conversion Funnel</h3>
                  <p>Stage-by-stage progression from submission to active matriculation</p>
                </div>
                <StatusPill variant="info">
                  {selectedCycle !== "all" ? `Cycle ${selectedCycle}` : "All Time"}
                </StatusPill>
              </div>

              <div className="funnel-bars-container">
                {analyticsData.funnelStages.map((stage) => {
                  const widthPct = Math.max(stage.pct, 8);
                  return (
                    <div key={stage.label} className="funnel-stage-row">
                      <div className="funnel-stage-meta">
                        <span className="funnel-stage-title">{stage.label}</span>
                        <span className="funnel-stage-sub">{stage.sub}</span>
                      </div>

                      <div className="funnel-track-wrapper">
                        <div
                          className="funnel-bar-fill"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: stage.color,
                          }}
                        />
                      </div>

                      <div className="funnel-values-col">
                        <span className="funnel-val-count font-mono">
                          {stage.count}
                        </span>
                        <span className="funnel-val-pct font-mono">
                          {stage.pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="funnel-ratios-footer">
                <div className="ratio-badge">
                  <span>App-to-Admit:</span>
                  <strong>{analyticsData.admitRate}</strong>
                </div>
                <div className="ratio-badge">
                  <span>Admit-to-Yield:</span>
                  <strong>{analyticsData.yieldRate}</strong>
                </div>
                <div className="ratio-badge">
                  <span>Decline/Melt:</span>
                  <strong>{analyticsData.meltRate}</strong>
                </div>
              </div>
            </div>

            {/* Decision & Reply Distributions Card */}
            <div className="admissions-card">
              <div className="card-top-header">
                <div>
                  <h3>Decision Codes & Candidate Reply Analysis</h3>
                  <p>Committee actions and admitted candidate response outcomes</p>
                </div>
                <StatusPill variant="neutral">
                  Institutional Review
                </StatusPill>
              </div>

              <div className="decision-sections-wrap">
                {/* 1. Decision Code Breakdown */}
                <div className="distribution-block">
                  <h4 className="block-title">Institutional Decision Breakdown</h4>
                  <div className="distribution-rows-list">
                    <div className="dist-row">
                      <div className="dist-label-wrap">
                        <span className="code-tag font-mono code-ac">AC</span>
                        <span className="dist-name">Accepted</span>
                      </div>
                      <div className="dist-track">
                        <div
                          className="dist-fill fill-green"
                          style={{
                            width: `${
                              analyticsData.totalApplications > 0
                                ? (analyticsData.decisionCounts.AC /
                                    analyticsData.totalApplications) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="dist-counts font-mono">
                        {analyticsData.decisionCounts.AC}
                      </div>
                    </div>

                    <div className="dist-row">
                      <div className="dist-label-wrap">
                        <span className="code-tag font-mono code-ap">AP</span>
                        <span className="dist-name">Accepted Provisional</span>
                      </div>
                      <div className="dist-track">
                        <div
                          className="dist-fill fill-teal"
                          style={{
                            width: `${
                              analyticsData.totalApplications > 0
                                ? (analyticsData.decisionCounts.AP /
                                    analyticsData.totalApplications) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="dist-counts font-mono">
                        {analyticsData.decisionCounts.AP}
                      </div>
                    </div>

                    <div className="dist-row">
                      <div className="dist-label-wrap">
                        <span className="code-tag font-mono code-wl">WL</span>
                        <span className="dist-name">Waitlisted</span>
                      </div>
                      <div className="dist-track">
                        <div
                          className="dist-fill fill-amber"
                          style={{
                            width: `${
                              analyticsData.totalApplications > 0
                                ? (analyticsData.decisionCounts.WL /
                                    analyticsData.totalApplications) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="dist-counts font-mono">
                        {analyticsData.decisionCounts.WL}
                      </div>
                    </div>

                    <div className="dist-row">
                      <div className="dist-label-wrap">
                        <span className="code-tag font-mono code-rh">RH</span>
                        <span className="dist-name">Rejected / Held</span>
                      </div>
                      <div className="dist-track">
                        <div
                          className="dist-fill fill-red"
                          style={{
                            width: `${
                              analyticsData.totalApplications > 0
                                ? (analyticsData.decisionCounts.RH /
                                    analyticsData.totalApplications) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="dist-counts font-mono">
                        {analyticsData.decisionCounts.RH}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Candidate Reply Breakdown (Admitted Pool) */}
                <div className="distribution-block">
                  <h4 className="block-title">
                    Admitted Candidate Response (Yield Outcomes)
                  </h4>
                  <div className="distribution-rows-list">
                    <div className="dist-row">
                      <div className="dist-label-wrap">
                        <span className="code-tag font-mono reply-y">Y</span>
                        <span className="dist-name">Yes / Confirmed Intent</span>
                      </div>
                      <div className="dist-track">
                        <div
                          className="dist-fill fill-green"
                          style={{
                            width: `${
                              analyticsData.admittedAppsCount > 0
                                ? (analyticsData.replyCounts.Y /
                                    analyticsData.admittedAppsCount) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="dist-counts font-mono">
                        {analyticsData.replyCounts.Y}
                      </div>
                    </div>

                    <div className="dist-row">
                      <div className="dist-label-wrap">
                        <span className="code-tag font-mono reply-nc">NC</span>
                        <span className="dist-name">Declined / No</span>
                      </div>
                      <div className="dist-track">
                        <div
                          className="dist-fill fill-purple"
                          style={{
                            width: `${
                              analyticsData.admittedAppsCount > 0
                                ? (analyticsData.replyCounts.NC /
                                    analyticsData.admittedAppsCount) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="dist-counts font-mono">
                        {analyticsData.replyCounts.NC}
                      </div>
                    </div>

                    <div className="dist-row">
                      <div className="dist-label-wrap">
                        <span className="code-tag font-mono reply-df">DF</span>
                        <span className="dist-name">Deferred to Future Term</span>
                      </div>
                      <div className="dist-track">
                        <div
                          className="dist-fill fill-amber"
                          style={{
                            width: `${
                              analyticsData.admittedAppsCount > 0
                                ? (analyticsData.replyCounts.DF /
                                    analyticsData.admittedAppsCount) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="dist-counts font-mono">
                        {analyticsData.replyCounts.DF}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Transfer Pathways & Cohort Yield
          ========================================================================= */}
      {activeTab === "pathways" && (
        <div className="tab-pane-content">
          <div className="pathways-analytics-grid">
            {/* Transfer Origin Performance Card */}
            <div className="admissions-card">
              <div className="card-top-header">
                <div>
                  <h3>Transfer Institution Pathway Performance</h3>
                  <p>Admit rates, yields, and velocity by transfer origin</p>
                </div>
                <StatusPill variant="info">
                  GS Transfer Engine
                </StatusPill>
              </div>

              <div className="table-responsive-box">
                <table className="admissions-sub-table">
                  <thead>
                    <tr>
                      <th>Transfer Pathway</th>
                      <th>Total Apps</th>
                      <th>Admitted</th>
                      <th>Admit %</th>
                      <th>Committed</th>
                      <th>Yield %</th>
                      <th>Avg Turnaround</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.transferPathways.map((path) => (
                      <tr key={path.type}>
                        <td>
                          <strong>{path.label}</strong>
                        </td>
                        <td className="font-mono">{path.apps}</td>
                        <td className="font-mono">{path.admitted}</td>
                        <td className="font-mono font-bold text-primary">
                          {path.admitRate}
                        </td>
                        <td className="font-mono">{path.committed}</td>
                        <td className="font-mono font-bold text-success">
                          {path.yieldRate}
                        </td>
                        <td className="font-mono text-muted">{path.avgDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recruitment Channels Card */}
            <div className="admissions-card">
              <div className="card-top-header">
                <div>
                  <h3>Recruitment Channels & Source Yield</h3>
                  <p>Inflow performance across outreach channels</p>
                </div>
                <StatusPill variant="neutral">
                  Partner Programs
                </StatusPill>
              </div>

              <div className="table-responsive-box">
                <table className="admissions-sub-table">
                  <thead>
                    <tr>
                      <th>Recruitment Source</th>
                      <th>Apps</th>
                      <th>Admitted</th>
                      <th>Admit %</th>
                      <th>Committed</th>
                      <th>Yield %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.recruitmentSources.map((src) => (
                      <tr key={src.source}>
                        <td>
                          <strong>{src.source}</strong>
                        </td>
                        <td className="font-mono">{src.apps}</td>
                        <td className="font-mono">{src.admitted}</td>
                        <td className="font-mono font-bold text-primary">
                          {src.admitRate}
                        </td>
                        <td className="font-mono">{src.committed}</td>
                        <td className="font-mono font-bold text-success">
                          {src.yieldRate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Program Demand & Yield Matrix Table */}
          <div className="admissions-card" style={{ marginTop: "20px" }}>
            <div className="card-top-header">
              <div>
                <h3>Academic Program Demand & Yield Matrix</h3>
                <p>Volume, selectivity, yield, and decision turnaround across degree majors</p>
              </div>
              <StatusPill variant="neutral">
                {analyticsData.progMatrix.length} Programs Evaluated
              </StatusPill>
            </div>

            <div className="table-responsive-box">
              <table className="admissions-sub-table">
                <thead>
                  <tr>
                    <th>Program Code & Name</th>
                    <th>Degree Level</th>
                    <th>Applications</th>
                    <th>Admitted</th>
                    <th>Admit Rate</th>
                    <th>Committed</th>
                    <th>Yield Rate</th>
                    <th>Decision Velocity</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.progMatrix.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="prog-title-cell">
                          <span className="font-mono badge-program-tag">
                            {p.code}
                          </span>
                          <span className="prog-name-text">{p.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{p.degreeLevel}</td>
                      <td className="font-mono font-bold">{p.appsCount}</td>
                      <td className="font-mono">{p.admittedCount}</td>
                      <td className="font-mono font-bold text-primary">
                        {p.admitRate}
                      </td>
                      <td className="font-mono">{p.committedCount}</td>
                      <td className="font-mono font-bold text-success">
                        {p.yieldRate}
                      </td>
                      <td className="font-mono text-muted">{p.avgDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: Applications Roster & Decision Queue
          ========================================================================= */}
      {activeTab === "roster" && (
        <div className="tab-pane-content">
          {/* Sub-Filters Toolbar */}
          <div className="roster-filter-card">
            <div className="filter-search-row">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search applicant name, email, or program..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="roster-search-input"
                />
                {rosterSearch && (
                  <button
                    className="btn-clear-search"
                    onClick={() => setRosterSearch("")}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="filter-controls-group">
                {/* Stage Filter */}
                <div className="select-wrapper">
                  <Layers size={13} className="select-icon" />
                  <select
                    value={rosterStage}
                    onChange={(e) => setRosterStage(e.target.value)}
                    className="roster-select"
                    aria-label="Filter by application stage"
                  >
                    <option value="all">All Stages</option>
                    <option value="started">Started</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="admitted">Admitted</option>
                    <option value="waitlisted">Waitlisted</option>
                    <option value="denied">Denied</option>
                    <option value="committed">Committed</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>

                {/* Decision Code Filter */}
                <div className="select-wrapper">
                  <ShieldCheck size={13} className="select-icon" />
                  <select
                    value={rosterDecision}
                    onChange={(e) => setRosterDecision(e.target.value)}
                    className="roster-select"
                    aria-label="Filter by decision code"
                  >
                    <option value="all">All Decisions</option>
                    <option value="AC">AC - Accepted</option>
                    <option value="AP">AP - Accepted Provisional</option>
                    <option value="WL">WL - Waitlisted</option>
                    <option value="RH">RH - Rejected/Held</option>
                  </select>
                </div>

                {/* Reply Code Filter */}
                <div className="select-wrapper">
                  <CheckCircle2 size={13} className="select-icon" />
                  <select
                    value={rosterReply}
                    onChange={(e) => setRosterReply(e.target.value)}
                    className="roster-select"
                    aria-label="Filter by applicant reply code"
                  >
                    <option value="all">All Replies</option>
                    <option value="Y">Y - Accepted (Committed)</option>
                    <option value="DF">DF - Deferred</option>
                    <option value="NC">NC - Declined</option>
                    <option value="NS">NS - No Show</option>
                    <option value="NR">NR - No Reply</option>
                  </select>
                </div>

                {/* Transfer Type Filter */}
                <div className="select-wrapper">
                  <Globe size={13} className="select-icon" />
                  <select
                    value={rosterTransferType}
                    onChange={(e) => setRosterTransferType(e.target.value)}
                    className="roster-select"
                    aria-label="Filter by transfer origin"
                  >
                    <option value="all">All Transfer Types</option>
                    <option value="community_college">Community College</option>
                    <option value="four_year">4-Year Institution</option>
                    <option value="international">International</option>
                    <option value="other">Other / Direct</option>
                  </select>
                </div>

                {(rosterSearch ||
                  rosterStage !== "all" ||
                  rosterDecision !== "all" ||
                  rosterReply !== "all" ||
                  rosterTransferType !== "all") && (
                  <button
                    className="btn-reset-filters"
                    onClick={handleResetRosterFilters}
                    title="Reset filters"
                  >
                    <RotateCw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            <div className="filter-summary-row">
              <span className="results-count">
                Showing <strong>{filteredRosterApps.length}</strong> of{" "}
                <strong>{analyticsData.filteredApps.length}</strong> applications
              </span>
            </div>
          </div>

          {/* Applications Table */}
          <div className="admissions-card roster-table-card">
            {filteredRosterApps.length === 0 ? (
              <div className="admissions-empty-state">
                <Users size={36} className="empty-icon" />
                <h3>No matching applications found</h3>
                <p>Adjust your search query or dropdown filter selections.</p>
                <Button variant="outline" size="sm" onClick={handleResetRosterFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="table-responsive-box">
                <table className="admissions-table">
                  <thead>
                    <tr>
                      <th>Applicant Name & Cohorts</th>
                      <th>Degree Program</th>
                      <th>Cycle / Term</th>
                      <th>Transfer Origin</th>
                      <th>Recruitment Source</th>
                      <th>Stage</th>
                      <th>Decision</th>
                      <th>Reply</th>
                      <th>Turnaround</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRosterApps.map((app) => {
                      const person = peopleMap.get(app.person_id) || {};
                      const prog = programMap.get(app.program_id);
                      const term = termMap.get(app.term_id);

                      // Calculate turnaround days
                      let turnaroundStr = "Pending";
                      if (app.submitted_at && app.decided_at) {
                        const days = Math.round(
                          (new Date(app.decided_at).getTime() -
                            new Date(app.submitted_at).getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        turnaroundStr = `${days} d`;
                      }

                      // Cohort tags from person.attributes
                      const attrs = person.attributes || {};

                      return (
                        <tr key={app.id}>
                          {/* Name & Cohorts */}
                          <td>
                            <div className="applicant-identity-cell">
                              <span className="applicant-name">
                                {person.first_name && person.last_name
                                  ? `${person.first_name} ${person.last_name}`
                                  : person.email || "Applicant"}
                              </span>
                              <span className="applicant-email font-mono">
                                {person.email || "—"}
                              </span>

                              <div className="cohort-tags-row">
                                {attrs.veteran && (
                                  <span className="cohort-tag tag-veteran">
                                    🎖️ Veteran
                                  </span>
                                )}
                                {attrs.transfer && (
                                  <span className="cohort-tag tag-transfer">
                                    🔄 Transfer
                                  </span>
                                )}
                                {attrs.first_gen && (
                                  <span className="cohort-tag tag-firstgen">
                                    🌟 First-Gen
                                  </span>
                                )}
                                {attrs.international && (
                                  <span className="cohort-tag tag-international">
                                    🌐 International
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Degree Program */}
                          <td>
                            <div className="program-cell">
                              <span className="program-code-pill font-mono">
                                {prog?.code || "UNKN"}
                              </span>
                              <span className="program-full-title">
                                {prog?.name || "Program"}
                              </span>
                            </div>
                          </td>

                          {/* Cycle / Term */}
                          <td>
                            <div className="cycle-term-cell">
                              <strong>Cycle {app.application_year}</strong>
                              <span className="text-muted">
                                {term?.name || term?.code || "Term"}
                              </span>
                            </div>
                          </td>

                          {/* Transfer Origin */}
                          <td>
                            <span className="origin-badge">
                              {app.transfer_institution_type
                                ? app.transfer_institution_type
                                    .replace("_", " ")
                                    .toUpperCase()
                                : "FIRST-YEAR"}
                            </span>
                          </td>

                          {/* Recruitment Source */}
                          <td>
                            <span className="source-text">
                              {app.applicant_source || "Direct Portal"}
                            </span>
                          </td>

                          {/* Stage */}
                          <td>
                            <StatusPill
                              variant={
                                app.stage === "committed" ||
                                app.stage === "enrolled"
                                  ? "success"
                                  : app.stage === "admitted"
                                  ? "info"
                                  : app.stage === "under_review"
                                  ? "warning"
                                  : "neutral"
                              }
                              dot
                            >
                              {app.stage.replace("_", " ").toUpperCase()}
                            </StatusPill>
                          </td>

                          {/* Decision Code */}
                          <td>
                            {app.decision_code ? (
                              <span
                                className={`code-pill font-mono ${
                                  app.decision_code === "AC" ||
                                  app.decision_code === "AP"
                                    ? "code-admitted"
                                    : app.decision_code === "WL"
                                    ? "code-waitlist"
                                    : "code-denied"
                                }`}
                              >
                                {app.decision_code}
                              </span>
                            ) : (
                              <span className="text-muted font-mono">—</span>
                            )}
                          </td>

                          {/* Reply Code */}
                          <td>
                            {app.reply_code ? (
                              <span
                                className={`reply-pill font-mono ${
                                  app.reply_code === "Y"
                                    ? "reply-yes"
                                    : "reply-no"
                                }`}
                              >
                                {app.reply_code}
                              </span>
                            ) : (
                              <span className="text-muted font-mono">—</span>
                            )}
                          </td>

                          {/* Decision Turnaround */}
                          <td>
                            <span className="font-mono text-muted">
                              {turnaroundStr}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="text-right">
                            <button
                              className="btn-action-edit-decision"
                              onClick={() => handleOpenEdit(app)}
                              title="Update Admission Decision"
                            >
                              <Edit size={13} />
                              <span>Decision</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Edit Admission Decision Modal */}
      {editModalApp && (
        <Modal
          isOpen={true}
          onClose={() => setEditModalApp(null)}
          title="Update Admission Decision & Stage"
          subtitle={`Cycle ${editModalApp.application_year} • Application #${editModalApp.id.slice(0, 8)}`}
          size="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalApp(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={updateAppMutation.isPending}
                onClick={handleSaveEdit}
              >
                Save Decision Update
              </Button>
            </>
          }
        >
          <div className="edit-form-grid">
            {/* Stage */}
            <div className="form-group">
              <label>Application Stage *</label>
              <select
                className="form-select"
                value={editFormData.stage}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    stage: e.target.value,
                  })
                }
                required
              >
                <option value="started">Started</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="admitted">Admitted</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="denied">Denied</option>
                <option value="committed">Committed</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Decision Code */}
            <div className="form-group">
              <label>Institutional Decision Code</label>
              <select
                className="form-select font-mono"
                value={editFormData.decision_code}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    decision_code: e.target.value,
                  })
                }
              >
                <option value="">None / Pending</option>
                <option value="AC">AC - Accepted</option>
                <option value="AP">AP - Accepted Provisional</option>
                <option value="WL">WL - Waitlisted</option>
                <option value="RH">RH - Rejected / Held</option>
              </select>
            </div>

            {/* Reply Code */}
            <div className="form-group">
              <label>Applicant Reply Code</label>
              <select
                className="form-select font-mono"
                value={editFormData.reply_code}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    reply_code: e.target.value,
                  })
                }
              >
                <option value="">None / Pending</option>
                <option value="Y">Y - Accepted Offer (Committed)</option>
                <option value="DF">DF - Deferred</option>
                <option value="NC">NC - Declined Offer</option>
                <option value="NS">NS - No Show</option>
                <option value="NR">NR - No Reply</option>
              </select>
            </div>

            {/* Decision Date */}
            <div className="form-group">
              <label>Decision Release Date</label>
              <input
                type="date"
                className="form-input font-mono"
                value={editFormData.decided_at}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    decided_at: e.target.value,
                  })
                }
              />
            </div>

            {/* Transfer Institution Type */}
            <div className="form-group">
              <label>Transfer Institution Type</label>
              <select
                className="form-select"
                value={editFormData.transfer_institution_type}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    transfer_institution_type: e.target.value,
                  })
                }
              >
                <option value="">None / Direct</option>
                <option value="community_college">Community College</option>
                <option value="four_year">4-Year College</option>
                <option value="international">International</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Applicant Source */}
            <div className="form-group">
              <label>Applicant Source Channel</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Military Veterans Initiative"
                value={editFormData.applicant_source}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    applicant_source: e.target.value,
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
