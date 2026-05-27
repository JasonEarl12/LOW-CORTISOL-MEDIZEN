const state = {
  module: "patients",
  lastModule: null,
  rows: [],
  analytics: null,
  allowedModules: [],
  sessionUser: null,
  csrfToken: "",
  originalRows: [],
  sortAsc: true,
  undoStack: null,
  selectedIndex: null,
  selectedRowRef: null,
  lastOverview: null,
};

// ===== INACTIVITY DETECTION & AUTO RELOAD =====
// Only reload when no user activity for 30 minutes
let inactivityTimeout = null;
const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
let isUserActive = false;
let pendingRequests = 0; // Track ongoing API calls

// Hook into fetch to track API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  pendingRequests++;
  resetInactivityTimer();
  
  return originalFetch.apply(this, args)
    .then(response => {
      pendingRequests--;
      resetInactivityTimer();
      return response;
    })
    .catch(error => {
      pendingRequests--;
      resetInactivityTimer();
      throw error;
    });
};

function resetInactivityTimer() {
  // Clear existing timer
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }
  
  isUserActive = true;
  
  // Set new timer - reload after 2 minutes of inactivity
  inactivityTimeout = setTimeout(() => {
    // Only reload if no pending requests and user hasn't been active
    if (pendingRequests === 0 && isUserActive) {
      isUserActive = false;
      console.log("⟳ 2 minutes of inactivity - reloading page...");
      location.reload();
    } else if (pendingRequests > 0) {
      // If requests are still pending, check again in 5 seconds
      setTimeout(resetInactivityTimer, 5000);
    }
  }, INACTIVITY_TIME);
}

// Detect user activity and reset timer
document.addEventListener('click', resetInactivityTimer, true);
document.addEventListener('keydown', resetInactivityTimer, true);
document.addEventListener('mousemove', resetInactivityTimer, true);
document.addEventListener('scroll', resetInactivityTimer, true);
document.addEventListener('touchstart', resetInactivityTimer, true);

// Start initial timer on page load
window.addEventListener('load', () => {
  resetInactivityTimer();
  console.log("✓ Inactivity detection started (30 min timeout, auto-reload when idle)");
});

const moduleTitle = document.getElementById("moduleTitle");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const statusBox = document.getElementById("status");
const refreshBtn = document.getElementById("refreshBtn");
const themeBtn = document.getElementById("themeBtn");
const contrastBtn = document.getElementById("contrastBtn");
const walkStartBtn = document.getElementById("walkStartBtn");
const globalSearchInput = document.getElementById("globalSearchInput");
const statusFilter = document.getElementById("statusFilter");
const sortToggleBtn = document.getElementById("sortToggleBtn");
const addBtn = document.getElementById("addBtn");
const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");
const undoBtn = document.getElementById("undoBtn");
const quickActions = document.getElementById("quickActions");
const recentList = document.getElementById("recentList");
const miniChart = document.getElementById("miniChart");
const overviewMeta = document.getElementById("overviewMeta");
const toast = document.getElementById("toast");
const sidebarToggle = document.getElementById("sidebarToggle");
const patientDetailsPanel = document.getElementById("patientDetailsPanel");
const patientDetailsStatus = document.getElementById("patientDetailsStatus");
const patientDetailsId = document.getElementById("patientDetailsId");
const patientDetailsName = document.getElementById("patientDetailsName");
const patientDetailsDob = document.getElementById("patientDetailsDob");
const patientDetailsDoctor = document.getElementById("patientDetailsDoctor");
const patientDetailsWard = document.getElementById("patientDetailsWard");
const patientDetailsContact = document.getElementById("patientDetailsContact");
const patientDetailsHistory = document.getElementById("patientDetailsHistory");
const patientDetailsUsername = document.getElementById("patientDetailsUsername");
const patientDetailsPassword = document.getElementById("patientDetailsPassword");
const patientPasswordToggleBtn = document.getElementById("patientPasswordToggleBtn");
const patientCopyCredentialsBtn = document.getElementById("patientCopyCredentialsBtn");
const tableWrap = document.querySelector(".table-wrap");

const accountBanner = document.getElementById("accountBanner");
const accountToggle = document.getElementById("accountToggle");
const accountMenu = document.getElementById("accountMenu");
const accountAvatarImage = document.getElementById("accountAvatarImage");
const accountAvatarFallback = document.getElementById("accountAvatarFallback");
const accountStatusDot = document.getElementById("accountStatusDot");
const accountDisplayName = document.getElementById("accountDisplayName");
const accountDisplayRole = document.getElementById("accountDisplayRole");
const accountSettingsBtn = document.getElementById("accountSettingsBtn");
const accountNotificationsBtn = document.getElementById("accountNotificationsBtn");
const accountThemeBtn = document.getElementById("accountThemeBtn");
const accountNotifCount = document.getElementById("accountNotifCount");
const accountRoleShortcuts = document.getElementById("accountRoleShortcuts");
const accountNotificationsPanel = document.getElementById("accountNotificationsPanel");
const accountNotificationsList = document.getElementById("accountNotificationsList");
const accountSettingsModal = document.getElementById("accountSettingsModal");
const accountSettingsForm = document.getElementById("accountSettingsForm");
const accountSettingsFullName = document.getElementById("accountSettingsFullName");
const accountSettingsUsername = document.getElementById("accountSettingsUsername");
const accountSettingsEmail = document.getElementById("accountSettingsEmail");
const accountSettingsAvatarUrl = document.getElementById("accountSettingsAvatarUrl");
const accountSettingsCurrentPassword = document.getElementById("accountSettingsCurrentPassword");
const accountSettingsNewPassword = document.getElementById("accountSettingsNewPassword");
const accountSettingsConfirmPassword = document.getElementById("accountSettingsConfirmPassword");
const accountSettingsSaveBtn = document.getElementById("accountSettingsSaveBtn");
const accountSettingsCancelBtn = document.getElementById("accountSettingsCancelBtn");
const accountStatusIndicator = document.getElementById("accountStatusIndicator");

const analyticsDateFrom = document.getElementById("analyticsDateFrom");
const analyticsDateTo = document.getElementById("analyticsDateTo");
const analyticsDepartment = document.getElementById("analyticsDepartment");
const analyticsDoctor = document.getElementById("analyticsDoctor");
const analyticsAge = document.getElementById("analyticsAge");
const analyticsGender = document.getElementById("analyticsGender");
const analyticsApplyFilters = document.getElementById("analyticsApplyFilters");
const analyticsResetFilters = document.getElementById("analyticsResetFilters");
const analyticsExportExcel = document.getElementById("analyticsExportExcel");
const analyticsExportPdf = document.getElementById("analyticsExportPdf");
const analyticsQuickAddPatient = document.getElementById("analyticsQuickAddPatient");
const analyticsQuickSchedule = document.getElementById("analyticsQuickSchedule");
const analyticsQuickWardStatus = document.getElementById("analyticsQuickWardStatus");
const analyticsLoading = document.getElementById("analyticsLoading");
const analyticsProgress = document.getElementById("analyticsProgress");
const analyticsProgressText = document.getElementById("analyticsProgressText");
const analyticsMetrics = document.getElementById("analyticsMetrics");
const analyticsLineChart = document.getElementById("analyticsLineChart");
const analyticsBarChart = document.getElementById("analyticsBarChart");
const analyticsDonutChart = document.getElementById("analyticsDonutChart");
const analyticsRecentSearch = document.getElementById("analyticsRecentSearch");
const analyticsRecentTable = document.getElementById("analyticsRecentTable");
const analyticsHighRiskSort = document.getElementById("analyticsHighRiskSort");
const analyticsHighRiskTable = document.getElementById("analyticsHighRiskTable");
const analyticsAlerts = document.getElementById("analyticsAlerts");
const analyticsDrilldownTitle = document.getElementById("analyticsDrilldownTitle");
const analyticsDrilldownTable = document.getElementById("analyticsDrilldownTable");
const analyticsSummary = document.getElementById("analyticsSummary");

const confirmModal = document.getElementById("confirmModal");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

const advancedAppointmentModal = document.getElementById("advancedAppointmentModal");
const advancedAppointmentForm = document.getElementById("advancedAppointmentForm");

const entryModal = document.getElementById("entryModal");
const entryModalCard = entryModal?.querySelector(".modal-card");
const entryTitle = document.getElementById("entryTitle");
const entryForm = document.getElementById("entryForm");
const entrySubmitBtn = document.getElementById("entrySubmitBtn");
const entryNameLabel = document.getElementById("entryNameLabel");
const entryNotesLabel = document.getElementById("entryNotesLabel");
const entryNameInput = entryForm?.querySelector('input[name="name"]');
const entryNotesInput = entryForm?.querySelector('input[name="notes"]');
const entryGenericFields = document.getElementById("entryGenericFields");
const entryDynamicFields = document.getElementById("entryDynamicFields");
const entryPatientFields = document.getElementById("entryPatientFields");
const entryPatientFirstName = document.getElementById("entryPatientFirstName");
const entryPatientLastName = document.getElementById("entryPatientLastName");
const entryPatientDob = document.getElementById("entryPatientDob");
const entryPatientGender = document.getElementById("entryPatientGender");
const entryPatientGenderHint = document.getElementById("entryPatientGenderHint");
const entryPatientStatus = document.getElementById("entryPatientStatus");
const entryPatientContact = document.getElementById("entryPatientContact");
const entryPatientDoctor = document.getElementById("entryPatientDoctor");
const entryPatientDoctorHint = document.getElementById("entryPatientDoctorHint");
const entryPatientWard = document.getElementById("entryPatientWard");
const entryPatientWardHint = document.getElementById("entryPatientWardHint");
const entryPatientMedicalHistory = document.getElementById("entryPatientMedicalHistory");
const entryStatusIndicator = document.getElementById("entryStatusIndicator");

const walkthrough = document.getElementById("walkthrough");
const walkTitle = document.getElementById("walkTitle");
const walkText = document.getElementById("walkText");
const walkNextBtn = document.getElementById("walkNextBtn");
const walkSkipBtn = document.getElementById("walkSkipBtn");

let confirmResolver = null;
let walkIndex = 0;
let patientRealtimeTimer = null;
let dashboardRealtimeTimer = null;
let analyticsRealtimeTimer = null; // === NEW: Analytics auto-refresh timer ===

const walkSteps = [
  { title: "Welcome", text: "Use module buttons on the left to switch work areas quickly." },
  { title: "Fast Search", text: "Use Quick Search and table search to reduce time finding records." },
  { title: "Safe Actions", text: "Add, Edit, Delete actions include confirmations and undo support." },
  { title: "Insights", text: "Watch cards, mini chart, and recent activity to keep context while working." },
];

const moduleRecentLabels = {
  patients: "Recent patient updates",
  patient_analytics: "Patient analytics updates",
  doctors: "Recent doctor updates",
  wards: "Recent ward changes",
  appointments: "Upcoming appointments",
  billing: "Recent billing entries",
  inventory: "Inventory updates",
  audit_logs: "Latest audit trail",
};

const roleShortcutConfig = {
  ADMIN: [
    { module: "audit_logs", label: "Audit Logs", icon: "◆" },
    { module: "appointments", label: "Appointments", icon: "■" },
  ],
  DOCTOR: [
    { module: "patients", label: "Patient List", icon: "▲" },
    { module: "appointments", label: "Appointments", icon: "►" },
    { module: "wards", label: "Ward Assignments", icon: "◈" },
  ],
  NURSE: [
    { module: "wards", label: "Wards", icon: "◈" },
    { module: "appointments", label: "Appointments", icon: "►" },
    { module: "inventory", label: "Inventory Overview", icon: "□" },
  ],
  RECEPTIONIST: [
    { module: "appointments", label: "Appointments", icon: "►" },
    { module: "patients", label: "Patient List", icon: "≡" },
    { module: "billing", label: "Billing Queue", icon: "◐" },
  ],
};

function toDisplayRole(role) {
  const normalized = String(role || "").trim().toUpperCase();
  if (normalized === "ADMIN") return "Admin";
  if (normalized === "DOCTOR") return "Doctor";
  if (normalized === "NURSE") return "Nurse";
  if (normalized === "RECEPTIONIST") return "Staff";
  if (normalized === "PATIENT") return "Patient";
  if (normalized === "PUBLIC_USER") return "Public User";
  return "Staff";
}

function getInitials(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "U";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
}

function accountStatusClassForRole(role) {
  const normalized = String(role || "").trim().toUpperCase();
  if (normalized === "DOCTOR" || normalized === "NURSE") return "account-status-duty";
  return "account-status-online";
}

function accountStatusTitleForRole(role) {
  const normalized = String(role || "").trim().toUpperCase();
  if (normalized === "DOCTOR" || normalized === "NURSE") return "On duty";
  return "Online";
}

function closeAccountMenu() {
  if (!accountBanner || !accountMenu || !accountToggle) return;
  accountBanner.classList.remove("open");
  accountMenu.hidden = true;
  accountToggle.setAttribute("aria-expanded", "false");
  if (accountNotificationsPanel) {
    accountNotificationsPanel.hidden = true;
  }
}

function openAccountMenu() {
  if (!accountBanner || !accountMenu || !accountToggle) return;
  accountBanner.classList.add("open");
  accountMenu.hidden = false;
  accountToggle.setAttribute("aria-expanded", "true");
}

function toggleAccountMenu() {
  if (!accountMenu || !accountBanner) return;
  if (accountBanner.classList.contains("open")) {
    closeAccountMenu();
  } else {
    openAccountMenu();
  }
}

function buildRoleNotifications(userRole) {
  const role = String(userRole || "").toUpperCase();
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (role === "ADMIN") {
    return [
      { text: "3 user role changes awaiting review", meta: `Updated ${time}` },
      { text: "Audit trail captured for appointment updates", meta: "Security event" },
      { text: "Event board has 2 pending announcements", meta: "Operations" },
    ];
  }

  if (role === "DOCTOR") {
    return [
      { text: "2 patients marked Critical in your queue", meta: `Updated ${time}` },
      { text: "Next appointment starts in 30 minutes", meta: "Schedule" },
      { text: "Ward assignment report is ready", meta: "Wards" },
    ];
  }

  if (role === "NURSE") {
    return [
      { text: "Ward B requires stock replenishment", meta: "Inventory" },
      { text: "4 follow-up vitals checks due", meta: `Updated ${time}` },
      { text: "Appointment queue has new triage entries", meta: "Appointments" },
    ];
  }

  return [
    { text: "3 patient check-ins waiting verification", meta: `Updated ${time}` },
    { text: "Billing desk has 1 overdue account", meta: "Billing" },
  ];
}

function renderAccountNotifications(items) {
  if (!accountNotificationsList || !accountNotifCount) return;
  const list = Array.isArray(items) ? items : [];
  accountNotificationsList.innerHTML = "";

  list.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = String(item.text || "Notification");

    const meta = document.createElement("small");
    meta.textContent = String(item.meta || "");
    li.appendChild(meta);

    accountNotificationsList.appendChild(li);
  });

  accountNotifCount.textContent = String(list.length);
  accountNotifCount.hidden = list.length === 0;
}

function activateModule(moduleName) {
  const target = String(moduleName || "").trim().toLowerCase();
  if (!target) return;

  const button = document.querySelector(`.module-btn[data-module="${target}"]`);
  if (!(button instanceof HTMLElement)) return;
  if (button.style.display === "none") {
    showToast("Access denied for this module.");
    return;
  }

  document.querySelectorAll(".module-btn").forEach((b) => b.classList.remove("active"));
  button.classList.add("active");
  state.module = target;
  refreshStatusFilterOptions();
  syncModuleScrollMode();
  updateSortToggleLabel();
  renderPatientDetails(null);
  const label = button.querySelector("span:last-child");
  moduleTitle.textContent = label ? label.textContent : button.textContent;
  toggleAnalyticsModeUI(isAnalyticsModule());
  updateCrudActionLabels();
  loadModuleData();

  if (isAnalyticsModule()) {
    startAnalyticsRealtimeSync();
  } else {
    stopAnalyticsRealtimeSync();
  }
}

function renderRoleShortcutButtons(userRole) {
  if (!accountRoleShortcuts) return;
  accountRoleShortcuts.innerHTML = "";

  const role = String(userRole || "").toUpperCase();
  const configured = roleShortcutConfig[role] || [];
  const visibleItems = configured.filter((item) => state.allowedModules.includes(item.module));

  if (!visibleItems.length) {
    return;
  }

  visibleItems.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "account-menu-item";
    btn.setAttribute("role", "menuitem");
    btn.title = item.label;
    btn.innerHTML = `<span class="menu-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>`;
    btn.addEventListener("click", () => {
      closeAccountMenu();
      activateModule(item.module);
    });
    accountRoleShortcuts.appendChild(btn);
  });
}

function updateAccountBanner(user) {
  if (!user) return;

  const name = String(user.full_name || user.username || "User").trim() || "User";
  const role = String(user.role || "RECEPTIONIST").toUpperCase();
  const displayRole = toDisplayRole(role);
  const displayLine = `${name} - ${displayRole}`;

  if (accountDisplayName) accountDisplayName.textContent = name;
  if (accountDisplayRole) accountDisplayRole.textContent = displayRole;
  if (accountToggle) {
    accountToggle.setAttribute("aria-label", `Account menu for ${displayLine}`);
    accountToggle.title = displayLine;
  }

  if (accountAvatarFallback) {
    accountAvatarFallback.textContent = getInitials(name);
    accountAvatarFallback.hidden = false;
  }

  const avatarUrl = String(user.avatar_url || "").trim();
  if (accountAvatarImage) {
    if (avatarUrl) {
      accountAvatarImage.src = avatarUrl;
      accountAvatarImage.hidden = false;
      if (accountAvatarFallback) accountAvatarFallback.hidden = true;
    } else {
      accountAvatarImage.src = "";
      accountAvatarImage.hidden = true;
    }
  }

  if (accountStatusDot) {
    accountStatusDot.className = `account-status-dot ${accountStatusClassForRole(role)}`;
    const title = accountStatusTitleForRole(role);
    accountStatusDot.title = title;
    accountStatusDot.setAttribute("aria-label", title);
  }

  renderRoleShortcutButtons(role);
  renderAccountNotifications(buildRoleNotifications(role));
}

const moduleFieldTemplates = {
  patients: [
    { key: "full_name", label: "Full Name", type: "text", required: true, placeholder: "e.g. John Doe", section: "Identity" },
    { key: "dob", label: "Date of Birth", type: "date", required: true, placeholder: "", section: "Identity" },
    { key: "gender", label: "Gender", type: "select", required: true, options: ["MALE", "FEMALE", "OTHER"], section: "Identity" },
    { key: "contact", label: "Contact", type: "tel", required: false, placeholder: "e.g. 0917 123 4567", section: "Contact" },
    { key: "doctor_id", label: "Assigned Doctor ID", type: "number", required: false, placeholder: "e.g. 1", section: "Medical Assignment" },
    { key: "ward_id", label: "Ward ID", type: "number", required: false, placeholder: "e.g. 1", section: "Medical Assignment" },
    { key: "status", label: "Patient Status", type: "select", required: true, options: ["ADMITTED", "CRITICAL", "IN TREATMENT", "UNDER OBSERVATION", "STABLE", "RECOVERING", "DISCHARGED", "FOLLOW-UP REQUIRED", "SCHEDULED", "NO-SHOW"], section: "Status" },
    { key: "medical_history", label: "Medical History", type: "text", required: false, placeholder: "Patient medical notes...", section: "Medical Info" },
    { key: "username", label: "Login Username (Admin Only)", type: "text", required: false, placeholder: "e.g. patient_john", section: "Credentials" },
    { key: "password", label: "Login Password (Admin Only)", type: "text", required: false, placeholder: "e.g. secure_password_here", section: "Credentials" },
  ],
  doctors: [
    { key: "full_name", label: "Doctor Name", type: "text", required: true, placeholder: "e.g. Dr. Angela Cruz", section: "Identity" },
    { key: "specialty", label: "Specialty", type: "text", required: true, placeholder: "e.g. Pediatrics", section: "Identity" },
    { key: "contact", label: "Contact", type: "tel", required: true, placeholder: "e.g. 0917 123 4567", section: "Contact" },
    { key: "schedule", label: "Schedule", type: "text", required: false, placeholder: "e.g. Mon-Fri 8:00-16:00", section: "Availability" },
  ],
  wards: [
    { key: "ward_name", label: "Ward Name", type: "text", required: true, placeholder: "e.g. Ward A", section: "Ward Details" },
    { key: "capacity", label: "Capacity", type: "number", required: true, placeholder: "e.g. 40", section: "Ward Details" },
    { key: "available_beds", label: "Available Beds", type: "number", required: true, placeholder: "e.g. 12", section: "Ward Details" },
  ],
  appointments: [
    { key: "patient", label: "Patient Name", type: "text", required: true, placeholder: "e.g. Maria Santos", section: "Appointment" },
    { key: "doctor", label: "Doctor Name", type: "text", required: true, placeholder: "e.g. Dr. Angela Cruz", section: "Appointment" },
    { key: "date", label: "Date", type: "date", required: true, placeholder: "", section: "Schedule" },
    { key: "time", label: "Time", type: "time", required: true, placeholder: "", section: "Schedule" },
    { key: "status", label: "Status", type: "select", required: true, options: ["SCHEDULED", "COMPLETED", "CANCELLED"], section: "Status" },
  ],
  billing: [
    { key: "patient", label: "Patient", type: "patient", required: true, placeholder: "Select or type a patient", section: "Billing" },
    { key: "amount", label: "Amount", type: "number", required: true, placeholder: "e.g. 1200", section: "Billing" },
    { key: "payment_status", label: "Payment Status", type: "select", required: true, options: ["PENDING", "PAID", "OVERDUE"], section: "Status" },
  ],
  inventory: [
    { key: "item_name", label: "Item Name", type: "text", required: true, placeholder: "e.g. Surgical Gloves", section: "Item" },
    { key: "quantity", label: "Quantity", type: "number", required: true, placeholder: "e.g. 100", section: "Stock" },
    { key: "expiration_date", label: "Expiration Date", type: "date", required: false, placeholder: "", section: "Stock" },
    { key: "alert_threshold", label: "Alert Threshold", type: "number", required: true, placeholder: "e.g. 10", section: "Stock" },
  ],
};

function openAccountSettingsModal(user) {
  if (!accountSettingsModal || !accountSettingsForm || !user) return;

  // Set user information
  if (accountSettingsFullName) {
    accountSettingsFullName.value = String(user.full_name || user.username || "").trim();
  }
  if (accountSettingsUsername) {
    accountSettingsUsername.value = String(user.username || "").trim();
  }
  if (accountSettingsEmail) {
    accountSettingsEmail.value = String(user.email || "").trim();
  }
  
  // Set avatar
  const avatarElement = document.getElementById("accountSettingsAvatarImage");
  const fallbackElement = document.getElementById("accountSettingsAvatarFallback");
  const displayNameElement = document.getElementById("accountSettingsDisplayName");
  const displayTitleElement = document.getElementById("accountSettingsDisplayTitle");
  
  if (avatarElement && user.avatar_url) {
    avatarElement.src = user.avatar_url;
    avatarElement.hidden = false;
    if (fallbackElement) fallbackElement.hidden = true;
  } else {
    if (avatarElement) avatarElement.hidden = true;
    if (fallbackElement) {
      fallbackElement.textContent = String(user.full_name || user.username || "U").substring(0, 1).toUpperCase();
      fallbackElement.hidden = false;
    }
  }
  
  if (displayNameElement) {
    displayNameElement.textContent = String(user.full_name || user.username || "User");
  }
  if (displayTitleElement) {
    displayTitleElement.textContent = String(user.role || "Staff").toUpperCase();
  }
  
  // Clear password fields
  if (accountSettingsCurrentPassword) accountSettingsCurrentPassword.value = "";
  if (accountSettingsNewPassword) accountSettingsNewPassword.value = "";
  if (accountSettingsConfirmPassword) accountSettingsConfirmPassword.value = "";
  
  // Reset to general tab
  switchAccountSettingsTab("general");
  
  accountSettingsModal.hidden = false;
  window.setTimeout(() => {
    if (accountSettingsFullName) {
      accountSettingsFullName.focus();
    }
  }, 0);
}

function closeAccountSettingsModal() {
  if (!accountSettingsModal || !accountSettingsForm) return;
  accountSettingsModal.hidden = true;
  accountSettingsForm.reset();
  
  // Clear avatar data
  window.accountAvatarDataUrl = null;
  const accountSettingsAvatarFile = document.getElementById("accountSettingsAvatarFile");
  if (accountSettingsAvatarFile) {
    accountSettingsAvatarFile.value = "";
  }
  
  // Reset avatar display to default
  const avatarImage = document.getElementById("accountSettingsAvatarImage");
  const avatarFallback = document.getElementById("accountSettingsAvatarFallback");
  if (avatarImage) {
    avatarImage.hidden = true;
  }
  if (avatarFallback) {
    avatarFallback.hidden = false;
  }
}

function switchAccountSettingsTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll(".settings-tab");
  tabs.forEach(tab => tab.classList.remove("active"));
  
  // Remove active from all menu items
  const menuItems = document.querySelectorAll(".sidebar-menu-item");
  menuItems.forEach(item => item.classList.remove("active"));
  
  // Show selected tab
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }
  
  // Mark menu item as active
  const selectedMenuItem = document.querySelector(`.sidebar-menu-item[data-tab="${tabName}"]`);
  if (selectedMenuItem) {
    selectedMenuItem.classList.add("active");
  }
}

