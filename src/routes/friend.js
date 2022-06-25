const express = require("express");
const {
    getFriendController,
    addFriendController,
    deleteFriendController,
} = require("../controllers/friend/friendController");

const router = express.Router();

router.get("/", getFriendController);

router.delete("/", deleteFriendController);

router.post("/", addFriendController);

module.exports = router;
