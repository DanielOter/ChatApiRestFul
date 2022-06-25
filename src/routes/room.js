const express = require("express");
const {
    getRoomController,
    removeUserFromRoomController,
} = require("../controllers/call/roomController");

const router = express.Router();
router.get("/", getRoomController);
router.put("/removeUser", removeUserFromRoomController);

module.exports = router;
