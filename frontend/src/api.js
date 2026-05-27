export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost/pms").replace(/\/$/, "");

const ENABLE_LOCAL_LOGIN_FALLBACK =
  String(import.meta.env.VITE_ENABLE_LOCAL_LOGIN_FALLBACK || "true").toLowerCase() === "true";

const FALLBACK_USERS = {
  admin: {
    id: -1,
    username: "admin",
    fullName: "System Administrator",
    email: "admin@medizen.com",
    role: "ADMIN"
  },
  doctor: {
    id: -2,
    username: "doctor",
    fullName: "Dr. Julian Vance",
    email: "dr.julian.vance@medizen.com",
    role: "DOCTOR"
  },
  dr_smith: {
    id: -3,
    username: "dr_smith",
    fullName: "Dr. Marcus Chen",
    email: "dr.marcus.smith@medizen.com",
    role: "DOCTOR"
  },
  nurse: {
    id: -4,
    username: "nurse",
    fullName: "Sarah Jenkins",
    email: "sarah.jenkins@medizen.com",
    role: "NURSE"
  },
  staff: {
    id: -5,
    username: "staff",
    fullName: "John Doe",
    email: "john.doe@medizen.com",
    role: "NURSE"
  },
  patient: {
    id: -6,
    username: "patient",
    fullName: "Sarah Miller",
    email: "sarah.miller@email.com",
    role: "PATIENT"
  },
  patient2: {
    id: -7,
    username: "patient2",
    fullName: "Robert Jenkins",
    email: "robert.jenkins@email.com",
    role: "PATIENT"
  },
  anna_cortez: {
    id: -10,
    username: "anna_cortez",
    fullName: "Anna Cortez",
    email: "anna.cortez@medizen.com",
    role: "PATIENT"
  },
  mark_salazar: {
    id: -11,
    username: "mark_salazar",
    fullName: "Mark Salazar",
    email: "mark.salazar@medizen.com",
    role: "PATIENT"
  },
  isabella_torres: {
    id: -12,
    username: "isabella_torres",
    fullName: "Isabella Torres",
    email: "isabella.torres@medizen.com",
    role: "PATIENT"
  },
  joshua_villanueva: {
    id: -13,
    username: "joshua_villanueva",
    fullName: "Joshua Villanueva",
    email: "joshua.villanueva@medizen.com",
    role: "PATIENT"
  },
  camille_reyes: {
    id: -14,
    username: "camille_reyes",
    fullName: "Camille Reyes",
    email: "camille.reyes@medizen.com",
    role: "PATIENT"
  },
  daniel_navarro: {
    id: -15,
    username: "daniel_navarro",
    fullName: "Daniel Navarro",
    email: "daniel.navarro@medizen.com",
    role: "PATIENT"
  },
  sophia_dela_cruz: {
    id: -16,
    username: "sophia_dela_cruz",
    fullName: "Sophia Dela Cruz",
    email: "sophia.delacruz@medizen.com",
    role: "PATIENT"
  },
  miguel_aquino: {
    id: -17,
    username: "miguel_aquino",
    fullName: "Miguel Aquino",
    email: "miguel.aquino@medizen.com",
    role: "PATIENT"
  },
  lara_mendoza: {
    id: -18,
    username: "lara_mendoza",
    fullName: "Lara Mendoza",
    email: "lara.mendoza@medizen.com",
    role: "PATIENT"
  },
  rodolfo_yapan: {
    id: -19,
    username: "rodolfo_yapan",
    fullName: "Rodolfo Yapan",
    email: "rodolfo.yapan@medizen.com",
    role: "PATIENT"
  },
  mika_tan: {
    id: -20,
    username: "mika_tan",
    fullName: "Mika Tan",
    email: "mika.tan@medizen.com",
    role: "PATIENT"
  },
  paolo_vergara: {
    id: -21,
    username: "paolo_vergara",
    fullName: "Paolo Vergara",
    email: "paolo.vergara@medizen.com",
    role: "PATIENT"
  },
  marco_sta_ana: {
    id: -22,
    username: "marco_sta_ana",
    fullName: "Marco Sta Ana",
    email: "marco.staana@medizen.com",
    role: "PATIENT"
  },
  sofia_first: {
    id: -23,
    username: "sofia_first",
    fullName: "Sofia First",
    email: "sofia.first@medizen.com",
    role: "PATIENT"
  },
  kira_mendoza: {
    id: -24,
    username: "kira_mendoza",
    fullName: "Kira Mendoza",
    email: "kira.mendoza@medizen.com",
    role: "PATIENT"
  },
  benj_navarro: {
    id: -25,
    username: "benj_navarro",
    fullName: "Benj Navarro",
    email: "benj.navarro@medizen.com",
    role: "PATIENT"
  },
  janelle_cruz: {
    id: -26,
    username: "janelle_cruz",
    fullName: "Janelle Cruz",
    email: "janelle.cruz@medizen.com",
    role: "PATIENT"
  },
  tristan_ong: {
    id: -27,
    username: "tristan_ong",
    fullName: "Tristan Ong",
    email: "tristan.ong@medizen.com",
    role: "PATIENT"
  },
  nora_lim: {
    id: -28,
    username: "nora_lim",
    fullName: "Nora Lim",
    email: "nora.lim@medizen.com",
    role: "PATIENT"
  },
  alden_ramos: {
    id: -29,
    username: "alden_ramos",
    fullName: "Alden Ramos",
    email: "alden.ramos@medizen.com",
    role: "PATIENT"
  },
  lea_bautista: {
    id: -30,
    username: "lea_bautista",
    fullName: "Lea Bautista",
    email: "lea.bautista@medizen.com",
    role: "PATIENT"
  },
  satoru_gojo: {
    id: -31,
    username: "satoru_gojo",
    fullName: "Satoru Gojo",
    email: "satoru.gojo@medizen.com",
    role: "PATIENT"
  },
  mina_alvarez: {
    id: -32,
    username: "mina_alvarez",
    fullName: "Mina Alvarez",
    email: "mina.alvarez@medizen.com",
    role: "PATIENT"
  },
  haruto_saito: {
    id: -33,
    username: "haruto_saito",
    fullName: "Haruto Saito",
    email: "haruto.saito@medizen.com",
    role: "PATIENT"
  },
  yuna_park: {
    id: -34,
    username: "yuna_park",
    fullName: "Yuna Park",
    email: "yuna.park@medizen.com",
    role: "PATIENT"
  },
  caleb_lim: {
    id: -35,
    username: "caleb_lim",
    fullName: "Caleb Lim",
    email: "caleb.lim@medizen.com",
    role: "PATIENT"
  },
  rina_santos: {
    id: -36,
    username: "rina_santos",
    fullName: "Rina Santos",
    email: "rina.santos@medizen.com",
    role: "PATIENT"
  },
  victor_co: {
    id: -37,
    username: "victor_co",
    fullName: "Victor Co",
    email: "victor.co@medizen.com",
    role: "PATIENT"
  },
  elaine_uy: {
    id: -38,
    username: "elaine_uy",
    fullName: "Elaine Uy",
    email: "elaine.uy@medizen.com",
    role: "PATIENT"
  },
  noel_javier: {
    id: -39,
    username: "noel_javier",
    fullName: "Noel Javier",
    email: "noel.javier@medizen.com",
    role: "PATIENT"
  },
  patricia_ong: {
    id: -40,
    username: "patricia_ong",
    fullName: "Patricia Ong",
    email: "patricia.ong@medizen.com",
    role: "PATIENT"
  },
  public_user: {
    id: -8,
    username: "public_user",
    fullName: "John Public",
    email: "visitor@medizen.com",
    role: "PUBLIC_USER"
  },
  visitor: {
    id: -9,
    username: "visitor",
    fullName: "Community Member",
    email: "community@medizen.com",
    role: "PUBLIC_USER"
  }
};

