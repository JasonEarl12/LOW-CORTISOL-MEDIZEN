/**
 * Enhanced Admin Verification Modal Handler
 * Features: Attempt tracking, timeout warnings, better UX
 */

class AdminVerificationModal {
  constructor() {
    this.modal = document.getElementById('adminVerificationModal');
    this.form = document.getElementById('adminVerificationForm');
    this.passwordInput = document.getElementById('adminVerificationPassword');
    this.passwordToggle = document.getElementById('adminVerificationPasswordToggle');
    this.submitBtn = document.getElementById('adminVerificationSubmit');
    this.cancelBtn = document.getElementById('adminVerificationCancel');
    this.closeBtn = document.getElementById('adminVerificationClose');
    this.errorBanner = document.getElementById('adminVerificationError');
    this.errorMessage = document.getElementById('adminVerificationErrorMessage');
    this.retryBtn = document.getElementById('retryVerifyBtn');
    this.successBanner = document.getElementById('adminVerificationSuccess');
    this.loadingState = document.getElementById('adminVerificationLoading');
    this.attemptWarning = document.getElementById('attemptWarning');
    this.attemptText = document.getElementById('attemptText');

    this.maxAttempts = 3;
    this.failedAttempts = 0;
    this.isVerifying = false;
    this.sessionTimeout = null;

    this.init();
  }

  init() {
    this.attachEventListeners();
    this.setupSessionTimeout();
  }

