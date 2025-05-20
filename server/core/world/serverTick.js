const { Race } = baseRequire('server/data');
const { Log } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');
const Registry = baseRequire('server/core/registry');

module.exports = {
    async clearExpiredModActions() {
        const currentTime = Math.round(Date.now() / 1000);

        try {
            bans = await Database.getAllRows(Config.get('database.names.auth_db'), 'account_bans');
            mutes = await Database.getAllRows(Config.get('database.names.auth_db'), 'account_bans');

            if(bans) {
                for(const user of bans) {
                    if(user.ban_time >= 0 && currentTime >= user.ban_time) {
                        Database.deleteRow(Config.get('database.names.auth_db'), 'account_bans', 'UUID', user.UUID);
                    }
                }
            }

            if(mutes) {
                for(const user of mutes) {
                    if(user.mute_time >= 0 && currentTime >= user.mute_time) {
                        Database.deleteRow(Config.get('database.names.auth_db'), 'account_mutes', 'UUID', user.UUID);
                    }
                }
            }
        } catch(err) {
            Log.message(err.message, 'ERROR');
        }
    },

    async flushGameState() {
        let query, updateResult;
        const db = Database.getDatabase();
        const onlinePlayers = Registry.get('players');

        try {
            if(!onlinePlayers || Object.keys(onlinePlayers).length === 0) return;

            for(const [playerID, playerData] of Object.entries(onlinePlayers)) {
                query = `UPDATE \`${Config.get('database.names.char_db')}\`.\`character\`
                    SET flags = ?,
                    level = ?,
                    xp = ?,
                    money = ?,
                    banked_money = ?,
                    health = ?,
                    current_health = ?,
                    strength = ?,
                    vitality = ?,
                    agility = ?,
                    willpower = ?,
                    perception = ?,
                    map_id = ?,
                    map_x = ?,
                    map_y = ?
                    WHERE \`UUID\` = ?`;
                updateResult = await new Promise((resolve, reject) => {
                    db.query(query, [
                        playerData.flags,
                        playerData.level,
                        playerData.xp,
                        playerData.money,
                        playerData.bank_money,
                        playerData.health,
                        playerData.current_health,
                        playerData.attributes.strength,
                        playerData.attributes.vitality,
                        playerData.attributes.agility,
                        playerData.attributes.willpower,
                        playerData.attributes.perception,
                        playerData.mapID,
                        playerData.mapX,
                        playerData.mapY,
                        playerID
                    ], (err, result) => {
                        if(err) return reject(err);
                        resolve(result);
                    });
                });
            }
        } catch(err) {
            Log.message(`Error flushing character data to database: ${err.message}`, 'ERROR');
        }
    }
}