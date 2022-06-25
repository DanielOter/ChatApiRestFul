const { decodeToken } = require("./middleware/TokenMiddleware");
const { bindRoutes } = require("./routes/index");
const { removeUserFromRoom, deleteRoom } = require("./database/repository");
const express = require("express");
const cors = require("cors");
const { insertUser, createDatabase } = require("./database/repository");
const {
    errorHandlerMiddleware,
} = require("./middleware/errorHandlerMiddleware");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
});

const port = 8081;

app.use(cors());

app.use("/documentation", express.static("doc"));

const runDataBase = async () => {
    await createDatabase();
    await insertUser({ email: "usuario1@gmail.com", nickname: "usuario1" });
};

runDataBase();

io.on("connection", (socket) => {
    let liveRoom = undefined;
    socket.on("login", (roomId) => {
        liveRoom = roomId;
        socket.join(roomId);
        console.log(`someone conected with id ${socket.id}, room:${roomId}`);
    });

    socket.on("nextRoom", (newRoom) => {
        console.log("The client asked for a new room");
        socket.leave(room);
        socket.join(newRoom);
        liveRoom = newRoom;
    });

    socket.on("chat message", (msg, room) => {
        console.log(msg);
        io.to(room).emit("chat", msg);
    });

    socket.on("disconnecting", async () => {
        console.log("room ", liveRoom, " disconnected");
        if (liveRoom) {
            const room = await removeUserFromRoom(liveRoom);
            console.log(room);
            if (room.cantUsers === 0) {
                deleteRoom(liveRoom);
                liveRoom = undefined;
            }
        }
    });
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(decodeToken);

bindRoutes(app);

app.use(errorHandlerMiddleware);

server.listen(port, () => console.log(`Listening on http://${port}/`));

module.exports = server;
