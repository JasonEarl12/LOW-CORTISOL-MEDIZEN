import React, { useEffect, useState, useCallback } from "react";
import Toast from "./Toast";
import { API_BASE_URL } from "../api";
import "./DoctorsModule.css";

const PAGE_SIZE = 100;

function DoctorsModule() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    specialty: "",
    contact: "",
    schedule: ""
  });

  const fetchDoctors = useCallback(async (targetPage = page, background = false) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await fetch(`${API_BASE_URL}/doctors?limit=${PAGE_SIZE}&page=${targetPage}`);
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];
      setDoctors(rows);
      setPage(targetPage);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load doctors: " + err.message);
      if (!background) {
        setDoctors([]);
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
    fetchDoctors(page);
  }, [fetchDoctors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim() || !formData.specialty.trim()) {
      setError("Full name and specialty are required");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/doctors/${editingId}`
        : `${API_BASE_URL}/doctors`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to save doctor");
      
      setSuccess(`Doctor ${editingId ? "updated" : "created"} successfully`);
      setShowForm(false);
      setEditingId(null);
      setFormData({ fullName: "", specialty: "", contact: "", schedule: "" });
      fetchDoctors();
    } catch (err) {
      setError("Save failed: " + err.message);
    }
  };

  const handleEdit = (doctor) => {
    setFormData(doctor);
    setEditingId(doctor.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete");
      setSuccess("Doctor deleted successfully");
      fetchDoctors();
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  return (
    <div className="doctors-module">
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" duration={5000} onClose={() => setError("")} />

      <div className="module-toolbar">
        <button className="btn-add" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ fullName: "", specialty: "", contact: "", schedule: "" }); }}>
          + Add Doctor
        </button>
        <button className="btn-refresh" onClick={() => fetchDoctors(page, true)} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button className="btn-refresh" disabled={page === 0} onClick={() => fetchDoctors(Math.max(page - 1, 0))}>Previous</button>
        <button className="btn-refresh" disabled={!hasMore} onClick={() => fetchDoctors(page + 1)}>Next</button>
      </div>

      {loading ? (
        <p className="placeholder">Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p className="placeholder">No doctors found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Contact</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doctor => (
                <tr key={doctor.id}>
                  <td>{doctor.fullName}</td>
                  <td>{doctor.specialty}</td>
                  <td>{doctor.contact || "-"}</td>
                  <td>{doctor.schedule || "-"}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(doctor)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(doctor.id)}>Delete</button>
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
            <h2>{editingId ? "Edit Doctor" : "Add Doctor"}</h2>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Specialty *</label>
              <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input type="text" name="contact" value={formData.contact} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Schedule</label>
              <input type="text" name="schedule" value={formData.schedule} onChange={handleInputChange} />
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

export default DoctorsModule;
