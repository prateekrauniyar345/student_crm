import React, { useState, useMemo } from "react";
import {
  Users,
  TrendingUp,
  FileText,
  AlertTriangle,
  Award,
  Filter,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { useAllPeople } from "../../../hooks/usePeople";
import { useAllApplications } from "../../../hooks/useApplications";
import { useAllStudentProfiles } from "../../../hooks/useStudentProfiles";
import { useAllStudentTermRecords } from "../../../hooks/useStudentTermRecords";
import { useAllPrograms } from "../../../hooks/usePrograms";
import { useAllAcademicTerms } from "../../../hooks/useAcademicTerms";
import { StatusPill, StatCard, Spinner } from "../../../ui";
import "./OverviewView.css";

export default function OverviewView({ user, setActiveTab }) {
  // 1. Data queries
  const {
    data: people = [],
    isLoading: isLoadingPeople,
    refetch: refetchPeople,
  } = useAllPeople();

  const {
    data: applications = [],
    isLoading: isLoadingApps,
    refetch: refetchApps,
  } = useAllApplications();

  const {
    data: studentProfiles = [],
    isLoading: isLoadingProfiles,
    refetch: refetchProfiles,
  } = useAllStudentProfiles();

  const {
    data: studentTermRecords = [],
    isLoading: isLoadingRecords,
    refetch: refetchRecords,
  } = useAllStudentTermRecords();

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

  const isInitialLoading =
    isLoadingPeople ||
    isLoadingApps ||
    isLoadingProfiles ||
    isLoadingRecords ||
    isLoadingPrograms ||
    isLoadingTerms;

  // 2. Filter states
  const [selectedCycle, setSelectedCycle] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchPeople(),
      refetchApps(),
      refetchProfiles(),
      refetchRecords(),
      refetchPrograms(),
      refetchTerms(),
    ]);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  // Maps for quick lookups
  const programMap = useMemo(() => {
    const map = new Map();
    programs.forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [programs]);

  const peopleMap = useMemo(() => {
    const map = new Map();
    people.forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [people]);

  const termMap = useMemo(() => {
    const map = new Map();
    academicTerms.forEach((t) => {
      map.set(t.id, t);
    });
    return map;
  }, [academicTerms]);

  // Extract unique application years available
  const availableYears = useMemo(() => {
    const years = new Set();
    applications.forEach((a) => {
      if (a.application_year) years.add(a.application_year);
    });
    academicTerms.forEach((t) => {
      if (t.application_year) years.add(t.application_year);
    });
    [2026, 2025, 2024, 2023, 2022].forEach((y) => years.add(y));
    return Array.from(years).sort((a, b) => b - a);
  }, [applications, academicTerms]);

  // 3. Admissions & Academic Analytics Computations
  const analyticsData = useMemo(() => {
    // Filter applications by Cycle and Program
    const filteredApps = applications.filter((app) => {
      const matchCycle =
        selectedCycle === "all" ||
        String(app.application_year) === String(selectedCycle);
      const matchProgram =
        selectedProgram === "all" || app.program_id === selectedProgram;
      return matchCycle && matchProgram;
    });

    const totalApplications = filteredApps.length;

    // Prior Year Applications for YoY
    const priorYear =
      selectedCycle !== "all" ? Number(selectedCycle) - 1 : null;
    const priorYearApps = priorYear
      ? applications.filter((app) => {
          const matchYear = app.application_year === priorYear;
          const matchProgram =
            selectedProgram === "all" || app.program_id === selectedProgram;
          return matchYear && matchProgram;
        })
      : [];
    const priorYearCount = priorYearApps.length;

    let yoyGrowth = null;
    if (priorYear && priorYearCount > 0) {
      const growth = ((totalApplications - priorYearCount) / priorYearCount) * 100;
      yoyGrowth = (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
    }

    // Admit Rate: (AC + AP) / decided apps
    const decidedApps = filteredApps.filter(
      (a) => a.decision_code !== null && a.decision_code !== undefined
    );
    const admittedApps = filteredApps.filter(
      (a) =>
        a.decision_code === "AC" ||
        a.decision_code === "AP" ||
        a.stage === "admitted"
    );
    const admitRate =
      decidedApps.length > 0
        ? ((admittedApps.length / decidedApps.length) * 100).toFixed(1) + "%"
        : totalApplications > 0 && admittedApps.length > 0
        ? ((admittedApps.length / totalApplications) * 100).toFixed(1) + "%"
        : "0.0%";

    // Yield Rate: Committed (Reply Y) / Admitted
    const committedApps = admittedApps.filter(
      (a) =>
        a.reply_code === "Y" ||
        a.stage === "committed" ||
        a.stage === "enrolled"
    );
    const yieldRate =
      admittedApps.length > 0
        ? ((committedApps.length / admittedApps.length) * 100).toFixed(1) + "%"
        : "0.0%";

    // 4. Student Success & Risk Calculations
    const activeProfiles = studentProfiles.filter((sp) => {
      const isActive = sp.student_status === "active";
      const matchProg =
        selectedProgram === "all" || sp.current_program_id === selectedProgram;
      return isActive && matchProg;
    });

    const activeStudentsCount = activeProfiles.length;

    // Get latest completed term record per active student
    const activeStudentDetails = activeProfiles.map((sp) => {
      const person = peopleMap.get(sp.person_id) || {};
      const currentProg = programMap.get(sp.current_program_id);

      const studentRecords = studentTermRecords.filter(
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

      const latestCompletedRecord =
        studentRecords.find(
          (r) =>
            r.cumulative_gpa !== null &&
            r.cumulative_gpa !== undefined &&
            r.credits_attempted > 0
        ) ||
        studentRecords[0] ||
        null;

      const recordProg = latestCompletedRecord?.program_id
        ? programMap.get(latestCompletedRecord.program_id)
        : currentProg;

      const cumGpa =
        latestCompletedRecord?.cumulative_gpa !== null &&
        latestCompletedRecord?.cumulative_gpa !== undefined
          ? Number(latestCompletedRecord.cumulative_gpa)
          : null;

      const termGpa =
        latestCompletedRecord?.term_gpa !== null &&
        latestCompletedRecord?.term_gpa !== undefined
          ? Number(latestCompletedRecord.term_gpa)
          : null;

      const standing =
        latestCompletedRecord?.academic_standing ||
        (cumGpa !== null && cumGpa < 2.0
          ? "probation"
          : cumGpa !== null && cumGpa < 2.5
          ? "warning"
          : "good");

      const isAtRisk =
        standing === "warning" ||
        standing === "probation" ||
        standing === "suspension" ||
        (cumGpa !== null && cumGpa < 2.5);

      return {
        personId: sp.person_id,
        personName:
          person.first_name && person.last_name
            ? `${person.first_name} ${person.last_name}`
            : person.email || "Unknown Student",
        studentNumber: sp.student_number || "—",
        programCode: recordProg?.code || currentProg?.code || "UNKN",
        programName: recordProg?.name || currentProg?.name || "Undeclared",
        cumGpa,
        termGpa,
        standing,
        isAtRisk,
        advisorMeetings: latestCompletedRecord?.advisor_meetings || 0,
        latestRecord: latestCompletedRecord,
      };
    });

    const atRiskStudents = activeStudentDetails.filter((s) => s.isAtRisk);
    const atRiskCount = atRiskStudents.length;
    const atRiskPercentage =
      activeStudentsCount > 0
        ? ((atRiskCount / activeStudentsCount) * 100).toFixed(1) + "%"
        : "0.0%";

    const validGpas = activeStudentDetails
      .map((s) => s.cumGpa)
      .filter((g) => g !== null && !isNaN(g));

    const averageGpa =
      validGpas.length > 0
        ? (validGpas.reduce((acc, g) => acc + g, 0) / validGpas.length).toFixed(2)
        : "N/A";

    // 5. Admissions Funnel Metrics (100% computed from database)
    const prospectsCount = people.filter(
      (p) => p.lifecycle_stage === "prospect"
    ).length;
    const funnelApplicants = totalApplications;
    const funnelAdmitted = admittedApps.length;
    const funnelCommitted = committedApps.length;
    const enrolledPeopleCount = people.filter(
      (p) => p.lifecycle_stage === "enrolled"
    ).length;
    const funnelEnrolled = Math.min(
      enrolledPeopleCount,
      funnelCommitted > 0 ? funnelCommitted : enrolledPeopleCount
    );

    const funnelStages = [
      {
        label: "Prospects",
        count: prospectsCount,
        rate: "100%",
        sub: "Inquiry & Recruitment Pool",
        color: "var(--color-primary)",
      },
      {
        label: "Applicants",
        count: funnelApplicants,
        rate:
          prospectsCount > 0
            ? `${Math.min(100, Math.round((funnelApplicants / prospectsCount) * 100))}%`
            : totalApplications > 0
            ? "100%"
            : "0%",
        sub: "Submitted Applications",
        color: "#0284C7",
      },
      {
        label: "Admitted",
        count: funnelAdmitted,
        rate: `${admitRate}`,
        sub: "Acceptances (AC + AP)",
        color: "#0D9488",
      },
      {
        label: "Committed",
        count: funnelCommitted,
        rate: `${yieldRate}`,
        sub: "Confirmed Intent (Reply Y)",
        color: "var(--color-success)",
      },
      {
        label: "Enrolled",
        count: funnelEnrolled,
        rate:
          funnelCommitted > 0
            ? `${Math.round((funnelEnrolled / funnelCommitted) * 100)}%`
            : funnelEnrolled > 0
            ? "100%"
            : "0%",
        sub: "Active Matriculation",
        color: "#16A34A",
      },
    ];

    const maxFunnelVal = Math.max(...funnelStages.map((s) => s.count), 1);

    // 6. Application Volume Trend (Multi-Year)
    const trendYears = [2022, 2023, 2024, 2025, 2026, 2027];
    const trendData = trendYears.map((year) => {
      const count = applications.filter((a) => {
        const matchYear = a.application_year === year;
        const matchProg =
          selectedProgram === "all" || a.program_id === selectedProgram;
        return matchYear && matchProg;
      }).length;
      return { year, count };
    });

    const maxTrendVal = Math.max(...trendData.map((d) => d.count), 1);

    // 7. Demand by Program
    const programDemandMap = new Map();
    programs.forEach((prog) => {
      programDemandMap.set(prog.id, {
        id: prog.id,
        code: prog.code,
        name: prog.name,
        count: 0,
      });
    });

    filteredApps.forEach((app) => {
      if (app.program_id && programDemandMap.has(app.program_id)) {
        programDemandMap.get(app.program_id).count += 1;
      }
    });

    const programDemandList = Array.from(programDemandMap.values())
      .filter((p) => p.count > 0 || selectedProgram === "all")
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const maxProgVal = Math.max(
      ...programDemandList.map((p) => p.count),
      1
    );

    // 8. Academic Standing Distribution
    const standingCounts = {
      good: 0,
      warning: 0,
      probation: 0,
      suspension: 0,
    };

    activeStudentDetails.forEach((s) => {
      if (standingCounts[s.standing] !== undefined) {
        standingCounts[s.standing] += 1;
      } else {
        standingCounts.good += 1;
      }
    });

    const totalStandingEvaluated = Math.max(activeStudentsCount, 1);
    const standingDistribution = [
      {
        label: "Good Standing",
        key: "good",
        count: standingCounts.good,
        pct: Math.round((standingCounts.good / totalStandingEvaluated) * 100),
        variant: "success",
        color: "var(--color-success)",
      },
      {
        label: "Academic Warning",
        key: "warning",
        count: standingCounts.warning,
        pct: Math.round((standingCounts.warning / totalStandingEvaluated) * 100),
        variant: "warning",
        color: "var(--color-warning)",
      },
      {
        label: "Academic Probation",
        key: "probation",
        count: standingCounts.probation,
        pct: Math.round((standingCounts.probation / totalStandingEvaluated) * 100),
        variant: "danger",
        color: "#EA580C",
      },
      {
        label: "Suspension",
        key: "suspension",
        count: standingCounts.suspension,
        pct: Math.round((standingCounts.suspension / totalStandingEvaluated) * 100),
        variant: "danger",
        color: "var(--color-danger)",
      },
    ];

    return {
      totalApplications,
      priorYearCount,
      yoyGrowth,
      admittedCount: admittedApps.length,
      admitRate,
      committedCount: committedApps.length,
      yieldRate,
      activeStudentsCount,
      atRiskCount,
      atRiskPercentage,
      averageGpa,
      funnelStages,
      maxFunnelVal,
      trendData,
      maxTrendVal,
      programDemandList,
      maxProgVal,
      standingDistribution,
      atRiskStudents,
    };
  }, [
    applications,
    studentProfiles,
    studentTermRecords,
    people,
    programs,
    academicTerms,
    selectedCycle,
    selectedProgram,
    peopleMap,
    programMap,
    termMap,
  ]);

  if (isInitialLoading) {
    return (
      <div className="overview-loading-state">
        <Spinner size="lg" />
        <p>Loading Enrollment Analytics & Student Data...</p>
      </div>
    );
  }

  return (
    <div className="overview-view">
      {/* 1. Header Toolbar & Context */}
      <div className="overview-header-bar">
        <div className="overview-header-title">
          <div className="institution-badge">
            <ShieldCheck size={14} />
            <span>Columbia University • School of General Studies</span>
          </div>
          <h2>Enrollment Analytics & Academic Overview</h2>
          <p>
            Real-time admissions conversion pipeline, student body performance, and staff triage indicators.
          </p>
        </div>

        {/* Global Filter Toolbar */}
        <div className="overview-toolbar-actions">
          <div className="filter-select-group">
            <Calendar size={14} className="filter-icon" />
            <select
              className="overview-filter-select"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              aria-label="Filter by Application Cycle"
            >
              <option value="all">All Application Cycles</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  Cycle: {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-group">
            <Layers size={14} className="filter-icon" />
            <select
              className="overview-filter-select"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              aria-label="Filter by Program"
            >
              <option value="all">All Degree Programs</option>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.code} - {prog.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className={`btn-refresh-overview ${isRefreshing ? "refreshing" : ""}`}
            onClick={handleRefresh}
            title="Refresh analytics data"
          >
            <RotateCw size={14} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. Top 6 Primary KPIs Grid (2 Rows of 3 Cards) */}
      <div className="overview-kpi-matrix">
        {/* Row 1: Admissions Performance */}
        <StatCard
          label="Total Applications"
          value={analyticsData.totalApplications}
          icon={<FileText size={18} />}
          iconVariant="blue"
          subtext={
            analyticsData.yoyGrowth
              ? `${analyticsData.yoyGrowth} vs prior cycle`
              : selectedCycle === "all"
              ? "All historical cycles"
              : `Cycle ${selectedCycle} intake`
          }
          pill={
            analyticsData.yoyGrowth ? (
              <StatusPill variant="success" dot>
                {analyticsData.yoyGrowth} YoY
              </StatusPill>
            ) : null
          }
        />

        <StatCard
          label="Admit Rate"
          value={analyticsData.admitRate}
          icon={<UserCheck size={18} />}
          iconVariant="green"
          subtext={`${analyticsData.admittedCount} Admitted (AC + AP)`}
          pill={
            <StatusPill variant="info">
              {analyticsData.admittedCount} Admitted
            </StatusPill>
          }
        />

        <StatCard
          label="Yield Rate"
          value={analyticsData.yieldRate}
          icon={<TrendingUp size={18} />}
          iconVariant="purple"
          subtext={`${analyticsData.committedCount} Committed (Reply Y)`}
          pill={
            <StatusPill variant="success">
              {analyticsData.committedCount} Committed
            </StatusPill>
          }
        />

        {/* Row 2: Student Success & Risk */}
        <StatCard
          label="Active Students"
          value={analyticsData.activeStudentsCount}
          icon={<GraduationCap size={18} />}
          iconVariant="blue"
          subtext="Currently enrolled & active"
          pill={
            <StatusPill variant="success" dot>
              Active Roster
            </StatusPill>
          }
        />

        <StatCard
          label="At-Risk Students"
          value={analyticsData.atRiskCount}
          icon={<AlertTriangle size={18} />}
          iconVariant={analyticsData.atRiskCount > 0 ? "danger" : "green"}
          subtext={`${analyticsData.atRiskPercentage} of active student body`}
          pill={
            <StatusPill
              variant={analyticsData.atRiskCount > 0 ? "warning" : "success"}
            >
              {analyticsData.atRiskCount > 0 ? "Action Required" : "All Healthy"}
            </StatusPill>
          }
        />

        <StatCard
          label="Average Cumulative GPA"
          value={analyticsData.averageGpa}
          icon={<Award size={18} />}
          iconVariant="amber"
          subtext="Latest completed term evaluation"
          pill={
            <StatusPill variant="neutral">
              Scale 0.0 – 4.0
            </StatusPill>
          }
        />
      </div>

      {/* 3. Mid Analytics Section: Funnel & Volume Trend */}
      <div className="overview-charts-grid">
        {/* Admissions Funnel Card */}
        <div className="overview-card funnel-card">
          <div className="card-top-header">
            <div>
              <h3>Admissions & Enrollment Funnel</h3>
              <p>Stage-by-stage progression for Cycle {selectedCycle}</p>
            </div>
            <StatusPill variant="info">
              {selectedCycle !== "all" ? `Cycle ${selectedCycle}` : "All Time"}
            </StatusPill>
          </div>

          <div className="funnel-progression-list">
            {analyticsData.funnelStages.map((stage) => {
              const widthPct = Math.max(
                (stage.count / analyticsData.maxFunnelVal) * 100,
                8
              );
              return (
                <div key={stage.label} className="funnel-row">
                  <div className="funnel-label-col">
                    <span className="funnel-stage-name">{stage.label}</span>
                    <span className="funnel-stage-sub">{stage.sub}</span>
                  </div>

                  <div className="funnel-bar-col">
                    <div className="funnel-track">
                      <div
                        className="funnel-fill"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="funnel-metrics-col">
                    <span className="funnel-count font-mono">{stage.count}</span>
                    <span className="funnel-pct font-mono">{stage.rate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Volume Trend Card */}
        <div className="overview-card trend-card">
          <div className="card-top-header">
            <div>
              <h3>Application Volume Trend</h3>
              <p>Historical application intake from 2022 to present</p>
            </div>
            <StatusPill variant="neutral">2022 – 2027</StatusPill>
          </div>

          <div className="trend-bar-chart">
            {analyticsData.trendData.map((d) => {
              const isSelected = String(d.year) === String(selectedCycle);
              const heightPct = Math.max(
                (d.count / analyticsData.maxTrendVal) * 100,
                10
              );
              return (
                <div
                  key={d.year}
                  className={`trend-col ${isSelected ? "selected-trend" : ""}`}
                  onClick={() => setSelectedCycle(String(d.year))}
                  title={`Click to filter cycle ${d.year} (${d.count} apps)`}
                >
                  <div className="trend-bar-wrap">
                    <span className="trend-val-label font-mono">{d.count}</span>
                    <div
                      className="trend-bar-fill"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="trend-year-label font-mono">{d.year}</span>
                </div>
              );
            })}
          </div>

          <div className="trend-footer-note">
            <span>Tip: Click any year column above to filter the dashboard.</span>
          </div>
        </div>
      </div>

      {/* 4. Secondary Analytics: Program Demand & Academic Standing */}
      <div className="overview-charts-grid">
        {/* Demand by Program */}
        <div className="overview-card">
          <div className="card-top-header">
            <div>
              <h3>Applications by Degree Program</h3>
              <p>Top program demand for selected cycle</p>
            </div>
            <span className="overview-subtle-tag">
              Top {analyticsData.programDemandList.length} Programs
            </span>
          </div>

          <div className="program-demand-list">
            {analyticsData.programDemandList.length === 0 ? (
              <div className="overview-empty-state">
                <p>No applications recorded for this selection.</p>
              </div>
            ) : (
              analyticsData.programDemandList.map((prog) => {
                const widthPct = Math.max(
                  (prog.count / analyticsData.maxProgVal) * 100,
                  6
                );
                return (
                  <div key={prog.id} className="program-demand-row">
                    <div className="prog-title-wrap">
                      <span className="prog-code-pill font-mono">{prog.code}</span>
                      <span className="prog-full-name">{prog.name}</span>
                    </div>

                    <div className="prog-bar-track">
                      <div
                        className="prog-bar-fill"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    <div className="prog-count-box font-mono">
                      {prog.count} {prog.count === 1 ? "app" : "apps"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Academic Standing Breakdown */}
        <div className="overview-card">
          <div className="card-top-header">
            <div>
              <h3>Academic Standing Distribution</h3>
              <p>Current academic health for enrolled students</p>
            </div>
            <StatusPill variant="neutral">
              Currently Enrolled - {analyticsData.activeStudentsCount}
            </StatusPill>
          </div>

          <div className="standing-distribution-list">
            {analyticsData.standingDistribution.map((item) => (
              <div key={item.key} className="standing-item-row">
                <div className="standing-label-group">
                  <span className="standing-name">{item.label}</span>
                  <span className="standing-count-tag font-mono">
                    {item.count} {item.count === 1 ? "student" : "students"}
                  </span>
                </div>

                <div className="standing-bar-track">
                  <div
                    className="standing-bar-fill"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>

                <div className="standing-pct-col font-mono">{item.pct}%</div>
              </div>
            ))}
          </div>

          <div className="standing-summary-pill">
            <CheckCircle2 size={15} className="text-success" />
            <span>
              <strong>{analyticsData.standingDistribution[0]?.pct}%</strong> of students are maintaining good academic standing.
            </span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Actionable Table: Students Needing Attention */}
      <div className="overview-card triage-table-card">
        <div className="card-top-header">
          <div className="header-with-alert">
            <div className="triage-alert-icon">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3>Students Needing Attention (Academic Triage)</h3>
              <p>Active students currently on warning, probation, suspension, or with GPA &lt; 2.50</p>
            </div>
          </div>
          <StatusPill
            variant={analyticsData.atRiskCount > 0 ? "warning" : "success"}
          >
            {analyticsData.atRiskCount} Flagged
          </StatusPill>
        </div>

        {analyticsData.atRiskStudents.length === 0 ? (
          <div className="triage-empty-state">
            <CheckCircle2 size={28} className="text-success" />
            <h4>All active students are in good standing</h4>
            <p>No students currently trigger early-warning or academic risk intervention criteria.</p>
          </div>
        ) : (
          <div className="triage-table-wrapper">
            <table className="triage-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Program</th>
                  <th>Term GPA</th>
                  <th>Cumulative GPA</th>
                  <th>Academic Standing</th>
                  <th>Advisor Meetings</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.atRiskStudents.map((st) => {
                  const isProbation =
                    st.standing === "probation" || st.standing === "suspension";
                  return (
                    <tr key={st.personId}>
                      <td className="font-semibold">{st.personName}</td>
                      <td>
                        <span className="font-mono text-muted">
                          {st.studentNumber}
                        </span>
                      </td>
                      <td>
                        <span className="badge-program-tag font-mono">
                          {st.programCode}
                        </span>{" "}
                        <span className="text-secondary">{st.programName}</span>
                      </td>
                      <td className="font-mono">
                        {st.termGpa !== null ? st.termGpa.toFixed(2) : "—"}
                      </td>
                      <td className="font-mono font-bold">
                        <span
                          className={
                            st.cumGpa !== null && st.cumGpa < 2.0
                              ? "text-danger"
                              : st.cumGpa !== null && st.cumGpa < 2.5
                              ? "text-warning"
                              : ""
                          }
                        >
                          {st.cumGpa !== null ? st.cumGpa.toFixed(2) : "—"}
                        </span>
                      </td>
                      <td>
                        <StatusPill
                          variant={isProbation ? "danger" : "warning"}
                          dot
                        >
                          {st.standing.charAt(0).toUpperCase() +
                            st.standing.slice(1)}
                        </StatusPill>
                      </td>
                      <td>
                        <span className="meetings-badge font-mono">
                          {st.advisorMeetings} {st.advisorMeetings === 1 ? "meeting" : "meetings"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="btn-triage-action"
                          onClick={() => setActiveTab("students")}
                          title="Open student profile"
                        >
                          <span>Review</span>
                          <ArrowRight size={13} />
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
  );
}