function normalizeLoginValue(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function resolveFallbackUser(loginValue) {
  const directKey = String(loginValue || "").trim().toLowerCase();
  if (FALLBACK_USERS[directKey]) {
    return FALLBACK_USERS[directKey];
  }

  const normalized = normalizeLoginValue(loginValue);
  if (!normalized) {
    return null;
  }

  return (
    Object.values(FALLBACK_USERS).find((user) => {
      const candidateUsername = normalizeLoginValue(user.username);
      const candidateName = normalizeLoginValue(user.fullName);
      const candidateEmail = normalizeLoginValue(user.email);
      return normalized === candidateUsername || normalized === candidateName || normalized === candidateEmail;
    }) || null
  );
}

export const USER_ROLES = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "PATIENT", "PUBLIC_USER"];
const DEFAULT_LIST_LIMIT = Number(import.meta.env.VITE_DEFAULT_LIST_LIMIT || 100);

function listQuery(limit = DEFAULT_LIST_LIMIT, page = 0) {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(Number(limit), 500)) : DEFAULT_LIST_LIMIT;
  const safePage = Number.isFinite(Number(page)) ? Math.max(0, Number(page)) : 0;
  return `?limit=${safeLimit}&page=${safePage}`;
}

export function toBasicAuthHeader(username, password) {
  if (!username || !password) {
    return "";
  }
  return `Basic ${btoa(`${username}:${password}`)}`;
}

