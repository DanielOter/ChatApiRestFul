const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");

const {
    errorHandlerMiddleware,
} = require("../../../src/middleware/errorHandlerMiddleware");

describe("Test errorHandlerMiddleware", () => {
    it("errorHandlerMiddleware - returns error correct status and message", async () => {
        const err = {
            status: 404,
            message: "Bad Request",
        };
        const req = "";

        const mockJson = { message: "Bad Request" };

        const jsonMock = sinon.stub();

        jsonMock.returns(mockJson);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        const next = "";

        errorHandlerMiddleware(err, req, res, next);

        chai.expect(res.status.firstCall.args[0]).to.be.eql(404);
        chai.expect(res.status().json.firstCall.args).to.be.eql([
            { status: 404, message: "Bad Request" },
        ]);
    });
    it("errorHandlerMiddleware - empty error returns correct status and message", async () => {
        const err = {};
        const req = "";

        const jsonMock = sinon.stub();

        const mockJson = { message: "Internal Server Error" };

        jsonMock.returns(mockJson);

        const res = {
            status: sinon.fake.returns({
                json: jsonMock,
            }),
        };

        const next = "";

        errorHandlerMiddleware(err, req, res, next);

        chai.expect(res.status.firstCall.args[0]).to.be.eql(500);
        chai.expect(res.status().json.firstCall.args).to.be.eql([
            { status: 500, message: "Internal Server Error" },
        ]);
    });
});
