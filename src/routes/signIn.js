const express = require("express");
const {
    signInController,
} = require("../controllers/authentication/signInController");

const router = express.Router();
router.post("/", signInController);

module.exports = router;