export function getStoredAuthHeader() {
  return localStorage.getItem("medizenAuthHeader") || "";
}

export function setStoredAuthHeader(authHeader) {
  if (!authHeader) {
    localStorage.removeItem("medizenAuthHeader");
    return;
  }
  localStorage.setItem("medizenAuthHeader", authHeader);
}

export function getAuthHeaders(extraHeaders = {}) {
  const authHeader = getStoredAuthHeader();
  if (!authHeader) {
    return { ...extraHeaders };
  }
  return {
    ...extraHeaders,
    Authorization: authHeader
  };
}

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response (${response.status})`);
  }
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status} on ${path}`);
  }

  return parseJsonResponse(response);
}

export async function login(username, password) {
  const normalizedUsername = String(username || "").trim();
  const normalizedPassword = String(password || "");
  const fallbackUser = resolveFallbackUser(normalizedUsername);

  try {
    const response = await fetch(`${API_BASE_URL}/api.php?action=auth_login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: normalizedUsername, password: normalizedPassword })
    });

    const body = await parseJsonResponse(response);
    if (!response.ok) {
      if (ENABLE_LOCAL_LOGIN_FALLBACK) {
        if (fallbackUser && normalizedPassword === "password") {
          return {
            ...fallbackUser,
            message: "Login successful (local fallback mode)"
          };
        }
      }
      throw new Error(body?.error || `Login failed (${response.status})`);
    }

    if (!body?.role) {
      throw new Error("Login response is missing user role");
    }

    return body;
  } catch (error) {
    if (ENABLE_LOCAL_LOGIN_FALLBACK) {
      if (fallbackUser && normalizedPassword === "password") {
        return {
          ...fallbackUser,
          message: "Login successful (offline fallback mode)"
        };
      }
    }
    throw error;
  }
}

export async function getDashboardMetrics() {
  try {
    const data = await fetchJson("/dashboard/metrics");
    if (data && typeof data === "object") {
      return {
        totalPatients: Number(data.totalPatients) || 0,
        activeDoctors: Number(data.activeDoctors) || 0,
        availableBeds: Number(data.availableBeds) || 0,
        todaysAppointments: Number(data.todaysAppointments) || 0
      };
    }
  } catch {
    // Fallback for older backend versions that do not expose /dashboard/metrics.
  }

  const [patients, doctors, wards, appointments] = await Promise.all([
    fetchJson("/patients"),
    fetchJson("/doctors"),
    fetchJson("/wards"),
    fetchJson("/appointments")
  ]);

  const availableBeds = wards.reduce((sum, ward) => sum + (Number(ward.availableBeds) || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todaysAppointments = appointments.filter((a) => a.date === today).length;

  return {
    totalPatients: patients.length,
    activeDoctors: doctors.length,
    availableBeds,
    todaysAppointments
  };
}

export function getModuleRows(moduleName) {
  const endpointByModule = {
    Patients: `/patients${listQuery()}`,
    Doctors: `/doctors${listQuery()}`,
    Wards: `/wards${listQuery()}`,
    Appointments: `/appointments${listQuery()}`,
    Billing: `/billing${listQuery()}`,
    Inventory: `/inventory${listQuery()}`,
    Reports: "/audit-logs?limit=300",
    Admin: `/users${listQuery()}`
  };

  const endpoint = endpointByModule[moduleName];

  if (!endpoint) {
    return Promise.resolve([]);
  }

  return fetchJson(endpoint);
}

export function getUsers(limit = DEFAULT_LIST_LIMIT, page = 0) {
  return fetchJson(`/users${listQuery(limit, page)}`);
}

export async function updateUserRole(userId, role) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({ role })
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status} while updating user role`);
  }

  const body = await parseJsonResponse(response);
  if (!body) {
    throw new Error("Empty response while updating user role");
  }

  return body;
}

