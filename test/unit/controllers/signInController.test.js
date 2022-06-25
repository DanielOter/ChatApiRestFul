const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const tokenDecoderStub = sinon.fake.resolves({ email: "fake@gmail.com" });

const signInServiceStub = sinon.stub();

const { signInController } = proxyquire(
    "../../../src/controllers/authentication/signInController",
    {
        "../../libs/tokenDecoder": { tokenDecoder: tokenDecoderStub },
        "../../services/signInService": { signInService: signInServiceStub },
    }
);

const dummyToken = "Token";

describe("Test signInController", () => {
    beforeEach(() => {
        signInServiceStub.resetHistory();
    });

    it("signInController - should return a 200 when user is already created", async () => {
        const serviceResponse = {
            message: "Ok",
            status: 200,
        };

        const email = "fake@gmail.com";
        const nickname = "fakeNickName";

        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {
                nickname,
            },
        };

        const mockJson = { message: "Ok" };

        const jsonMock = sinon.stub();

        jsonMock.returns(mockJson);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        const next = "";

        signInServiceStub
            .withArgs({ email, nickname })
            .resolves(serviceResponse);

        await signInController(req, res, next);

        chai.expect(res.status.firstCall.args[0]).to.be.eql(200);
        chai.expect(res.status().json.firstCall.args).to.be.eql([
            { message: "Ok" },
        ]);
    });

    it("signInController - should return a 201 when user is created", async () => {
        const serviceResponse = {
            message: "Created",
            status: 201,
        };

        const email = "fake@gmail.com";
        const nickname = "fakeNickName";

        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {
                nickname,
            },
        };

        const mockJson = { message: "Created" };

        const jsonMock = sinon.stub();

        jsonMock.returns(mockJson);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        const next = "";

        signInServiceStub
            .withArgs({ email, nickname })
            .resolves(serviceResponse);

        await signInController(req, res, next);

        chai.expect(res.status.firstCall.args[0]).to.be.eql(201);
        chai.expect(res.status().json.firstCall.args).to.be.eql([
            { message: "Created" },
        ]);
    });

    it("signInController - should return a 400 Bad Request", async () => {
        const req = {
            headers: {
                authorization: dummyToken,
            },
            body: {},
        };

        const mockJson = { message: "Created" };

        const jsonMock = sinon.stub();

        jsonMock.returns(mockJson);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        const next = sinon.stub();

        try {
            signInController(req, res, next);
        } catch (error) {
            chai.expect(res.status.firstCall.args[0]).to.be.eql(400);
            chai.expect(res.status().json.firstCall.args).to.be.eql([
                { message: "Missing nickname" },
            ]);
            chai.expect(next.callCount).eql(1);
        }
    });
});
