const createError = require("http-errors");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

class DbSingleton {
    dbInstance;
    getInstance = async () => {
        try {
            if (this.dbInstance === undefined) {
                //const connection = new sqlite.Database(':memory:')
                this.dbInstance = await open({
                    filename: ":memory:",
                    driver: sqlite3.Database,
                });
            }
            return this.dbInstance;
        } catch (e) {
            throw new createError.ServiceUnavailable(e);
        }
    };
}

const database = new DbSingleton();

module.exports = database;
