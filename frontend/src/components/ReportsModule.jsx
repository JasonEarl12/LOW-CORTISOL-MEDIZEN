import React, { useDeferredValue, useEffect, useMemo, useState, useCallback } from "react";
import Toast from "./Toast";
import { API_BASE_URL } from "../api";
import "./ReportsModule.css";

function ReportsModule() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const fetchLogs = useCallback(async ({ background = false } = {}) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const response = await fetch(`${API_BASE_URL}/audit-logs?limit=300`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      const data = await response.json();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load reports: " + err.message);
      if (!background) {
        setAuditLogs([]);
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
    fetchLogs();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLogs({ background: true });
      }
    }, 90000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const modules = useMemo(
    () => Array.from(new Set(auditLogs.map((log) => log.module).filter(Boolean))).sort(),
    [auditLogs]
  );
  const actions = useMemo(
    () => Array.from(new Set(auditLogs.map((log) => log.action).filter(Boolean))).sort(),
    [auditLogs]
  );

  const stats = useMemo(() => {
    const byModule = {};
    const byAction = {};

    for (const log of auditLogs) {
      const module = log.module || "UNKNOWN";
      const action = log.action || "UNKNOWN";
      byModule[module] = (byModule[module] || 0) + 1;
      byAction[action] = (byAction[action] || 0) + 1;
    }

    return {
      totalActions: auditLogs.length,
      byModule,
      byAction
    };
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchesModule = !filterModule || log.module === filterModule;
      const matchesSearch = !term || JSON.stringify(log).toLowerCase().includes(term);
      return matchesModule && matchesSearch;
    });
  }, [auditLogs, deferredSearchTerm, filterModule]);

  return (
    <div className="reports-module">
      <Toast message={error} type="error" duration={5000} onClose={() => {}} />

      <div className="reports-header">
        <h2>System Reports & Audit Logs</h2>
        <button className="btn-refresh" onClick={() => fetchLogs({ background: true })} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Actions</h4>
          <p className="stat-value">{stats.totalActions}</p>
        </div>
        <div className="stat-card">
          <h4>Modules</h4>
          <p className="stat-value">{modules.length}</p>
        </div>
        <div className="stat-card">
          <h4>Action Types</h4>
          <p className="stat-value">{actions.length}</p>
        </div>
      </div>

      <div className="filters">
        <input 
          type="text" 
          placeholder="Search logs..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="filter-select"
        >
          <option value="">All Modules</option>
          {modules.map(mod => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="placeholder">Loading reports...</p>
      ) : auditLogs.length === 0 ? (
        <p className="placeholder">No audit logs found.</p>
      ) : (
        <>
          <div className="results-info">
            Showing {filteredLogs.length} of {auditLogs.length} records
          </div>
          <div className="table-wrap">
            <div className="reports-table-scroll" role="region" aria-label="Audit log entries" tabIndex={0}>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Record ID</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.userId || "-"}</td>
                      <td><span className="action-badge">{log.action}</span></td>
                      <td><span className="module-badge">{log.module}</span></td>
                      <td>{log.recordId || "-"}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="charts">
            <div className="chart">
              <h3>Actions by Module</h3>
              <div className="chart-bars">
                {modules.map(mod => (
                  <div key={mod} className="chart-bar">
                    <div className="bar-label">{mod}</div>
                    <div className="bar-container">
                      <div className="bar" style={{ 
                        width: `${(stats.byModule[mod] / Math.max(...Object.values(stats.byModule)) * 100)}%` 
                      }}></div>
                    </div>
                    <div className="bar-value">{stats.byModule[mod]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart">
              <h3>Actions by Type</h3>
              <div className="chart-bars">
                {actions.slice(0, 5).map(act => (
                  <div key={act} className="chart-bar">
                    <div className="bar-label">{act}</div>
                    <div className="bar-container">
                      <div className="bar" style={{ 
                        width: `${(stats.byAction[act] / Math.max(...Object.values(stats.byAction)) * 100)}%` 
                      }}></div>
                    </div>
                    <div className="bar-value">{stats.byAction[act]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsModule;
