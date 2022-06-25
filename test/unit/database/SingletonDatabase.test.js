const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
//const databaseSingleton = require('../../../src/database/databaseSingleton')
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const createError = require("http-errors");

const dbOpenMock = sinon.stub();

const database = proxyquire("../../../src/database/databaseSingleton", {
    sqlite: { open: dbOpenMock },
});

describe("Singleton database", () => {
    beforeEach(() => {
        dbOpenMock.resetHistory();
        dbOpenMock.resetBehavior();
    });

    it("Should return a ServiceUnavailableError", async () => {
        try {
            dbOpenMock.rejects({ message: "custom error" });
            await database.getInstance();
        } catch (error) {
            chai.expect(error.status).to.be.equal(503);
            chai.expect(error.message).to.be.eql({ message: "custom error" });
        }
    });
    it("Should return a database object", async () => {
        dbOpenMock.resolves("Database Object");
        const databaseObject = await database.getInstance();

        chai.expect(databaseObject).to.exist;
    });

    it("Should return the same database object on every call", async () => {
        dbOpenMock.resolves("Database Object");
        const firstDatabaseObject = await database.getInstance();
        const secondDatabaseObject = await database.getInstance();
        chai.expect(firstDatabaseObject).to.be.equal(secondDatabaseObject);
    });
});
