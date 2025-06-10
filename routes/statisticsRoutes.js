const express = require("express");
const {
  getCollectionOverview
} = require("../controllers/statisticsController");

const router = express.Router();
const auth = require("../middleware/auth");

// Collection overview route
router.get("/collection/overview", auth, getCollectionOverview);

module.exports = router;
