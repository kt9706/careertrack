import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import "./App.css";

function App() {
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "careertrack-applications"
      );

      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [applicationDate, setApplicationDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Save applications
  useEffect(() => {
    localStorage.setItem(
      "careertrack-applications",
      JSON.stringify(applications)
    );
  }, [applications]);

  // Statistics
  const totalApplications = applications.length;

  const appliedCount = applications.filter(
    (app) => app.status === "Applied"
  ).length;

  const interviewCount = applications.filter(
    (app) => app.status === "Interview"
  ).length;

  const selectedCount = applications.filter(
    (app) => app.status === "Selected"
  ).length;

  const rejectedCount = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  // Add or update application
  function handleSubmit(e) {
    e.preventDefault();

    if (editingId) {
      setApplications((previous) =>
        previous.map((app) =>
          app.id === editingId
            ? {
              ...app,
              company,
              role,
              status,
              applicationDate,
              interviewDate,
              interviewTime,
              notes,
            }
            : app
        )
      );
    } else {
      const newApplication = {
        id: Date.now(),
        company,
        role,
        status,
        applicationDate,
        interviewDate,
        interviewTime,
        notes,
      };

      setApplications((previous) => [
        ...previous,
        newApplication,
      ]);
    }

    clearForm();
  }

  // Edit application
  function editApplication(app) {
    setCompany(app.company);
    setRole(app.role);
    setStatus(app.status);
    setApplicationDate(app.applicationDate || "");
    setInterviewDate(app.interviewDate || "");
    setInterviewTime(app.interviewTime || "");
    setNotes(app.notes || "");
    setEditingId(app.id);
    setShowForm(true);
  }

  // Delete application
  function deleteApplication(id) {
    setApplications((previous) =>
      previous.filter((app) => app.id !== id)
    );
  }

  // Clear form
  function clearForm() {
    setCompany("");
    setRole("");
    setStatus("Applied");
    setApplicationDate("");
    setInterviewDate("");
    setInterviewTime("");
    setNotes("");
    setEditingId(null);
    setShowForm(false);
  }

  // Search + filter
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      app.role
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" ||
      app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Upcoming interviews
  const upcomingInterviews = applications
    .filter(
      (app) =>
        app.status === "Interview" &&
        app.interviewDate
    )
    .sort((a, b) => {
      const dateA = new Date(
        `${a.interviewDate}T${a.interviewTime || "00:00"
        }`
      );

      const dateB = new Date(
        `${b.interviewDate}T${b.interviewTime || "00:00"
        }`
      );

      return dateA - dateB;
    });

  return (
    <BrowserRouter>
      <div className="app">

        {/* NAVBAR */}
        <header className="navbar">

          <NavLink
            to="/"
            className="logo-link"
          >
            <h2>CareerTrack</h2>
          </NavLink>

          <button
            onClick={() => {
              clearForm();
              setShowForm(true);
            }}
          >
            + Add Application
          </button>

        </header>

        <div className="layout">

          {/* SIDEBAR */}
          <aside className="sidebar">

            <h3>Menu</h3>

            <nav className="sidebar-nav">

              <NavLink
                to="/"
                className="nav-link"
              >
                📊 Dashboard
              </NavLink>

              <NavLink
                to="/applications"
                className="nav-link"
              >
                📋 Applications
              </NavLink>

              <NavLink
                to="/interviews"
                className="nav-link"
              >
                📅 Interviews
              </NavLink>

              <NavLink
                to="/settings"
                className="nav-link"
              >
                ⚙️ Settings
              </NavLink>

            </nav>

          </aside>

          {/* MAIN CONTENT */}
          <main className="main-content">

            <Routes>

              {/* DASHBOARD */}
              <Route
                path="/"
                element={
                  <Dashboard
                    applications={applications}
                    totalApplications={totalApplications}
                    appliedCount={appliedCount}
                    interviewCount={interviewCount}
                    selectedCount={selectedCount}
                    rejectedCount={rejectedCount}
                  />
                }
              />

              {/* APPLICATIONS */}
              <Route
                path="/applications"
                element={
                  <ApplicationsPage
                    applications={filteredApplications}
                    search={search}
                    setSearch={setSearch}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onEdit={editApplication}
                    onDelete={deleteApplication}
                  />
                }
              />

              {/* INTERVIEWS */}
              <Route
                path="/interviews"
                element={
                  <InterviewsPage
                    interviews={upcomingInterviews}
                    onEdit={editApplication}
                  />
                }
              />

              {/* SETTINGS */}
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    applications={applications}
                    setApplications={setApplications}
                  />
                }
              />

            </Routes>

            {/* FORM */}
            {showForm && (
              <div className="form-container">

                <h2>
                  {editingId
                    ? "Edit Application"
                    : "Add Application"}
                </h2>

                <form onSubmit={handleSubmit}>

                  <input
                    type="text"
                    placeholder="Company Name"
                    value={company}
                    onChange={(e) =>
                      setCompany(e.target.value)
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="Job Role"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value)
                    }
                    required
                  />

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                  >
                    <option value="Applied">
                      Applied
                    </option>

                    <option value="Interview">
                      Interview
                    </option>

                    <option value="Selected">
                      Selected
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>
                  </select>

                  <label>
                    Application Date
                  </label>

                  <input
                    type="date"
                    value={applicationDate}
                    onChange={(e) =>
                      setApplicationDate(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Interview Date
                  </label>

                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) =>
                      setInterviewDate(
                        e.target.value
                      )
                    }
                  />

                  <label>
                    Interview Time
                  </label>

                  <input
                    type="time"
                    value={interviewTime}
                    onChange={(e) =>
                      setInterviewTime(
                        e.target.value
                      )
                    }
                  />

                  <textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                    rows="4"
                  />

                  <div className="form-buttons">

                    <button type="submit">
                      {editingId
                        ? "Update Application"
                        : "Add Application"}
                    </button>

                    <button
                      type="button"
                      onClick={clearForm}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>
            )}

          </main>

        </div>

      </div>
    </BrowserRouter>
  );
}


