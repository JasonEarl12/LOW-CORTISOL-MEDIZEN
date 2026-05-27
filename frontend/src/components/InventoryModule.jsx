import React, { useEffect, useMemo, useState, useCallback } from "react";
import Toast from "./Toast";
import { API_BASE_URL } from "../api";
import "./InventoryModule.css";

const PAGE_SIZE = 100;

function InventoryModule() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "",
    expirationDate: "",
    alertThreshold: "10"
  });

  const fetchInventory = useCallback(async (targetPage = page, background = false) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await fetch(`${API_BASE_URL}/inventory?limit=${PAGE_SIZE}&page=${targetPage}`);
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      const rows = Array.isArray(data) ? data : [];
      setInventory(rows);
      setPage(targetPage);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to load inventory: " + err.message);
      if (!background) {
        setInventory([]);
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
    fetchInventory(page);
  }, [fetchInventory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.itemName.trim() || !formData.quantity) {
      setError("Item name and quantity are required");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE_URL}/inventory/${editingId}`
        : `${API_BASE_URL}/inventory`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: formData.itemName,
          quantity: parseInt(formData.quantity),
          expirationDate: formData.expirationDate || null,
          alertThreshold: parseInt(formData.alertThreshold) || 10
        })
      });

      if (!response.ok) throw new Error("Failed to save inventory");
      
      setSuccess(`Item ${editingId ? "updated" : "created"} successfully`);
      setShowForm(false);
      setEditingId(null);
      setFormData({ itemName: "", quantity: "", expirationDate: "", alertThreshold: "10" });
      fetchInventory();
    } catch (err) {
      setError("Save failed: " + err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      itemName: item.itemName,
      quantity: item.quantity.toString(),
      expirationDate: item.expirationDate || "",
      alertThreshold: item.alertThreshold.toString()
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete");
      setSuccess("Item deleted successfully");
      fetchInventory();
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  const criticalItems = useMemo(
    () => inventory.filter((item) => item.quantity <= item.alertThreshold),
    [inventory]
  );

  return (
    <div className="inventory-module">
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" duration={5000} onClose={() => setError("")} />

      <div className="module-toolbar">
        <button className="btn-add" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ itemName: "", quantity: "", expirationDate: "", alertThreshold: "10" }); }}>
          + Add Item
        </button>
        <button className="btn-refresh" onClick={() => fetchInventory(page, true)} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button className="btn-refresh" disabled={page === 0} onClick={() => fetchInventory(Math.max(page - 1, 0))}>Previous</button>
        <button className="btn-refresh" disabled={!hasMore} onClick={() => fetchInventory(page + 1)}>Next</button>
      </div>

      {criticalItems.length > 0 && (
        <div className="alerts">
          <strong>⚠️ {criticalItems.length} items below threshold</strong>
          <p>{criticalItems.map(item => item.itemName).join(", ")}</p>
        </div>
      )}

      {loading ? (
        <p className="placeholder">Loading inventory...</p>
      ) : inventory.length === 0 ? (
        <p className="placeholder">No items in inventory.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Alert Threshold</th>
                <th>Expiration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const isLow = item.quantity <= item.alertThreshold;
                const isExpired = item.expirationDate && new Date(item.expirationDate) < new Date();
                return (
                  <tr key={item.id} className={isLow ? "critical" : isExpired ? "expired" : ""}>
                    <td>{item.itemName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.alertThreshold}</td>
                    <td>{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : "-"}</td>
                    <td>
                      {isExpired && <span className="status-expired">Expired</span>}
                      {isLow && !isExpired && <span className="status-low">Low Stock</span>}
                      {!isLow && !isExpired && <span className="status-ok">OK</span>}
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingId ? "Edit Item" : "Add Item"}</h2>
            <div className="form-group">
              <label>Item Name *</label>
              <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Alert Threshold</label>
              <input type="number" name="alertThreshold" value={formData.alertThreshold} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Expiration Date</label>
              <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleInputChange} />
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

export default InventoryModule;
