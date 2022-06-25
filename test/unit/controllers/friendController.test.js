const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const createError = require("http-errors");

const tokenDecoderStub = sinon.fake.resolves({ email: "fake@gmail.com" });

const getStub = sinon.stub();
const newStub = sinon.stub();
const deleteFriendshipStub = sinon.stub();
const dummyToken = "Token";

const { getFriendController, addFriendController, deleteFriendController } =
    proxyquire("../../../src/controllers/friend/friendController", {
        "../../services/friendService": {
            getFriends: getStub,
            newFriend: newStub,
            deleteFriendship: deleteFriendshipStub,
        },
        "../../libs/tokenDecoder": { tokenDecoder: tokenDecoderStub },
    });

describe("Test friendController", () => {
    beforeEach = () => {
        getStub.resetHistory();
        newStub.resetHistory();
        deleteFriendshipStub.resetHistory();
    };

    it("friendController - should return a 200 for deleteFriendController", async () => {
        const parameters = {
            emailUserA: "fake@gmail.com",
            emailUserB: "fake2@gmail.com",
        };
        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {
                emailFriend: "fakefriend@gmail.com",
            },
        };

        const jsonMock = sinon.stub();
        jsonMock.returns({});

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        const next = sinon.stub();

        deleteFriendshipStub.withArgs(parameters).resolves(true);

        await deleteFriendController(req, res, next);

        chai.expect(res.status.firstCall.args[0]).to.be.eql(200);
        chai.expect(tokenDecoderStub.called).to.be.true;
        chai.expect(res.status().json.firstCall.args[0]).to.be.eql({});
    });
    it("friendController - should return Missing friend email Error for deleteFriendController", async () => {
        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {},
        };

        const res = "";

        const next = sinon.stub();

        await deleteFriendController(req, res, next);

        chai.expect(next.firstCall.args[0].status).to.be.eql(400);
        chai.expect(tokenDecoderStub.called).to.be.true;
        chai.expect(next.firstCall.args[0].message).to.be.eql(
            "Missing friend email"
        );
    });
    it("friendController - should return You cant delete yourself as a friend Error for deleteFriendController", async () => {
        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {
                emailFriend: "fake@gmail.com",
            },
        };
        const res = "";

        const next = sinon.stub();

        await deleteFriendController(req, res, next);

        chai.expect(next.firstCall.args[0].status).to.be.eql(400);
        chai.expect(tokenDecoderStub.called).to.be.true;
        chai.expect(next.firstCall.args[0].message).to.be.eql(
            "You can't delete yourself as a friend"
        );
    });
    it("friendController - should return a 200 for getFriendController", async () => {
        const email = "fake@gmail.com";
        const req = {
            headers: {
                authorization: dummyToken,
            },
        };

        const next = "";

        const friendsArray = [{}];
        getStub.withArgs(email).resolves(friendsArray);

        const jsonMock = sinon.stub();
        jsonMock.returns(friendsArray);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };
        await getFriendController(req, res, next);

        chai.expect(res.status.firstCall.args[0]).to.be.eql(200);
        chai.expect(res.status().json.firstCall.args[0]).to.be.eql({
            friends: [{}],
        });
    });

    it("friendController - rejected", async () => {
        const email = "fake@gmail.com";
        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {},
        };

        const res = "";
        const next = sinon.stub();

        getStub.withArgs(email).throws({
            code: 503,
            status: "ServiceUnavailable",
        });

        await getFriendController(req, res, next);

        chai.expect(next.firstCall.args[0].code).to.be.equal(503);
        chai.expect(next.firstCall.args[0].status).to.be.equal(
            "ServiceUnavailable"
        );
        chai.expect(next.calledOnce).to.be.true;
    });

    it("friendController - should fail for undefined friend", async () => {
        const email = "fake@gmail.com";

        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {},
        };

        const next = sinon.stub();
        const res = "";

        await addFriendController(req, res, next);
        chai.expect(next.firstCall.args[0].message).to.be.eql(
            "Missing email friend"
        );
        chai.expect(next.firstCall.args[0].status).to.be.eql(400);
    });

    it("friendController - should fail for selfFriendship", async () => {
        const email = "fake@gmail.com";
        const emailFriend = "fake@gmail.com";

        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {
                emailFriend,
            },
        };

        const next = sinon.stub();
        const res = "";

        await addFriendController(req, res, next);

        chai.expect(next.firstCall.args[0].message).to.be.eql(
            "You can't add yourself as a friend"
        );
        chai.expect(next.firstCall.args[0].status).to.be.eql(400);
    });

    it("friendController - should return a 200 for getFriendController", async () => {
        const email = "fake@gmail.com";
        const emailFriend = "fake2@gmail.com";
        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {
                emailFriend,
            },
        };

        newStub.withArgs({ email, emailFriend }).true;

        const next = sinon.stub();
        const message = "Created";
        const jsonMock = sinon.stub();
        jsonMock.returns(message);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };
        await addFriendController(req, res, next);

        chai.expect(res.status.firstCall.args[0]).to.be.eql(201);
        chai.expect(res.status().json.firstCall.args[0]).to.be.eql({
            message: "Created",
        });
    });
});
