const express = require("express");
const { healthController } = require("../controllers/common/healthController");

const router = express.Router();
router.use("/", healthController);

module.exports = router;
