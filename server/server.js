require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const Worker = require("./models/Worker");
const Alert = require("./models/Alert");

const app = express();
const server = http.createServer(app);

/* =========================================================
   CONFIG
========================================================= */

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   SOCKET.IO
========================================================= */

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },

  transports: ["polling", "websocket"],
});

/* =========================================================
   MONGODB
========================================================= */

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("=================================");
    console.log("MongoDB connected successfully");
    console.log("=================================");

    await seedWorkers();
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  });

mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

/* =========================================================
   SEED WORKERS
========================================================= */

async function seedWorkers() {
  try {
    const count = await Worker.countDocuments();

    if (count === 0) {
      await Worker.insertMany([
        {
          workerId: "W-042",
          name: "Alex Mercer",
          location: "Sector 7G",
          status: "SAFE",
          envTemp: 31,
          battery: 84,
          connectivity: "Strong",
          lat: 18.5204,
          lng: 73.8567,
        },

        {
          workerId: "W-011",
          name: "Sarah Connor",
          location: "Tunnel B",
          status: "WARNING",
          envTemp: 38,
          battery: 45,
          connectivity: "Strong",
          lat: 18.526,
          lng: 73.851,
        },

        {
          workerId: "W-007",
          name: "James Bond",
          location: "Deep Shaft 3",
          status: "SAFE",
          envTemp: 28,
          battery: 90,
          connectivity: "Strong",
          lat: 18.515,
          lng: 73.862,
        },
      ]);

      console.log("3 demo worker records inserted.");
    }
  } catch (error) {
    console.error(
      "Worker seed error:",
      error.message
    );
  }
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    serverTime:
      new Date().toISOString(),
  });
});

/* =========================================================
   WORKERS
========================================================= */

/*
GET /api/workers
*/
app.get("/api/workers", async (req, res) => {
  try {
    const workers =
      await Worker.find().sort({
        createdAt: -1,
      });

    res.json(workers);
  } catch (error) {
    console.error(
      "Get workers error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to fetch workers",
    });
  }
});

/*
GET /api/workers/:workerId
*/
app.get(
  "/api/workers/:workerId",
  async (req, res) => {
    try {
      const worker =
        await Worker.findOne({
          workerId:
            req.params.workerId,
        });

      if (!worker) {
        return res.status(404).json({
          message:
            "Worker not found",
        });
      }

      res.json(worker);
    } catch (error) {
      console.error(
        "Get worker error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to fetch worker",
      });
    }
  }
);

/*
POST /api/workers
*/
app.post("/api/workers", async (req, res) => {
  try {
    const worker =
      await Worker.create(req.body);

    io.emit(
      "worker_updated",
      worker
    );

    res.status(201).json(worker);
  } catch (error) {
    console.error(
      "Create worker error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to create worker",
      error:
        error.message,
    });
  }
});

/*
PUT /api/workers/:workerId
*/
app.put(
  "/api/workers/:workerId",
  async (req, res) => {
    try {
      const worker =
        await Worker.findOneAndUpdate(
          {
            workerId:
              req.params.workerId,
          },
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!worker) {
        return res.status(404).json({
          message:
            "Worker not found",
        });
      }

      io.emit(
        "worker_updated",
        worker
      );

      res.json(worker);
    } catch (error) {
      console.error(
        "Update worker error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to update worker",
        error:
          error.message,
      });
    }
  }
);

/*
DELETE /api/workers/:workerId
*/
app.delete(
  "/api/workers/:workerId",
  async (req, res) => {
    try {
      const worker =
        await Worker.findOneAndDelete({
          workerId:
            req.params.workerId,
        });

      if (!worker) {
        return res.status(404).json({
          message:
            "Worker not found",
        });
      }

      io.emit(
        "worker_deleted",
        {
          workerId:
            req.params.workerId,
        }
      );

      res.json({
        message:
          "Worker deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete worker error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to delete worker",
      });
    }
  }
);

