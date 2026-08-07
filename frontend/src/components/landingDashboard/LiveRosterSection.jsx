import { useState } from "react";
import { Search, Filter, ArrowUpDown, UserCheck, PhoneCall, CheckCircle2, Shield } from "lucide-react";
import "./LiveRosterSection.css";

const initialStudents = [
  {
    id: "uuid-001",
    name: "Eleanor Vance",
    email: "evance@columbia.edu",
    cohort: "Transfer",
    term: "Fall 2025",
    credits: 48,
    gpa: "3.72",
    status: "Action Needed",
    statusType: "warning",
    lastContact: "Yesterday (Email)",
  },
  {
    id: "uuid-002",
    name: "Marcus Chen",
    email: "mchen@columbia.edu",
    cohort: "Veteran",
    term: "Fall 2025",
    credits: 60,
    gpa: "3.88",
    status: "Enrolled",
    statusType: "success",
    lastContact: "3 days ago (Call)",
  },
  {
    id: "uuid-003",
    name: "Sarah Jenkins",
    email: "sjenkins@columbia.edu",
    cohort: "First-Gen",
    term: "Fall 2025",
    credits: 32,
    gpa: "3.65",
    status: "Admitted",
    statusType: "info",
    lastContact: "1 week ago (In-Person)",
  },
  {
    id: "uuid-004",
    name: "Alexander Wright",
    email: "awright@columbia.edu",
    cohort: "International",
    term: "Spring 2025",
    credits: 45,
    gpa: "3.91",
    status: "Enrolled",
    statusType: "success",
    lastContact: "2 days ago (Email)",
  },
  {
    id: "uuid-005",
    name: "Maya Patel",
    email: "mpatel@columbia.edu",
    cohort: "Transfer",
    term: "Fall 2025",
    credits: 54,
    gpa: "3.79",
    status: "Action Needed",
    statusType: "warning",
    lastContact: "Today (Audit Request)",
  },
];

export default function LiveRosterSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [activeModalStudent, setActiveModalStudent] = useState(null);

  const filteredStudents = initialStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCohort = selectedCohort === "All" || student.cohort === selectedCohort;
    const matchesStatus = selectedStatus === "All" || student.status === selectedStatus;
    return matchesSearch && matchesCohort && matchesStatus;
  });

  return (
    <section className="roster-section" id="roster-demo">
      <div className="roster-container">
        <div className="roster-header">
          <div className="section-kicker">Interactive Roster Demo</div>
          <h2>Live Student Roster & Interaction Workflow</h2>
          <p>
            Experience how academic advisors and admissions officers filter non-traditional student records, review credits, and log interactions in real time.
          </p>
        </div>

        {/* Roster Controls Card */}
        <div className="roster-card">
          <div className="card-controls">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <div className="filter-item">
                <Filter size={14} className="filter-icon" />
                <label>Cohort:</label>
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="select-input"
                >
                  <option value="All">All Cohorts</option>
                  <option value="Transfer">Transfer</option>
                  <option value="First-Gen">First-Gen</option>
                  <option value="Veteran">Veteran</option>
                  <option value="International">International</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="select-input"
                >
                  <option value="All">All Statuses</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Action Needed">Action Needed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Roster Data Table */}
          <div className="table-responsive">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>
                    <div className="th-cell">
                      <span>Student Name / Email</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th>Cohort</th>
                  <th>Term</th>
                  <th>Credits</th>
                  <th>GPA</th>
                  <th>Status</th>
                  <th>Last Interaction</th>
                  <th className="text-right">Advisor Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-cell">
                          <span className="student-title">{student.name}</span>
                          <span className="student-email">{student.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="status-pill status-pill-info">
                          {student.cohort}
                        </span>
                      </td>
                      <td className="font-mono">{student.term}</td>
                      <td className="font-mono">{student.credits} cr</td>
                      <td className="font-mono">{student.gpa}</td>
                      <td>
                        <span className={`status-pill status-pill-${student.statusType}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="text-muted">{student.lastContact}</td>
                      <td className="text-right">
                        <button
                          className="btn-table-action"
                          onClick={() => setActiveModalStudent(student)}
                        >
                          <UserCheck size={14} />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-records">
                      No matching student records found. Try adjusting filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Stats */}
          <div className="table-footer">
            <span>Showing <strong className="font-mono">{filteredStudents.length}</strong> of <strong className="font-mono">{initialStudents.length}</strong> loaded student records</span>
            <div className="footer-meta">
              <Shield size={13} />
              <span>Postgres Schema: <span className="font-mono">student_crm.students</span></span>
            </div>
          </div>
        </div>

        {/* Detail Modal Preview */}
        {activeModalStudent && (
          <div className="modal-backdrop" onClick={() => setActiveModalStudent(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>{activeModalStudent.name}</h3>
                  <span className="modal-email">{activeModalStudent.email}</span>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setActiveModalStudent(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-grid">
                  <div className="modal-field">
                    <label>Student Type:</label>
                    <span>{activeModalStudent.cohort}</span>
                  </div>
                  <div className="modal-field">
                    <label>Cumulative GPA:</label>
                    <span className="font-mono">{activeModalStudent.gpa}</span>
                  </div>
                  <div className="modal-field">
                    <label>Enrolled Credits:</label>
                    <span className="font-mono">{activeModalStudent.credits} Credits</span>
                  </div>
                  <div className="modal-field">
                    <label>Enrollment Term:</label>
                    <span>{activeModalStudent.term}</span>
                  </div>
                </div>

                <div className="modal-note-box">
                  <div className="note-title">
                    <PhoneCall size={14} />
                    <span>Recent Advising Interaction Note</span>
                  </div>
                  <p>
                    Advisor completed transcript credit evaluation. 48 transfer credits approved toward GS bachelor&apos;s degree requirements. Pending final departmental approval.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-modal-close"
                  onClick={() => setActiveModalStudent(null)}
                >
                  Close Preview
                </button>
                <div className="status-pill status-pill-success">
                  <CheckCircle2 size={13} />
                  <span>Record Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
