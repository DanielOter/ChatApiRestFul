const express = require("express");
const {
    notFoundController,
} = require("../controllers/common/notFoundController");

const router = express.Router();
router.use("/", notFoundController);

module.exports = router;