function getInventorySampleRows() {
  return [
    { id: "EX-1001", item_name: "N95 Mask", quantity: 240, expiration_date: "2027-10-31", alert_threshold: 60 },
    { id: "EX-1002", item_name: "Surgical Gloves (Medium)", quantity: 520, expiration_date: "2028-01-15", alert_threshold: 120 },
    { id: "EX-1003", item_name: "Paracetamol 500mg", quantity: 840, expiration_date: "2027-06-30", alert_threshold: 200 },
    { id: "EX-1004", item_name: "IV Fluid (0.9% NaCl 1L)", quantity: 96, expiration_date: "2027-03-31", alert_threshold: 24 },
    { id: "EX-1005", item_name: "Syringe 5ml", quantity: 430, expiration_date: "2028-08-31", alert_threshold: 100 },
    { id: "EX-1006", item_name: "Digital Thermometer", quantity: 68, expiration_date: "", alert_threshold: 15 },
    { id: "EX-1007", item_name: "Alcohol Swabs", quantity: 1200, expiration_date: "2028-04-30", alert_threshold: 250 },
    { id: "EX-1008", item_name: "Insulin Syringe 1ml", quantity: 360, expiration_date: "2027-12-31", alert_threshold: 90 },
    { id: "EX-1009", item_name: "Blood Glucose Test Strips", quantity: 210, expiration_date: "2027-09-30", alert_threshold: 50 },
    { id: "EX-1010", item_name: "Face Shield", quantity: 145, expiration_date: "", alert_threshold: 35 },
    { id: "EX-1011", item_name: "Rapid Antigen Test Kit", quantity: 82, expiration_date: "2027-05-31", alert_threshold: 20 },
    { id: "EX-1012", item_name: "Povidone-Iodine 10% 120ml", quantity: 176, expiration_date: "2027-11-30", alert_threshold: 40 },
  ];
}

function updateCrudActionLabels() {
  if (!editBtn) return;
  editBtn.textContent = "UPDATE";
}

function isServerWritableModule(moduleName) {
  return ["patients", "doctors", "wards", "appointments", "billing", "inventory"].includes(
    String(moduleName || "").toLowerCase()
  );
}

function getModuleTemplate(moduleName) {
  return moduleFieldTemplates[String(moduleName).toLowerCase()] ?? null;
}

function syncModuleScrollMode() {
  if (state.module === "patients") {
    document.body.classList.add("module-patients");
  } else {
    document.body.classList.remove("module-patients");
  }

  if (state.module === "patient_analytics") {
    document.body.classList.add("module-analytics");
  } else {
    document.body.classList.remove("module-analytics");
  }
}

function getCurrentModuleName() {
  const activeBtn = document.querySelector(".module-btn.active");
  const activeModule = activeBtn?.dataset?.module;
  if (typeof activeModule === "string" && activeModule.trim()) {
    return activeModule.trim().toLowerCase();
  }
  return String(state.module || "").trim().toLowerCase();
}

function updateSortToggleLabel() {
  if (!sortToggleBtn) return;
  if (state.module === "patients") {
    sortToggleBtn.textContent = state.sortAsc ? "Sort ID ↑" : "Sort ID ↓";
    return;
  }
  sortToggleBtn.textContent = state.sortAsc ? "Sort A-Z" : "Sort Z-A";
}

function derivePatientStatus(row) {
  // Use actual status column from patient data
  if (row?.status) {
    return formatStatusLabel(String(row.status).trim());
  }
  // Fallback for backward compatibility
  if (String(row?.ward ?? "").trim()) return "Admitted";
  if (String(row?.doctor ?? "").trim()) return "Under Care";
  return "Pending";
}

function formatStatusLabel(statusCode) {
  // Convert UPPERCASE ENUM to readable label
  const labels = {
    'ADMITTED': 'Admitted',
    'CRITICAL': 'Critical',
    'IN TREATMENT': 'In Treatment',
    'UNDER OBSERVATION': 'Under Observation',
    'STABLE': 'Stable',
    'RECOVERING': 'Recovering',
    'DISCHARGED': 'Discharged',
    'FOLLOW-UP REQUIRED': 'Follow-up Required',
    'SCHEDULED': 'Scheduled',
    'NO-SHOW': 'No-show'
  };
  return labels[statusCode] || statusCode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function convertTo12HourFormat(time24) {
  // Convert HH:MM format (24-hour) to 12-hour format with AM/PM
  if (!time24 || typeof time24 !== 'string') return 'N/A';
  const [hours, minutes] = time24.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, ' ')}:${String(minutes).padStart(2, '0')} ${period}`;
}

function patientStatusSemanticType(statusText) {
  const text = String(statusText || "").trim().toUpperCase();
  
  // Patient Status Enum Semantic Types
  if (text === 'CRITICAL') return "danger";
  if (text === 'FOLLOW-UP REQUIRED' || text === 'UNDER OBSERVATION') return "warning";
  if (text === 'STABLE' || text === 'RECOVERING' || text === 'DISCHARGED') return "success";
  if (text === 'ADMITTED' || text === 'IN TREATMENT' || text === 'SCHEDULED') return "info";
  if (text === 'NO-SHOW') return "neutral";
  
  return "info";
}

function patientStatusClassName(statusText) {
  const text = String(statusText || "").trim().toUpperCase();
  
  // Map enum statuses to CSS classes
  const classMap = {
    'ADMITTED': 'patient-status-admitted',
    'CRITICAL': 'patient-status-critical',
    'IN TREATMENT': 'patient-status-treatment',
    'UNDER OBSERVATION': 'patient-status-observation',
    'STABLE': 'patient-status-stable',
    'RECOVERING': 'patient-status-recovering',
    'DISCHARGED': 'patient-status-discharged',
    'FOLLOW-UP REQUIRED': 'patient-status-followup',
    'SCHEDULED': 'patient-status-scheduled',
    'NO-SHOW': 'patient-status-no-show'
  };
  
  return classMap[text] || 'patient-status-pending';
}

function renderPatientDetails(row) {
  if (!patientDetailsPanel) {
    console.error("ERROR: patientDetailsPanel not found in DOM");
    return;
  }
  
  // Only show patient details panel when viewing the patients module
  if (state.module !== "patients") {
    patientDetailsPanel.hidden = true;
    return;
  }
  
  if (!row) {
    patientDetailsPanel.hidden = true;
    return;
  }

  // DEBUG: Log all credentials-related elements
  console.log("DEBUG renderPatientDetails called", {
    patientDetailsPanel: !!patientDetailsPanel,
    patientDetailsUsername: !!patientDetailsUsername,
    patientDetailsPassword: !!patientDetailsPassword,
    patientPasswordToggleBtn: !!patientPasswordToggleBtn,
    patientCopyCredentialsBtn: !!patientCopyCredentialsBtn,
    row_id: row.id,
    row_patient_username: row.patient_username,
    row_keys: Object.keys(row).slice(0, 15)
  });

  const status = derivePatientStatus(row);
  const semanticType = patientStatusSemanticType(status);
  const statusClass = patientStatusClassName(status);
  const history = String(row.medical_history ?? "").trim();

  patientDetailsId.textContent = String(row.id ?? "-");
  patientDetailsName.textContent = String(row.full_name ?? "-");
  patientDetailsDob.textContent = String(row.dob ?? "-");
  patientDetailsDoctor.textContent = String(row.doctor ?? "Not assigned");
  patientDetailsWard.textContent = String(row.ward ?? "Not assigned");
  patientDetailsContact.textContent = String(row.contact ?? "-");
  patientDetailsHistory.textContent = history || "No medical history recorded.";
  patientDetailsStatus.textContent = status;
  patientDetailsStatus.className = `status-pill status-pill-${semanticType} ${statusClass}`;
  patientDetailsStatus.style.cursor = "pointer";
  patientDetailsStatus.title = "Click to update patient status";

  // Set credentials
  const username = String(row.patient_username ?? "-");
  const patientId = row.id;
  
  console.log("Setting credentials:", { username, patientId });
  
  if (patientDetailsUsername) {
    patientDetailsUsername.textContent = username;
    console.log("Username set to:", username);
  } else {
    console.error("ERROR: patientDetailsUsername not found");
  }
  
  if (patientDetailsPassword) {
    patientDetailsPassword.textContent = "••••••••";
    patientDetailsPassword.dataset.password = String(row.password ?? "");
    patientDetailsPassword.classList.add("password-masked");
    patientDetailsPassword.classList.remove("password-visible");
    console.log("Password reset to masked");
  } else {
    console.error("ERROR: patientDetailsPassword not found");
  }
  
  // Set up event listeners
  if (patientPasswordToggleBtn) {
    patientPasswordToggleBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Password toggle clicked");
      window.currentPatientId = patientId;
      window.currentPatientName = row.full_name;
      window.currentPatientUsername = username;
      openAdminVerificationModal(() => {
        togglePatientPassword(patientId, row);
      });
    };
    console.log("Password toggle button event listener set");
  } else {
    console.error("ERROR: patientPasswordToggleBtn not found");
  }
  
  if (patientCopyCredentialsBtn) {
    patientCopyCredentialsBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Copy credentials clicked");
      window.currentPatientId = patientId;
      window.currentPatientName = row.full_name;
      window.currentPatientUsername = username;
      // Require admin verification before copying credentials
      openAdminVerificationModal(() => {
        copyPatientCredentials(username);
      });
    };
    console.log("Copy credentials button event listener set");
  } else {
    console.error("ERROR: patientCopyCredentialsBtn not found");
  }

  // Show the panel
  patientDetailsPanel.hidden = false;
  console.log("Patient details panel shown");
}

// DISABLED: Old admin verification code - now using simple toggle in index.php
/*
function togglePatientPassword(patientId, row) {
  console.log('>>> togglePatientPassword CALLED with patientId:', patientId);
  console.log('>>> Row data:', row);
  
  const inlinePasswordElement = document.getElementById("inlinePatientPassword");
  console.log('>>> Found password element?', !!inlinePasswordElement);
  
  if (!inlinePasswordElement) {
    console.error(">>> ERROR: Password field NOT found - ID 'inlinePatientPassword' not in DOM");
    console.log('>>> Current DOM IDs related to password:', 
      Array.from(document.querySelectorAll('[id*="password" i]')).map(el => el.id)
    );
    showToast("Password field not found", "danger");
    return;
  }
  
  console.log('>>> Password element text:', inlinePasswordElement.textContent);
  console.log('>>> Password element classes:', Array.from(inlinePasswordElement.classList));
  
  const isPasswordVisible = inlinePasswordElement.classList.contains("password-visible");
  console.log('>>> Is password currently visible?', isPasswordVisible);
  
  if (isPasswordVisible) {
    // Hide password
    console.log('>>> ACTION: Hiding password');
    inlinePasswordElement.textContent = "••••••••";
    inlinePasswordElement.classList.remove("password-visible");
    inlinePasswordElement.classList.add("password-masked");
    console.log('>>> After hiding - text:', inlinePasswordElement.textContent, '- classes:', Array.from(inlinePasswordElement.classList));
    showToast("Password hidden", "info", 2000);
  } else {
    // Show OTP password (username + DOB formatted as YYYYMMDD)
    console.log('>>> ACTION: Revealing password');
    const username = String(row?.username ?? "-");
    console.log('>>> Username:', username);
    const dobRaw = String(row?.dob ?? "19900101");
    console.log('>>> DOB raw:', dobRaw);
    const dob = dobRaw.replace(/-/g, "").substring(0, 8);
    console.log('>>> DOB formatted:', dob);
    const otpPassword = username + dob;
    console.log('>>> Final OTP password:', otpPassword);
    
    inlinePasswordElement.textContent = otpPassword;
    inlinePasswordElement.classList.add("password-visible");
    inlinePasswordElement.classList.remove("password-masked");
    
    console.log('>>> After revealing - text:', inlinePasswordElement.textContent, '- classes:', Array.from(inlinePasswordElement.classList));
    showToast("✓ Password: " + otpPassword, "success", 3000);
  }
}

// ===== ENHANCED ADMIN VERIFICATION =====
window.verificationCache = {
  verified: false,
  expiresAt: 0
};

// DISABLED: Old verification functions - now using simple toggle
/*
function openAdminVerificationModal(actionCallback) {
  // Check if already verified recently (cache for 5 minutes)
  const now = Date.now();
  if (window.verificationCache.verified && window.verificationCache.expiresAt > now) {
    console.log("✓ Using cached admin verification");
    if (actionCallback && typeof actionCallback === 'function') {
      actionCallback();
    }
    return;
  }
  
  window.pendingCredentialAction = actionCallback;
  const modal = document.getElementById('adminVerificationModal');
  if (modal) {
    modal.hidden = false;
    document.getElementById('adminVerificationPassword').focus();
    document.getElementById('adminVerificationError').style.display = 'none';
    document.getElementById('adminVerificationPassword').value = '';
  }
}

function closeAdminVerificationModal() {
  const modal = document.getElementById('adminVerificationModal');
  if (modal) {
    modal.hidden = true;
    document.getElementById('adminVerificationPassword').value = '';
    window.pendingCredentialAction = null;
  }
}

function toggleAdminPasswordVisibility() {
  const field = document.getElementById('adminVerificationPassword');
  field.type = field.type === 'password' ? 'text' : 'password';
}

async function submitAdminVerification() {
  const password = document.getElementById('adminVerificationPassword').value;
  const errorDiv = document.getElementById('adminVerificationError');
  const submitBtn = event?.target;
  
  if (!password) {
    errorDiv.textContent = 'Please enter your admin password.';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
  }
  
  try {
    const response = await fetch('api.php?action=verify_admin_credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('input[name="csrf_token"]')?.value || ''
      },
      body: JSON.stringify({ admin_password: password })
    });
    
    const result = await response.json();
    
    console.log("✓ Admin verification API response:", { 
      status: response.status, 
      verified: result.verified,
      error: result.error 
    });
    
    // Check the result.verified flag
    if (result && result.verified === true) {
      console.log("✓ Password verification SUCCESS");
      showToast('✓ Admin verified successfully', 'success');
      
      // Cache verification for 5 minutes (300000 ms)
      window.verificationCache.verified = true;
      window.verificationCache.expiresAt = Date.now() + 300000;
      console.log("✓ Cached verification until", new Date(window.verificationCache.expiresAt).toLocaleTimeString());
      
      // Store the callback BEFORE closing modal
      const callback = window.pendingCredentialAction;
      
      // Close modal
      closeAdminVerificationModal();
      
      // Then execute the callback
      if (callback && typeof callback === 'function') {
        console.log("✓ Executing pending credential action callback");
        callback();
      }
    } else {
      const errorMsg = result?.error || 'Invalid admin password. Please try again.';
      errorDiv.textContent = errorMsg;
      errorDiv.style.display = 'block';
      showToast('❌ ' + errorMsg, 'danger');
      console.warn("Admin verification failed:", result);
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    errorDiv.textContent = 'Error verifying password: ' + error.message;
    errorDiv.style.display = 'block';
    showToast('Error: ' + error.message, 'danger');
  } finally {
    // Restore button state
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verify Password';
    }
  }
}
*/

// ===== PASSWORD RESET MODAL =====
function openPasswordResetModal(patientId, patientName, username, dob, password = "") {
  window.selectedPatientId = patientId;
  window.selectedPatientName = patientName;
  window.selectedPatientUsername = username;
  window.selectedPatientDob = dob ? dob.replace(/-/g, '') : '19900101'; // Format YYYYMMDD
  window.selectedPatientPassword = String(password || "");
  document.getElementById('resetPatientNameDisplay').textContent = 'Patient: ' + patientName;
  document.getElementById('passwordResetModalStep1').hidden = false;
}

function closePasswordResetModal() {
  document.getElementById('passwordResetModalStep1').hidden = true;
  window.selectedPatientId = null;
  window.selectedPatientName = null;
  window.selectedPatientDob = null;
  window.selectedPatientUsername = null;
  window.selectedPatientPassword = null;
}

function backToResetOptions() {
  // This is now just for closing the modal since we simplified the flow
  closePasswordResetModal();
}

function copyOtpPassword() {
  const username = window.selectedPatientUsername || 'username';
  const password = String(window.selectedPatientPassword || '').trim() || `${username}${window.selectedPatientDob || '19900101'}`;

  navigator.clipboard.writeText(password)
    .then(() => {
      showToast('✓ Password copied to clipboard: ' + password, 'success', 3000);
      closePasswordResetModal();
    })
    .catch(err => {
      console.error('Copy failed:', err);
      showToast('Failed to copy. Password: ' + password, 'warning');
      closePasswordResetModal();
    });
}

function copyPatientCredentials(username) {
  if (username === "-" || !username) {
    showToast("⚠️ No credentials available for this patient", "warning");
    return;
  }
  
  // Try to find the actual stored password from either panel
  const sidePanelPassword = patientDetailsPassword?.dataset?.password?.trim() || "";
  const inlinePassword = document.getElementById("inlinePatientPassword")?.dataset?.password?.trim() || "";
  const password = sidePanelPassword || inlinePassword;

  if (!password) {
    showToast("⚠️ No stored password found for this patient", "warning");
    return;
  }
  
  const credentials = `Username: ${username}\nPassword: ${password}`;
  
  navigator.clipboard.writeText(credentials)
    .then(() => {
      // Show success with icon
      showToast("✓ Credentials copied to clipboard", "success", 2500);
      
      // Visual feedback on button
      const copyBtn = document.getElementById("patientCopyCredentialsBtn");
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "✓ Copied";
        copyBtn.disabled = true;
        copyBtn.style.opacity = "0.7";
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.disabled = false;
          copyBtn.style.opacity = "1";
        }, 2000);
      }
    })
    .catch((err) => {
      console.error("Clipboard copy failed:", err);
      showToast("✗ Failed to copy credentials. Please try again.", "danger");
    });
}

// Generate temporary password for patient and show it
function renderPatientInlineDetails(row) {
  // Hide the separate detail panel when showing inline
  if (patientDetailsPanel) {
    patientDetailsPanel.hidden = true;
  }
  
  // Remove any existing inline details row first
  const existingInlines = tableBody.querySelectorAll(".patient-inline-details-row");
  existingInlines.forEach(el => el.remove());

  if (state.module !== "patients" || !row) {
    return;
  }

  const status = derivePatientStatus(row);
  const semanticType = patientStatusSemanticType(status);
  const statusClass = patientStatusClassName(status);
  const history = String(row.medical_history ?? "").trim();

  // Create the inline details row
  const inlineRow = document.createElement("tr");
  inlineRow.classList.add("patient-inline-details-row");
  inlineRow.tabIndex = -1;

  // Create a td that spans all columns
  const cellSpan = document.createElement("td");
  cellSpan.colSpan = 999;
  cellSpan.classList.add("patient-inline-details-cell");

  // Create the details card
  const card = document.createElement("div");
  card.classList.add("patient-inline-details-card-large");

  // Header with status
  const header = document.createElement("div");
  header.classList.add("patient-inline-details-header");
  const h4 = document.createElement("h4");
  h4.textContent = "Patient Details";
  header.appendChild(h4);

  const statusPill = document.createElement("span");
  statusPill.className = `status-pill status-pill-${semanticType} ${statusClass}`;
  statusPill.textContent = status;
  statusPill.style.cursor = "pointer";
  statusPill.title = "Click to update patient status";
  statusPill.addEventListener("click", (e) => {
    e.stopPropagation();
    openQuickStatusChangeMenu(row, statusPill);
  });
  header.appendChild(statusPill);
  card.appendChild(header);

  // Details grid with 3 columns
  const grid = document.createElement("div");
  grid.classList.add("patient-inline-details-grid");

  const details = [
    { label: "Patient ID", value: String(row.id ?? "-") },
    { label: "Full Name", value: String(row.full_name ?? "-") },
    { label: "Date of Birth", value: String(row.dob ?? "-") },
    { label: "Assigned Doctor", value: String(row.doctor ?? "Not assigned") },
    { label: "Ward", value: String(row.ward ?? "Not assigned") },
    { label: "Contact", value: String(row.contact ?? "-") },
    { label: "Username", value: String(row.username ?? "-") },
  ];

  details.forEach((detail) => {
    const item = document.createElement("div");
    item.classList.add("patient-inline-details-item");
    const small = document.createElement("small");
    small.textContent = detail.label;
    const strong = document.createElement("strong");
    strong.textContent = detail.value;
    item.appendChild(small);
    item.appendChild(strong);
    grid.appendChild(item);
  });

  card.appendChild(grid);

  // Medical History
  const historySection = document.createElement("div");
  historySection.classList.add("patient-inline-details-history");
  const historySmall = document.createElement("small");
  historySmall.textContent = "Medical History";
  const historyP = document.createElement("p");
  historyP.textContent = history || "No medical history recorded.";
  historySection.appendChild(historySmall);
  historySection.appendChild(historyP);
  card.appendChild(historySection);

  // === ADD CREDENTIALS SECTION ===
  const credentialsSection = document.createElement("div");
  credentialsSection.classList.add("patient-credentials-section");
  
  const credentialsTitle = document.createElement("h4");
  credentialsTitle.textContent = "Patient Login Credentials";
  credentialsSection.appendChild(credentialsTitle);
  
  const credentialsGrid = document.createElement("div");
  credentialsGrid.classList.add("patient-credentials-grid");
  
  // Username field
  const usernameItem = document.createElement("div");
  usernameItem.classList.add("patient-credential-item");
  const usernameSmall = document.createElement("small");
  usernameSmall.textContent = "Username";
  const usernameStrong = document.createElement("strong");
  usernameStrong.id = "inlinePatientUsername";
  usernameStrong.textContent = String(row.username ?? "-");
  usernameItem.appendChild(usernameSmall);
  usernameItem.appendChild(usernameStrong);
  credentialsGrid.appendChild(usernameItem);
  
  // Password field with toggle
  const passwordItem = document.createElement("div");
  passwordItem.classList.add("patient-credential-item");
  const passwordSmall = document.createElement("small");
  passwordSmall.textContent = "Password";
  const passwordWrapper = document.createElement("div");
  passwordWrapper.classList.add("password-display-wrapper");
  const passwordStrong = document.createElement("strong");
  passwordStrong.id = "inlinePatientPassword";
  passwordStrong.classList.add("password-masked");
  passwordStrong.dataset.password = String(row.password ?? "");
  passwordStrong.textContent = "••••••••";
  const passwordToggle = document.createElement("button");
  passwordToggle.type = "button";
  passwordToggle.classList.add("password-toggle-btn");
  passwordToggle.title = "Show password";
  passwordToggle.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  passwordToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the password element that's a sibling of the button
    const passwordEl = passwordToggle.parentElement.querySelector("strong");
    if (!passwordEl) {
      console.error("Password element not found");
      return;
    }
    
    const isPasswordVisible = passwordEl.classList.contains("password-visible");
    if (isPasswordVisible) {
      // Hide
      passwordEl.textContent = "••••••••";
      passwordEl.classList.remove("password-visible");
      passwordEl.classList.add("password-masked");
      showToast("Password hidden", "info", 2000);
    } else {
      // Show
      const storedPassword = String(passwordEl.dataset.password || "").trim();
      if (!storedPassword) {
        showToast("No stored password found for this patient", "warning", 2500);
        return;
      }
      passwordEl.textContent = storedPassword;
      passwordEl.classList.add("password-visible");
      passwordEl.classList.remove("password-masked");
      showToast("✓ Password shown", "success", 2500);
    }
  });
  passwordWrapper.appendChild(passwordStrong);
  passwordWrapper.appendChild(passwordToggle);
  passwordItem.appendChild(passwordSmall);
  passwordItem.appendChild(passwordWrapper);
  credentialsGrid.appendChild(passwordItem);
  
  credentialsSection.appendChild(credentialsGrid);
  
  // Button container for credentials actions
  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("credentials-buttons-container");
  
  // Copy credentials button
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.classList.add("credentials-copy-btn");
  copyBtn.innerHTML = '<span style="display:flex; align-items:center; gap:0.5rem;"><svg viewBox="0 0 24 24" width="16" height="16" style="fill: currentColor;"><path d="M16 4H2v14h2V6h12V4zm3-2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h13v16z"></path></svg>Copy Username</span>';
  copyBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const username = String(row.username ?? "-");
    copyPatientCredentials(username);
  });
  buttonsContainer.appendChild(copyBtn);
  
  credentialsSection.appendChild(buttonsContainer);
  card.appendChild(credentialsSection);

  cellSpan.appendChild(card);
  inlineRow.appendChild(cellSpan);

  // Insert the inline row after the selected patient row
  const selectedRow = document.querySelector("tbody tr.selected");
  if (selectedRow && selectedRow.nextSibling) {
    tableBody.insertBefore(inlineRow, selectedRow.nextSibling);
  } else if (selectedRow) {
    tableBody.appendChild(inlineRow);
  }
}

function closePatientDetails() {
  if (patientDetailsPanel) {
    patientDetailsPanel.hidden = true;
  }
  state.selectedIndex = null;
  state.selectedRowRef = null;
}

function isEditableFieldKey(key) {
  const blocked = new Set(["id", "created_at", "updated_at", "timestamp", "record_id", "user_id"]);
  return !blocked.has(String(key).toLowerCase());
}

function humanizeFieldLabel(key) {
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSelectOptionsForField(fieldKey) {
  const key = String(fieldKey).toLowerCase();
  if (key === "status") return ["SCHEDULED", "COMPLETED", "CANCELLED", "PENDING", "PAID", "OVERDUE"];
  if (key === "payment_status") return ["PENDING", "PAID", "OVERDUE"];
  if (key === "role") return ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];
  if (key === "gender") return ["MALE", "FEMALE", "OTHER"];
  return null;
}

function castDynamicValue(rawValue, oldValue, fieldKey) {
  const value = String(rawValue ?? "").trim();
  const key = String(fieldKey).toLowerCase();

  if (typeof oldValue === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : oldValue;
  }

  if (key === "status" || key === "payment_status" || key === "role" || key === "gender") {
    return value.toUpperCase();
  }

  return value;
}

function semanticTypeForFieldValue(fieldKey, value) {
  const key = String(fieldKey || "").toLowerCase();
  const text = String(value || "").trim().toLowerCase();

  if (key === "status" || key === "payment_status" || key === "action") {
    return semanticTypeFromStatus(text);
  }

  if (key === "role") {
    if (text === "admin") return "warning";
    if (text === "doctor") return "info";
    if (text === "nurse") return "success";
    return "neutral";
  }

  if (key === "gender") {
    if (text === "male") return "gender-male";
    if (text === "female") return "gender-female";
    if (text === "other") return "gender-other";
    return "neutral";
  }

  return "neutral";
}

function semanticMeaningForFieldValue(fieldKey, value) {
  const key = String(fieldKey || "").toLowerCase();
  const text = String(value || "").trim().toLowerCase();

  if (!text) {
    if (key === "gender") return "Select a gender option";
    if (key === "status") return "Select current workflow status";
    if (key === "payment_status") return "Select payment state";
    if (key === "role") return "Select account access role";
    return "Select an option";
  }

  if (key === "status") {
    if (text === "completed") return "Completed: task done";
    if (text === "scheduled") return "Scheduled: upcoming";
    if (text === "cancelled") return "Cancelled: stopped";
  }

  if (key === "payment_status") {
    if (text === "paid") return "Paid: settled";
    if (text === "pending") return "Pending: awaiting payment";
    if (text === "overdue") return "Overdue: requires urgent follow-up";
  }

  if (key === "role") {
    if (text === "admin") return "Admin: full access";
    if (text === "doctor") return "Doctor: clinical access";
    if (text === "nurse") return "Nurse: care workflow access";
    if (text === "receptionist") return "Receptionist: front-desk access";
  }

  if (key === "gender") {
    if (text === "male") return "Male";
    if (text === "female") return "Female";
    if (text === "other") return "Other";
  }

  return "Status meaning shown by color";
}

function semanticLabelFromType(semanticType) {
  if (semanticType === "success") return "Green - Success";
  if (semanticType === "info") return "Blue - In Progress";
  if (semanticType === "warning") return "Amber - Attention";
  if (semanticType === "danger") return "Red - Critical";
  if (semanticType === "gender-male") return "Blue - Male";
  if (semanticType === "gender-female") return "Pink - Female";
  if (semanticType === "gender-other") return "Teal - Other";
  return "Gray - Neutral";
}

function applyGenderSelectInlineStyle(selectEl, semanticType) {
  if (!selectEl) return;

  if (semanticType === "gender-male") {
    selectEl.style.setProperty("background-color", "#e8f3ff", "important");
    selectEl.style.setProperty("color", "#174786", "important");
    selectEl.style.setProperty("border-color", "#5A9BD5", "important");
    return;
  }

  if (semanticType === "gender-female") {
    selectEl.style.setProperty("background-color", "#ffe8f2", "important");
    selectEl.style.setProperty("color", "#a72d62", "important");
    selectEl.style.setProperty("border-color", "#ff7bb0", "important");
    return;
  }

  if (semanticType === "gender-other") {
    selectEl.style.setProperty("background-color", "#e7f7f5", "important");
    selectEl.style.setProperty("color", "#0d5b56", "important");
    selectEl.style.setProperty("border-color", "#4DB6AC", "important");
    return;
  }

  selectEl.style.removeProperty("background-color");
  selectEl.style.removeProperty("color");
  selectEl.style.removeProperty("border-color");
}

function applyGenderHelperInlineStyle(helperEl, semanticType) {
  if (!helperEl) return;

  if (semanticType === "gender-male") {
    helperEl.style.setProperty("color", "#174786", "important");
    helperEl.style.setProperty("background-color", "#e8f3ff", "important");
    helperEl.style.setProperty("border-color", "#5A9BD5", "important");
    return;
  }

  if (semanticType === "gender-female") {
    helperEl.style.setProperty("color", "#a72d62", "important");
    helperEl.style.setProperty("background-color", "#ffe8f2", "important");
    helperEl.style.setProperty("border-color", "#ff7bb0", "important");
    return;
  }

  if (semanticType === "gender-other") {
    helperEl.style.setProperty("color", "#0d5b56", "important");
    helperEl.style.setProperty("background-color", "#e7f7f5", "important");
    helperEl.style.setProperty("border-color", "#4DB6AC", "important");
    return;
  }

  helperEl.style.removeProperty("color");
  helperEl.style.removeProperty("background-color");
  helperEl.style.removeProperty("border-color");
}

function wireSelectChoiceChip(selectEl, contextLabel = "Selection", hostEl = null) {
  if (!selectEl) return;
  const host = hostEl || selectEl.closest("label");
  if (!host) return;
  host.classList.add("label-has-select");
  selectEl.classList.add("select-interactive");

  let chip = host.querySelector(".select-choice-chip");
  if (!chip) {
    chip = document.createElement("small");
    chip.className = "select-choice-chip";
    const helperNode = host.querySelector(".semantic-helper");
    if (helperNode) {
      host.insertBefore(chip, helperNode);
    } else {
      host.appendChild(chip);
    }
  }

  const update = () => {
    const hasValue = String(selectEl.value || "").trim().length > 0;
    const selectedLabel = selectEl.options?.[selectEl.selectedIndex]?.textContent?.trim() || "";
    const optionCount = Math.max(0, (selectEl.options?.length || 0) - 1);

    selectEl.classList.toggle("select-empty", !hasValue);
    selectEl.classList.toggle("select-filled", hasValue);

    chip.classList.toggle("is-empty", !hasValue);
    chip.classList.toggle("is-filled", hasValue);
    chip.classList.remove("pulse");
    void chip.offsetWidth;
    chip.classList.add("pulse");
    chip.textContent = hasValue
      ? `${contextLabel}: ${selectedLabel}  (${optionCount} options)`
      : `${contextLabel}: No selection yet  (${optionCount} options)`;
  };

  if (selectEl.dataset.choiceChipBound !== "1") {
    selectEl.addEventListener("change", update);
    selectEl.addEventListener("blur", update);
    selectEl.addEventListener("focus", () => selectEl.classList.add("select-active"));
    selectEl.addEventListener("blur", () => selectEl.classList.remove("select-active"));
    selectEl.dataset.choiceChipBound = "1";
  }

  update();
}

function setRealtimeHint(helperEl, semanticType, message) {
  if (!helperEl) return;

  helperEl.classList.remove(
    "semantic-helper-success",
    "semantic-helper-info",
    "semantic-helper-warning",
    "semantic-helper-danger",
    "semantic-helper-neutral"
  );

  helperEl.classList.add(`semantic-helper-${semanticType}`);
  helperEl.textContent = message;
}

function renderRealtimeDoctorOptions(doctors, preferredDoctorName = "", preferredDoctorId = "") {
  if (!entryPatientDoctor) return;

  const prevValue = String(preferredDoctorId || entryPatientDoctor.value || "").trim();
  const prevName = String(preferredDoctorName || "").trim().toLowerCase();
  entryPatientDoctor.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "-- Select Active Doctor --";
  entryPatientDoctor.appendChild(placeholder);

  doctors.forEach((doctor) => {
    const option = document.createElement("option");
    const idValue = String(doctor.id ?? "").trim();
    const fullName = String(doctor.full_name ?? "").trim();
    const specialty = String(doctor.specialty ?? "").trim();
    option.value = idValue;
    option.dataset.name = fullName;
    option.textContent = specialty ? `${fullName} - ${specialty}` : fullName;
    entryPatientDoctor.appendChild(option);
  });

  if (prevValue) {
    const exists = [...entryPatientDoctor.options].some((opt) => opt.value === prevValue);
    if (exists) {
      entryPatientDoctor.value = prevValue;
      return;
    }
  }

  if (prevName) {
    const match = [...entryPatientDoctor.options].find(
      (opt) => String(opt.dataset.name || "").trim().toLowerCase() === prevName
    );
    if (match) {
      entryPatientDoctor.value = match.value;
    }
  }
}

function renderRealtimeWardOptions(wards, preferredWardName = "", preferredWardId = "") {
  if (!entryPatientWard) return;

  const prevValue = String(preferredWardId || entryPatientWard.value || "").trim();
  const prevName = String(preferredWardName || "").trim().toLowerCase();
  entryPatientWard.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "-- Select Available Ward --";
  entryPatientWard.appendChild(placeholder);

  wards.forEach((ward) => {
    const option = document.createElement("option");
    const idValue = String(ward.id ?? "").trim();
    const wardName = String(ward.ward_name ?? "").trim();
    const availableBeds = Number(ward.available_beds ?? 0);
    option.value = idValue;
    option.dataset.name = wardName;
    option.textContent = `${wardName} (${availableBeds} available)`;
    entryPatientWard.appendChild(option);
  });

  if (prevValue) {
    const exists = [...entryPatientWard.options].some((opt) => opt.value === prevValue);
    if (exists) {
      entryPatientWard.value = prevValue;
      return;
    }
  }

  if (prevName) {
    const match = [...entryPatientWard.options].find(
      (opt) => String(opt.dataset.name || "").trim().toLowerCase() === prevName
    );
    if (match) {
      entryPatientWard.value = match.value;
    }
  }
}

async function refreshPatientRealtimeOptions(context = {}) {
  if (!entryPatientDoctor || !entryPatientWard) return;

  const doctorName = String(context.doctorName ?? "").trim();
  const doctorId = String(context.doctorId ?? "").trim();
  const wardName = String(context.wardName ?? "").trim();
  const wardId = String(context.wardId ?? "").trim();

  try {
    // Use cache busting for fresh doctor and ward lists
    const payload = await fetchJson("api.php?action=patient_form_options", { cacheBust: true });
    const doctors = Array.isArray(payload?.doctors) ? payload.doctors : [];
    const wards = Array.isArray(payload?.availableWards) ? payload.availableWards : [];

    renderRealtimeDoctorOptions(doctors, doctorName, doctorId);
    renderRealtimeWardOptions(wards, wardName, wardId);

    wireSelectChoiceChip(entryPatientDoctor, "Doctor", entryPatientDoctor.closest("label"));
    wireSelectChoiceChip(entryPatientWard, "Ward", entryPatientWard.closest("label"));

    const updatedAt = payload?.generatedAt ? new Date(payload.generatedAt) : null;
    const updatedText = updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt.toLocaleTimeString() : "now";
    setRealtimeHint(entryPatientDoctorHint, "info", `${doctors.length} active doctors synced (${updatedText})`);
    setRealtimeHint(entryPatientWardHint, wards.length > 0 ? "success" : "warning", `${wards.length} available wards synced (${updatedText})`);
  } catch (error) {
    setRealtimeHint(entryPatientDoctorHint, "warning", "Doctor list sync failed. Retry by reopening modal.");
    setRealtimeHint(entryPatientWardHint, "warning", "Ward availability sync failed. Retry by reopening modal.");
  }
}

function stopPatientRealtimeOptionsSync() {
  if (!patientRealtimeTimer) return;
  window.clearInterval(patientRealtimeTimer);
  patientRealtimeTimer = null;
}

function startPatientRealtimeOptionsSync(context = {}) {
  stopPatientRealtimeOptionsSync();
  refreshPatientRealtimeOptions(context);
  // === IMPROVED REAL-TIME: Reduced from 15 seconds to 8 seconds ===
  patientRealtimeTimer = window.setInterval(() => {
    refreshPatientRealtimeOptions();
  }, 8000); // Now refreshes every 8 seconds instead of 15
}

function stopDashboardRealtimeSync() {
  if (!dashboardRealtimeTimer) return;
  window.clearInterval(dashboardRealtimeTimer);
  dashboardRealtimeTimer = null;
}

function startDashboardRealtimeSync() {
  stopDashboardRealtimeSync();
  // === IMPROVED REAL-TIME: Reduced from 20 seconds to 5 seconds ===
  dashboardRealtimeTimer = window.setInterval(() => {
    if (document.hidden) return; // Don't refresh if tab is hidden
    if (entryModal && !entryModal.hidden) return; // Don't refresh if edit modal is open
    loadOverview();
    loadModuleData();
  }, 5000); // Now refreshes every 5 seconds instead of 20
}

// === NEW: Analytics auto-refresh (only when viewing analytics) ===
function stopAnalyticsRealtimeSync() {
  if (!analyticsRealtimeTimer) return;
  window.clearInterval(analyticsRealtimeTimer);
  analyticsRealtimeTimer = null;
}

function startAnalyticsRealtimeSync() {
  stopAnalyticsRealtimeSync();
  // Refresh analytics every 6 seconds when viewing the analytics module
  analyticsRealtimeTimer = window.setInterval(() => {
    if (document.hidden) return; // Don't refresh if tab is hidden
    if (!isAnalyticsModule()) {
      stopAnalyticsRealtimeSync(); // Stop if user switched away from analytics
      return;
    }
    console.log("[REAL-TIME] Auto-refreshing analytics...");
    loadAnalyticsData();
  }, 6000); // Refresh every 6 seconds for real-time data
}

function applySemanticSelectClass(selectEl, fieldKey) {
  if (!selectEl) return;
  const semanticType = semanticTypeForFieldValue(fieldKey, selectEl.value);
  selectEl.classList.remove(
    "semantic-select-success",
    "semantic-select-info",
    "semantic-select-warning",
    "semantic-select-danger",
    "semantic-select-neutral",
    "semantic-select-gender-male",
    "semantic-select-gender-female",
    "semantic-select-gender-other"
  );
  selectEl.classList.add("semantic-select", `semantic-select-${semanticType}`);
  applyGenderSelectInlineStyle(selectEl, semanticType);
}

function buildSemanticLegend() {
  const legend = document.createElement("div");
  legend.className = "semantic-legend";
  legend.innerHTML = `
    <span class="semantic-chip semantic-chip-success">Green: Success / Done</span>
    <span class="semantic-chip semantic-chip-info">Blue: In Progress / Scheduled</span>
    <span class="semantic-chip semantic-chip-warning">Amber: Attention Needed</span>
    <span class="semantic-chip semantic-chip-danger">Red: Critical / Overdue</span>
    <span class="semantic-chip semantic-chip-neutral">Gray: Neutral Info</span>
  `;
  return legend;
}

function wireSemanticHelper(selectEl, helperEl, fieldKey) {
  if (!selectEl || !helperEl) return;
  const update = () => {
    const semanticType = semanticTypeForFieldValue(fieldKey, selectEl.value);
    const semanticLabel = semanticLabelFromType(semanticType);
    const meaning = semanticMeaningForFieldValue(fieldKey, selectEl.value);
    helperEl.classList.remove(
      "semantic-helper-success",
      "semantic-helper-info",
      "semantic-helper-warning",
      "semantic-helper-danger",
      "semantic-helper-neutral",
      "semantic-helper-gender-male",
      "semantic-helper-gender-female",
      "semantic-helper-gender-other"
    );
    helperEl.classList.add(`semantic-helper-${semanticType}`);
    applyGenderHelperInlineStyle(helperEl, semanticType);
    helperEl.textContent = `${semanticLabel}: ${meaning}`;
    selectEl.title = `${semanticLabel}. ${meaning}`;
  };
  selectEl.addEventListener("change", update);
  update();
}

function updatePatientGenderSemanticHint() {
  if (!entryPatientGender || !entryPatientGenderHint) return;
  applySemanticSelectClass(entryPatientGender, "gender");
  const semanticType = semanticTypeForFieldValue("gender", entryPatientGender.value);
  const semanticLabel = semanticLabelFromType(semanticType);
  const meaning = semanticMeaningForFieldValue("gender", entryPatientGender.value);
  entryPatientGenderHint.classList.remove(
    "semantic-helper-success",
    "semantic-helper-info",
    "semantic-helper-warning",
    "semantic-helper-danger",
    "semantic-helper-neutral",
    "semantic-helper-gender-male",
    "semantic-helper-gender-female",
    "semantic-helper-gender-other"
  );
  entryPatientGenderHint.classList.add(`semantic-helper-${semanticType}`);
  applyGenderHelperInlineStyle(entryPatientGenderHint, semanticType);
  entryPatientGenderHint.textContent = `${semanticLabel}: ${meaning}`;
}

function createDynamicInput(field, value) {
  let input;

  // Special field type: patient picker (select existing + custom name)
  if (field.type === "patient") {
    const container = document.createElement('div');
    container.className = 'patient-picker';

    const select = document.createElement('select');
    select.name = field.key;
    select.dataset.key = field.key;
    select.required = Boolean(field.required);
    select.className = 'patient-select';
    const loadingOption = document.createElement('option');
    loadingOption.value = '';
    loadingOption.textContent = 'Loading patients...';
    select.appendChild(loadingOption);

    const customOption = document.createElement('option');
    customOption.value = '__custom__';
    customOption.textContent = 'Add custom name...';

    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.name = field.key + '_custom';
    customInput.placeholder = field.placeholder || 'Enter patient full name';
    customInput.style.display = 'none';
    customInput.autocomplete = 'off';

    // Populate patients asynchronously
    (async function loadPatients() {
      try {
        const resp = await fetch(`api.php?action=module&module=patients`);
        if (!resp.ok) throw new Error('Failed to load patients');
        const data = await resp.json();
        const rows = Array.isArray(data.rows) ? data.rows : data;
        // Clear previous options
        select.innerHTML = '';
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '-- Select patient --';
        select.appendChild(emptyOpt);
        rows.forEach(r => {
          try {
            const opt = document.createElement('option');
            opt.value = String(r.id || '');
            opt.textContent = String(r.full_name || (`Patient #${r.id || ''}`));
            select.appendChild(opt);
          } catch(e) { /* ignore malformed row */ }
        });
        select.appendChild(customOption);
        // Try to set existing value
        if (value) {
          select.value = String(value) || '';
        }
      } catch (err) {
        // keep loading option
        select.innerHTML = '';
        const fallback = document.createElement('option');
        fallback.value = '';
        fallback.textContent = 'Failed to load patients';
        select.appendChild(fallback);
        select.appendChild(customOption);
      }
    })();

    select.addEventListener('change', function() {
      if (this.value === '__custom__') {
        customInput.style.display = '';
        customInput.required = true;
      } else {
        customInput.style.display = 'none';
        customInput.required = false;
      }
    });

    container.appendChild(select);
    container.appendChild(customInput);
    return container;
  }

  if (field.type === "select") {
    input = document.createElement("select");
    const options = field.options ?? getSelectOptionsForField(field.key) ?? [];
    options.forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      input.appendChild(option);
    });
    input.value = String(value ?? "").toUpperCase();
    applySemanticSelectClass(input, field.key);
    input.addEventListener("change", () => applySemanticSelectClass(input, field.key));
  } else {
    input = document.createElement("input");
    input.type = field.type || "text";
    input.value = String(value ?? "");
    input.placeholder = field.placeholder || `Enter ${field.label || humanizeFieldLabel(field.key)}`;
  }

  input.name = field.key;
  input.dataset.key = field.key;
  input.required = Boolean(field.required);
  input.classList.toggle("input-important", Boolean(field.required));
  input.autocomplete = "off";
  return input;
}