/* =========================================================
   ALERTS
========================================================= */

/*
GET active alerts
*/
app.get("/api/alerts", async (req, res) => {
  try {
    const alerts =
      await Alert.find({
        status: {
          $ne: "RESOLVED",
        },
      }).sort({
        createdAt: -1,
      });

    res.json(alerts);
  } catch (error) {
    console.error(
      "Get alerts error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to fetch alerts",
    });
  }
});

/*
GET all alerts
*/
app.get(
  "/api/alerts/all",
  async (req, res) => {
    try {
      const alerts =
        await Alert.find().sort({
          createdAt: -1,
        });

      res.json(alerts);
    } catch (error) {
      console.error(
        "Get all alerts error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to fetch alerts",
      });
    }
  }
);

/*
GET single alert
*/
app.get(
  "/api/alerts/:id",
  async (req, res) => {
    try {
      const alert =
        await Alert.findById(
          req.params.id
        );

      if (!alert) {
        return res.status(404).json({
          message:
            "Alert not found",
        });
      }

      res.json(alert);
    } catch (error) {
      console.error(
        "Get alert error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to fetch alert",
      });
    }
  }
);

/*
POST alert
*/
app.post("/api/alerts", async (req, res) => {
  try {
    const alert =
      await Alert.create(req.body);

    if (alert.workerId) {
      await Worker.findOneAndUpdate(
        {
          workerId:
            alert.workerId,
        },
        {
          status:
            alert.severity ===
              "CRITICAL"
              ? "CRITICAL"
              : "WARNING",
        }
      );
    }

    io.emit(
      "emergency_alert_received",
      alert
    );

    res.status(201).json(alert);
  } catch (error) {
    console.error(
      "Create alert error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to create alert",
      error:
        error.message,
    });
  }
});

/*
Resolve alert
*/
app.patch(
  "/api/alerts/:id/resolve",
  async (req, res) => {
    try {
      const alert =
        await Alert.findByIdAndUpdate(
          req.params.id,
          {
            status:
              "RESOLVED",
            resolvedAt:
              new Date(),
          },
          {
            new: true,
          }
        );

      if (!alert) {
        return res.status(404).json({
          message:
            "Alert not found",
        });
      }

      if (alert.workerId) {
        await Worker.findOneAndUpdate(
          {
            workerId:
              alert.workerId,
          },
          {
            status:
              "SAFE",
          }
        );
      }

      io.emit(
        "alert_resolved",
        alert
      );

      res.json(alert);
    } catch (error) {
      console.error(
        "Resolve alert error:",
        error.message
      );

      res.status(500).json({
        message:
          "Failed to resolve alert",
      });
    }
  }
);

/* =========================================================
   SOCKET CONNECTION
========================================================= */

