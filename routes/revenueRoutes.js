const express = require("express");
const { getRevenueStatistics } = require("../controllers/revenueController");

const router = express.Router();

router.get("/revenue", getRevenueStatistics);

module.exports = router;
