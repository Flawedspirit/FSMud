const database = require('mysql2');
const { Errors, Log } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');

let db;

module.exports = {
    async init() {
        return new Promise((resolve, reject) => {
            db = database.createConnection({
                host: Config.get('database.host'),
                port: Config.get('database.port'),
                user: Config.get('database.user'),
                password: Config.get('database.password')
            });

            db.connect((err) => {
                if (err) {
                    Log.message(`Database connection failed: ${err}`, 'ERROR');
                    Log.message('*** SERVER OPERATION CANNOT CONTINUE ***', 'ERROR');
                    process.exit(Errors.ErrorCode.DATABASE_CONNECT_FAIL);
                } else {
                    Log.message('Connected to database.', 'INFO');
                    resolve();
                }
            });
        });
    },

    /**
     * Returns the value of a row from the provided database.
     * @param {Connection} database - A mysql2 database connection
     * @param {string} table - The table to use
     * @param {string} column - The table column to query
     * @param {string} value - The column value to query
     * @returns The selected value at database.table -> account
     */
    async get(database, table, column, value) {
        return new Promise((resolve, reject) => {
            const stdQuery = `SELECT * FROM \`${database}\`.\`${table}\` WHERE \`${column}\` = ?`;
            db.query(stdQuery, [value], (err, result) => {
                if(err) {
                    return reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        });
    },

    async getAllRows(database, table) {
        return new Promise((resolve, reject) => {
            const stdQuery = `SELECT * FROM \`${database}\`.\`${table}\``;
            db.query(stdQuery, (err, result) => {
                if(err) {
                    return reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    async deleteRow(database, table, row, value) {
        return new Promise((resolve, reject) => {
            const stdQuery = `DELETE FROM \`${database}\`.\`${table}\` WHERE \`${row}\` = ?`
            db.query(stdQuery, [value], (err, result) => {
                if(err) {
                    return reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    /**
     * Updates the value of a column in the provided database table.
     * @param {Connection} database
     * @param {string} table
     * @param {string} uuid
     * @param {string} column
     * @param {string} newValue
     */
    async updateByUUID(database, table, uuid, column, newValue) {
        return new Promise((resolve, reject) => {
            const stdQuery = `UPDATE \`${database}\`.\`${table}\` SET \`${column}\`  = ? WHERE \`UUID\` = ?`
            db.query(stdQuery, [newValue, uuid], (err, result) => {
                if(err) {
                    return reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        });
    },

    /**
     * Updates the value of a column in the provided database table.
     * @param {Connection} database
     * @param {string} table
     * @param {string} username
     * @param {string} column
     * @param {string} newValue
     */
    async updateByUsername(database, table, username, column, newValue) {
        return new Promise((resolve, reject) => {
            const stdQuery = `UPDATE \`${database}\`.\`${table}\` SET \`${column}\` = ? WHERE \`username\` = ?`
            db.query(stdQuery, [newValue, username], (err, result) => {
                if(err) {
                    return reject(err);
                } else {
                    resolve(result[0]);
                }
            });
        });
    },

    getDatabase() {
        if(!db) {
            Log.message('Attempt to get database object of uninitialized database.', 'ERROR');
        }
        return db;
    }
};
