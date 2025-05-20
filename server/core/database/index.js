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
     * @param {string} database - The database to use
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

    /**
     * Gets all rows from the selected table.
     * @param {*} database - The database to use
     * @param {string} table - The table to use
     * @returns An array of all rows of database.table
     */
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

    /**
     * Deletes a row from the database table.
     * @param {string} database - The database to use
     * @param {string} table - The table to use
     * @param {string} select - The selector column to use to find the desired row
     * @param {*} value - The value of the selector
     */
    async deleteRow(database, table, select, selectValue) {
        return new Promise((resolve, reject) => {
            const stdQuery = `DELETE FROM \`${database}\`.\`${table}\` WHERE \`${select}\` = ?`
            db.query(stdQuery, [selectValue], (err, result) => {
                if(err) {
                    return reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    /**
     * Updates the selected database row.
     * @param {string} database - The database to use
     * @param {string} table - The table to use
     * @param {string} select - The selector column to use to find the desired row
     * @param {*} selectValue - The value of the selector
     * @param {string} column - The column to change
     * @param {*} newValue - The new value to store
     */
    async updateRow(database, table, select, selectValue, column, newValue) {
        return new Promise((resolve, reject) => {
            const stdQuery = `UPDATE \`${database}\`.\`${table}\` SET \`${column}\`  = ? WHERE \`${select}\` = ?`
            db.query(stdQuery, [newValue, selectValue], (err, result) => {
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
     * @param {string} database - The database to use
     * @param {string} table - The table to use
     * @param {string} uuid - The account UUID to use
     * @param {string} column - The column to change
     * @param {string} newValue - The new value to store
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
     * @param {string} database - The database to use
     * @param {string} table - The table to use
     * @param {string} username - The username to use
     * @param {string} column - The column to change
     * @param {string} newValue - The new value to store
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

    /**
     *
     * @returns A mysql2 database connection object
     */
    getDatabase() {
        if(!db) {
            Log.message('Attempt to get database object of uninitialized database.', 'ERROR');
        }
        return db;
    },

    close() {
        db.end((err) => {
            if(err) {
                Log.message(`Error closing database connection: ${err.message}`, 'ERROR');
                return;
            }
            Log.message('Database connection closed.', 'INFO');
        });
    }
};
