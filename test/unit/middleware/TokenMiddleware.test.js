const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const proxyquire = require("proxyquire");
const sinon = require("sinon");

const verifyIdTokenStub = sinon.stub();

const adminStub = {
    auth: sinon.fake.returns({
        verifyIdToken: verifyIdTokenStub,
    }),
};

const dummyValidToken = "Valid token";

const dummyFakeToken = "Fake token";

const { decodeToken } = proxyquire("../../../src/middleware/TokenMiddleware", {
    "../../config/firebase_config": adminStub,
});

describe("Test class TokenMiddleware function decodeToken", () => {
    beforeEach(() => {
        verifyIdTokenStub.resetHistory();
    });

    it("Should return 401 when no token is given", async () => {
        const mockJson = { message: "Unauthorized" };

        const req = {
            headers: {
                authorization: "",
            },
        };

        const next = sinon.stub();

        const jsonMock = sinon.stub();

        jsonMock.returns(mockJson);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        verifyIdTokenStub.rejects("Custom Error");

        try {
            await decodeToken(req, res, next);
        } catch (error) {
            chai.expect(res.status.firstCall.args).to.be.eql([401]);
            chai.expect(mockJson.firstCall.args).to.be.eql([
                { message: "Unauthorized" },
            ]);
            chai.expect(next.callCount).to.be.eql(0);
            chai.expect(verifyIdTokenStub.callCount).to.be.eql(1);
        }
    });

    it("Should return 401 with invalid token", async () => {
        const mockJson = { message: "Unauthorized" };

        const req = {
            headers: {
                authorization: dummyFakeToken,
            },
        };

        const next = sinon.stub();

        const jsonMock = sinon.stub();

        jsonMock.returns(mockJson);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        verifyIdTokenStub.withArgs(dummyFakeToken).rejects("Custom Error 2");

        try {
            await decodeToken(req, res, next);
        } catch (error) {
            chai.expect(res.status.firstCall.args).to.be.eql([401]);
            chai.expect(mockJson.firstCall.args).to.be.eql([
                { message: "Unauthorized" },
            ]);
            chai.expect(next.callCount).to.be.eql(0);
            chai.expect(verifyIdTokenStub.callCount).to.be.eql(1);
        }
    });

    it("Should call next with valid token ", async () => {
        const req = {
            headers: {
                authorization: dummyValidToken,
            },
        };

        const next = sinon.stub();

        const res = sinon.stub();

        verifyIdTokenStub.withArgs(dummyValidToken).resolves(true);

        await decodeToken(req, res, next);

        chai.expect(verifyIdTokenStub.callCount).to.be.eql(1);
        chai.expect(next.callCount).to.be.eql(1);
    });
});