function refreshImportantFieldHighlights() {
  if (!entryForm) return;

  const controls = entryForm.querySelectorAll("input, select, textarea");
  controls.forEach((control) => {
    const isImportant = Boolean(control.required) && !control.disabled;
    const hasValue = String(control.value ?? "").trim().length > 0;

    control.classList.toggle("input-important", isImportant);
    control.classList.toggle("input-important-empty", isImportant && !hasValue);
    control.classList.toggle("input-important-filled", isImportant && hasValue);
  });

  const labels = entryForm.querySelectorAll("label");
  labels.forEach((label) => {
    const importantControl = label.querySelector("input[required]:not([disabled]), select[required]:not([disabled]), textarea[required]:not([disabled])");
    label.classList.toggle("label-important", Boolean(importantControl));
  });
}

function decorateModalFieldHeaders() {
  if (!entryForm) return;

  const labels = entryForm.querySelectorAll("label");
  labels.forEach((label) => {
    if (label.querySelector(":scope > .field-label-head")) return;

    const control = label.querySelector(":scope > input, :scope > select, :scope > textarea");
    if (!control) return;

    const head = document.createElement("div");
    head.className = "field-label-head";

    const nodesToMove = [];
    for (const child of [...label.childNodes]) {
      if (child === control) break;
      if (child.nodeType === Node.TEXT_NODE && !String(child.textContent || "").trim()) {
        continue;
      }
      nodesToMove.push(child);
    }

    nodesToMove.forEach((node) => head.appendChild(node));
    label.insertBefore(head, control);
  });
}

function buildDynamicFields(moduleName, row = null, mode = "edit") {
  if (!entryDynamicFields) return false;

  entryDynamicFields.innerHTML = "";
  const template = getModuleTemplate(moduleName);
  const editableKeys = row && typeof row === "object" ? Object.keys(row).filter(isEditableFieldKey) : [];

  const title = document.createElement("div");
  title.className = "modal-section-title";
  title.textContent = mode === "edit" ? "Edit Details" : "New Record Details";
  entryDynamicFields.appendChild(title);

  const helper = document.createElement("p");
  helper.className = "form-helper";
  helper.textContent = "Use clear, complete values. Required fields are marked by browser validation.";
  entryDynamicFields.appendChild(helper);

  entryDynamicFields.appendChild(buildSemanticLegend());

  if (template && template.length > 0) {
    const sectionMap = new Map();
    template.forEach((field) => {
      const sectionName = field.section || "Details";
      if (!sectionMap.has(sectionName)) {
        const sectionTitle = document.createElement("div");
        sectionTitle.className = "modal-section-title";
        sectionTitle.textContent = sectionName;
        entryDynamicFields.appendChild(sectionTitle);
        sectionMap.set(sectionName, true);
      }

      const label = document.createElement("label");
      label.textContent = field.label || humanizeFieldLabel(field.key);
      const input = createDynamicInput(field, row?.[field.key] ?? "");
      label.appendChild(input);

      if (field.type === "select") {
        wireSelectChoiceChip(input, field.label || humanizeFieldLabel(field.key), label);
        const helperText = document.createElement("small");
        helperText.className = "semantic-helper";
        label.appendChild(helperText);
        wireSemanticHelper(input, helperText, field.key);
      }

      entryDynamicFields.appendChild(label);
    });

    entryDynamicFields.style.display = "grid";
    return true;
  }

  if (editableKeys.length > 0) {
    editableKeys.forEach((key) => {
      const label = document.createElement("label");
      label.textContent = humanizeFieldLabel(key);
      const inferredType = String(key).toLowerCase().includes("date") ? "date" : typeof row[key] === "number" ? "number" : "text";
      const input = createDynamicInput({ key, type: inferredType, required: false }, row[key]);
      label.appendChild(input);

       if (inferredType === "select") {
        const helperText = document.createElement("small");
        helperText.className = "semantic-helper";
        label.appendChild(helperText);
        wireSemanticHelper(input, helperText, key);
      }

      entryDynamicFields.appendChild(label);
    });

    entryDynamicFields.style.display = "grid";
    return true;
  }

  entryDynamicFields.style.display = "none";
  return false;
}

document.querySelectorAll(".module-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    activateModule(btn.dataset.module);
  });
});

if (accountToggle) {
  accountToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleAccountMenu();
  });
}

if (accountMenu) {
  accountMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (accountNotificationsBtn && accountNotificationsPanel) {
  accountNotificationsBtn.addEventListener("click", () => {
    accountNotificationsPanel.hidden = !accountNotificationsPanel.hidden;
  });
}

if (accountThemeBtn) {
  accountThemeBtn.addEventListener("click", () => {
    closeAccountMenu();
    applyThemeMode(!document.body.classList.contains("dark"));
    showToast(document.body.classList.contains("dark") ? "Dark mode enabled." : "Light mode enabled.");
  });
}

if (accountSettingsBtn) {
  accountSettingsBtn.addEventListener("click", async () => {
    closeAccountMenu();

    const user = state.sessionUser;
    if (!user) {
      showToast("Unable to read account profile.");
      return;
    }
    openAccountSettingsModal(user);
  });
}

if (accountSettingsCancelBtn) {
  accountSettingsCancelBtn.addEventListener("click", () => {
    closeAccountSettingsModal();
  });
}

// Account Settings Tab Switching
const sidebarMenuItems = document.querySelectorAll(".sidebar-menu-item");
sidebarMenuItems.forEach(item => {
  item.addEventListener("click", () => {
    const tabName = item.getAttribute("data-tab");
    if (tabName) {
      switchAccountSettingsTab(tabName);
    }
  });
});

// Account Settings Avatar Upload
const accountUploadAvatarBtn = document.getElementById("accountUploadAvatarBtn");
const accountSettingsAvatarFile = document.getElementById("accountSettingsAvatarFile");

if (accountUploadAvatarBtn && accountSettingsAvatarFile) {
  accountUploadAvatarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    accountSettingsAvatarFile.click();
  });
  
  accountSettingsAvatarFile.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file (JPG, PNG, or GIF)");
      return;
    }
    
    // Check file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("File size must be less than 2MB");
      return;
    }
    
    // Read file and convert to data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === "string") {
        // Update avatar display
        const avatarImage = document.getElementById("accountSettingsAvatarImage");
        const avatarFallback = document.getElementById("accountSettingsAvatarFallback");
        
        if (avatarImage) {
          avatarImage.src = dataUrl;
          avatarImage.hidden = false;
        }
        if (avatarFallback) {
          avatarFallback.hidden = true;
        }
        
        // Store the data URL in a temporary variable for form submission
        window.accountAvatarDataUrl = dataUrl;
        
        showToast("✓ Avatar updated (will save with profile changes)");
      }
    };
    reader.readAsDataURL(file);
  });
}

if (accountSettingsModal) {
  accountSettingsModal.addEventListener("click", (event) => {
    if (event.target === accountSettingsModal) {
      closeAccountSettingsModal();
    }
  });
}

if (accountSettingsForm) {
  accountSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = String(accountSettingsFullName?.value || "").trim();
    const email = String(accountSettingsEmail?.value || "").trim();
    const avatarUrl = String(accountSettingsAvatarUrl?.value || "").trim();
    const currentPassword = String(accountSettingsCurrentPassword?.value || "").trim();
    const newPassword = String(accountSettingsNewPassword?.value || "").trim();
    const confirmPassword = String(accountSettingsConfirmPassword?.value || "").trim();

    if (!fullName || !email) {
      showToast("Full name and email are required.");
      return;
    }

    const passwordAttempt = currentPassword !== "" || newPassword !== "" || confirmPassword !== "";
    if (passwordAttempt) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast("Provide current, new, and confirmation passwords.");
        return;
      }

      if (newPassword.length < 8) {
        showToast("New password must be at least 8 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast("New password and confirmation do not match.");
        return;
      }
    }

    try {
      if (accountSettingsSaveBtn) {
        accountSettingsSaveBtn.disabled = true;
        accountSettingsSaveBtn.textContent = "Saving...";
      }

      setAccountStatusIndicator("saving", passwordAttempt ? "Updating account and password..." : "Updating profile...");

      const payload = {
        full_name: fullName,
        email,
        avatar_url: avatarUrl,
        current_password: currentPassword,
        new_password: newPassword,
      };

      // Include avatar data URL if user uploaded a new avatar
      if (window.accountAvatarDataUrl) {
        payload.avatar_data = window.accountAvatarDataUrl;
      }

      const result = await fetchJsonPost("api.php?action=account_update&_t=" + Date.now(), payload);
      state.sessionUser = result.user ?? state.sessionUser;
      updateAccountBanner(state.sessionUser);

      setAccountStatusIndicator("success", passwordAttempt ? "Account and password updated!" : "Profile updated!");
      closeAccountSettingsModal();
      showToast(passwordAttempt ? "Account and password updated." : "Account profile updated.");
    } catch (error) {
      setAccountStatusIndicator("error", error.message);
      showToast(`Account update failed: ${error.message}`);
    } finally {
      if (accountSettingsSaveBtn) {
        accountSettingsSaveBtn.disabled = false;
        accountSettingsSaveBtn.textContent = "Save Changes";
      }
    }
  });
}

