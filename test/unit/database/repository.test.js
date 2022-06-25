const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const runStub = sinon.stub();
const getStub = sinon.stub();
const allStub = sinon.stub();
const execStub = sinon.stub();

const databaseStub = {
    getInstance: sinon.fake.resolves({
        run: runStub,
        get: getStub,
        all: allStub,
        exec: execStub,
    }),
};

const {
    insertRoom,
    getRoom,
    freeRoom,
    addUserToRoom,
    removeUserFromRoom,
    deleteRoom,
    createDatabase,
    insertUser,
    addFriend,
    deleteFriend,
    getFriendsList,
    getUser,
    checkFriendship,
} = proxyquire("../../../src/database/repository", {
    "./databaseSingleton": databaseStub,
});

describe("Repository database functions", async () => {
    const fakeUser = {
        id_user: 1,
        email: "example@gmail.com",
        nickname: "example",
    };
    const fakeErrorMessage = "Error";
    const fakeFriendList = [
        { nickname: "nickname1" },
        { nickname: "nickname2" },
    ];

    beforeEach(() => {
        runStub.resetHistory();
        allStub.resetHistory();
        databaseStub.getInstance.resetHistory();
    });

    it("Should execute create database transaction", async () => {
        execStub.resolves({});

        await createDatabase();

        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
        chai.expect(execStub.calledOnce).to.be.true;
    });

    it("Should not execute create database transaction, must throw Service unavailable Error", async () => {
        try {
            execStub.throws({ message: fakeErrorMessage });
            await createDatabase();
        } catch (error) {
            chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
            chai.expect(execStub.calledOnce).to.be.false;
            chai.expect(error.message).to.be.eql("Service Unavailable");
        }
    });

    it("Should insert a new user into the database", async () => {
        runStub
            .withArgs(
                `INSERT INTO user (email,nickname) VALUES ('${fakeUser.email}','${fakeUser.nickname}')`
            )
            .resolves();
        await insertUser(fakeUser.email, fakeUser.nickname);

        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
        chai.expect(runStub.calledOnce).to.be.true;
    });

    it("Should not insert a new user into the database and run method should not be called", async () => {
        try {
            runStub
                .withArgs(
                    `INSERT INTO user (email,nickname) VALUES ('${fakeUser.email}','${fakeUser.nickname}')`
                )
                .rejects();
            await insertUser(fakeUser.email, fakeUser.nickname);
        } catch (error) {
            chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
            chai.expect(runStub.calledOnce).to.be.false;
        }
    });

    it("Should get an user", async () => {
        allStub
            .withArgs(`SELECT * FROM user where email = '${fakeUser.email}'`)
            .resolves(fakeUser);
        const result = await getUser(fakeUser);

        chai.expect(result).to.be.equal(fakeUser);
        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
        chai.expect(allStub.calledOnce).to.be.true;
    });

    it("Should get an empty user", async () => {
        allStub
            .withArgs(`SELECT * FROM user where email = '${fakeUser.email}'`)
            .resolves([]);
        const result = await getUser(fakeUser);

        chai.expect(result).to.be.eql([]);
        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
        chai.expect(allStub.calledOnce).to.be.true;
    });
    it("Should get a friend list from an user email", async () => {
        const resultSet = [fakeUser];
        allStub
            .withArgs(`SELECT * FROM user where email = '${fakeUser.email}'`)
            .resolves(resultSet);
        allStub.resolves(fakeFriendList);

        const result = await getFriendsList(fakeUser);

        chai.expect(result).to.be.eql(fakeFriendList);
        chai.expect(databaseStub.getInstance.calledTwice).to.be.true;
        chai.expect(allStub.calledTwice).to.be.true;
    });
    it("Should check wether or not two users are friends, returns a register in case they are", async () => {
        const fakeFriendship = [
            { id_friend: 1 },
            { id_userA: 1 },
            { id_userB: 2 },
        ];
        const id_userA = 1;
        const id_userB = 2;

        allStub.resolves(fakeFriendship);

        const result = await checkFriendship({
            id_user: id_userA,
            friendId: id_userB,
        });

        chai.expect(result).to.be.equal(fakeFriendship);
        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
        chai.expect(allStub.calledOnce).to.be.true;
    });
    it("Should insert a friend register ", async () => {
        const parameters = { id_user: 1, friendId: 2 };
        const userA = {
            id_user: 1,
            email: "example@gmail.com",
            nickname: "nick1",
        };
        const userB = {
            id_user: 2,
            email: "example2@gmail.com",
            nickname: "nick2",
        };

        runStub
            .withArgs(
                `INSERT INTO friend (id_userA,id_userB) VALUES ('${userA.id_user}','${userB.id_user}')`
            )
            .resolves(true);

        await addFriend(parameters);

        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
        chai.expect(runStub.calledOnce).to.be.true;
    });
    it("Should delete two friend register given two emails", async () => {
        const parameters = {
            emailUserA: "example@gmail.com",
            emailUserB: "example2@gmail.com",
        };
        const userA = {
            id_user: 1,
            email: "example@gmail.com",
            nickname: "nick1",
        };
        const userB = {
            id_user: 2,
            email: "example2@gmail.com",
            nickname: "nick2",
        };

        allStub
            .withArgs(
                `SELECT id_user FROM user WHERE email = '${parameters.emailUserA}'`
            )
            .resolves([userA]);

        allStub
            .withArgs(
                `SELECT id_user FROM user WHERE email = '${parameters.emailUserB}'`
            )
            .resolves([userB]);

        runStub
            .withArgs(
                `DELETE FROM friend WHERE id_userA = ${userA.id_user} AND id_userB = ${userB.id_user}`
            )
            .resolves(true);
        runStub
            .withArgs(
                `DELETE FROM friend WHERE id_userA = ${userB.id_user} AND id_userB = ${userA.id_user}`
            )
            .resolves(true);

        await deleteFriend(parameters);

        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
        chai.expect(allStub.calledTwice).to.be.true;
        chai.expect(runStub.calledTwice).to.be.true;
    });
});