const PATIENT_DASHBOARD_KEY = "medizenPatientDashboardV1";

function safeNowIso() {
  return new Date().toISOString();
}

function getPatientIdentity(user) {
  const username = String(user?.username || "patient").trim().toLowerCase();
  const displayName = String(user?.fullName || user?.full_name || user?.username || "Patient").trim();
  return { username, displayName };
}

function readDashboardStore() {
  try {
    const raw = localStorage.getItem(PATIENT_DASHBOARD_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeDashboardStore(store) {
  localStorage.setItem(PATIENT_DASHBOARD_KEY, JSON.stringify(store || {}));
}

function seedPatientDashboard(user) {
  const { username, displayName } = getPatientIdentity(user);
  const today = new Date();
  const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0, 0);
  const d2 = new Date(today.getFullYear(), today.getMonth() + 1, 2, 14, 15, 0);
  const eventDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 9, 0, 0);

  return {
    patient: username,
    profile: {
      name: displayName,
      age: 29,
      memberSince: "2026-01-01"
    },
    appointments: [
      {
        id: `${username}-apt-1`,
        title: "Dental Checkup",
        doctor: "Dr. Sarah Chen",
        location: "General Ward",
        dateTime: d1.toISOString(),
        status: "CONFIRMED",
        notes: "Routine screening"
      },
      {
        id: `${username}-apt-2`,
        title: "Physio Session",
        doctor: "Dr. Aris",
        location: "Knee Rehab",
        dateTime: d2.toISOString(),
        status: "PENDING",
        notes: "Follow-up mobility session"
      }
    ],
    reminders: [
      {
        id: `${username}-rem-1`,
        title: "Follow-up with Dr. Aris",
        detail: "Critical review for lab results from last Monday.",
        dueAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 8, 0, 0).toISOString(),
        status: "URGENT",
        completed: false
      },
      {
        id: `${username}-rem-2`,
        title: "Take Vitamin D",
        detail: "Daily dose at 9:00 AM. Best taken with healthy fats.",
        dueAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9, 0, 0).toISOString(),
        status: "UPCOMING",
        completed: false
      }
    ],
    notifications: [
      {
        id: `${username}-not-1`,
        type: "appointment",
        title: "Appointment Scheduled",
        message: "Physio session booked for Nov 02.",
        read: false,
        createdAt: safeNowIso(),
        priority: "info"
      },
      {
        id: `${username}-not-2`,
        type: "event",
        title: "Registration Successful",
        message: "Patient portal enrollment completed.",
        read: true,
        createdAt: new Date(today.getTime() - 86400000).toISOString(),
        priority: "success"
      }
    ],
    events: [
      {
        id: `${username}-evt-1`,
        title: "Free Vaccination Drive",
        description: "Join us this Oct 30 for annual city-wide immunization.",
        location: "Main Atrium",
        dateTime: eventDate.toISOString(),
        registered: false,
        capacity: 200,
        seatsLeft: 76
      }
    ],
    activity: [
      {
        id: `${username}-act-1`,
        tag: "INFO",
        title: "Appointment Scheduled",
        detail: "Physio session booked for Nov 02.",
        createdAt: safeNowIso()
      }
    ]
  };
}