document.addEventListener("click", (event) => {
  if (!accountBanner) return;
  if (!accountBanner.contains(event.target)) {
    closeAccountMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAccountSettingsModal();
    closeAccountMenu();
  }
});

syncModuleScrollMode();
toggleAnalyticsModeUI(false);

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    loadOverview();
    loadModuleData();
  });
}

if (themeBtn) {
  const savedTheme = localStorage.getItem("pms-theme");
  const isDarkSaved = savedTheme === "dark";
  applyThemeMode(isDarkSaved);

  themeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const currentlyDark = document.body.classList.contains("dark");
    applyThemeMode(!currentlyDark);
    showToast(document.body.classList.contains("dark") ? "🌙 Dark mode enabled" : "☀️ Light mode enabled");
  });
}

function applyThemeMode(isDarkMode) {
  const dark = Boolean(isDarkMode);
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("pms-theme", dark ? "dark" : "light");

  if (themeBtn) {
    themeBtn.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeBtn.title = dark ? "Switch to light mode" : "Switch to dark mode";
  }

  if (accountThemeBtn) {
    accountThemeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
    accountThemeBtn.title = dark ? "Switch to Light Mode" : "Switch to Dark Mode";

    const icon = accountThemeBtn.querySelector(".menu-icon");
    const label = accountThemeBtn.querySelector("span:last-child");

    if (icon) {
      icon.textContent = dark ? "☀️" : "🌙";
    }

    if (label) {
      label.textContent = dark ? "Switch to Light" : "Switch to Dark";
    }
  }
}

if (contrastBtn) {
  const contrastOn = localStorage.getItem("pms-contrast") === "on";
  if (contrastOn) {
    document.body.classList.add("contrast");
  }

  contrastBtn.addEventListener("click", () => {
    document.body.classList.toggle("contrast");
    localStorage.setItem("pms-contrast", document.body.classList.contains("contrast") ? "on" : "off");
  });
}

if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });
}

if (globalSearchInput) {
  globalSearchInput.addEventListener("input", () => {
    renderRows(getFilteredRows());
  });
}

if (statusFilter) {
  statusFilter.addEventListener("change", () => {
    console.log("DEBUG: Status filter changed to:", statusFilter.value);
    state.selectedIndex = null;
    state.selectedRowRef = null;
    renderRows(getFilteredRows());
    renderPatientDetails(null);
  });
}

if (patientDetailsStatus && patientDetailsStatus.dataset.quickStatusBound !== "1") {
  patientDetailsStatus.addEventListener("click", async (event) => {
    event.stopPropagation();
    const selectedPatient = state.selectedRowRef || null;
    if (!selectedPatient) {
      showToast("Select a patient row first.");
      return;
    }
    await openQuickStatusChangeMenu(selectedPatient, patientDetailsStatus);
  });
  patientDetailsStatus.dataset.quickStatusBound = "1";
}

if (entryPatientGender) {
  entryPatientGender.addEventListener("change", () => {
    updatePatientGenderSemanticHint();
  });
  wireSelectChoiceChip(entryPatientGender, "Gender", entryPatientGender.closest("label"));
}

if (entryPatientStatus) {
  wireSelectChoiceChip(entryPatientStatus, "Status", entryPatientStatus.closest("label"));
}

if (sortToggleBtn) {
  sortToggleBtn.addEventListener("click", () => {
    state.sortAsc = !state.sortAsc;
    updateSortToggleLabel();
    renderRows(getFilteredRows());
    renderPatientDetails(getSelectedRow());
  });
}

if (addBtn) {
  addBtn.addEventListener("click", () => openEntryModal("Add Record"));
}

if (editBtn) {
  editBtn.addEventListener("click", () => {
    if (!state.selectedRowRef) {
      showToast("Select a row first to edit.");
      return;
    }
    openEntryModal("Edit Record", getSelectedRow());
  });
}

if (deleteBtn) {
  deleteBtn.addEventListener("click", async () => {
    if (!state.selectedRowRef) {
      showToast("Select a row first to delete.");
      return;
    }

    const ok = await openConfirm("Delete Record", "Delete selected record? You can undo this action.");
    if (!ok) return;

    const row = getSelectedRow();
    const moduleName = getCurrentModuleName();

    if (isServerWritableModule(moduleName)) {
      try {
        await fetchJsonPost("api.php?action=module_delete", {
          module: moduleName,
          id: row?.id,
        });
        state.undoStack = null;
        if (undoBtn) undoBtn.disabled = true;
        await loadModuleData();
        showToast("Record deleted successfully.");
      } catch (error) {
        showToast(`Delete failed: ${error.message}`);
      }
      return;
    }

    const removeIndex = state.rows.findIndex((item) => item === row);
    if (removeIndex >= 0) {
      state.undoStack = { type: "delete", row, index: removeIndex };
      state.rows.splice(removeIndex, 1);
      state.originalRows = [...state.rows];
      state.selectedIndex = null;
      state.selectedRowRef = null;
      undoBtn.disabled = false;
      renderRows(getFilteredRows());
      showToast("Record deleted. Undo is available.");
    }
  });
}

if (undoBtn) {
  undoBtn.addEventListener("click", () => {
    if (!state.undoStack) return;
    if (state.undoStack.type === "delete") {
      state.rows.splice(state.undoStack.index, 0, state.undoStack.row);
      state.originalRows = [...state.rows];
      renderRows(getFilteredRows());
      showToast("Undo complete. Record restored.");
    }
    state.undoStack = null;
    undoBtn.disabled = true;
  });
}

entryForm?.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.id === "entryCancel") {
    closeEntryModal();
  }
});

if (entryForm) {
  entryForm.addEventListener("input", () => refreshImportantFieldHighlights());
  entryForm.addEventListener("change", () => refreshImportantFieldHighlights());
  entryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const moduleName = (entryModalCard?.dataset?.module || getCurrentModuleName() || "").toLowerCase();
      const formData = new FormData(entryForm);
      const modalMode = String(entryModalCard?.dataset?.mode || "").trim().toLowerCase();
      const rowIdRaw = String(entryModalCard?.dataset?.rowId || "").trim();
      const modalRowId = rowIdRaw !== "" && Number.isFinite(Number(rowIdRaw)) ? Number(rowIdRaw) : null;
      const isEdit = modalMode === "edit" || modalRowId !== null;

      // Handle Appointments Module
      if (moduleName === "appointments") {
        console.log("[APPOINTMENT_SUBMIT] isEdit:", isEdit, "modalRowId:", modalRowId);
        
        // Helper function to get field value from form (try FormData first, then DOM)
        const getFieldValue = (fieldName) => {
          let value = formData.get(fieldName);
          if (!value) {
            // Try reading from DOM elements directly
            const input = entryForm.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
            if (input) {
              value = input.value;
            }
          }
          return String(value || "").trim();
        };
        
        const appointmentData = {
          date: getFieldValue("date"),
          time: getFieldValue("time"),
          patient: getFieldValue("patient"),
          doctor: getFieldValue("doctor"),
          purpose: getFieldValue("purpose"),
          status: (getFieldValue("status") || "PENDING").toUpperCase(),
          notes: getFieldValue("notes"),
        };

        console.log("[APPOINTMENT_SUBMIT] Appointment data from form:", appointmentData);
        console.log("[APPOINTMENT_SUBMIT] FormData keys:", Array.from(formData.keys()));

        // Validate required fields
        if (!appointmentData.date || !appointmentData.time || !appointmentData.patient || !appointmentData.doctor) {
          console.error("[APPOINTMENT_SUBMIT] Validation failed:", {
            date: appointmentData.date ? "OK" : "MISSING",
            time: appointmentData.time ? "OK" : "MISSING",
            patient: appointmentData.patient ? "OK" : "MISSING",
            doctor: appointmentData.doctor ? "OK" : "MISSING",
          });
          showToast("Please fill in date, time, patient, and doctor fields");
          return;
        }

        // Build payload
        const payload = {
          ...appointmentData,
          id: isEdit ? modalRowId : null,
        };

        if (isEdit && !payload.id) {
          showToast("Cannot update appointment: record ID missing.");
          return;
        }

        if (entrySubmitBtn) {
          entrySubmitBtn.disabled = true;
          entrySubmitBtn.textContent = isEdit ? "Saving Changes..." : "Creating Appointment...";
        }

        setEntryStatusIndicator("saving", isEdit ? "Updating appointment..." : "Creating new appointment...");
        
        // Send to API with cache busting
        const response = await fetchJsonPost("api.php?action=appointment_save&_t=" + Date.now(), payload);

        console.log("[APPOINTMENT_SUBMIT] API Response:", response);

        if (!response || !response.appointment) {
          throw new Error("No appointment in response");
        }

        const savedAppointment = response.appointment;
        console.log("[APPOINTMENT_SUBMIT] Saved appointment:", savedAppointment);
        
        // Update local state immediately for real-time changes
        const updatedRow = state.rows.find((row) => Number(row?.id ?? 0) === Number(savedAppointment.id ?? 0)) ?? null;
        
        if (updatedRow) {
          // Update existing appointment
          Object.assign(updatedRow, savedAppointment);
          state.selectedRowRef = updatedRow;
          console.log("[APPOINTMENT_SUBMIT] Updated existing appointment in state");
        } else if (!isEdit) {
          // New appointment - add to state
          state.rows.push(savedAppointment);
          state.selectedRowRef = savedAppointment;
          console.log("[APPOINTMENT_SUBMIT] Added new appointment to state");
        }
        
        // Re-render the appointments dashboard, table, and sidebar calendar
        renderRows(getFilteredRows());
        if (state.module === "appointments") {
          updateAppointmentsSidebar(state.rows);
        }
        
        // Show success
        setEntryStatusIndicator("success", isEdit ? "Appointment updated successfully!" : "Appointment created successfully!");
        
        closeEntryModal();
        showStatus("");
        showToast(isEdit ? "✓ Appointment updated!" : "✓ Appointment created!");
        
        // Background refresh: Load fresh data without blocking UI
        Promise.all([
          loadModuleData().catch(err => console.warn("Background module reload failed:", err)),
          loadOverview().catch(err => console.warn("Background overview reload failed:", err))
        ]).then(() => {
          console.log("[BACKGROUND] Appointment data refreshed successfully");
        });
        
        return;
      }

      // Handle Generic Modules (inventory, billing, doctors, wards, patients)
      if (!isServerWritableModule(moduleName)) {
        console.warn("[FORM_SUBMIT] Unsupported module:", moduleName);
        showToast("This module cannot be edited");
        return;
      }

      if (moduleName === "patients") {
        const selectedByRef = getSelectedRow();
        const selectedById =
          modalRowId === null
            ? null
            : state.rows.find((row) => Number(row?.id ?? 0) === modalRowId) ?? null;
        const selectedRow = selectedById ?? selectedByRef;

        const rowFullName = String(selectedRow?.full_name || "").trim();
        const rowNameParts = rowFullName ? rowFullName.split(/\s+/) : [];
        const rowFirstName = rowNameParts[0] ?? "";
        const rowLastName = rowNameParts.slice(1).join(" ") ?? "";

        const firstName = String(formData.get("patientFirstName") || rowFirstName).trim();
        const lastName = String(formData.get("patientLastName") || rowLastName).trim();
        const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
        const status = String(formData.get("patientStatus") || selectedRow?.status || "ADMITTED").trim().toUpperCase();
        const gender = String(formData.get("patientGender") || selectedRow?.gender || "").trim().toUpperCase();
        const dob = String(formData.get("patientDob") || selectedRow?.dob || "").trim();
        const contact = String(formData.get("patientContact") || selectedRow?.contact || "").trim();
        const medicalHistory = String(formData.get("patientMedicalHistory") || selectedRow?.medical_history || "").trim();
        const doctorIdRaw = String(formData.get("patientDoctor") || "").trim();
        const wardIdRaw = String(formData.get("patientWard") || "").trim();

        if (!isEdit && (!firstName || !lastName)) {
          showToast("First and last name required");
          return;
        }
        if (!isEdit && !gender) {
          showToast("Gender is required");
          return;
        }
        if (!isEdit && !dob) {
          showToast("Date of birth is required");
          return;
        }

        const patientPayload = {
          full_name: fullName,
          status,
          gender,
          dob,
          contact,
          doctor_id: doctorIdRaw !== "" ? Number(doctorIdRaw) : selectedRow?.doctor_id ?? null,
          ward_id: wardIdRaw !== "" ? Number(wardIdRaw) : selectedRow?.ward_id ?? null,
          medical_history: medicalHistory,
        };

        if (isEdit) {
          const rowId = modalRowId ?? selectedRow?.id ?? null;
          if (!rowId) {
            showToast("Cannot update patient: record ID missing.");
            return;
          }
          patientPayload.id = rowId;
        }

        if (entrySubmitBtn) {
          entrySubmitBtn.disabled = true;
          entrySubmitBtn.textContent = isEdit ? "Saving Changes..." : "Saving Record...";
        }

        setEntryStatusIndicator("saving", isEdit ? "Updating patient record..." : "Creating new patient...");

        try {
          const response = await fetchJsonPost("api.php?action=patient_save&_t=" + Date.now(), patientPayload);
          if (!response || !response.patient) {
            throw new Error("No patient in response");
          }

          const savedPatient = response.patient;

          const updatedRow = state.rows.find((row) => Number(row?.id ?? 0) === Number(savedPatient.id ?? 0)) ?? null;
          if (updatedRow) {
            Object.assign(updatedRow, savedPatient);
            state.selectedRowRef = updatedRow;
          } else if (!isEdit) {
            state.rows.push(savedPatient);
            state.selectedRowRef = savedPatient;
          }

          renderRows(getFilteredRows());
          if (state.selectedRowRef) {
            renderPatientDetails(state.selectedRowRef);
          }

          setEntryStatusIndicator("success", isEdit ? "Patient updated successfully!" : "Patient created successfully!");
          closeEntryModal();
          showStatus("");
          showToast(isEdit ? "✓ Updated!" : "✓ Created!");

          Promise.all([
            loadModuleData().catch(err => console.warn("Background module reload failed:", err)),
            loadOverview().catch(err => console.warn("Background overview reload failed:", err)),
            (isAnalyticsModule() ? loadAnalyticsData() : Promise.resolve()).catch(err => console.warn("Background analytics reload failed:", err))
          ]).then(() => {
            console.log("[BACKGROUND] Patient data refreshed successfully");
          });
        } catch (error) {
          console.error("Patient save error:", error);
          setEntryStatusIndicator("error", "Error: " + error.message);
          showToast("Error: " + error.message);
          showStatus("");
        } finally {
          if (entrySubmitBtn) {
            entrySubmitBtn.disabled = false;
            const mode = String(entryModalCard?.dataset?.mode || "").trim().toLowerCase();
            entrySubmitBtn.textContent = mode === "edit" ? "Save Changes" : "Save Record";
          }
        }

        return;
      }

      // Generic module handler
      const template = getModuleTemplate(moduleName);
      if (!template) {
        console.warn("[FORM_SUBMIT] No template for module:", moduleName);
        showToast("Module configuration error");
        return;
      }

      // Collect all form data based on field template
      const formPayload = {};
      let hasError = false;
      const fieldErrors = [];

      template.forEach((field) => {
        const value = formData.get(field.key) ?? "";
        const trimmedValue = String(value).trim();

        // Validate required fields - but only for NEW records (not edits)
        // When editing, users should be able to update individual fields
        // The backend will handle validation of required fields for partial updates
        if (!isEdit && field.required && trimmedValue === "") {
          hasError = true;
          fieldErrors.push(field.label);
        }

        // Type conversion - only include non-empty fields in payload
        if (trimmedValue !== "") {
          if (field.type === "number") {
            formPayload[field.key] = Number(trimmedValue);
          } else if (field.type === "date" || field.type === "time") {
            formPayload[field.key] = trimmedValue;
          } else {
            formPayload[field.key] = trimmedValue;
          }
        }
      });

      // Special handling for billing patient field: convert select/custom into patient_id or patient name
      if (moduleName === 'billing') {
        // If formPayload.patient exists and is a numeric id -> move to patient_id
        if (Object.prototype.hasOwnProperty.call(formPayload, 'patient')) {
          const raw = String(formPayload.patient || '').trim();
          if (/^\d+$/.test(raw)) {
            formPayload.patient_id = Number(raw);
            delete formPayload.patient;
          } else if (raw === '__custom__') {
            // read custom text input
            const custom = String(formData.get('patient_custom') || '').trim();
            if (!custom) {
              showToast('Please enter patient name');
              return;
            }
            formPayload.patient = custom;
          } else if (raw !== '') {
            // treat as name string
            formPayload.patient = raw;
          }
        }
      }

      if (hasError) {
        showToast("Required fields missing: " + fieldErrors.join(", "));
        return;
      }

      // Add ID if editing
      if (isEdit) {
        const selectedByRef = getSelectedRow();
        const selectedById =
          modalRowId === null
            ? null
            : state.rows.find((row) => Number(row?.id ?? 0) === modalRowId) ?? null;
        const selectedRow = selectedById ?? selectedByRef;

        const rowId = modalRowId ?? selectedRow?.id ?? null;
        if (!rowId) {
          showToast("Cannot update record: ID missing");
          return;
        }
        formPayload.id = rowId;
      }

      if (entrySubmitBtn) {
        entrySubmitBtn.disabled = true;
        entrySubmitBtn.textContent = isEdit ? "Saving Changes..." : "Creating Record...";
      }

      setEntryStatusIndicator("saving", isEdit ? "Updating " + moduleName + "..." : "Creating " + moduleName + "...");

      try {
        // Send to API with proper payload structure expected by module_save endpoint
        const apiPayload = {
          module: moduleName,
          payload: formPayload
        };
        const response = await fetchJsonPost("api.php?action=module_save&_t=" + Date.now(), apiPayload);

        if (!response || !response.row) {
          throw new Error("No record in response");
        }

        const savedRecord = response.row;
        console.log("[FORM_SUBMIT] Saved " + moduleName + " record:", savedRecord);

        // Update local state immediately
        const updatedRow = state.rows.find((row) => Number(row?.id ?? 0) === Number(savedRecord.id ?? 0)) ?? null;

        if (updatedRow) {
          Object.assign(updatedRow, savedRecord);
          state.selectedRowRef = updatedRow;
        } else if (!isEdit) {
          state.rows.push(savedRecord);
          state.selectedRowRef = savedRecord;
        }

        renderRows(getFilteredRows());
        setEntryStatusIndicator("success", isEdit ? "Record updated successfully!" : "Record created successfully!");
        closeEntryModal();
        showStatus("");
        showToast(isEdit ? "✓ " + moduleName + " updated!" : "✓ " + moduleName + " created!");

        // Background refresh
        Promise.all([
          loadModuleData().catch(err => console.warn("Background module reload failed:", err)),
          loadOverview().catch(err => console.warn("Background overview reload failed:", err))
        ]).then(() => {
          console.log("[BACKGROUND] " + moduleName + " data refreshed successfully");
        });

      } catch (error) {
        console.error("Form save error:", error);
        setEntryStatusIndicator("error", "Error: " + error.message);
        showToast("Error: " + error.message);
        showStatus("");
      } finally {
        if (entrySubmitBtn) {
          entrySubmitBtn.disabled = false;
          const mode = String(entryModalCard?.dataset?.mode || "").trim().toLowerCase();
          entrySubmitBtn.textContent = mode === "edit" ? "Save Changes" : "Save Record";
        }
      }

      return;

      // ============= SECTION BELOW IS NOW LEGACY (preserved for reference) =============
      // The generic module handler above replaces the module-specific code below
      // But we continue with patient-specific code as fallback

      const selectedByRef = getSelectedRow();
      const selectedById =
        modalRowId === null
          ? null
          : state.rows.find((row) => Number(row?.id ?? 0) === modalRowId) ?? null;
      const selectedRow = selectedById ?? selectedByRef;

      const rowFullName = String(selectedRow?.full_name || "").trim();
      const rowNameParts = rowFullName ? rowFullName.split(/\s+/) : [];
      const rowFirstName = rowNameParts[0] ?? "";
      const rowLastName = rowNameParts.slice(1).join(" ") ?? "";

      const firstName = String(formData.get("patientFirstName") || rowFirstName).trim();
      const lastName = String(formData.get("patientLastName") || rowLastName).trim();
      const status = String(formData.get("patientStatus") || selectedRow?.status || "").trim().toUpperCase();
      const gender = String(formData.get("patientGender") || selectedRow?.gender || "").trim().toUpperCase();
      const dob = String(formData.get("patientDob") || selectedRow?.dob || "").trim();
      const contact = String(formData.get("patientContact") || selectedRow?.contact || "").trim();
      const medicalHistory = String(formData.get("patientMedicalHistory") || selectedRow?.medical_history || "").trim();

      // === DEBUG: Log all form data before submission ===
      console.log("[FORM_SUBMIT] === COMPREHENSIVE DEBUG ===");
      console.log("[FORM_SUBMIT] isEdit:", isEdit);
      console.log("[FORM_SUBMIT] modalRowId:", modalRowId);
      console.log("[FORM_SUBMIT] selectedRow ID:", selectedRow?.id);
      console.log("[FORM_SUBMIT] selectedRow.status (BEFORE form change):", selectedRow?.status);
      console.log("[FORM_SUBMIT] formData.get('patientStatus') (FROM FORM):", formData.get("patientStatus"));
      console.log("[FORM_SUBMIT] Final status value being sent:", status);
      console.log("[FORM_SUBMIT] entryPatientStatus select element value:", entryPatientStatus?.value);
      console.log("[FORM_SUBMIT] HTML form field check:", {
        firstNameField: entryPatientFirstName?.value,
        lastNameField: entryPatientLastName?.value,
        statusField: entryPatientStatus?.value,
        dobField: entryPatientDob?.value,
        genderField: entryPatientGender?.value,
      });

      if (!firstName || !lastName) {
        showToast("First and last name required");
        return;
      }
      if (!gender) {
        showToast("Gender is required");
        return;
      }
      if (!dob) {
        showToast("Date of birth is required");
        return;
      }
      if (!status) {
        showToast("Status is required");
        return;
      }

      const doctorIdRaw = String(formData.get("patientDoctor") || "").trim();
      const wardIdRaw = String(formData.get("patientWard") || "").trim();
      const payload = {
        full_name: firstName + " " + lastName,
        status: status,
        gender: gender,
        dob: dob,
        contact: contact,
        doctor_id: doctorIdRaw !== "" ? Number(doctorIdRaw) : selectedRow?.doctor_id ?? null,
        ward_id: wardIdRaw !== "" ? Number(wardIdRaw) : selectedRow?.ward_id ?? null,
        medical_history: medicalHistory,
      };

      if (isEdit) {
        payload.id = modalRowId ?? selectedRow?.id ?? null;
        if (!payload.id) {
          showToast("Cannot update patient: record ID missing.");
          return;
        }
      }

      // === DEBUG: Log the complete payload before sending ===
      console.log("[FORM_SUBMIT] FINAL PAYLOAD being sent to API:", payload);

      if (isEdit && payload.id === null) {
        showToast("Cannot update patient: record ID missing.");
        return;
      }

      if (entrySubmitBtn) {
        entrySubmitBtn.disabled = true;
        entrySubmitBtn.textContent = isEdit ? "Saving Changes..." : "Saving Record...";
      }

      setEntryStatusIndicator("saving", isEdit ? "Updating patient record..." : "Creating new patient...");
      
      // Use cache busting for save operation to ensure fresh response
      const response = await fetchJsonPost("api.php?action=patient_save&_t=" + Date.now(), payload);

      // === VERIFY RESPONSE: Check that returned data matches what was sent ===
      console.log("[FORM_SUBMIT] API Response received:", response);

      if (!response || !response.patient) {
        throw new Error("No patient in response");
      }

      const savedPatient = response.patient;
      console.log("[FORM_SUBMIT] Saved patient from API:", savedPatient);
      console.log("[FORM_SUBMIT] Saved patient status:", savedPatient.status);
      
      // ====== DATA VERIFICATION: Confirm critical fields match what we sent ======
      const sentStatus = String(payload.status || "").toUpperCase();
      const savedStatus = String(savedPatient.status || "").toUpperCase();
      const sentName = String(payload.full_name || "").trim();
      const savedName = String(savedPatient.full_name || "").trim();
      
      if (sentStatus !== savedStatus) {
        console.warn("[VERIFY] STATUS MISMATCH: sent=" + sentStatus + " saved=" + savedStatus);
        showToast("⚠ Warning: Status may not have saved correctly. Refreshing...", "warning");
      }
      if (sentName !== savedName) {
        console.warn("[VERIFY] NAME MISMATCH: sent=" + sentName + " saved=" + savedName);
        showToast("⚠ Warning: Name may not have saved correctly. Refreshing...", "warning");
      }

      if (statusFilter) statusFilter.value = "all";
      
      // === OPTIMIZATION: Update local state immediately instead of reloading all data ===
      const updatedRow = state.rows.find((row) => Number(row?.id ?? 0) === Number(savedPatient.id ?? 0)) ?? null;
      
      if (updatedRow) {
        // Update existing row with saved data
        Object.assign(updatedRow, savedPatient);
        state.selectedRowRef = updatedRow;
      } else if (!isEdit) {
        // New record - add to state
        state.rows.push(savedPatient);
        state.selectedRowRef = savedPatient;
      }
      
      // Re-render table with optimistic update
      renderRows(getFilteredRows());
      renderPatientDetails(state.selectedRowRef || updatedRow || savedPatient);
      
      // Show success indicator
      setEntryStatusIndicator("success", isEdit ? "Patient updated successfully!" : "Patient created successfully!");
      
      closeEntryModal();
      showStatus("");
      showToast(isEdit ? "✓ Updated!" : "✓ Created!");
      
      // === Background refresh: Load fresh data in parallel without blocking UI ===
      // This keeps UI responsive while still syncing data in the background
      Promise.all([
        loadModuleData().catch(err => console.warn("Background module reload failed:", err)),
        loadOverview().catch(err => console.warn("Background overview reload failed:", err)),
        (isAnalyticsModule() ? loadAnalyticsData() : Promise.resolve()).catch(err => console.warn("Background analytics reload failed:", err))
      ]).then(() => {
        console.log("[BACKGROUND] All data refreshed successfully");
      });
      
    } catch (error) {
      console.error("Form save error:", error);
      setEntryStatusIndicator("error", "Error: " + error.message);
      showToast("Error: " + error.message);
      showStatus("");
    } finally {
      if (entrySubmitBtn) {
        entrySubmitBtn.disabled = false;
        const mode = String(entryModalCard?.dataset?.mode || "").trim().toLowerCase();
        entrySubmitBtn.textContent = mode === "edit" ? "Save Changes" : "Save Record";
      }
    }
  });
}

