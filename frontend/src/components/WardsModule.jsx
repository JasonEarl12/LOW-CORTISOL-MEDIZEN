import React, { useEffect, useState, useCallback, useMemo } from "react";
import Toast from "./Toast";
import { API_BASE_URL } from "../api";
import "./WardsModule.css";

const PAGE_SIZE = 100;

function WardsModule() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [formData, setFormData] = useState({
    wardName: "",
    capacity: "",
    availableBeds: ""
  });

  const wardMetrics = useMemo(() => {
    const totalWards = wards.length;
    const totalBeds = wards.reduce((sum, ward) => sum + (Number(ward.capacity) || 0), 0);
    const availableBeds = wards.reduce((sum, ward) => sum + (Number(ward.availableBeds) || 0), 0);
    const occupiedBeds = Math.max(totalBeds - availableBeds, 0);
    const highLoadWards = wards.filter((ward) => {
      const capacity = Number(ward.capacity) || 0;
      if (!capacity) return false;
      const occupied = Math.max(capacity - (Number(ward.availableBeds) || 0), 0);
      const occupancyRate = (occupied / capacity) * 100;
      return occupancyRate >= 80;
    }).length;

    return { totalWards, totalBeds, availableBeds, occupiedBeds, highLoadWards };
  }, [wards]);

  const filteredWards = useMemo(() => {
    return wards.filter((ward) => {
      const capacity = Number(ward.capacity) || 0;
      const availableBeds = Number(ward.availableBeds) || 0;
      const occupiedBeds = Math.max(capacity - availableBeds, 0);
      const occupancyRate = capacity > 0 ? (occupiedBeds / capacity) * 100 : 0;
      const nameMatch = ward.wardName.toLowerCase().includes(searchTerm.trim().toLowerCase());

      if (!nameMatch) return false;

      if (occupancyFilter === "critical") return occupancyRate >= 90;
      if (occupancyFilter === "busy") return occupancyRate >= 70 && occupancyRate < 90;
      if (occupancyFilter === "available") return occupancyRate < 70;

      return true;
    });
  }, [wards, searchTerm, occupancyFilter]);

  const resolveOccupancyTone = (rate) => {
    if (rate >= 90) return { label: "Critical", className: "tone-critical" };
    if (rate >= 70) return { label: "Busy", className: "tone-busy" };
    return { label: "Available", className: "tone-available" };
  };

  const fetchWards = useCallback(async (targetPage = page, background = false) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await fetch(`${API_BASE_URL}/wards?limit=${PAGE_SIZE}&page=${targetPage}`);
      if (!response.ok) throw new Error("Failed to fetch wards");
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];
      setWards(rows);
      setPage(targetPage);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load wards: " + err.message);
      if (!background) {
        setWards([]);
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
    fetchWards(page);
  }, [fetchWards]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.wardName.trim() || !formData.capacity) {
      setError("Ward name and capacity are required");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/wards/${editingId}`
        : `${API_BASE_URL}/wards`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wardName: formData.wardName,
          capacity: parseInt(formData.capacity),
          availableBeds: parseInt(formData.availableBeds) || parseInt(formData.capacity)
        })
      });

      if (!response.ok) throw new Error("Failed to save ward");
      
      setSuccess(`Ward ${editingId ? "updated" : "created"} successfully`);
      setShowForm(false);
      setEditingId(null);
      setFormData({ wardName: "", capacity: "", availableBeds: "" });
      fetchWards();
    } catch (err) {
      setError("Save failed: " + err.message);
    }
  };

  const handleEdit = (ward) => {
    setFormData({
      wardName: ward.wardName,
      capacity: ward.capacity.toString(),
      availableBeds: ward.availableBeds.toString()
    });
    setEditingId(ward.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/wards/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete");
      setSuccess("Ward deleted successfully");
      fetchWards();
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  return (
    <div className="wards-module">
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" duration={5000} onClose={() => setError("")} />

      <div className="module-toolbar">
        <button className="btn-add" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ wardName: "", capacity: "", availableBeds: "" }); }}>
          + Add Ward
        </button>
        <button className="btn-refresh" onClick={() => fetchWards(page, true)} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button className="btn-refresh" disabled={page === 0} onClick={() => fetchWards(Math.max(page - 1, 0))}>Previous</button>
        <button className="btn-refresh" disabled={!hasMore} onClick={() => fetchWards(page + 1)}>Next</button>
      </div>

      <section className="ward-summary-grid" aria-label="Ward summary">
        <article className="ward-summary-card">
          <p>Total Wards</p>
          <h3>{wardMetrics.totalWards}</h3>
        </article>
        <article className="ward-summary-card">
          <p>Total Beds</p>
          <h3>{wardMetrics.totalBeds}</h3>
        </article>
        <article className="ward-summary-card">
          <p>Available Beds</p>
          <h3>{wardMetrics.availableBeds}</h3>
        </article>
        <article className="ward-summary-card warning">
          <p>High Occupancy Wards</p>
          <h3>{wardMetrics.highLoadWards}</h3>
        </article>
      </section>

      <section className="ward-filters" aria-label="Ward filters">
        <input
          type="search"
          value={searchTerm}
          placeholder="Search ward name"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={occupancyFilter} onChange={(e) => setOccupancyFilter(e.target.value)}>
          <option value="all">All Occupancy Levels</option>
          <option value="critical">Critical (90%+)</option>
          <option value="busy">Busy (70%-89%)</option>
          <option value="available">Available (&lt;70%)</option>
        </select>
        <div className="ward-total-chip">
          Showing {filteredWards.length} of {wards.length}
        </div>
      </section>

      {loading ? (
        <p className="placeholder">Loading wards...</p>
      ) : filteredWards.length === 0 ? (
        <p className="placeholder">No wards found.</p>
      ) : (
        <div className="cards-grid">
          {filteredWards.map(ward => {
            const capacity = Number(ward.capacity) || 0;
            const availableBeds = Number(ward.availableBeds) || 0;
            const occupiedBeds = Math.max(capacity - availableBeds, 0);
            const occupancyRate = capacity > 0 ? Math.round((occupiedBeds / capacity) * 100) : 0;
            const occupancyTone = resolveOccupancyTone(occupancyRate);

            return (
            <div key={ward.id} className="ward-card">
              <h3>{ward.wardName}</h3>
              <div className={`occupancy-chip ${occupancyTone.className}`}>{occupancyTone.label}</div>
              <div className="ward-stats">
                <div className="stat">
                  <span className="label">Capacity:</span>
                  <span className="value">{capacity}</span>
                </div>
                <div className="stat">
                  <span className="label">Available Beds:</span>
                  <span className="value">{availableBeds}</span>
                </div>
                <div className="stat">
                  <span className="label">Occupancy:</span>
                  <span className="value">{occupiedBeds} / {capacity} ({occupancyRate}%)</span>
                </div>
              </div>
              <div className="occupancy-bar">
                <div className="occupancy-fill" style={{ width: `${occupancyRate}%` }}></div>
              </div>
              <div className="ward-actions">
                <button className="btn-edit" onClick={() => handleEdit(ward)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(ward.id)}>Delete</button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? "Edit Ward" : "Add Ward"}</h2>
            <div className="form-group">
              <label>Ward Name *</label>
              <input type="text" name="wardName" value={formData.wardName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Capacity *</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Available Beds</label>
              <input type="number" name="availableBeds" value={formData.availableBeds} onChange={handleInputChange} />
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

export default WardsModule;
