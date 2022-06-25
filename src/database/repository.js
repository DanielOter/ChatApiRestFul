const createError = require("http-errors");
const database = require("./databaseSingleton");

const createDatabase = async () => {
    const db = await database.getInstance();
    try {
        await db.exec(
            `BEGIN;
                    CREATE TABLE "user" (
                        "id_user" INTEGER PRIMARY KEY AUTOINCREMENT,
                        "email" TEXT(255),
                        "nickname" TEXT(255)
                    );
                    CREATE TABLE friend (
                        id_friend INTEGER PRIMARY KEY AUTOINCREMENT,
                        id_userA INTEGER,
                        id_userB INTEGER
                    );
                    CREATE TABLE "rooms" (
                      "id_room" TEXT(255) PRIMARY KEY,
                      "cantUsers" INTEGER
                    );
                    INSERT INTO user (email, nickname) VALUES ('emailfake2@gmail.com', 'u');
                    INSERT INTO user (email, nickname) VALUES ('v@gmail.com', 'v');
                    INSERT INTO user (email, nickname) VALUES ('l@gmail.com', 'l');
                    INSERT INTO friend (id_userA, id_userB) VALUES(1,2);
                    INSERT INTO friend (id_userA, id_userB) VALUES(2,1);

                    INSERT INTO friend (id_userA, id_userB) VALUES(1,3);
                    INSERT INTO friend (id_userA, id_userB) VALUES(3,1);            
                COMMIT;`
        );
    } catch (e) {
        throw new createError.ServiceUnavailable();
    }
};

const getUser = async ({ email }) => {
    const db = await database.getInstance();
    return db.all(`SELECT * FROM user where email = '${email}'`);
};
const insertUser = async ({ email, nickname }) => {
    const db = await database.getInstance();
    await db.run(
        `INSERT INTO user (email,nickname) VALUES ('${email}','${nickname}')`
    );
};

//Trae los nickname de los amigos dado un nick de usuario
const getFriendsList = async ({ email }) => {
    const db = await database.getInstance();
    const user = await getUser({ email });
    //const {id_user} = user[0]

    const { id_user } = user[0];

    const result = await db.all(`SELECT u.nickname
                              FROM user u
                              INNER JOIN friend f
                              ON u.id_user = f.id_userA  
                              WHERE f.id_userB = ${user[0].id_user}
                              `);
    return result;
};

const checkFriendship = async ({ id_user, friendId }) => {
    const db = await database.getInstance();

    const amistad = await db.all(`SELECT * FROM  friend 
                                  WHERE id_userA = '${id_user}'
                                  and id_userB = '${friendId}'
                                  `);
    return amistad;
};

const addFriend = async ({ id_user, friendId }) => {
    const db = await database.getInstance();
    await db.run(
        `INSERT INTO friend (id_userA,id_userB) VALUES ('${id_user}','${friendId}')`
    );
};

const deleteFriend = async ({ emailUserA, emailUserB }) => {
    const db = await database.getInstance();

    //Consulto los ids de ambos para hacer el DELETE
    const userA = await db.all(
        `SELECT id_user FROM user WHERE email = '${emailUserA}'`
    );
    const userB = await db.all(
        `SELECT id_user FROM user WHERE email = '${emailUserB}'`
    );

    //Aislo los ids para hacer el DELETE
    const { id_user: id_userA } = userA[0];
    const { id_user: id_userB } = userB[0];

    //Realizo el DELETE con los ids obtenidos previamente
    await db.run(
        `DELETE FROM friend WHERE id_userA = ${id_userA} AND id_userB = ${id_userB}`
    );
    await db.run(
        `DELETE FROM friend WHERE id_userA = ${id_userB} AND id_userB = ${id_userA}`
    );
};

const insertRoom = async (roomId, cantUsers) => {
    const db = await database.getInstance();
    const aux = await db.run(
        `INSERT INTO "rooms" (id_room,cantUsers) VALUES ("${roomId}","${cantUsers}")`
    );
    return await getRoom(roomId);
};

const getRoom = async (roomId) => {
    const db = await database.getInstance();
    return await db.get(`SELECT * FROM "rooms" WHERE id_room ="${roomId}"`);
};

const freeRoom = async () => {
    const db = await database.getInstance();
    return await db.get(`SELECT * FROM "rooms" WHERE cantUsers < 2`);
};

const addUserToRoom = async (roomId) => {
    const db = await database.getInstance();
    await db.run(
        `UPDATE "rooms" SET "cantUsers" = "cantUsers" + 1 WHERE id_room = "${roomId}"`
    );
    return await getRoom(roomId);
};

const removeUserFromRoom = async (roomId) => {
    const db = await database.getInstance();
    await db.run(
        `UPDATE "rooms" SET "cantUsers" = "cantUsers" - 1 WHERE id_room = "${roomId}"`
    );
    return await getRoom(roomId);
};

const deleteRoom = async (roomId) => {
    const db = await database.getInstance();
    const result = await db.run(
        `DELETE FROM "rooms" WHERE "id_room" = "${roomId}"`
    );
    return result;
};

module.exports = {
    createDatabase,
    insertUser,
    addFriend,
    deleteFriend,
    getFriendsList,
    getUser,
    insertRoom,
    getRoom,
    freeRoom,
    addUserToRoom,
    removeUserFromRoom,
    deleteRoom,
    checkFriendship,
};