/* =========================
   DASHBOARD
========================= */

function Dashboard({
  applications,
  totalApplications,
  appliedCount,
  interviewCount,
  selectedCount,
  rejectedCount,
}) {
  return (
    <>
      <h1>Welcome to CareerTrack 👋</h1>

      <p>
        Track your job and internship
        applications in one place.
      </p>

      <div className="stats">

        <div className="card">
          <h3>Total Applications</h3>
          <p>{totalApplications}</p>
        </div>

        <div className="card">
          <h3>Applied</h3>
          <p>{appliedCount}</p>
        </div>

        <div className="card">
          <h3>Interviews</h3>
          <p>{interviewCount}</p>
        </div>

        <div className="card">
          <h3>Selected</h3>
          <p>{selectedCount}</p>
        </div>

      </div>

      <div className="analytics">

        <h2>Application Analytics</h2>

        <AnalyticsBar
          label="Applied"
          count={appliedCount}
          total={totalApplications}
        />

        <AnalyticsBar
          label="Interviews"
          count={interviewCount}
          total={totalApplications}
        />

        <AnalyticsBar
          label="Selected"
          count={selectedCount}
          total={totalApplications}
        />

        <AnalyticsBar
          label="Rejected"
          count={rejectedCount}
          total={totalApplications}
        />

      </div>

      <div className="applications">

        <h2>Recent Applications</h2>

        <ApplicationList
          applications={applications
            .slice(-5)
            .reverse()}
        />

      </div>
    </>
  );
}


/* =========================
   ANALYTICS BAR
========================= */