describe("Repository room query functions", async () => {
    beforeEach(() => {
        runStub.resetHistory();
        getStub.resetHistory();
        databaseStub.getInstance.resetHistory();
    });

    it("should insert a room into the database and return it", async () => {
        const roomFake = { id_room: "uuid", cantUsers: 1 };

        runStub
            .withArgs(
                `INSERT INTO "rooms" (id_room,cantUsers) VALUES ("${roomFake.id_room}","${roomFake.cantUsers}")`
            )
            .resolves(true);
        getStub
            .withArgs(
                `SELECT * FROM "rooms" WHERE id_room ="${roomFake.id_room}"`
            )
            .resolves(roomFake);
        const result = await insertRoom(roomFake.id_room, roomFake.cantUsers);

        chai.expect(result).to.be.eql(roomFake);
        chai.expect(databaseStub.getInstance.calledTwice).to.be.true;
    });

    it("should get a room from the database and return it", async () => {
        const roomFake = { id_room: "uuid", cantUsers: 1 };

        getStub
            .withArgs(
                `SELECT * FROM "rooms" WHERE id_room ="${roomFake.id_room}"`
            )
            .resolves(roomFake);
        const result = await getRoom(roomFake.id_room);

        chai.expect(result).to.be.eql(roomFake);
        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
    });

    it("should get a free room from the database and return it", async () => {
        const roomFake = { id_room: "uuid", cantUsers: 1 };

        getStub
            .withArgs(`SELECT * FROM "rooms" WHERE cantUsers < 2`)
            .resolves(roomFake);
        const result = await freeRoom();

        chai.expect(result).to.be.eql(roomFake);
        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
    });

    it("should add 1 user from a room in the database and return the modified result", async () => {
        const roomFake = { id_room: "uuid", cantUsers: 1 };

        runStub
            .withArgs(
                `UPDATE "rooms" SET "cantUsers" = "cantUsers" + 1 WHERE id_room = "${roomFake.id_room}"`
            )
            .resolves(true);
        getStub
            .withArgs(
                `SELECT * FROM "rooms" WHERE id_room ="${roomFake.id_room}"`
            )
            .resolves(roomFake);
        const result = await addUserToRoom(roomFake.id_room);

        chai.expect(result).to.be.eql(roomFake);
        chai.expect(databaseStub.getInstance.calledTwice).to.be.true;
    });

    it("should remove 1 user from a room in the database and return the modified result", async () => {
        const roomFake = { id_room: "uuid", cantUsers: 1 };

        runStub
            .withArgs(
                `UPDATE "rooms" SET "cantUsers" = "cantUsers" - 1 WHERE id_room = "${roomFake.id_room}"`
            )
            .resolves(true);
        getStub
            .withArgs(
                `SELECT * FROM "rooms" WHERE id_room ="${roomFake.id_room}"`
            )
            .resolves(roomFake);
        const result = await removeUserFromRoom(roomFake.id_room);

        chai.expect(result).to.be.eql(roomFake);
        chai.expect(databaseStub.getInstance.calledTwice).to.be.true;
    });

    it("should delete a room from the database", async () => {
        const roomFake = { id_room: "uuid", cantUsers: 1 };

        runStub
            .withArgs(
                `DELETE FROM "rooms" WHERE "id_room" = "${roomFake.id_room}"`
            )
            .resolves(true);

        const result = await deleteRoom(roomFake.id_room);

        chai.expect(result).to.be.eql(true);
        chai.expect(databaseStub.getInstance.calledOnce).to.be.true;
    });
});