if (confirmNo) {
  confirmNo.addEventListener("click", () => resolveConfirm(false));
}

if (confirmYes) {
  confirmYes.addEventListener("click", () => resolveConfirm(true));
}

if (walkStartBtn) {
  walkStartBtn.addEventListener("click", () => startWalkthrough());
}

if (walkSkipBtn) {
  walkSkipBtn.addEventListener("click", () => stopWalkthrough());
}

if (walkNextBtn) {
  walkNextBtn.addEventListener("click", () => {
    walkIndex += 1;
    if (walkIndex >= walkSteps.length) {
      stopWalkthrough();
      localStorage.setItem("pms-walkthrough-done", "yes");
      return;
    }
    renderWalkStep();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key.toLowerCase() === "r") {
    event.preventDefault();
    loadOverview();
    loadModuleData();
  }
  if (event.altKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.altKey && event.key.toLowerCase() === "n") {
    event.preventDefault();
    openEntryModal("Add Record");
  }
});

searchInput.addEventListener("input", () => {
  renderRows(getFilteredRows());
});

if (analyticsApplyFilters) {
  analyticsApplyFilters.addEventListener("click", () => {
    loadAnalyticsData();
  });
}

if (analyticsResetFilters) {
  analyticsResetFilters.addEventListener("click", () => {
    resetAnalyticsFilters();
    loadAnalyticsData();
  });
}

if (analyticsRecentSearch) {
  analyticsRecentSearch.addEventListener("input", () => {
    applyAnalyticsLocalFilters();
  });
}

if (analyticsHighRiskSort) {
  analyticsHighRiskSort.addEventListener("change", () => {
    applyAnalyticsLocalFilters();
  });
}

if (analyticsExportExcel) {
  analyticsExportExcel.addEventListener("click", () => exportAnalyticsCsv());
}

if (analyticsExportPdf) {
  analyticsExportPdf.addEventListener("click", () => exportAnalyticsPdf());
}

if (analyticsQuickAddPatient) {
  analyticsQuickAddPatient.addEventListener("click", () => {
    const patientsBtn = document.querySelector('.module-btn[data-module="patients"]');
    if (patientsBtn instanceof HTMLElement) {
      patientsBtn.click();
      setTimeout(() => openEntryModal("Add Record"), 80);
    }
  });
}

if (analyticsQuickSchedule) {
  analyticsQuickSchedule.addEventListener("click", () => {
    const appointmentsBtn = document.querySelector('.module-btn[data-module="appointments"]');
    if (appointmentsBtn instanceof HTMLElement) {
      appointmentsBtn.click();
      setTimeout(() => openEntryModal("Add Record"), 80);
    }
  });
}

if (analyticsQuickWardStatus) {
  analyticsQuickWardStatus.addEventListener("click", () => {
    const wardsBtn = document.querySelector('.module-btn[data-module="wards"]');
    if (wardsBtn instanceof HTMLElement) {
      wardsBtn.click();
    }
  });
}

async function fetchJson(url, options = {}) {
  // Add cache busting if requested (for real-time data loads)
  const bustedUrl = options.cacheBust ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` : url;
  
  const response = await fetch(bustedUrl, {
    credentials: 'include'
  });
  if (response.status === 401) {
    window.location.href = "index.php";
    throw new Error("Session expired. Please sign in again.");
  }
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

async function fetchJsonPost(url, payload, options = {}) {
  // Add cache busting if requested
  const bustedUrl = options.cacheBust ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` : url;
  
  const response = await fetch(bustedUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify(payload ?? {}),
  });

  if (response.status === 401) {
    window.location.href = "index.php";
    throw new Error("Session expired. Please sign in again.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const details = data && typeof data.error === "string" ? data.error : `Request failed (${response.status})`;
    throw new Error(details);
  }

  return data;
}

function applyModulePermissions(allowedModules) {
  state.allowedModules = allowedModules;
  const buttons = [...document.querySelectorAll(".module-btn")];
  let firstAllowed = null;

  buttons.forEach((btn) => {
    const moduleName = btn.dataset.module;
    const allowed = allowedModules.includes(moduleName);
    btn.style.display = allowed ? "block" : "none";

    if (allowed && firstAllowed === null) {
      firstAllowed = moduleName;
    }
  });

  if (!allowedModules.includes(state.module) && firstAllowed) {
    state.module = firstAllowed;
    const selected = buttons.find((btn) => btn.dataset.module === firstAllowed);
    buttons.forEach((btn) => btn.classList.remove("active"));
    if (selected) {
      selected.classList.add("active");
      const selectedLabel = selected.querySelector("span:last-child");
      moduleTitle.textContent = selectedLabel ? selectedLabel.textContent : selected.textContent;
    }
  }

  refreshStatusFilterOptions();
  toggleAnalyticsModeUI(isAnalyticsModule());
  updateCrudActionLabels();
  if (state.sessionUser) {
    renderRoleShortcutButtons(state.sessionUser.role);
  }
}

function refreshStatusFilterOptions() {
  if (!statusFilter) return;

  const optionSets = {
    patients: [
      ["all", "All statuses"],
      ["ADMITTED", "Admitted"],
      ["CRITICAL", "Critical"],
      ["IN TREATMENT", "In Treatment"],
      ["UNDER OBSERVATION", "Under Observation"],
      ["STABLE", "Stable"],
      ["RECOVERING", "Recovering"],
      ["DISCHARGED", "Discharged"],
      ["FOLLOW-UP REQUIRED", "Follow-up Required"],
      ["SCHEDULED", "Scheduled"],
      ["NO-SHOW", "No-Show"],
    ],
    appointments: [
      ["all", "All statuses"],
      ["scheduled", "Scheduled"],
      ["completed", "Completed"],
      ["cancelled", "Cancelled"],
    ],
    billing: [
      ["all", "All statuses"],
      ["paid", "Paid"],
      ["pending", "Pending"],
      ["overdue", "Overdue"],
    ],
    default: [["all", "All statuses"]],
  };

  const selectedOptions = optionSets[state.module] || optionSets.default;
  statusFilter.innerHTML = selectedOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
  statusFilter.value = "all";
  console.log("DEBUG: Status filter refreshed for module:", state.module, "reset to 'all'");
}

function semanticTypeFromText(text) {
  const value = String(text || "").toLowerCase();
  if (!value) return "info";

  // Danger: errors, failures, authorization issues, deletion, rejection
  if (
    value.includes("error") ||
    value.includes("failed") ||
    value.includes("unauthorized") ||
    value.includes("forbidden") ||
    value.includes("delete") ||
    value.includes("deleted") ||
    value.includes("reject") ||
    value.includes("rejected") ||
    value.includes("could not") ||
    value.includes("cannot")
  ) {
    return "danger";
  }

  // Warning: alerts, cautions, issues, overdue, cancellations, retries
  if (
    value.includes("warning") ||
    value.includes("overdue") ||
    value.includes("cancel") ||
    value.includes("cancelled") ||
    value.includes("retry") ||
    value.includes("retry") ||
    value.includes("caution") ||
    value.includes("alert") ||
    value.includes("issue") ||
    value.includes("not found") ||
    value.includes("missing")
  ) {
    return "warning";
  }

  // Success: confirmations, additions, updates, completions, approvals, creation
  if (
    value.includes("success") ||
    value.includes("successful") ||
    value.includes("added") ||
    value.includes("add") ||
    value.includes("created") ||
    value.includes("create") ||
    value.includes("updated") ||
    value.includes("update") ||
    value.includes("restored") ||
    value.includes("restore") ||
    value.includes("paid") ||
    value.includes("payment") ||
    value.includes("completed") ||
    value.includes("complete") ||
    value.includes("approved") ||
    value.includes("approve") ||
    value.includes("saved") ||
    value.includes("save") ||
    value.includes("✓") ||
    value.includes("saved") ||
    value.includes("confirmed") ||
    value.includes("confirm")
  ) {
    return "success";
  }

  return "info";
}

function semanticTypeFromStatus(value) {
  const text = String(value || "").trim().toUpperCase();
  if (!text) return "neutral";

  // Patient Status Enum Mapping
  if (text === 'CRITICAL') return "danger";
  if (text === 'FOLLOW-UP REQUIRED' || text === 'UNDER OBSERVATION') return "warning";
  if (text === 'STABLE' || text === 'RECOVERING' || text === 'DISCHARGED') return "success";
  if (text === 'ADMITTED' || text === 'IN TREATMENT' || text === 'SCHEDULED') return "info";
  if (text === 'NO-SHOW') return "neutral";

  // Legacy status mapping for backward compatibility
  const lowerText = text.toLowerCase();
  if (["completed", "paid", "create", "created", "update", "updated", "success", "active"].includes(lowerText)) {
    return "success";
  }

  if (["scheduled", "pending", "new", "processing", "in-progress"].includes(lowerText)) {
    return "info";
  }

  if (["cancelled", "canceled", "overdue", "delete", "deleted", "failed", "error"].includes(lowerText)) {
    return "danger";
  }

  if (["warning", "hold", "blocked"].includes(lowerText)) {
    return "warning";
  }

  return "neutral";
}

async function loadSession() {
  const session = await fetchJson("api.php?action=session");
  if (!session.authenticated) {
    window.location.reload();
    return;
  }

  state.sessionUser = session.user ?? null;
  state.csrfToken = String(session.csrfToken || "");
  applyModulePermissions(session.allowedModules ?? []);
  updateAccountBanner(state.sessionUser);
}

function showStatus(message) {
  if (!message) {
    statusBox.className = "status";
    statusBox.style.display = "none";
    statusBox.textContent = "";
    return;
  }
  const type = semanticTypeFromText(message);
  statusBox.className = `status status-${type}`;
  statusBox.style.display = "block";
  statusBox.textContent = message;
}

function showToast(message, typeOrDuration = 3000, duration = null) {
  if (!toast) return;
  
  // Handle both old and new function signatures
  let actualType = 'info';
  let actualDuration = duration || 3000;
  
  if (typeof typeOrDuration === 'string') {
    // New signature: showToast(message, type, duration)
    actualType = typeOrDuration.toLowerCase();
    if (duration !== null) actualDuration = duration;
  } else if (typeof typeOrDuration === 'number') {
    // Old signature: showToast(message, duration)
    actualDuration = typeOrDuration;
    actualType = semanticTypeFromText(message);
  }
  
  // Validate type and default to auto-detection if invalid
  const validTypes = ['success', 'info', 'warning', 'danger'];
  if (!validTypes.includes(actualType)) {
    actualType = semanticTypeFromText(message);
  }
  
  toast.className = `toast toast-${actualType}`;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, actualDuration);
}

async function openQuickStatusChangeMenu(patientRow, statusPillElement) {
  if (state.module !== "patients" || !patientRow) return;

  const statusOptions = [
    "ADMITTED",
    "CRITICAL",
    "IN TREATMENT",
    "UNDER OBSERVATION",
    "STABLE",
    "RECOVERING",
    "DISCHARGED",
    "FOLLOW-UP REQUIRED",
    "SCHEDULED",
    "NO-SHOW",
  ];

  // Create a popup menu for quick status selection
  const currentStatus = String(patientRow.status || "ADMITTED").toUpperCase();
  const otherStatuses = statusOptions.filter((s) => s !== currentStatus);

  if (otherStatuses.length === 0) {
    showToast("No other status options available.");
    return;
  }

  // Create a simple selection dialog
  const menuDiv = document.createElement("div");
  menuDiv.style.position = "fixed";
  menuDiv.style.top = statusPillElement.getBoundingClientRect().top + "px";
  menuDiv.style.left = statusPillElement.getBoundingClientRect().left + "px";
  menuDiv.style.zIndex = "10000";
  menuDiv.style.background = "white";
  menuDiv.style.border = "1px solid #ccc";
  menuDiv.style.borderRadius = "8px";
  menuDiv.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  menuDiv.style.minWidth = "200px";
  menuDiv.style.padding = "4px 0";

  otherStatuses.slice(0, 5).forEach((status) => {
    const option = document.createElement("button");
    option.style.display = "block";
    option.style.width = "100%";
    option.style.padding = "8px 12px";
    option.style.border = "none";
    option.style.background = "transparent";
    option.style.textAlign = "left";
    option.style.cursor = "pointer";
    option.style.fontSize = "0.95rem";
    option.style.color = "#333";
    option.textContent = formatStatusLabel(status);
    option.addEventListener("mouseenter", () => {
      option.style.background = "#f0f0f0";
    });
    option.addEventListener("mouseleave", () => {
      option.style.background = "transparent";
    });
    option.addEventListener("click", async () => {
      document.body.removeChild(menuDiv);
      await updatePatientQuickStatus(patientRow, status);
    });
    menuDiv.appendChild(option);
  });

  // Close menu when clicking elsewhere
  const closeMenu = () => {
    if (document.body.contains(menuDiv)) {
      document.body.removeChild(menuDiv);
    }
    document.removeEventListener("click", closeMenu);
  };

  setTimeout(() => document.addEventListener("click", closeMenu), 0);
  document.body.appendChild(menuDiv);
}

async function updatePatientQuickStatus(patientRow, newStatus) {
  const patientName = patientRow.full_name || "Unknown Patient";

  // Show confirmation for critical status changes
  if (newStatus === "CRITICAL") {
    const confirmed = await openConfirm(
      "Critical Status Assignment",
      `You are assigning CRITICAL status to ${patientName}. This patient needs immediate medical attention. Confirm?`
    );
    if (!confirmed) {
      showToast("Status change cancelled.");
      return;
    }
  }

  // Show confirmation for discharge
  if (newStatus === "DISCHARGED") {
    const confirmed = await openConfirm(
      "Patient Discharge",
      `You are marking ${patientName} as DISCHARGED. Ensure all paperwork and follow-up instructions are complete. Confirm?`
    );
    if (!confirmed) {
      showToast("Discharge cancelled.");
      return;
    }
  }

  try {
    showStatus("Updating patient status...");
    const payload = {
      id: patientRow.id,
      full_name: patientRow.full_name,
      dob: patientRow.dob,
      gender: patientRow.gender,
      contact: patientRow.contact || "",
      doctor_id: patientRow.doctor_id || null,
      ward_id: patientRow.ward_id || null,
      medical_history: patientRow.medical_history || "",
      status: newStatus,
    };

    // Use cache busting for status update
    const saved = await fetchJsonPost("api.php?action=patient_save&_t=" + Date.now(), payload);
    if (!saved || !saved.patient) {
      throw new Error("Server did not return saved patient record");
    }

    // VERIFY: Check that returned status matches what we sent
    const sentStatus = String(newStatus || "").toUpperCase();
    const savedStatus = String(saved.patient.status || "").toUpperCase();
    if (sentStatus !== savedStatus) {
      console.warn("[VERIFY] Quick status update mismatch: sent=" + sentStatus + " saved=" + savedStatus);
      showToast("⚠ Status may not have updated. Refreshing...", "warning");
    }

    // REAL-TIME: Update row data and re-render immediately
    Object.assign(patientRow, saved.patient);
    // Reset status filter to 'all' so the updated patient remains visible
    if (statusFilter) {
      statusFilter.value = "all";
    }
    renderRows(getFilteredRows());
    renderPatientDetails(patientRow);
    
    showStatus("");
    showToast(`Patient status updated to ${formatStatusLabel(newStatus)}`);
    
    // === BACKGROUND REFRESH: Update data in background after showing success ===
    Promise.all([
      loadOverview().catch(err => console.warn("Background overview reload failed:", err)),
      (isAnalyticsModule() ? loadAnalyticsData() : Promise.resolve()).catch(err => console.warn("Background analytics reload failed:", err))
    ]).then(() => {
      console.log("[BACKGROUND] Status update data refreshed");
    });
  } catch (error) {
    showToast(`Status update failed: ${error.message}`);
    showStatus("");
  }
}

function openConfirm(title, message) {
  if (!confirmModal) return Promise.resolve(false);
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmModal.hidden = false;
  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

function resolveConfirm(result) {
  if (!confirmModal) return;
  confirmModal.hidden = true;
  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}

function openEntryModal(title, row = null) {
  if (!entryModal) return;
  const isEditMode = Boolean(row) && title.toLowerCase().includes("edit");
  const moduleName = getCurrentModuleName();
  const moduleLabel = moduleName.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  entryTitle.textContent = isEditMode ? `Edit ${moduleLabel}` : `Add ${moduleLabel}`;
  if (entryModalCard) {
    entryModalCard.dataset.module = moduleName;
    entryModalCard.dataset.mode = isEditMode ? "edit" : "add";
    if (isEditMode && row?.id !== undefined && row?.id !== null && String(row.id).trim() !== "") {
      entryModalCard.dataset.rowId = String(row.id).trim();
    } else {
      delete entryModalCard.dataset.rowId;
    }
  }
  if (entrySubmitBtn) {
    entrySubmitBtn.textContent = isEditMode ? "Save Changes" : "Save Record";
  }
  entryModal.hidden = false;

  const isPatientsPanel = moduleName === "patients";
  const useDynamicMode = !isPatientsPanel && buildDynamicFields(moduleName, row, isEditMode ? "edit" : "add");
  
  // Toggle visibility based on module
  if (entryGenericFields) {
    entryGenericFields.style.display = isPatientsPanel || useDynamicMode ? "none" : "";
  }

  if (entryDynamicFields) {
    entryDynamicFields.style.display = useDynamicMode ? "grid" : "none";
    if (!useDynamicMode) {
      entryDynamicFields.innerHTML = "";
    }
  }
  
  if (entryPatientFields) {
    entryPatientFields.style.display = isPatientsPanel ? "block" : "none";
  }

  const enableGenericFields = !isPatientsPanel && !useDynamicMode;

  if (entryNameInput) {
    entryNameInput.disabled = !enableGenericFields;
    entryNameInput.required = enableGenericFields;
    if (enableGenericFields) {
      entryNameInput.value = row?.name ?? row?.full_name ?? "";
    }
  }

  if (entryNotesInput) {
    entryNotesInput.disabled = !enableGenericFields;
    if (enableGenericFields) {
      entryNotesInput.value = row?.notes ?? row?.medical_history ?? "";
    }
  }

  if (entryPatientFirstName) {
    entryPatientFirstName.disabled = !isPatientsPanel;
    entryPatientFirstName.required = isPatientsPanel;
  }

  if (entryPatientLastName) {
    entryPatientLastName.disabled = !isPatientsPanel;
    entryPatientLastName.required = isPatientsPanel;
  }

  if (entryPatientDob) {
    entryPatientDob.disabled = !isPatientsPanel;
  }

  if (entryPatientGender) {
    entryPatientGender.disabled = !isPatientsPanel;
    entryPatientGender.required = isPatientsPanel;
  }

  if (entryPatientStatus) {
    entryPatientStatus.disabled = !isPatientsPanel;
    entryPatientStatus.required = isPatientsPanel;
  }

  if (entryPatientContact) {
    entryPatientContact.disabled = !isPatientsPanel;
  }

  if (entryPatientDoctor) {
    entryPatientDoctor.disabled = !isPatientsPanel;
  }

  if (entryPatientWard) {
    entryPatientWard.disabled = !isPatientsPanel;
  }

  if (entryPatientMedicalHistory) {
    entryPatientMedicalHistory.disabled = !isPatientsPanel;
  }

  // Populate patient-specific fields
  if (isPatientsPanel && entryPatientFirstName && entryPatientLastName) {
    const fullName = String(row?.full_name ?? "").trim();
    const nameParts = fullName ? fullName.split(/\s+/) : [];
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") ?? "";
    
    entryPatientFirstName.value = firstName;
    entryPatientLastName.value = lastName;
  }

  if (isPatientsPanel && entryPatientGender) {
    const genderValue = String(row?.gender ?? "").toUpperCase();
    entryPatientGender.value = ["MALE", "FEMALE", "OTHER"].includes(genderValue) ? genderValue : "";
    wireSelectChoiceChip(entryPatientGender, "Gender", entryPatientGender.closest("label"));
    updatePatientGenderSemanticHint();
  }

  if (isPatientsPanel && entryPatientStatus) {
    const patientStatus = String(row?.status ?? "ADMITTED").toUpperCase();
    console.log("DEBUG: openEntryModal - Setting status from row.status:", row?.status);
    const allowedStatuses = [
      "ADMITTED",
      "CRITICAL",
      "IN TREATMENT",
      "UNDER OBSERVATION",
      "STABLE",
      "RECOVERING",
      "DISCHARGED",
      "FOLLOW-UP REQUIRED",
      "SCHEDULED",
      "NO-SHOW",
    ];
    entryPatientStatus.value = allowedStatuses.includes(patientStatus) ? patientStatus : "ADMITTED";
    console.log("DEBUG: entryPatientStatus.value set to:", entryPatientStatus.value);
    wireSelectChoiceChip(entryPatientStatus, "Status", entryPatientStatus.closest("label"));
  }

  if (isPatientsPanel && entryPatientDob) {
    entryPatientDob.value = row?.dob ?? "";
  }

  if (isPatientsPanel && entryPatientContact) {
    entryPatientContact.value = row?.contact ?? "";
  }

  if (isPatientsPanel) {
    startPatientRealtimeOptionsSync({
      doctorName: row?.doctor ?? "",
      doctorId: row?.doctor_id ?? "",
      wardName: row?.ward ?? "",
      wardId: row?.ward_id ?? "",
    });
  } else {
    stopPatientRealtimeOptionsSync();
  }

  if (isPatientsPanel && entryPatientMedicalHistory) {
    entryPatientMedicalHistory.value = row?.medical_history ?? row?.notes ?? "";
  }

  decorateModalFieldHeaders();

  const firstVisibleInput = entryForm?.querySelector(
    'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
  );
  refreshImportantFieldHighlights();
  if (firstVisibleInput) {
    firstVisibleInput.focus();
  }
}

// === STATUS INDICATOR MANAGEMENT ===
function setEntryStatusIndicator(state, message = "") {
  if (!entryStatusIndicator) return;
  
  // Remove all state classes
  entryStatusIndicator.classList.remove("entry-status-saving", "entry-status-success", "entry-status-error", "entry-status-hidden");
  
  if (state === "saving") {
    entryStatusIndicator.classList.add("entry-status-saving");
    entryStatusIndicator.querySelector(".status-message").textContent = message || "Saving changes...";
    entryStatusIndicator.style.display = "flex";
  } else if (state === "success") {
    entryStatusIndicator.classList.add("entry-status-success");
    entryStatusIndicator.querySelector(".status-message").textContent = message || "Changes saved successfully!";
    entryStatusIndicator.style.display = "flex";
    // Auto-hide after 2 seconds
    setTimeout(() => {
      entryStatusIndicator.classList.add("entry-status-hidden");
      entryStatusIndicator.style.display = "none";
    }, 2500);
  } else if (state === "error") {
    entryStatusIndicator.classList.add("entry-status-error");
    entryStatusIndicator.querySelector(".status-message").textContent = message || "Failed to save changes";
    entryStatusIndicator.style.display = "flex";
  } else {
    entryStatusIndicator.classList.add("entry-status-hidden");
    entryStatusIndicator.style.display = "none";
  }
}

function setAccountStatusIndicator(state, message = "") {
  if (!accountStatusIndicator) return;
  
  // Remove all state classes
  accountStatusIndicator.classList.remove("entry-status-saving", "entry-status-success", "entry-status-error", "entry-status-hidden");
  
  if (state === "saving") {
    accountStatusIndicator.classList.add("entry-status-saving");
    accountStatusIndicator.querySelector(".status-message").textContent = message || "Saving account changes...";
    accountStatusIndicator.style.display = "flex";
  } else if (state === "success") {
    accountStatusIndicator.classList.add("entry-status-success");
    accountStatusIndicator.querySelector(".status-message").textContent = message || "Account updated successfully!";
    accountStatusIndicator.style.display = "flex";
    // Auto-hide after 2 seconds
    setTimeout(() => {
      accountStatusIndicator.classList.add("entry-status-hidden");
      accountStatusIndicator.style.display = "none";
    }, 2500);
  } else if (state === "error") {
    accountStatusIndicator.classList.add("entry-status-error");
    accountStatusIndicator.querySelector(".status-message").textContent = message || "Failed to update account";
    accountStatusIndicator.style.display = "flex";
  } else {
    accountStatusIndicator.classList.add("entry-status-hidden");
    accountStatusIndicator.style.display = "none";
  }
}

function closeEntryModal() {
  if (!entryModal) return;
  stopPatientRealtimeOptionsSync();
  entryModal.hidden = true;
  if (entryModalCard) {
    delete entryModalCard.dataset.module;
    delete entryModalCard.dataset.mode;
    delete entryModalCard.dataset.rowId;
  }
  entryForm.reset();
  // Ensure status field defaults to ADMITTED after form reset (BUG FIX #1)
  if (entryPatientStatus) {
    entryPatientStatus.value = "ADMITTED";
  }
  if (entryDynamicFields) {
    entryDynamicFields.innerHTML = "";
    entryDynamicFields.style.display = "none";
  }
}

// Event listener for advanced appointment modal overlay click
if (advancedAppointmentModal) {
  advancedAppointmentModal.addEventListener('click', (event) => {
    if (event.target === advancedAppointmentModal || event.target.classList.contains('modal-overlay')) {
      closeAdvancedAppointmentModal();
    }
  });
}

function getSelectedRow() {
  if (!state.selectedRowRef) return null;
  return state.rows.find((row) => row === state.selectedRowRef) ?? null;
}

function startWalkthrough() {
  walkIndex = 0;
  walkthrough.hidden = false;
  renderWalkStep();
}

function stopWalkthrough() {
  walkthrough.hidden = true;
}

function renderWalkStep() {
  const step = walkSteps[walkIndex];
  walkTitle.textContent = step.title;
  walkText.textContent = step.text;
  walkNextBtn.textContent = walkIndex === walkSteps.length - 1 ? "Finish" : "Next";
}

function pickFirstValue(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return String(row[key]);
    }
  }
  return "";
}