io.on("connection", (socket) => {
  console.log(
    `🟢 Socket connected: ${socket.id}`
  );

  /* -------------------------------------------------------
     INITIAL DATA
  ------------------------------------------------------- */

  socket.on(
    "request_initial_data",
    async () => {
      try {
        const workers =
          await Worker.find().sort({
            createdAt: -1,
          });

        const alerts =
          await Alert.find({
            status: {
              $ne: "RESOLVED",
            },
          }).sort({
            createdAt: -1,
          });

        socket.emit(
          "initial_data",
          {
            workers,
            alerts,
          }
        );

        console.log(
          `📦 Initial data sent to ${socket.id}`
        );
      } catch (error) {
        console.error(
          "Initial data error:",
          error.message
        );
      }
    }
  );

  /* -------------------------------------------------------
     WORKER UPDATE
  ------------------------------------------------------- */

  socket.on(
    "worker_update",
    async (data) => {
      try {
        const worker =
          await Worker.findOneAndUpdate(
            {
              workerId:
                data.workerId,
            },
            data,
            {
              new: true,
            }
          );

        if (!worker) {
          console.log(
            "Worker not found:",
            data.workerId
          );
          return;
        }

        io.emit(
          "worker_updated",
          worker
        );

        console.log(
          `👤 Worker updated: ${worker.workerId}`
        );
      } catch (error) {
        console.error(
          "Worker update error:",
          error.message
        );
      }
    }
  );

  /* -------------------------------------------------------
     LIVE GPS LOCATION
  ------------------------------------------------------- */

  socket.on(
    "worker_location_update",
    async (data) => {
      try {
        console.log(
          "📍 Location received:",
          data
        );

        const worker =
          await Worker.findOneAndUpdate(
            {
              workerId:
                data.workerId,
            },
            {
              lat: Number(
                data.lat
              ),
              lng: Number(
                data.lng
              ),
              location:
                data.location ||
                undefined,
              lastLocationUpdate:
                new Date(),
            },
            {
              new: true,
            }
          );

        if (!worker) {
          console.log(
            "Worker not found:",
            data.workerId
          );
          return;
        }

        io.emit(
          "worker_location_updated",
          {
            workerId:
              worker.workerId,

            lat:
              worker.lat,

            lng:
              worker.lng,

            location:
              worker.location,

            accuracy:
              data.accuracy,

            timestamp:
              data.timestamp ||
              new Date().toISOString(),
          }
        );

        console.log(
          `📍 ${worker.workerId} → ${worker.lat}, ${worker.lng}`
        );
      } catch (error) {
        console.error(
          "Location update failed:",
          error.message
        );
      }
    }
  );

  /* -------------------------------------------------------
     SOS / EMERGENCY
  ------------------------------------------------------- */

  socket.on(
    "emergency_alert",
    async (data) => {
      try {
        console.log(
          "🚨 EMERGENCY ALERT:",
          data
        );

        const alert =
          await Alert.create({
            workerId:
              data.workerId,

            message:
              data.message ||
              "Emergency SOS triggered",

            severity:
              "CRITICAL",

            status:
              "ACTIVE",

            lat:
              data.lat,

            lng:
              data.lng,

            timestamp:
              data.timestamp ||
              new Date(),
          });

        await Worker.findOneAndUpdate(
          {
            workerId:
              data.workerId,
          },
          {
            status:
              "CRITICAL",

            lat:
              data.lat,

            lng:
              data.lng,

            lastLocationUpdate:
              new Date(),
          }
        );

        io.emit(
          "emergency_alert_received",
          {
            id:
              alert._id,

            alertId:
              alert._id,

            workerId:
              data.workerId,

            message:
              alert.message,

            severity:
              "CRITICAL",

            status:
              "ACTIVE",

            lat:
              data.lat,

            lng:
              data.lng,

            timestamp:
              alert.timestamp,
          }
        );

        console.log(
          `🚨 SOS broadcast for ${data.workerId}`
        );
      } catch (error) {
        console.error(
          "Emergency alert error:",
          error.message
        );
      }
    }
  );

  /* -------------------------------------------------------
     DISPATCH RESCUE TEAM
  ------------------------------------------------------- */

  socket.on(
    "dispatch_rescue_team",
    async (data) => {
      try {
        console.log(
          "🚑 RESCUE DISPATCH:",
          data
        );

        let alert =
          null;

        if (
          data.alertId
        ) {
          alert =
            await Alert.findByIdAndUpdate(
              data.alertId,
              {
                status:
                  "RESCUE_DISPATCHED",

                rescueTeam:
                  data.rescueTeam ||
                  "Rescue Team Alpha",

                dispatchedAt:
                  new Date(),
              },
              {
                new: true,
              }
            );
        }

        io.emit(
          "rescue_dispatched",
          {
            alertId:
              data.alertId,

            workerId:
              data.workerId,

            rescueTeam:
              data.rescueTeam ||
              "Rescue Team Alpha",

            timestamp:
              new Date().toISOString(),
          }
        );

        console.log(
          `🚑 Rescue dispatched for ${data.workerId}`
        );
      } catch (error) {
        console.error(
          "Rescue dispatch error:",
          error.message
        );
      }
    }
  );

  /* -------------------------------------------------------
     RESOLVE ALERT
  ------------------------------------------------------- */

  socket.on(
    "resolve_alert",
    async (data) => {
      try {
        const alert =
          await Alert.findByIdAndUpdate(
            data.alertId,
            {
              status:
                "RESOLVED",

              resolvedAt:
                new Date(),
            },
            {
              new: true,
            }
          );

        if (!alert) {
          console.log(
            "Alert not found:",
            data.alertId
          );
          return;
        }

        if (
          alert.workerId
        ) {
          await Worker.findOneAndUpdate(
            {
              workerId:
                alert.workerId,
            },
            {
              status:
                "SAFE",
            }
          );
        }

        io.emit(
          "alert_resolved",
          {
            alertId:
              alert._id,

            workerId:
              alert.workerId,

            status:
              "RESOLVED",

            timestamp:
              new Date().toISOString(),
          }
        );

        console.log(
          `✅ Alert resolved: ${alert._id}`
        );
      } catch (error) {
        console.error(
          "Resolve socket alert error:",
          error.message
        );
      }
    }
  );

  /* -------------------------------------------------------
     HAZARD BROADCAST
  ------------------------------------------------------- */

  socket.on(
    "hazard_broadcast",
    (data) => {
      console.log(
        "⚠️ Hazard broadcast:",
        data
      );

      io.emit(
        "hazard_created",
        data
      );
    }
  );

  /* -------------------------------------------------------
     HAZARD RESOLVE
  ------------------------------------------------------- */

  socket.on(
    "hazard_resolve",
    (data) => {
      console.log(
        "✅ Hazard resolved:",
        data
      );

      io.emit(
        "hazard_resolved",
        data
      );
    }
  );

  /* -------------------------------------------------------
     RESCUE TEAM UPDATE
  ------------------------------------------------------- */

  socket.on(
    "rescue_team_update",
    (data) => {
      console.log(
        "🚑 Rescue team update:",
        data
      );

      io.emit(
        "rescue_team_updated",
        data
      );
    }
  );

  /* -------------------------------------------------------
     OFFLINE EVENT SYNC
  ------------------------------------------------------- */

  socket.on(
    "sync_offline_events",
    async (events) => {
      try {
        if (
          !Array.isArray(
            events
          )
        ) {
          return;
        }

        console.log(
          `🔄 Syncing ${events.length} offline events`
        );

        for (
          const event of events
        ) {
          if (
            event.type ===
            "LOCATION"
          ) {
            socket.emit(
              "worker_location_update",
              event.data
            );
          }

          if (
            event.type ===
            "SOS"
          ) {
            socket.emit(
              "emergency_alert",
              event.data
            );
          }
        }
      } catch (error) {
        console.error(
          "Offline sync error:",
          error.message
        );
      }
    }
  );

  /* -------------------------------------------------------
     DISCONNECT
  ------------------------------------------------------- */

  socket.on(
    "disconnect",
    (reason) => {
      console.log(
        `🔴 Socket disconnected: ${socket.id}`
      );

      console.log(
        `Reason: ${reason}`
      );
    }
  );
});

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    name:
      "RescueLink Backend",
    status:
      "running",
    port:
      PORT,
    database:
      mongoose.connection.readyState ===
      1
        ? "connected"
        : "disconnected",
  });
});

/* =========================================================
   START SERVER
========================================================= */

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");
    console.log(
      "=========================================="
    );
    console.log(
      "       RESCUELINK BACKEND RUNNING"
    );
    console.log(
      "=========================================="
    );

    console.log(
      `Local:   http://localhost:${PORT}`
    );

    console.log(
      `Network: http://10.65.210.25:${PORT}`
    );

    console.log(
      `Client:  ${CLIENT_URL}`
    );

    console.log(
      "=========================================="
    );
    console.log("");
  }
);