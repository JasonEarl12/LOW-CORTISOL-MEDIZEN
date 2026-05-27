import { useCallback, useEffect, useState } from "react";
import Toast from "./Toast";
import { getUsers, updateUserRole, USER_ROLES } from "../api";
import "./UsersModule.css";

function UsersModule() {
  const PAGE_SIZE = 100;
  const [users, setUsers] = useState([]);
  const [draftRoles, setDraftRoles] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadUsers = useCallback(async (targetPage = page, background = false) => {
    try {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const data = await getUsers(PAGE_SIZE, targetPage);
      const safeUsers = Array.isArray(data) ? data : [];
      setUsers(safeUsers);
      setPage(targetPage);
      setHasMore(safeUsers.length === PAGE_SIZE);
      setDraftRoles(
        safeUsers.reduce((acc, user) => {
          acc[user.id] = String(user.role || "").toUpperCase();
          return acc;
        }, {})
      );
    } catch (loadError) {
      setError(loadError.message || "Failed to load users");
    } finally {
      if (background) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [page]);

  useEffect(() => {
    loadUsers(page);
  }, [loadUsers]);

  async function handleSaveRole(userId) {
    const nextRole = draftRoles[userId];
    if (!USER_ROLES.includes(nextRole)) {
      setError("Please select a valid role before saving.");
      return;
    }

    try {
      setSavingUserId(userId);
      setError("");
      const updated = await updateUserRole(userId, nextRole);

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: updated.role } : user))
      );
      setSuccess(`Role updated to ${updated.role} for user #${userId}`);
    } catch (saveError) {
      setError(saveError.message || "Failed to update role");
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className="users-module">
      <Toast message={success} type="success" onClose={() => setSuccess("")} />
      <Toast message={error} type="error" duration={5000} onClose={() => setError("")} />

      <div className="users-toolbar">
        <button className="btn-refresh" onClick={() => loadUsers(page, true)} type="button" disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh Users"}
        </button>
        <button className="btn-refresh" onClick={() => loadUsers(Math.max(page - 1, 0))} type="button" disabled={page === 0}>
          Previous
        </button>
        <button className="btn-refresh" onClick={() => loadUsers(page + 1)} type="button" disabled={!hasMore}>
          Next
        </button>
      </div>

      {loading ? (
        <p className="placeholder">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="placeholder">No users found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userId = Number(user.id);
                const selectedRole = draftRoles[user.id] || String(user.role || "").toUpperCase();
                const isSaving = savingUserId === userId;
                const unchanged = selectedRole === String(user.role || "").toUpperCase();

                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.fullName}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{String(user.role || "")}</td>
                    <td>
                      <select
                        value={selectedRole}
                        onChange={(event) =>
                          setDraftRoles((prev) => ({
                            ...prev,
                            [user.id]: event.target.value
                          }))
                        }
                      >
                        {USER_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-save"
                        type="button"
                        disabled={isSaving || unchanged}
                        onClick={() => handleSaveRole(userId)}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UsersModule;
