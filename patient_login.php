<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';
applySecurityHeaders();

// Block patient login only when Java is required and unavailable
if (isJavaRequired() && !checkJavaHealth()) {
  http_response_code(503);
  echo '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Service Unavailable</title>';
  echo '<link rel="stylesheet" href="assets/styles.css?v=' . filemtime(__DIR__ . '/assets/styles.css') . '">';
  echo '</head><body class="auth-page"><main class="auth-card"><section class="auth-shell"><section class="auth-form-pane">';
  echo '<h1>Service Unavailable</h1><p>The secondary Java backend is not responding. Patient login is temporarily disabled while the Java service is unavailable.</p>';
  echo '<p>Please start the Java backend or check its status, then reload this page.</p>';
  echo '<p><a href="patient_login.php">Retry</a></p>';
  echo '</section></section></main></body></html>';
  exit;
}

$user = currentUser();

// If already authenticated as patient, go to dashboard
if ($user !== null && strtoupper($user['role'] ?? '') === 'PATIENT') {
    header('Location: index.php', true, 302);
    exit;
}

// If already authenticated as admin, redirect them away
if ($user !== null && strtoupper($user['role'] ?? '') === 'ADMIN') {
    $_SESSION['auth_error'] = 'You are logged in as admin. Please logout to use the patient login.';
    header('Location: admin_login.php', true, 302);
    exit;
}

$authError = $_SESSION['auth_error'] ?? null;
unset($_SESSION['auth_error']);
$csrfToken = csrfToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MEDIZEN - Patient Sign In</title>
  <link rel="stylesheet" href="assets/styles.css?v=<?php echo filemtime(__DIR__ . '/assets/styles.css'); ?>" />
  <link rel="stylesheet" href="assets/index-styles.css?v=<?php echo filemtime(__DIR__ . '/assets/index-styles.css'); ?>" />
</head>
<body class="auth-page">
  <main class="auth-card">
    <section class="auth-shell">
      <aside class="auth-side">
        <div class="auth-brand">
          <div class="auth-logo" aria-hidden="true">
            <img src="assets/logo.png" alt="MEDIZEN logo" class="auth-logo-img" loading="eager" decoding="async">
          </div>
        </div>
        <p class="auth-side-desc">A secure, private portal for patients to manage appointments, messages, and health records.</p>
      </aside>

      <section class="auth-form-pane">
        <h1>PATIENT DASHBOARD</h1>
        <p>Sign in to your patient dashboard to view appointments and messages.</p>

        <?php if ($authError): ?>
          <div class="auth-error" role="alert">
            <strong>⚠ Access Denied:</strong> <?php echo htmlspecialchars($authError); ?>
          </div>
        <?php endif; ?>

        <form method="post" action="auth.php" class="auth-form">
          <input type="hidden" name="action" value="login" />
          <input type="hidden" name="login_type" value="patient" />
          <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>" />
          <label>
            Username
            <input name="username" type="text" required placeholder="Patient username" autocomplete="username" autofocus />
          </label>
          <label>
            Password
            <div class="password-row">
              <input id="loginPassword" name="password" type="password" required placeholder="Password" autocomplete="current-password" />
              <button id="togglePasswordBtn" class="password-toggle" type="button" aria-label="Show password">Show</button>
            </div>
            <small id="capsHint" class="input-hint" hidden>Caps Lock is on.</small>
          </label>
          <button id="loginSubmitBtn" type="submit">Sign In</button>
          <div id="loginProgress" class="login-progress" hidden>
            <span class="login-progress-spinner" aria-hidden="true"></span>
            <span>Signing in securely...</span>
          </div>
        </form>

        <p class="auth-quote">"Your health, your appointments, your messages—all in one secure place."</p>

        <div class="auth-note">
          <a href="term_policy.html" target="_blank">Terms of Service</a>
          <a href="privacy_policy.html" target="_blank">Privacy Policy</a>
        </div>
      </section>
    </section>
  </main>

  <script>
    (function () {
      const passwordInput = document.getElementById("loginPassword");
      const toggleBtn = document.getElementById("togglePasswordBtn");
      const capsHint = document.getElementById("capsHint");
      const loginForm = document.querySelector(".auth-form");
      const submitBtn = document.getElementById("loginSubmitBtn");
      const progress = document.getElementById("loginProgress");

      if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", function () {
          const isPassword = passwordInput.type === "password";
          passwordInput.type = isPassword ? "text" : "password";
          toggleBtn.textContent = isPassword ? "Hide" : "Show";
          toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        });

        passwordInput.addEventListener("keyup", function (event) {
          if (!capsHint) return;
          capsHint.hidden = !event.getModifierState("CapsLock");
        });

        passwordInput.addEventListener("blur", function () {
          if (!capsHint) return;
          capsHint.hidden = true;
        });
      }

      if (loginForm && submitBtn && progress) {
        loginForm.addEventListener("submit", function () {
          submitBtn.disabled = true;
          submitBtn.textContent = "Signing In...";
          progress.hidden = false;
        });
      }
    })();
  </script>
</body>
</html>
