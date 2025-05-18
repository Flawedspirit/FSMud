const bcrypt = require('bcrypt');
const { Race } = baseRequire('server/data');
const { Log, SessionKey, UUID } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');
const Packet = baseRequire('server/core/world/packet.js');
const Registry = baseRequire('server/core/registry');

const saltRounds = 12;

module.exports = {
    async getUUIDFromUsername(name) {
        const db = Database.getDatabase();
        try {
            let query, updateResult;

            query = `SELECT * FROM \`${Config.get('database.names.auth_db')}\`.\`account\` WHERE username = ?`;
            updateResult = await new Promise((resolve, reject) => {
                db.query(query, [name], (err, result) => {
                    if(err) return reject(err);
                    resolve(result);
                });
            });
            return updateResult[0].UUID;
        } catch(err) {
            Log.message(`Database query failed: ${err.message}`, 'ERROR');
        }
    },

    async createUser(user, password, email, race, sex, permission) {
        const db = Database.getDatabase();
        // UUID
        let uuid = await UUID.newUUID();

        // Username
        if(user.length > 20) {
            Log.message('Provided username is too long. Truncating to 20 characters.', 'WARN');
            user = user.substring(0, 20);
        }

        //Password
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            password = await bcrypt.hash(password, salt);
        } catch(err) {
            Log.message(err, 'ERROR');
            return;
        }

        // Race and attributes
        if(race) {
            if(race < 0) {
                Log.message('Min race ID is 0. Setting to 0.', 'WARN');
                race = 0;
            }
            if(race > 6) {
                Log.message('Max race ID is 6. Setting to 6.', 'WARN');
                race = 6;
            }
        } else {
            // Race ID was not specified, default it to 0 (human)
            race = 0;
        }

        let health, strength, vitality, agility, willpower, perception;
        switch(race) {
            case '0': // Human
                strength = 11;
                vitality = 11;
                agility = 11;
                willpower = 11;
                perception = 11;
                break;
            case '1': // Harné (bear-lynx hybrid)
                strength = 11;
                vitality = 10;
                agility = 12;
                willpower = 11;
                perception = 10;
                break;
            case '2': // Lukhani (wolf)
                strength = 13;
                vitality = 11;
                agility = 10;
                willpower = 10;
                perception = 10;
                break;
            case '3': // Ka'mush (kobold)
                strength = 10;
                vitality = 10;
                agility = 10;
                willpower = 13;
                perception = 11;
                break;
            case '4': // Kelikaar (lizard)
                strength = 11;
                vitality = 12;
                agility = 10;
                willpower = 11;
                perception = 10;
                break;
            case '5': // Madrani (cat)
                strength = 10;
                vitality = 10;
                agility = 13;
                willpower = 10;
                perception = 11;
                break;
            case '6': // Vultani (fox)
                strength = 10;
                vitality = 11;
                agility = 10;
                willpower = 10;
                perception = 13;
                break;
            default:
                strength = 11;
                vitality = 11;
                agility = 11;
                willpower = 11;
                perception = 11;
        }
        health = vitality * parseInt(Config.get('game_options.vitality_hp_multiplier'));

        // Sex
        if(sex) {
            if(sex < 0 || sex > 1) {
                Log.message('Sex must be set to either 0 (male) or 1 (female). Defaulting to 0.', 'WARN');
                sex = 0;
            }
        } else {
            // Sex was not specified, default it to 0 (male)
            sex = 0;
        }

        // Permission level
        if(permission) {
            if(permission < 0) {
                Log.message('Min permission level is 0. Setting to 0.', 'WARN');
                permission = 0;
            }
            if(permission > 2) {
                Log.message('Max permission level is 2. Setting to 2.', 'WARN');
                permission = 2;
            }
        } else {
            // Permission was not specified, default it to 0
            permission = 0;
        }

        try {
            let query, updateResult;

            query = `INSERT INTO \`${Config.get('database.names.auth_db')}\`.\`account\` (UUID, username, password, email, permission) VALUES (?, ?, ?, ?, ?)`;
            updateResult = await new Promise((resolve, reject) => {
                db.query(query, [uuid, user, password, email, permission], (err, result) => {
                    if(err) return reject(err);
                    resolve(result);
                });
            });

            query = `INSERT INTO \`${Config.get('database.names.char_db')}\`.\`character\`
                (UUID, race, sex, health, strength, vitality, agility, willpower, perception)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            updateResult = await new Promise((resolve, reject) => {
                db.query(query, [uuid, race, sex, health, strength, vitality, agility, willpower, perception], (err, result) => {
                    if(err) return reject(err);
                    resolve(result);
                });
            });

            query = `INSERT INTO \`${Config.get('database.names.char_db')}\`.\`character_skills\` (UUID) VALUES (?)`;
            updateResult = await new Promise((resolve, reject) => {
                db.query(query, [uuid], (err, result) => {
                    if(err) return reject(err);
                    resolve(result);
                });
            });

            Log.raw(uuid);

        } catch(err) {
            Log.message(`Database update failed: ${err.message}`, 'ERROR');
        }
    },

    /**
     * Deletes the account tied to the provided UUID or username.
     * @param {string} param - A UUID or username.
     */
    async deleteUser(param) {
        try {
            if(!await UUID.isUUID(param)) {
                // Command was provided a username, look up its UUID
                param = await this.getUUIDFromUsername(param);
            }

            await Database.deleteRow(Config.get('database.names.auth_db'), 'account', 'UUID', param);
            await Database.deleteRow(Config.get('database.names.auth_db'), 'account_bans', 'UUID', param);
            await Database.deleteRow(Config.get('database.names.auth_db'), 'account_mutes', 'UUID', param);
            await Database.deleteRow(Config.get('database.names.char_db'), 'character', 'UUID', param);
            await Database.deleteRow(Config.get('database.names.char_db'), 'character_skills', 'UUID', param);
        } catch(err) {
            Log.message(`Delete from database failed: ${err.message}`, 'ERROR');
        }
    },

    /**
     * Bans the account tied to the provided UUID.
     * @param {string} uuid - The account UUID.
     * @param {string} banTime - Time (in seconds) to ban user. Any negative value is permanent.
     * @param {string} banReason - The provided reason for the ban (optional).
     * @param {*} banUser - The user that performed the ban.
     */
    async banAccount(uuid, banTime, banReason = "", banUser) {
        const db = Database.getDatabase();
        let query, updateResult;

        if(!uuid || !UUID.isUUID(uuid)) {
            Log.message('Account to ban must be a valid account UUID.', 'ERROR');
            return;
        }

        if(!banTime) {
            Log.message('A ban duration must be provided.', 'ERROR');
            return;
        }

        if(!banUser) {
            Log.message('A username or other identifier must be provided.', 'ERROR');
            return;
        }

        try {
            // Set invalid logins back to 0 so user is not re-banned after ban expires
            // and can try again
            updateResult = await Database.updateByUUID(Config.get('database.names.auth_db'), 'account', uuid, 'failed_logins', 0);

            query = `INSERT INTO \`${Config.get('database.names.auth_db')}\`.\`account_bans\`
                (UUID, ban_time, ban_reason, ban_by) VALUES (?, ?, ?, ?)`;
            updateResult = await new Promise((resolve, reject) => {
                db.query(query, [uuid, banTime, banReason, banUser], (err, result) => {
                    if(err) return reject(err);
                    resolve(result);
                });
            });

            Log.message(`Banned UUID ${uuid} by ${banUser}; Reason: ${banReason}`, 'AUTH');
        } catch (error) {
            Log.message(`Database update failed: ${err.message}`, 'ERROR');
        }
    },

    async authorizeLogin(message) {
        const db = Database.getDatabase();
        const currentTime = Math.round(Date.now() / 1000);

        try {
            if(message.type === 'LOGIN') {
                let account;

                // Check user information against database
                account = await Database.get(`${Config.get('database.names.auth_db')}`, 'account', 'username', message.data.username);

                if(!account) {
                    return new Packet('REPLY', { success: false, message: [] });
                }

                // Check if account is banned
                const isBanned = await Database.get(`${Config.get('database.names.auth_db')}`, 'account_bans', 'UUID', account.UUID);
                const isIPBanned = await Database.get(`${Config.get('database.names.auth_db')}`, 'ip_bans', 'ip', message.data.ipAddress);

                if(isBanned && parseInt(isBanned.ban_time) !== 0) {
                    Log.message(`Login attempt by ${account.username}@${message.data.ipAddress} rejected. Reason: BANNED`, 'AUTH');

                    if(isBanned.ban_reason === 'THROTTLED') {
                        return new Packet('REPLY', { success: false, message: ['ACCOUNT_THROTTLED', isBanned.ban_time - currentTime] });
                    } else {
                        return new Packet('REPLY', { success: false, message: ['ACCOUNT_LOCKED'] });
                    }
                }

                if(isIPBanned && isIPBanned.ip === message.data.ipAddress) {
                    Log.message(`Login attempt by ${account.username}@${message.data.ipAddress} rejected. Reason: IP BANNED`, 'AUTH');
                    return new Packet('REPLY', { success: false, message: ['IP_LOCKED'] });
                }

                // No outstanding bans, proceed with login
                if(account.username.toLowerCase() === message.data.username.toLowerCase()) {
                    Log.message(`Login attempt by ${account.username}@${message.data.ipAddress}.`, 'AUTH');
                    try {
                        let query, updateResult;

                        // Update last attempted login IP address
                        query = `UPDATE \`${Config.get('database.names.auth_db')}\`.\`account\` SET last_attempt_ip = ? WHERE \`username\` = ?`;
                        updateResult = await new Promise((resolve, reject) => {
                            db.query(query, [message.data.ipAddress, account.username], (err, result) => {
                                if(err) return reject(err);
                                resolve(result);
                            });
                        });

                        const comparePasswd = await bcrypt.compare(message.data.password, account.password);
                        if(comparePasswd) {
                            // Successfully authenticated. Welcome!
                            // Update database with data passed from login screen
                            query = `UPDATE \`${Config.get('database.names.auth_db')}\`.\`account\` SET last_ip = ?, last_login = ?, failed_logins = ?, online = ?, locale = ? WHERE \`username\` = ?`;
                            updateResult = await new Promise((resolve, reject) => {
                                // Convert Unix date returned by login form to a data format mysql will accept
                                const date = new Date(message.timestamp).toISOString().slice(0, 19).replace('T', ' ');
                                db.query(query, [message.data.ipAddress, date, 0, 1, message.data.locale, account.username], (err, result) => {
                                    if(err) return reject(err);
                                    resolve(result);
                                });
                            });

                            // Generate a session key and send it to the client and database
                            const sessionKey = await SessionKey.newKey();
                            query = `UPDATE \`${Config.get('database.names.auth_db')}\`.\`account\` SET session_key = ? WHERE \`username\` = ?`;
                            updateResult = await new Promise((resolve, reject) => {
                                db.query(query, [sessionKey, account.username], (err, result) => {
                                    if(err) return reject(err);
                                    resolve(result);
                                });
                            });

                            // Send initial character state to the player when logged in
                            const character = await Database.getAllRows(Config.get('database.names.char_db'), 'character');
                            const skills = await Database.getAllRows(Config.get('database.names.char_db'), 'character_skills');
                            const gameState = {
                                id: account.UUID,
                                name: account.username,
                                race: Race.getRaceName(character[0].race),
                                sex: character[0].sex,
                                health: character[0].health,
                                attributes: {
                                    strength: character[0].strength,
                                    vitality: character[0].vitality,
                                    agility: character[0].agility,
                                    willpower: character[0].willpower,
                                    perception: character[0].perception
                                },
                                mapID: character[0].map_id,
                                mapX: character[0].map_x,
                                mapY: character[0].map_y,
                                flags: character[0].flags,
                                level: character[0].level,
                                money: character[0].money,
                                skills: {
                                    cooking: skills[0].cooking,
                                    herbalism: skills[0].herbalism,
                                    mining: skills[0].mining,
                                },
                                permissions: account.permission
                            }

                            return new Packet('REPLY', { success: true, message: [sessionKey, gameState] });
                        } else {
                            // Check if there are already enough invalid login attempts to ban logins
                            // The threshold value is actually set to n-1 because failed_logins begins at 0
                            if(account.failed_logins >= Config.get('auth.wrong_pass.max_count') - 1) {
                                this.banAccount(account.UUID, currentTime + Config.get('auth.wrong_pass.ban_time'), 'THROTTLED', 'Server');
                                return new Packet('REPLY', { success: false, message: ['TOO_MANY_LOGINS'] });
                            } else {
                                // Password was incorrect, increment failed logins by 1
                                query = `UPDATE \`${Config.get('database.names.auth_db')}\`.\`account\` SET failed_logins = ? WHERE \`username\` = ?`;
                                updateResult = await new Promise((resolve, reject) => {
                                    db.query(query, [account.failed_logins + 1, account.username], (err, result) => {
                                        if(err) return reject(err);
                                        resolve(result);
                                    });
                                });
                                return new Packet('REPLY', { success: false, message: ['INVALID_CREDENTIALS'] });
                            }
                        }
                    } catch(err) {
                        Log.message(`Database update failed: ${err.message}`, 'ERROR');
                        return new Packet('REPLY', { success: false, message: ['SERVER_ERROR'] });
                    }
                } else {
                    // The requested username was not found in the database
                    return new Packet('REPLY', { success: false, message: ['INVALID_CREDENTIALS'] });
                }
            }
        } catch(err) {
            Log.message(`Failed to parse login data: ${err.message}`, 'ERROR');
            return new Packet('REPLY', { success: false, message: ['SERVER_ERROR'] });
        }
    },

    async logout(message) {
        const db = Database.getDatabase();

        try {
            if(message.type === 'LOGOUT') {
                result = await Database.get(`${Config.get('database.names.auth_db')}`, 'account', 'username', message.data.username);
            }
        } catch(err) {
            Log.message(`Failed to parse logout data: ${err.message}`, 'ERROR');
        }
    }
}