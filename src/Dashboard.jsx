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

const DASHBOARD_TABS = {
  ALGOLEAD_LEADS: "algolead-leads",
  ALGOLEAD_FTD: "algolead-ftd",
  DRTRACKER_LEADS: "drtracker-leads",
  DRTRACKER_FTD: "drtracker-ftd",
  SETTINGS: "settings",
};

export default function Dashboard({ onLogout }) {
  const [activeDashboardTab, setActiveDashboardTab] = useState(
    DASHBOARD_TABS.ALGOLEAD_LEADS,
  );
  const [dateFrom, setDateFrom] = useState(todayStart);
  const [dateTo, setDateTo] = useState(nowLocal);
  const [leads, setLeads] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [ftdLoading, setFtdLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");
  const [ftdError, setFtdError] = useState("");
  const [modalData, setModalData] = useState(null);

  // Dr Tracker state
  const [dtLeads, setDtLeads] = useState([]);
  const [dtDeposits, setDtDeposits] = useState([]);
  const [dtLeadsLoading, setDtLeadsLoading] = useState(false);
  const [dtFtdLoading, setDtFtdLoading] = useState(false);
  const [dtLeadsError, setDtLeadsError] = useState("");
  const [dtFtdError, setDtFtdError] = useState("");
  const [dtDateFrom, setDtDateFrom] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dtDateTo, setDtDateTo] = useState(
    new Date().toISOString().slice(0, 10),
  );

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
  });
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
        setSettingsForm({
          currentPassword: "",
          newUsername: "",
          newPassword: "",
        });
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
      const res = await fetch("/api/algolead/leads", {
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
      const res = await fetch("/api/algolead/deposits", {
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

  // Dr Tracker fetch functions
  const fetchDtLeads = async () => {
    if (!dtDateFrom || !dtDateTo) {
      setDtLeadsError("Please select both start and end dates.");
      return;
    }
    setDtLeadsLoading(true);
    setDtLeadsError("");
    try {
      const res = await fetch("/api/drtracker/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DateFrom: `${dtDateFrom} 00:00:00`,
          DateTo: `${dtDateTo} 23:59:59`,
          Grouped: "0",
        }),
      });
      const data = await res.json();
      if (data.ret_code === "200") {
        setDtLeads(data.ret_message?.leads || []);
      } else {
        setDtLeadsError(data.ret_message || "Failed to fetch leads.");
        setDtLeads([]);
      }
    } catch {
      setDtLeadsError("Network error.");
      setDtLeads([]);
    }
    setDtLeadsLoading(false);
  };

  const fetchDtDeposits = async () => {
    if (!dtDateFrom || !dtDateTo) {
      setDtFtdError("Please select both start and end dates.");
      return;
    }
    setDtFtdLoading(true);
    setDtFtdError("");
    try {
      const res = await fetch("/api/drtracker/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DateFrom: `${dtDateFrom} 00:00:00`,
          DateTo: `${dtDateTo} 23:59:59`,
          Grouped: "0",
        }),
      });
      const data = await res.json();
      if (data.ret_code === "200") {
        setDtDeposits(data.ret_message?.deposits || []);
      } else {
        setDtFtdError(data.ret_message || "Failed to fetch deposits.");
        setDtDeposits([]);
      }
    } catch {
      setDtFtdError("Network error.");
      setDtDeposits([]);
    }
    setDtFtdLoading(false);
  };

  const refreshDtAll = () => {
    fetchDtLeads();
    fetchDtDeposits();
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
          className={`tab-btn ${activeDashboardTab === DASHBOARD_TABS.ALGOLEAD_LEADS ? "active" : ""}`}
          onClick={() => setActiveDashboardTab(DASHBOARD_TABS.ALGOLEAD_LEADS)}
        >
          AlgoLead Leads
        </button>
        <button
          className={`tab-btn ${activeDashboardTab === DASHBOARD_TABS.ALGOLEAD_FTD ? "active" : ""}`}
          onClick={() => setActiveDashboardTab(DASHBOARD_TABS.ALGOLEAD_FTD)}
        >
          AlgoLead FTD
        </button>
        <button
          className={`tab-btn ${activeDashboardTab === DASHBOARD_TABS.DRTRACKER_LEADS ? "active" : ""}`}
          onClick={() =>
            setActiveDashboardTab(DASHBOARD_TABS.DRTRACKER_LEADS)
          }
        >
          DrTracker Leads
        </button>
        <button
          className={`tab-btn ${activeDashboardTab === DASHBOARD_TABS.DRTRACKER_FTD ? "active" : ""}`}
          onClick={() => setActiveDashboardTab(DASHBOARD_TABS.DRTRACKER_FTD)}
        >
          DrTracker FTD
        </button>
        <button
          className={`tab-btn ${activeDashboardTab === DASHBOARD_TABS.SETTINGS ? "active" : ""}`}
          onClick={() => setActiveDashboardTab(DASHBOARD_TABS.SETTINGS)}
        >
          Settings
        </button>
      </div>

      {/* AlgoLead Controls */}
      {(activeDashboardTab === DASHBOARD_TABS.ALGOLEAD_LEADS ||
        activeDashboardTab === DASHBOARD_TABS.ALGOLEAD_FTD) && (
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

      {/* Dr Tracker Controls */}
      {(activeDashboardTab === DASHBOARD_TABS.DRTRACKER_LEADS ||
        activeDashboardTab === DASHBOARD_TABS.DRTRACKER_FTD) && (
        <div className="controls">
          <label>From:</label>
          <input
            type="date"
            className="date-input"
            value={dtDateFrom}
            onChange={(e) => setDtDateFrom(e.target.value)}
          />
          <label>To:</label>
          <input
            type="date"
            className="date-input"
            value={dtDateTo}
            onChange={(e) => setDtDateTo(e.target.value)}
          />
          <button
            className="refresh-btn"
            onClick={refreshDtAll}
            disabled={dtLeadsLoading || dtFtdLoading}
          >
            {dtLeadsLoading || dtFtdLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      )}

      {/* Leads Tab */}
      {activeDashboardTab === DASHBOARD_TABS.ALGOLEAD_LEADS && (
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
                        <span
                          className={`status-badge ${lead.SaleStatus ? "status-ftd" : "status-new"}`}
                        >
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
      {activeDashboardTab === DASHBOARD_TABS.ALGOLEAD_FTD && (
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

      {/* DT Leads Tab */}
      {activeDashboardTab === DASHBOARD_TABS.DRTRACKER_LEADS && (
        <div>
          <div className="stats">
            <div className="stat-card">
              <div className="number">{dtLeads.length}</div>
              <div className="label">DT Leads</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {dtLeadsLoading ? (
                  <tr>
                    <td colSpan="4" className="loading-cell">
                      <div className="loading-spinner" />
                      Loading Dr Tracker leads...
                    </td>
                  </tr>
                ) : dtLeadsError ? (
                  <tr>
                    <td colSpan="4" className="error-cell">
                      {dtLeadsError}
                    </td>
                  </tr>
                ) : dtLeads.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      No leads found. Select a date range and click Refresh.
                    </td>
                  </tr>
                ) : (
                  dtLeads.map((lead, i) => (
                    <tr key={lead.leadid || i}>
                      <td>{lead.leadid || "-"}</td>
                      <td>{lead.email || "-"}</td>
                      <td>
                        <span
                          className={`status-badge status-${(lead.status || "unknown").toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {lead.status || "Unknown"}
                        </span>
                      </td>
                      <td>{lead.registration_date || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DT FTD Tab */}
      {activeDashboardTab === DASHBOARD_TABS.DRTRACKER_FTD && (
        <div>
          <div className="stats">
            <div className="stat-card">
              <div className="number">{dtDeposits.length}</div>
              <div className="label">DT Depositors</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Email</th>
                  <th>Date Deposited</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dtFtdLoading ? (
                  <tr>
                    <td colSpan="4" className="loading-cell">
                      <div className="loading-spinner" />
                      Loading Dr Tracker depositors...
                    </td>
                  </tr>
                ) : dtFtdError ? (
                  <tr>
                    <td colSpan="4" className="error-cell">
                      {dtFtdError}
                    </td>
                  </tr>
                ) : dtDeposits.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      No depositors found. Select a date range and click
                      Refresh.
                    </td>
                  </tr>
                ) : (
                  dtDeposits.map((dep, i) => (
                    <tr key={dep.leadid || i}>
                      <td>{dep.leadid || "-"}</td>
                      <td>{dep.email || "-"}</td>
                      <td>{dep.date_deposited || "-"}</td>
                      <td>{dep.amount || "0"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeDashboardTab === DASHBOARD_TABS.SETTINGS && (
        <div className="form-container" style={{ margin: "0 auto" }}>
          <h2 style={{ color: "#00d4ff", marginBottom: 20 }}>
            Change Credentials
          </h2>
          <form onSubmit={handleChangeCredentials} className="algo-form">
            <input
              type="password"
              placeholder="Current Password"
              value={settingsForm.currentPassword}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  currentPassword: e.target.value,
                })
              }
              required
            />
            <input
              placeholder="New Username"
              value={settingsForm.newUsername}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  newUsername: e.target.value,
                })
              }
              required
            />
            <input
              type="password"
              placeholder="New Password (min 4 chars)"
              value={settingsForm.newPassword}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  newPassword: e.target.value,
                })
              }
              required
              minLength={4}
            />
            <button
              type="submit"
              className="submit-btn"
              disabled={settingsLoading}
            >
              {settingsLoading ? "Updating..." : "Update Credentials"}
            </button>
            {settingsMsg && (
              <div
                style={{ color: "#22c55e", textAlign: "center", marginTop: 8 }}
              >
                {settingsMsg}
              </div>
            )}
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