function AnalyticsBar({
  label,
  count,
  total,
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round((count / total) * 100);

  return (
    <div className="analytics-row">

      <div className="analytics-label">
        <span>{label}</span>
        <strong>{percentage}%</strong>
      </div>

      <div className="progress-background">

        <div
          className="progress"
          style={{
            width: `${percentage}%`,
          }}
        ></div>

      </div>

    </div>
  );
}


/* =========================
   APPLICATIONS PAGE
========================= */

function ApplicationsPage({
  applications,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <h1>Applications 📋</h1>

      <p>
        Manage your job and internship
        applications.
      </p>

      <div className="applications">

        <div className="applications-header">

          <h2>All Applications</h2>

          <div className="filters">

            <input
              type="text"
              placeholder="Search company or role..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
            >
              <option value="All">All</option>
              <option value="Applied">
                Applied
              </option>
              <option value="Interview">
                Interview
              </option>
              <option value="Selected">
                Selected
              </option>
              <option value="Rejected">
                Rejected
              </option>
            </select>

          </div>

        </div>

        <ApplicationList
          applications={applications}
          onEdit={onEdit}
          onDelete={onDelete}
        />

      </div>
    </>
  );
}


/* =========================
   INTERVIEWS PAGE
========================= */

function InterviewsPage({
  interviews,
  onEdit,
}) {
  return (
    <>
      <h1>Interviews 📅</h1>

      <p>
        Keep track of your upcoming interviews.
      </p>

      <div className="interviews-section">

        <div className="section-title">

          <h2>Upcoming Interviews</h2>

          <span className="interview-count">
            {interviews.length}
          </span>

        </div>

        {interviews.length === 0 ? (

          <p className="empty-message">
            No upcoming interviews.
          </p>

        ) : (

          interviews.map((app) => (

            <div
              className="interview-card"
              key={app.id}
            >

              <div>
                <h3>{app.company}</h3>
                <p>{app.role}</p>
              </div>

              <div className="interview-details">

                <strong>
                  📅 {app.interviewDate}
                </strong>

                {app.interviewTime && (
                  <span>
                    🕐 {app.interviewTime}
                  </span>
                )}

                <button
                  className="edit-btn"
                  onClick={() =>
                    onEdit(app)
                  }
                >
                  Edit
                </button>

              </div>

            </div>

          ))

        )}

      </div>
    </>
  );
}


/* =========================
   SETTINGS PAGE
========================= */

function SettingsPage({
  applications,
  setApplications,
}) {
  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem(
        "careertrack-dark-mode"
      ) === "true"
    );

  function toggleDarkMode() {
    const newValue = !darkMode;

    setDarkMode(newValue);

    localStorage.setItem(
      "careertrack-dark-mode",
      newValue
    );
  }

  function clearAllApplications() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all applications?"
    );

    if (confirmed) {
      setApplications([]);

      localStorage.removeItem(
        "careertrack-applications"
      );
    }
  }

  return (
    <>
      <h1>Settings ⚙️</h1>

      <p>
        Manage your CareerTrack preferences.
      </p>

      <div className="settings-container">

        {/* Dark Mode */}
        <div className="settings-card">

          <div>
            <h3>Dark Mode</h3>

            <p>
              Switch between light and dark
              appearance.
            </p>
          </div>

          <button
            className="settings-btn"
            onClick={toggleDarkMode}
          >
            {darkMode
              ? "Turn Off"
              : "Turn On"}
          </button>

        </div>

        {/* Storage */}
        <div className="settings-card">

          <div>
            <h3>Saved Applications</h3>

            <p>
              Your applications are stored in
              your browser.
            </p>
          </div>

          <strong>
            {applications.length}
          </strong>

        </div>

        {/* Clear Data */}
        <div className="settings-card">

          <div>
            <h3>Clear All Applications</h3>

            <p>
              Permanently delete all saved
              application data.
            </p>
          </div>

          <button
            className="clear-data-btn"
            onClick={
              clearAllApplications
            }
          >
            Clear Data
          </button>

        </div>

      </div>
    </>
  );
}


/* =========================
   APPLICATION LIST
========================= */

function ApplicationList({
  applications,
  onEdit,
  onDelete,
}) {
  if (!applications ||
    applications.length === 0) {
    return (
      <p className="empty-message">
        No applications found.
      </p>
    );
  }

  return (
    <div className="applications-list">

      {applications.map((app) => (

        <div
          className="application-card"
          key={app.id}
        >

          <div className="application-info">

            <h3>{app.company}</h3>

            <p>{app.role}</p>

            {app.applicationDate && (
              <small>
                Applied on:{" "}
                {app.applicationDate}
              </small>
            )}

            {app.interviewDate && (
              <small>
                Interview:{" "}
                {app.interviewDate}

                {app.interviewTime &&
                  ` at ${app.interviewTime}`}
              </small>
            )}

            {app.notes && (
              <p className="application-notes">
                {app.notes}
              </p>
            )}

          </div>

          <div className="application-actions">

            <span
              className={`status ${app.status.toLowerCase()}`}
            >
              {app.status}
            </span>

            {onEdit && (
              <button
                className="edit-btn"
                onClick={() =>
                  onEdit(app)
                }
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                className="delete-btn"
                onClick={() =>
                  onDelete(app.id)
                }
              >
                Delete
              </button>
            )}

          </div>

        </div>

      ))}

    </div>
  );
}

export default App;