function toTitleCase(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRecentItem(row) {
  const title =
    pickFirstValue(row, ["full_name", "patient", "item_name", "ward_name", "username", "name"]) ||
    `Record #${row.id ?? "-"}`;

  const detail =
    pickFirstValue(row, ["specialty", "doctor", "module", "payment_status", "status", "contact"]) ||
    "Updated entry";

  const scheduleDate = pickFirstValue(row, ["date", "expiration_date"]);
  const scheduleTime = pickFirstValue(row, ["time"]);
  const timestamp = pickFirstValue(row, ["created_at", "timestamp"]);

  let meta = "Recent update";
  if (scheduleDate && scheduleTime) {
    meta = `${scheduleDate} ${scheduleTime}`;
  } else if (scheduleDate) {
    meta = scheduleDate;
  } else if (timestamp) {
    meta = timestamp;
  }

  const statusRaw = pickFirstValue(row, ["status", "payment_status", "action"]);
  const tag = statusRaw ? toTitleCase(statusRaw) : "Active";
  const tagClass = `recent-tag-${String(statusRaw || "active").toLowerCase().replace(/[^a-z]+/g, "-")}`;

  return { title, detail, meta, tag, tagClass };
}

function renderRecent(rows) {
  if (!recentList) return;
  recentList.innerHTML = "";

  const label = moduleRecentLabels[state.module] ?? "Recent updates";
  const title = document.createElement("li");
  title.className = "recent-title";
  title.textContent = label;
  recentList.appendChild(title);

  if (!rows.length) {
    const empty = document.createElement("li");
    empty.className = "recent-empty";
    empty.textContent = "No recent activity for this module yet.";
    recentList.appendChild(empty);
    return;
  }

  rows.slice(0, 5).forEach((row) => {
    const itemData = formatRecentItem(row);
    const li = document.createElement("li");
    li.className = "recent-item";

    const head = document.createElement("div");
    head.className = "recent-item-head";

    const name = document.createElement("strong");
    name.className = "recent-item-title";
    name.textContent = itemData.title;

    const tag = document.createElement("span");
    tag.className = `recent-tag ${itemData.tagClass}`;
    tag.textContent = itemData.tag;

    head.appendChild(name);
    head.appendChild(tag);

    const detail = document.createElement("p");
    detail.className = "recent-item-detail";
    detail.textContent = itemData.detail;

    const meta = document.createElement("small");
    meta.className = "recent-item-meta";
    meta.textContent = itemData.meta;

    li.appendChild(head);
    li.appendChild(detail);
    li.appendChild(meta);
    recentList.appendChild(li);
  });
}

function renderChart() {
  // Skip rendering for appointments module - it has its own sidebar calendar
  if (state.module === "appointments") {
    return;
  }

  if (!miniChart || !state.lastOverview) return;
  const metrics = [
    { key: "patients", label: "Patients", value: state.lastOverview.totalPatients },
    { key: "doctors", label: "Doctors", value: state.lastOverview.activeDoctors },
    { key: "beds", label: "Beds", value: state.lastOverview.availableBeds },
    { key: "today", label: "Today", value: state.lastOverview.appointmentsToday },
  ];
  const max = Math.max(...metrics.map((m) => m.value), 1);
  const total = metrics.reduce((sum, metric) => sum + Number(metric.value || 0), 0);
  miniChart.innerHTML = "";

  if (overviewMeta) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    overviewMeta.textContent = `Updated ${time} | Total tracked: ${total}`;
  }

  metrics.forEach((metric) => {
    const row = document.createElement("div");
    row.className = "chart-row";

    const head = document.createElement("div");
    head.className = "chart-head";

    const titleWrap = document.createElement("div");
    titleWrap.className = "chart-title";

    const icon = document.createElement("span");
    icon.className = `chart-icon chart-icon-${metric.key}`;
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("small");
    label.textContent = metric.label;

    const value = document.createElement("strong");
    value.className = "chart-value";
    value.textContent = String(metric.value ?? 0);

    const percent = document.createElement("span");
    percent.className = "chart-percent";
    const percentage = max === 0 ? 0 : Math.round((Number(metric.value || 0) / max) * 100);
    percent.textContent = `${percentage}%`;

    titleWrap.appendChild(icon);
    titleWrap.appendChild(label);
    head.appendChild(titleWrap);
    const valueWrap = document.createElement("div");
    valueWrap.className = "chart-value-wrap";
    valueWrap.appendChild(percent);
    valueWrap.appendChild(value);
    head.appendChild(valueWrap);

    const track = document.createElement("div");
    track.className = "chart-track";
    const fill = document.createElement("span");
    fill.className = `chart-fill chart-fill-${metric.key}`;
    fill.style.width = `${Math.max(8, (Number(metric.value || 0) / max) * 100)}%`;
    track.appendChild(fill);

    row.appendChild(head);
    row.appendChild(track);
    miniChart.appendChild(row);
  });
}

async function loadOverview() {
  try {
    // Skip overview update if in appointments module (has its own stats)
    if (state.module === "appointments") {
      return;
    }

    // Show as toast notification in bottom-right (system feedback)
    showToast("Updating dashboard metrics...");
    // Always use cache busting to ensure fresh overview data
    const overview = await fetchJson("api.php?action=overview", { cacheBust: true });
    
    // Only update if elements exist (might not exist in certain modules)
    const totalPatientsEl = document.getElementById("totalPatients");
    const activeDoctorsEl = document.getElementById("activeDoctors");
    const availableBedsEl = document.getElementById("availableBeds");
    const appointmentsTodayEl = document.getElementById("appointmentsToday");
    
    if (totalPatientsEl) totalPatientsEl.textContent = overview.totalPatients ?? 0;
    if (activeDoctorsEl) activeDoctorsEl.textContent = overview.activeDoctors ?? 0;
    if (availableBedsEl) availableBedsEl.textContent = overview.availableBeds ?? 0;
    if (appointmentsTodayEl) appointmentsTodayEl.textContent = overview.appointmentsToday ?? 0;
    
    state.lastOverview = overview;
    renderChart();
  } catch (error) {
    console.error("Dashboard overview failed:", error);
    showToast(`Dashboard update failed: ${error.message}`);
  }
}

function isAnalyticsModule() {
  return state.module === "patient_analytics";
}

function toggleAnalyticsModeUI(enabled) {
  if (analyticsPanel) {
    analyticsPanel.hidden = !enabled;
  }
  if (tableWrap) tableWrap.classList.toggle("analytics-hidden", enabled);
  if (quickActions) quickActions.classList.toggle("analytics-hidden", enabled);
  if (searchInput) searchInput.classList.toggle("analytics-hidden", enabled);
  if (statusBox) statusBox.classList.toggle("analytics-hidden", enabled);
  if (patientDetailsPanel) patientDetailsPanel.hidden = true;
}

function getAnalyticsFilterQuery() {
  const params = new URLSearchParams();
  params.set("action", "patient_analytics");
  if (analyticsDateFrom?.value) params.set("date_from", analyticsDateFrom.value);
  if (analyticsDateTo?.value) params.set("date_to", analyticsDateTo.value);
  if (analyticsDepartment?.value && analyticsDepartment.value !== "all") params.set("department", analyticsDepartment.value);
  if (analyticsDoctor?.value && analyticsDoctor.value !== "all") params.set("doctor", analyticsDoctor.value);
  if (analyticsAge?.value && analyticsAge.value !== "all") params.set("age_range", analyticsAge.value);
  if (analyticsGender?.value && analyticsGender.value !== "all") params.set("gender", analyticsGender.value);
  return params.toString();
}

function formatMetricCard({ label, icon, value, meta = "", cssClass = "" }) {
  return `
    <article class="metric-card ${cssClass}">
      <div class="metric-head">
        <p class="metric-label">${icon} ${label}</p>
      </div>
      <p class="metric-value">${value}</p>
      <p class="metric-meta">${meta}</p>
    </article>
  `;
}

function renderAnalyticsMetrics(metrics) {
  if (!analyticsMetrics || !metrics) return;
  const total = metrics.totalPatientsRegistered ?? { today: 0, week: 0, month: 0 };
  analyticsMetrics.innerHTML = [
    formatMetricCard({
      label: "Total Registered",
      icon: "👥",
      value: total.month ?? 0,
      meta: `Today ${total.today ?? 0} | Week ${total.week ?? 0} | Month ${total.month ?? 0}`,
      cssClass: "metric-total",
    }),
    formatMetricCard({ label: "New Patients Today", icon: "🆕", value: metrics.newPatientsToday ?? 0, meta: "New admissions in last 24h", cssClass: "metric-new" }),
    formatMetricCard({ label: "Critical Patients", icon: "⚠", value: metrics.criticalPatients ?? 0, meta: "Needs urgent attention", cssClass: "metric-critical" }),
    formatMetricCard({ label: "Follow-up Patients", icon: "🩺", value: metrics.followUpPatients ?? 0, meta: "Pending reassessment", cssClass: "metric-follow-up" }),
    formatMetricCard({ label: "Discharged Patients", icon: "✅", value: metrics.dischargedPatients ?? 0, meta: "Completed treatment", cssClass: "metric-discharged" }),
    formatMetricCard({ label: "Live Sync", icon: "⏱", value: "Realtime", meta: "Auto refresh every 20 seconds", cssClass: "metric-sync" }),
  ].join("");
}

function setAnalyticsBusy(isBusy, stageText = "") {
  const actions = [
    analyticsApplyFilters,
    analyticsResetFilters,
    analyticsExportExcel,
    analyticsExportPdf,
    analyticsQuickAddPatient,
    analyticsQuickSchedule,
    analyticsQuickWardStatus,
  ].filter(Boolean);

  actions.forEach((btn) => {
    btn.disabled = isBusy;
    btn.classList.toggle("is-busy", isBusy);
  });

  if (analyticsPanel) {
    analyticsPanel.classList.toggle("is-loading", isBusy);
  }

  if (analyticsProgress) {
    analyticsProgress.hidden = !isBusy;
  }

  if (analyticsProgressText && stageText) {
    analyticsProgressText.textContent = stageText;
  }
}

function buildLineSvg(points, predictionPoints, anomalies) {
  if (points.length === 0) {
    return "<div class=\"analytics-subtitle\">No trend data available.</div>";
  }

  const width = 600;
  const height = 210;
  const padding = 32;
  const values = points.map((p) => Number(p.value || 0));
  const maxVal = Math.max(1, ...values, ...predictionPoints.map((p) => Number(p.value || 0)));
  const getX = (idx, total) => padding + (idx * (width - padding * 2)) / Math.max(1, total - 1);
  const getY = (val) => height - padding - (Number(val || 0) / maxVal) * (height - padding * 2);

  const polyline = points.map((p, i) => `${getX(i, points.length)},${getY(p.value)}`).join(" ");
  const prediction = predictionPoints.map((p, i) => `${getX(i + points.length - 1, points.length + predictionPoints.length - 1)},${getY(p.value)}`).join(" ");

  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), Math.round(maxVal)];
  const yGuides = yTicks
    .map((tick) => {
      const y = getY(tick);
      return `
        <line class="gridline" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" />
        <text class="gridlabel" x="${padding - 8}" y="${y + 4}" text-anchor="end">${tick}</text>
      `;
    })
    .join("");

  const circles = points
    .map((p, i) => {
      const isAnomaly = anomalies.includes(p.label);
      return `<circle class=\"point ${isAnomaly ? "anomaly" : ""}\" cx=\"${getX(i, points.length)}\" cy=\"${getY(p.value)}\" r=\"4\"><title>${p.label}: ${p.value}</title></circle>`;
    })
    .join("");

  return `
    <svg class="line-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Patient trend and forecast chart">
      ${yGuides}
      <line class="axis" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" />
      <line class="axis" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" />
      <polyline class="series" points="${polyline}" />
      <polyline class="prediction" points="${prediction}" />
      ${circles}
    </svg>
  `;
}

function renderAnalyticsLineChart(lineData) {
  if (!analyticsLineChart) return;
  const source = Array.isArray(lineData?.daily) ? lineData.daily : [];
  const points = source.slice(-12);

  const trailing = points.slice(-4).map((p) => Number(p.value || 0));
  const predictedValue = trailing.length > 0
    ? Math.max(0, Math.round(trailing.reduce((sum, value) => sum + value, 0) / trailing.length))
    : (points[0]?.value ?? 0);
  const prediction = points.length > 0 ? [{ label: "Forecast", value: predictedValue }] : [];

  const avg = points.length > 0 ? points.reduce((sum, p) => sum + Number(p.value || 0), 0) / points.length : 0;
  const anomalies = points.filter((p) => Number(p.value || 0) > avg * 1.8).map((p) => p.label);
  const peak = points.reduce((max, p) => Math.max(max, Number(p.value || 0)), 0);

  analyticsLineChart.innerHTML = `
    ${buildLineSvg(points, prediction, anomalies)}
    <div class="analytics-subtitle">12-day trend • Peak ${peak} patients/day • Forecast ${predictedValue} next day</div>
  `;
}

function renderAnalyticsBarChart(items) {
  if (!analyticsBarChart) return;
  if (!Array.isArray(items) || items.length === 0) {
    analyticsBarChart.innerHTML = "<div class=\"analytics-subtitle\">No diagnosis data available.</div>";
    return;
  }

  const max = Math.max(...items.map((item) => Number(item.count || 0)), 1);
  const total = Math.max(1, items.reduce((sum, item) => sum + Number(item.count || 0), 0));
  analyticsBarChart.innerHTML = `<div class="bar-list">${items
    .map((item, index) => {
      const width = Math.max(6, (Number(item.count || 0) / max) * 100);
      const ratio = Math.round((Number(item.count || 0) / total) * 100);
      return `
        <div class="bar-row ${index < 3 ? "bar-top" : ""}" data-drill-diagnosis="${item.diagnosis}">
          <div class="bar-label">
            <span><em class="bar-rank">#${index + 1}</em>${item.diagnosis}</span>
            <strong>${item.count} <small>${ratio}%</small></strong>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
        </div>
      `;
    })
    .join("")}</div><div class="analytics-subtitle">Top ${items.length} diagnoses by current filtered patient volume</div>`;

  analyticsBarChart.querySelectorAll("[data-drill-diagnosis]").forEach((rowEl) => {
    rowEl.addEventListener("click", () => {
      const diagnosis = rowEl.getAttribute("data-drill-diagnosis") || "";
      renderAnalyticsDrilldown(`Diagnosis: ${diagnosis}`, (item) => item.diagnosis === diagnosis);
    });
  });
}

function renderAnalyticsDonutChart(summary) {
  if (!analyticsDonutChart) return;
  const palette = {
    ADMITTED: "#007b83",
    CRITICAL: "#d62828",
    "IN TREATMENT": "#2196F3",
    "UNDER OBSERVATION": "#FF9800",
    STABLE: "#4CAF50",
    RECOVERING: "#66BB6A",
    DISCHARGED: "#4DB6AC",
    "FOLLOW-UP REQUIRED": "#f0b429",
    SCHEDULED: "#2196F3",
    "NO-SHOW": "#9E9E9E",
  };

  const list = Array.isArray(summary) ? summary : [];
  const total = list.reduce((sum, item) => sum + Number(item.count || 0), 0) || 1;

  let running = 0;
  const segments = list
    .map((item) => {
      const count = Number(item.count || 0);
      const angle = (count / total) * 360;
      const start = running;
      running += angle;
      const color = palette[item.status] || "#5A9BD5";
      return `${color} ${start}deg ${running}deg`;
    })
    .join(", ");

  analyticsDonutChart.innerHTML = `
    <div class="donut-wrap">
      <div class="donut" style="background: conic-gradient(${segments || "#d7e8ef 0 360deg"});">
        <div class="donut-center">
          <small>Total</small>
          <strong>${total}</strong>
        </div>
      </div>
      <div class="donut-legend">
        ${list
          .map((item) => {
            const color = palette[item.status] || "#5A9BD5";
            const percentage = Math.round((Number(item.count || 0) / total) * 100);
            return `<div class="legend-item" data-drill-status="${item.status}"><span><span class="legend-dot" style="background:${color}"></span>${item.status}</span><strong>${item.count} <small>${percentage}%</small></strong></div>`;
          })
          .join("")}
      </div>
    </div>
    <div class="analytics-subtitle">Status distribution based on currently filtered patients</div>
  `;

  analyticsDonutChart.querySelectorAll("[data-drill-status]").forEach((legendItem) => {
    legendItem.addEventListener("click", () => {
      const status = legendItem.getAttribute("data-drill-status") || "";
      renderAnalyticsDrilldown(`Status: ${status}`, (item) => item.status === status);
    });
  });
}

function renderAnalyticsTableRows(container, rows, mode = "recent") {
  if (!container) return;
  if (!Array.isArray(rows) || rows.length === 0) {
    container.innerHTML = '<tr><td colspan="6">No records found.</td></tr>';
    return;
  }

  container.innerHTML = rows
    .map((row) => {
      const riskClass = mode === "risk" ? (row.priorityScore >= 100 ? "risk-critical" : "risk-warning") : "";
      const lastCol = mode === "risk" ? `P${row.priorityScore}` : row.status;
      return `<tr class="${riskClass}" title="${row.diagnosis}"><td>${row.name}</td><td>${row.age}</td><td>${row.gender}</td><td>${row.doctor}</td><td>${row.ward}</td><td>${lastCol}</td></tr>`;
    })
    .join("");
}

function renderAnalyticsAlerts(items) {
  if (!analyticsAlerts) return;
  if (!Array.isArray(items) || items.length === 0) {
    analyticsAlerts.innerHTML = "<li class=\"alert-item alert-normal\">No alerts.</li>";
    return;
  }

  analyticsAlerts.innerHTML = items
    .map((item) => `<li class="alert-item alert-${item.type}">${item.label}: ${item.value}</li>`)
    .join("");
}

function renderAnalyticsDrilldown(title, predicate) {
  if (!state.analytics || !analyticsDrilldownTable || !analyticsDrilldownTitle) return;
  const source = [...(state.analytics.tables?.recentPatients || []), ...(state.analytics.tables?.highRiskPatients || [])];
  const map = new Map();
  source.forEach((item) => map.set(item.id, item));
  const allRows = [...map.values()];
  const filtered = typeof predicate === "function" ? allRows.filter(predicate) : allRows;
  analyticsDrilldownTitle.textContent = `${title} (${filtered.length} records)`;
  renderAnalyticsTableRows(analyticsDrilldownTable, filtered, "recent");
}

function populateAnalyticsFilterOptions(filterData) {
  if (!filterData) return;
  if (analyticsDepartment) {
    const previousDepartment = analyticsDepartment.value;
    analyticsDepartment.innerHTML = '<option value="all">All</option>';
    (filterData.departments || []).forEach((dep) => {
      const option = document.createElement("option");
      option.value = dep;
      option.textContent = dep;
      analyticsDepartment.appendChild(option);
    });
    if ([...analyticsDepartment.options].some((opt) => opt.value === previousDepartment)) {
      analyticsDepartment.value = previousDepartment;
    }
  }

  if (analyticsDoctor) {
    const previousDoctor = analyticsDoctor.value;
    analyticsDoctor.innerHTML = '<option value="all">All</option>';
    (filterData.doctors || []).forEach((doctorName) => {
      const option = document.createElement("option");
      option.value = doctorName;
      option.textContent = doctorName;
      analyticsDoctor.appendChild(option);
    });
    if ([...analyticsDoctor.options].some((opt) => opt.value === previousDoctor)) {
      analyticsDoctor.value = previousDoctor;
    }
  }
}

function resetAnalyticsFilters() {
  if (analyticsDateFrom) analyticsDateFrom.value = "";
  if (analyticsDateTo) analyticsDateTo.value = "";
  if (analyticsDepartment) analyticsDepartment.value = "all";
  if (analyticsDoctor) analyticsDoctor.value = "all";
  if (analyticsAge) analyticsAge.value = "all";
  if (analyticsGender) analyticsGender.value = "all";
  if (analyticsRecentSearch) analyticsRecentSearch.value = "";
  if (analyticsHighRiskSort) analyticsHighRiskSort.value = "priority";
}

function renderAnalyticsSummary(payload) {
  if (!analyticsSummary) return;
  const recentCount = Array.isArray(payload?.tables?.recentPatients) ? payload.tables.recentPatients.length : 0;
  const highRiskCount = Array.isArray(payload?.tables?.highRiskPatients) ? payload.tables.highRiskPatients.length : 0;
  const criticalCount = Number(payload?.metrics?.criticalPatients ?? 0);
  const followUpCount = Number(payload?.metrics?.followUpPatients ?? 0);
  const generated = payload?.generatedAt ? new Date(payload.generatedAt) : null;
  const generatedText = generated && !Number.isNaN(generated.getTime()) ? generated.toLocaleTimeString() : "just now";
  analyticsSummary.textContent = `Showing ${recentCount} recent patients, ${highRiskCount} high-risk subjects, ${criticalCount} critical and ${followUpCount} follow-up · Updated ${generatedText}`;
}

