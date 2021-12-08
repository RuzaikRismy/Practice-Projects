const express = require("express");
const router = express.Router();
const { getPrivateData } = require("../controllers/private");
const { protect } = require("../middleware/auth");

// The reason for put protect front getPrivateData, then route became private.That's mean it safe wise security.No one can access without token
router.route("/").get(protect, getPrivateData);


module.exports = router;