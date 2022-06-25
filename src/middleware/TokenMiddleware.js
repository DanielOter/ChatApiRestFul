const admin = require("../../config/firebase_config");

class TokenMiddleware {
    async decodeToken(req, res, next) {
        try {
            const token = req.headers?.authorization.replace("Bearer ", "");
            await admin.auth().verifyIdToken(token);
            return next();
        } catch (e) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    }
}

module.exports = new TokenMiddleware();
