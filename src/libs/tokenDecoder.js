const admin = require("../../config/firebase_config");
const tokenDecoder = async (token) => admin.auth().verifyIdToken(token);
module.exports = { tokenDecoder };
