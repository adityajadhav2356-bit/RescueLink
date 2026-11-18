import React from "react";
import { useNavigate } from "react-router-dom";

import {
  Shield,
  Smartphone,
  Radio,
  KeyRound,
  Activity,
  ArrowRight,
  Wifi,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="landing-header">

        {/* Logo */}
        <div className="brand-section">

          <div className="brand-logo">
            <Shield size={25} strokeWidth={2} />
          </div>

          <div className="brand-text">

            <div className="brand-name">
              RESCUELINK

              <span className="brand-badge">
                COMMAND
              </span>
            </div>

            <div className="brand-subtitle">
              AUTONOMOUS INDUSTRIAL WORKER SAFETY PLATFORM
            </div>

          </div>

        </div>


        {/* Header Navigation */}
        <nav className="header-nav">

          <button
            className="status-button"
          >
            <span className="status-dot"></span>
            SYSTEM NOMINAL
          </button>


          <button
            className="header-button"
            onClick={() => navigate("/login")}
          >
            LOGIN HUB
            <KeyRound size={16} />
          </button>


          <button
            className="header-button command-button"
            onClick={() => navigate("/supervisor")}
          >
            COMMAND CENTER
            <Shield size={16} />
          </button>

        </nav>

      </header>


      {/* =====================================================
          MAIN HERO
      ===================================================== */}
      <main className="landing-main">

        {/* Top Badge */}
        <div className="hero-badge">

          <Radio size={16} />

          <span>
            INTELLIGENT WORKER SAFETY &amp; EMERGENCY RESPONSE
          </span>

        </div>


        {/* Main Heading */}
        <h1 className="hero-title">

          Autonomous Safety
          <br />

          Intelligence for
          <br />

          <span className="hero-highlight">
            Hazardous Industrial
          </span>

          <br />

          <span className="hero-highlight">
            Environments
          </span>

        </h1>


        {/* Feature Pipeline */}
        <div className="feature-pipeline">

          <span>CONNECT</span>
          <span className="pipeline-dot">•</span>

          <span>MONITOR</span>
          <span className="pipeline-dot">•</span>

          <span>LOCATE</span>
          <span className="pipeline-dot">•</span>

          <span>ANALYZE</span>
          <span className="pipeline-dot">•</span>

          <span>DETECT</span>
          <span className="pipeline-dot">•</span>

          <span>RESPOND</span>

        </div>


        {/* Description */}
        <p className="hero-description">

          Connect operators with Command Centers through live biometric
          vitals, predictive hazard trends, automated geofencing,
          nearest responder dispatch, and smart emergency evacuation routes.

        </p>


        {/* =====================================================
            MAIN ACTION BUTTONS
        ===================================================== */}
        <div className="hero-actions">

          <button
            className="primary-action"
            onClick={() => navigate("/supervisor")}
          >

            <Shield size={20} />

            <span>
              SUPERVISOR COMMAND HUB
            </span>

            <ArrowRight size={18} />

          </button>


          <button
            className="secondary-action"
            onClick={() => navigate("/worker")}
          >

            <Smartphone size={20} />

            <span>
              WORKER MOBILE APP
            </span>

            <ArrowRight size={18} />

          </button>

        </div>


        {/* =====================================================
            DEMO ACCESS
        ===================================================== */}
        <section className="demo-access">

          <div className="demo-header">

            <div className="demo-title">

              <KeyRound size={18} />

              <span>
                1-CLICK INSTANT DEMO STAKEHOLDER ACCESS
              </span>

            </div>


            <span className="no-password">
              NO PASSWORD REQUIRED
            </span>

          </div>


          <div className="demo-options">

            {/* Supervisor */}
            <button
              className="demo-card"
              onClick={() => navigate("/supervisor")}
            >

              <div className="demo-icon supervisor-icon">
                <Shield size={22} />
              </div>

              <div className="demo-card-content">

                <div className="demo-card-title">
                  SUPERVISOR
                </div>

                <div className="demo-card-description">
                  Command Center &amp; Emergency Operations
                </div>

              </div>

              <ArrowRight size={18} />

            </button>


            {/* Worker */}
            <button
              className="demo-card"
              onClick={() => navigate("/worker")}
            >

              <div className="demo-icon worker-icon">
                <Smartphone size={22} />
              </div>

              <div className="demo-card-content">

                <div className="demo-card-title">
                  WORKER
                </div>

                <div className="demo-card-description">
                  Mobile Safety &amp; Emergency Interface
                </div>

              </div>

              <ArrowRight size={18} />

            </button>


            {/* Analytics */}
            <button
              className="demo-card"
              onClick={() => navigate("/analytics")}
            >

              <div className="demo-icon analytics-icon">
                <Activity size={22} />
              </div>

              <div className="demo-card-content">

                <div className="demo-card-title">
                  ANALYTICS
                </div>

                <div className="demo-card-description">
                  Safety Intelligence &amp; Performance
                </div>

              </div>

              <ArrowRight size={18} />

            </button>

          </div>

        </section>


        {/* =====================================================
            SYSTEM STATUS
        ===================================================== */}
        <section className="system-strip">

          <div className="system-item">

            <Wifi size={16} />

            <span>
              LIVE TELEMETRY
            </span>

            <strong>
              ONLINE
            </strong>

          </div>


          <div className="system-item">

            <Activity size={16} />

            <span>
              WORKERS MONITORED
            </span>

            <strong>
              REAL-TIME
            </strong>

          </div>


          <div className="system-item">

            <Radio size={16} />

            <span>
              EMERGENCY RESPONSE
            </span>

            <strong>
              ACTIVE
            </strong>

          </div>

        </section>

      </main>

    </div>
  );
};

export default Landing;