  attachEventListeners() {
    // Form submission
    this.form?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Password visibility toggle
    this.passwordToggle?.addEventListener('click', (e) => {
      e.preventDefault();
      this.togglePasswordVisibility();
    });

    // Cancel button
    this.cancelBtn?.addEventListener('click', () => this.close());

    // Close button
    this.closeBtn?.addEventListener('click', () => this.close());

    // Retry button
    this.retryBtn?.addEventListener('click', () => this.retryVerification());

    // Modal backdrop (click outside to close)
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Keyboard handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal?.hidden) {
        this.close();
      }
    });

    // Clear error when user starts typing
    this.passwordInput?.addEventListener('input', () => {
      this.clearError();
    });
  }

  togglePasswordVisibility() {
    const isPassword = this.passwordInput.type === 'password';
    this.passwordInput.type = isPassword ? 'text' : 'password';
    this.passwordToggle.textContent = isPassword ? '👁‍🗨' : '👁';
    this.passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (this.isVerifying) return;

    const password = this.passwordInput.value.trim();

    // Validation
    if (!password) {
      this.showError('Please enter your password');
      return;
    }

    if (password.length < 8) {
      this.showError('Password must be at least 8 characters');
      return;
    }

    // Check attempt limit
    if (this.failedAttempts >= this.maxAttempts) {
      this.showError(`Too many failed attempts. Please try again later.`, true);
      this.submitBtn.disabled = true;
      this.passwordInput.disabled = true;
      return;
    }

    this.verify(password);
  }

  async verify(password) {
    this.isVerifying = true;
    this.showLoading(true);
    this.clearError();

    try {
      const response = await fetch('/pms/xampp-pms/api.php?action=verify_admin_credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        this.showSuccess();
        this.resetAttemptCounter();
        setTimeout(() => {
          this.close();
          this.triggerVerificationCallback(data);
        }, 1500);
      } else {
        this.handleVerificationError(data.error || 'Verification failed');
      }
    } catch (error) {
      this.handleVerificationError('Network error. Please try again.');
      console.error('Verification error:', error);
    } finally {
      this.isVerifying = false;
      this.showLoading(false);
    }
  }

  handleVerificationError(errorMsg) {
    this.failedAttempts++;
    const remainingAttempts = this.maxAttempts - this.failedAttempts;

    if (remainingAttempts > 0) {
      this.showError(errorMsg);
      this.showAttemptWarning(this.failedAttempts, remainingAttempts);
    } else {
      this.showError('Maximum verification attempts exceeded. Please try again later.', true);
      this.submitBtn.disabled = true;
      this.passwordInput.disabled = true;
    }

    // Clear password field for security
    this.passwordInput.value = '';
    this.passwordInput.focus();
  }

  showError(message, critical = false) {
    this.errorMessage.textContent = message;
    this.errorBanner.hidden = false;

    if (critical) {
      this.retryBtn.hidden = true;
    } else {
      this.retryBtn.hidden = false;
      this.retryBtn.onclick = () => {
        this.clearError();
        this.passwordInput.focus();
      };
    }

    // Shake animation
    this.form.classList.add('shake');
    setTimeout(() => this.form.classList.remove('shake'), 500);
  }

  clearError() {
    this.errorBanner.hidden = true;
    this.errorMessage.textContent = '';
  }

  showLoading(show) {
    this.loadingState.hidden = !show;
    this.submitBtn.disabled = show;
    this.passwordInput.disabled = show;

    if (show) {
      this.submitBtn.querySelector('.btn-icon').hidden = false;
      this.submitBtn.querySelector('.btn-text').textContent = 'Verifying';
    } else {
      this.submitBtn.querySelector('.btn-icon').hidden = true;
      this.submitBtn.querySelector('.btn-text').textContent = 'Verify';
    }
  }

  showSuccess() {
    this.successBanner.hidden = false;
    this.form.hidden = true;
  }

  showAttemptWarning(failed, remaining) {
    this.attemptWarning.hidden = false;
    const pluralAttempt = remaining === 1 ? 'attempt' : 'attempts';
    this.attemptText.textContent = `${failed} failed ${failed === 1 ? 'attempt' : 'attempts'}. ${remaining} ${pluralAttempt} remaining.`;

    if (remaining <= 1) {
      this.attemptWarning.style.backgroundColor = '#f8d7da';
      this.attemptWarning.style.borderLeftColor = '#dc3545';
      this.attemptWarning.style.color = '#721c24';
    }
  }

  resetAttemptCounter() {
    this.failedAttempts = 0;
    this.attemptWarning.hidden = true;
  }

  retryVerification() {
    this.clearError();
    this.passwordInput.focus();
  }

  open() {
    if (this.modal) {
      this.modal.hidden = false;
      this.resetForm();
      this.passwordInput?.focus();

      // Announce to screen readers
      this.modal.setAttribute('aria-hidden', 'false');
    }
  }

  close() {
    if (this.modal) {
      this.modal.hidden = true;
      this.resetForm();

      // Announce to screen readers
      this.modal.setAttribute('aria-hidden', 'true');
    }
  }

  resetForm() {
    this.form.reset();
    this.clearError();
    this.successBanner.hidden = true;
    this.form.hidden = false;
    this.passwordInput.type = 'password';
    this.passwordToggle.textContent = '👁';
    this.submitBtn.disabled = false;
    this.passwordInput.disabled = false;
    this.loadingState.hidden = true;

    if (this.failedAttempts === 0) {
      this.attemptWarning.hidden = true;
    }
  }

  setupSessionTimeout() {
    // Monitor user activity and warn about session expiration
    const warningContainer = document.getElementById('sessionTimeoutWarning');
    let inactivityTimeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      warningContainer?.setAttribute('hidden', '');

      // Set 25-minute inactivity warning
      inactivityTimeout = setTimeout(() => {
        if (!this.modal?.hidden) {
          this.showSessionWarning(warningContainer);
        }
      }, 25 * 60 * 1000);
    };

    // Reset timer on user activity
    document.addEventListener('click', resetTimer);
    document.addEventListener('keydown', resetTimer);

    resetTimer();
  }

  showSessionWarning(container) {
    if (!container) return;

    container.removeAttribute('hidden');
    let timeLeft = 5;
    const counter = document.getElementById('timeoutCounter');
    const extendBtn = document.getElementById('extendSessionBtn');

    const countdownInterval = setInterval(() => {
      timeLeft--;
      if (counter) counter.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        this.close();
      }
    }, 60000);

    extendBtn?.addEventListener('click', () => {
      clearInterval(countdownInterval);
      container.setAttribute('hidden', '');
      this.setupSessionTimeout();
    });
  }

  triggerVerificationCallback(data) {
    // Dispatch custom event for parent components
    const event = new CustomEvent('admin-verification-success', {
      detail: data,
    });
    document.dispatchEvent(event);
  }

  isOpen() {
    return !this.modal?.hidden;
  }
}

// Add shake animation style dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
    20%, 40%, 60%, 80% { transform: translateX(8px); }
  }
  
  .shake {
    animation: shake 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
let adminVerificationModal;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    adminVerificationModal = new AdminVerificationModal();
  });
} else {
  adminVerificationModal = new AdminVerificationModal();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminVerificationModal;
}
