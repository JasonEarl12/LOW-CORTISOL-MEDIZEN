<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';
applySecurityHeaders();

$user = currentUser();

// Redirect unauthenticated users to patient login
if ($user === null) {
    header('Location: patient_login.php', true, 302);
    exit;
}

$csrfToken = csrfToken();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MEDIZEN - XAMPP Edition</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/styles.css?v=<?php echo filemtime(__DIR__ . '/assets/styles.css'); ?>-admindark2" />
  <link rel="stylesheet" href="assets/advanced-appointment-styles.css?v=<?php echo filemtime(__DIR__ . '/assets/advanced-appointment-styles.css'); ?>" />
  <link rel="stylesheet" href="assets/index-styles.css?v=<?php echo filemtime(__DIR__ . '/assets/index-styles.css'); ?>-admindark2" />
  <link rel="stylesheet" href="assets/patient-dashboard-styles.css?v=<?php echo filemtime(__DIR__ . '/assets/patient-dashboard-styles.css'); ?>" />
</head>
<body class="app-shell">
  <div class="bg-orb orb-1" aria-hidden="true"></div>
  <div class="bg-orb orb-2" aria-hidden="true"></div>

  <?php 
  // Show patient dashboard if user role is PATIENT
  if (strtoupper($user['role'] ?? '') === 'PATIENT'): 
  ?>
  
  <!-- PATIENT DASHBOARD -->
  <div class="patient-dashboard-container">
    <!-- Sidebar -->
    <aside class="patient-sidebar">
      <div class="patient-sidebar-brand">
        <span>
          <svg style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2z"/>
          </svg>
        </span>
        <div>
          <strong>Medizen</strong>
          <small>Clinical Sanctuary</small>
        </div>
      </div>

      <nav class="patient-nav">
        <button class="patient-nav-item active" onclick="patientShowSection('home')">
          <svg class="patient-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </button>
        <button class="patient-nav-item" onclick="patientShowSection('appointments')">
          <svg class="patient-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          My Appointments
        </button>
        <button class="patient-nav-item" onclick="patientShowSection('notifications')">
          <svg class="patient-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          Notifications
        </button>
        <button class="patient-nav-item" onclick="patientShowSection('reminders')">
          <svg class="patient-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="13" r="8"></circle>
            <path d="M12 9v4l3 2"></path>
          </svg>
          Reminders
        </button>
        <button class="patient-nav-item" onclick="patientShowSection('profile')">
          <svg class="patient-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Profile
        </button>
      </nav>

      <form method="post" action="auth.php" style="margin-top: auto;">
        <input type="hidden" name="action" value="logout" />
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>" />
        <button type="submit" class="patient-logout-btn">Logout</button>
      </form>
    </aside>

    <!-- Main Content -->
    <main class="patient-main">
      <!-- Header -->
      <header class="patient-header">
        <div>
          <h1>Hello, <?php echo htmlspecialchars($user['full_name'] ?? $user['username'] ?? 'Patient'); ?></h1>
          <div class="patient-header-date" id="patientCurrentDate">Today</div>
        </div>
        <div class="patient-user-info">
          <div class="patient-user-avatar"><?php echo strtoupper(substr($user['full_name'] ?? $user['username'] ?? 'P', 0, 1)); ?></div>
          <div class="patient-user-details">
            <strong><?php echo htmlspecialchars($user['full_name'] ?? $user['username'] ?? 'User'); ?></strong>
            <small>PATIENT</small>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="patient-content">
        <div id="patientHomeSection" style="display: block;">
          <!-- Next Appointment -->
          <div id="nextAptBanner" class="next-appointment-banner" style="display: none;">
            <div class="next-apt-label">NEXT UP</div>
            <div class="next-apt-content">
              <div class="next-apt-date">
                <div class="next-apt-month" id="nextAptMonth">--</div>
                <div class="next-apt-day" id="nextAptDay">--</div>
              </div>
              <div class="next-apt-details">
                <div class="next-apt-time" id="nextAptTime">--:--</div>
                <div class="next-apt-doctor" id="nextAptDoctor">📍 --</div>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="patient-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" style="color: #007B83;">
                  <circle cx="12" cy="13" r="8"></circle>
                  <path d="M12 9v4l3 2"></path>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">Active Reminders</div>
                <div class="stat-value" id="statReminders">0</div>
                <div class="stat-meta">Pending</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" style="color: #007B83;">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-label">Unread Mail</div>
                <div class="stat-value" id="statNotifications">0</div>
                <div class="stat-meta">New Alerts</div>
              </div>
            </div>
          </div>

          <!-- Main Body Grid -->
          <div class="patient-body">
            <!-- Left Column -->
            <div>
              <!-- Upcoming Appointments -->
              <section class="section-card">
                <div class="section-header">
                  <h2>Upcoming Appointments</h2>
                  <a href="#" class="see-all-link">See all →</a>
                </div>
                <div class="appointments-list" id="appointmentsList">
                  <p class="no-data">Loading appointments...</p>
                </div>
              </section>

              <!-- Health Reminders -->
              <section class="section-card">
                <h2 style="margin-bottom: 16px;">Health Reminders</h2>
                <div class="health-reminders" id="remindersList">
                  <p class="no-data">No active reminders</p>
                </div>
              </section>

            </div>

            <!-- Right Column -->
            <div>
              <!-- Recent Activity -->
              <section class="section-card">
                <h2 style="margin-bottom: 16px;">Recent Activity</h2>
                <div class="activity-list" id="activityList">
                  <p class="no-data">No recent activity</p>
                </div>
              </section>

              <!-- Support Widget -->
            </div>
          </div>
        </div>

        <!-- Other Sections Placeholder -->
        <div id="patientAppointmentsSection" style="display: none;">
          <div class="section-card">
            <h2>My Appointments</h2>
            <div id="allAppointmentsList"></div>
          </div>
        </div>
        <div id="patientNotificationsSection" style="display: none;">
          <div class="section-card">
            <h2>Notifications</h2>
            <div id="notificationsList"></div>
          </div>
        </div>
        <div id="patientRemindersSection" style="display: none;">
          <div class="section-card">
            <h2>Health Reminders</h2>
            <div id="allRemindersList"></div>
          </div>
        </div>
        <div id="patientProfileSection" style="display: none;">
          <div class="section-card">
            <h2>My Profile</h2>
            <div id="profileContent"></div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <script>
    // Patient Dashboard JavaScript
    const patientUser = <?php echo json_encode($user, JSON_UNESCAPED_SLASHES); ?>;
    let dashboardData = {}; // Store dashboard data globally
    let patientCurrentConversationId = null;
    let patientCurrentAdminId = null;
    let patientSupportAdminId = 1;
    
    function formatDate(isoDate) {
      if (!isoDate) return '--';
      const d = new Date(isoDate);
      return d.toLocaleDateString([], { month: 'short', day: '2-digit' });
    }

    function formatTime(isoDate) {
      if (!isoDate) return '--:--';
      const d = new Date(isoDate);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatDateTime(isoDate) {
      if (!isoDate) return '--';
      const d = new Date(isoDate);
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function updateCurrentDate() {
      const today = new Date();
      document.getElementById('patientCurrentDate').textContent = today.toLocaleDateString([], { 
        month: 'long', day: 'numeric', year: 'numeric' 
      });
    }

    function getStatusColor(status) {
      const s = (status || '').toUpperCase();
      if (s === 'CONFIRMED' || s === 'COMPLETED') return '#10b981';
      if (s === 'PENDING') return '#f59e0b';
      if (s === 'URGENT' || s === 'CANCELLED') return '#ef4444';
      return '#3b82f6';
    }

    function getUpcomingAppointments(appointments) {
      const now = new Date();
      return (appointments || []).filter(apt => {
        const status = String(apt?.status || '').toUpperCase();
        if (status === 'CANCELLED') return false;

        const aptDate = new Date(apt.dateTime || (apt.date && apt.time ? `${apt.date} ${apt.time}` : apt.date || ''));
        return !Number.isNaN(aptDate.getTime()) ? aptDate >= now : true;
      });
    }

    function renderAppointmentsSection(appointments) {
      const list = document.getElementById('allAppointmentsList');
      if (!appointments || appointments.length === 0) {
        list.innerHTML = '<p class="no-data">📅 No appointments scheduled</p>';
        return;
      }
      
      list.innerHTML = appointments.map(apt => {
        const status = (apt.status || 'SCHEDULED').toUpperCase();
        const statusColor = getStatusColor(status);
        let month = 'Jan', day = '00', time = '00:00', fullDate = '';
        
        // Parse dateTime or use separate date/time fields
        if (apt.dateTime) {
          const parts = apt.dateTime.split(' ');
          const datePart = parts[0];
          const timePart = parts[1];
          
          if (datePart) {
            const [year, m, d] = datePart.split('-');
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            month = monthNames[parseInt(m) - 1] || 'Jan';
            day = parseInt(d).toString();
            fullDate = `${month} ${day}, ${year}`;
          }
          
          if (timePart) {
            time = timePart.substring(0, 5);
          }
        } else if (apt.date) {
          // Fallback to separate date/time fields
          const [year, m, d] = apt.date.split('-');
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          month = monthNames[parseInt(m) - 1] || 'Jan';
          day = parseInt(d).toString();
          fullDate = `${month} ${day}, ${year}`;
          time = apt.time ? apt.time.substring(0, 5) : '00:00';
        }
        
        const doctor = apt.doctor || 'Not assigned';
        
        return `
          <div class="appointment-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; margin-bottom: 0.8rem;">
            <div class="apt-date-badge" style="border: 2px solid ${statusColor}; padding: 0.5rem 0.75rem; border-radius: 6px; text-align: center; min-width: 60px; background: white;">
              <div class="apt-month" style="font-size: 0.75rem; font-weight: 600; color: #666; text-transform: uppercase;">${month}</div>
              <div class="apt-day" style="font-size: 1.5rem; font-weight: 700; color: #333;">${day}</div>
            </div>
            <div class="apt-details" style="flex: 1;">
              <div class="apt-title" style="font-weight: 600; color: #333; margin-bottom: 0.25rem;">Dr. ${doctor}</div>
              <div class="apt-time" style="color: #666; font-size: 0.95rem;">⏰ ${time}</div>
              <div style="color: #999; font-size: 0.85rem; margin-top: 0.25rem;">${fullDate}</div>
            </div>
            <button class="apt-status" style="background-color: ${statusColor}; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: default;">${status}</button>
          </div>
        `;
      }).join('');
    }

    function renderNotificationsSection(notifications) {
      const list = document.getElementById('notificationsList');
      if (!notifications || notifications.length === 0) {
        list.innerHTML = '<p class="no-data">No notifications</p>';
        return;
      }
      
      list.innerHTML = notifications.map(notif => `
        <div class="notification-item">
          <div>${notif.title}</div>
          <div style="color: #666; font-size: 13px; margin-top: 4px;">${notif.message}</div>
          <div style="font-size: 11px; color: #aaa; margin-top: 4px;">${formatDateTime(notif.created_at)}</div>
        </div>
      `).join('');
    }

    function renderRemindersSection(reminders) {
      const list = document.getElementById('allRemindersList');
      if (!reminders || reminders.length === 0) {
        list.innerHTML = '<p class="no-data">No reminders</p>';
        return;
      }
      
      list.innerHTML = reminders.map(reminder => `
        <div class="reminder-card">
          <div>${reminder.title}</div>
          <div>${reminder.description}</div>
          <div>Status: ${reminder.status}</div>
        </div>
      `).join('');
    }

    function smartOpenChat() {
      alert('Messaging has been disabled.');
    }

    function renderProfileSection(profile) {
      const content = document.getElementById('profileContent');
      if (!profile || !profile.full_name) {
        content.innerHTML = '<p class="no-data">Profile information not available</p>';
        return;
      }
      
      content.innerHTML = `
        <div>
          <div>
            <label>Full Name</label>
            <div>${profile.full_name}</div>
          </div>
          <div>
            <label>Email</label>
            <div>${profile.email || 'N/A'}</div>
          </div>
          <div>
            <label>Phone</label>
            <div>${profile.phone || 'N/A'}</div>
          </div>
          <div>
            <label>Status</label>
            <div>${profile.status || 'N/A'}</div>
          </div>
        </div>
      `;
    }

    async function loadPatientDashboard() {
      try {
        // First ensure patient is linked to their patient record
        const linkResponse = await fetch('api.php?action=ensure_patient_link', {
          credentials: 'include'
        });
        
        const linkData = await linkResponse.json();
        if (linkData.patient_id) {
          // Update global patient user with the patient_id from API
          if (patientUser.patient_id !== linkData.patient_id) {
            patientUser.patient_id = linkData.patient_id;
            console.log('🔗 [PATIENT LINK] Patient linked: ID ' + linkData.patient_id + ' (status: ' + linkData.status + ')');
          }
        }
        
        // Now fetch the patient dashboard data
        const response = await fetch('api.php?action=getPatientDashboard', {
          credentials: 'include',
          headers: { 'X-User-ID': patientUser.id || patientUser.patient_id }
        });
        
        if (!response.ok) {
          const errorMsg = 'HTTP ' + response.status;
          throw new Error('Failed to load dashboard: ' + errorMsg);
        }
        
        const data = await response.json();
        
        console.log('📊 [DASHBOARD API RESPONSE]', {
          hasError: !!data.error,
          error: data.error,
          appointmentCount: (data.appointments || []).length,
          appointmentData: data.appointments,
          patientId: data.patient_id,
          debug: data.debug
        });
        
        // Check if there's an error in the API response
        if (data.error) {
          console.error('❌ API Error:', data.error, 'Debug info:', data.debug);
          document.getElementById('appointmentsList').innerHTML = '<p class="no-data">⚠️ ' + data.error + '</p>';
          return;
        }
        
        // Store data globally for section rendering
        dashboardData = data;
        patientSupportAdminId = data.support_admin_id || patientSupportAdminId || 1;
        
        // Update stats
        const reminders = data.reminders?.filter(r => !r.completed) || [];
        const notifications = data.notifications?.filter(n => !n.read) || [];
        document.getElementById('statReminders').textContent = reminders.length;
        document.getElementById('statNotifications').textContent = notifications.length;

        // Next appointment
        const upcomingAppointments = data.upcoming_appointments || getUpcomingAppointments(data.appointments || []);
        const pastAppointments = data.past_appointments || (data.appointments || []).filter(a => !getUpcomingAppointments([a]).length);
        const nextApt = upcomingAppointments[0] || (data.appointments || [])[0];
        if (nextApt) {
          const aptDate = new Date(nextApt.dateTime || (nextApt.date + ' ' + nextApt.time));
          const monthStr = aptDate.toLocaleDateString('en-US', { month: 'short' });
          const dayStr = aptDate.getDate().toString().padStart(2, '0');
          const timeStr = aptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          
          document.getElementById('nextAptBanner').style.display = 'block';
          document.getElementById('nextAptMonth').textContent = monthStr;
          document.getElementById('nextAptDay').textContent = dayStr;
          document.getElementById('nextAptTime').textContent = timeStr;
          document.getElementById('nextAptDoctor').textContent = '📍 ' + (nextApt.doctor || 'Doctor');
        } else {
          document.getElementById('nextAptBanner').style.display = 'none';
        }

        // Appointments list - show all upcoming appointments
        const appointmentsList = document.getElementById('appointmentsList');
        const aptCount = upcomingAppointments.length;
        
        console.log('📅 [APPOINTMENTS RENDERING] Count: ' + aptCount + ', Data:', data.appointments);
        
        if (aptCount > 0) {
          const apts = upcomingAppointments
            .filter(a => a.status?.toUpperCase() !== 'CANCELLED')
            .slice(0, 5);
          
          console.log('📅 [APPOINTMENTS] After filter: ' + apts.length + ' appointments to display');
          
          appointmentsList.innerHTML = apts.map(apt => {
            // Parse date properly - handle both formats
            let month = 'Jan', day = '00', time = '00:00', fullDate = '';
            
            if (apt.dateTime) {
              const parts = apt.dateTime.split(' ');
              const datePart = parts[0]; // YYYY-MM-DD
              const timePart = parts[1]; // HH:MM:SS
              
              if (datePart) {
                const [year, m, d] = datePart.split('-');
                const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                month = monthNames[parseInt(m) - 1] || 'Jan';
                day = parseInt(d).toString();
                fullDate = `${month} ${day}, ${year}`;
              }
              
              if (timePart) {
                time = timePart.substring(0, 5); // HH:MM
              }
            } else if (apt.date) {
              const [year, m, d] = apt.date.split('-');
              const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              month = monthNames[parseInt(m) - 1] || 'Jan';
              day = parseInt(d).toString();
              fullDate = `${month} ${day}, ${year}`;
              time = apt.time ? apt.time.substring(0, 5) : '00:00';
            }
            
            const status = (apt.status || 'SCHEDULED').toUpperCase();
            const statusColor = getStatusColor(status);
            const doctor = apt.doctor || 'Not assigned';
            
            console.log('📅 [APT ITEM] Rendering:', {doctor, date: fullDate, time, status, dateTime: apt.dateTime, date: apt.date, time: apt.time});
            
            return `
            <div class="appointment-item" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 6px; background: white; margin-bottom: 0.6rem;">
              <div style="border: 2px solid ${statusColor}; padding: 0.4rem 0.5rem; border-radius: 4px; text-align: center; min-width: 50px; background: #fafafa;">
                <div style="font-size: 0.7rem; font-weight: 600; color: #666; text-transform: uppercase;">${month}</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: #333; line-height: 1;">${day}</div>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #333; font-size: 0.95rem; margin-bottom: 0.2rem;">Dr. ${doctor}</div>
                <div style="color: #666; font-size: 0.9rem;">⏰ ${time}</div>
              </div>
              <div style="background-color: ${statusColor}; color: white; padding: 0.4rem 0.8rem; border-radius: 3px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">${status}</div>
            </div>
          `;
          }).join('');
        } else {
          console.log('⚠️  [APPOINTMENTS] No appointments to display');
          appointmentsList.innerHTML = '<p class="no-data">📅 No upcoming appointments scheduled</p>';
        }

        // Also update the separate appointments section
        const allAppointmentsList = document.getElementById('allAppointmentsList');
        if (allAppointmentsList) {
          if ((data.appointments || []).length > 0) {
            allAppointmentsList.innerHTML = (data.appointments || []).map(apt => {
              // Parse date properly - handle both formats
              let month = 'Jan', day = '00', time = '00:00', fullDate = '';
              
              if (apt.dateTime) {
                const parts = apt.dateTime.split(' ');
                const datePart = parts[0]; // YYYY-MM-DD
                const timePart = parts[1]; // HH:MM:SS
                
                if (datePart) {
                  const [year, m, d] = datePart.split('-');
                  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  month = monthNames[parseInt(m) - 1] || 'Jan';
                  day = parseInt(d).toString();
                  fullDate = `${month} ${day}, ${year}`;
                }
                
                if (timePart) {
                  time = timePart.substring(0, 5); // HH:MM
                }
              } else if (apt.date) {
                const [year, m, d] = apt.date.split('-');
                const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                month = monthNames[parseInt(m) - 1] || 'Jan';
                day = parseInt(d).toString();
                fullDate = `${month} ${day}, ${year}`;
                time = apt.time ? apt.time.substring(0, 5) : '00:00';
              }
              
              const status = (apt.status || 'SCHEDULED').toUpperCase();
              const statusColor = getStatusColor(status);
              const doctor = apt.doctor || 'Not assigned';
              
              return `
              <div class="appointment-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; margin-bottom: 0.8rem;">
                <div class="apt-date-badge" style="border: 2px solid ${statusColor}; padding: 0.5rem 0.75rem; border-radius: 6px; text-align: center; min-width: 60px; background: white;">
                  <div class="apt-month" style="font-size: 0.75rem; font-weight: 600; color: #666; text-transform: uppercase;">${month}</div>
                  <div class="apt-day" style="font-size: 1.5rem; font-weight: 700; color: #333;">${day}</div>
                </div>
                <div class="apt-details" style="flex: 1;">
                  <div class="apt-title" style="font-weight: 600; color: #333; margin-bottom: 0.25rem;">Dr. ${doctor}</div>
                  <div class="apt-time" style="color: #666; font-size: 0.95rem;">⏰ ${time}</div>
                  <div style="color: #999; font-size: 0.85rem; margin-top: 0.25rem;">${fullDate}</div>
                </div>
                <button class="apt-status" style="background-color: ${statusColor}; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: default;">${status}</button>
              </div>
            `;
            }).join('');
          } else {
            allAppointmentsList.innerHTML = '<p class="no-data">📅 No upcoming appointments scheduled</p>';
          }
        }

        // Reminders - Home section
        const remindersList = document.getElementById('remindersList');
        if ((data.reminders || []).length > 0) {
          remindersList.innerHTML = (data.reminders || []).slice(0, 3).map(r => `
            <div style="padding: 0.75rem; border-left: 4px solid #f59e0b; background: #fffbf0; border-radius: 4px; margin-bottom: 0.5rem;">
              <div style="font-weight: 600; color: #d97706; font-size: 0.95rem;">${r.title}</div>
              <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">${r.description || 'No description'}</div>
              <div style="font-size: 0.85rem; color: #aaa; margin-top: 0.25rem;">Status: ${r.status || 'ACTIVE'}</div>
            </div>
          `).join('');
        } else {
          remindersList.innerHTML = '<p class="no-data">✓ No active reminders</p>';
        }
        
        // All reminders section now shows upcoming and past appointments
        const allRemindersList = document.getElementById('allRemindersList');
        if (allRemindersList) {
          if (upcomingAppointments.length > 0 || pastAppointments.length > 0) {
            const renderAppointmentBlock = (title, items, accentColor) => items.length > 0 ? `
              <div style="margin-bottom: 1rem;">
                <h3 style="margin: 0 0 0.75rem 0; color: ${accentColor}; font-size: 1rem;">${title}</h3>
                ${items.slice(0, 5).map(apt => {
                  const status = (apt.status || 'SCHEDULED').toUpperCase();
                  const statusColor = getStatusColor(status);
                  let month = 'Jan', day = '00', time = '00:00', fullDate = '';

                  if (apt.dateTime) {
                    const parts = apt.dateTime.split(' ');
                    const datePart = parts[0];
                    const timePart = parts[1];
                    if (datePart) {
                      const [year, m, d] = datePart.split('-');
                      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                      month = monthNames[parseInt(m) - 1] || 'Jan';
                      day = parseInt(d).toString();
                      fullDate = `${month} ${day}, ${year}`;
                    }
                    if (timePart) {
                      time = timePart.substring(0, 5);
                    }
                  } else if (apt.date) {
                    const [year, m, d] = apt.date.split('-');
                    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    month = monthNames[parseInt(m) - 1] || 'Jan';
                    day = parseInt(d).toString();
                    fullDate = `${month} ${day}, ${year}`;
                    time = apt.time ? apt.time.substring(0, 5) : '00:00';
                  }

                  return `
                    <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; margin-bottom: 0.6rem;">
                      <div style="display: flex; justify-content: space-between; gap: 0.75rem; align-items: center;">
                        <div style="flex: 1;">
                          <div style="font-weight: 600; color: #333; font-size: 0.98rem;">Dr. ${apt.doctor || 'Not assigned'}</div>
                          <div style="color: #666; font-size: 0.9rem; margin-top: 0.2rem;">${fullDate || 'Date unavailable'} at ${time}</div>
                        </div>
                        <div style="padding: 0.35rem 0.6rem; border-radius: 4px; background: ${statusColor}; color: white; font-size: 0.8rem; font-weight: 600;">${status}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : '';

            allRemindersList.innerHTML = `
              <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #f8fafc; margin-bottom: 0.8rem;">
                <div style="font-weight: 700; color: #007B83; font-size: 1rem; margin-bottom: 0.3rem;">Upcoming Appointments</div>
                <div style="color: #666; font-size: 0.9rem;">Appointments scheduled for the future</div>
              </div>
              ${renderAppointmentBlock('Upcoming', upcomingAppointments, '#007B83')}
              <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: #f8fafc; margin-bottom: 0.8rem;">
                <div style="font-weight: 700; color: #5b6472; font-size: 1rem; margin-bottom: 0.3rem;">Past Appointments</div>
                <div style="color: #666; font-size: 0.9rem;">Previous appointments from your record</div>
              </div>
              ${renderAppointmentBlock('Past', pastAppointments, '#5b6472')}
            `;
          } else {
            allRemindersList.innerHTML = '<p class="no-data">No appointment history available yet</p>';
          }
        }

        // Activity
        const activityList = document.getElementById('activityList');
        if ((data.activity || []).length > 0) {
          activityList.innerHTML = (data.activity || []).slice(0, 4).map((act, idx) => {
            const iconMap = {
              'appointment': '📅',
              'patient_status': '👤',
              'document': '📄',
              'medication': '💊'
            };
            const icon = iconMap[act.activity_type] || '📌';
            return `
            <div style="padding: 0.75rem; border-left: 3px solid #007B83; background: #f0f8f8; border-radius: 4px; margin-bottom: 0.5rem;">
              <div style="font-weight: 600; color: #007B83; font-size: 0.95rem;">${icon} ${act.title}</div>
              <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">${act.description || 'No additional details'}</div>
              <div style="font-size: 0.85rem; color: #aaa; margin-top: 0.25rem;">${formatDateTime(act.timestamp)}</div>
            </div>
          `;
          }).join('');
        } else {
          activityList.innerHTML = '<p class="no-data">No recent activity</p>';
        }
        
        // Notifications section
        const notificationsList = document.getElementById('notificationsList');
        if (notificationsList) {
          if ((data.notifications || []).length > 0) {
            notificationsList.innerHTML = (data.notifications || []).map(notif => `
              <div style="padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; background: ${notif.read ? '#fafafa' : '#f0f8f8'}; margin-bottom: 0.8rem;">
                <div style="font-weight: 600; color: #333; font-size: 1rem; margin-bottom: 0.5rem;">🔔 ${notif.title}</div>
                <div style="color: #666; font-size: 0.95rem; margin-bottom: 0.5rem;">${notif.message}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.85rem; color: #aaa;">Type: ${notif.notification_type || 'General'}</span>
                  <span style="background-color: ${notif.read ? '#ccc' : '#2196F3'}; color: white; padding: 0.3rem 0.6rem; border-radius: 3px; font-size: 0.8rem; font-weight: 600;">${notif.read ? 'Read' : 'New'}</span>
                </div>
                <div style="font-size: 0.85rem; color: #aaa; margin-top: 0.5rem;">${formatDateTime(notif.created_at)}</div>
              </div>
            `).join('');
          } else {
            notificationsList.innerHTML = '<p class="no-data">No notifications</p>';
          }
        }
        
        // Profile section
        const profileContent = document.getElementById('profileContent');
        if (profileContent) {
          const profile = state.sessionUser || patientUser;
          profileContent.innerHTML = `
            <div style="max-width: 600px;">
              <div style="padding: 1.5rem; background: linear-gradient(135deg, #007B83 0%, #005f66 100%); border-radius: 8px; color: white; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="width: 80px; height: 80px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; color: #007B83;">
                    ${(profile.full_name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style="font-size: 1.5rem; font-weight: 600;">${profile.full_name || 'Patient'}</div>
                    <div style="opacity: 0.9; font-size: 0.95rem;">Patient ID: ${profile.patient_id || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; background: #fafafa;">
                <h3 style="margin-top: 0; color: #333; margin-bottom: 1rem;">📋 Profile Information</h3>
                
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; font-weight: 600; color: #666; margin-bottom: 0.5rem; font-size: 0.95rem;">Full Name</label>
                  <div style="padding: 0.75rem; background: white; border: 1px solid #ddd; border-radius: 4px; color: #333;">${profile.full_name || 'Not provided'}</div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; font-weight: 600; color: #666; margin-bottom: 0.5rem; font-size: 0.95rem;">Email</label>
                  <div style="padding: 0.75rem; background: white; border: 1px solid #ddd; border-radius: 4px; color: #333;">${profile.email || 'Not provided'}</div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; font-weight: 600; color: #666; margin-bottom: 0.5rem; font-size: 0.95rem;">Username</label>
                  <div style="padding: 0.75rem; background: white; border: 1px solid #ddd; border-radius: 4px; color: #333;">${profile.username || 'Not provided'}</div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; font-weight: 600; color: #666; margin-bottom: 0.5rem; font-size: 0.95rem;">Member Since</label>
                  <div style="padding: 0.75rem; background: white; border: 1px solid #ddd; border-radius: 4px; color: #333;">Account created on ${new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          `;
        }

      } catch (err) {
        console.error('Dashboard load error:', err);
        const debugEl = document.getElementById('debugApiStatus');
        if (debugEl) debugEl.textContent = 'ERROR: ' + err.message;
      }
    }

    function patientShowSection(section) {
      // Hide all sections
      document.getElementById('patientHomeSection').style.display = 'none';
      document.getElementById('patientAppointmentsSection').style.display = 'none';
      document.getElementById('patientNotificationsSection').style.display = 'none';
      document.getElementById('patientRemindersSection').style.display = 'none';
      document.getElementById('patientProfileSection').style.display = 'none';
      
      // Reset all nav buttons
      document.querySelectorAll('.patient-nav-item').forEach(btn => btn.classList.remove('active'));
      
      // Show selected section
      let sectionEl = null;
      if (section === 'home') {
        sectionEl = document.getElementById('patientHomeSection');
      } else if (section === 'appointments') {
        sectionEl = document.getElementById('patientAppointmentsSection');
      } else if (section === 'notifications') {
        sectionEl = document.getElementById('patientNotificationsSection');
      } else if (section === 'reminders') {
        sectionEl = document.getElementById('patientRemindersSection');
      } else if (section === 'profile') {
        sectionEl = document.getElementById('patientProfileSection');
      }
      
      if (sectionEl) {
        sectionEl.style.display = 'block';
      }
      
      // Mark corresponding nav button as active
      const buttons = document.querySelectorAll('.patient-nav-item');
      for (let btn of buttons) {
        const btnText = btn.textContent.trim().toLowerCase();
        const section_lower = section.toLowerCase();
        
        if ((section_lower === 'home' && btnText === 'home') ||
            (section_lower === 'appointments' && btnText.includes('appointment')) ||
            (section_lower === 'notifications' && btnText === 'notifications') ||
            (section_lower === 'reminders' && btnText === 'reminders') ||
            (section_lower === 'profile' && btnText === 'profile')) {
          btn.classList.add('active');
        }
      }
    }

    function loadPatientChatConversations() {
      console.log('📨 [PATIENT CONV] Loading conversations...');
      const list = document.getElementById('patientMessagesList');
      if (list) {
        list.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">Loading secure inbox...</div>';
      }
      fetch('api.php?action=chat_conversations', { credentials: 'include' })
        .then(r => {
          console.log('📥 [PATIENT CONV] Response status:', r.status);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(data => {
          console.log('📊 [PATIENT CONV] API response:', JSON.stringify(data, null, 2));
          
          if (data.error) {
            console.error('❌ [PATIENT CONV] API Error:', data.error);
            const list = document.getElementById('patientMessagesList');
            if (list) list.innerHTML = `<div style="padding: 1rem; text-align: center; color: red;">Error: ${escapeHtml(data.error)}</div>`;
            return;
          }
          
          const conversations = data.conversations || [];
          console.log('✅ [PATIENT CONV] Found', conversations.length, 'conversations');
          displayPatientChatConversations(conversations);
        })
        .catch(e => {
          console.error('💥 [PATIENT CONV] Exception:', e);
          const list = document.getElementById('patientMessagesList');
          if (list) list.innerHTML = `<div style="padding: 1rem; text-align: center; color: red;">Error loading conversations: ${escapeHtml(e.message)}</div>`;
        });
    }

    function displayPatientChatConversations(conversations) {
      const list = document.getElementById('patientMessagesList');
      if (patientCurrentConversationId) {
        // Show message thread view
        const conversation = (conversations || []).find(c => c.id == patientCurrentConversationId);
        if (conversation) {
          displayPatientMessageThread(conversation);
          loadPatientChatMessages();
          return;
        }

        displayPatientMessageThread({
          admin_name: 'Admin Support',
          subject: 'Patient Support',
        });
        loadPatientChatMessages();
        return;
      }

      if (!conversations || conversations.length === 0) {
        list.innerHTML = `
          <div style="padding: 1rem; text-align: center; color: #666;">
            <div style="font-weight: 600; color: #333; margin-bottom: 0.5rem;">Your inbox is being prepared</div>
            <div style="margin-bottom: 1rem;">If you have a linked patient record, a support conversation will appear here automatically.</div>
            <button type="button" onclick="loadPatientChatConversations()" style="padding: 0.65rem 1rem; border: none; border-radius: 4px; background: #007B83; color: white; font-weight: 600; cursor: pointer;">Refresh Inbox</button>
          </div>`;
        return;
      } else {
        // Show conversation list
        const html = `
          <div style="padding: 1rem;">
            ${conversations.map(conv => `
              <div style="padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer; background: #f9f9f9; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center;" 
                   onmouseover="this.style.background='#f0f8f8'" 
                   onmouseout="this.style.background='#f9f9f9'">
                <div style="flex: 1;" onclick="patientOpenConversation(${conv.id}, ${conv.admin_id}, '${(conv.admin_name || 'Support').replace(/'/g, "\\'")}')">
                  <div style="font-weight: 600; color: #007B83;">Doctor: ${conv.admin_name || 'Support Team'}</div>
                  <div style="font-size: 0.9rem; color: #666; margin-top: 0.25rem;">Subject: ${conv.subject || 'General Inquiry'}</div>
                  ${conv.unread_count > 0 ? `<div style="font-size: 0.85rem; color: #d32f2f; margin-top: 0.25rem;">✉ ${conv.unread_count} unread</div>` : ''}
                </div>
                <button style="background: none; border: none; cursor: pointer; font-size: 1.2rem; padding: 4px; margin-left: 8px;" onclick="event.stopPropagation(); togglePatientConversationMenu(${conv.id})" title="More options">⋯</button>
                <div id="menu-pconv-${conv.id}" style="display: none; position: absolute; right: 20px; background: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 100; min-width: 150px;">
                  <button onclick="event.stopPropagation(); deletePatientConversation(${conv.id}, '${(conv.admin_name || 'Support').replace(/'/g, "\\'")}' )" style="width: 100%; padding: 8px 12px; text-align: left; border: none; background: none; cursor: pointer; color: #d32f2f; font-size: 0.9rem;">🗑️ Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        list.innerHTML = html;
      }
    }

    function patientOpenConversation(conversationId, adminId, adminName) {
      patientCurrentConversationId = conversationId;
      patientCurrentAdminId = adminId;
      displayPatientChatConversations([]);
    }

    function displayPatientMessageThread(conversation) {
      const list = document.getElementById('patientMessagesList');
      const adminName = conversation.admin_name || 'Support Team';
      const subject = conversation.subject || 'General Inquiry';
      const html = `
        <div style="display: flex; flex-direction: column; height: 100%; min-height: 400px;">
          <div style="padding: 1rem; border-bottom: 2px solid #007B83; background: linear-gradient(135deg, #007B83 0%, #005f66 100%); color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0;">
            <div>
              <div style="font-size: 1.1rem; font-weight: 600;">Dr. ${escapeHtml(adminName)}</div>
              <div style="font-size: 0.85rem; opacity: 0.9;">${escapeHtml(subject)}</div>
            </div>
            <button style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; padding: 0;" onclick="patientBackToChatList()">← Back</button>
          </div>
          <div id="patientMessagesDisplay" style="flex: 1; overflow-y: auto; padding: 1rem; background: #fafafa;"></div>
          <div style="padding: 1rem; border-top: 1px solid #ddd; background: white; border-radius: 0 0 8px 8px;">
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" id="patientMessageInput" placeholder="Type your message..." style="flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.95rem;" onkeypress="if(event.key==='Enter') patientSendChatMessage()">
              <button id="patientSendBtn" onclick="patientSendChatMessage()" style="padding: 0.75rem 1rem; background: #007B83; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Send</button>
            </div>
          </div>
        </div>
      `;
      list.innerHTML = html;
    }

    function patientBackToChatList() {
      patientCurrentConversationId = null;
      patientCurrentAdminId = null;
      loadPatientChatConversations();
    }

    function loadPatientChatMessages() {
      if (!patientCurrentConversationId) {
        console.log('⚠️  [PATIENT CHAT] No conversation ID set');
        const display = document.getElementById('patientMessagesDisplay');
        if (display) display.innerHTML = '<div style="padding: 1rem; text-align: center; color: #999;">No conversation selected</div>';
        return;
      }

      const url = `api.php?action=chat_messages&conversation_id=${patientCurrentConversationId}`;
      console.log('📤 [PATIENT CHAT] Fetching messages from:', url, 'Conv ID:', patientCurrentConversationId);
      
      fetch(url, { credentials: 'include' })
        .then(r => {
          console.log('📥 [PATIENT CHAT] Response status:', r.status, 'OK:', r.ok);
          if (!r.ok) {
            throw new Error(`HTTP ${r.status}`);
          }
          return r.json();
        })
        .then(data => {
          console.log('📊 [PATIENT CHAT] API Response:', JSON.stringify(data, null, 2));
          
          if (data.error) {
            console.error('❌ [PATIENT CHAT] API Error:', data.error);
            const display = document.getElementById('patientMessagesDisplay');
            if (display) display.innerHTML = `<div style="padding: 1rem; text-align: center; color: red;">Error: ${escapeHtml(data.error)}</div>`;
            return;
          }
          
          const messages = data.messages || [];
          console.log('✅ [PATIENT CHAT] Found', messages.length, 'messages');
          if (messages.length > 0) {
            console.log('  └─ First message:', messages[0]);
            console.log('  └─ Last message:', messages[messages.length - 1]);
          }
          
          displayPatientMessages(messages);
          
          // Mark messages as read
          fetch('api.php?action=chat_mark_read', { 
            credentials: 'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation_id: patientCurrentConversationId })
          }).catch(e => console.error('Failed to mark read:', e));
        })
        .catch(e => {
          console.error('💥 [PATIENT CHAT] Exception:', e);
          const display = document.getElementById('patientMessagesDisplay');
          if (display) display.innerHTML = `<div style="padding: 1rem; text-align: center; color: red;">Error: ${escapeHtml(e.message)}</div>`;
        });
    }

    function displayPatientMessages(messages) {
      const display = document.getElementById('patientMessagesDisplay');
      if (!display) {
        console.error('❌ [PATIENT CHAT] Message display element not found');
        return;
      }
      
      if (!messages || messages.length === 0) {
        console.log('ℹ️  [PATIENT CHAT] No messages to display');
        display.innerHTML = '<div style="padding: 1rem; text-align: center; color: #999;">No messages yet</div>';
        return;
      }

      console.log('🎨 [PATIENT CHAT] Rendering', messages.length, 'messages');
      const html = messages.map((msg, idx) => {
        const isAdmin = msg.sender_role === 'ADMIN' || msg.sender_role === 'DOCTOR';
        const messageText = escapeHtml(msg.message || '');
        const senderName = escapeHtml(msg.sender_name || 'Unknown');
        console.log(`  └─ [${idx}] From ${senderName} (role:${msg.sender_role}): "${messageText.substring(0, 30)}..."`);
        return `
          <div style="margin-bottom: 0.75rem; display: flex; justify-content: ${isAdmin ? 'flex-start' : 'flex-end'}; position: relative; gap: 8px;">
            <div style="max-width: 80%; padding: 0.75rem 1rem; border-radius: 12px; background: ${isAdmin ? 'linear-gradient(135deg, #007B83 0%, #005f66 100%)' : '#e8f5e9'}; color: ${isAdmin ? 'white' : '#1b5e20'}; word-wrap: break-word; box-shadow: 0 2px 4px rgba(0,0,0,0.1); animation: fadeIn 0.3s ease; position: relative;">
              <div style="font-family: 'Sora', sans-serif; font-size: 0.85rem; ${isAdmin ? 'opacity: 0.9' : 'opacity: 0.8'}; margin-bottom: 0.25rem; font-weight: 600;">${isAdmin ? 'Doctor' : 'You'}</div>
              <div style="font-family: 'Manrope', sans-serif; font-size: 0.95rem; line-height: 1.5;">${messageText}</div>
              <div style="font-family: 'Manrope', sans-serif; font-size: 0.75rem; ${isAdmin ? 'opacity: 0.7' : 'opacity: 0.6'}; margin-top: 0.25rem;">${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
            ${!isAdmin ? `
              <div style="display: flex; align-items: flex-start; padding-top: 4px;">
                <button style="background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 2px 4px; color: #999;" onclick="event.stopPropagation(); togglePatientMessageMenuDash(${msg.id})" title="More options">⋯</button>
                <div id="menu-pmsg-dash-${msg.id}" style="display: none; position: absolute; right: 0; top: 100%; background: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 100; min-width: 140px;">
                  <button onclick="event.stopPropagation(); deletePatientMessage(${msg.id}, ${patientCurrentConversationId})" style="width: 100%; padding: 8px 12px; text-align: left; border: none; background: none; cursor: pointer; color: #d32f2f; font-size: 0.9rem; font-family: 'Manrope', sans-serif;">🗑️ Delete</button>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
      
      console.log('✨ [PATIENT CHAT] Updating display with', html.length, 'characters of HTML');
      display.innerHTML = html;
      // Scroll to bottom
      display.scrollTop = display.scrollHeight;
    }

    function patientSendChatMessage() {
      const input = document.getElementById('patientMessageInput');
      const message = input.value.trim();
      if (!message || !patientCurrentConversationId || !patientCurrentAdminId) {
        console.warn('⚠️  [PATIENT SEND] Missing data:', {
          hasMessage: !!message,
          convId: patientCurrentConversationId,
          adminId: patientCurrentAdminId
        });
        return;
      }

      console.log('📤 [PATIENT SEND] Sending message to conversation', patientCurrentConversationId, 'admin:', patientCurrentAdminId);
      
      fetch('api.php?action=chat_send', { 
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: patientCurrentConversationId,
          other_user_id: patientCurrentAdminId,
          message: message
        })
      })
      .then(r => {
        console.log('📥 [PATIENT SEND] Response status:', r.status, 'OK:', r.ok);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(result => {
        console.log('📊 [PATIENT SEND] Response data:', JSON.stringify(result, null, 2));
        
        if (result.error) {
          console.error('❌ [PATIENT SEND] API Error:', result.error);
          alert('Failed to send message: ' + result.error);
          return;
        }
        
        if (result.success) {
          console.log('✅ [PATIENT SEND] Message sent successfully, ID:', result.message_id);
          input.value = '';
          
          // Show success feedback
          const btn = document.getElementById('patientSendBtn');
          if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '✓ Sent!';
            btn.disabled = true;
            setTimeout(() => {
              btn.textContent = originalText;
              btn.disabled = false;
            }, 1500);
          }
          
          // Reload messages to show the sent message
          loadPatientChatMessages();
        } else {
          console.warn('⚠️  [PATIENT SEND] Success flag not set');
          alert('Failed to send message: ' + (result.error || 'Unknown error'));
        }
      })
      .catch(e => {
        console.error('💥 [PATIENT SEND] Exception:', e);
        alert('Error sending message: ' + e.message);
      });
    }

    function patientStartNewMessage() {
      patientCurrentConversationId = null;
      patientCurrentAdminId = patientSupportAdminId || (dashboardData.support_admin_id || 1);
      loadPatientChatConversations();
    }

    // Initialize
    updateCurrentDate();
    loadPatientDashboard();
    setInterval(loadPatientDashboard, 30000); // Refresh every 30 seconds
  </script>

  <?php else: ?>
  <!-- ADMIN DASHBOARD - Show for non-patient roles -->
  <div id="toast" class="toast" role="status" aria-live="polite"></div>

  <div id="walkthrough" class="walkthrough" hidden>
    <div class="walkthrough-card">
      <h2 id="walkTitle">Welcome to PMS</h2>
      <p id="walkText">This quick walkthrough helps you navigate key features.</p>
      <div class="walk-actions">
        <button id="walkNextBtn" class="tool-btn">Next</button>
        <button id="walkSkipBtn" class="tool-btn">Skip</button>
      </div>
    </div>
  </div>

  <div id="confirmModal" class="modal" hidden>
    <div class="modal-card">
      <h3 id="confirmTitle">Confirm Action</h3>
      <p id="confirmMessage">Proceed with this change?</p>
      <div class="modal-actions">
        <button id="confirmYes" class="tool-btn">Confirm</button>
        <button id="confirmNo" class="tool-btn">Cancel</button>
      </div>
    </div>
  </div>

  <div id="entryModal" class="modal" hidden>
    <div class="modal-card modal-lg">
      <h3 id="entryTitle">Add Entry</h3>
      <form id="entryForm" class="modal-form">
        <!-- Generic Fields (for non-patient modules) -->
        <div id="entryGenericFields" class="modal-section">
          <label id="entryNameLabel">
            Name
            <input name="name" required placeholder="Enter value" />
          </label>
          <label id="entryNotesLabel">
            Notes
            <input name="notes" placeholder="Optional notes" />
          </label>
        </div>

        <div id="entryDynamicFields" class="modal-section" style="display: none;"></div>

        <!-- Patient-Specific Fields -->
        <div id="entryPatientFields" class="modal-section" style="display: none;">
          <p class="form-helper">Fill out core patient identity details for accurate records. Fields with * are required.</p>
          <div class="modal-section-title">Personal Information</div>
          
          <div class="form-row">
            <label>
              First Name <span class="required">*</span>
              <input id="entryPatientFirstName" name="patientFirstName" type="text" required placeholder="e.g. Maria" />
            </label>
            <label>
              Last Name <span class="required">*</span>
              <input id="entryPatientLastName" name="patientLastName" type="text" required placeholder="e.g. Santos" />
            </label>
          </div>

          <div class="form-row">
            <label>
              Date of Birth
              <input id="entryPatientDob" name="patientDob" type="date" />
            </label>
            <label>
              Gender <span class="required">*</span>
              <select id="entryPatientGender" name="patientGender" required>
                <option value="">-- Select Gender --</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <small id="entryPatientGenderHint" class="semantic-helper semantic-helper-neutral">Select a gender option.</small>
            </label>
            <label>
              Status <span class="required">*</span>
              <select id="entryPatientStatus" name="patientStatus" required>
                <option value="">-- Select Status --</option>
                <option value="ADMITTED" selected>Admitted</option>
                <option value="CRITICAL">Critical</option>
                <option value="IN TREATMENT">In Treatment</option>
                <option value="UNDER OBSERVATION">Under Observation</option>
                <option value="STABLE">Stable</option>
                <option value="RECOVERING">Recovering</option>
                <option value="DISCHARGED">Discharged</option>
                <option value="FOLLOW-UP REQUIRED">Follow-Up Required</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="NO-SHOW">No-Show</option>
              </select>
            </label>
          </div>

          <div class="modal-section-title">Contact and Assignment</div>

          <div class="form-row form-row-3">
            <label>
              Contact Number
              <input id="entryPatientContact" name="patientContact" type="tel" placeholder="e.g. 0917 123 4567" />
            </label>
            <label>
              Assigned Doctor
              <select id="entryPatientDoctor" name="patientDoctor">
                <option value="">Loading active doctors...</option>
              </select>
              <small id="entryPatientDoctorHint" class="semantic-helper semantic-helper-neutral">Doctor list updates automatically.</small>
            </label>
            <label>
              Ward Assignment
              <select id="entryPatientWard" name="patientWard">
                <option value="">Loading available wards...</option>
              </select>
              <small id="entryPatientWardHint" class="semantic-helper semantic-helper-neutral">Only wards with available beds are listed.</small>
            </label>
          </div>

          <div class="modal-section-title">Medical History</div>

          <label>
            Medical History / Notes
            <textarea id="entryPatientMedicalHistory" name="patientMedicalHistory" placeholder="Include allergies, chronic conditions, medications, prior procedures, and alerts..." rows="3"></textarea>
          </label>
        </div>

        <div id="entryStatusIndicator" class="entry-status-indicator entry-status-hidden" role="status" aria-live="polite">
          <span class="status-icon"></span>
          <span class="status-message">Saving changes...</span>
        </div>

        <div class="modal-actions">
          <button id="entrySubmitBtn" type="submit" class="tool-btn">Save Record</button>
          <button type="button" id="entryCancel" class="tool-btn">Cancel</button>
        </div>
      </form>
      <p class="micro-copy">You are improving care quality with every update.</p>
    </div>
  </div>

  <!-- ADVANCED APPOINTMENT MODAL -->
  <div id="advancedAppointmentModal" class="modal advanced-appointment-modal" hidden>
    <div class="modal-overlay"></div>
    <div class="modal-card advanced-appointment-card">
      <!-- Header with back button -->
      <div class="advanced-appt-header">
        <button type="button" class="back-btn" onclick="closeAdvancedAppointmentModal()">← BACK TO CALENDAR</button>
        <button type="button" class="modal-close" onclick="closeAdvancedAppointmentModal()">×</button>
      </div>

      <div class="advanced-appt-container">
        <!-- Main Form -->
        <div class="advanced-appt-main">
          <h2 class="appt-form-title">Schedule New Appointment</h2>
          <p class="appt-form-subtitle">Create a new entry in the clinical sanctuary workflow.</p>

          <form id="advancedAppointmentForm">
            <!-- Patient Name -->
            <div class="form-group">
              <label class="form-label">Patient Name</label>
              <div class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input id="advApptPatientInput" type="text" class="search-input" placeholder="Search Patient..." autocomplete="off" />
                <div id="advApptPatientDropdown" class="search-dropdown" style="display: none;"></div>
              </div>
              <input id="advApptPatientId" type="hidden" name="patientId" />
            </div>

            <!-- Date and Time Row -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Appointment Date</label>
                <input id="advApptDate" type="date" name="date" required class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Preferred Time</label>
                <input id="advApptTime" type="time" name="time" required class="form-input" />
              </div>
            </div>

            <!-- Purpose and Location Row -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Purpose of Visit</label>
                <select id="advApptPurpose" name="purpose" class="form-select" required>
                  <option value="">Select Purpose</option>
                  <option value="Routine Checkup">Routine Checkup</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Lab Work">Lab Work</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Location / Ward</label>
                <select id="advApptWard" name="ward" class="form-select" required>
                  <option value="">Select Ward</option>
                </select>
              </div>
            </div>

            <!-- Urgency Level -->
            <div class="form-group">
              <label class="form-label">Urgency Level</label>
              <div class="urgency-buttons">
                <label class="urgency-btn">
                  <input type="radio" name="urgency" value="URGENT" class="urgency-radio" />
                  <span class="urgency-label urgency-urgent">● Urgent</span>
                </label>
                <label class="urgency-btn urgency-selected">
                  <input type="radio" name="urgency" value="REGULAR" class="urgency-radio" checked />
                  <span class="urgency-label urgency-regular">● Regular</span>
                </label>
                <label class="urgency-btn">
                  <input type="radio" name="urgency" value="ROUTINE" class="urgency-radio" />
                  <span class="urgency-label urgency-routine">● Routine</span>
                </label>
              </div>
            </div>

            <!-- Assigned Specialist -->
            <div class="form-group">
              <label class="form-label">Assigned Specialist</label>
              <div class="search-input-wrapper">
                <span class="search-icon">👤</span>
                <input id="advApptDoctorInput" type="text" class="search-input" placeholder="Search Doctor..." autocomplete="off" />
                <div id="advApptDoctorDropdown" class="search-dropdown" style="display: none;"></div>
              </div>
              <input id="advApptDoctorId" type="hidden" name="doctorId" />
            </div>

            <!-- Clinical Notes -->
            <div class="form-group">
              <label class="form-label">Clinical Notes</label>
              <textarea id="advApptNotes" name="notes" class="form-textarea" placeholder="Enter specific instructions or patient history notes..."></textarea>
            </div>

            <!-- Form Status -->
            <div id="advApptStatusIndicator" class="appt-status-indicator appt-status-hidden" role="status">
              <span class="status-icon"></span>
              <span class="status-message">Saving appointment...</span>
            </div>

            <!-- Buttons -->
            <div class="appt-form-buttons">
              <button type="submit" class="btn-save-appointment">Save Appointment</button>
              <button type="button" class="btn-cancel-appointment" onclick="closeAdvancedAppointmentModal()">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Sidebar -->
        <div class="advanced-appt-sidebar">
          <!-- Recent Patients -->
          <div class="sidebar-card recent-patients-card">
            <h3 class="card-title">Recent Patients</h3>
            <div id="advApptRecentPatients" class="recent-patients-list">
              <p class="loading-text">Loading recent patients...</p>
            </div>
          </div>

          <!-- Building Info - Editable -->
          <div class="sidebar-card building-card">
            <div class="building-image" id="buildingImageContainer">
              <div class="building-placeholder" id="buildingImageDisplay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="40" width="160" height="120" fill="none" stroke="currentColor" stroke-width="2"/>
                  <line x1="60" y1="40" x2="60" y2="160" stroke="currentColor" stroke-width="1"/>
                  <line x1="100" y1="40" x2="100" y2="160" stroke="currentColor" stroke-width="1"/>
                  <line x1="140" y1="40" x2="140" y2="160" stroke="currentColor" stroke-width="1"/>
                  <line x1="20" y1="80" x2="180" y2="80" stroke="currentColor" stroke-width="1"/>
                  <line x1="20" y1="120" x2="180" y2="120" stroke="currentColor" stroke-width="1"/>
                  <!-- Windows -->
                  <rect x="30" y="50" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1"/>
                  <rect x="55" y="50" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1"/>
                  <rect x="80" y="50" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1"/>
                  <rect x="105" y="50" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1"/>
                  <rect x="130" y="50" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1"/>
                  <rect x="155" y="50" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1"/>
                </svg>
              </div>
              <div class="building-overlay">
                <span id="buildingStatus" class="building-label">Open</span>
              </div>
            </div>
            <div class="building-info">
              <h4 id="buildingName" class="editable-field">Central Medical Complex</h4>
              <p id="buildingLocation" class="editable-field">Building B, Level 4</p>
            </div>
            <div class="building-edit-controls">
              <button type="button" id="editBuildingBtn" class="btn-edit-building" title="Edit building details">✏️ Edit</button>
              <input type="file" id="buildingImageInput" accept="image/*" style="display: none;" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="accountSettingsModal" class="modal account-settings-modal" hidden>
    <div class="modal-card account-settings-card">
      <div class="account-settings-layout">
        
        <!-- LEFT SIDEBAR -->
        <div class="account-settings-sidebar">
          <div class="sidebar-profile-section">
            <div class="profile-avatar-container">
              <img id="accountSettingsAvatarImage" class="profile-avatar-image" src="" alt="Profile avatar" />
              <span id="accountSettingsAvatarFallback" class="profile-avatar-fallback">U</span>
            </div>
            
            <h3 id="accountSettingsDisplayName">User Name</h3>
            <p id="accountSettingsDisplayTitle" class="profile-title">Job Title</p>
            
            <div class="upload-avatar-section">
              <button id="accountUploadAvatarBtn" type="button" class="btn-upload-avatar" data-bs-toggle="tooltip" title="Upload a profile picture">
                <span aria-hidden="true">⬆</span> Upload Avatar
              </button>
              <input id="accountSettingsAvatarFile" type="file" accept="image/*" hidden />
              <p class="upload-helper">JPG, PNG, or GIF (Max 2MB)</p>
            </div>
          </div>
          
          <div class="sidebar-menu-section">
            <button type="button" class="sidebar-menu-item active" data-tab="general">
              <span aria-hidden="true">👤</span> Profile Info
            </button>
            <button type="button" class="sidebar-menu-item" data-tab="security">
              <span aria-hidden="true">🔒</span> Security
            </button>
            <button type="button" class="sidebar-menu-item" data-tab="notifications">
              <span aria-hidden="true">🔔</span> Notifications
            </button>
          </div>
        </div>
        
        <!-- RIGHT CONTENT -->
        <div class="account-settings-content">
          <form id="accountSettingsForm" class="account-settings-form">
            
            <!-- GENERAL TAB -->
            <div class="settings-tab active" id="tab-general">
              <div class="tab-header">
                <h2>General Information</h2>
                <p>Manage your clinical profile and personal preferences.</p>
              </div>
              
              <div class="form-section">
                <div class="form-row">
                  <div class="form-group">
                    <label for="accountSettingsFullName">Full Name <span class="required">*</span></label>
                    <input id="accountSettingsFullName" name="full_name" type="text" required placeholder="Enter your full name" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for="accountSettingsUsername">Username</label>
                    <input id="accountSettingsUsername" name="username" type="text" readonly class="form-control" />
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group full-width">
                    <label for="accountSettingsEmail">Email <span class="required">*</span></label>
                    <input id="accountSettingsEmail" name="email" type="email" required placeholder="your.email@example.com" class="form-control" />
                  </div>
                </div>
                
                <div class="form-row">
                  <div class="form-group full-width">
                    <label for="accountSettingsAvatarUrl">Avatar URL (Optional)</label>
                    <input id="accountSettingsAvatarUrl" name="avatar_url" type="text" placeholder="https://example.com/avatar.jpg or leave blank" class="form-control" />
                    <small>External avatar image URL or leave blank to use uploaded profile picture</small>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- SECURITY TAB -->
            <div class="settings-tab" id="tab-security">
              <div class="tab-header">
                <h2>Password Management</h2>
                <p>Update your password to keep your account secure.</p>
              </div>
              
              <div class="form-section">
                <div class="info-box">
                  <span aria-hidden="true">ℹ</span>
                  <p>Leave password fields empty if you only want to update profile info.</p>
                </div>
                
                <div class="form-group full-width">
                  <label for="accountSettingsCurrentPassword">Current Password</label>
                  <input id="accountSettingsCurrentPassword" name="current_password" type="password" autocomplete="current-password" placeholder="Required only when changing password" class="form-control" />
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="accountSettingsNewPassword">New Password</label>
                    <input id="accountSettingsNewPassword" name="new_password" type="password" autocomplete="new-password" placeholder="Minimum 8 characters" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label for="accountSettingsConfirmPassword">Confirm New Password</label>
                    <input id="accountSettingsConfirmPassword" name="confirm_password" type="password" autocomplete="new-password" placeholder="Confirm new password" class="form-control" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- NOTIFICATIONS TAB -->
            <div class="settings-tab" id="tab-notifications">
              <div class="tab-header">
                <h2>Notifications</h2>
                <p>Manage your notification preferences.</p>
              </div>
              
              <div class="form-section">
                <div class="notification-items">
                  <label class="notification-item">
                    <input type="checkbox" name="notif_appointments" checked>
                    <div class="notification-details">
                      <strong>Appointment Reminders</strong>
                      <small>Get notified before scheduled appointments</small>
                    </div>
                  </label>
                  <label class="notification-item">
                    <input type="checkbox" name="notif_messages" checked>
                    <div class="notification-details">
                      <strong>New Messages</strong>
                      <small>Receive alerts for incoming messages</small>
                    </div>
                  </label>
                  <label class="notification-item">
                    <input type="checkbox" name="notif_updates" checked>
                    <div class="notification-details">
                      <strong>System Updates</strong>
                      <small>Important system notifications and updates</small>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div id="accountStatusIndicator" class="entry-status-indicator entry-status-hidden" role="status" aria-live="polite">
              <span class="status-icon"></span>
              <span class="status-message">Saving changes...</span>
            </div>
            
            <div class="modal-actions">
              <button id="accountSettingsSaveBtn" type="submit" class="btn-primary">Save Changes</button>
              <button id="accountSettingsCancelBtn" type="button" class="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <header class="topbar">
    <div class="topbar-brand">
      <span class="topbar-logo" aria-hidden="true">
        <img src="assets/logo.png" alt="MEDIZEN logo" class="topbar-logo-img" loading="eager" decoding="async">
      </span>
    </div>
    <div class="banner-actions">
      <div id="accountBanner" class="account-banner" data-role="<?php echo htmlspecialchars((string) ($user['role'] ?? '')); ?>">
        <button
          id="accountToggle"
          class="account-toggle"
          type="button"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-controls="accountMenu"
        >
          <span class="account-avatar-wrap">
            <img id="accountAvatarImage" class="account-avatar-img" src="" alt="User avatar" hidden />
            <span id="accountAvatarFallback" class="account-avatar-fallback"><?php echo htmlspecialchars(strtoupper(substr((string) ($user['full_name'] ?? $user['username'] ?? 'U'), 0, 1))); ?></span>
            <span id="accountStatusDot" class="account-status-dot account-status-online" title="Online" aria-label="Online"></span>
          </span>

          <span class="account-identity">
            <strong id="accountDisplayName"><?php echo htmlspecialchars((string) ($user['full_name'] ?? $user['username'] ?? 'User')); ?></strong>
            <small id="accountDisplayRole"><?php echo htmlspecialchars(ucfirst(strtolower((string) ($user['role'] ?? 'Staff')))); ?></small>
          </span>

          <span class="account-caret" aria-hidden="true">▾</span>
        </button>

        <div id="accountMenu" class="account-menu" role="menu" hidden>
          <div class="account-menu-section">
            <button id="accountSettingsBtn" class="account-menu-item" type="button" role="menuitem" title="Account Settings">
              <span class="menu-icon" aria-hidden="true">⚙</span>
              <span>Account Settings</span>
            </button>
            <button id="accountNotificationsBtn" class="account-menu-item" type="button" role="menuitem" title="Notifications">
              <span class="menu-icon" aria-hidden="true">🔔</span>
              <span>Notifications</span>
              <span id="accountNotifCount" class="menu-count" hidden>0</span>
            </button>
            <button id="accountThemeBtn" class="account-menu-item" type="button" role="menuitem" title="Toggle Theme">
              <span class="menu-icon" aria-hidden="true">◐</span>
              <span>Toggle Theme</span>
            </button>
          </div>

          <div class="account-menu-divider" aria-hidden="true"></div>

          <div id="accountRoleShortcuts" class="account-menu-section" aria-label="Role shortcuts"></div>

          <div class="account-menu-divider" aria-hidden="true"></div>

          <div class="account-menu-section">
            <form method="post" action="auth.php" id="accountLogoutForm" class="account-logout-form">
              <input type="hidden" name="action" value="logout" />
              <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>" />
              <button id="accountLogoutBtn" type="submit" class="account-menu-item danger" role="menuitem" title="Logout securely">
                <span class="menu-icon" aria-hidden="true">⎋</span>
                <span>Logout</span>
              </button>
            </form>
            <div class="account-footer-links" style="padding: 0.75rem 0 0; text-align: center; font-size: 0.85rem;">
              <a href="term_policy.html" target="_blank" style="color: #007B83; text-decoration: none; margin-right: 1rem; display: inline-block;">Terms of Service</a>
              <a href="privacy_policy.html" target="_blank" style="color: #007B83; text-decoration: none; display: inline-block;">Privacy Policy</a>
            </div>
          </div>

          <div id="accountNotificationsPanel" class="account-notifications" hidden>
            <h4>Notifications</h4>
            <ul id="accountNotificationsList"></ul>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main class="layout">
    <aside class="sidebar">
      <div class="sidebar-head">
        <h2>Modules</h2>
        <button id="sidebarToggle" class="icon-btn" title="Collapse sidebar" aria-label="Collapse sidebar">&#9776;</button>
      </div>
      <button class="module-btn active" data-module="patients"><span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M5 20a7 7 0 0 1 14 0"></path></svg></span><span>Patients</span></button>
      <button class="module-btn" data-module="patient_analytics"><span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 19h16"></path><path d="M7 15l3-3 3 2 4-5"></path><circle cx="7" cy="15" r="1"></circle><circle cx="10" cy="12" r="1"></circle><circle cx="13" cy="14" r="1"></circle><circle cx="17" cy="9" r="1"></circle></svg></span><span>Patient Analytics</span></button>
      <button class="module-btn" data-module="doctors"><span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="4"></circle><path d="M3 20a7 7 0 0 1 14 0"></path><path d="M18 8h4"></path><path d="M20 6v4"></path></svg></span><span>Doctors</span></button>
      <button class="module-btn" data-module="wards"><span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 11h18v7H3z"></path><path d="M3 11V7h6v4"></path><path d="M6 18v3"></path><path d="M18 18v3"></path></svg></span><span>Wards</span></button>
      <button class="module-btn" data-module="appointments"><span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M3 10h18"></path></svg></span><span>Appointments</span></button>
      <button class="module-btn" data-module="billing"><span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1z"></path><path d="M9 8h6"></path><path d="M9 12h6"></path><path d="M9 16h4"></path></svg></span><span>Billing</span></button>
      <button class="module-btn" data-module="inventory"><span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4z"></path><path d="M3 7v10l9 4 9-4V7"></path><path d="M12 11v10"></path></svg></span><span>Inventory</span></button>
      <button class="module-btn" data-module="audit_logs"><span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M9 8h6"></path><path d="M9 12h6"></path><path d="M9 16h4"></path></svg></span><span>Audit Logs</span></button>

      <div class="sidebar-foot">
        <p>System Mode</p>
        <strong>Live Localhost</strong>
      </div>
    </aside>

    <section class="workspace">
      <div class="workspace-grid">
        <section class="workspace-main">
          <section class="panel-block panel-controls">
            <h3 class="panel-label">Workspace Controls</h3>
            <section class="toolbar">
              <button id="refreshBtn" class="tool-btn">Refresh Data</button>
              <button id="themeBtn" class="tool-btn" title="Toggle between light and dark mode">🌙 Dark Mode</button>
              <button id="walkStartBtn" class="tool-btn">Guide</button>
            </section>

            <section class="smart-tools">
              <input type="search" id="globalSearchInput" placeholder="Quick search patients, doctors, appointments..." />
              <select id="statusFilter" aria-label="Filter table rows">
                <option value="all">All statuses</option>
                <option value="ADMITTED">Admitted</option>
                <option value="CRITICAL">Critical</option>
                <option value="IN TREATMENT">In Treatment</option>
                <option value="UNDER OBSERVATION">Under Observation</option>
                <option value="STABLE">Stable</option>
                <option value="RECOVERING">Recovering</option>
                <option value="DISCHARGED">Discharged</option>
                <option value="FOLLOW-UP REQUIRED">Follow-up Required</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="NO-SHOW">No-Show</option>
              </select>
              <button id="sortToggleBtn" class="tool-btn">Sort A-Z</button>
            </section>
          </section>

          <section class="panel-block">
            <h3 class="panel-label">Today Snapshot</h3>
            <section class="cards" id="cards">
              <article class="card card-patients"><h3 id="totalPatients">0</h3><p>Total Patients</p></article>
              <article class="card card-doctors"><h3 id="activeDoctors">0</h3><p>Active Doctors</p></article>
              <article class="card card-wards"><h3 id="availableBeds">0</h3><p>Available Beds</p></article>
              <article class="card card-appointments"><h3 id="appointmentsToday">0</h3><p>Appointments Today</p></article>
            </section>
          </section>

          <section class="table-panel">
            <div class="panel-head">
              <h2 id="moduleTitle">Patients <span class="info-tip" title="Use search, filters, and row action buttons to work faster.">&#9432;</span></h2>
              <input type="search" id="searchInput" placeholder="Search records" />
            </div>

            <div id="quickActions" class="quick-actions">
              <button id="addBtn" class="tool-btn">ADD</button>
              <button id="editBtn" class="tool-btn">UPDATE</button>
              <button id="deleteBtn" class="tool-btn danger">DELETE</button>
              <button id="undoBtn" class="tool-btn" disabled>UNDO</button>
            </div>

            <div id="status" class="status"></div>

            <div class="table-wrap">
              <table id="moduleTable">
                <thead><tr id="tableHead"></tr></thead>
                <tbody id="tableBody"></tbody>
              </table>
            </div>

            <!-- Admin Password Verification Modal for Patient Credentials -->
            <section id="patientDetailsPanel" class="patient-details-panel" hidden>
              <div class="patient-details-head">
                <h3>Patient Details</h3>
                <span id="patientDetailsStatus" class="status-pill status-pill-neutral">-</span>
              </div>
              <div class="patient-details-grid">
                <div class="patient-details-item">
                  <small>Patient ID</small>
                  <strong id="patientDetailsId">-</strong>
                </div>
                <div class="patient-details-item">
                  <small>Full Name</small>
                  <strong id="patientDetailsName">-</strong>
                </div>
                <div class="patient-details-item">
                  <small>Date of Birth</small>
                  <strong id="patientDetailsDob">-</strong>
                </div>
                <div class="patient-details-item">
                  <small>Assigned Doctor</small>
                  <strong id="patientDetailsDoctor">-</strong>
                </div>
                <div class="patient-details-item">
                  <small>Ward</small>
                  <strong id="patientDetailsWard">-</strong>
                </div>
                <div class="patient-details-item">
                  <small>Contact</small>
                  <strong id="patientDetailsContact">-</strong>
                </div>
              </div>
              <div class="patient-details-history">
                <small>Medical History</small>
                <p id="patientDetailsHistory">No medical history recorded.</p>
              </div>
              <div class="patient-details-back">
                <button type="button" class="back-btn" onclick="closePatientDetails()">← Back to Patients</button>
              </div>
            </section>

            <section id="analyticsPanel" class="analytics-panel" hidden>
              <div class="analytics-head">
                <div class="analytics-head-title">
                  <h3>Patient Analytics Dashboard</h3>
                  <p id="analyticsSummary" class="analytics-summary">Loading analytics summary...</p>
                </div>
                <div class="analytics-export-actions">
                  <button id="analyticsExportExcel" type="button" class="tool-btn">Export CSV</button>
                  <button id="analyticsExportPdf" type="button" class="tool-btn">Print Report</button>
                </div>
              </div>

              <div class="analytics-filters">
                <label>Date From
                  <input id="analyticsDateFrom" type="date" />
                </label>
                <label>Date To
                  <input id="analyticsDateTo" type="date" />
                </label>
                <label>Department
                  <select id="analyticsDepartment">
                    <option value="all">All</option>
                  </select>
                </label>
                <label>Doctor
                  <select id="analyticsDoctor">
                    <option value="all">All</option>
                  </select>
                </label>
                <label>Age Group
                  <select id="analyticsAge">
                    <option value="all">All</option>
                    <option value="0-17">0-17</option>
                    <option value="18-35">18-35</option>
                    <option value="36-59">36-59</option>
                    <option value="60+">60+</option>
                  </select>
                </label>
                <label>Gender
                  <select id="analyticsGender">
                    <option value="all">All</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
                <div class="analytics-filter-action">
                  <button id="analyticsApplyFilters" type="button" class="tool-btn">Apply Filters</button>
                  <button id="analyticsResetFilters" type="button" class="tool-btn">Reset Filters</button>
                </div>
              </div>

              <div id="analyticsMetrics" class="analytics-metrics"></div>

              <div id="analyticsLoading" class="analytics-loading" hidden>
                <span class="analytics-progress-dot" aria-hidden="true"></span>
                <span>Loading analytics...</span>
              </div>
              <div id="analyticsProgress" class="analytics-progress" hidden>
                <span class="analytics-progress-dot" aria-hidden="true"></span>
                <span id="analyticsProgressText">Preparing analytics...</span>
              </div>

              <div class="analytics-charts">
                <article class="analytics-card analytics-card-trend">
                  <h4>Patient Trend and Forecast</h4>
                  <div id="analyticsLineChart" class="chart-surface"></div>
                </article>
                <article class="analytics-card analytics-card-diagnosis">
                  <h4>Top Diagnoses</h4>
                  <div id="analyticsBarChart" class="chart-surface"></div>
                </article>
                <article class="analytics-card analytics-card-statusmix">
                  <h4>Patient Status Mix</h4>
                  <div id="analyticsDonutChart" class="chart-surface"></div>
                </article>
              </div>

              <div class="analytics-tables">
                <article class="analytics-card analytics-card-recent">
                  <div class="analytics-card-head">
                    <h4>Recent Patients</h4>
                    <input id="analyticsRecentSearch" type="search" placeholder="Search recent patients" />
                  </div>
                  <div class="analytics-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Age</th>
                          <th>Gender</th>
                          <th>Doctor</th>
                          <th>Ward</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody id="analyticsRecentTable"></tbody>
                    </table>
                  </div>
                </article>

                <article class="analytics-card analytics-card-risk">
                  <div class="analytics-card-head">
                    <h4>High-Risk Patients</h4>
                    <select id="analyticsHighRiskSort">
                      <option value="priority">Sort by Priority</option>
                      <option value="age">Sort by Age</option>
                      <option value="doctor">Sort by Doctor</option>
                    </select>
                  </div>
                  <div class="analytics-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Age</th>
                          <th>Gender</th>
                          <th>Doctor</th>
                          <th>Ward</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody id="analyticsHighRiskTable"></tbody>
                    </table>
                  </div>
                </article>
              </div>

              <div class="analytics-bottom">
                <article class="analytics-card analytics-card-alerts">
                  <h4>Smart Alerts</h4>
                  <ul id="analyticsAlerts" class="analytics-alerts"></ul>
                </article>
                <article class="analytics-card analytics-card-drilldown">
                  <h4 id="analyticsDrilldownTitle">All filtered patients</h4>
                  <div class="analytics-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Age</th>
                          <th>Gender</th>
                          <th>Doctor</th>
                          <th>Ward</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody id="analyticsDrilldownTable"></tbody>
                    </table>
                  </div>
                </article>
              </div>

              <div class="analytics-quick-actions">
                <button id="analyticsQuickAddPatient" type="button" class="tool-btn">Quick Add Patient</button>
                <button id="analyticsQuickSchedule" type="button" class="tool-btn">Quick Schedule</button>
                <button id="analyticsQuickWardStatus" type="button" class="tool-btn">View Ward Status</button>
              </div>
            </section>
          </section>
        </section>

        <aside class="workspace-side">
          <section class="insight-grid">
            <article class="insight-card">
              <div class="insight-head">
                <h3 id="insightCardTitle">Live Overview</h3>
                <p id="overviewMeta" class="overview-meta">Waiting for data...</p>
              </div>
              <div id="miniChart" class="mini-chart" aria-label="Overview chart"></div>
            </article>
            <article class="insight-card recent-activities-card">
              <h3>Recent Activities</h3>
              <ul id="recentList" class="recent-list">
                <li>Loading activities...</li>
              </ul>
            </article>
          </section>
        </aside>
      </div>
    </section>
  </main>

  <!-- Admin verification removed - passwords now toggle directly -->
  
  <script src="assets/app.js"></script>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== PASSWORD RESET MODAL - STEP 1 ==================== -->
  <div id="passwordResetModalStep1" class="modal" hidden>
    <div class="modal-overlay"></div>
    <div class="modal-content" style="max-width: 450px;">
      <div class="modal-header">
        <h3>🔄 Reset Patient Password</h3>
        <button type="button" class="modal-close" onclick="closePasswordResetModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div id="resetPatientNameDisplay" style="font-weight: 600; margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;"></div>
        <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 12px; border-radius: 4px; margin-bottom: 15px; font-size: 14px;">
          <strong>ℹ️ Quick Setup:</strong> The patient password shown here is the same value stored in the credentials panel and database for this school demo.
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closePasswordResetModal()">Close</button>
        <button type="button" class="btn btn-primary" onclick="copyOtpPassword()">📋 Copy Password</button>
      </div>
    </div>
  </div>



  <!-- Enhanced Admin Password Toggle for Entry Screen -->
  <script>
    // ===== SIMPLE PASSWORD TOGGLE =====
    const toggleBtn = document.getElementById('togglePasswordVisibility');
    const passwordInput = document.getElementById('entryPatientPassword');

    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          toggleBtn.textContent = '👁‍🗨';
        } else {
          passwordInput.type = 'password';
          toggleBtn.textContent = '👁';
        }
      });
    }

    const style = document.createElement('style');
    style.textContent = `@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); } } .shake { animation: shake 0.5s ease-in-out; }`;
    document.head.appendChild(style);
  </script>

  <!-- Chat Modal -->
  <div id="chatModal" class="chat-modal" style="display: none;">
    <div class="chat-modal-content">
      <div class="chat-modal-header">
        <h3>Messages</h3>
        <div class="chat-header-tabs">
          <button id="chatTabConversations" class="chat-tab-btn active" onclick="showConversationsTab()">Conversations</button>
          <button id="chatTabContacts" class="chat-tab-btn" onclick="showContactsTab()">Contacts</button>
        </div>
        <button onclick="closeChatModal()" class="chat-modal-close">&times;</button>
      </div>
      
      <div class="chat-modal-body">
        <!-- Conversations List -->
        <div id="chatConversations" class="chat-conversations">
          <p class="chat-loading">Loading conversations...</p>
        </div>

        <!-- Contacts List -->
        <div id="chatContacts" class="chat-contacts" style="display: none;">
          <div class="chat-contacts-header">
            <p class="chat-contacts-subtitle">Existing & Upcoming Patients</p>
            <input type="text" id="contactSearchInput" placeholder="Search patients..." class="chat-contacts-search" />
          </div>
          <div id="contactsList" class="contacts-list">
            <p class="chat-loading">Loading patient contacts...</p>
          </div>
        </div>

        <!-- Messages Area -->
        <div id="chatMessages" class="chat-messages" style="display: none;">
          <div class="chat-messages-header">
            <button onclick="backToConversations()" class="chat-back-btn">← Back</button>
            <h4 id="chatOtherUserName">--</h4>
          </div>
          
          <div class="chat-messages-window" id="chatMessagesWindow">
            <p class="chat-loading">Loading messages...</p>
          </div>

          <div class="chat-messages-input">
            <input type="text" id="chatMessageInput" placeholder="Type a message..." class="chat-input-field" />
            <button onclick="sendChatMessage()" class="chat-send-btn">Send</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Chat JavaScript -->
  <script>
    let currentConversationId = null;
    let currentChatUser = null;
    let chatPollingInterval = null;
    let conversationPollingInterval = null;
    let lastUnreadCount = 0;
    let backgroundMessagePollingInterval = null;

    // Helper function for formatting dates (also defined in patient script but safer to redefine)
    function formatDateTime(isoDate) {
      if (!isoDate) return '--';
      const d = new Date(isoDate);
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    // Background polling for new messages (for admins)
    function startBackgroundMessagePolling() {
      // Only for admins, not patients
      if (window.currentUser && window.currentUser.role !== 'PATIENT') {
        backgroundMessagePollingInterval = setInterval(async () => {
          try {
            const response = await fetch('api.php?action=chat_conversations', { credentials: 'include' });
            if (!response.ok) return;
            
            const data = await response.json();
            const conversations = data.conversations || [];
            
            // Calculate total unread
            let totalUnread = 0;
            conversations.forEach(conv => {
              totalUnread += conv.unread_count || 0;
            });
            
            // If unread count has increased, show notification
            if (totalUnread > lastUnreadCount) {
              const newMessages = totalUnread - lastUnreadCount;
              const conv = conversations.find(c => (c.unread_count || 0) > 0);
              if (conv) {
                const otherName = conv.patient_name || 'Customer';
                showChatNotification(`📨 New message from ${otherName}`, newMessages);
              }
            }
            lastUnreadCount = totalUnread;
          } catch (e) {
            console.error('Background polling error:', e);
          }
        }, 3000); // Poll every 3 seconds
      }
    }

    function showChatNotification(message, count) {
      // Show toast notification if toast element exists
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = message + (count > 1 ? ` (+${count})` : '');
        toast.className = 'toast show';
        setTimeout(() => {
          toast.className = 'toast';
        }, 4000);
      }
      
      // Play notification sound if available
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAAAAAA==');
        audio.play().catch(() => {});
      } catch (e) {}
    }

    function openChatModal() {
      const modal = document.getElementById('chatModal');
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // For PATIENT users, load conversation directly
        if (window.currentUser && window.currentUser.role === 'PATIENT') {
          loadPatientDirectConversation();
        } else {
          // For ADMIN users, show conversations list
          loadChatConversations();
          
          // Start polling to refresh conversations list every 3 seconds when modal is open
          if (!backgroundMessagePollingInterval) {
            backgroundMessagePollingInterval = setInterval(async () => {
              try {
                const response = await fetch('api.php?action=chat_conversations', { credentials: 'include' });
                if (response.ok) {
                  const data = await response.json();
                  // Update conversation list
                  const conversationsDiv = document.getElementById('chatConversations');
                  if (conversationsDiv && conversationsDiv.style.display !== 'none') {
                    let totalUnread = 0;
                    if (data.conversations && data.conversations.length > 0) {
                      conversationsDiv.innerHTML = data.conversations.map(conv => {
                        totalUnread += conv.unread_count || 0;
                        const otherName = conv.admin_name || conv.patient_name || 'Support Team';
                        const unreadClass = conv.unread_count > 0 ? 'unread' : '';
                        const unreadBadge = conv.unread_count > 0 ? `<span class="chat-unread-badge">${conv.unread_count}</span>` : '';
                        
                        return `
                          <div class="chat-conversation-item ${unreadClass}" onclick="openConversation(${conv.id}, '${otherName.replace(/'/g, "\\'")}', ${conv.admin_id || conv.patient_id})">
                            <div class="chat-conv-name">${otherName}</div>
                            <div class="chat-conv-meta">${formatDateTime(conv.updated_at)}</div>
                            ${unreadBadge}
                          </div>
                        `;
                      }).join('');
                    }
                  }
                }
              } catch (e) {
                console.error('Error refreshing conversations:', e);
              }
            }, 3000);
          }
        }
        
        document.body.style.overflow = 'hidden';
      }
    }

    function loadPatientDirectConversation() {
      // First, fetch patient dashboard to check for appointments
      fetch('api.php?action=getPatientDashboard', { credentials: 'include' })
        .then(r => r.json())
        .then(dashboardData => {
          // Check if patient has appointments
          const appointments = dashboardData.appointments || [];
          let doctorId = null;
          let doctorName = null;
          
          if (appointments.length > 0) {
            // Get the doctor from the first (most recent) appointment
            const firstApt = appointments[0];
            doctorId = firstApt.doctor_id;
            doctorName = firstApt.doctor || 'Doctor';
          }
          
          // If no doctor from appointments, use admin (ID: 1)
          if (!doctorId) {
            doctorId = 1;
            doctorName = 'Administrator';
          }
          
          // Now fetch or create conversation with the appropriate doctor
          loadPatientConversationWithDoctor(doctorId, doctorName);
        })
        .catch(e => {
          console.error('Failed to load dashboard:', e);
          // Fallback to admin if dashboard fails
          loadPatientConversationWithDoctor(1, 'Administrator');
        });
    }

    function loadPatientConversationWithDoctor(doctorId, doctorName) {
      // Fetch patient's conversations to find one with this doctor
      fetch('api.php?action=chat_conversations', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          const conversations = data.conversations || [];
          
          // Hide tabs and lists
          const tabsContainer = document.querySelector('.chat-header-tabs');
          if (tabsContainer) tabsContainer.style.display = 'none';
          const conversationsDiv = document.getElementById('chatConversations');
          const contactsDiv = document.getElementById('chatContacts');
          if (conversationsDiv) conversationsDiv.style.display = 'none';
          if (contactsDiv) contactsDiv.style.display = 'none';
          
          // Find conversation with this doctor
          const existingConv = conversations.find(c => c.admin_id == doctorId);
          
          if (existingConv) {
            // Open existing conversation
            openConversation(existingConv.id, doctorName, doctorId);
          } else {
            // No conversation yet, show empty message panel ready to start
            const messagesDiv = document.getElementById('chatMessages');
            if (messagesDiv) {
              messagesDiv.style.display = 'block';
              messagesDiv.innerHTML = `
                <div class="chat-messages-header">
                  <button onclick="closeChatModal()" class="chat-back-btn">← Close</button>
                  <h4>${doctorName}</h4>
                </div>
                <div class="chat-messages-window" id="chatMessagesWindow" style="display: flex; align-items: center; justify-content: center; color: #999;">
                  <p>Start the conversation</p>
                </div>
                <div class="chat-messages-input">
                  <input type="text" id="chatMessageInput" placeholder="Type your message..." class="chat-input-field" />
                  <button onclick="sendChatMessage()" class="chat-send-btn">Send</button>
                </div>
              `;
            }
            
            // Set the conversation ID to 0 for new conversations
            currentConversationId = 0;
            currentChatUser = doctorId;
            const nameEl = document.getElementById('chatOtherUserName');
            if (nameEl) nameEl.textContent = doctorName;
          }
        })
        .catch(e => {
          console.error('Failed to load conversations:', e);
          // Still show message panel even if fetch fails
          const messagesDiv = document.getElementById('chatMessages');
          if (messagesDiv) {
            messagesDiv.style.display = 'block';
            messagesDiv.innerHTML = `
              <div class="chat-messages-header">
                <button onclick="closeChatModal()" class="chat-back-btn">← Close</button>
                <h4>${doctorName}</h4>
              </div>
              <div class="chat-messages-window" style="display: flex; align-items: center; justify-content: center; color: #999;">
                <p>Start the conversation</p>
              </div>
              <div class="chat-messages-input">
                <input type="text" id="chatMessageInput" placeholder="Type your message..." class="chat-input-field" />
                <button onclick="sendChatMessage()" class="chat-send-btn">Send</button>
              </div>
            `;
          }
          currentConversationId = 0;
          currentChatUser = doctorId;
        });
    }

    function closeChatModal() {
      const modal = document.getElementById('chatModal');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        currentConversationId = null;
        if (chatPollingInterval) clearInterval(chatPollingInterval);
        if (conversationPollingInterval) clearInterval(conversationPollingInterval);
        document.body.style.overflow = 'auto';
        
        // Reset tabs visibility and show conversations for next use
        const tabsContainer = document.querySelector('.chat-header-tabs');
        const conversationsDiv = document.getElementById('chatConversations');
        const contactsDiv = document.getElementById('chatContacts');
        const messagesDiv = document.getElementById('chatMessages');
        const backBtn = document.querySelector('.chat-back-btn');
        if (tabsContainer) tabsContainer.style.display = 'flex';
        if (conversationsDiv) conversationsDiv.style.display = 'block';
        if (contactsDiv) contactsDiv.style.display = 'none';
        if (messagesDiv) messagesDiv.style.display = 'none';
        if (backBtn) backBtn.style.display = 'block';
      }
    }

    function backToConversations() {
      const conversationsDiv = document.getElementById('chatConversations');
      const messagesDiv = document.getElementById('chatMessages');
      
      if (conversationsDiv) conversationsDiv.style.display = 'block';
      if (messagesDiv) messagesDiv.style.display = 'none';
      
      currentConversationId = null;
      if (chatPollingInterval) clearInterval(chatPollingInterval);
      if (conversationPollingInterval) clearInterval(conversationPollingInterval);
    }

    async function loadChatConversations() {
      try {
        console.log('📞 [CHAT] Fetching conversations...', 'Current User:', window.currentUser?.id, window.currentUser?.role);
        const response = await fetch('api.php?action=chat_conversations', { credentials: 'include' });
        
        console.log('📥 [CHAT] Response status:', response.status, 'OK:', response.ok);
        
        // Check response status
        if (!response.ok) {
          const errorData = await response.text();
          console.error('❌ [CHAT] API Error:', response.status, errorData);
          throw new Error(`API returned ${response.status}: ${errorData}`);
        }
        
        const data = await response.json();
        console.log('📊 [CHAT] Conversations data:', JSON.stringify(data, null, 2));
        
        // Check for errors in response
        if (data.error) {
          console.error('❌ [CHAT] API Error in response:', data.error);
          throw new Error(data.error);
        }
        
        // Calculate total unread messages
        let totalUnread = 0;
        const conversationsDiv = document.getElementById('chatConversations');
        
        if (!data.conversations || data.conversations.length === 0) {
          console.log('ℹ️  [CHAT] No conversations found');
          if (conversationsDiv) conversationsDiv.innerHTML = '<p class="chat-no-data">No conversations yet. Start chatting!</p>';
        } else {
          console.log('✅ [CHAT] Found', data.conversations.length, 'conversations');
          if (conversationsDiv) {
            conversationsDiv.innerHTML = data.conversations.map((conv, idx) => {
              totalUnread += conv.unread_count || 0;
              const otherName = conv.admin_name || conv.patient_name || 'Support Team';
              const unreadClass = conv.unread_count > 0 ? 'unread' : '';
              const unreadBadge = conv.unread_count > 0 ? `<span class="chat-unread-badge">${conv.unread_count}</span>` : '';
              // If we're an admin, use patient_user_id; if we're a patient, use admin_user_id
              const otherUserId = conv.patient_user_id || conv.admin_user_id || (conv.patient_name ? conv.patient_id : conv.admin_id);
              
              console.log(`  └─ [${idx}] Conv ID:${conv.id}, Other:${otherName} (ID:${otherUserId}), Unread:${conv.unread_count}`);
              
              return `
                <div class="chat-conversation-item ${unreadClass}">
                  <div onclick="openConversation(${conv.id}, '${otherName.replace(/'/g, "\\'")}', ${otherUserId})" style="flex: 1; cursor: pointer;">
                    <div class="chat-conv-name">${otherName}</div>
                    <div class="chat-conv-meta">${formatDateTime(conv.updated_at)}</div>
                  </div>
                  <div class="chat-conv-menu">
                    ${unreadBadge}
                    <button class="chat-menu-btn" onclick="event.stopPropagation(); toggleConversationMenu(${conv.id})" title="More options">⋯</button>
                    <div class="chat-menu-dropdown" id="menu-conv-${conv.id}" style="display: none;">
                      <button onclick="event.stopPropagation(); deleteConversation(${conv.id}, '${otherName.replace(/'/g, "\\'")}')">🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              `;
            }).join('');
          }
        }
        
        // Update message count in header and account menu
        const accountMsgCount = document.getElementById('accountMsgCount');
        const headerMsgCount = document.getElementById('headerMsgCount');
        
        if (totalUnread > 0) {
          if (accountMsgCount) {
            accountMsgCount.textContent = totalUnread;
            accountMsgCount.hidden = false;
          }
          if (headerMsgCount) {
            headerMsgCount.textContent = totalUnread;
            headerMsgCount.hidden = false;
          }
        } else {
          if (accountMsgCount) accountMsgCount.hidden = true;
          if (headerMsgCount) headerMsgCount.hidden = true;
        }

      } catch (err) {
        console.error('Error loading conversations:', err);
        const conversationsDiv = document.getElementById('chatConversations');
        if (conversationsDiv) {
          conversationsDiv.innerHTML = '<p class="chat-error">Error loading conversations: ' + (err.message || 'Unknown error') + '</p>';
        }
      }
    }

    async function openConversation(conversationId, otherUserName, otherUserId) {
      console.log('🔓 [CHAT] Opening conversation:', { conversationId, otherUserName, otherUserId, currentUserId: window.currentUser?.id });
      
      currentConversationId = conversationId;
      currentChatUser = otherUserId;

      const conversationsDiv = document.getElementById('chatConversations');
      const messagesDiv = document.getElementById('chatMessages');
      const nameEl = document.getElementById('chatOtherUserName');
      const backBtn = document.querySelector('.chat-back-btn');

      if (conversationsDiv) conversationsDiv.style.display = 'none';
      if (messagesDiv) messagesDiv.style.display = 'flex';
      if (nameEl) nameEl.textContent = otherUserName;
      
      // For patients, hide the back button (they came directly from Start Live Chat)
      if (backBtn && window.currentUser && window.currentUser.role === 'PATIENT') {
        backBtn.style.display = 'none';
      } else if (backBtn) {
        backBtn.style.display = 'block';
      }

      await loadChatMessages();

      // Poll for new messages every 1 second for better responsiveness
      if (chatPollingInterval) clearInterval(chatPollingInterval);
      chatPollingInterval = setInterval(loadChatMessages, 1000);
      
      // Also poll for conversation list updates every 2 seconds while viewing
      // This ensures unread counts and timestamps update when patient sends messages
      if (conversationPollingInterval) clearInterval(conversationPollingInterval);
      conversationPollingInterval = setInterval(() => {
        console.log('🔄 [CHAT] Refreshing conversations list...');
        loadChatConversations();
      }, 2000);
    }

    async function loadChatMessages() {
      if (!currentConversationId) {
        const messagesWindow = document.getElementById('chatMessagesWindow');
        if (messagesWindow) {
          messagesWindow.innerHTML = '<p class="chat-no-messages">No messages yet. Start the conversation!</p>';
        }
        return;
      }

      try {
        const url = `api.php?action=chat_messages&conversation_id=${currentConversationId}`;
        console.log('📤 [CHAT] Fetching messages from:', url, 'Conv ID:', currentConversationId, 'Current User:', window.currentUser?.id);
        
        const response = await fetch(url, { credentials: 'include' });
        console.log('📥 [CHAT] Response status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to load messages`);
        
        const data = await response.json();
        console.log('📊 [CHAT] API Response data:', JSON.stringify(data, null, 2));
        
        const messagesWindow = document.getElementById('chatMessagesWindow');
        
        if (!data.messages) {
          console.warn('⚠️  [CHAT] No messages array in response. Data keys:', Object.keys(data));
          messagesWindow.innerHTML = '<p class="chat-no-messages">Error: Invalid response format</p>';
          return;
        }
        
        if (data.messages.length === 0) {
          console.log('ℹ️  [CHAT] Conversation has no messages');
          messagesWindow.innerHTML = '<p class="chat-no-messages">No messages yet. Start the conversation!</p>';
          return;
        }

        console.log('✅ [CHAT] Found', data.messages.length, 'messages. First:', data.messages[0]);
        messagesWindow.innerHTML = data.messages.map(msg => {
          const isOwn = msg.sender_id == (window.currentUser?.id || 0);
          const msgClass = isOwn ? 'own' : 'other';
          console.log(`  └─ Message from ${msg.sender_name} (ID:${msg.sender_id}): "${msg.message.substring(0, 30)}..." isOwn=${isOwn}`);
          return `
            <div class="chat-message ${msgClass}" style="position: relative; group:;">
              <div class="chat-msg-sender">${msg.sender_name}</div>
              <div class="chat-msg-text">${escapeHtml(msg.message)}</div>
              <div class="chat-msg-time">${formatDateTime(msg.created_at)}</div>
              ${isOwn ? `
                <div class="chat-msg-menu">
                  <button class="chat-msg-menu-btn" onclick="event.stopPropagation(); toggleMessageMenu(${msg.id})" title="More options">⋯</button>
                  <div class="chat-msg-menu-dropdown" id="menu-msg-${msg.id}" style="display: none;">
                    <button onclick="event.stopPropagation(); deleteMessage(${msg.id}, ${currentConversationId})">🗑️ Delete</button>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');

        messagesWindow.scrollTop = messagesWindow.scrollHeight;
        console.log('✨ [CHAT] Messages rendered successfully');

        // Mark messages as read
        await markChatMessagesRead(currentConversationId);

      } catch (err) {
        console.error('💥 [CHAT] Error loading messages:', err);
        document.getElementById('chatMessagesWindow').innerHTML = `<p class="chat-no-messages">Error: ${err.message}</p>`;
      }
    }

    async function sendChatMessage() {
      if (!currentChatUser) {
        console.warn('⚠️  [CHAT] No conversation selected');
        alert('Please select a conversation first');
        return;
      }

      const inputEl = document.getElementById('chatMessageInput');
      const message = inputEl?.value?.trim() || '';

      if (!message) return;

      try {
        console.log('📤 [CHAT] Sending message to conversation', currentConversationId, 'other user:', currentChatUser);
        
        const response = await fetch('api.php?action=chat_send', { 
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: currentConversationId || 0,
            message: message,
            other_user_id: currentChatUser,
          }),
        });

        console.log('📥 [CHAT] Send response status:', response.status, 'OK:', response.ok);
        
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        console.log('📊 [CHAT] Send response:', JSON.stringify(data, null, 2));
        
        if (data.error) {
          console.error('❌ [CHAT] API Error:', data.error);
          alert('Failed to send message: ' + data.error);
          return;
        }
        
        if (data.success) {
          console.log('✅ [CHAT] Message sent successfully');
          // If this was a new conversation, update the ID
          if (!currentConversationId && data.conversation_id) {
            currentConversationId = data.conversation_id;
            console.log('🔄 [CHAT] New conversation created, ID:', currentConversationId);
          }
          if (inputEl) inputEl.value = '';
          await loadChatMessages();
          
          // Reload conversations to show the new one
          await loadChatConversations();
        } else {
          console.warn('⚠️  [CHAT] Success flag not set in response');
          alert('Failed to send message: ' + (data.error || 'Unknown error'));
        }

      } catch (err) {
        console.error('💥 [CHAT] Exception sending message:', err);
        alert('Failed to send message: ' + err.message);
      }
    }

    async function markChatMessagesRead(conversationId) {
      try {
        console.log('📋 [CHAT] Marking messages as read for conversation', conversationId);
        
        const response = await fetch('api.php?action=chat_mark_read', { 
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: conversationId }),
        });
        
        if (!response.ok) {
          console.warn('⚠️  [CHAT] Mark read returned status', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('✅ [CHAT] Messages marked as read, updated:', data.updated || 0);
      } catch (err) {
        console.error('⚠️  [CHAT] Error marking messages as read:', err);
      }
    }

    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Menu toggle functions
    function toggleConversationMenu(conversationId) {
      const menu = document.getElementById(`menu-conv-${conversationId}`);
      if (menu) {
        // Close all other menus
        document.querySelectorAll('.chat-menu-dropdown').forEach(m => {
          if (m.id !== `menu-conv-${conversationId}`) m.style.display = 'none';
        });
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      }
    }

    function toggleMessageMenu(messageId) {
      const menu = document.getElementById(`menu-msg-${messageId}`);
      if (menu) {
        // Close all other menus
        document.querySelectorAll('.chat-msg-menu-dropdown').forEach(m => {
          if (m.id !== `menu-msg-${messageId}`) m.style.display = 'none';
        });
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      }
    }

    function togglePatientConversationMenu(conversationId) {
      const menu = document.getElementById(`menu-pconv-${conversationId}`);
      if (menu) {
        document.querySelectorAll('[id^="menu-pconv-"]').forEach(m => {
          if (m.id !== `menu-pconv-${conversationId}`) m.style.display = 'none';
        });
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      }
    }

    function togglePatientMessageMenu(messageId) {
      const menu = document.getElementById(`menu-pmsg-${messageId}`);
      if (menu) {
        document.querySelectorAll('[id^="menu-pmsg-"]').forEach(m => {
          if (m.id !== `menu-pmsg-${messageId}`) m.style.display = 'none';
        });
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      }
    }

    function togglePatientMessageMenuDash(messageId) {
      const menu = document.getElementById(`menu-pmsg-dash-${messageId}`);
      if (menu) {
        document.querySelectorAll('[id^="menu-pmsg-dash-"]').forEach(m => {
          if (m.id !== `menu-pmsg-dash-${messageId}`) m.style.display = 'none';
        });
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      }
    }

    // Delete functions
    async function deleteConversation(conversationId, conversationName) {
      if (!confirm(`Delete conversation with ${conversationName}? This cannot be undone.`)) return;
      
      try {
        const response = await fetch('api.php?action=chat_delete_conversation', {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: conversationId })
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('✅ Conversation deleted');
          await loadChatConversations();
          backToConversations();
        } else {
          alert('Failed to delete conversation: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Error deleting conversation');
      }
    }

    async function deleteMessage(messageId, conversationId) {
      if (!confirm('Delete this message? This cannot be undone.')) return;
      
      try {
        const response = await fetch('api.php?action=chat_delete_message', {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message_id: messageId })
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('✅ Message deleted');
          await loadChatMessages();
        } else {
          alert('Failed to delete message: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Error deleting message');
      }
    }

    async function deletePatientConversation(conversationId, conversationName) {
      if (!confirm(`Delete conversation with ${conversationName}? This cannot be undone.`)) return;
      
      try {
        const response = await fetch('api.php?action=chat_delete_conversation', {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: conversationId })
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('✅ Conversation deleted');
          patientCurrentConversationId = null;
          loadPatientChatConversations();
        } else {
          alert('Failed to delete conversation: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Error deleting conversation');
      }
    }

    async function deletePatientMessage(messageId, conversationId) {
      if (!confirm('Delete this message? This cannot be undone.')) return;
      
      try {
        const response = await fetch('api.php?action=chat_delete_message', {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message_id: messageId })
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('✅ Message deleted');
          loadPatientChatMessages();
        } else {
          alert('Failed to delete message: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Error deleting message');
      }
    }

    // Tab Switching Functions
    function showConversationsTab() {
      const conversationsDiv = document.getElementById('chatConversations');
      const contactsDiv = document.getElementById('chatContacts');
      const conversationsTab = document.getElementById('chatTabConversations');
      const contactsTab = document.getElementById('chatTabContacts');
      
      if (conversationsDiv) conversationsDiv.style.display = 'block';
      if (contactsDiv) contactsDiv.style.display = 'none';
      if (conversationsTab) conversationsTab.classList.add('active');
      if (contactsTab) contactsTab.classList.remove('active');
      
      if (chatPollingInterval) clearInterval(chatPollingInterval);
    }

    function showContactsTab() {
      const conversationsDiv = document.getElementById('chatConversations');
      const contactsDiv = document.getElementById('chatContacts');
      const conversationsTab = document.getElementById('chatTabConversations');
      const contactsTab = document.getElementById('chatTabContacts');
      
      if (conversationsDiv) conversationsDiv.style.display = 'none';
      if (contactsDiv) contactsDiv.style.display = 'block';
      if (conversationsTab) conversationsTab.classList.remove('active');
      if (contactsTab) contactsTab.classList.add('active');
      
      loadPatientContacts();
    }

    // Patient Contacts Functions
    let allPatientContacts = [];

    async function loadPatientContacts() {
      try {
        // First check if user is admin
        if (!window.currentUser || window.currentUser.role !== 'ADMIN') {
          const contactsList = document.getElementById('contactsList');
          if (contactsList) {
            contactsList.innerHTML = '<p class="chat-error">📋 Patient Contacts are only available to Administrators. Your role: ' + escapeHtml(window.currentUser?.role || 'UNKNOWN') + '</p>';
          }
          return;
        }

        const response = await fetch('api.php?action=patient_contacts', { credentials: 'include' });
        
        // Check if response is ok
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', response.status, errorText);
          const contactsList = document.getElementById('contactsList');
          if (contactsList) {
            contactsList.innerHTML = '<p class="chat-error">⚠️ Server error: ' + response.status + '</p>';
          }
          return;
        }
        
        const data = await response.json();
        
        // Check for error in response
        if (data.error) {
          console.error('API error:', data.error);
          const contactsList = document.getElementById('contactsList');
          if (contactsList) {
            contactsList.innerHTML = '<p class="chat-error">⚠️ ' + escapeHtml(data.error) + '</p>';
          }
          return;
        }

        // Check if contacts exist
        if (!data.success || !data.contacts) {
          console.warn('Invalid response format:', data);
          const contactsList = document.getElementById('contactsList');
          if (contactsList) {
            contactsList.innerHTML = '<p class="chat-no-data">No patient contacts found</p>';
          }
          return;
        }

        // Transform API response to display format
        const transformedContacts = data.contacts.map(c => ({
          id: c.id,
          patient_user_id: c.patient_user_id || 0,
          name: c.full_name || 'Unknown',
          phone: c.contact || 'N/A',
          email: 'N/A',
          ward: c.ward || 'Unassigned',
          status: c.status,
          gender: c.gender,
          upcoming_appointment_count: c.upcoming_appointment_count || 0,
          next_appointment: c.next_appointment || null,
          unread_messages: c.unread_messages || 0,
          total_conversations: 0,
          status_badge: mapStatusToBadge(c.status),
          created_at: ''
        }));

        allPatientContacts = transformedContacts;
        displayPatientContacts(allPatientContacts);

      } catch (err) {
        console.error('Error loading patient contacts:', err);
        const contactsList = document.getElementById('contactsList');
        if (contactsList) {
          contactsList.innerHTML = '<p class="chat-error">❌ Error: ' + escapeHtml(err.message) + '</p>';
        }
      }
    }

    function mapStatusToBadge(patientStatus) {
      const status = String(patientStatus || '').toUpperCase();
      if (['CRITICAL', 'EMERGENCY'].includes(status)) {
        return 'URGENT';
      } else if (['SCHEDULED', 'FOLLOW-UP REQUIRED'].includes(status)) {
        return 'UPCOMING';
      } else {
        return 'ACTIVE';
      }
    }

    function displayPatientContacts(contacts) {
      const contactsList = document.getElementById('contactsList');
      
      if (!contacts || contacts.length === 0) {
        if (contactsList) {
          contactsList.innerHTML = '<p class="chat-no-data">No patient contacts found</p>';
        }
        return;
      }

      if (contactsList) {
        contactsList.innerHTML = contacts.map(contact => {
          // Format appointment information
          let appointmentDisplay = '<span style="color: #999; font-size: 0.85rem;">No upcoming appointments</span>';
          
          if (contact.next_appointment) {
            const apt = contact.next_appointment;
            const aptDate = new Date(apt.date);
            const formattedDate = aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const formattedTime = apt.time ? apt.time.substring(0, 5) : 'TBA';
            const doctorName = apt.doctor_name || 'Doctor TBA';
            
            appointmentDisplay = `
              <div style="font-size: 0.85rem; color: #333; margin-top: 4px;">
                <strong>📅 ${formattedDate} at ${formattedTime}</strong>
                <div style="color: #666; margin-top: 2px;">${escapeHtml(doctorName)}</div>
              </div>
            `;
          }
          
          const unreadBadge = contact.unread_messages > 0 
            ? `<span class="contact-unread-badge" title="${contact.unread_messages} unread message${contact.unread_messages > 1 ? 's' : ''}">${contact.unread_messages}</span>` 
            : '';

          return `
            <div class="contact-item" onclick="startChatWithContact(${contact.patient_user_id}, '${contact.name.replace(/'/g, "\\'")}')"> 
              <div class="contact-left">
                <div class="contact-avatar">${contact.name.charAt(0).toUpperCase()}</div>
                <div class="contact-info">
                  <div class="contact-name">${escapeHtml(contact.name)}</div>
                  <div class="contact-meta">
                    <span class="contact-phone">${escapeHtml(contact.phone || 'N/A')}</span>
                  </div>
                  ${appointmentDisplay}
                </div>
              </div>
              <div class="contact-right">
                ${unreadBadge}
              </div>
            </div>
          `;
        }).join('');
      }

      // Setup search functionality
      const searchInput = document.getElementById('contactSearchInput');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          filterPatientContacts(this.value);
        });
      }
    }

    function filterPatientContacts(searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = allPatientContacts.filter(contact => 
        (contact.name || '').toLowerCase().includes(term) ||
        (contact.phone || '').toLowerCase().includes(term) ||
        (contact.status || '').toLowerCase().includes(term) ||
        (contact.gender || '').toLowerCase().includes(term)
      );
      displayPatientContacts(filtered);
    }

    async function startChatWithContact(patientUserId, patientName) {
      try {
        console.log('Starting chat with patient user:', patientUserId, 'name:', patientName);
        
        // Hide contacts and conversations, show messages
        const chatContacts = document.getElementById('chatContacts');
        const chatConversations = document.getElementById('chatConversations');
        const messagesDiv = document.getElementById('chatMessages');
        
        if (chatConversations) chatConversations.style.display = 'none';
        if (chatContacts) chatContacts.style.display = 'none';
        if (messagesDiv) messagesDiv.style.display = 'flex';
        
        // Set conversation info (use patient user ID for messaging)
        currentChatUser = patientUserId;
        currentConversationId = 0; // Reset conversation ID
        const nameEl = document.getElementById('chatOtherUserName');
        if (nameEl) nameEl.textContent = patientName;
        
        // Try to load existing conversations to find one with this patient
        try {
          const response = await fetch('api.php?action=chat_conversations', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            if (data.conversations && Array.isArray(data.conversations)) {
              const existing = data.conversations.find(conv => 
                parseInt(conv.patient_user_id) === parseInt(patientUserId) ||
                parseInt(conv.admin_user_id) === parseInt(patientUserId)
              );
              
              if (existing) {
                currentConversationId = existing.id;
                console.log('Found existing conversation:', existing.id);
              }
            }
          }
        } catch (e) {
          console.log('Could not load conversations, will create new one on first message');
        }
        
        // Load messages (empty if no conversation yet)
        await loadChatMessages();
        
        // Start polling
        if (chatPollingInterval) clearInterval(chatPollingInterval);
        chatPollingInterval = setInterval(loadChatMessages, 2000);
        
      } catch (err) {
        console.error('Error starting chat with contact:', err);
        alert('Error starting chat: ' + err.message);
      }
    }

    // Listen for messages button clicks
    document.addEventListener('DOMContentLoaded', function() {
      // Store current user info for chat
      window.currentUser = <?php echo json_encode($user ?? [], JSON_UNESCAPED_SLASHES); ?>;
    });

    // Draggable functionality for chat modal
    function makeChatModalDraggable() {
      const modalContent = document.querySelector('.chat-modal-content');
      const modalHeader = document.querySelector('.chat-modal-header');

      if (!modalContent || !modalHeader) return;

      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      modalHeader.addEventListener('mousedown', function(e) {
        // Don't drag if clicking on buttons
        if (e.target.closest('button')) return;
        
        isDragging = true;
        offsetX = e.clientX - modalContent.getBoundingClientRect().left;
        offsetY = e.clientY - modalContent.getBoundingClientRect().top;
        modalContent.style.cursor = 'grabbing';
        modalContent.classList.add('dragging');
      });

      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        // Keep modal within viewport
        const margin = 20;
        const width = modalContent.offsetWidth;
        const height = modalContent.offsetHeight;

        // Clamp position to viewport
        x = Math.max(margin, Math.min(x, window.innerWidth - width - margin));
        y = Math.max(margin, Math.min(y, window.innerHeight - height - margin));

        modalContent.style.right = 'auto';
        modalContent.style.bottom = 'auto';
        modalContent.style.left = x + 'px';
        modalContent.style.top = y + 'px';
      });

      document.addEventListener('mouseup', function() {
        isDragging = false;
        modalContent.style.cursor = 'move';
        modalContent.classList.remove('dragging');
      });

      // Reset to bottom-right when opening
      const originalOpen = window.openChatModal;
      window.openChatModal = function() {
        originalOpen.call(this);
        // Reset position to bottom-right
        setTimeout(() => {
          modalContent.style.right = '1.5rem';
          modalContent.style.bottom = '1.5rem';
          modalContent.style.left = 'auto';
          modalContent.style.top = 'auto';
        }, 50);
      };
    }

    // Close modal when clicking outside
    document.getElementById('chatModal').addEventListener('click', function(e) {
      if (e.target === this) closeChatModal();
    });
  </script>

<?php endif; // Close patient/admin role conditional ?>

</body>
</html>
