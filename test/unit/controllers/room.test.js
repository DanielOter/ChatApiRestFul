const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const getFreeRoomStub = sinon.stub();
const removeUserStub = sinon.stub();

const roomServiceStub = {
    getFreeRoom: getFreeRoomStub,
    removeUser: removeUserStub,
};

const { getRoomController, removeUserFromRoomController } = proxyquire(
    "../../../src/controllers/call/roomController",
    {
        "../../services/roomService": roomServiceStub,
    }
);

describe("Test roomController", () => {
    beforeEach(() => {
        getFreeRoomStub.resetHistory();
        removeUserStub.resetHistory();
    });

    it("getRoomController - should return a roomId", async () => {
        const req = "";

        const mockJson = { roomId: "1234" };
        const jsonMock = sinon.stub();

        jsonMock.returns(mockJson);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        const next = "";
        const roomDummy = {
            id_room: "1234",
        };

        getFreeRoomStub.resolves(roomDummy);

        await getRoomController(req, res, next);

        chai.expect(res.status.firstCall.args[0]).to.be.eql(200);
        chai.expect(res.status().json.firstCall.args).to.be.eql([
            { roomId: "1234" },
        ]);
    });

    it("getRoomController - should throw an exception", async () => {
        const req = { body: {} };
        const res = "";
        const next = sinon.stub();

        getFreeRoomStub.throws({
            code: 503,
            status: "ServiceUnavailable",
        });

        await getRoomController(req, res, next);

        chai.expect(next.firstCall.args[0].code).to.be.equal(503);
        chai.expect(next.firstCall.args[0].status).to.be.equal(
            "ServiceUnavailable"
        );
    });

    it("removeUserFromRoomController - should return  200 ok", async () => {
        const roomIdFake = { roomId: "0" };

        const mockJson = {};
        const jsonMock = sinon.stub();

        jsonMock.returns(mockJson);

        const req = { body: roomIdFake };
        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };
        const next = "";

        await removeUserFromRoomController(req, res, next);

        chai.expect(removeUserStub.calledOnce).to.be.true;
        chai.expect(res.status.firstCall.args[0]).to.be.eql(200);
    });

    it("removeUserFromRoomController - should thrown an error", async () => {
        const req = { body: {} };
        const res = "";
        const next = sinon.stub();

        try {
            await removeUserFromRoomController(req, res, next);
        } catch (error) {
            chai.expect(error.message).to.equal("Missing roomId");
            chai.expect(error.status).to.be.eql(400);
            chai.expect(next.calledOnce).to.be.true;
        }
    });
});
