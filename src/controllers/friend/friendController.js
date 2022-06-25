const { tokenDecoder } = require("../../libs/tokenDecoder");
const friendService = require("../../services/friendService");
const createError = require("http-errors");
const assert = require("assert");

/**
 * @api {get} /friend
 * @apiGroup  Friend
 * @apiVersion 1.0.0
 * @apiHeader {String} authorization Authorization token
 * @apiParamExample {json} Request-Example:
 *    {
 *       "friends": [nickname:'juan']
 *    }
 * @apiSuccessExample {json} 200:OK
 * {
 * }
 * @apiSuccess 200 status OK Se devuelve un array amigos
 * @apiError 401 status Unauthorized Token no Valido
 * @apiError 500 status Internal server Error error no esperado
 * @apiError 503 status Service Unavailable Error Base de datos
 */

const getFriendController = async (req, res, next) => {
    try {
        const token = req.headers?.authorization.replace("Bearer ", "");
        const { email } = await tokenDecoder(token);

        const friends = await friendService.getFriends(email);

        res.status(200).json({
            friends,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @api {delete} /friend
 * @apiGroup  Friend
 * @apiVersion 1.0.0
 * @apiHeader {String} authorization Authorization token
 * @apiHeader {String} emailFriend Email del amigo a eliminar
 * @apiParamExample {json} Request-Example:
 *    {
 *       "emailFriend":'juandubie@gmail.com'
 *    }
 * @apiSuccessExample {json} 200:OK
 * {
 * }
 * @apiSuccess 200 status OK
 * @apiError 400 status Bad Request Falta email de amigo
 * @apiError 401 status Unauthorized Token no Valido
 * @apiError 500 status Internal server Error error no esperado
 * @apiError 503 status Service Unavailable Error Base de datos
 */

const deleteFriendController = async (req, res, next) => {
    try {
        const token = req.headers?.authorization.replace("Bearer ", "");
        const { email } = await tokenDecoder(token);
        const { emailFriend } = req?.body;
        assert(emailFriend, createError.BadRequest("Missing friend email"));

        if (email === emailFriend)
            throw createError.BadRequest(
                "You can't delete yourself as a friend"
            );

        await friendService.deleteFriendship({
            emailUserA: email,
            emailUserB: emailFriend,
        });
        res.status(200).json({});
    } catch (error) {
        console.log(error);
        next(error);
    }
};

/**
 * @api {post} /friend
 * @apiGroup  Friend
 * @apiVersion 1.0.0
 * @apiHeader {String} authorization Authorization token
 * @apiHeader {String} emailFriend Email del amigo a eliminar
 * @apiParamExample {json} Request-Example:
 *    {
 *       "emailFriend":'juandubie@gmail.com'
 *    }
 * @apiSuccessExample {json} 201:Created
 * {
 * }
 * @apiSuccess 201 status Created
 * @apiError 400 status Bad Request Falta email de amigo
 * @apiError 400 status Bad Request Los emails no pueden ser iguales
 * @apiError 401 status Unauthorized Token no Valido
 * @apiError 500 status Internal server Error error no esperado
 * @apiError 503 status Service Unavailable Error Base de datos
 */

const addFriendController = async (req, res, next) => {
    try {
        const token = req.headers?.authorization.replace("Bearer ", "");
        const { email } = await tokenDecoder(token);

        const emailFriend = req.body?.emailFriend;

        if (emailFriend === undefined)
            throw createError.BadRequest("Missing email friend");

        if (email === emailFriend)
            throw createError.BadRequest("You can't add yourself as a friend");

        await friendService.newFriend({ email, emailFriend });

        res.status(201).json({
            message: "Created",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getFriendController,
    addFriendController,
    deleteFriendController,
};
