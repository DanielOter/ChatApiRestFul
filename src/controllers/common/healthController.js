/**
 * @api {get} /health
 * @apiGroup  Health
 * @apiVersion 1.0.0
 * @apiHeader {String} authorization Authorization token
 * @apiSuccessExample {json} 200:OK
 * {
 * }
 * @apiSuccess 200 status OK
 * @apiError 401 status Unauthorized Token no Valido
 */

const healthController = (req, res, next) =>
    res.status(200).json({ message: "OK" });

module.exports = { healthController };
