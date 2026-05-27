import { useEffect, useMemo, useState } from "react";
import {
  cancelAppointment,
  getPatientDashboardData,
  markNotificationRead,
  markReminderDone,
  registerEvent
} from "../api";
import Toast from "./Toast";
import "./PatientDashboard.css";

const MENU_ITEMS = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "appointments", label: "My Appointments", icon: "📅" },
  { key: "notifications", label: "Notifications", icon: "🔔" },
  { key: "reminders", label: "Reminders", icon: "⏱" },
  { key: "events", label: "Events", icon: "🎟" },
  { key: "profile", label: "Profile", icon: "👤" }
];

function formatDateTime(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function dayChip(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { month: "--", day: "--" };
  return {
    month: date.toLocaleDateString([], { month: "short" }).toUpperCase(),
    day: date.toLocaleDateString([], { day: "2-digit" })
  };
}

function appointmentClass(status) {
  const text = String(status || "").toUpperCase();
  if (text === "URGENT" || text === "CANCELLED") return "pd-pill pd-pill-red";
  if (text === "PENDING") return "pd-pill pd-pill-yellow";
  if (text === "CONFIRMED") return "pd-pill pd-pill-green";
  return "pd-pill pd-pill-blue";
}

function reminderClass(status) {
  const text = String(status || "").toUpperCase();
  if (text === "URGENT") return "pd-reminder pd-reminder-red";
  if (text === "UPCOMING") return "pd-reminder pd-reminder-yellow";
  if (text === "COMPLETED") return "pd-reminder pd-reminder-green";
  return "pd-reminder pd-reminder-blue";
}

function tagClass(tag) {
  const text = String(tag || "").toUpperCase();
  if (text === "SUCCESS") return "pd-tag pd-tag-green";
  if (text === "WARNING" || text === "REMINDER") return "pd-tag pd-tag-yellow";
  if (text === "URGENT") return "pd-tag pd-tag-red";
  return "pd-tag pd-tag-blue";
}

function buildCards(data) {
  const appointments = Array.isArray(data?.appointments) ? data.appointments : [];
  const reminders = Array.isArray(data?.reminders) ? data.reminders : [];
  const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
  const events = Array.isArray(data?.events) ? data.events : [];

  const upcomingAppointments = appointments.filter((a) => String(a.status).toUpperCase() !== "CANCELLED");
  const activeReminders = reminders.filter((r) => !r.completed && String(r.status).toUpperCase() !== "COMPLETED");
  const unread = notifications.filter((n) => !n.read);
  const registered = events.filter((e) => e.registered);

  const nextAppointment = upcomingAppointments
    .slice()
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

  return {
    nextAppointment,
    cards: [
      {
        key: "appointments",
        title: "Next Appointment",
        value: nextAppointment ? formatDateTime(nextAppointment.dateTime) : "No schedule",
        subtitle: nextAppointment ? nextAppointment.doctor : "Book your next visit",
        tone: "teal"
      },
      {
        key: "reminders",
        title: "Active Reminders",
        value: String(activeReminders.length),
        subtitle: `${activeReminders.filter((r) => String(r.status).toUpperCase() === "PENDING").length} pending`,
        tone: "yellow"
      },
      {
        key: "notifications",
        title: "Unread Mail",
        value: String(unread.length),
        subtitle: `${notifications.length} total alerts`,
        tone: "blue"
      },
      {
        key: "events",
        title: "Registered Events",
        value: String(registered.length),
        subtitle: registered.length > 0 ? `Next: ${registered[0].title}` : "No event yet",
        tone: "green"
      }
    ]
  };
}

export default function PatientDashboard({ currentUser, onLogout }) {
  const [activeSection, setActiveSection] = useState("home");
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    appointments: [],
    reminders: [],
    notifications: [],
    activity: [],
    events: [],
    profile: {}
  });
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [notifQuery, setNotifQuery] = useState("");
  const [showAllActivity, setShowAllActivity] = useState(false);

  const { cards, nextAppointment } = useMemo(() => buildCards(dashboard), [dashboard]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (document.visibilityState !== "visible") {
        return;
      }
      setLoading(true);
      try {
        const data = await getPatientDashboardData(currentUser);
        if (mounted) {
          setDashboard(data || {});
        }
      } catch {
        if (mounted) {
          setToast({ message: "Unable to load patient dashboard data.", type: "error" });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const timer = window.setInterval(load, 30000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [currentUser]);

  const filteredNotifications = useMemo(() => {
    const source = Array.isArray(dashboard.notifications) ? dashboard.notifications : [];
    const query = notifQuery.trim().toLowerCase();
    if (!query) return source;
    return source.filter((n) => `${n.title} ${n.message}`.toLowerCase().includes(query));
  }, [dashboard.notifications, notifQuery]);

  const visibleActivity = useMemo(() => {
    const source = Array.isArray(dashboard.activity) ? dashboard.activity : [];
    return showAllActivity ? source : source.slice(0, 3);
  }, [dashboard.activity, showAllActivity]);

  async function handleReminderDone(reminderId) {
    const data = await markReminderDone(currentUser, reminderId);
    setDashboard(data);
    setToast({ message: "Reminder marked as done.", type: "success" });
  }

  async function handleMarkNotificationRead(notificationId) {
    const data = await markNotificationRead(currentUser, notificationId);
    setDashboard(data);
    setToast({ message: "Notification marked as read.", type: "success" });
  }

  async function handleRegisterEvent(eventId) {
    const data = await registerEvent(currentUser, eventId);
    setDashboard(data);
    setToast({ message: "Event registration successful.", type: "success" });
  }

  async function handleCancelAppointment(appointmentId) {
    const data = await cancelAppointment(currentUser, appointmentId);
    setDashboard(data);
    setToast({ message: "Appointment cancelled.", type: "info" });
  }

  function sectionButton(item) {
    return (
      <button
        key={item.key}
        className={activeSection === item.key ? "pd-nav-item active" : "pd-nav-item"}
        onClick={() => setActiveSection(item.key)}
        type="button"
      >
        <span className="pd-icon">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <div className="pd-shell">
      <aside className="pd-sidebar">
        <div className="pd-brand">
          <div className="pd-logo">✚</div>
          <div>
            <strong>Medizen</strong>
            <small>Clinical Sanctuary</small>
          </div>
        </div>

        <nav className="pd-nav">{MENU_ITEMS.map(sectionButton)}</nav>

        <button
          className="pd-book-btn"
          type="button"
          onClick={() => {
            setActiveSection("appointments");
            setToast({ message: "Opening appointments panel.", type: "info" });
          }}
        >
          Book Appointment
        </button>

        <button type="button" className="pd-sidebar-logout" onClick={onLogout}>Logout</button>
      </aside>

      <main className="pd-main">
        <header className="pd-topbar">
          <div>
            <h1>Hello, {currentUser?.fullName || currentUser?.username}</h1>
            <p>{new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="pd-top-actions">
            <button type="button" className="pd-bell" onClick={() => setActiveSection("notifications")}>🔔</button>
            <button type="button" className="pd-logout" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <section className="pd-cards">
          {cards.map((card) => (
            <article key={card.key} className={`pd-card pd-card-${card.tone}`}>
              <p className="pd-card-title">{card.title}</p>
              <h3>{loading ? "..." : card.value}</h3>
              <small>{card.subtitle}</small>
            </article>
          ))}
        </section>

        <section className="pd-content-grid">
          <div className="pd-left-col">
            {(activeSection === "home" || activeSection === "appointments") && (
              <section className="pd-panel">
                <div className="pd-panel-head">
                  <h2>Upcoming Appointments</h2>
                  <button type="button" onClick={() => setActiveSection("appointments")}>See all schedules</button>
                </div>
                <div className="pd-list">
                  {(dashboard.appointments || []).map((item) => {
                    const chip = dayChip(item.dateTime);
                    return (
                      <article key={item.id} className="pd-appointment-card">
                        <div className="pd-day-chip">
                          <small>{chip.month}</small>
                          <strong>{chip.day}</strong>
                        </div>
                        <div className="pd-appointment-main">
                          <h4>{item.title}</h4>
                          <p>{item.notes} • {item.doctor} • {formatDateTime(item.dateTime)}</p>
                        </div>
                        <span className={appointmentClass(item.status)}>{String(item.status || "").toLowerCase()}</span>
                        <div className="pd-row-actions">
                          <button type="button" onClick={() => setToast({ message: `${item.title}: ${item.location}`, type: "info" })}>View Details</button>
                          {String(item.status).toUpperCase() !== "CANCELLED" && (
                            <button type="button" className="danger" onClick={() => handleCancelAppointment(item.id)}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {(activeSection === "home" || activeSection === "reminders") && (
              <section className="pd-panel">
                <div className="pd-panel-head">
                  <h2>Health Reminders</h2>
                </div>
                <div className="pd-reminder-grid">
                  {(dashboard.reminders || []).map((item) => (
                    <article key={item.id} className={reminderClass(item.status)}>
                      <div className="pd-reminder-top">
                        <h4>{item.title}</h4>
                        <span>{String(item.status || "").replace("_", " ")}</span>
                      </div>
                      <p>{item.detail}</p>
                      <small>Due {formatDateTime(item.dueAt)}</small>
                      <div className="pd-row-actions">
                        <button type="button" onClick={() => setToast({ message: item.detail, type: "info" })}>View Details</button>
                        {!item.completed && (
                          <button type="button" onClick={() => handleReminderDone(item.id)}>Mark as Done</button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {(activeSection === "home" || activeSection === "events") && (
              <section className="pd-event-banner">
                <div>
                  <span className="pd-upcoming-badge">Upcoming Event</span>
                  <h2>{dashboard.events?.[0]?.title || "Community Health Event"}</h2>
                  <p>{dashboard.events?.[0]?.description || "Stay tuned for events curated by the admin team."}</p>
                  <p className="pd-event-meta">
                    {formatDateTime(dashboard.events?.[0]?.dateTime)} • {dashboard.events?.[0]?.location || "Main Hall"}
                  </p>
                  <div className="pd-row-actions">
                    <button type="button" onClick={() => handleRegisterEvent(dashboard.events?.[0]?.id)}>
                      {dashboard.events?.[0]?.registered ? "Registered" : "Register Now"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setToast({ message: dashboard.events?.[0]?.description || "No details available.", type: "info" })}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "profile" && (
              <section className="pd-panel">
                <div className="pd-panel-head">
                  <h2>Profile</h2>
                </div>
                <div className="pd-profile-grid">
                  <div>
                    <label>Name</label>
                    <p>{currentUser?.fullName || currentUser?.username}</p>
                  </div>
                  <div>
                    <label>Email</label>
                    <p>{currentUser?.email || "-"}</p>
                  </div>
                  <div>
                    <label>Role</label>
                    <p>{currentUser?.role}</p>
                  </div>
                  <div>
                    <label>Next Appointment</label>
                    <p>{nextAppointment ? formatDateTime(nextAppointment.dateTime) : "None"}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="pd-right-col">
            {(activeSection === "home" || activeSection === "notifications") && (
              <section className="pd-panel pd-panel-tight">
                <div className="pd-panel-head">
                  <h2>Notifications</h2>
                </div>
                <input
                  className="pd-search"
                  type="text"
                  value={notifQuery}
                  onChange={(e) => setNotifQuery(e.target.value)}
                  placeholder="Search notifications"
                />
                <div className="pd-list compact">
                  {filteredNotifications.map((item) => (
                    <article key={item.id} className={item.read ? "pd-notif" : "pd-notif unread"}>
                      <h4>{item.title}</h4>
                      <p>{item.message}</p>
                      <small>{formatDateTime(item.createdAt)}</small>
                      {!item.read && (
                        <button type="button" onClick={() => handleMarkNotificationRead(item.id)}>
                          Mark as Read
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {(activeSection === "home" || activeSection === "notifications" || activeSection === "appointments" || activeSection === "events") && (
              <section className="pd-panel pd-panel-tight">
                <div className="pd-panel-head">
                  <h2>Recent Activity</h2>
                </div>
                <div className="pd-timeline">
                  {visibleActivity.map((item) => (
                    <article key={item.id} className="pd-timeline-item">
                      <div className="pd-dot" />
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                        <div className="pd-row-inline">
                          <span className={tagClass(item.tag)}>{item.tag}</span>
                          <small>{formatDateTime(item.createdAt)}</small>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <button type="button" className="pd-link-btn" onClick={() => setShowAllActivity((prev) => !prev)}>
                  {showAllActivity ? "Show less" : "Load more activity"}
                </button>
              </section>
            )}

            <section className="pd-support">
              <h4>Need Help?</h4>
              <p>Connect with patient support for booking or account concerns.</p>
              <button type="button" onClick={() => setToast({ message: "Support chat started.", type: "success" })}>Start Live Chat</button>
            </section>
          </div>
        </section>
      </main>

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
    </div>
  );
}
