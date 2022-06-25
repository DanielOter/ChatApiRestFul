const assert = require("assert");
const createError = require("http-errors");
const { tokenDecoder } = require("../../libs/tokenDecoder");
const { signInService } = require("../../services/signInService");

/**
 * @api {post} /signin
 * @apiGroup  authentication
 * @apiVersion 1.0.0
 * @apiHeader {String} authorization Authorization token
 * @apiHeader {String} nickname  Nickname del usuarios
 * @apiParamExample {json} Request-Example:
 *    {
 *       "nick": juancho
 *    }
 * @apiSuccessExample {json} 200:OK
 * {
 * }
 * @apiSuccessExample {json} 201:Created
 * {
 * }
 * @apiSuccess 200 status OK Ya existe el usuario en la bade de datos
 * @apiSuccess 201 status Created Se crea un usuario en la basde de datos
 * @apiError 400 status Bad Request Falta nickname
 * @apiError 401 status Unauthorized Token no Valido
 * @apiError 500 status Internal server Error error no esperado
 * @apiError 503 status Service Unavailable Error Base de datos
 */

const signInController = async (req, res, next) => {
    try {
        const token = req.headers?.authorization.replace("Bearer ", "");
        const { email } = await tokenDecoder(token);
        const { nickname } = req?.body;
        assert(nickname, createError.BadRequest("Missing nickname"));
        const { status, message } = await signInService({ email, nickname });
        res.status(status).json({ message });
    } catch (error) {
        next(error);
    }
};

module.exports = { signInController };
