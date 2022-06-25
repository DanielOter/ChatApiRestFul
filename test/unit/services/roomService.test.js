const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const uuidFake = "uuid";

const insertRoomStub = sinon.stub();
const freeRoomStub = sinon.stub();
const addUserToRoomStub = sinon.stub();
const removeUserFromRoomStub = sinon.stub();
const deleteRoomStub = sinon.stub();
const generateUUDIStub = sinon.fake.returns(uuidFake);

const roomService = proxyquire("../../../src/services/roomService", {
    "../database/repository": {
        insertRoom: insertRoomStub,
        freeRoom: freeRoomStub,
        addUserToRoom: addUserToRoomStub,
        removeUserFromRoom: removeUserFromRoomStub,
        deleteRoom: deleteRoomStub,
    },
    "../libs/generateUUID": {
        generateUUID: generateUUDIStub,
    },
});

describe("Test roomService", async () => {
    beforeEach(() => {
        insertRoomStub.resetHistory();
        freeRoomStub.resetHistory();
        addUserToRoomStub.resetHistory();
        removeUserFromRoomStub.resetHistory();
        deleteRoomStub.resetHistory();
    });

    describe("getFreeRoom()", async () => {
        it("Should create a room and return it", async () => {
            const roomFake = { id_room: uuidFake, cantUser: 1 };

            freeRoomStub.resolves(undefined);
            insertRoomStub.withArgs(uuidFake, 1).resolves(roomFake);

            const result = await roomService.getFreeRoom();

            chai.expect(freeRoomStub.calledOnce).to.be.true;
            chai.expect(insertRoomStub.calledOnce).to.be.true;
            chai.expect(addUserToRoomStub.notCalled).to.be.true;
            chai.expect(result).to.be.eql(roomFake);
        });

        it("should get a room and add a user to it", async () => {
            const roomFake = { id_room: uuidFake, cantUser: 1 };

            freeRoomStub.resolves(roomFake);
            addUserToRoomStub.withArgs(roomFake.id_room).resolves(roomFake);

            const result = await roomService.getFreeRoom();

            chai.expect(freeRoomStub.calledOnce).to.be.true;
            chai.expect(insertRoomStub.notCalled).to.be.true;
            chai.expect(addUserToRoomStub.calledOnce).to.be.true;
            chai.expect(result).to.be.eql(roomFake);
        });
    });

    describe("removeUser()", async () => {
        const roomFake = { id_room: uuidFake, cantUsers: 0 };
        it("Should remove a user from a room and delete it if cantUsers is = 0", async () => {
            removeUserFromRoomStub
                .withArgs(roomFake.id_room)
                .resolves(roomFake);

            await roomService.removeUser(roomFake.id_room);

            chai.expect(removeUserFromRoomStub.calledOnce).to.be.true;
            chai.expect(deleteRoomStub.calledOnce).to.be.true;
        });

        it("Should remove a user from a room", async () => {
            roomFake.cantUsers = 1;

            removeUserFromRoomStub
                .withArgs(roomFake.id_room)
                .resolves(roomFake);

            await roomService.removeUser(roomFake.id_room);

            chai.expect(removeUserFromRoomStub.calledOnce).to.be.true;
            chai.expect(deleteRoomStub.notCalled).to.be.true;
        });
    });
});
