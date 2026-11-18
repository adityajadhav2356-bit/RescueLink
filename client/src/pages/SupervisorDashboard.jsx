import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Battery,
  Bell,
  CheckCircle2,
  Clock3,
  HeartPulse,
  LocateFixed,
  MapPin,
  Radio,
  Shield,
  Siren,
  Thermometer,
  Truck,
  Users,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useNavigate } from "react-router-dom";

import socket, {
  connectSocket,
  disconnectSocket,
} from "../services/socket";

/* =========================================================
   MAP ICON
========================================================= */

const workerIcon = (status = "SAFE") => {
  let background = "#2e9d61";

  if (status === "WARNING") {
    background = "#d18a13";
  }

  if (
    status === "CRITICAL" ||
    status === "SOS_TRIGGERED"
  ) {
    background = "#d64545";
  }

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:34px;
        height:34px;
        border-radius:50%;
        background:${background};
        border:4px solid white;
        box-shadow:0 3px 14px rgba(0,0,0,.25);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:800;
        font-size:12px;
      ">
        W
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

/* =========================================================
   MAP CENTER COMPONENT
========================================================= */

const MapCenter = ({ worker }) => {
  const map = useMap();

  useEffect(() => {
    if (
      worker &&
      Number.isFinite(Number(worker.lat)) &&
      Number.isFinite(Number(worker.lng))
    ) {
      map.flyTo(
        [Number(worker.lat), Number(worker.lng)],
        15,
        {
          duration: 1,
        }
      );
    }
  }, [worker, map]);

  return null;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const [socketStatus, setSocketStatus] =
    useState("OFFLINE");

  const [activePanel, setActivePanel] =
    useState("overview");

  const [lastUpdate, setLastUpdate] =
    useState(null);

  /* =======================================================
     SOCKET
  ======================================================= */

  useEffect(() => {
    connectSocket();

    const onConnect = () => {
      console.log("🟢 Supervisor socket connected");

      setSocketStatus("ONLINE");

      socket.emit("request_initial_data");
    };

    const onDisconnect = () => {
      console.log("🔴 Supervisor socket disconnected");

      setSocketStatus("OFFLINE");
    };

    const onInitialData = (data) => {
      console.log("📦 Initial data:", data);

      if (Array.isArray(data?.workers)) {
        setWorkers(data.workers);
      }

      if (Array.isArray(data?.alerts)) {
        setAlerts(data.alerts);
      }

      setLastUpdate(new Date());
    };

    const onEmergency = (data) => {
      console.log(
        "🚨 EMERGENCY RECEIVED:",
        data
      );

      const newAlert = {
        id:
          data.alertId ||
          data.id ||
          `SOS-${Date.now()}`,

        workerId:
          data.workerId ||
          "UNKNOWN",

        message:
          data.message ||
          "Emergency SOS triggered",

        severity:
          data.severity ||
          "CRITICAL",

        status: "ACTIVE",

        timestamp:
          data.timestamp ||
          new Date().toISOString(),

        lat: data.lat,
        lng: data.lng,
      };

      setAlerts((prev) => [
        newAlert,
        ...prev.filter(
          (a) => a.id !== newAlert.id
        ),
      ]);

      setWorkers((prev) =>
        prev.map((worker) =>
          worker.workerId ===
          newAlert.workerId
            ? {
                ...worker,
                status: "CRITICAL",
              }
            : worker
        )
      );

      setSelectedWorker(
        (prev) =>
          prev?.workerId ===
          newAlert.workerId
            ? {
                ...prev,
                status: "CRITICAL",
              }
            : prev
      );

      setActivePanel("alerts");

      setLastUpdate(new Date());
    };

    const onWorkerUpdate = (data) => {
      console.log(
        "👤 Worker update:",
        data
      );

      setWorkers((prev) => {
        const exists = prev.some(
          (worker) =>
            worker.workerId ===
            data.workerId
        );

        if (!exists) {
          return [...prev, data];
        }

        return prev.map((worker) =>
          worker.workerId ===
          data.workerId
            ? {
                ...worker,
                ...data,
              }
            : worker
        );
      });

      setLastUpdate(new Date());
    };

    const onLocationUpdate = (data) => {
      console.log(
        "📍 Location update:",
        data
      );

      setWorkers((prev) =>
        prev.map((worker) =>
          worker.workerId ===
          data.workerId
            ? {
                ...worker,
                lat: data.lat,
                lng: data.lng,
                location:
                  data.location ||
                  worker.location,
              }
            : worker
        )
      );

      setLastUpdate(new Date());
    };

    socket.on(
      "connect",
      onConnect
    );

    socket.on(
      "disconnect",
      onDisconnect
    );

    socket.on(
      "initial_data",
      onInitialData
    );

    socket.on(
      "emergency_alert_received",
      onEmergency
    );

    socket.on(
      "worker_updated",
      onWorkerUpdate
    );

    socket.on(
      "worker_location_updated",
      onLocationUpdate
    );

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off(
        "connect",
        onConnect
      );

      socket.off(
        "disconnect",
        onDisconnect
      );

      socket.off(
        "initial_data",
        onInitialData
      );

      socket.off(
        "emergency_alert_received",
        onEmergency
      );

      socket.off(
        "worker_updated",
        onWorkerUpdate
      );

      socket.off(
        "worker_location_updated",
        onLocationUpdate
      );

      disconnectSocket();
    };
  }, []);

  /* =======================================================
     CALCULATED DATA
  ======================================================= */

  const criticalWorkers =
    workers.filter(
      (worker) =>
        worker.status ===
          "CRITICAL" ||
        worker.status ===
          "SOS_TRIGGERED"
    );

  const warningWorkers =
    workers.filter(
      (worker) =>
        worker.status ===
        "WARNING"
    );

  const safeWorkers =
    workers.filter(
      (worker) =>
        !criticalWorkers.includes(
          worker
        ) &&
        !warningWorkers.includes(
          worker
        )
    );

  const activeAlerts =
    alerts.filter(
      (alert) =>
        alert.status !==
        "RESOLVED"
    );

  const gpsWorkers =
    workers.filter(
      (worker) =>
        Number.isFinite(
          Number(worker.lat)
        ) &&
        Number.isFinite(
          Number(worker.lng)
        )
    );

  const mapCenter = useMemo(() => {
    if (
      selectedWorker &&
      Number.isFinite(
        Number(
          selectedWorker.lat
        )
      )
    ) {
      return [
        Number(
          selectedWorker.lat
        ),
        Number(
          selectedWorker.lng
        ),
      ];
    }

    if (gpsWorkers.length) {
      return [
        Number(
          gpsWorkers[0].lat
        ),
        Number(
          gpsWorkers[0].lng
        ),
      ];
    }

    return [
      18.5204,
      73.8567,
    ];
  }, [
    selectedWorker,
    gpsWorkers,
  ]);

  /* =======================================================
     ACKNOWLEDGE
  ======================================================= */

  const acknowledgeAlert = (
    alert
  ) => {
    socket.emit(
      "resolve_alert",
      {
        alertId:
          alert.id,
      }
    );

    setAlerts((prev) =>
      prev.map((item) =>
        item.id ===
        alert.id
          ? {
              ...item,
              status:
                "RESOLVED",
            }
          : item
      )
    );
  };

  /* =======================================================
     DISPATCH
  ======================================================= */

  const dispatchRescue = (
    alert
  ) => {
    socket.emit(
      "dispatch_rescue_team",
      {
        alertId:
          alert.id,

        workerId:
          alert.workerId,

        timestamp:
          new Date().toISOString(),
      }
    );

    setAlerts((prev) =>
      prev.map((item) =>
        item.id ===
        alert.id
          ? {
              ...item,
              status:
                "RESCUE_DISPATCHED",
            }
          : item
      )
    );
  };

  /* =======================================================
     STATUS CLASS
  ======================================================= */

  const statusClass = (
    status
  ) => {
    if (
      status ===
        "CRITICAL" ||
      status ===
        "SOS_TRIGGERED"
    ) {
      return "status-critical";
    }

    if (
      status ===
      "WARNING"
    ) {
      return "status-warning";
    }

    return "status-safe";
  };

  return (
    <div className="command-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="command-header">

        <div className="command-brand">

          <div className="command-logo">
            <Shield
              size={23}
            />
          </div>

          <div>
            <div className="command-title">
              RESCUELINK COMMAND CENTER
            </div>

            <div className="command-subtitle">
              INDUSTRIAL SAFETY OPERATIONS
            </div>
          </div>

        </div>

        <div className="header-right">

          <div
            className={
              socketStatus ===
              "ONLINE"
                ? "socket-status online"
                : "socket-status"
            }
          >
            <span />

            SOCKET{" "}
            {socketStatus}
          </div>

          <button
            className="exit-button"
            onClick={() =>
              navigate("/")
            }
          >
            EXIT
          </button>

        </div>

      </header>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="command-nav">

        <button
          className={
            activePanel ===
            "overview"
              ? "nav-active"
              : ""
          }
          onClick={() =>
            setActivePanel(
              "overview"
            )
          }
        >
          OVERVIEW
        </button>

        <button
          className={
            activePanel ===
            "workers"
              ? "nav-active"
              : ""
          }
          onClick={() =>
            setActivePanel(
              "workers"
            )
          }
        >
          WORKERS
        </button>

        <button
          className={
            activePanel ===
            "alerts"
              ? "nav-active"
              : ""
          }
          onClick={() =>
            setActivePanel(
              "alerts"
            )
          }
        >
          ALERTS
          {activeAlerts.length >
            0 && (
            <span className="nav-badge">
              {
                activeAlerts.length
              }
            </span>
          )}
        </button>

        <button
          className={
            activePanel ===
            "map"
              ? "nav-active"
              : ""
          }
          onClick={() =>
            setActivePanel(
              "map"
            )
          }
        >
          LIVE MAP
        </button>

        <div className="nav-spacer" />

        <div className="last-update">
          <Radio
            size={12}
          />

          LAST UPDATE:

          {lastUpdate
            ? lastUpdate.toLocaleTimeString()
            : "--"}
        </div>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="command-main">

        {/* PAGE TITLE */}

        <section className="page-heading">

          <div>

            <div className="section-kicker">
              LIVE SAFETY OPERATIONS
            </div>

            <h1>
              Command Center
            </h1>

            <p>
              Monitor workers, incidents,
              telemetry and emergency
              response in real time.
            </p>

          </div>

          <div className="live-monitoring">

            <span />

            LIVE MONITORING

          </div>

        </section>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="kpi-grid">

          <KpiCard
            label="TOTAL WORKERS"
            value={
              workers.length
            }
            icon={
              <Users size={19} />
            }
            color="blue"
          />

          <KpiCard
            label="SAFE"
            value={
              safeWorkers.length
            }
            icon={
              <CheckCircle2
                size={19}
              />
            }
            color="green"
          />

          <KpiCard
            label="WARNING"
            value={
              warningWorkers.length
            }
            icon={
              <AlertTriangle
                size={19}
              />
            }
            color="orange"
          />

          <KpiCard
            label="CRITICAL"
            value={
              criticalWorkers.length
            }
            icon={
              <Siren
                size={19}
              />
            }
            color="red"
          />

          <KpiCard
            label="ACTIVE ALERTS"
            value={
              activeAlerts.length
            }
            icon={
              <Bell size={19} />
            }
            color="purple"
          />

        </section>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activePanel ===
          "overview" && (
          <>
            <section className="main-grid">

              {/* WORKERS */}

              <div className="panel">

                <PanelHeader
                  icon={
                    <Users
                      size={16}
                    />
                  }
                  title="WORKER MONITORING"
                  count={`${workers.length} WORKERS`}
                />

                <div className="worker-table">

                  {workers.length ===
                  0 ? (
                    <EmptyState
                      text="No worker data available."
                    />
                  ) : (
                    workers.map(
                      (
                        worker
                      ) => (
                        <WorkerRow
                          key={
                            worker.workerId
                          }
                          worker={
                            worker
                          }
                          onClick={() => {
                            setSelectedWorker(
                              worker
                            );

                            setActivePanel(
                              "map"
                            );
                          }}
                        />
                      )
                    )
                  )}

                </div>

              </div>

              {/* ALERTS */}

              <div className="panel">

                <PanelHeader
                  icon={
                    <Bell
                      size={16}
                    />
                  }
                  title="EMERGENCY ALERTS"
                  count={`${activeAlerts.length} ACTIVE`}
                />

                <AlertList
                  alerts={
                    activeAlerts
                  }
                  onAcknowledge={
                    acknowledgeAlert
                  }
                  onDispatch={
                    dispatchRescue
                  }
                />

              </div>

            </section>

            {/* TELEMETRY */}

            <section className="telemetry-grid">

              <TelemetryCard
                title="HEART RATE"
                icon={
                  <HeartPulse />
                }
                value={
                  selectedWorker?.heartRate ||
                  "--"
                }
                unit="BPM"
              />

              <TelemetryCard
                title="TEMPERATURE"
                icon={
                  <Thermometer />
                }
                value={
                  selectedWorker?.envTemp ||
                  "--"
                }
                unit="°C"
              />

              <TelemetryCard
                title="BATTERY"
                icon={
                  <Battery />
                }
                value={
                  selectedWorker?.battery ||
                  "--"
                }
                unit="%"
              />

              <TelemetryCard
                title="CONNECTIVITY"
                icon={
                  <Wifi />
                }
                value={
                  selectedWorker?.connectivity ||
                  "--"
                }
                unit=""
              />

            </section>

            {/* MAP */}

            <section className="panel map-panel">

              <PanelHeader
                icon={
                  <LocateFixed
                    size={16}
                  />
                }
                title="LIVE WORKER LOCATION"
                count={`${gpsWorkers.length} GPS ACTIVE`}
              />

              <LiveMap
                workers={
                  workers
                }
                center={
                  mapCenter
                }
                selectedWorker={
                  selectedWorker
                }
                onSelect={
                  setSelectedWorker
                }
              />

            </section>

          </>
        )}

        {/* =================================================
            WORKERS TAB
        ================================================= */}

        {activePanel ===
          "workers" && (
          <section className="panel">

            <PanelHeader
              icon={
                <Users
                  size={16}
                />
              }
              title="ALL WORKERS"
              count={`${workers.length} WORKERS`}
            />

            <div className="expanded-workers">

              {workers.map(
                (
                  worker
                ) => (
                  <WorkerDetail
                    key={
                      worker.workerId
                    }
                    worker={
                      worker
                    }
                    onSelect={() => {
                      setSelectedWorker(
                        worker
                      );

                      setActivePanel(
                        "map"
                      );
                    }}
                  />
                )
              )}

            </div>

          </section>
        )}

        {/* =================================================
            ALERTS TAB
        ================================================= */}

        {activePanel ===
          "alerts" && (
          <section className="panel">

            <PanelHeader
              icon={
                <Bell
                  size={16}
                />
              }
              title="EMERGENCY & SAFETY ALERTS"
              count={`${activeAlerts.length} ACTIVE`}
            />

            <div className="full-alerts">

              {activeAlerts.length ===
              0 ? (
                <EmptyState
                  text="No active emergency alerts."
                />
              ) : (
                activeAlerts.map(
                  (
                    alert
                  ) => (
                    <LargeAlert
                      key={
                        alert.id
                      }
                      alert={
                        alert
                      }
                      onAcknowledge={
                        acknowledgeAlert
                      }
                      onDispatch={
                        dispatchRescue
                      }
                    />
                  )
                )
              )}

            </div>

          </section>
        )}

        {/* =================================================
            MAP TAB
        ================================================= */}

        {activePanel ===
          "map" && (
          <section className="panel map-full-panel">

            <PanelHeader
              icon={
                <LocateFixed
                  size={16}
                />
              }
              title="LIVE WORKER MAP"
              count={`${gpsWorkers.length} GPS ACTIVE`}
            />

            <LiveMap
              workers={
                workers
              }
              center={
                mapCenter
              }
              selectedWorker={
                selectedWorker
              }
              onSelect={
                setSelectedWorker
              }
              large
            />

          </section>
        )}

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="command-footer">

        <div>
          <span className="footer-dot green" />
          DATABASE CONNECTED
        </div>

        <div>
          <span className="footer-dot green" />
          SOCKET {socketStatus}
        </div>

        <div>
          <span className="footer-dot green" />
          TELEMETRY READY
        </div>

        <div>
          <span className="footer-dot green" />
          EMERGENCY RESPONSE ACTIVE
        </div>

      </footer>

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .command-page {
          min-height: 100vh;
          background:
            #f4f7fb;
          color: #172b4d;
        }

        /* HEADER */

        .command-header {
          height: 76px;
          padding: 0 28px;

          background: white;

          border-bottom:
            1px solid #e1e8f0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          position: sticky;
          top: 0;
          z-index: 100;
        }

        .command-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .command-logo {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #0067a5;

          background: #eaf3fb;

          border:
            1px solid #d5e6f4;

          border-radius: 9px;
        }

        .command-title {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: .7px;
        }

        .command-subtitle {
          margin-top: 4px;

          color: #7a8a9e;

          font-size: 8px;
          font-weight: 700;

          letter-spacing: 1.2px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .socket-status {
          height: 38px;

          padding: 0 13px;

          border:
            1px solid #dce5ef;

          border-radius: 6px;

          display: flex;
          align-items: center;
          gap: 8px;

          color: #64748b;

          font-size: 8px;
          font-weight: 800;
        }

        .socket-status span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #d64545;
        }

        .socket-status.online span {
          background: #2e9d61;

          box-shadow:
            0 0 0 4px
            rgba(46,157,97,.1);
        }

        .exit-button {
          height: 38px;

          padding: 0 15px;

          border:
            1px solid #dce5ef;

          background: white;

          border-radius: 6px;

          color: #52657d;

          font-size: 8px;
          font-weight: 800;

          cursor: pointer;
        }

        .exit-button:hover {
          background: #f5f9fd;
          border-color: #a9c4d9;
        }

        /* NAV */

        .command-nav {
          height: 52px;

          padding: 0 28px;

          background: white;

          border-bottom:
            1px solid #e6edf3;

          display: flex;
          align-items: center;

          gap: 25px;
        }

        .command-nav button {
          height: 52px;

          border: 0;

          background: transparent;

          color: #718096;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;

          cursor: pointer;

          position: relative;
        }

        .command-nav button:hover {
          color: #0067a5;
        }

        .command-nav button.nav-active {
          color: #0067a5;
        }

        .command-nav button.nav-active::after {
          content: "";

          position: absolute;

          bottom: 0;
          left: 0;
          right: 0;

          height: 2px;

          background: #0067a5;
        }

        .nav-badge {
          margin-left: 6px;

          padding: 3px 6px;

          border-radius: 999px;

          color: #b42318;

          background: #fff0ee;
        }

        .nav-spacer {
          flex: 1;
        }

        .last-update {
          display: flex;
          align-items: center;
          gap: 6px;

          color: #8795a7;

          font-size: 7px;

          font-weight: 700;
        }

        .last-update svg {
          color: #0067a5;
        }

        /* MAIN */

        .command-main {
          max-width: 1480px;

          margin: 0 auto;

          padding: 28px;
        }

        .page-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          margin-bottom: 25px;
        }

        .section-kicker {
          color: #0067a5;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1.5px;

          margin-bottom: 8px;
        }

        .page-heading h1 {
          margin: 0;

          font-size: 32px;

          letter-spacing: -1px;
        }

        .page-heading p {
          margin: 8px 0 0;

          color: #718096;

          font-size: 11px;
        }

        .live-monitoring {
          display: flex;
          align-items: center;
          gap: 8px;

          color: #2e8b57;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;
        }

        .live-monitoring span {
          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: #2e9d61;

          box-shadow:
            0 0 0 5px
            rgba(46,157,97,.08);
        }

        /* KPI */

        .kpi-grid {
          display: grid;

          grid-template-columns:
            repeat(5, 1fr);

          gap: 14px;

          margin-bottom: 20px;
        }

        .kpi-card {
          min-height: 135px;

          padding: 20px;

          background: white;

          border:
            1px solid #e0e7ef;

          border-radius: 9px;

          box-shadow:
            0 5px 20px
            rgba(24,53,82,.035);
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-label {
          color: #718096;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;
        }

        .kpi-icon {
          width: 35px;
          height: 35px;

          border-radius: 8px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon.blue {
          color: #0067a5;
          background: #edf5fb;
        }

        .kpi-icon.green {
          color: #2e8b57;
          background: #edf8f1;
        }

        .kpi-icon.orange {
          color: #c78316;
          background: #fff7e7;
        }

        .kpi-icon.red {
          color: #c0392b;
          background: #fff0ee;
        }

        .kpi-icon.purple {
          color: #6c5aa8;
          background: #f3effb;
        }

        .kpi-value {
          margin-top: 17px;

          color: #172b4d;

          font-size: 30px;

          font-weight: 800;
        }

        /* GRID */

        .main-grid {
          display: grid;

          grid-template-columns:
            1.35fr
            .9fr;

          gap: 18px;

          margin-bottom: 18px;
        }

        .panel {
          background: white;

          border:
            1px solid #e0e7ef;

          border-radius: 9px;

          overflow: hidden;

          box-shadow:
            0 5px 20px
            rgba(24,53,82,.035);
        }

        .panel-header {
          min-height: 58px;

          padding: 0 18px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom:
            1px solid #e8edf3;
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 9px;

          color: #243b5a;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: .9px;
        }

        .panel-title svg {
          color: #0067a5;
        }

        .panel-count {
          padding: 5px 8px;

          border-radius: 999px;

          background: #edf5fb;

          color: #0067a5;

          font-size: 7px;

          font-weight: 800;
        }

        /* WORKERS */

        .worker-table {
          padding: 5px 8px;
        }

        .worker-row {
          min-height: 76px;

          padding: 12px;

          display: grid;

          grid-template-columns:
            42px
            1fr
            auto;

          align-items: center;

          gap: 13px;

          border-bottom:
            1px solid #edf1f5;

          cursor: pointer;

          transition:
            background .15s ease;
        }

        .worker-row:last-child {
          border-bottom: 0;
        }

        .worker-row:hover {
          background: #f8fbfd;
        }

        .worker-avatar {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #edf4fa;

          color: #0067a5;

          font-size: 10px;

          font-weight: 800;
        }

        .worker-name {
          color: #243b5a;

          font-size: 10px;

          font-weight: 800;
        }

        .worker-id {
          margin-top: 4px;

          color: #8a98aa;

          font-size: 7px;

          font-weight: 600;
        }

        .worker-location {
          margin-top: 5px;

          display: flex;
          align-items: center;
          gap: 4px;

          color: #7b899b;

          font-size: 7px;
        }

        .worker-location svg {
          color: #0067a5;
        }

        .status-badge {
          padding: 6px 9px;

          border-radius: 5px;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: .7px;
        }

        .status-safe {
          color: #27794d;
          background: #edf8f1;
        }

        .status-warning {
          color: #a36a0b;
          background: #fff7e5;
        }

        .status-critical {
          color: #b42318;
          background: #fff0ee;

          animation:
            criticalPulse 1.5s
            infinite;
        }

        @keyframes criticalPulse {
          0% {
            box-shadow:
              0 0 0 0
              rgba(214,69,69,.15);
          }

          70% {
            box-shadow:
              0 0 0 7px
              rgba(214,69,69,0);
          }

          100% {
            box-shadow:
              0 0 0 0
              rgba(214,69,69,0);
          }
        }

        /* ALERTS */

        .alert-list {
          padding: 9px;
        }

        .alert-item {
          padding: 14px;

          margin-bottom: 8px;

          border:
            1px solid #edf0f4;

          border-left:
            3px solid #d64545;

          border-radius: 7px;

          background: #fff;

          transition:
            transform .15s ease;
        }

        .alert-item:hover {
          transform: translateY(-1px);
        }

        .alert-item.warning {
          border-left-color:
            #d18a13;
        }

        .alert-item.dispatched {
          border-left-color:
            #0067a5;
        }

        .alert-top {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;
        }

        .alert-worker {
          color: #243b5a;

          font-size: 9px;

          font-weight: 800;
        }

        .alert-time {
          color: #8a98aa;

          font-size: 7px;
        }

        .alert-severity {
          display: inline-block;

          margin-top: 6px;

          font-size: 7px;

          font-weight: 900;

          color: #b42318;
        }

        .alert-message {
          margin-top: 6px;

          color: #66778b;

          font-size: 8px;

          line-height: 1.5;
        }

        .alert-actions {
          display: flex;

          gap: 7px;

          margin-top: 11px;
        }

        .alert-actions button {
          border:
            1px solid #dce5ee;

          background: white;

          border-radius: 5px;

          padding: 7px 9px;

          color: #0067a5;

          font-size: 7px;

          font-weight: 800;

          cursor: pointer;
        }

        .alert-actions button:hover {
          background: #eef6fb;

          border-color:
            #aac7dc;
        }

        .alert-actions .dispatch-button {
          color: white;

          background: #0067a5;

          border-color: #0067a5;
        }

        /* TELEMETRY */

        .telemetry-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 14px;

          margin-bottom: 18px;
        }

        .telemetry-card {
          min-height: 110px;

          padding: 17px;

          background: white;

          border:
            1px solid #e0e7ef;

          border-radius: 9px;

          display: flex;

          align-items: center;

          gap: 13px;
        }

        .telemetry-icon {
          width: 40px;
          height: 40px;

          border-radius: 8px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #0067a5;

          background: #edf5fb;
        }

        .telemetry-title {
          color: #7a899b;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: .9px;
        }

        .telemetry-value {
          margin-top: 6px;

          color: #172b4d;

          font-size: 20px;

          font-weight: 800;
        }

        .telemetry-unit {
          margin-left: 4px;

          color: #7d8b9c;

          font-size: 8px;

          font-weight: 700;
        }

        /* MAP */

        .map-panel {
          margin-bottom: 18px;
        }

        .map-container {
          width: 100%;

          height: 390px;
        }

        .map-container.large {
          height: 600px;
        }

        .map-worker-popup {
          min-width: 160px;
        }

        .popup-name {
          font-weight: 800;

          color: #172b4d;

          font-size: 12px;
        }

        .popup-status {
          margin-top: 5px;

          font-size: 10px;
        }

        .popup-info {
          margin-top: 4px;

          color: #66778b;

          font-size: 9px;
        }

        /* FOOTER */

        .command-footer {
          min-height: 48px;

          padding: 0 28px;

          background: white;

          border-top:
            1px solid #e1e8f0;

          display: flex;
          align-items: center;

          gap: 28px;

          color: #7b899b;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: .8px;
        }

        .footer-dot {
          display: inline-block;

          width: 6px;
          height: 6px;

          margin-right: 6px;

          border-radius: 50%;
        }

        .footer-dot.green {
          background: #2e9d61;
        }

        /* EMPTY */

        .empty-state {
          min-height: 190px;

          display: flex;

          align-items: center;

          justify-content: center;

          color: #8795a7;

          font-size: 9px;
        }

        /* EXPANDED WORKERS */

        .expanded-workers {
          padding: 12px;
        }

        .worker-detail {
          padding: 18px;

          border:
            1px solid #e6edf3;

          border-radius: 8px;

          margin-bottom: 10px;

          display: grid;

          grid-template-columns:
            45px
            1fr
            repeat(4, 130px)
            auto;

          align-items: center;

          gap: 15px;
        }

        .detail-label {
          color: #8a98aa;

          font-size: 7px;

          font-weight: 800;

          letter-spacing: .7px;
        }

        .detail-value {
          margin-top: 4px;

          color: #243b5a;

          font-size: 10px;

          font-weight: 700;
        }

        .detail-button {
          border:
            1px solid #dce5ee;

          background: white;

          border-radius: 5px;

          padding: 8px 10px;

          color: #0067a5;

          font-size: 7px;

          font-weight: 800;

          cursor: pointer;
        }

        /* FULL ALERTS */

        .full-alerts {
          padding: 15px;
        }

        .large-alert {
          padding: 18px;

          border:
            1px solid #e6edf3;

          border-left:
            4px solid #d64545;

          border-radius: 8px;

          margin-bottom: 12px;

          background: #fff;
        }

        .large-alert-header {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;
        }

        .large-alert-title {
          font-size: 12px;

          font-weight: 800;
        }

        .large-alert-message {
          margin-top: 7px;

          color: #66778b;

          font-size: 10px;

          line-height: 1.6;
        }

        .large-alert-actions {
          display: flex;

          gap: 8px;

          margin-top: 14px;
        }

        /* RESPONSIVE */

        @media (
          max-width: 1100px
        ) {
          .kpi-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

          .worker-detail {
            grid-template-columns:
              45px
              1fr
              repeat(2, 1fr)
              auto;
          }
        }

        @media (
          max-width: 850px
        ) {
          .main-grid {
            grid-template-columns:
              1fr;
          }

          .telemetry-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .kpi-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .command-nav {
            overflow-x: auto;
          }

          .last-update {
            display: none;
          }

          .worker-detail {
            grid-template-columns:
              45px
              1fr
              auto;
          }

          .worker-detail .detail-metric {
            display: none;
          }
        }

        @media (
          max-width: 600px
        ) {
          .command-header {
            padding: 0 14px;
          }

          .command-subtitle {
            display: none;
          }

          .command-title {
            font-size: 13px;
          }

          .command-logo {
            width: 36px;
            height: 36px;
          }

          .socket-status {
            display: none;
          }

          .command-main {
            padding: 18px 14px;
          }

          .page-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .page-heading h1 {
            font-size: 27px;
          }

          .kpi-grid {
            grid-template-columns:
              1fr 1fr;

            gap: 9px;
          }

          .kpi-card {
            min-height: 110px;

            padding: 14px;
          }

          .kpi-value {
            font-size: 24px;
          }

          .telemetry-grid {
            grid-template-columns:
              1fr 1fr;

            gap: 9px;
          }

          .telemetry-card {
            padding: 12px;
          }

          .telemetry-icon {
            width: 34px;
            height: 34px;
          }

          .telemetry-value {
            font-size: 17px;
          }

          .command-footer {
            padding: 12px 15px;

            flex-wrap: wrap;

            gap: 12px;
          }

          .map-container {
            height: 320px;
          }

          .map-container.large {
            height: 450px;
          }
        }

      `}</style>

    </div>
  );
};

/* =========================================================
   KPI CARD
========================================================= */

const KpiCard = ({
  label,
  value,
  icon,
  color,
}) => {
  return (
    <div className="kpi-card">

      <div className="kpi-top">

        <div className="kpi-label">
          {label}
        </div>

        <div
          className={`kpi-icon ${color}`}
        >
          {icon}
        </div>

      </div>

      <div className="kpi-value">
        {value}
      </div>

    </div>
  );
};

/* =========================================================
   PANEL HEADER
========================================================= */

const PanelHeader = ({
  icon,
  title,
  count,
}) => {
  return (
    <div className="panel-header">

      <div className="panel-title">
        {icon}

        {title}
      </div>

      <span className="panel-count">
        {count}
      </span>

    </div>
  );
};

/* =========================================================
   WORKER ROW
========================================================= */

const WorkerRow = ({
  worker,
  onClick,
}) => {
  const initials =
    worker.name
      ?.split(" ")
      .map(
        (part) =>
          part[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "WK";

  const status =
    worker.status ||
    "SAFE";

  return (
    <div
      className="worker-row"
      onClick={onClick}
    >

      <div className="worker-avatar">
        {initials}
      </div>

      <div>

        <div className="worker-name">
          {worker.name ||
            "Unknown Worker"}
        </div>

        <div className="worker-id">
          {worker.workerId ||
            "N/A"}
        </div>

        <div className="worker-location">

          <MapPin
            size={10}
          />

          {worker.location ||
            (
              Number.isFinite(
                Number(
                  worker.lat
                )
              )
                ? `${Number(
                    worker.lat
                  ).toFixed(
                    5
                  )}, ${Number(
                    worker.lng
                  ).toFixed(
                    5
                  )}`
                : "Location unavailable"
            )}

        </div>

      </div>

      <div
        className={`status-badge ${
          status ===
            "CRITICAL" ||
          status ===
            "SOS_TRIGGERED"
            ? "status-critical"
            : status ===
              "WARNING"
            ? "status-warning"
            : "status-safe"
        }`}
      >
        {status}
      </div>

    </div>
  );
};

/* =========================================================
   ALERT LIST
========================================================= */

const AlertList = ({
  alerts,
  onAcknowledge,
  onDispatch,
}) => {
  if (!alerts.length) {
    return (
      <EmptyState text="No active emergency alerts." />
    );
  }

  return (
    <div className="alert-list">

      {alerts.map(
        (alert) => (
          <div
            key={
              alert.id
            }
            className={`alert-item ${
              alert.status ===
              "RESCUE_DISPATCHED"
                ? "dispatched"
                : alert.severity ===
                  "WARNING"
                ? "warning"
                : ""
            }`}
          >

            <div className="alert-top">

              <div className="alert-worker">
                {alert.workerId}
              </div>

              <div className="alert-time">
                {alert.timestamp
                  ? new Date(
                      alert.timestamp
                    ).toLocaleTimeString()
                  : "--"}
              </div>

            </div>

            <div className="alert-severity">
              {alert.severity ||
                "CRITICAL"}
            </div>

            <div className="alert-message">
              {alert.message ||
                "Emergency event received."}
            </div>

            <div className="alert-actions">

              {alert.status !==
                "RESCUE_DISPATCHED" && (
                <button
                  className="dispatch-button"
                  onClick={() =>
                    onDispatch(
                      alert
                    )
                  }
                >
                  <Truck
                    size={11}
                    style={{
                      marginRight:
                        4,
                    }}
                  />
                  DISPATCH RESCUE
                </button>
              )}

              <button
                onClick={() =>
                  onAcknowledge(
                    alert
                  )
                }
              >
                ACKNOWLEDGE
              </button>

            </div>

          </div>
        )
      )}

    </div>
  );
};

/* =========================================================
   TELEMETRY
========================================================= */

const TelemetryCard = ({
  title,
  icon,
  value,
  unit,
}) => {
  return (
    <div className="telemetry-card">

      <div className="telemetry-icon">
        {React.cloneElement(
          icon,
          {
            size: 19,
          }
        )}
      </div>

      <div>

        <div className="telemetry-title">
          {title}
        </div>

        <div className="telemetry-value">

          {value}

          {unit && (
            <span className="telemetry-unit">
              {unit}
            </span>
          )}

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   LIVE MAP
========================================================= */

const LiveMap = ({
  workers,
  center,
  selectedWorker,
  onSelect,
  large = false,
}) => {
  return (
    <div
      className={`map-container ${
        large
          ? "large"
          : ""
      }`}
    >

      <MapContainer
        center={
          center
        }
        zoom={12}
        style={{
          width: "100%",
          height: "100%",
        }}
        scrollWheelZoom={
          true
        }
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenter
          worker={
            selectedWorker
          }
        />

        {workers
          .filter(
            (worker) =>
              Number.isFinite(
                Number(
                  worker.lat
                )
              ) &&
              Number.isFinite(
                Number(
                  worker.lng
                )
              )
          )
          .map(
            (worker) => (
              <Marker
                key={
                  worker.workerId
                }
                position={[
                  Number(
                    worker.lat
                  ),
                  Number(
                    worker.lng
                  ),
                ]}
                icon={workerIcon(
                  worker.status
                )}
                eventHandlers={{
                  click: () =>
                    onSelect(
                      worker
                    ),
                }}
              >

                <Popup>

                  <div className="map-worker-popup">

                    <div className="popup-name">
                      {worker.name}
                    </div>

                    <div className="popup-status">
                      Status:{" "}
                      <strong>
                        {worker.status ||
                          "SAFE"}
                      </strong>
                    </div>

                    <div className="popup-info">
                      ID:{" "}
                      {worker.workerId}
                    </div>

                    <div className="popup-info">
                      Battery:{" "}
                      {worker.battery ??
                        "--"}
                      %
                    </div>

                    <div className="popup-info">
                      Temperature:{" "}
                      {worker.envTemp ??
                        "--"}
                      °C
                    </div>

                  </div>

                </Popup>

              </Marker>
            )
          )}

      </MapContainer>

    </div>
  );
};

/* =========================================================
   WORKER DETAIL
========================================================= */

const WorkerDetail = ({
  worker,
  onSelect,
}) => {
  return (
    <div className="worker-detail">

      <div className="worker-avatar">
        {worker.name
          ?.split(" ")
          .map(
            (x) =>
              x[0]
          )
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </div>

      <div>
        <div className="worker-name">
          {worker.name}
        </div>

        <div className="worker-id">
          {worker.workerId}
        </div>
      </div>

      <div className="detail-metric">
        <div className="detail-label">
          HEART RATE
        </div>

        <div className="detail-value">
          {worker.heartRate ??
            "--"}{" "}
          BPM
        </div>
      </div>

      <div className="detail-metric">
        <div className="detail-label">
          TEMPERATURE
        </div>

        <div className="detail-value">
          {worker.envTemp ??
            "--"}{" "}
          °C
        </div>
      </div>

      <div className="detail-metric">
        <div className="detail-label">
          BATTERY
        </div>

        <div className="detail-value">
          {worker.battery ??
            "--"}{" "}
          %
        </div>
      </div>

      <div className="detail-metric">
        <div className="detail-label">
          CONNECTION
        </div>

        <div className="detail-value">
          {worker.connectivity ||
            "--"}
        </div>
      </div>

      <div>
        <button
          className="detail-button"
          onClick={
            onSelect
          }
        >
          VIEW MAP
        </button>
      </div>

    </div>
  );
};

/* =========================================================
   LARGE ALERT
========================================================= */

const LargeAlert = ({
  alert,
  onAcknowledge,
  onDispatch,
}) => {
  return (
    <div className="large-alert">

      <div className="large-alert-header">

        <div>

          <div className="large-alert-title">
            🚨{" "}
            {alert.workerId}
          </div>

          <div className="large-alert-message">
            {alert.message ||
              "Emergency alert received."}
          </div>

        </div>

        <div className="status-badge status-critical">
          {alert.severity ||
            "CRITICAL"}
        </div>

      </div>

      <div className="large-alert-actions">

        {alert.status !==
          "RESCUE_DISPATCHED" && (
          <button
            className="alert-actions dispatch-button"
            onClick={() =>
              onDispatch(
                alert
              )
            }
          >
            DISPATCH RESCUE TEAM
          </button>
        )}

        <button
          className="detail-button"
          onClick={() =>
            onAcknowledge(
              alert
            )
          }
        >
          ACKNOWLEDGE / RESOLVE
        </button>

      </div>

    </div>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  text,
}) => {
  return (
    <div className="empty-state">
      {text}
    </div>
  );
};

export default SupervisorDashboard;