const signInRouter = require("./signIn");
const notFoundRouter = require("./notFound");
const healthRouter = require("./health");
const roomRouter = require("./room");
const friendRouter = require("./friend");

const bindRoutes = (app) => {
    app.use("/api/friend", friendRouter);
    app.use("/api/health", healthRouter);
    app.use("/api/signin", signInRouter);
    app.use("/api/room", roomRouter);
    app.use("*", notFoundRouter);
};

module.exports = { bindRoutes };
