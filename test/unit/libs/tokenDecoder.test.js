const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const verifyIdTokenStub = sinon.stub();

const adminStub = {
    auth: sinon.fake.returns({
        verifyIdToken: verifyIdTokenStub,
    }),
};

const { tokenDecoder } = proxyquire("../../../src/libs/tokenDecoder", {
    "../../config/firebase_config": adminStub,
});

describe("Test tokenDecoder", async () => {
    it("should return email from token", async () => {
        const fakeEmail = "FakeEmail@gmail.com";
        const tokenFake = "token";

        verifyIdTokenStub.withArgs(tokenFake).resolves({
            email: "FakeEmail@gmail.com",
        });

        const result = await tokenDecoder(tokenFake);

        chai.expect(result).to.be.eql({ email: fakeEmail });
        chai.expect(verifyIdTokenStub.callCount).to.be.eql(1);
    });
});
