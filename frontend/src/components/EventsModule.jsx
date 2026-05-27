import { useEffect, useState } from "react";
import { getModuleRows } from "../api";
import Toast from "./Toast";

export default function EventsModule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    max_slots: ""
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const data = await getModuleRows("events", 50);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load events: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.max_slots) {
      setToast({ type: "error", message: "All fields are required" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${A}/api.php?action=events_save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to save");

      setFormData({ title: "", description: "", date: "", time: "", location: "", max_slots: "" });
      setShowForm(false);
      setToast({ type: "success", message: "Event created successfully" });
      await loadEvents();
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this event?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${A}/api.php?action=events_delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to delete");

      setToast({ type: "success", message: "Event deleted" });
      await loadEvents();
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="module-header">
        <h2>Events Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? "Cancel" : "+ New Event"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {showForm && (
        <div className="form-card">
          <h3>Create New Event</h3>
          <form onSubmit={handleSave}>
            <input
              type="text"
              placeholder="Event Title"
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              rows="3"
            ></textarea>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
              required
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
              required
            />
            <input
              type="number"
              placeholder="Max Slots"
              value={formData.max_slots}
              onChange={(e) => setFormData(p => ({ ...p, max_slots: e.target.value }))}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Create Event"}
            </button>
          </form>
        </div>
      )}

      {loading && !showForm && <p className="loading">Loading events...</p>}

      <div className="table-container">
        {events.length === 0 ? (
          <p className="placeholder">No events found. Create one to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Slots</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td><strong>{event.title}</strong></td>
                  <td>{event.date} {event.time}</td>
                  <td>{event.location}</td>
                  <td><span className={`badge badge-${event.status}`}>{event.status}</span></td>
                  <td>{event.current_slots} / {event.max_slots}</td>
                  <td>
                    <button 
                      className="btn-sm btn-danger"
                      onClick={() => handleDelete(event.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