function exportAnalyticsCsv() {
  if (!state.analytics) return;
  const rows = state.analytics.tables?.recentPatients || [];
  const headers = ["Name", "Age", "Gender", "Doctor", "Ward", "Status", "Diagnosis"];
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push([
      row.name,
      row.age,
      row.gender,
      row.doctor,
      row.ward,
      row.status,
      row.diagnosis,
    ].map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `patient-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportAnalyticsPdf() {
  const panel = analyticsPanel;
  if (!panel) return;
  const printWindow = window.open("", "_blank", "width=1200,height=800");
  if (!printWindow) return;
  printWindow.document.write(`<html><head><title>Patient Analytics Report</title><style>body{font-family:Arial,sans-serif;padding:16px;}table{width:100%;border-collapse:collapse;margin-top:8px;}th,td{border:1px solid #cddbe2;padding:6px;font-size:12px;}h1,h2{margin:8px 0;} .no-print{display:none;}</style></head><body>${panel.innerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function applyAnalyticsLocalFilters() {
  if (!state.analytics) return;
  const query = String(analyticsRecentSearch?.value || "").trim().toLowerCase();
  const recentRows = (state.analytics.tables?.recentPatients || []).filter((row) => {
    if (!query) return true;
    return JSON.stringify(row).toLowerCase().includes(query);
  });

  const highRiskRows = [...(state.analytics.tables?.highRiskPatients || [])];
  const riskSort = analyticsHighRiskSort?.value || "priority";
  highRiskRows.sort((a, b) => {
    if (riskSort === "doctor") return String(a.doctor).localeCompare(String(b.doctor));
    if (riskSort === "age") return Number(b.age || 0) - Number(a.age || 0);
    return Number(b.priorityScore || 0) - Number(a.priorityScore || 0);
  });

  renderAnalyticsTableRows(analyticsRecentTable, recentRows, "recent");
  renderAnalyticsTableRows(analyticsHighRiskTable, highRiskRows, "risk");
}

async function loadAnalyticsData() {
  if (!isAnalyticsModule()) return;

  try {
    if (analyticsLoading) analyticsLoading.hidden = false;
    setAnalyticsBusy(true, "Reading patient records...");
    showStatus("Loading patient analytics...");
    // Always use cache busting to ensure fresh analytics data
    const payload = await fetchJson(`api.php?${getAnalyticsFilterQuery()}`, { cacheBust: true });
    setAnalyticsBusy(true, "Generating charts and risk priorities...");
    state.analytics = payload;

    renderAnalyticsMetrics(payload.metrics);
    renderAnalyticsLineChart(payload.charts?.line);
    renderAnalyticsBarChart(payload.charts?.diagnoses);
    renderAnalyticsDonutChart(payload.charts?.statusSummary);
    renderAnalyticsAlerts(payload.alerts);
    populateAnalyticsFilterOptions(payload.filters);
    applyAnalyticsLocalFilters();
    renderAnalyticsDrilldown("All filtered patients", () => true);
    renderAnalyticsSummary(payload);
    renderRecent(payload.tables?.recentPatients || []);
    if (overviewMeta) {
      const generated = payload.generatedAt ? new Date(payload.generatedAt) : null;
      overviewMeta.textContent = generated && !Number.isNaN(generated.getTime())
        ? `Analytics synced ${generated.toLocaleTimeString()}`
        : "Analytics synced";
    }
    showStatus("");
  } catch (error) {
    if (analyticsProgressText) {
      analyticsProgressText.textContent = "Failed to load analytics.";
    }
    showStatus(`Analytics load failed: ${error.message}`);
  } finally {
    if (analyticsLoading) analyticsLoading.hidden = true;
    setAnalyticsBusy(false);
  }
}

function getFilteredRows() {
  const localTerm = searchInput.value.trim().toLowerCase();
  const globalTerm = (globalSearchInput?.value || "").trim().toLowerCase();
  const activeFilter = statusFilter?.value || "all";

  let filtered = [...state.rows];

  if (localTerm) {
    filtered = filtered.filter((row) => JSON.stringify(row).toLowerCase().includes(localTerm));
  }

  if (globalTerm) {
    filtered = filtered.filter((row) => JSON.stringify(row).toLowerCase().includes(globalTerm));
  }

  // Status filter with proper matching for patient status
  if (activeFilter !== "all") {
    if (state.module === "patients") {
      // For patient status, match exact status field value
      filtered = filtered.filter((row) => {
        const rowStatus = String(row?.status || "").toUpperCase();
        return rowStatus === activeFilter.toUpperCase();
      });
      console.log("DEBUG: Patient status filter applied:", activeFilter, "remaining rows:", filtered.length);
    } else {
      // For other modules, use substring match
      filtered = filtered.filter((row) => JSON.stringify(row).toLowerCase().includes(activeFilter.toLowerCase()));
    }
  }

  filtered.sort((a, b) => {
    if (state.module === "patients") {
      const aId = Number(a.id ?? 0);
      const bId = Number(b.id ?? 0);
      return state.sortAsc ? aId - bId : bId - aId;
    }

    const aValue = JSON.stringify(a).toLowerCase();
    const bValue = JSON.stringify(b).toLowerCase();
    return state.sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  return filtered;
}

function getStatusColor(status) {
  const s = String(status || "").toUpperCase();
  if (s === "SCHEDULED") return "#007B83";
  if (s === "CONFIRMED") return "#4CAF50";
  if (s === "COMPLETED") return "#2196F3";
  if (s === "CANCELLED") return "#F44336";
  if (s === "PENDING") return "#FF9800";
  return "#999999";
}

function updateAppointmentsSidebar(rows) {
  try {
    // Update the Today Snapshot cards with appointment data
    const cardsContainer = document.getElementById("cards");
    if (cardsContainer) {
      const total = rows.length;
      const confirmed = rows.filter(a => String(a.status || "").toUpperCase() === "CONFIRMED").length;
      const pending = rows.filter(a => String(a.status || "").toUpperCase() === "PENDING").length;
      const cancelled = rows.filter(a => String(a.status || "").toUpperCase() === "CANCELLED").length;
      const confirmedPercent = total > 0 ? Math.round((confirmed / total) * 100) : 0;

      cardsContainer.innerHTML = `
        <article class="card card-appointments">
          <h3 id="appointmentsStatus">${total}</h3>
          <p>Total Appointments</p>
        </article>
        <article class="card card-confirmed">
          <h3 id="appointmentsConfirmed">${confirmedPercent}%</h3>
          <p>Confirmed Rate</p>
        </article>
        <article class="card card-pending">
          <h3 id="appointmentsPending">${pending}</h3>
          <p>Pending Requests</p>
        </article>
        <article class="card card-cancelled">
          <h3 id="appointmentsCancelled">${cancelled}</h3>
          <p>Cancelled</p>
        </article>
      `;
    }

    // Update the Calendar title for appointments module
    const insightCardTitleEl = document.getElementById("insightCardTitle");
    const overviewMetaEl = document.getElementById("overviewMeta");
    if (insightCardTitleEl) {
      insightCardTitleEl.textContent = "Calendar";
    }
    if (overviewMetaEl) {
      overviewMetaEl.textContent = `${rows.length} appointments scheduled`;
    }

    // Clear miniChart and render appointments calendar
    const miniChartEl = document.getElementById("miniChart");
    if (miniChartEl) {
      miniChartEl.innerHTML = "";
      miniChartEl.className = "appointments-sidebar-calendar";
      renderAppointmentsSidebarCalendar(rows);
    }
  } catch (error) {
    console.error("Error updating appointments sidebar:", error);
  }
}

function renderAppointmentsSidebarCalendar(rows) {
  const calendarContainer = document.getElementById("miniChart");
  if (!calendarContainer) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  
  const firstDayOfWeek = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();
  
  // Build accurate appointment map from current rows
  const appointmentsByDate = new Map();
  rows.forEach(appointment => {
    if (appointment.date && appointment.patient && appointment.doctor) {
      // Normalize date to handle timezone issues - use date as-is from API
      const appointmentDate = String(appointment.date).trim(); // Format: YYYY-MM-DD
      if (!appointmentsByDate.has(appointmentDate)) {
        appointmentsByDate.set(appointmentDate, []);
      }
      appointmentsByDate.get(appointmentDate).push(appointment);
    }
  });

  // Also track appointments by day of month for calendar highlighting
  const appointmentDates = new Set();
  appointmentsByDate.forEach((appointments, dateString) => {
    // Parse date string carefully to avoid timezone issues
    const [yr, m, d] = dateString.split('-').map(Number);
    const dateObj = new Date(yr, m - 1, d); // Create date in local timezone at midnight
    const currentMonthDate = dateObj.getFullYear() === year && dateObj.getMonth() === month;
    if (currentMonthDate) {
      appointmentDates.add(dateObj.getDate()); // Get day of month
    }
  });

  let calendarHTML = `
    <div class="sidebar-calendar-header">
      <p class="calendar-month-title">${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="sidebar-calendar-weekdays">
      <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
    </div>
    <div class="sidebar-calendar-dates" id="sidebarCalendarDates">
  `;

  // Previous month dates
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarHTML += `<div class="sidebar-cal-date other-month">${prevLastDate - i}</div>`;
  }

  // Current month dates
  for (let date = 1; date <= lastDateOfMonth; date++) {
    // Create YYYY-MM-DD string without timezone conversion to match API date format
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const hasAppointment = appointmentsByDate.has(dateString);
    const isToday = date === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    
    const classes = ['sidebar-cal-date'];
    if (hasAppointment) {
      classes.push('has-event');
      classes.push('clickable-date');
    }
    if (isToday) classes.push('is-today');
    
    let appointmentCount = 0;
    if (hasAppointment) {
      appointmentCount = appointmentsByDate.get(dateString).length;
    }
    
    const title = hasAppointment ? `${appointmentCount} appointment${appointmentCount !== 1 ? 's' : ''}` : '';
    const badge = hasAppointment ? `<span class="calendar-badge">${appointmentCount}</span>` : '';
    
    calendarHTML += `<div class="${classes.join(' ')}" data-date="${dateString}" title="${title}" data-date-display="${date}">${date}${badge}</div>`;
  }

  // Next month dates
  const totalCells = Math.ceil((firstDayOfWeek + lastDateOfMonth) / 7) * 7;
  for (let date = 1; date <= totalCells - firstDayOfWeek - lastDateOfMonth; date++) {
    calendarHTML += `<div class="sidebar-cal-date other-month">${date}</div>`;
  }

  calendarHTML += `</div>`;
  calendarContainer.innerHTML = calendarHTML;

  // Attach click listeners to dates with appointments
  const calendarDates = document.querySelectorAll('.sidebar-cal-date.clickable-date');
  calendarDates.forEach(dateEl => {
    dateEl.addEventListener('click', function(e) {
      e.stopPropagation();
      
      const dateString = this.getAttribute('data-date');
      const dateDisplay = this.getAttribute('data-date-display');
      
      // Get appointments for this date - use exact date string match
      const appointments = appointmentsByDate.get(dateString) || [];
      
      if (appointments.length === 0) {
        showToast("No appointments for this date");
        return;
      }

      // Create and show patient details popover
      showAppointmentPopover(appointments, dateString, dateDisplay, month, year);
      
      // Filter table to show only appointments on this date
      renderAppointmentsScheduleTable(appointments);
      
      // Highlight selected date
      document.querySelectorAll('.sidebar-cal-date').forEach(d => d.classList.remove('selected'));
      this.classList.add('selected');
      
      // Reset time filter tabs to "All Times" when selecting a calendar date
      const filterTabs = document.querySelectorAll('.filter-tab');
      filterTabs.forEach(tab => tab.classList.remove('active'));
      const allTimesTab = Array.from(filterTabs).find(tab => tab.textContent.includes('All Times'));
      if (allTimesTab) allTimesTab.classList.add('active');
      
      // Scroll to the table
      const tablePanel = document.querySelector('.table-panel');
      if (tablePanel) {
        tablePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    // Add pointer cursor style
    dateEl.style.cursor = 'pointer';
  });
}

function showAppointmentPopover(appointments, dateString, dateDisplay, month, year) {
  // Remove any existing popover
  const existingPopover = document.getElementById('appointmentPopover');
  if (existingPopover) {
    existingPopover.remove();
  }

  // Create popover container
  const popover = document.createElement('div');
  popover.id = 'appointmentPopover';
  popover.className = 'appointment-popover';
  
  const dateObj = new Date(dateString + 'T00:00:00');
  const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  
  // Build patient list
  const patientList = appointments
    .map((apt, idx) => `
      <div class="popover-appointment-item">
        <div class="popover-appointment-number">${idx + 1}</div>
        <div class="popover-appointment-details">
          <p class="popover-patient-name"><strong>${apt.patient || 'Unknown'}</strong></p>
          <p class="popover-appointment-info">
            <span class="info-label">Time:</span> ${apt.time || 'N/A'}<br>
            <span class="info-label">Doctor:</span> ${apt.doctor || 'N/A'}<br>
            <span class="info-label">Status:</span> <span class="status-badge" style="background-color: ${getStatusColor(apt.status || 'PENDING')}">${apt.status || 'PENDING'}</span>
          </p>
        </div>
      </div>
    `)
    .join('');

  popover.innerHTML = `
    <div class="popover-header">
      <h4>${dateLabel}</h4>
      <button class="popover-close" onclick="document.getElementById('appointmentPopover').remove()">&times;</button>
    </div>
    <div class="popover-content">
      <p class="popover-count">${appointments.length} appointment${appointments.length !== 1 ? 's' : ''} today</p>
      <div class="popover-appointments">
        ${patientList}
      </div>
    </div>
  `;

  document.body.appendChild(popover);

  // Position popover near the calendar
  const miniChart = document.getElementById('miniChart');
  if (miniChart) {
    const rect = miniChart.getBoundingClientRect();
    popover.style.right = '10px';
    popover.style.top = (rect.bottom + 10) + 'px';
  }

  // Close popover when clicking outside
  setTimeout(() => {
    const closePopover = (e) => {
      if (popover.style.display !== 'none' && !popover.contains(e.target) && !e.target.closest('.sidebar-cal-date')) {
        popover.remove();
        document.removeEventListener('click', closePopover);
      }
    };
    document.addEventListener('click', closePopover);
  }, 100);
}

function renderAppointmentsDashboard(rows) {
  // Update sidebar when appointments module is active
  updateAppointmentsSidebar(rows);

  // Get the table panel element that will contain the dashboard
  const tablePanel = document.querySelector(".table-panel");
  if (!tablePanel) return;

  // Add appointments-mode class for special styling
  tablePanel.classList.add("appointments-mode");

  // Add "+ New Appointment" button to panel-head if not already there
  const panelHead = tablePanel.querySelector(".panel-head");
  if (panelHead) {
    let newApptBtn = document.getElementById("appointmentsNewBtn");
    if (!newApptBtn) {
      // Create a wrapper for the button
      const buttonWrapper = document.createElement("div");
      buttonWrapper.className = "appointments-header-wrapper";
      
      // Create the button with semantic intent
      newApptBtn = document.createElement("button");
      newApptBtn.id = "appointmentsNewBtn";
      newApptBtn.className = "btn btn-success appointments-new-btn";
      newApptBtn.innerHTML = "<span style='font-size: 1.2em; margin-right: 8px;'>+</span> New Appointment";
      newApptBtn.title = "Create a new appointment";
      newApptBtn.onclick = function() { openAppointmentModal(); };
      
      // Append button to wrapper
      buttonWrapper.appendChild(newApptBtn);
      
      // Append wrapper to panel-head
      panelHead.appendChild(buttonWrapper);
    }
  }

  // Clear the regular table view
  tableBody.innerHTML = "";
  tableHead.innerHTML = "";

  // Remove any existing dashboard container to prevent duplicates
  const existingDashboard = tablePanel.querySelector(".appointments-dashboard");
  if (existingDashboard) {
    existingDashboard.remove();
  }

  // Create dashboard container that will be inserted below the header
  const dashboardContainer = document.createElement("div");
  dashboardContainer.className = "appointments-dashboard";
  dashboardContainer.innerHTML = `
    <div class="dashboard-filters">
      <div class="filter-tabs">
        <button class="filter-tab active" onclick="filterAppointmentsByTime('all')">All Times</button>
        <button class="filter-tab" onclick="filterAppointmentsByTime('morning')">Morning (6 AM - 12 PM)</button>
        <button class="filter-tab" onclick="filterAppointmentsByTime('afternoon')">Afternoon (12 PM - 6 PM)</button>
      </div>
    </div>

    <div class="dashboard-main">
      <div class="schedule-section">
        <h3>Daily Schedule</h3>
        <div class="schedule-table-wrapper">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TIME</th>
                <th>PATIENT</th>
                <th>DOCTOR</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody id="scheduleTableBody">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Replace table panel content
  const oldTable = tablePanel.querySelector(".table-wrap");
  if (oldTable) {
    oldTable.replaceWith(dashboardContainer);
  } else {
    tablePanel.appendChild(dashboardContainer);
  }

  // Render the schedule table
  renderAppointmentsScheduleTable(rows.sort((a, b) => {
    const timeA = a.time || "00:00";
    const timeB = b.time || "00:00";
    return timeA.localeCompare(timeB);
  }));
}

function renderAppointmentsScheduleTable(rows) {
  const tbody = document.getElementById("scheduleTableBody");
  const wrapper = document.querySelector('.schedule-table-wrapper');
  if (!tbody) return;

  tbody.innerHTML = "";
  
  // Reset scroll position and hide scroll indicator
  if (wrapper) {
    wrapper.scrollTop = 0;
    updateScrollIndicator();
  }

  if (rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="7" style="text-align:center; padding: 20px;">No appointments scheduled</td>';
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(appointment => {
    const tr = document.createElement("tr");
    tr.className = "schedule-row";
    tr.setAttribute('data-appointment-id', appointment.id);
    
    const status = String(appointment.status || "PENDING").toUpperCase();
    const statusColor = getStatusColor(status);
    
    const timeDisplay = convertTo12HourFormat(appointment.time);
    tr.innerHTML = `
      <td class="date-cell">${appointment.date || "N/A"}</td>
      <td class="time-cell">${timeDisplay}</td>
      <td class="patient-cell">${appointment.patient || "-"}</td>
      <td class="doctor-cell">${appointment.doctor || "-"}</td>
      <td class="location-cell">${appointment.ward || "-"}</td>
      <td class="status-cell">
        <span class="status-badge" style="background-color: ${statusColor}; color: white;">
          ${status}
        </span>
      </td>
      <td class="actions-cell">
        <div class="action-menu-container">
          <button class="action-menu-btn" title="Actions">⋯</button>
          <div class="action-menu" style="display: none;">
            <button class="action-menu-item" data-action="update" data-appointment-id="${appointment.id}">UPDATE</button>
            <button class="action-menu-item" data-action="delete" data-appointment-id="${appointment.id}">DELETE</button>
            <button class="action-menu-item" data-action="undo">UNDO</button>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners to menu buttons
  const menuButtons = tbody.querySelectorAll('.action-menu-btn');
  menuButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const menu = this.nextElementSibling;
      if (menu) {
        // Close all other menus first
        tbody.querySelectorAll('.action-menu').forEach(m => {
          if (m !== menu) m.style.display = 'none';
        });
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      }
    });
  });

  // Attach event listeners to menu items
  const menuItems = tbody.querySelectorAll('.action-menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      const action = this.getAttribute('data-action');
      const appointmentId = this.getAttribute('data-appointment-id');
      
      if (action === 'update') {
        editAppointment(parseInt(appointmentId));
      } else if (action === 'delete') {
        deleteAppointment(parseInt(appointmentId));
      } else if (action === 'undo') {
        undoAction();
      }
      
      // Close the menu after action
      const menu = this.closest('.action-menu');
      if (menu) {
        menu.style.display = 'none';
      }
    });
  });

  // Add scroll event listeners for smooth interaction
  if (wrapper) {
    // Remove old scroll listeners
    wrapper.removeEventListener('scroll', updateScrollIndicator);
    wrapper.removeEventListener('keydown', handleTableKeyboardScroll);
    wrapper.removeEventListener('wheel', handleTableMouseWheel);
    
    // Add new scroll listener
    wrapper.addEventListener('scroll', updateScrollIndicator);
    
    // Add keyboard navigation (arrow keys, Page Up/Down)
    wrapper.addEventListener('keydown', handleTableKeyboardScroll);
    
    // Enhanced mouse wheel scrolling
    wrapper.addEventListener('wheel', handleTableMouseWheel, { passive: false });
    
    // Make wrapper focusable for keyboard events
    wrapper.setAttribute('tabindex', '0');
    
    // Initialize scroll indicator
    updateScrollIndicator();
  }
}

// Handle keyboard navigation for table scrolling
function handleTableKeyboardScroll(e) {
  const wrapper = document.querySelector('.schedule-table-wrapper');
  if (!wrapper) return;
  
  const scrollAmount = 50; // pixels to scroll
  const pageScrollAmount = wrapper.clientHeight - 50; // page up/down amount
  
  switch(e.key) {
    case 'ArrowDown':
      e.preventDefault();
      wrapper.scrollTop += scrollAmount;
      break;
    case 'ArrowUp':
      e.preventDefault();
      wrapper.scrollTop -= scrollAmount;
      break;
    case 'PageDown':
      e.preventDefault();
      wrapper.scrollTop += pageScrollAmount;
      break;
    case 'PageUp':
      e.preventDefault();
      wrapper.scrollTop -= pageScrollAmount;
      break;
    case 'End':
      e.preventDefault();
      wrapper.scrollTop = wrapper.scrollHeight;
      break;
    case 'Home':
      e.preventDefault();
      wrapper.scrollTop = 0;
      break;
  }
}

// Handle mouse wheel scrolling with better control
function handleTableMouseWheel(e) {
  const wrapper = document.querySelector('.schedule-table-wrapper');
  if (!wrapper) return;
  
  // Allow default behavior but ensure smooth scrolling
  const scrollSpeed = 1.2;
  wrapper.scrollTop += e.deltaY * scrollSpeed;
  updateScrollIndicator();
}


// Scroll to appointment row smoothly
// Update scroll indicator visibility and position
function updateScrollIndicator() {
  const wrapper = document.querySelector('.schedule-table-wrapper');
  if (!wrapper) {
    console.warn('Schedule wrapper not found');
    return;
  }
  
  // Check if scrollable
  const isScrollable = wrapper.scrollHeight > wrapper.clientHeight;
  let indicator = wrapper.parentElement.querySelector('#scrollIndicator');
  
  if (!isScrollable) {
    if (indicator) indicator.style.display = 'none';
    return;
  }
  
  // Create indicator if it doesn't exist
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'scrollIndicator';
    indicator.className = 'scroll-indicator';
    indicator.style.position = 'absolute';
    indicator.style.right = '2px';
    indicator.style.width = '8px';
    indicator.style.background = 'linear-gradient(180deg, #007b83 0%, #00a0ab 100%)';
    indicator.style.borderRadius = '3px';
    indicator.style.zIndex = '10';
    indicator.style.boxShadow = '0 2px 8px rgba(0, 123, 131, 0.25)';
    indicator.style.pointerEvents = 'none';
    
    // Find schedule-section (parent of wrapper)
    const scheduleSection = wrapper.closest('.schedule-section');
    if (scheduleSection) {
      scheduleSection.style.position = 'relative';
      scheduleSection.appendChild(indicator);
    }
  }
  
  if (indicator) {
    indicator.style.display = 'block';
    const scrollPercent = (wrapper.scrollTop / (wrapper.scrollHeight - wrapper.clientHeight)) * 100;
    const indicatorHeight = Math.max((wrapper.clientHeight / wrapper.scrollHeight) * 100, 15);
    
    indicator.style.height = indicatorHeight + '%';
    indicator.style.top = Math.min(scrollPercent, 100 - indicatorHeight) + '%';
    indicator.style.opacity = scrollPercent > 0 && scrollPercent < 100 ? '0.8' : '0.4';
  }
}

function scrollToAppointment(appointmentId) {
  const row = document.querySelector(`tr[data-appointment-id="${appointmentId}"]`);
  if (row) {
    const wrapper = document.querySelector('.schedule-table-wrapper');
    if (wrapper) {
      const rowOffset = row.offsetTop;
      const wrapperTop = wrapper.scrollTop;
      const rowTop = rowOffset - wrapper.offsetTop;
      
      // Scroll to make the row visible with some padding
      wrapper.scrollTo({
        top: rowTop - 50,
        behavior: 'smooth'
      });
      
      // Highlight the row briefly
      row.style.backgroundColor = '#fff8e1';
      setTimeout(() => {
        row.style.transition = 'background-color 0.5s ease';
        row.style.backgroundColor = '';
      }, 100);
      
      // Update scroll indicator
      updateScrollIndicator();
    }
  }
}

// Close action menus when clicking outside
document.addEventListener('click', function(e) {
  // Only close if NOT clicking on the menu container itself or toggle button
  if (!e.target.closest('.action-menu-container') && !e.target.closest('.action-menu-btn')) {
    const menus = document.querySelectorAll('.action-menu');
    menus.forEach(menu => {
      menu.style.display = 'none';
    });
  }
});

function renderAppointmentsCalendar(rows) {
  const calendarContainer = document.getElementById("appointmentCalendar");
  if (!calendarContainer) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  
  const firstDayOfWeek = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();
  
  const appointmentDates = new Set();
  rows.forEach(a => {
    if (a.date) {
      const d = new Date(a.date);
      appointmentDates.add(d.getDate());
    }
  });

  let calendarHTML = `
    <div class="calendar-header">
      <p class="calendar-title">${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="calendar-weekdays">
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    </div>
    <div class="calendar-dates">
  `;

  // Previous month dates
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarHTML += `<div class="calendar-date other-month">${prevLastDate - i}</div>`;
  }

  // Current month dates
  for (let date = 1; date <= lastDateOfMonth; date++) {
    const hasAppointment = appointmentDates.has(date);
    const isToday = date === now.getDate();
    const classes = ['calendar-date'];
    if (hasAppointment) classes.push('has-appointment');
    if (isToday) classes.push('today');
    
    calendarHTML += `<div class="${classes.join(' ')}">${date}</div>`;
  }

  // Next month dates
  const totalCells = Math.ceil((firstDayOfWeek + lastDateOfMonth) / 7) * 7;
  for (let date = 1; date <= totalCells - firstDayOfWeek - lastDateOfMonth; date++) {
    calendarHTML += `<div class="calendar-date other-month">${date}</div>`;
  }

  calendarHTML += `
    </div>
  `;

  calendarContainer.innerHTML = calendarHTML;
}

