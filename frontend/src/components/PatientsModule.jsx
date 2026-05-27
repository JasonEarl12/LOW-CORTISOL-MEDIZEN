import React, { useDeferredValue, useEffect, useMemo, useState, useCallback } from "react";
import PatientDetailModal from "./PatientDetailModal";
import Toast from "./Toast";
import { API_BASE_URL } from "../api";
import "./PatientsModule.css";

const PAGE_SIZE = 100;

function PatientsModule({ currentUser }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Fetch patients with refresh capability
  const fetchPatients = useCallback(async ({ background = false } = {}) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await fetch(`${API_BASE_URL}/api.php?action=module&module=patients`);
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      const rows = Array.isArray(data.rows) ? data.rows : [];
      setPatients(rows);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load patients: " + err.message);
      if (!background) {
        setPatients([]);
      }
    } finally {
      if (background) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    // Background refresh every 60 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchPatients({ background: true });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchPatients]);

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api.php?action=patient&id=${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete patient");
      setPatients((prevPatients) => prevPatients.filter((p) => p.id !== id));
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
      }
      setSuccess("Patient deleted successfully");
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  const handlePatientSaved = (updatedPatient) => {
    setPatients(prevPatients => {
      const index = prevPatients.findIndex(p => p.id === updatedPatient.id);
      if (index > -1) {
        const newPatients = [...prevPatients];
        newPatients[index] = { ...newPatients[index], ...updatedPatient };
        return newPatients;
      } else {
        return [...prevPatients, updatedPatient];
      }
    });
    setSuccess("Patient saved successfully");
    setSelectedPatient(prev => prev ? { ...prev, ...updatedPatient } : null);
    setShowEditModal(false);
  };

  const filteredPatients = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) {
      return patients;
    }

    return patients.filter((p) =>
      String(p.full_name || "").toLowerCase().includes(term) ||
      String(p.contact || "").toLowerCase().includes(term)
    );
  }, [patients, deferredSearchTerm]);

  const getStatusColor = (status) => {
    const colors = {
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
    return colors[status] || "#9ca3af";
  };

  const SkeletonLoader = () => (
    <div className="skeleton-detail">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-subtitle"></div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-section">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-line skeleton-small"></div>
              <div className="skeleton-line skeleton-value"></div>
            </div>
          ))}
        </div>
        <div className="skeleton-section">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-line skeleton-small"></div>
              <div className="skeleton-line skeleton-value"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="patients-module-container">
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" duration={5000} onClose={() => setError("")} />

      <div className="patients-layout-vertical">
        {/* Top Section - Patient List */}
        <div className="patients-list-section">
          <div className="module-toolbar">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by name or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="toolbar-buttons">
              <button className="btn-primary" onClick={() => {
                setSelectedPatient({
                  id: null,
                  full_name: "",
                  dob: "",
                  gender: "MALE",
                  status: "ADMITTED",
                  contact: "",
                  medical_history: "",
                  doctor_id: null,
                  ward_id: null
                });
                setShowEditModal(true);
              }}>
                + New Patient
              </button>
              <button 
                className="btn-refresh" 
                onClick={() => fetchPatients({ background: true })} 
                disabled={refreshing}
                title="Refresh data"
              >
                {refreshing ? "⟳" : "↻"}
              </button>
            </div>
          </div>

          <div className="patients-scroll-area">
            {loading && <div className="loading">Loading patients...</div>}

            {!loading && filteredPatients.length === 0 && (
              <div className="empty-state">
                <p>No patients found</p>
                {searchTerm && <p className="hint">Try adjusting your search</p>}
              </div>
            )}

            {!loading && filteredPatients.length > 0 && (
              <div className="patients-table">
                <div className="table-header">
                  <div className="table-col col-name">Patient Name</div>
                  <div className="table-col col-id">ID</div>
                  <div className="table-col col-dob">DOB</div>
                  <div className="table-col col-contact">Contact</div>
                  <div className="table-col col-status">Status</div>
                </div>
                <div className="table-body">
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      className={`table-row ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="table-col col-name">{patient.full_name}</div>
                      <div className="table-col col-id">#{patient.id}</div>
                      <div className="table-col col-dob">{patient.dob || '-'}</div>
                      <div className="table-col col-contact">{patient.contact || '-'}</div>
                      <div className="table-col col-status">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(patient.status) }}
                        >
                          {patient.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && filteredPatients.length > 0 && (
              <div className="pagination-info">
                <span>Showing {filteredPatients.length} of {patients.length} patients</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Patient Details (Only shown when selected) */}
        {selectedPatient && (
          <div className="patients-detail-section">
            <div className="detail-header-sticky">
              <div className="detail-header-content">
                <div className="detail-patient-name">{selectedPatient.full_name}</div>
                <div className="detail-patient-meta">
                  <span className="detail-meta-id">ID: #{selectedPatient.id}</span>
                  <span
                    className="detail-meta-status"
                    style={{ backgroundColor: getStatusColor(selectedPatient.status) }}
                  >
                    {selectedPatient.status}
                  </span>
                </div>
              </div>
              <button
                className="btn-close"
                onClick={() => setSelectedPatient(null)}
                title="Close details"
              >
                ✕
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-row">
                    <label>Full Name:</label>
                    <span>{selectedPatient.full_name || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Date of Birth:</label>
                    <span>{selectedPatient.dob || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Gender:</label>
                    <span>{selectedPatient.gender || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Contact:</label>
                    <span>{selectedPatient.contact || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Medical Information</h3>
                <div className="detail-grid">
                  <div className="detail-row">
                    <label>Current Status:</label>
                    <span
                      className="status-badge-inline"
                      style={{ backgroundColor: getStatusColor(selectedPatient.status) }}
                    >
                      {selectedPatient.status}
                    </span>
                  </div>
                  {selectedPatient.doctor && (
                    <div className="detail-row">
                      <label>Assigned Doctor:</label>
                      <span>{selectedPatient.doctor}</span>
                    </div>
                  )}
                  {selectedPatient.ward && (
                    <div className="detail-row">
                      <label>Assigned Ward:</label>
                      <span>{selectedPatient.ward}</span>
                    </div>
                  )}
                </div>
                
                {selectedPatient.medical_history && (
                  <div className="detail-row full-width medical-history-section">
                    <label>Medical History:</label>
                    <div className="medical-history-box">{selectedPatient.medical_history}</div>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <button
                  className="btn-edit"
                  onClick={() => setShowEditModal(true)}
                >
                  ✎ Edit Patient
                </button>
                <button
                  className="btn-delete"
                  onClick={() => {
                    if (window.confirm(`Delete ${selectedPatient.full_name}?`)) {
                      handleDeletePatient(selectedPatient.id);
                    }
                  }}
                >
                  🗑 Delete Patient
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {showEditModal && selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          currentUser={currentUser}
          onClose={() => {
            setShowEditModal(false);
          }}
          onSave={handlePatientSaved}
        />
      )}
    </div>
  );
}

export default PatientsModule;
