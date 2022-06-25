const errorHandlerMiddleware = (err, req, res, next) => {
    const error = {
        status: err.status ? err.status : 500,
        message:
            err.message && err.status != 500
                ? err.message
                : "Internal Server Error",
    };

    res.status(error.status).json(error);
};

module.exports = {
    errorHandlerMiddleware,
};