function renderAppointmentsActivityFeed(rows) {
  const feedContainer = document.getElementById("activityFeed");
  if (!feedContainer) return;

  const activities = rows.slice(-5).reverse().map(a => ({
    patient: a.patient || "Unknown",
    action: `Appointment scheduled for ${a.date}`,
    status: a.status || "PENDING",
    time: a.time || "N/A"
  }));

  if (activities.length === 0) {
    feedContainer.innerHTML = '<p style="text-align: center; color: #999;">No recent activity</p>';
    return;
  }

  feedContainer.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon">⊙</div>
      <div class="activity-content">
        <p class="activity-patient">${activity.patient}</p>
        <p class="activity-action">${activity.action}</p>
        <span class="activity-time">${activity.time}</span>
      </div>
    </div>
  `).join('');
}

function filterAppointmentsByTime(timeframe) {
  const tabs = document.querySelectorAll(".filter-tab");
  tabs.forEach(tab => tab.classList.remove("active"));
  event.target.classList.add("active");

  // Clear calendar selected state when filtering by time
  const calendarDates = document.querySelectorAll('.sidebar-cal-date.selected');
  calendarDates.forEach(date => date.classList.remove('selected'));

  const rows = state.rows;
  let filtered = rows;

  if (timeframe !== "all") {
    filtered = rows.filter(a => {
      const time = a.time || "00:00";
      const [hour] = time.split(":").map(Number);
      
      if (timeframe === "morning") {
        return hour >= 6 && hour < 12;
      } else if (timeframe === "afternoon") {
        return hour >= 12 && hour < 18;
      }
      return true;
    });
  }

  renderAppointmentsScheduleTable(filtered.sort((a, b) => {
    const timeA = a.time || "00:00";
    const timeB = b.time || "00:00";
    return timeA.localeCompare(timeB);
  }));
}

function editAppointment(appointmentId) {
  const appointment = state.rows.find(a => a.id === appointmentId);
  if (appointment) {
    state.selectedRowRef = appointment;
    openEntryModal("Edit Appointment", appointment);
  }
}

function deleteAppointment(appointmentId) {
  if (confirm("Are you sure you want to delete this appointment?")) {
    state.selectedRowRef = state.rows.find(a => a.id === appointmentId);
    deleteSelectedRow();
  }
}

function deleteSelectedRow() {
  const row = state.selectedRowRef;
  if (!row) {
    showToast("No appointment selected", "warning");
    return;
  }

  if (isServerWritableModule("appointments")) {
    try {
      // Delete from server
      fetchJsonPost("api.php?action=module_delete", {
        module: "appointments",
        id: row?.id,
      }).then(() => {
        state.undoStack = null;
        if (undoBtn) undoBtn.disabled = true;
        // Only reload if still in appointments module
        if (state.module === "appointments") {
          loadModuleData();
        }
        showToast("Appointment deleted successfully.");
      }).catch(error => {
        showToast(`Delete failed: ${error.message}`);
      });
      return;
    } catch (error) {
      showToast(`Delete failed: ${error.message}`);
      return;
    }
  }

  // For non-server modules, setup undo and delete locally
  const removeIndex = state.rows.findIndex((item) => item === row);
  if (removeIndex >= 0) {
    state.undoStack = { type: "delete", row, index: removeIndex };
    state.rows.splice(removeIndex, 1);
    state.originalRows = [...state.rows];
    state.selectedIndex = null;
    state.selectedRowRef = null;
    if (undoBtn) undoBtn.disabled = false;
    renderRows(getFilteredRows());
    // Update sidebar calendar in real-time
    if (state.module === "appointments") {
      updateAppointmentsSidebar(state.rows);
    }
    showToast("Appointment deleted. Undo is available.");
  }
}

function openAppointmentModal() {
  state.selectedRowRef = null;
  openAdvancedAppointmentModal();
}

// ===== ADVANCED APPOINTMENT MODAL FUNCTIONS =====

function openAdvancedAppointmentModal() {
  const modal = document.getElementById('advancedAppointmentModal');
  if (!modal) return;
  
  // Reset form
  resetAdvancedAppointmentForm();
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('advApptDate').value = today;
  
  // Load initial data
  loadAvailableWards();
  loadRecentPatients();
  // updateCapacityCheck(); // Removed - Capacity Check panel removed
  
  // Show modal
  modal.hidden = false;
  
  // Setup event listeners
  setupAdvancedAppointmentListeners();
}

function closeAdvancedAppointmentModal() {
  const modal = document.getElementById('advancedAppointmentModal');
  if (modal) {
    modal.hidden = true;
  }
}

function resetAdvancedAppointmentForm() {
  const form = document.getElementById('advancedAppointmentForm');
  if (form) {
    form.reset();
    document.getElementById('advApptPatientId').value = '';
    document.getElementById('advApptDoctorId').value = '';
    document.getElementById('advApptPatientInput').value = '';
    document.getElementById('advApptDoctorInput').value = '';
  }
}

function setupAdvancedAppointmentListeners() {
  // Patient search - show all on focus if empty
  const patientInput = document.getElementById('advApptPatientInput');
  if (patientInput) {
    patientInput.addEventListener('input', debounce(function() {
      searchPatients(this.value);
    }, 200));
    patientInput.addEventListener('focus', function() {
      searchPatients(this.value);
    });
  }

  // Doctor search - show all on focus if empty
  const doctorInput = document.getElementById('advApptDoctorInput');
  if (doctorInput) {
    doctorInput.addEventListener('input', debounce(function() {
      searchDoctors(this.value);
    }, 200));
    doctorInput.addEventListener('focus', function() {
      searchDoctors(this.value);
    });
  }

  // Real-time capacity check on date/time change (disabled - Capacity Check panel removed)
  const dateInput = document.getElementById('advApptDate');
  const timeInput = document.getElementById('advApptTime');
  // if (dateInput) dateInput.addEventListener('change', updateCapacityCheck);
  // if (timeInput) timeInput.addEventListener('change', updateCapacityCheck);

  // Form submission
  const form = document.getElementById('advancedAppointmentForm');
  if (form) {
    form.addEventListener('submit', handleAdvancedAppointmentSubmit);
  }

  // Close dropdown on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-input-wrapper')) {
      document.getElementById('advApptPatientDropdown').style.display = 'none';
      document.getElementById('advApptDoctorDropdown').style.display = 'none';
    }
  });
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function searchPatients(query) {
  const dropdown = document.getElementById('advApptPatientDropdown');
  
  try {
    // If empty query, show all patients
    const searchQuery = query && query.length >= 1 ? query : '';
    const response = await fetchJson(`api.php?action=module&module=patients&limit=12${searchQuery ? '&search=' + encodeURIComponent(searchQuery) : ''}`);
    const patients = Array.isArray(response) ? response : [];
    
    dropdown.innerHTML = '';
    
    if (patients.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'search-dropdown-item';
      emptyItem.style.color = '#999';
      emptyItem.textContent = 'No patients found';
      dropdown.appendChild(emptyItem);
      dropdown.style.display = 'block';
      return;
    }
    
    patients.slice(0, 12).forEach(patient => {
      const item = document.createElement('div');
      item.className = 'search-dropdown-item';
      const contact = patient.contact ? `<br/><small style="color: #999;">${patient.contact}</small>` : '';
      item.innerHTML = `<div><strong>${patient.full_name || patient.name}</strong>${contact}</div>`;
      item.addEventListener('click', function() {
        document.getElementById('advApptPatientInput').value = patient.full_name || patient.name;
        document.getElementById('advApptPatientId').value = patient.id;
        dropdown.style.display = 'none';
        // updateCapacityCheck(); // Removed - Capacity Check panel removed
        loadRecentPatients();
      });
      dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
  } catch (error) {
    console.error('Error searching patients:', error);
    dropdown.innerHTML = '<div class="search-dropdown-item" style="color: #d32f2f;">Error loading patients</div>';
    dropdown.style.display = 'block';
  }
}

async function searchDoctors(query) {
  const dropdown = document.getElementById('advApptDoctorDropdown');
  
  try {
    // If empty query, show all doctors
    const searchQuery = query && query.length >= 1 ? query : '';
    const response = await fetchJson(`api.php?action=module&module=doctors&limit=12${searchQuery ? '&search=' + encodeURIComponent(searchQuery) : ''}`);
    const doctors = Array.isArray(response) ? response : [];
    
    dropdown.innerHTML = '';
    
    if (doctors.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'search-dropdown-item';
      emptyItem.style.color = '#999';
      emptyItem.textContent = 'No doctors found';
      dropdown.appendChild(emptyItem);
      dropdown.style.display = 'block';
      return;
    }
    
    doctors.slice(0, 12).forEach(doctor => {
      const item = document.createElement('div');
      item.className = 'search-dropdown-item';
      const specialty = doctor.specialty ? `<br/><small style="color: #999;">${doctor.specialty}</small>` : '';
      item.innerHTML = `<div><strong>${doctor.full_name || doctor.name}</strong>${specialty}</div>`;
      item.addEventListener('click', function() {
        document.getElementById('advApptDoctorInput').value = doctor.full_name || doctor.name;
        document.getElementById('advApptDoctorId').value = doctor.id;
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
  } catch (error) {
    console.error('Error searching doctors:', error);
    dropdown.innerHTML = '<div class="search-dropdown-item" style="color: #d32f2f;">Error loading doctors</div>';
    dropdown.style.display = 'block';
  }
}

async function loadAvailableWards() {
  try {
    const response = await fetchJson('api.php?action=module&module=wards&limit=20');
    const wards = Array.isArray(response) ? response : [];
    
    const wardSelect = document.getElementById('advApptWard');
    if (wardSelect) {
      const currentValue = wardSelect.value;
      wardSelect.innerHTML = '<option value="">Select Ward</option>';
      
      wards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward.id;
        option.textContent = ward.ward_name || ward.name || 'Unknown Ward';
        wardSelect.appendChild(option);
      });
      
      wardSelect.value = currentValue;
    }
  } catch (error) {
    console.error('Error loading wards:', error);
  }
}

async function loadRecentPatients() {
  try {
    const response = await fetchJson('api.php?action=module&module=patients&limit=5');
    const patients = Array.isArray(response) ? response.slice(0, 5) : [];
    
    const container = document.getElementById('advApptRecentPatients');
    if (container) {
      if (patients.length === 0) {
        container.innerHTML = '<p class="loading-text">No recent patients</p>';
        return;
      }

      container.innerHTML = '';
      patients.forEach(patient => {
        const initials = (patient.full_name || patient.name || 'P').split(' ').map(n => n[0]).join('').toUpperCase();
        const item = document.createElement('div');
        item.className = 'recent-patient-item';
        item.innerHTML = `
          <div class="patient-avatar">${initials}</div>
          <div class="patient-info">
            <p class="patient-name">${patient.full_name || patient.name}</p>
            <p class="patient-detail">Last visit: ${patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        `;
        item.addEventListener('click', function() {
          document.getElementById('advApptPatientInput').value = patient.full_name || patient.name;
          document.getElementById('advApptPatientId').value = patient.id;
        });
        container.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error loading recent patients:', error);
  }
}

async function updateCapacityCheck() {
  try {
    const date = document.getElementById('advApptDate').value;
    const time = document.getElementById('advApptTime').value;
    
    if (!date) return;

    // Get total appointments for the day
    const response = await fetchJson('api.php?action=module&module=appointments');
    const appointments = Array.isArray(response) ? response : [];
    const todayAppointments = appointments.filter(a => a.date === date);
    
    // Calculate capacity (assuming max 12 appointments per day)
    const maxCapacity = 12;
    const currentLoad = todayAppointments.length;
    const capacityPercent = Math.min((currentLoad / maxCapacity) * 100, 100);
    
    // Update capacity bar
    const capacityBar = document.getElementById('advApptCapacityBar');
    const capacityPercent_el = document.getElementById('advApptCapacityPercent');
    if (capacityBar) capacityBar.style.width = capacityPercent + '%';
    if (capacityPercent_el) capacityPercent_el.textContent = Math.round(capacityPercent) + '%';
    
    // Find next available slot
    const baseHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
    const usedTimes = new Set(todayAppointments.map(a => a.time?.split(':')[0]));
    const nextAvailableHour = baseHours.find(h => !usedTimes.has(String(h).padStart(2, '0')));
    
    const nextSlot = document.getElementById('advApptNextSlot');
    if (nextSlot && nextAvailableHour) {
      nextSlot.textContent = String(nextAvailableHour).padStart(2, '0') + ':00';
    }
  } catch (error) {
    console.error('Error updating capacity check:', error);
  }
}

async function handleAdvancedAppointmentSubmit(e) {
  e.preventDefault();
  
  const patientId = document.getElementById('advApptPatientId').value;
  const patientName = document.getElementById('advApptPatientInput').value;
  const doctorId = document.getElementById('advApptDoctorId').value;
  const doctorName = document.getElementById('advApptDoctorInput').value;
  const date = document.getElementById('advApptDate').value;
  const time = document.getElementById('advApptTime').value;
  const purpose = document.getElementById('advApptPurpose').value;
  const wardId = document.getElementById('advApptWard').value;
  const urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'REGULAR';
  const notes = document.getElementById('advApptNotes').value;
  
  // Validation
  if (!patientId || !date || !time || !purpose || !wardId || !doctorId) {
    showToast('Please fill in all required fields', 'warning');
    return;
  }

  const statusIndicator = document.getElementById('advApptStatusIndicator');
  if (statusIndicator) {
    statusIndicator.className = 'appt-status-indicator appt-status-saving';
    statusIndicator.innerHTML = '<span class="status-icon">⏳</span><span class="status-message">Creating appointment...</span>';
  }

  try {
    // Get ward name
    const wardsResponse = await fetchJson('api.php?action=module&module=wards');
    const wards = Array.isArray(wardsResponse) ? wardsResponse : [];
    const selectedWard = wards.find(w => w.id == wardId);
    const wardName = selectedWard?.ward_name || 'General Ward';

    const payload = {
      patient: patientName,
      patient_id: patientId,
      doctor: doctorName,
      doctor_id: doctorId,
      date: date,
      time: time,
      purpose: purpose,
      ward: wardName,
      ward_id: wardId,
      status: 'PENDING',
      notes: notes
    };

    const response = await fetchJsonPost('api.php?action=appointment_save&_t=' + Date.now(), payload);

    if (response && response.appointment) {
      if (statusIndicator) {
        statusIndicator.className = 'appt-status-indicator appt-status-success';
        statusIndicator.innerHTML = '<span class="status-icon">✓</span><span class="status-message">Appointment created successfully!</span>';
      }
      
      showToast('✓ Appointment created!');
      
      // Refresh data
      if (state.module === 'appointments') {
        state.rows.push(response.appointment);
        state.originalRows = [...state.rows];
        renderRows(getFilteredRows());
        updateAppointmentsSidebar(state.rows);
      }

      // Close modal after success
      setTimeout(() => {
        closeAdvancedAppointmentModal();
      }, 1300);
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
    if (statusIndicator) {
      statusIndicator.className = 'appt-status-indicator appt-status-error';
      statusIndicator.innerHTML = '<span class="status-icon">✕</span><span class="status-message">Failed to create appointment</span>';
    }
    showToast('Error creating appointment', 'error');
  }
}

function undoAction() {
  if (!state.undoStack) {
    showToast("Nothing to undo", "warning");
    return;
  }
  if (state.undoStack.type === "delete") {
    state.rows.splice(state.undoStack.index, 0, state.undoStack.row);
    state.originalRows = [...state.rows];
    renderRows(getFilteredRows());
    // Update sidebar calendar in real-time
    if (state.module === "appointments") {
      updateAppointmentsSidebar(state.rows);
    }
    showToast("Undo complete. Record restored.");
  }
  state.undoStack = null;
  if (undoBtn) undoBtn.disabled = true;
}

function restoreSidebarToDefault() {
  try {
    // Restore the sidebar to its default state when leaving appointments module
    const cardsContainer = document.getElementById("cards");
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <article class="card card-patients"><h3 id="totalPatients">0</h3><p>Total Patients</p></article>
        <article class="card card-doctors"><h3 id="activeDoctors">0</h3><p>Active Doctors</p></article>
        <article class="card card-wards"><h3 id="availableBeds">0</h3><p>Available Beds</p></article>
        <article class="card card-appointments"><h3 id="appointmentsToday">0</h3><p>Appointments Today</p></article>
      `;
    }

    // Restore the meta text
    const overviewMetaEl = document.getElementById("overviewMeta");
    if (overviewMetaEl) {
      overviewMetaEl.textContent = "Waiting for data...";
    }

    // Clear and restore miniChart
    const miniChartEl = document.getElementById("miniChart");
    if (miniChartEl) {
      miniChartEl.innerHTML = "";
      miniChartEl.className = "mini-chart";
      renderChart();
    }
  } catch (error) {
    console.error("Error restoring sidebar:", error);
  }
}

function renderRows(rows) {
  // Custom rendering for appointments dashboard
  if (state.module === "appointments") {
    moduleTitle.textContent = "Appointments Dashboard";
    renderAppointmentsDashboard(rows);
    return;
  }

  // Restore sidebar when switching away from appointments
  if (state.lastModule === "appointments") {
    const tablePanel = document.querySelector(".table-panel");
    if (tablePanel) {
      tablePanel.classList.remove("appointments-mode");
    }
    restoreSidebarToDefault();
  }
  state.lastModule = state.module;

  tableBody.innerHTML = "";
  tableHead.innerHTML = "";

  if (state.module === "patients") {
    tableBody.classList.add("patients-board");
  } else {
    tableBody.classList.remove("patients-board");
  }

  if (!rows.length) {
    tableHead.innerHTML = "<th>Result</th>";
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = "No records found.";
    tr.appendChild(td);
    tableBody.appendChild(tr);
    return;
  }

  let columns = Object.keys(rows[0]);
  console.log("DEBUG: renderRows - All columns from data:", columns);

  if (state.module === "patients") {
    const preferredColumns = ["id", "full_name", "gender", "status", "dob", "contact", "doctor", "ward"];
    const hiddenColumns = new Set(["doctor_id", "ward_id", "medical_history", "username", "password"]);
    const visibleColumns = columns.filter((col) => !hiddenColumns.has(String(col).toLowerCase()));
    const remainingColumns = visibleColumns.filter((col) => !preferredColumns.includes(col));
    columns = [...preferredColumns.filter((col) => visibleColumns.includes(col)), ...remainingColumns];
    console.log("DEBUG: renderRows - Final columns for patients:", columns);
    console.log("DEBUG: renderRows - Status column included?", columns.includes("status"));
    if (columns.includes("status") && rows.length > 0) {
      console.log("DEBUG: Sample patient status:", rows[0]?.status);
    }
  }

  columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    th.classList.add(`col-${String(col).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
    tableHead.appendChild(th);
  });

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.classList.add("user-row");
    tr.tabIndex = 0;
    if (state.selectedRowRef === row) {
      tr.classList.add("selected");
    }
    tr.addEventListener("click", () => {
      [...tableBody.querySelectorAll("tr.user-row")].forEach((line) => line.classList.remove("selected"));
      tr.classList.add("selected");
      state.selectedIndex = [...tableBody.querySelectorAll("tr.user-row")].indexOf(tr);
      state.selectedRowRef = row;
      // Show inline details only for patients module
      if (state.module === "patients") {
        renderPatientInlineDetails(row);
      }
      // Hide patient details panel for all other modules
      if (patientDetailsPanel) {
        patientDetailsPanel.hidden = true;
      }
    });
    columns.forEach((col) => {
      const td = document.createElement("td");
      td.classList.add(`col-${String(col).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);

      if (state.module === "patients" && String(col).toLowerCase() === "gender") {
        const rawGender = String(row[col] ?? "").trim();
        const normalizedGender = rawGender.toLowerCase();
        const genderBadge = document.createElement("span");
        genderBadge.className = "gender-badge";

        if (normalizedGender === "male" || normalizedGender === "boy") {
          genderBadge.classList.add("gender-boy");
          genderBadge.textContent = "Male";
        } else if (normalizedGender === "female" || normalizedGender === "girl") {
          genderBadge.classList.add("gender-girl");
          genderBadge.textContent = "Female";
        } else {
          genderBadge.classList.add("gender-other");
          genderBadge.textContent = rawGender || "Other";
        }

        td.appendChild(genderBadge);
      } else if (["status", "payment_status", "action"].includes(String(col).toLowerCase())) {
        const rawStatus = row[col] ?? "";
        const statusPill = document.createElement("span");
        const semanticType = semanticTypeFromStatus(rawStatus);
        statusPill.className = `status-pill status-pill-${semanticType}`;
        let displayText = String(rawStatus || "-");
        if (state.module === "patients" && String(col).toLowerCase() === "status") {
          displayText = formatStatusLabel(displayText);
          // REAL-TIME: Make patient status clickable for quick updates
          statusPill.style.cursor = "pointer";
          statusPill.title = "Click to change status";
          statusPill.addEventListener("click", (e) => {
            e.stopPropagation();
            openQuickStatusChangeMenu(row, statusPill);
          });
        }
        statusPill.textContent = displayText;
        td.appendChild(statusPill);
      } else {
        const rawValue = row[col] ?? "";
        if (state.module === "patients" && typeof rawValue === "string" && rawValue.length > 38) {
          td.textContent = `${rawValue.slice(0, 35)}...`;
          td.title = rawValue;
        } else {
          td.textContent = rawValue;
        }
      }

      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

async function loadModuleData() {
  if (isAnalyticsModule()) {
    toggleAnalyticsModeUI(true);
    await loadAnalyticsData();
    return;
  }

  toggleAnalyticsModeUI(false);
  
  // Show loading feedback for appointments module
  if (state.module === "appointments") {
    showStatus("Loading appointments...");
  }
  
  try {
    // Always use cache busting to ensure fresh data from server
    const apiUrl = `api.php?action=module&module=${encodeURIComponent(state.module)}`;
    console.log("DEBUG: loadModuleData calling API:", apiUrl);
    const rows = await fetchJson(apiUrl, { cacheBust: true });
    console.log("DEBUG: loadModuleData API response:", Array.isArray(rows) ? `${rows.length} rows` : typeof rows);
    
    // PRESERVE: Store previously selected patient ID before updating rows
    const previouslySelectedPatientId = state.selectedRowRef ? state.selectedRowRef.id : null;
    
    // Deduplicate patients by ID (in case of duplicate records from database)
    let rows_to_use = Array.isArray(rows) ? rows : [];
    if (state.module === 'patients') {
      const seen = new Set();
      rows_to_use = rows_to_use.filter(row => {
        if (seen.has(row.id)) {
          console.log("DEBUG: Filtering duplicate patient ID:", row.id);
          return false;
        }
        seen.add(row.id);
        return true;
      });
      console.log("DEBUG: After deduplication:", rows_to_use.length, "patients");
    }
    
    state.rows = rows_to_use;
    if (state.module === "inventory" && state.rows.length === 0) {
      state.rows = getInventorySampleRows();
      showToast("Loaded real-life example inventory items.");
    }
    state.originalRows = [...state.rows];
    state.selectedIndex = null;
    state.selectedRowRef = null;
    updateCrudActionLabels();
    updateSortToggleLabel();
    console.log("DEBUG: loadModuleData calling renderRows with", state.rows.length, "rows");
    renderRows(getFilteredRows());
    
    // PRESERVE: Re-select the same patient if it still exists in updated data
    if (state.module === "patients" && previouslySelectedPatientId !== null) {
      const reselectedPatient = state.rows.find(p => p.id === previouslySelectedPatientId);
      if (reselectedPatient) {
        state.selectedRowRef = reselectedPatient;
        console.log("DEBUG: Restored selected patient:", previouslySelectedPatientId);
        
        // Highlight the row in the table FIRST (before rendering details)
        const rows = document.querySelectorAll("#tableBody tr.user-row");
        rows.forEach(row => row.classList.remove("selected"));
        const matchingRow = Array.from(rows).find(r => {
          const firstTd = r.querySelector("td");
          return firstTd && firstTd.textContent.includes(String(reselectedPatient.id));
        });
        if (matchingRow) {
          matchingRow.classList.add("selected");
          // NOW render the inline details after the row is marked as selected
          renderPatientInlineDetails(reselectedPatient);
        }
      } else {
        console.log("DEBUG: Previously selected patient no longer exists");
        // Don't clear details if patient no longer exists - keep showing last valid data
      }
    }
    
    renderRecent(state.rows);
    showStatus("");
    
    // Show feedback toasts for all modules including appointments
    if (state.module === "patients" && state.rows.length > 0) {
      console.log("DEBUG: Patient data loaded, sample:", JSON.stringify(state.rows[0]));
      showToast(`${state.rows.length} patients loaded successfully`);
    } else if (state.module === "appointments" && state.rows.length > 0) {
      showToast(`${state.rows.length} appointments loaded successfully`, "success");
    } else if (state.rows.length > 0) {
      showToast(`${state.rows.length} records loaded successfully`);
    }
  } catch (error) {
    console.error("DEBUG: loadModuleData error:", error);
    // Keep the last successful dataset so transient API/session/network errors
    // do not wipe the visible table and look like data loss.
    renderRows(getFilteredRows());
    showToast(`Module load failed: ${error.message}`);
  }
}

// ===== BUILDING INFO EDIT FUNCTIONALITY =====
function initializeBuildingEditor() {
  const editBtn = document.getElementById('editBuildingBtn');
  const imageUpload = document.getElementById('buildingImageInput');
  const buildingName = document.getElementById('buildingName');
  const buildingLocation = document.getElementById('buildingLocation');
  
  if (!editBtn) return;
  
  editBtn.addEventListener('click', function() {
    enableBuildingEdit();
  });
  
  if (imageUpload) {
    imageUpload.addEventListener('change', handleBuildingImageUpload);
  }
}

function enableBuildingEdit() {
  const buildingCard = document.querySelector('.building-card');
  const buildingName = document.getElementById('buildingName');
  const buildingLocation = document.getElementById('buildingLocation');
  const buildingInfo = document.querySelector('.building-info');
  const buildingControls = document.querySelector('.building-edit-controls');
  
  // Store original content
  const originalName = buildingName.textContent;
  const originalLocation = buildingLocation.textContent;
  
  // Replace content with editable form
  buildingInfo.innerHTML = `
    <div class="building-image-upload">
      <label for="buildingImageInput" id="imageUploadLabel">
        📸 Click to upload building image
      </label>
    </div>
    <div class="building-form-group">
      <label>Building Name</label>
      <input type="text" id="editBuildingName" placeholder="e.g., Central Medical Complex" value="${originalName}">
    </div>
    <div class="building-form-group">
      <label>Location Details</label>
      <input type="text" id="editBuildingLocation" placeholder="e.g., Building B, Level 4" value="${originalLocation}">
    </div>
  `;
  
  buildingControls.innerHTML = `
    <button type="button" class="btn-save-building" onclick="saveBuildingEdit()">Save</button>
    <button type="button" class="btn-cancel-building" onclick="cancelBuildingEdit()">Cancel</button>
    <input type="file" id="buildingImageInput" accept="image/*" style="display: none;" />
  `;
  
  // Add click handler to upload label
  document.getElementById('imageUploadLabel').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = document.getElementById('buildingImageInput');
    if (fileInput) {
      fileInput.click();
    }
  });
  
  // Ensure the file input has the change event listener
  const fileInput = document.getElementById('buildingImageInput');
  if (fileInput) {
    fileInput.removeEventListener('change', handleBuildingImageUpload);
    fileInput.addEventListener('change', handleBuildingImageUpload);
  }
}

function handleBuildingImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const imageContainer = document.getElementById('buildingImageDisplay');
    imageContainer.innerHTML = `<img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    
    // Store image in localStorage
    try {
      localStorage.setItem('buildingImage', event.target.result);
    } catch (e) {
      console.warn('Could not save image to localStorage:', e);
    }
  };
  reader.readAsDataURL(file);
}

function saveBuildingEdit() {
  const editedName = document.getElementById('editBuildingName').value.trim();
  const editedLocation = document.getElementById('editBuildingLocation').value.trim();
  
  if (!editedName || !editedLocation) {
    showToast('Please fill in all fields', 'warning');
    return;
  }
  
  // Update the display
  const buildingInfo = document.querySelector('.building-info');
  buildingInfo.innerHTML = `
    <h4 id="buildingName" class="editable-field">${editedName}</h4>
    <p id="buildingLocation" class="editable-field">${editedLocation}</p>
  `;
  
  const buildingControls = document.querySelector('.building-edit-controls');
  buildingControls.innerHTML = `<button type="button" id="editBuildingBtn" class="btn-edit-building" title="Edit building details">✏️ Edit</button>`;
  
  // Reattach edit button listener
  document.getElementById('editBuildingBtn').addEventListener('click', function() {
    enableBuildingEdit();
  });
  
  // Store in localStorage
  localStorage.setItem('buildingName', editedName);
  localStorage.setItem('buildingLocation', editedLocation);
  
  showToast('Building details updated successfully', 'success');
}

function cancelBuildingEdit() {
  // Reload from display
  const buildingCard = document.querySelector('.building-card');
  location.reload();
}

function loadBuildingSettings() {
  const buildingNameEl = document.getElementById('buildingName');
  const buildingLocationEl = document.getElementById('buildingLocation');
  const buildingImageDisplay = document.getElementById('buildingImageDisplay');
  
  if (!buildingNameEl) return;
  
  const savedName = localStorage.getItem('buildingName');
  const savedLocation = localStorage.getItem('buildingLocation');
  const savedImage = localStorage.getItem('buildingImage');
  
  if (savedName) buildingNameEl.textContent = savedName;
  if (savedLocation) buildingLocationEl.textContent = savedLocation;
  if (savedImage && buildingImageDisplay) {
    buildingImageDisplay.innerHTML = `<img src="${savedImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
  }
}

loadSession()
  .then(() => {
    loadBuildingSettings();
    initializeBuildingEditor();
    updateCrudActionLabels();
    updateSortToggleLabel();
    refreshStatusFilterOptions();
    console.log("DEBUG: Status filter initialized for:", state.module);
    loadOverview();
    loadModuleData();
    startDashboardRealtimeSync();
    if (localStorage.getItem("pms-walkthrough-done") !== "yes") {
      startWalkthrough();
    }
  })
  .catch((error) => {
    showStatus(`Session error: ${error.message}`);
  });

window.addEventListener("beforeunload", () => {
  stopPatientRealtimeOptionsSync();
  stopDashboardRealtimeSync();
  stopAnalyticsRealtimeSync(); // === NEW: Stop analytics refresh on unload ===
});
