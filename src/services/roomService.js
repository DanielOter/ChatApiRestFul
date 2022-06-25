const { generateUUID } = require("../libs/generateUUID");
const {
    insertRoom,
    freeRoom,
    addUserToRoom,
    removeUserFromRoom,
    deleteRoom,
} = require("../database/repository");

class RoomService {
    async getFreeRoom() {
        let room = await freeRoom();
        if (room === undefined) {
            const uuid = generateUUID();
            room = await insertRoom(uuid, 1);
        } else {
            room = await addUserToRoom(room.id_room);
        }
        return room;
    }

    async removeUser(roomId) {
        let room = await removeUserFromRoom(roomId);
        if (room && room.cantUsers === 0) {
            await deleteRoom(roomId);
        }
    }
}

module.exports = new RoomService();
