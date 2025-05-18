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
                    character = await Database.getAllRows(Config.get('database.names.char_db'), 'character');
                    skills = await Database.getAllRows(Config.get('database.names.char_db'), 'character_skills');

                    if(!character || !skills) {
                        return;
                    }

                    // Create a new player object and add to the registry of
                    // players in server memory
                    const currentChar = {
                        id: acct.UUID,
                        name: acct.username,
                        race: Race.getRaceName(character[0].race),
                        sex: character[0].sex,
                        health: character[0].health,
                        attributes: {
                            strength: character[0].strength,
                            vitality: character[0].vitality,
                            agility: character[0].agility,
                            willpower: character[0].willpower,
                            perception: character[0].perception,
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