import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Sparkles,
  Terminal,
  Play,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  Trash2,
  Database,
  Search,
  ShieldCheck,
  AlertCircle,
  Clock,
  Code2,
  ChevronRight,
  ChevronDown,
  Layers,
  Users,
  Send,
  RotateCw,
  Table as TableIcon,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import {
  useExecuteSql,
  useAICopilot,
  useAllowedSchema,
} from "../../../hooks/useSqlCopilot";
import { StatusPill, Button, Spinner } from "../../../ui";
import { useToast } from "../../../context/ToastContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./AICopilotView.css";

export default function AICopilotView({ currentUser }) {
  const { success: showToastSuccess, error: showToastError } = useToast();

  // Queries and Mutations
  const { data: schemaData, isLoading: isLoadingSchema } = useAllowedSchema();
  const executeSqlMutation = useExecuteSql();
  const aiCopilotMutation = useAICopilot();

  // Main Tab State
  const [activeTab, setActiveTab] = useState("copilot"); // 'copilot' | 'workbench'

  // AI Co-Pilot State
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hello! I am your **Columbia GS AI Analyst Co-Pilot**. I can translate your natural language questions into safe SQL queries, execute them on student & academic data, and summarize actionable insights.",
      sql_query: null,
      data: null,
      columns: [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const chatBottomRef = useRef(null);

  // SQL Workbench State
  const [sqlEditorCode, setSqlEditorCode] = useState(`-- Columbia GS Student Academic Audit
SELECT 
    sp.student_number,
    p.first_name,
    p.last_name,
    prog.code AS major,
    str.cumulative_gpa,
    str.credits_earned,
    str.academic_standing
FROM student_profiles sp
JOIN people p ON sp.person_id = p.id
JOIN programs prog ON sp.current_program_id = prog.id
LEFT JOIN student_term_records str ON sp.person_id = str.person_id
WHERE sp.student_status = 'active'
ORDER BY str.cumulative_gpa DESC NULLS LAST
LIMIT 25;`);

  const [workbenchResult, setWorkbenchResult] = useState(null);
  const [copiedQueryId, setCopiedQueryId] = useState(null);
  const [selectedTableTab, setSelectedTableTab] = useState("student_profiles");
  const [columnSearch, setColumnSearch] = useState("");

  const schemaTables = useMemo(() => schemaData?.tables || [], [schemaData]);

  const activeTable = useMemo(() => {
    if (!schemaTables.length) return null;
    return schemaTables.find((t) => t.table_name === selectedTableTab) || schemaTables[0];
  }, [schemaTables, selectedTableTab]);

  const filteredColumns = useMemo(() => {
    if (!activeTable) return [];
    if (!columnSearch.trim()) return activeTable.columns || [];
    const q = columnSearch.toLowerCase().trim();
    return (activeTable.columns || []).filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [activeTable, columnSearch]);

  const handleInsertText = (text) => {
    setSqlEditorCode((prev) => (prev ? `${prev} ${text}` : text));
    showToastSuccess(`Inserted "${text}" into SQL editor`);
  };

  // Scroll to bottom on new AI messages
  useEffect(() => {
    if (activeTab === "copilot") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, activeTab]);

  // Quick Prompt Templates
  const quickPrompts = [
    {
      label: "At-Risk Students",
      prompt: "Show all active students on Academic Warning or Probation, or with GPA below 2.50.",
    },
    {
      label: "Veterans in STEM",
      prompt: "List all U.S. Military Veteran students with their degree program and cumulative GPA.",
    },
    {
      label: "Transfer Student Progress",
      prompt: "Show transfer students and their earned credits toward graduation.",
    },
    {
      label: "Dean's List Range",
      prompt: "Find all active students with a cumulative GPA of 3.50 or higher.",
    },
    {
      label: "Admissions Cycle Yield",
      prompt: "Show admissions application outcomes, decision codes, and reply codes.",
    },
  ];

  // Pre-built SQL Snippets
  const sqlSnippets = [
    {
      title: "At-Risk GPA & Warning Triage",
      sql: `SELECT 
    sp.student_number,
    p.first_name,
    p.last_name,
    p.email,
    prog.code AS major,
    str.cumulative_gpa,
    str.academic_standing
FROM student_profiles sp
JOIN people p ON sp.person_id = p.id
JOIN programs prog ON sp.current_program_id = prog.id
JOIN student_term_records str ON sp.person_id = str.person_id
WHERE str.academic_standing != 'good_standing' OR str.cumulative_gpa < 2.50
ORDER BY str.cumulative_gpa ASC;`,
    },
    {
      title: "Veteran Affairs Enrollment Roster",
      sql: `SELECT 
    sp.student_number,
    p.first_name,
    p.last_name,
    p.email,
    prog.name AS major_name,
    str.credits_earned AS total_credits,
    str.cumulative_gpa
FROM student_profiles sp
JOIN people p ON sp.person_id = p.id
JOIN programs prog ON sp.current_program_id = prog.id
JOIN student_term_records str ON sp.person_id = str.person_id
WHERE (p.attributes->>'veteran')::boolean = true
ORDER BY str.cumulative_gpa DESC;`,
    },
    {
      title: "Transfer Pathway Persistence",
      sql: `SELECT 
    sp.student_number,
    p.first_name,
    p.last_name,
    prog.name AS major,
    str.credits_earned AS total_credits,
    str.cumulative_gpa,
    str.academic_standing
FROM student_profiles sp
JOIN people p ON sp.person_id = p.id
JOIN programs prog ON sp.current_program_id = prog.id
JOIN student_term_records str ON sp.person_id = str.person_id
WHERE (p.attributes->>'transfer')::boolean = true
ORDER BY str.cumulative_gpa DESC;`,
    },
    {
      title: "Program Major Enrollment Counts",
      sql: `SELECT 
    prog.code AS major_code,
    prog.name AS major_name,
    COUNT(sp.person_id) AS enrolled_students,
    ROUND(AVG(str.cumulative_gpa), 2) AS avg_major_gpa
FROM programs prog
LEFT JOIN student_profiles sp ON prog.id = sp.current_program_id AND sp.student_status = 'active'
LEFT JOIN student_term_records str ON sp.person_id = str.person_id
GROUP BY prog.code, prog.name
ORDER BY enrolled_students DESC;`,
    },
  ];

  // Send AI Prompt Handler
  const handleSendPrompt = async (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim() || aiCopilotMutation.isPending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await aiCopilotMutation.mutateAsync({
        prompt: query,
        history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.explanation || "Query completed successfully.",
        sql_query: response.sql_query || null,
        data: response.data || [],
        columns: response.columns || [],
        row_count: response.row_count || 0,
        execution_time_ms: response.execution_time_ms || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI query failed:", err);
    }
  };

  // Run SQL in Workbench Handler
  const handleExecuteWorkbenchSQL = async () => {
    if (!sqlEditorCode.trim() || executeSqlMutation.isPending) return;

    try {
      const res = await executeSqlMutation.mutateAsync(sqlEditorCode);
      setWorkbenchResult(res);
      if (res.success) {
        showToastSuccess(`Query executed in ${res.execution_time_ms} ms (${res.row_count} rows)`);
      }
    } catch (err) {
      console.error("SQL execution error:", err);
    }
  };

  // Copy Query to Clipboard
  const handleCopySQL = (sqlText, id) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedQueryId(id);
    showToastSuccess("SQL query copied to clipboard");
    setTimeout(() => setCopiedQueryId(null), 2000);
  };

  // Open Generated Query in SQL Studio
  const handleOpenInWorkbench = (sqlText) => {
    setSqlEditorCode(sqlText);
    setActiveTab("workbench");
    showToastSuccess("Query loaded into SQL Studio");
  };

  // Export Results to CSV
  const handleExportCSV = (dataToExport, columnsToExport, filenamePrefix = "sql_results") => {
    if (!dataToExport || dataToExport.length === 0) return;

    const headers = columnsToExport.join(",");
    const rows = dataToExport.map((row) =>
      columnsToExport
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filenamePrefix}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="ai-copilot-view">
      {/* 1. Header Bar */}
      <div className="copilot-header-bar">
        <div className="copilot-header-title">
          <div className="institution-badge">
            <ShieldCheck size={14} />
            <span>Columbia University • School of General Studies</span>
          </div>
          <h2>AI SQL Co-Pilot & Query Studio</h2>
          <p>
            Natural language querying, intelligent SQL generation, and live interactive query workbench for student and academic analytics.
          </p>
        </div>

        <div className="copilot-header-controls">
          <div className="guardrail-badge" title="Strict read-only guardrails active on academic tables">
            <ShieldCheck size={14} />
            <span>Zero-Leakage Guardrails Active</span>
          </div>
        </div>
      </div>

      {/* 2. Top Segmented Nav Switcher */}
      <div className="copilot-tabs-nav">
        <button
          className={`tab-switch-btn ${activeTab === "copilot" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("copilot")}
        >
          <Sparkles size={16} />
          <span>AI Analyst Co-Pilot</span>
        </button>

        <button
          className={`tab-switch-btn ${activeTab === "workbench" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("workbench")}
        >
          <Terminal size={16} />
          <span>Interactive SQL Studio</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: AI Analyst Co-Pilot (Natural Language to SQL & Insights)
          ========================================================================= */}
      {activeTab === "copilot" && (
        <div className="tab-pane-content copilot-chat-pane">
          {/* Quick Prompts Strip */}
          <div className="quick-prompts-container">
            <span className="quick-prompts-title">
              <Sparkles size={13} />
              <span>Suggested Queries:</span>
            </span>
            <div className="quick-prompts-list">
              {quickPrompts.map((p) => (
                <button
                  key={p.label}
                  className="btn-quick-prompt"
                  onClick={() => handleSendPrompt(p.prompt)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat History Messages */}
          <div className="chat-messages-container">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`chat-message-row ${msg.role}`}>
                <div className="chat-bubble">
                  {/* Message Header */}
                  <div className="chat-bubble-header">
                    <div className="avatar-title">
                      {msg.role === "assistant" ? (
                        <>
                          <div className="ai-avatar">
                            <Sparkles size={14} />
                          </div>
                          <span className="sender-name">Columbia GS AI Co-Pilot</span>
                        </>
                      ) : (
                        <>
                          <div className="user-avatar">
                            <Users size={14} />
                          </div>
                          <span className="sender-name">You (Staff Analyst)</span>
                        </>
                      )}
                    </div>
                    <span className="msg-timestamp">{msg.timestamp}</span>
                  </div>

                  {/* Message Text Content */}
                  <div className="chat-bubble-content markdown-body">
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>

                  {/* Generated SQL Code Block (if present) */}
                  {msg.sql_query && (
                    <div className="generated-sql-block">
                      <div className="sql-block-header">
                        <div className="sql-block-title">
                          <Code2 size={13} />
                          <span>Generated SQL Query</span>
                        </div>
                        <div className="sql-block-actions">
                          <button
                            className="btn-sql-action"
                            onClick={() => handleCopySQL(msg.sql_query, msg.id)}
                            title="Copy SQL"
                          >
                            {copiedQueryId === msg.id ? (
                              <>
                                <Check size={12} className="text-success" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            className="btn-sql-action btn-open-workbench"
                            onClick={() => handleOpenInWorkbench(msg.sql_query)}
                            title="Open in SQL Workbench"
                          >
                            <Terminal size={12} />
                            <span>Open in Studio</span>
                          </button>
                        </div>
                      </div>
                      <pre className="sql-code-pre">
                        <code>{msg.sql_query}</code>
                      </pre>
                    </div>
                  )}

                  {/* Data Result Preview Table (if present) */}
                  {msg.data && msg.data.length > 0 && (
                    <div className="chat-data-result-block">
                      <div className="data-result-header">
                        <div className="data-meta-strip">
                          <TableIcon size={14} />
                          <span className="font-bold">
                            Query Results ({msg.row_count} records returned in {msg.execution_time_ms} ms)
                          </span>
                        </div>
                        <button
                          className="btn-export-chat-csv"
                          onClick={() => handleExportCSV(msg.data, msg.columns, "copilot_results")}
                          title="Export results to CSV"
                        >
                          <Download size={12} />
                          <span>Export CSV</span>
                        </button>
                      </div>

                      <div className="chat-table-scroll">
                        <table className="chat-result-table">
                          <thead>
                            <tr>
                              {msg.columns.map((col) => (
                                <th key={col}>{col.replace(/_/g, " ").toUpperCase()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.data.slice(0, 10).map((row, idx) => (
                              <tr key={idx}>
                                {msg.columns.map((col) => (
                                  <td key={col} className={typeof row[col] === "number" ? "font-mono" : ""}>
                                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : "—"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {msg.data.length > 10 && (
                        <div className="chat-table-more-footer">
                          <span>Showing first 10 of {msg.data.length} records. Open in SQL Studio for full pagination.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {aiCopilotMutation.isPending && (
              <div className="chat-message-row assistant">
                <div className="chat-bubble ai-loading-bubble">
                  <Spinner size="sm" />
                  <span>Translating question to SQL and querying academic database...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="chat-input-bar">
            <input
              type="text"
              className="chat-text-input"
              placeholder="Ask any question about students, GPAs, programs, admissions, or veterans..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              disabled={aiCopilotMutation.isPending}
            />
            <button
              className="btn-send-chat"
              onClick={() => handleSendPrompt()}
              disabled={!chatInput.trim() || aiCopilotMutation.isPending}
            >
              <Send size={15} />
              <span>Ask Co-Pilot</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Interactive SQL Studio & Workbench
          ========================================================================= */}
      {activeTab === "workbench" && (
        <div className="tab-pane-content workbench-layout-container">
          {/* 1. Top: SQL Query Editor Card (Full Width) */}
          <div className="sql-editor-card">
            <div className="editor-card-toolbar">
              <div className="toolbar-left">
                <Terminal size={16} className="text-primary" />
                <span className="editor-label">SQL Query Editor</span>
                <StatusPill variant="neutral font-mono">PostgreSQL</StatusPill>
              </div>

              <div className="toolbar-right">
                {/* Snippets Dropdown */}
                <select
                  className="select-snippet"
                  onChange={(e) => {
                    if (e.target.value) setSqlEditorCode(e.target.value);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Load Pre-Built Snippet...
                  </option>
                  {sqlSnippets.map((s) => (
                    <option key={s.title} value={s.sql}>
                      {s.title}
                    </option>
                  ))}
                </select>

                <button
                  className="btn-toolbar-icon"
                  onClick={() => setSqlEditorCode("")}
                  title="Clear editor"
                >
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Textarea Code Editor */}
            <div className="editor-textarea-wrapper">
              <textarea
                className="sql-code-textarea font-mono"
                value={sqlEditorCode}
                onChange={(e) => setSqlEditorCode(e.target.value)}
                placeholder="Enter custom SELECT query..."
                rows={9}
                spellCheck={false}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleExecuteWorkbenchSQL();
                  }
                }}
              />
            </div>

            {/* Action Bar Below Editor */}
            <div className="editor-action-footer">
              <div className="editor-hints">
                <span>Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to execute. Only read-only <kbd>SELECT</kbd> queries are permitted.</span>
              </div>

              <div className="editor-execute-actions">
                <button
                  className="btn-run-query"
                  onClick={handleExecuteWorkbenchSQL}
                  disabled={executeSqlMutation.isPending || !sqlEditorCode.trim()}
                >
                  {executeSqlMutation.isPending ? (
                    <>
                      <Spinner size="sm" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>Run Query</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Middle: Execution Status / Results Card (Full Width) */}
          <div className="sql-results-card">
            <div className="results-card-header">
              <div className="results-meta-left">
                <TableIcon size={16} />
                <span className="results-card-title">Query Results</span>
                {workbenchResult && workbenchResult.success && (
                  <span className="execution-time-badge font-mono">
                    {workbenchResult.row_count} rows in {workbenchResult.execution_time_ms} ms
                  </span>
                )}
              </div>

              {workbenchResult && workbenchResult.success && workbenchResult.data.length > 0 && (
                <div className="results-export-actions">
                  <button
                    className="btn-export-result"
                    onClick={() =>
                      handleExportCSV(
                        workbenchResult.data,
                        workbenchResult.columns,
                        "sql_studio_results"
                      )
                    }
                    title="Export to CSV"
                  >
                    <Download size={13} />
                    <span>CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Results Table Area */}
            <div className="results-table-container">
              {!workbenchResult && (
                <div className="workbench-empty-state">
                  <Terminal size={36} className="empty-icon" />
                  <h4>Ready for Execution</h4>
                  <p>Enter your SQL statement above or select a pre-built snippet to execute against the database.</p>
                </div>
              )}

              {workbenchResult && !workbenchResult.success && (
                <div className="workbench-error-state">
                  <AlertCircle size={24} className="text-danger" />
                  <div>
                    <h4>SQL Execution Error</h4>
                    <p className="font-mono">{workbenchResult.error}</p>
                  </div>
                </div>
              )}

              {workbenchResult && workbenchResult.success && workbenchResult.data.length === 0 && (
                <div className="workbench-empty-state">
                  <Check size={32} className="text-success" />
                  <h4>Query Executed Successfully</h4>
                  <p>0 records matched your criteria.</p>
                </div>
              )}

              {workbenchResult && workbenchResult.success && workbenchResult.data.length > 0 && (
                <div className="table-responsive-box">
                  <table className="workbench-data-table">
                    <thead>
                      <tr>
                        {workbenchResult.columns.map((col) => (
                          <th key={col}>{col.toUpperCase()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workbenchResult.data.map((row, idx) => (
                        <tr key={idx}>
                          {workbenchResult.columns.map((col) => (
                            <td key={col} className={typeof row[col] === "number" ? "font-mono" : ""}>
                              {row[col] !== null && row[col] !== undefined ? String(row[col]) : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 3. Bottom: Academic Schema & Data Dictionary Browser (Full Width, Tabbed by Table) */}
          <div className="schema-browser-card">
            <div className="schema-browser-header">
              <div className="schema-header-left">
                <Database size={18} className="text-primary" />
                <div className="schema-title-wrap">
                  <h3>Academic Data Dictionary & Schema Explorer</h3>
                  <p>Select a database table below to view column definitions, data types, keys, and quick SQL insertion tools.</p>
                </div>
              </div>
              <div className="schema-header-right">
                <StatusPill variant="neutral font-mono">
                  {schemaTables.length} Accessible Tables
                </StatusPill>
              </div>
            </div>

            {/* Horizontal Table Tabs Strip */}
            <div className="schema-table-tabs-nav">
              {schemaTables.map((table) => {
                const isActive = (activeTable?.table_name === table.table_name);
                return (
                  <button
                    key={table.table_name}
                    type="button"
                    className={`schema-tab-btn ${isActive ? "active-schema-tab" : ""}`}
                    onClick={() => {
                      setSelectedTableTab(table.table_name);
                      setColumnSearch("");
                    }}
                  >
                    <TableIcon size={14} />
                    <span className="schema-tab-name font-mono">{table.table_name}</span>
                    <span className="schema-tab-col-count font-mono">{table.columns.length}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Table Details Panel */}
            {activeTable && (
              <div className="schema-table-panel">
                {/* Active Table Header Toolbar */}
                <div className="table-panel-top-bar">
                  <div className="table-info-summary">
                    <div className="table-title-pill font-mono">
                      <TableIcon size={13} />
                      <span>public.{activeTable.table_name}</span>
                    </div>
                    <span className="table-desc-text">{activeTable.description}</span>
                  </div>

                  <div className="table-panel-actions">
                    <div className="schema-col-search-box">
                      <Search size={13} className="search-icon" />
                      <input
                        type="text"
                        placeholder={`Search ${activeTable.table_name} columns...`}
                        value={columnSearch}
                        onChange={(e) => setColumnSearch(e.target.value)}
                        className="schema-col-search-input"
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-schema-quick-action"
                      onClick={() => handleInsertText(activeTable.table_name)}
                      title={`Insert table "${activeTable.table_name}" into SQL editor`}
                    >
                      <span>+ Insert Name</span>
                    </button>

                    <button
                      type="button"
                      className="btn-schema-quick-action btn-schema-snippet"
                      onClick={() => {
                        setSqlEditorCode(`-- Query ${activeTable.table_name}\nSELECT *\nFROM ${activeTable.table_name}\nLIMIT 25;`);
                        // showToastSuccess(`Loaded SELECT * query for ${activeTable.table_name}`);
                      }}
                      title={`Load SELECT * FROM ${activeTable.table_name} into SQL editor`}
                    >
                      <Code2 size={13} />
                      <span>SELECT * Snippet</span>
                    </button>
                  </div>
                </div>

                {/* Data Dictionary Columns Table (Full Width) */}
                <div className="schema-dict-table-container">
                  <table className="schema-dict-table">
                    <thead>
                      <tr>
                        <th style={{ width: "24%" }}>Column Name</th>
                        <th style={{ width: "20%" }}>Data Type</th>
                        <th style={{ width: "44%" }}>Description & Purpose</th>
                        <th style={{ width: "12%" }} className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredColumns.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="schema-dict-empty">
                            No columns matching "{columnSearch}"
                          </td>
                        </tr>
                      ) : (
                        filteredColumns.map((col) => {
                          const isPK = col.type.includes("PK");
                          const isFK = col.type.includes("FK");
                          const isUnique = col.type.includes("Unique");
                          return (
                            <tr key={col.name} className="schema-dict-row">
                              <td>
                                <div className="col-name-group font-mono">
                                  <span className="col-name-label">{col.name}</span>
                                  {isPK && <span className="key-badge pk font-mono">PK</span>}
                                  {isFK && <span className="key-badge fk font-mono">FK</span>}
                                  {isUnique && <span className="key-badge unq font-mono">UNIQUE</span>}
                                </div>
                              </td>
                              <td>
                                <span className={`datatype-pill font-mono ${isPK ? "is-pk" : isFK ? "is-fk" : ""}`}>
                                  {col.type}
                                </span>
                              </td>
                              <td className="col-description-text">
                                {col.description || "—"}
                              </td>
                              <td className="text-right">
                                <button
                                  type="button"
                                  className="btn-insert-col-action font-mono"
                                  onClick={() => handleInsertText(col.name)}
                                  title={`Insert column "${col.name}" into SQL editor`}
                                >
                                  + Insert
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
