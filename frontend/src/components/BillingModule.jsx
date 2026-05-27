import React, { useEffect, useMemo, useState, useCallback } from "react";
import Toast from "./Toast";
import { API_BASE_URL } from "../api";
import "./BillingModule.css";

const PAGE_SIZE = 100;

function BillingModule() {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "",
    amount: "",
    paymentStatus: "PENDING"
  });

  const fetchBillings = useCallback(async (targetPage = page, background = false) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await fetch(`${API_BASE_URL}/billing?limit=${PAGE_SIZE}&page=${targetPage}`);
      if (!response.ok) throw new Error("Failed to fetch billing");
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];
      setBillings(rows);
      setPage(targetPage);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load billing: " + err.message);
      if (!background) {
        setBillings([]);
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
    fetchBillings(page);
  }, [fetchBillings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.patientId || !formData.amount) {
      setError("Patient ID and amount are required");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/billing/${editingId}`
        : `${API_BASE_URL}/billing`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: parseInt(formData.patientId),
          amount: parseFloat(formData.amount),
          paymentStatus: formData.paymentStatus
        })
      });

      if (!response.ok) throw new Error("Failed to save billing");
      
      setSuccess(`Billing record ${editingId ? "updated" : "created"} successfully`);
      setShowForm(false);
      setEditingId(null);
      setFormData({ patientId: "", amount: "", paymentStatus: "PENDING" });
      fetchBillings();
    } catch (err) {
      setError("Save failed: " + err.message);
    }
  };

  const handleEdit = (billing) => {
    setFormData({
      patientId: billing.patientId.toString(),
      amount: billing.amount.toString(),
      paymentStatus: billing.paymentStatus
    });
    setEditingId(billing.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/billing/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete");
      setSuccess("Billing record deleted successfully");
      fetchBillings();
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "PENDING": "#eab308",
      "PAID": "#10b981",
      "OVERDUE": "#ef4444"
    };
    return colors[status] || "#9ca3af";
  };

  const totalAmount = useMemo(
    () => billings.reduce((sum, b) => sum + (b.amount || 0), 0),
    [billings]
  );
  const totalPaid = useMemo(
    () => billings.filter((b) => b.paymentStatus === "PAID").reduce((sum, b) => sum + (b.amount || 0), 0),
    [billings]
  );

  return (
    <div className="billing-module">
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" duration={5000} onClose={() => setError("")} />

      <div className="module-toolbar">
        <button className="btn-add" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ patientId: "", amount: "", paymentStatus: "PENDING" }); }}>
          + Create Invoice
        </button>
        <button className="btn-refresh" onClick={() => fetchBillings(page, true)} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button className="btn-refresh" disabled={page === 0} onClick={() => fetchBillings(Math.max(page - 1, 0))}>Previous</button>
        <button className="btn-refresh" disabled={!hasMore} onClick={() => fetchBillings(page + 1)}>Next</button>
      </div>

      <div className="billing-summary">
        <div className="summary-card">
          <h4>Total Amount</h4>
          <p className="amount">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h4>Total Paid</h4>
          <p className="amount paid">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h4>Outstanding</h4>
          <p className="amount pending">${(totalAmount - totalPaid).toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <p className="placeholder">Loading billing records...</p>
      ) : billings.length === 0 ? (
        <p className="placeholder">No billing records found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {billings.map(billing => (
                <tr key={billing.id}>
                  <td>{billing.patientId}</td>
                  <td>${billing.amount.toFixed(2)}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(billing.paymentStatus) }}>
                      {billing.paymentStatus}
                    </span>
                  </td>
                  <td>{new Date(billing.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(billing)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(billing.id)}>Delete</button>
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
            <h2>{editingId ? "Edit Billing" : "Create Invoice"}</h2>
            <div className="form-group">
              <label>Patient ID *</label>
              <input type="number" name="patientId" value={formData.patientId} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange}>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
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

export default BillingModule;
