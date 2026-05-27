import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  API_BASE_URL,
  getDashboardMetrics,
  login,
  setStoredAuthHeader,
  toBasicAuthHeader
} from "./api";

const PatientsModule = lazy(() => import("./components/PatientsModule"));
const DoctorsModule = lazy(() => import("./components/DoctorsModule"));
const WardsModule = lazy(() => import("./components/WardsModule"));
const AppointmentsModule = lazy(() => import("./components/AppointmentsModule"));
const BillingModule = lazy(() => import("./components/BillingModule"));
const InventoryModule = lazy(() => import("./components/InventoryModule"));
const ReportsModule = lazy(() => import("./components/ReportsModule"));
const EventsModule = lazy(() => import("./components/EventsModule"));
const UsersModule = lazy(() => import("./components/UsersModule"));
const PatientDashboard = lazy(() => import("./components/PatientDashboard-new"));

const ROLE_MODULES = {
  ADMIN: ["Dashboard", "Patients", "Doctors", "Wards", "Appointments", "Billing", "Inventory", "Events", "Reports", "Admin"],
  DOCTOR: ["Dashboard", "Appointments", "Events"],
  NURSE: ["Dashboard", "Appointments", "Events"],
  PATIENT: ["Dashboard", "Appointments", "Events"],
  PUBLIC_USER: ["Dashboard", "Events"],
  RECEPTIONIST: ["Dashboard", "Patients", "Appointments", "Billing", "Events"]
};