function getOrCreatePatientDashboard(user) {
  const { username } = getPatientIdentity(user);
  const store = readDashboardStore();
  if (!store[username]) {
    store[username] = seedPatientDashboard(user);
    writeDashboardStore(store);
  }
  return { store, username, data: store[username] };
}

function savePatientDashboard(user, nextData) {
  const { store, username } = getOrCreatePatientDashboard(user);
  store[username] = nextData;
  writeDashboardStore(store);
  return store[username];
}

function appendActivity(data, tag, title, detail) {
  const entry = {
    id: `${data.patient}-act-${Date.now()}`,
    tag,
    title,
    detail,
    createdAt: safeNowIso()
  };
  return {
    ...data,
    activity: [entry, ...(Array.isArray(data.activity) ? data.activity : [])].slice(0, 120)
  };
}

export async function getPatientDashboardData(user) {
  const { data } = getOrCreatePatientDashboard(user);
  return data;
}

export async function markReminderDone(user, reminderId) {
  const { data } = getOrCreatePatientDashboard(user);
  const reminders = (data.reminders || []).map((item) => {
    if (item.id !== reminderId) return item;
    return { ...item, completed: true, status: "COMPLETED" };
  });
  const target = reminders.find((item) => item.id === reminderId);
  const withActivity = appendActivity(
    { ...data, reminders },
    "SUCCESS",
    "Reminder Completed",
    target ? `${target.title} marked as done.` : "Reminder completed."
  );
  return savePatientDashboard(user, withActivity);
}

export async function markNotificationRead(user, notificationId) {
  const { data } = getOrCreatePatientDashboard(user);
  const notifications = (data.notifications || []).map((item) => {
    if (item.id !== notificationId) return item;
    return { ...item, read: true };
  });
  const target = notifications.find((item) => item.id === notificationId);
  const withActivity = appendActivity(
    { ...data, notifications },
    "INFO",
    "Notification Read",
    target ? `${target.title} opened.` : "Notification marked as read."
  );
  return savePatientDashboard(user, withActivity);
}

export async function registerEvent(user, eventId) {
  const { data } = getOrCreatePatientDashboard(user);
  const events = (data.events || []).map((item) => {
    if (item.id !== eventId) return item;
    if (item.registered) return item;
    return {
      ...item,
      registered: true,
      seatsLeft: Math.max(0, Number(item.seatsLeft || 0) - 1)
    };
  });
  const target = events.find((item) => item.id === eventId);
  const withActivity = appendActivity(
    { ...data, events },
    "SUCCESS",
    "Event Registration",
    target ? `Registered for ${target.title}.` : "Event registration completed."
  );
  return savePatientDashboard(user, withActivity);
}

export async function cancelAppointment(user, appointmentId) {
  const { data } = getOrCreatePatientDashboard(user);
  const appointments = (data.appointments || []).map((item) => {
    if (item.id !== appointmentId) return item;
    return { ...item, status: "CANCELLED" };
  });
  const target = appointments.find((item) => item.id === appointmentId);
  const withActivity = appendActivity(
    { ...data, appointments },
    "WARNING",
    "Appointment Cancelled",
    target ? `${target.title} has been cancelled.` : "Appointment cancelled."
  );
  return savePatientDashboard(user, withActivity);
}
