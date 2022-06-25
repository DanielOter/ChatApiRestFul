const roomService = require("../../services/roomService");
const createError = require("http-errors");
const assert = require("assert");

/**
 * @api {get} /room
 * @apiGroup  Room
 * @apiVersion 1.0.0
 * @apiHeader {String} authorization Authorization token
 * @apiSuccessExample {json} 200:OK
 * {
 *      id_room:uuid
 * }
 * @apiSuccess 200 status OK Se devuelve un roomId
 * @apiError 401 status Unauthorized Token no Valido
 * @apiError 500 status Internal server Error error no esperado
 * @apiError 503 status Service Unavailable Error Base de datos
 */

const getRoomController = async (req, res, next) => {
    try {
        const { id_room } = await roomService.getFreeRoom();
        res.status(200).json({ roomId: id_room });
    } catch (error) {
        next(error);
    }
};

/**
 * @api {delete} /removeUser
 * @apiGroup  Room
 * @apiVersion 1.0.0
 * @apiHeader {String} authorization Authorization token
 * @apiHeader {String} nickname  Nickname del usuarios
 * @apiParamExample {json} Request-Example:
 *    {
 *       "roomId": uuid
 *    }
 * @apiSuccessExample {json} 200:OK
 * {
 * }
 * @apiSuccess 200 status OK Se devuelve un roomId
 * @apiError 400 status BadRequest Falta roomId
 * @apiError 401 status Unauthorized Token no Valido
 * @apiError 500 status Internal server Error error no esperado
 * @apiError 503 status Service Unavailable Error Base de datos
 */

const removeUserFromRoomController = async (req, res, next) => {
    try {
        const { roomId } = req?.body;
        assert(roomId, createError.BadRequest("Missing roomId"));
        await roomService.removeUser(roomId);
        res.status(200).json({});
    } catch (error) {
        next(error);
    }
};

module.exports = { getRoomController, removeUserFromRoomController };
