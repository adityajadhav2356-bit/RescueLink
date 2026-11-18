const express = require("express");
const Worker = require("../models/Worker");

const router = express.Router();

// GET all workers
router.get("/", async (req, res) => {
    try {
        const workers = await Worker.find().sort({ createdAt: -1 });

        res.status(200).json(workers);
    } catch (error) {
        console.error("Error fetching workers:", error);
        res.status(500).json({
            message: "Failed to fetch workers"
        });
    }
});

// GET one worker
router.get("/:workerId", async (req, res) => {
    try {
        const worker = await Worker.findOne({
            workerId: req.params.workerId
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        res.status(200).json(worker);
    } catch (error) {
        console.error("Error fetching worker:", error);

        res.status(500).json({
            message: "Failed to fetch worker"
        });
    }
});

// CREATE worker
router.post("/", async (req, res) => {
    try {
        const worker = await Worker.create(req.body);

        res.status(201).json({
            message: "Worker created successfully",
            worker
        });
    } catch (error) {
        console.error("Error creating worker:", error);

        res.status(400).json({
            message: "Failed to create worker",
            error: error.message
        });
    }
});

// UPDATE worker
router.put("/:workerId", async (req, res) => {
    try {
        const worker = await Worker.findOneAndUpdate(
            { workerId: req.params.workerId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        res.status(200).json({
            message: "Worker updated successfully",
            worker
        });
    } catch (error) {
        console.error("Error updating worker:", error);

        res.status(400).json({
            message: "Failed to update worker",
            error: error.message
        });
    }
});

// DELETE worker
router.delete("/:workerId", async (req, res) => {
    try {
        const worker = await Worker.findOneAndDelete({
            workerId: req.params.workerId
        });

        if (!worker) {
            return res.status(404).json({
                message: "Worker not found"
            });
        }

        res.status(200).json({
            message: "Worker deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting worker:", error);

        res.status(500).json({
            message: "Failed to delete worker"
        });
    }
});

module.exports = router;