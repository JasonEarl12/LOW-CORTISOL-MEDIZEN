import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import { API_BASE_URL, login, resolveFallbackUser } from "../api";
import "./PatientDetailModal.css";

const PATIENT_STATUSES = [
  "ADMITTED",
  "CRITICAL",
  "IN TREATMENT",
  "UNDER OBSERVATION",
  "STABLE",
  "RECOVERING",
  "DISCHARGED",
  "FOLLOW-UP REQUIRED",
  "SCHEDULED",
  "NO-SHOW"
];

const STATUS_COLORS = {
  "ADMITTED": "#3b82f6",
  "CRITICAL": "#ef4444",
  "IN TREATMENT": "#f97316",
  "UNDER OBSERVATION": "#eab308",
  "STABLE": "#10b981",
  "RECOVERING": "#14b8a6",
  "DISCHARGED": "#8b5cf6",
  "FOLLOW-UP REQUIRED": "#d946ef",
  "SCHEDULED": "#06b6d4",
  "NO-SHOW": "#6b7280"
};

function PatientDetailModal({ patient, currentUser, onClose, onSave }) {
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const linkedAccount = patient ? getLinkedPatientAccount(patient) : null;

  useEffect(() => {
    if (patient) {
      const initialData = {
        id: patient.id,
        fullName: patient.fullName || patient.full_name || "",
        dob: patient.dob || "",
        gender: patient.gender || "MALE",
        status: patient.status || "ADMITTED",
        contact: patient.contact || "",
        doctorId: patient.doctor?.id || patient.doctor_id || "",
        wardId: patient.ward?.id || patient.ward_id || "",
        medicalHistory: patient.medicalHistory || patient.medical_history || "",
        documentsPath: patient.documentsPath || patient.documents_path || "",
        username: patient.username || "",
        password: patient.password || "",
        statusChangeNotes: ""
      };
      setFormData(initialData);
      setOriginalData(JSON.parse(JSON.stringify(initialData)));
    }
  }, [patient]);

  if (!formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!formData.dob) {
      setError("Date of birth is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Build PHP API request body
      const requestBody = {
        full_name: formData.fullName.trim(),
        dob: formData.dob,
        gender: formData.gender,
        status: formData.status,
        contact: formData.contact.trim() || '',
        medical_history: formData.medicalHistory.trim() || '',
        doctor_id: formData.doctorId ? parseInt(formData.doctorId) : null,
        ward_id: formData.wardId ? parseInt(formData.wardId) : null,
        username: formData.username.trim() || ''
        // Note: password field is ignored - it will be generated from username + patient_id
      };

      // Include ID for updates
      if (formData.id) {
        requestBody.id = formData.id;
      }

      const response = await fetch(`${API_BASE_URL}/xampp-pms/api.php?action=patient_save`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error ${response.status}: ${errorData || 'Failed to save'}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      const savedPatient = result.patient || result;

      if (!savedPatient.id) {
        throw new Error("Response missing patient ID");
      }

      // Show success message
      setSuccess(`Patient "${savedPatient.full_name}" saved successfully!`);
      
      // Wait a moment for visual feedback, then close and update
      setTimeout(() => {
        onSave(savedPatient);
        onClose();
      }, 800);
      
    } catch (err) {
      setError(err.message || "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" duration={5000} onClose={() => setError("")} />
      
      <div className="modal-overlay">
        <div className="modal-content patient-detail-modal">
          <div className="modal-header">
            <h2>{formData?.id ? "Edit Patient" : "Create New Patient"}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="modal-body">
            {/* PERSONAL INFORMATION */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData?.fullName || ""}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth <span className="required">*</span></label>
                  <input
                    type="date"
                    name="dob"
                    value={formData?.dob || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData?.gender || "MALE"} onChange={handleChange}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STATUS SELECTION */}
            <div className="form-section status-section">
              <h3 className="section-title">Patient Status <span className="required">*</span></h3>
              <div className="status-group">
                <div className="form-group">
                  <label>Current Status</label>
                  <select 
                    name="status" 
                    value={formData?.status || "ADMITTED"} 
                    onChange={handleChange}
                    className="status-select"
                  >
                    {PATIENT_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="status-badge-group">
                  <label>Quick Select</label>
                  <div className="status-buttons">
                    {PATIENT_STATUSES.map(status => (
                      <button
                        key={status}
                        className={`status-btn ${formData?.status === status ? 'active' : ''}`}
                        style={{
                          backgroundColor: formData?.status === status ? STATUS_COLORS[status] : 'transparent',
                          borderColor: STATUS_COLORS[status],
                          color: formData?.status === status ? 'white' : STATUS_COLORS[status]
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, status }))}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Status Change Notes</label>
                  <textarea
                    name="statusChangeNotes"
                    value={formData?.statusChangeNotes || ""}
                    onChange={handleChange}
                    placeholder="Reason for status change (optional)"
                    rows="2"
                  />
                </div>
              </div>
            </div>

            {/* CONTACT AND ASSIGNMENT */}
            <div className="form-section">
              <h3 className="section-title">Contact & Assignment</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData?.contact || ""}
                    onChange={handleChange}
                    placeholder="Phone or email"
                  />
                </div>

                <div className="form-group">
                  <label>Assigned Doctor</label>
                  <input
                    type="number"
                    name="doctorId"
                    value={formData?.doctorId || ""}
                    onChange={handleChange}
                    placeholder="Doctor ID"
                  />
                </div>

                <div className="form-group">
                  <label>Ward Assignment</label>
                  <input
                    type="number"
                    name="wardId"
                    value={formData?.wardId || ""}
                    onChange={handleChange}
                    placeholder="Ward ID"
                  />
                </div>
              </div>
            </div>

            {/* MEDICAL HISTORY */}
            <div className="form-section">
              <h3 className="section-title">Medical Information</h3>
              <div className="form-group full-width">
                <label>Medical History / Notes</label>
                <textarea
                  name="medicalHistory"
                  value={formData?.medicalHistory || ""}
                  onChange={handleChange}
                  placeholder="Patient medical history and notes"
                  rows="4"
                />
              </div>

              <div className="form-group full-width">
                <label>Documents Path</label>
                <input
                  type="text"
                  name="documentsPath"
                  value={formData?.documentsPath || ""}
                  onChange={handleChange}
                  placeholder="/path/to/documents"
                />
              </div>
            </div>

            {currentUser && String(currentUser.role || "").toUpperCase() === "ADMIN" && (
              <div className="form-section credentials-section">
                <h3 className="section-title">Login Credentials (Admin Only)</h3>
                <div className="credentials-grid">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData?.username || ""}
                      onChange={handleChange}
                      placeholder="Patient username"
                    />
                  </div>

                  <div className="form-group">
                    <label>Password (Auto-generated)</label>
                    <input
                      type="text"
                      name="password"
                      value={formData?.password || ""}
                      placeholder="Patient password"
                      readOnly
                      title="Password is automatically generated from username and patient ID"
                    />
                  </div>
                </div>
                <p className="credentials-note">
                  Update the username and save to regenerate the password (format: username + patient ID).
                </p>
              </div>
            )}

            {/* BACK BUTTON */}
            <div className="back-button-section">
              <button className="back-btn" onClick={onClose}>
                ← Back to Patients
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PatientDetailModal;

function slugifyUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function getLinkedPatientAccount(patient) {
  const knownAccount = resolveFallbackUser(patient?.username || patient?.fullName || patient?.email || "");

  return {
    username: knownAccount?.username || slugifyUsername(patient?.fullName) || `patient_${patient?.id || "unknown"}`,
    password: "password",
    fullName: knownAccount?.fullName || patient?.fullName || "Patient",
    email: knownAccount?.email || "",
    role: knownAccount?.role || "PATIENT"
  };
}
