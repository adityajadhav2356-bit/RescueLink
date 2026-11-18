require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// Models
const Worker = require("./models/Worker");
const Alert = require("./models/Alert");

const app = express();
const server = http.createServer(app);

/* =========================================================
   CONFIG
========================================================= */

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://10.65.210.25:5173",
  "https://rescue-link-8zum.vercel.app",
].filter(Boolean);

console.log("==========================================");
console.log("        RESCUELINK BACKEND STARTING");
console.log("==========================================");

/* =========================================================
   CORS
========================================================= */

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // such as Postman/server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());

/* =========================================================
   SOCKET.IO
========================================================= */

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Socket CORS blocked origin:", origin);
      return callback(new Error("Not allowed by Socket.IO CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
    ],
  },

  transports: ["websocket", "polling"],

  pingTimeout: 60000,
  pingInterval: 25000,
});

/* =========================================================
   MONGODB CONNECTION
========================================================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connection established");
    console.log("MongoDB connected successfully");

    await seedWorkers();
  })
  .catch((error) => {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  });

/* =========================================================
   SEED WORKERS
========================================================= */

async function seedWorkers() {
  try {
    const count = await Worker.countDocuments();

    if (count === 0) {
      const workers = [
        {
          workerId: "W-042",
          name: "Alex Mercer",
          location: "Sector 7G",
          status: "SAFE",
          environment: {
            temperature: 31,
          },
          battery: 84,
          connectivity: "Strong",
        },

        {
          workerId: "W-011",
          name: "Sarah Connor",
          location: "Tunnel B",
          status: "WARNING",
          environment: {
            temperature: 38,
          },
          battery: 45,
          connectivity: "Strong",
        },

        {
          workerId: "W-007",
          name: "James Bond",
          location: "Deep Shaft 3",
          status: "SAFE",
          environment: {
            temperature: 28,
          },
          battery: 90,
          connectivity: "Strong",
        },
      ];

      await Worker.insertMany(workers);

      console.log("Seeded 3 workers into MongoDB");
    }
  } catch (error) {
    console.error("Worker seeding failed:", error.message);
  }
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    serverTime: new Date().toISOString(),
  });
});

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    service: "RescueLink Backend",
    status: "running",
    version: "1.0.0",
  });
});

/* =========================================================
   WORKER APIs
========================================================= */

// GET ALL WORKERS
app.get("/api/workers", async (req, res) => {
  try {
    const workers = await Worker.find().sort({
      createdAt: -1,
    });

    res.json(workers);
  } catch (error) {
    console.error("GET workers error:", error.message);

    res.status(500).json({
      message: "Failed to fetch workers",
      error: error.message,
    });
  }
});

// GET SINGLE WORKER
app.get("/api/workers/:workerId", async (req, res) => {
  try {
    const worker = await Worker.findOne({
      workerId: req.params.workerId,
    });

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    res.json(worker);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch worker",
      error: error.message,
    });
  }
});

// CREATE WORKER
app.post("/api/workers", async (req, res) => {
  try {
    const worker = new Worker(req.body);

    await worker.save();

    io.emit("worker_update", worker);

    res.status(201).json(worker);
  } catch (error) {
    console.error("Create worker error:", error.message);

    res.status(400).json({
      message: "Failed to create worker",
      error: error.message,
    });
  }
});

// UPDATE WORKER
app.put("/api/workers/:workerId", async (req, res) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      {
        workerId: req.params.workerId,
      },
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    io.emit("worker_update", worker);

    res.json(worker);
  } catch (error) {
    console.error("Update worker error:", error.message);

    res.status(400).json({
      message: "Failed to update worker",
      error: error.message,
    });
  }
});

