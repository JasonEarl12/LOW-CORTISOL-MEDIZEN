import { useEffect, useMemo, useState } from "react";
import { getPatientDashboardData, cancelAppointment, markReminderDone, markNotificationRead, registerEvent } from "../api";
import Toast from "./Toast";
import "./PatientDashboard-new.css";

const MENU_ITEMS = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "appointments", label: "My Appointments", icon: "📅" },
  { key: "notifications", label: "Notifications", icon: "🔔" },
  { key: "reminders", label: "Reminders", icon: "⏰" },
  { key: "events", label: "Events", icon: "🎫" },
  { key: "profile", label: "Profile", icon: "👤" }
];

function formatDate(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString([], { month: "short", day: "2-digit" });
}

function formatTime(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateTime(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getStatusColor(status) {
  const s = String(status || "").toUpperCase();
  if (s === "CONFIRMED" || s === "COMPLETED") return "#10b981";
  if (s === "PENDING") return "#f59e0b";
  if (s === "URGENT" || s === "CANCELLED") return "#ef4444";
  return "#3b82f6";
}

function PatientDashboard({ currentUser, onLogout }) {
  const [dashboard, setDashboard] = useState({
    appointments: [],
    reminders: [],
    notifications: [],
    activity: [],
    events: [],
    profile: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [toast, setToast] = useState(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPatientDashboardData(currentUser);
        if (mounted) setDashboard(data || {});
      } catch (err) {
        if (mounted) setToast({ message: "Failed to load dashboard data", type: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const timer = window.setInterval(load, 30000); // Refresh every 30s
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [currentUser]);

  // Get next appointment
  const nextAppointment = useMemo(() => {
    const apps = Array.isArray(dashboard.appointments) ? dashboard.appointments : [];
    return apps.find(a => String(a.status).toUpperCase() !== "CANCELLED") || null;
  }, [dashboard.appointments]);

  // Get stats
  const stats = useMemo(() => ({
    reminders: Array.isArray(dashboard.reminders) ? dashboard.reminders.filter(r => !r.completed).length : 0,
    notifications: Array.isArray(dashboard.notifications) ? dashboard.notifications.filter(n => !n.read).length : 0,
    events: Array.isArray(dashboard.events) ? dashboard.events.filter(e => e.registered).length : 0
  }), [dashboard]);

  const upcomingAppointments = useMemo(() => {
    const apps = Array.isArray(dashboard.appointments) ? dashboard.appointments : [];
    return apps.filter(a => String(a.status).toUpperCase() !== "CANCELLED").slice(0, 5);
  }, [dashboard.appointments]);

  const reminders = useMemo(() => {
    return Array.isArray(dashboard.reminders) ? dashboard.reminders.slice(0, 3) : [];
  }, [dashboard.reminders]);

  const activity = useMemo(() => {
    const acts = Array.isArray(dashboard.activity) ? dashboard.activity : [];
    return showAllActivity ? acts : acts.slice(0, 4);
  }, [dashboard.activity, showAllActivity]);

  const events = useMemo(() => {
    return Array.isArray(dashboard.events) ? dashboard.events.slice(0, 2) : [];
  }, [dashboard.events]);

  async function handleCancelAppointment(appointmentId) {
    try {
      const data = await cancelAppointment(currentUser, appointmentId);
      setDashboard(data);
      setToast({ message: "Appointment cancelled", type: "info" });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  async function handleReminderDone(reminderId) {
    try {
      const data = await markReminderDone(currentUser, reminderId);
      setDashboard(data);
      setToast({ message: "Reminder marked as done", type: "success" });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  async function handleNotificationRead(notificationId) {
    try {
      const data = await markNotificationRead(currentUser, notificationId);
      setDashboard(data);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  async function handleRegisterEvent(eventId) {
    try {
      const data = await registerEvent(currentUser, eventId);
      setDashboard(data);
      setToast({ message: "Event registered successfully", type: "success" });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  }

  return (
    <div className="patient-dashboard">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Sidebar */}
      <aside className="patient-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">✚</span>
          <div>
            <strong>Medizen</strong>
            <small>Clinical Sanctuary</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              className={`nav-item ${activeSection === item.key ? "active" : ""}`}
              onClick={() => setActiveSection(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={onLogout}>Logout</button>
      </aside>

      {/* Main Content */}
      <main className="patient-main">
        {/* Header */}
        <header className="patient-header">
          <div className="header-left">
            <h1>Hello, {currentUser?.fullName || currentUser?.username}</h1>
            <p className="header-date">{new Date().toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="header-right">
            <button className="header-notifications">🔔</button>
            <div className="header-user">
              <img src={currentUser?.avatar_url} alt="Avatar" className="user-avatar" onError={(e) => e.target.style.display = "none"} />
              <div className="user-info">
                <strong>{currentUser?.fullName || currentUser?.username}</strong>
                <small>PATIENT • {currentUser?.patient_id ? `${String(currentUser.patient_id).padStart(2, "0")}-2025` : "01-2025"}</small>
              </div>
            </div>
          </div>
        </header>

        {/* Content Sections */}
        {activeSection === "home" && (
          <div className="patient-content">
            {/* Next Appointment */}
            {nextAppointment && (
              <section className="next-appointment-card">
                <div className="next-up-label">NEXT UP</div>
                <div className="next-up-content">
                  <div className="date-badge">
                    <div className="date-month">{formatDate(nextAppointment.dateTime).split(" ")[0]}</div>
                    <div className="date-day">{formatDate(nextAppointment.dateTime).split(" ")[1]}</div>
                  </div>
                  <div className="appointment-details">
                    <div className="time">{formatTime(nextAppointment.dateTime)}</div>
                    <div className="doctor">
                      📍 {nextAppointment.doctor}{nextAppointment.status && ` • ${nextAppointment.status}`}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Stats Cards */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon">⏰</div>
                <div className="stat-content">
                  <div className="stat-label">ACTIVE REMINDERS</div>
                  <div className="stat-value">{stats.reminders}</div>
                  <div className="stat-meta">Pending</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📧</div>
                <div className="stat-content">
                  <div className="stat-label">UNREAD MAIL</div>
                  <div className="stat-value">{stats.notifications}</div>
                  <div className="stat-meta">New Alerts</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎟️</div>
                <div className="stat-content">
                  <div className="stat-label">REGISTERED EVENTS</div>
                  <div className="stat-value">{stats.events}</div>
                  <div className="stat-meta">Upcoming</div>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Left Column */}
              <div className="left-column">
                {/* Upcoming Appointments */}
                <section className="section-card">
                  <div className="section-header">
                    <h2>Upcoming Appointments</h2>
                    <a href="#" className="see-all">See all schedules →</a>
                  </div>
                  <div className="appointments-list">
                    {upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map(apt => (
                        <div key={apt.id} className="appointment-item">
                          <div className="apt-date-badge" style={{ borderColor: getStatusColor(apt.status) }}>
                            <span className="apt-month">{formatDate(apt.dateTime).split(" ")[0]}</span>
                            <span className="apt-day">{formatDate(apt.dateTime).split(" ")[1]}</span>
                          </div>
                          <div className="apt-details">
                            <div className="apt-title">{apt.title || "Appointment"}</div>
                            <div className="apt-time">{apt.time} • {apt.duration || "Standard"}</div>
                          </div>
                          <button className="apt-status-btn" style={{ backgroundColor: getStatusColor(apt.status) }}>
                            {apt.status}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">No upcoming appointments</p>
                    )}
                  </div>
                </section>

                {/* Health Reminders */}
                <section className="section-card reminders-section">
                  <h2>Health Reminders</h2>
                  <div className="reminders-grid">
                    {reminders.length > 0 ? (
                      reminders.map(reminder => (
                        <div key={reminder.id} className={`reminder-card ${reminder.status?.toLowerCase()}`}>
                          <div className="reminder-icon">!</div>
                          <div className="reminder-content">
                            <div className="reminder-status">{reminder.status || "REMINDER"}</div>
                            <div className="reminder-title">{reminder.title}</div>
                            <div className="reminder-desc">{reminder.description}</div>
                          </div>
                          <button 
                            className="reminder-done-btn" 
                            onClick={() => handleReminderDone(reminder.id)}
                          >
                            Mark as Done
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">No active reminders</p>
                    )}
                  </div>
                </section>

                {/* Events */}
                {events.length > 0 && (
                  <section className="section-card events-section">
                    <h2>Upcoming Events</h2>
                    {events.map(event => (
                      <div key={event.id} className="event-card">
                        <div className="event-badge">📅 {event.status?.toUpperCase()}</div>
                        <h3>{event.title}</h3>
                        <p className="event-desc">{event.description}</p>
                        <div className="event-info">
                          <span>📍 {event.location}</span>
                          <span>📅 {formatDate(event.date)}</span>
                        </div>
                        {!event.registered && (
                          <button 
                            className="event-register-btn" 
                            onClick={() => handleRegisterEvent(event.id)}
                          >
                            Register Now
                          </button>
                        )}
                        {event.registered && (
                          <div className="event-registered">✓ Registered</div>
                        )}
                      </div>
                    ))}
                  </section>
                )}
              </div>

              {/* Right Column */}
              <div className="right-column">
                {/* Recent Activity */}
                <section className="section-card activity-section">
                  <h2>Recent Activity</h2>
                  <div className="activity-list">
                    {activity.length > 0 ? (
                      activity.map((act, idx) => (
                        <div key={idx} className="activity-item">
                          <div className={`activity-type ${act.type?.toLowerCase()}`}>📍</div>
                          <div className="activity-content">
                            <div className="activity-title">{act.title}</div>
                            <div className="activity-desc">{act.description}</div>
                            <div className="activity-time">{formatDateTime(act.timestamp)}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">No recent activity</p>
                    )}
                  </div>
                  {Array.isArray(dashboard.activity) && dashboard.activity.length > 4 && (
                    <button className="load-more-btn" onClick={() => setShowAllActivity(!showAllActivity)}>
                      {showAllActivity ? "Show less" : "Load more activity"} →
                    </button>
                  )}
                </section>

                {/* Support Widget */}
                <section className="support-widget">
                  <h3>Need Help?</h3>
                  <p className="support-desc">24/7 CLINICAL SUPPORT</p>
                  <p className="support-text">Connect with our patient assistance team for immediate help with booking or medical advice.</p>
                  <button className="support-btn">Start Live Chat</button>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Other sections - placeholders */}
        {activeSection !== "home" && (
          <div className="patient-content">
            <div className="section-placeholder">
              <p>Section: {MENU_ITEMS.find(m => m.key === activeSection)?.label}</p>
              <p>Coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PatientDashboard;
