const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const u4Stub = sinon.stub();

const uuidStub = {
    v4: u4Stub,
};

const { generateUUID } = proxyquire("../../../src/libs/generateUUID", {
    uuid: uuidStub,
});

describe("Test generateUUID", async () => {
    it("should return uuid v4 ", async () => {
        const uuidFake = "uud";

        u4Stub.returns(uuidFake);

        const result = generateUUID();

        chai.expect(result).to.be.eql(uuidFake);
        chai.expect(u4Stub.callCount).to.be.eql(1);
    });
});