const ROLE_LABELS = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  PATIENT: "Patient",
  PUBLIC_USER: "Public User",
  RECEPTIONIST: "Receptionist"
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("medizenUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [authHeader, setAuthHeader] = useState(() => localStorage.getItem("medizenAuthHeader") || "");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalPatients: 0,
    activeDoctors: 0,
    availableBeds: 0,
    todaysAppointments: 0
  });
  const [loadingCards, setLoadingCards] = useState(false);
  const [apiError, setApiError] = useState("");
  const dashboardMetricsCacheRef = useRef(new Map());

  const role = String(currentUser?.role || "").toUpperCase();
  const availableModules = useMemo(() => ROLE_MODULES[role] || ["Dashboard"], [role]);

  // Log role changes for debugging
  useEffect(() => {
    if (currentUser) {
      const rawRole = currentUser.role;
      const upperRole = String(rawRole || "").toUpperCase();
      console.log("=== ROLE DEBUG ===");
      console.log("Raw currentUser.role:", rawRole);
      console.log("Type of role:", typeof rawRole);
      console.log("Uppercased role:", upperRole);
      console.log("Role === 'PATIENT'?", upperRole === "PATIENT");
      console.log("Full user object:", currentUser);
      console.log("================");
    }
  }, [role, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (!availableModules.includes(activeModule)) {
      setActiveModule(availableModules[0]);
    }
  }, [currentUser, availableModules, activeModule]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const apiTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS || 8000);

    window.fetch = (input, init = {}) => {
      const url = typeof input === "string" ? input : input?.url || "";
      const isApiRequest = url.startsWith(API_BASE_URL);
      const isLoginEndpoint = url.endsWith("/auth/login");

      if (!authHeader || !isApiRequest || isLoginEndpoint) {
        return originalFetch(input, init);
      }

      const headers = new Headers(init.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", authHeader);
      }

      // Fail fast when backend is unreachable to avoid UI appearing frozen.
      if (init.signal) {
        return originalFetch(input, {
          ...init,
          headers
        });
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort("api-timeout"), apiTimeoutMs);

      return originalFetch(input, {
        ...init,
        headers,
        signal: controller.signal
      }).finally(() => {
        window.clearTimeout(timeoutId);
      });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [authHeader]);

  useEffect(() => {
    if (!currentUser) {
      dashboardMetricsCacheRef.current.clear();
      return;
    }

    const needsDashboardSummary = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"].includes(role);
    if (!needsDashboardSummary) {
      setLoadingCards(false);
      return;
    }

    const cachedMetrics = dashboardMetricsCacheRef.current.get(role);
    if (cachedMetrics) {
      setDashboardMetrics(cachedMetrics);
      setLoadingCards(false);
      return;
    }

    let mounted = true;

    async function loadCards() {
      try {
        setLoadingCards(true);
        const metrics = await getDashboardMetrics();
        if (mounted) {
          setDashboardMetrics(metrics);
          dashboardMetricsCacheRef.current.set(role, metrics);
        }
      } catch (error) {
        if (mounted) {
          setApiError(error.message);
        }
      } finally {
        if (mounted) {
          setLoadingCards(false);
        }
      }
    }

    loadCards();
    return () => {
      mounted = false;
    };
  }, [currentUser, role]);

  const dashboardCards = useMemo(() => {
    const cardsByRole = {
      ADMIN: [
        { label: "Total Patients", value: loadingCards ? "..." : String(dashboardMetrics.totalPatients) },
        { label: "Active Doctors", value: loadingCards ? "..." : String(dashboardMetrics.activeDoctors) },
        { label: "Available Beds", value: loadingCards ? "..." : String(dashboardMetrics.availableBeds) },
        { label: "Today Appointments", value: loadingCards ? "..." : String(dashboardMetrics.todaysAppointments) }
      ],
      DOCTOR: [
        { label: "Patients Today", value: loadingCards ? "..." : String(dashboardMetrics.totalPatients) },
        { label: "Critical Cases", value: loadingCards ? "..." : String(Math.max(1, Math.round(dashboardMetrics.totalPatients * 0.1))) },
        { label: "Appointments Today", value: loadingCards ? "..." : String(dashboardMetrics.todaysAppointments) },
        { label: "Pending Reviews", value: loadingCards ? "..." : String(Math.max(1, Math.round(dashboardMetrics.todaysAppointments * 0.25))) }
      ],
      NURSE: [
        { label: "Assigned Patients", value: loadingCards ? "..." : String(Math.max(1, Math.round(dashboardMetrics.totalPatients * 0.5))) },
        { label: "Ward Capacity", value: loadingCards ? "..." : String(dashboardMetrics.availableBeds) },
        { label: "Inventory Alerts", value: loadingCards ? "..." : String(Math.max(1, Math.round(dashboardMetrics.availableBeds * 0.05))) },
        { label: "Appointments Today", value: loadingCards ? "..." : String(dashboardMetrics.todaysAppointments) }
      ],
      PATIENT: [
        { label: "Next Appointment", value: loadingCards ? "..." : String(Math.max(1, dashboardMetrics.todaysAppointments)) },
        { label: "Care Team", value: loadingCards ? "..." : String(Math.max(1, dashboardMetrics.activeDoctors)) },
        { label: "Status Updates", value: loadingCards ? "..." : "Live" },
        { label: "Notifications", value: loadingCards ? "..." : "Active" }
      ],
      PUBLIC_USER: [
        { label: "Upcoming Events", value: "4" },
        { label: "Registered Events", value: "2" },
        { label: "Announcements", value: "3" },
        { label: "Health Tips", value: "12" }
      ],
      RECEPTIONIST: [
        { label: "Total Patients", value: loadingCards ? "..." : String(dashboardMetrics.totalPatients) },
        { label: "Today Appointments", value: loadingCards ? "..." : String(dashboardMetrics.todaysAppointments) },
        { label: "Open Billing", value: loadingCards ? "..." : String(Math.max(1, Math.round(dashboardMetrics.totalPatients * 0.2))) },
        { label: "Available Beds", value: loadingCards ? "..." : String(dashboardMetrics.availableBeds) }
      ]
    };

    return cardsByRole[role] || cardsByRole.RECEPTIONIST;
  }, [dashboardMetrics, loadingCards, role]);

  const moduleLoadingFallback = <p className="placeholder">Loading module...</p>;

  const renderModule = () => {
    if (!availableModules.includes(activeModule)) {
      return <p className="placeholder">Access denied for your role.</p>;
    }

    switch (activeModule) {
      case "Patients":
        return <PatientsModule currentUser={currentUser} />;
      case "Doctors":
        return <DoctorsModule />;
      case "Wards":
        return <WardsModule />;
      case "Appointments":
        return <AppointmentsModule />;
      case "Billing":
        return <BillingModule />;
      case "Inventory":
        return <InventoryModule />;
      case "Events":
        return <EventsModule />;
      case "Reports":
        return <ReportsModule />;
      case "Admin":
        return <UsersModule />;
      case "Dashboard":
        if (role === "PUBLIC_USER") {
          return <p className="placeholder">Welcome to Medizen public portal. You can view community events, announcements, and health tips here.</p>;
        }
        if (role === "PATIENT") {
          return <p className="placeholder">Welcome to your patient dashboard. Your appointments and care updates appear here.</p>;
        }
        return <p className="placeholder">Select a module from the sidebar to begin.</p>;
      default:
        return <p className="placeholder">Module not found</p>;
    }
  };

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    const username = loginForm.username.trim();
    const password = loginForm.password;
    if (!username || !password) {
      setLoginError("Username and password are required");
      return;
    }

    try {
      setLoginLoading(true);
      const user = await login(username, password);
      const nextAuthHeader = toBasicAuthHeader(username, password);

      setStoredAuthHeader(nextAuthHeader);
      localStorage.setItem("medizenUser", JSON.stringify(user));

      setCurrentUser(user);
      setAuthHeader(nextAuthHeader);
      setActiveModule((ROLE_MODULES[String(user.role || "").toUpperCase()] || ["Dashboard"])[0]);
      setLoginForm({ username: "", password: "" });
    } catch (error) {
      setLoginError(error.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    setStoredAuthHeader("");
    localStorage.removeItem("medizenUser");
    setCurrentUser(null);
    setAuthHeader("");
    setApiError("");
    setDashboardMetrics({
      totalPatients: 0,
      activeDoctors: 0,
      availableBeds: 0,
      todaysAppointments: 0
    });
    setActiveModule("Dashboard");
  }

  if (!currentUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand brand-login">
            <span>MEDIZEN</span>
            <small>Clinical Sanctuary</small>
          </div>

          <h1>Sign in to your dashboard</h1>
          <p>One website, role-based access. Your view changes automatically based on your account.</p>

          <form onSubmit={handleLogin} className="login-form">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={loginForm.username}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Enter username"
              autoComplete="username"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Enter password"
              autoComplete="current-password"
            />

            {loginError && <p className="error">{loginError}</p>}

            <button className="login-submit" type="submit" disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (role === "PATIENT") {
    console.log("Rendering PatientDashboard for role:", role);
    return (
      <Suspense fallback={moduleLoadingFallback}>
        <PatientDashboard currentUser={currentUser} onLogout={handleLogout} />
      </Suspense>
    );
  }

  console.log("NOT rendering PatientDashboard. Current role:", role, "Role type:", typeof role, "currentUser:", currentUser);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span>MEDIZEN</span>
          <small>Enterprise Care Platform</small>
        </div>
        <nav>
          {availableModules.map((module) => (
            <button
              key={module}
              className={activeModule === module ? "nav-item active" : "nav-item"}
              onClick={() => setActiveModule(module)}
            >
              {module}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer-actions">
          <button className="sidebar-logout-cta" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{activeModule}</h1>
            <p>
              Signed in as {currentUser?.fullName || currentUser?.username} · {ROLE_LABELS[role] || role}
            </p>
          </div>
          <div className="topbar-actions">
            <button>Notifications</button>
            <button>Settings</button>
            <button className="danger" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {activeModule === "Dashboard" && (
          <section className="cards">
            {dashboardCards.map((card) => (
              <article key={card.label} className="card">
                <h3>{card.value}</h3>
                <p>{card.label}</p>
              </article>
            ))}
          </section>
        )}

        <section className="panel">
          {apiError && <p className="error">{apiError}</p>}
          <Suspense fallback={moduleLoadingFallback}>{renderModule()}</Suspense>
        </section>
      </main>
    </div>
  );
}

export default App;
