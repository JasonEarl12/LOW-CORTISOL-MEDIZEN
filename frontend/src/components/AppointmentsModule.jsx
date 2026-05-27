import React, { useDeferredValue, useEffect, useMemo, useState, useCallback } from "react";
import Toast from "./Toast";
import { API_BASE_URL } from "../api";
import "./AppointmentsModule.css";

const PAGE_SIZE = 100;

const INITIAL_FORM = {
  patientId: "",
  doctorId: "",
  date: "",
  time: "",
  status: "SCHEDULED"
};

function normalizeAppointment(raw) {
  const patientId = raw?.patientId ?? raw?.patient?.id ?? "";
  const doctorId = raw?.doctorId ?? raw?.doctor?.id ?? "";
  const time = typeof raw?.time === "string" ? raw.time.slice(0, 5) : "";

  return {
    id: raw?.id,
    patientId: patientId === null ? "" : String(patientId),
    doctorId: doctorId === null ? "" : String(doctorId),
    patientName: raw?.patient?.fullName || raw?.patientName || "-",
    doctorName: raw?.doctor?.fullName || raw?.doctorName || "-",
    date: raw?.date || "",
    time,
    status: String(raw?.status || "SCHEDULED").toUpperCase()
  };
}

function AppointmentsModule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const fetchAppointments = useCallback(async (targetPage = page, background = false) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await fetch(`${API_BASE_URL}/appointments?limit=${PAGE_SIZE}&page=${targetPage}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      const rows = Array.isArray(data) ? data.map(normalizeAppointment) : [];
      setAppointments(rows);
      setPage(targetPage);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load appointments: " + err.message);
      if (!background) {
        setAppointments([]);
      }
    } finally {
      if (background) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [page]);

  useEffect(() => {
    fetchAppointments(page);
  }, [fetchAppointments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
      setError("All fields are required");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/appointments/${editingId}`
        : `${API_BASE_URL}/appointments`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          patient: { id: Number(formData.patientId) },
          doctor: { id: Number(formData.doctorId) },
          date: formData.date,
          time: formData.time,
          status: String(formData.status || "SCHEDULED").toUpperCase()
        })
      });

      if (!response.ok) throw new Error("Failed to save appointment");

      setSuccess(`Appointment ${editingId ? "updated" : "created"} successfully`);
      setShowForm(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      fetchAppointments();
    } catch (err) {
      setError("Save failed: " + err.message);
    }
  };

  const handleEdit = (appt) => {
    setFormData({
      patientId: String(appt.patientId || ""),
      doctorId: String(appt.doctorId || ""),
      date: appt.date || "",
      time: appt.time || "",
      status: String(appt.status || "SCHEDULED").toUpperCase()
    });
    setEditingId(appt.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete");
      setSuccess("Appointment deleted successfully");
      fetchAppointments();
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "SCHEDULED": "#007B83",
      "COMPLETED": "#10b981",
      "CANCELLED": "#ef4444"
    };
    return colors[status] || "#9ca3af";
  };

  const filteredAppointments = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) return appointments;
    return appointments.filter((appt) => (
      String(appt.patientId).toLowerCase().includes(term) ||
      String(appt.doctorId).toLowerCase().includes(term) ||
      String(appt.patientName).toLowerCase().includes(term) ||
      String(appt.doctorName).toLowerCase().includes(term) ||
      String(appt.date).toLowerCase().includes(term) ||
      String(appt.status).toLowerCase().includes(term)
    ));
  }, [appointments, deferredSearchTerm]);

  return (
    <div className="appointments-module">
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" duration={5000} onClose={() => setError("")} />

      <div className="module-toolbar">
        <div className="search-bar">
          <input
            className="search-input"
            type="text"
            placeholder="Search by patient, doctor, date, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-add" onClick={() => { setShowForm(true); setEditingId(null); setFormData(INITIAL_FORM); }}>
          + Schedule Appointment
        </button>
        <button className="btn-refresh" onClick={() => fetchAppointments(page, true)} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!loading && appointments.length > 0 && (
        <div className="appointments-count">
          Showing {filteredAppointments.length} of {appointments.length} appointments
          <button
            className="btn-refresh"
            style={{ marginLeft: "12px" }}
            disabled={page === 0}
            onClick={() => fetchAppointments(Math.max(page - 1, 0))}
          >
            Previous
          </button>
          <button
            className="btn-refresh"
            style={{ marginLeft: "8px" }}
            disabled={!hasMore}
            onClick={() => fetchAppointments(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {loading ? (
        <p className="placeholder">Loading appointments...</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="placeholder">No appointments found.</p>
      ) : (
        <div className="table-wrap appointments-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient Name</th>
                <th>Doctor ID</th>
                <th>Doctor Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appt => (
                <tr key={appt.id}>
                  <td>{appt.patientId}</td>
                  <td>{appt.patientName}</td>
                  <td>{appt.doctorId}</td>
                  <td>{appt.doctorName}</td>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(appt.status) }}>
                      {appt.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(appt)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(appt.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? "Edit Appointment" : "Schedule Appointment"}</h2>
            <div className="form-group">
              <label>Patient ID *</label>
              <input type="number" name="patientId" value={formData.patientId} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Doctor ID *</label>
              <input type="number" name="doctorId" value={formData.doctorId} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsModule;