// DELETE WORKER
app.delete("/api/workers/:workerId", async (req, res) => {
  try {
    const worker = await Worker.findOneAndDelete({
      workerId: req.params.workerId,
    });

    if (!worker) {
      return res.status(404).json({
        message: "Worker not found",
      });
    }

    io.emit("worker_update", {
      workerId: req.params.workerId,
      deleted: true,
    });

    res.json({
      message: "Worker deleted successfully",
    });
  } catch (error) {
    console.error("Delete worker error:", error.message);

    res.status(500).json({
      message: "Failed to delete worker",
      error: error.message,
    });
  }
});

/* =========================================================
   ALERT APIs
========================================================= */

// GET ACTIVE ALERTS
app.get("/api/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find({
      resolved: { $ne: true },
    }).sort({
      createdAt: -1,
    });

    res.json(alerts);
  } catch (error) {
    console.error("GET alerts error:", error.message);

    res.status(500).json({
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
});

// GET ALL ALERTS
app.get("/api/alerts/all", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({
      createdAt: -1,
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
});

// GET SINGLE ALERT
app.get("/api/alerts/:id", async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch alert",
      error: error.message,
    });
  }
});

// CREATE ALERT
app.post("/api/alerts", async (req, res) => {
  try {
    const alert = new Alert(req.body);

    await alert.save();

    io.emit("alert:created", alert);

    res.status(201).json(alert);
  } catch (error) {
    console.error("Create alert error:", error.message);

    res.status(400).json({
      message: "Failed to create alert",
      error: error.message,
    });
  }
});

// RESOLVE ALERT
app.patch("/api/alerts/:id/resolve", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        resolved: true,
        resolvedAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    io.emit("alert:resolved", alert);

    res.json(alert);
  } catch (error) {
    console.error("Resolve alert error:", error.message);

    res.status(500).json({
      message: "Failed to resolve alert",
      error: error.message,
    });
  }
});

