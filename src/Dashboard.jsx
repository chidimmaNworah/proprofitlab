import { useState, useEffect } from "react";

function formatDateForAPI(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function todayStart() {
  return new Date().toISOString().slice(0, 10) + "T00:00";
}

function nowLocal() {
  return new Date().toISOString().slice(0, 16);
}

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("leads");
  const [dateFrom, setDateFrom] = useState(todayStart);
  const [dateTo, setDateTo] = useState(nowLocal);
  const [leads, setLeads] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [ftdLoading, setFtdLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");
  const [ftdError, setFtdError] = useState("");
  const [modalData, setModalData] = useState(null);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({ currentPassword: "", newUsername: "", newPassword: "" });
  const [settingsMsg, setSettingsMsg] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg("");
    setSettingsError("");
    try {
      const res = await fetch("/api/auth/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMsg("Credentials updated successfully.");
        setSettingsForm({ currentPassword: "", newUsername: "", newPassword: "" });
      } else {
        setSettingsError(data.error || "Failed to update.");
      }
    } catch {
      setSettingsError("Server error.");
    }
    setSettingsLoading(false);
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    setLeadsError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          CreateTimeFrom: formatDateForAPI(dateFrom),
          CreateTimeTo: formatDateForAPI(dateTo),
        }),
      });
      const data = await res.json();
      if (data.status === "Success") {
        setLeads(Array.isArray(data.data) ? data.data : []);
      } else {
        setLeadsError(data.errors || "Failed to fetch leads.");
        setLeads([]);
      }
    } catch {
      setLeadsError("Network error.");
      setLeads([]);
    }
    setLeadsLoading(false);
  };

  const fetchFTDs = async () => {
    setFtdLoading(true);
    setFtdError("");
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          CreateTimeFrom: formatDateForAPI(dateFrom),
          CreateTimeTo: formatDateForAPI(dateTo),
        }),
      });
      const data = await res.json();
      if (data.status === "Success") {
        setDeposits(Array.isArray(data.data) ? data.data : []);
      } else {
        setFtdError(data.errors || "Failed to fetch deposits.");
        setDeposits([]);
      }
    } catch {
      setFtdError("Network error.");
      setDeposits([]);
    }
    setFtdLoading(false);
  };

  const refreshAll = () => {
    fetchLeads();
    fetchFTDs();
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalFtdAmount = deposits.reduce(
    (sum, d) => sum + (parseFloat(d.Amount) || 0),
    0,
  );

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1 className="dash-title">Leads Dashboard</h1>
        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "leads" ? "active" : ""}`}
          onClick={() => setActiveTab("leads")}
        >
          Leads
        </button>
        <button
          className={`tab-btn ${activeTab === "ftd" ? "active" : ""}`}
          onClick={() => setActiveTab("ftd")}
        >
          FTD
        </button>
        <button
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* Controls */}
      {activeTab !== "settings" && (
      <div className="controls">
        <label>From:</label>
        <input
          type="datetime-local"
          className="date-input"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <label>To:</label>
        <input
          type="datetime-local"
          className="date-input"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <button
          className="refresh-btn"
          onClick={refreshAll}
          disabled={leadsLoading || ftdLoading}
        >
          {leadsLoading || ftdLoading ? "Loading..." : "Refresh"}
        </button>
      </div>
      )}

      {/* Leads Tab */}
      {activeTab === "leads" && (
        <div>
          <div className="stats">
            <div className="stat-card">
              <div className="number">{leads.length}</div>
              <div className="label">Total Leads</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Country</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leadsLoading ? (
                  <tr>
                    <td colSpan="8" className="loading-cell">
                      <div className="loading-spinner" />
                      Loading leads...
                    </td>
                  </tr>
                ) : leadsError ? (
                  <tr>
                    <td colSpan="8" className="error-cell">
                      {leadsError}
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, i) => (
                    <tr key={lead.AccountID || i}>
                      <td>{lead.AccountID || lead.UserID || "-"}</td>
                      <td>
                        {lead.FirstName || ""} {lead.LastName || ""}
                      </td>
                      <td>{lead.Email || "-"}</td>
                      <td>{lead.Phone || "-"}</td>
                      <td>{lead.Country || "-"}</td>
                      <td>{lead.CreateTime || "-"}</td>
                      <td>
                        <span className={`status-badge ${lead.SaleStatus ? "status-ftd" : "status-new"}`}>
                          {lead.SaleStatus || "New"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="detail-btn"
                          onClick={() => setModalData(lead)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FTD Tab */}
      {activeTab === "ftd" && (
        <div>
          <div className="stats">
            <div className="stat-card">
              <div className="number">{deposits.length}</div>
              <div className="label">Total FTDs</div>
            </div>
            <div className="stat-card">
              <div className="number">${totalFtdAmount.toLocaleString()}</div>
              <div className="label">Total Amount</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Country</th>
                  <th>Deposit Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ftdLoading ? (
                  <tr>
                    <td colSpan="8" className="loading-cell">
                      <div className="loading-spinner" />
                      Loading FTDs...
                    </td>
                  </tr>
                ) : ftdError ? (
                  <tr>
                    <td colSpan="8" className="error-cell">
                      {ftdError}
                    </td>
                  </tr>
                ) : deposits.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No FTDs found
                    </td>
                  </tr>
                ) : (
                  deposits.map((ftd, i) => (
                    <tr key={ftd.AccountID || i}>
                      <td>{ftd.AccountID || ftd.UserID || "-"}</td>
                      <td>
                        {ftd.FirstName || ""} {ftd.LastName || ""}
                      </td>
                      <td>{ftd.Email || "-"}</td>
                      <td>${ftd.Amount || "0"}</td>
                      <td>{ftd.Country || "-"}</td>
                      <td>
                        {ftd.DepositTime ||
                          ftd.ConfirmTime ||
                          ftd.CreateTime ||
                          "-"}
                      </td>
                      <td>
                        <span className="status-badge status-ftd">FTD</span>
                      </td>
                      <td>
                        <button
                          className="detail-btn"
                          onClick={() => setModalData(ftd)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="form-container" style={{ margin: "0 auto" }}>
          <h2 style={{ color: "#00d4ff", marginBottom: 20 }}>Change Credentials</h2>
          <form onSubmit={handleChangeCredentials} className="algo-form">
            <input
              type="password"
              placeholder="Current Password"
              value={settingsForm.currentPassword}
              onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
              required
            />
            <input
              placeholder="New Username"
              value={settingsForm.newUsername}
              onChange={(e) => setSettingsForm({ ...settingsForm, newUsername: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="New Password (min 4 chars)"
              value={settingsForm.newPassword}
              onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
              required
              minLength={4}
            />
            <button type="submit" className="submit-btn" disabled={settingsLoading}>
              {settingsLoading ? "Updating..." : "Update Credentials"}
            </button>
            {settingsMsg && <div style={{ color: "#22c55e", textAlign: "center", marginTop: 8 }}>{settingsMsg}</div>}
            {settingsError && <div className="error">{settingsError}</div>}
          </form>
        </div>
      )}

      {/* Detail Modal */}
      {modalData && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalData(null);
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Lead Details</h2>
              <button className="close-btn" onClick={() => setModalData(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {Object.entries(modalData).map(([key, value]) => (
                <div className="detail-row" key={key}>
                  <span className="detail-label">{key}</span>
                  <span className="detail-value">{value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
