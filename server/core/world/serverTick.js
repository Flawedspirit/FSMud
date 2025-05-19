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

    async getOnlinePlayers() {
        try {
            let account, character, skills;

            account = await Database.getAllRows(Config.get('database.names.auth_db'), 'account');

            if(!account) {
                return;
            }

            for(const acct of account) {
                // Check if player is already loaded into memory and skip
                // the player if it is, to avoid extra strain on the server
                const player = Registry.get('players', acct.UUID);
                if(player) continue;

                // If the player is online in the database, load the rest of their data
                if(acct.online) {
                    character = await Database.get(Config.get('database.names.char_db'), 'character', 'UUID', acct.UUID);
                    skills = await Database.get(Config.get('database.names.char_db'), 'character_skills', 'UUID', acct.UUID);

                    if(!character || !skills) {
                        return;
                    }

                    // Create a new player object and add to the registry of
                    // players in server memory
                    const currentChar = {
                        id: acct.UUID,
                        name: acct.username,
                        race: Race.getRaceName(character.race),
                        sex: character.sex,
                        health: character.health,
                        attributes: {
                            strength: character.strength,
                            vitality: character.vitality,
                            agility: character.agility,
                            willpower: character.willpower,
                            perception: character.perception,
                        },
                        mapID: character.map_id,
                        mapX: character.map_x,
                        mapY: character.map_y,
                        flags: character.flags,
                        level: character.level,
                        money: character.money,
                        bank_money: character.banked_money,
                        skills: {
                            cooking: skills.cooking,
                            herbalism: skills.herbalism,
                            mining: skills.mining,
                        },
                        permissions: acct.permission
                    };

                    Registry.add('players', acct.UUID, currentChar);
                }
            }
        } catch(err) {
            Log.message(`Error getting online player list: ${err.message}`, 'ERROR');
        }
    }
}