/* =========================================================
   SOCKET.IO CONNECTION
========================================================= */

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  /* -------------------------------------------------------
     INITIAL DATA REQUEST
  ------------------------------------------------------- */

  socket.on("request_initial_data", async () => {
    try {
      const workers = await Worker.find().sort({
        createdAt: -1,
      });

      const alerts = await Alert.find({
        resolved: { $ne: true },
      }).sort({
        createdAt: -1,
      });

      socket.emit("initial_data", {
        workers,
        alerts,
      });

      console.log(
        "📦 Initial data sent to",
        socket.id
      );
    } catch (error) {
      console.error(
        "Initial data error:",
        error.message
      );
    }
  });

  /* -------------------------------------------------------
     EMERGENCY ALERT
  ------------------------------------------------------- */

  socket.on("emergency_alert", async (data) => {
    try {
      console.log(
        "🚨 Emergency alert received:",
        data
      );

      const alert = new Alert({
        ...data,
        resolved: false,
        createdAt: new Date(),
      });

      await alert.save();

      // Broadcast to every connected command center
      io.emit("alert:created", alert);

      io.emit("emergency_broadcast", {
        ...alert.toObject(),
      });
    } catch (error) {
      console.error(
        "Emergency alert error:",
        error.message
      );
    }
  });

  /* -------------------------------------------------------
     WORKER UPDATE
  ------------------------------------------------------- */

  socket.on("worker_update", async (data) => {
    try {
      console.log(
        "👷 Worker update:",
        data
      );

      const worker = await Worker.findOneAndUpdate(
        {
          workerId: data.workerId,
        },
        {
          $set: data,
        },
        {
          new: true,
          upsert: true,
        }
      );

      io.emit("worker_update", worker);
    } catch (error) {
      console.error(
        "Worker update error:",
        error.message
      );
    }
  });

  /* -------------------------------------------------------
     RESCUE TEAM DISPATCH
  ------------------------------------------------------- */

  socket.on("dispatch_rescue_team", async (data) => {
    try {
      console.log(
        "🚑 Rescue team dispatched:",
        data
      );

      io.emit("rescue:dispatched", data);

      io.emit("incident:updated", {
        ...data,
        status: "RESCUE_DISPATCHED",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(
        "Rescue dispatch error:",
        error.message
      );
    }
  });

  /* -------------------------------------------------------
     RESOLVE ALERT
  ------------------------------------------------------- */

  socket.on("resolve_alert", async (data) => {
    try {
      console.log(
        "✅ Resolving alert:",
        data
      );

      if (data.alertId) {
        const alert = await Alert.findByIdAndUpdate(
          data.alertId,
          {
            resolved: true,
            resolvedAt: new Date(),
          },
          {
            new: true,
          }
        );

        if (alert) {
          io.emit("alert:resolved", alert);
        }
      }

      io.emit("incident:updated", {
        ...data,
        status: "RESOLVED",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(
        "Resolve alert error:",
        error.message
      );
    }
  });

  /* -------------------------------------------------------
     EMERGENCY BROADCAST
  ------------------------------------------------------- */

  socket.on("emergency_broadcast", (data) => {
    console.log(
      "📢 Emergency broadcast:",
      data
    );

    socket.broadcast.emit(
      "emergency_broadcast",
      data
    );
  });

  /* -------------------------------------------------------
     HAZARD BROADCAST
  ------------------------------------------------------- */

  socket.on("hazard_broadcast", (data) => {
    console.log(
      "⚠️ Hazard broadcast:",
      data
    );

    io.emit("hazard:created", data);
  });

  /* -------------------------------------------------------
     HAZARD RESOLVE
  ------------------------------------------------------- */

  socket.on("hazard_resolve", (data) => {
    console.log(
      "✅ Hazard resolved:",
      data
    );

    io.emit("hazard:resolved", data);
  });

  /* -------------------------------------------------------
     RESCUE TEAM UPDATE
  ------------------------------------------------------- */

  socket.on("rescue_team_update", (data) => {
    console.log(
      "🚑 Rescue team update:",
      data
    );

    io.emit("rescue_team_update", data);
  });

  /* -------------------------------------------------------
     OFFLINE EVENTS SYNC
  ------------------------------------------------------- */

  socket.on("sync_offline_events", async (events) => {
    try {
      console.log(
        `📡 Syncing ${events?.length || 0} offline events`
      );

      if (!Array.isArray(events)) {
        return;
      }

      for (const event of events) {
        if (event.type === "emergency_alert") {
          const alert = new Alert({
            ...event.data,
            resolved: false,
            createdAt: new Date(),
          });

          await alert.save();

          io.emit("alert:created", alert);
        }

        if (event.type === "worker_update") {
          const worker =
            await Worker.findOneAndUpdate(
              {
                workerId:
                  event.data.workerId,
              },
              {
                $set: event.data,
              },
              {
                new: true,
                upsert: true,
              }
            );

          io.emit(
            "worker_update",
            worker
          );
        }
      }

      socket.emit("offline_events_synced", {
        success: true,
        count: events.length,
      });
    } catch (error) {
      console.error(
        "Offline sync error:",
        error.message
      );

      socket.emit("offline_events_synced", {
        success: false,
        error: error.message,
      });
    }
  });

  /* -------------------------------------------------------
     DISCONNECT
  ------------------------------------------------------- */

  socket.on("disconnect", (reason) => {
    console.log(
      "🔴 Socket disconnected:",
      socket.id,
      "Reason:",
      reason
    );
  });

  socket.on("connect_error", (error) => {
    console.error(
      "❌ Socket connection error:",
      error.message
    );
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error(
    "Server error:",
    err.message
  );

  res.status(500).json({
    message: "Internal server error",
  });
});

/* =========================================================
   START SERVER
========================================================= */

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("==========================================");
  console.log("       RESCUELINK BACKEND RUNNING");
  console.log("==========================================");
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://10.65.210.25:${PORT}`);
  console.log(
    `Client:  http://localhost:5173`
  );
  console.log(
    `Production Client: https://rescue-link-8zum.vercel.app`
  );
  console.log("==========================================");
});