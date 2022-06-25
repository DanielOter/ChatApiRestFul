/**
 * @api {get} /*
 * @apiGroup  Not Found
 * @apiVersion 1.0.0
 * @apiHeader {String} authorization Authorization token
 * @apiSuccessExample {json} 200:OK
 * {
 * }
 * @apiSuccess 200 status OK
 * @apiError 401 status Unauthorized Token no Valido
 */

const notFoundController = (req, res, next) =>
    res.status(404).json({ message: "Route not found" });

module.exports = { notFoundController };
