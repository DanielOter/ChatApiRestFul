const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const insertUserStub = sinon.stub();

const getUserStub = sinon.stub();

const { signInService } = proxyquire("../../../src/services/signInService", {
    "../database/repository": {
        insertUser: insertUserStub,
        getUser: getUserStub,
    },
});

describe("Test signInService", async () => {
    beforeEach(() => {
        getUserStub.resetHistory();
        insertUserStub.resetHistory();
    });
    it("should return 201 when email doesnt exist and user is created", async () => {
        const dummyEmail = "dubiejuan@gmail.com";
        const dummyNickname = "test101";

        getUserStub.withArgs({ email: dummyEmail }).resolves([]);

        const result = await signInService({
            email: dummyEmail,
            nickname: dummyNickname,
        });

        chai.expect(result).to.be.eql({ status: 201, message: "Created" });
        chai.expect(insertUserStub.callCount).to.be.eql(1);
        chai.expect(getUserStub.callCount).to.be.eql(1);
    });

    it("should return 200 when email exist and users is already created", async () => {
        const dummyFakeEmail = "jorge@gmail.com";
        const dummyFakeNickname = "test102";

        const userFake = [
            { email: dummyFakeEmail, nickname: dummyFakeNickname },
        ];

        getUserStub.withArgs({ email: dummyFakeEmail }).resolves(userFake);

        const result = await signInService({
            email: dummyFakeEmail,
            nickname: dummyFakeNickname,
        });

        chai.expect(result).to.be.eql({ status: 200, message: "Ok" });
        chai.expect(insertUserStub.callCount).to.be.eql(0);
        chai.expect(getUserStub.callCount).to.be.eql(1);
    });
});
