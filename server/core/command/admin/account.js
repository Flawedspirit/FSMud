const { Log } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');
const Account = baseRequire('server/core/account');
const Command = baseRequire('server/core/command');

async function printUserUUID(name) {
    try {
        const result = await Database.get(`${Config.get('database.names.auth_db')}`, 'account', 'username', name);

        if(result) {
            Log.raw(result.UUID);
        }
    } catch(err) {
        Log.message(`Query of database failed: ${err.message}`, 'ERROR');
    }
}

module.exports = [
    {
        name: 'account',
        subcommands: [
            'create',
            'delete',
            'uuid'
        ],
        async execute(sender, command) {
            // Parse base command
            command = Command.tokensToArray(command);

            if(command.length === 1) {
                Log.raw(
                    [
                        'Subcommands:',
                        '- create: Creates a new account with provided name, password, and email.',
                        '- delete: Deletes a user account from the database. CANNOT BE UNDONE!',
                        '- uuid: Returns the UUID of the provided username.'
                    ].join('\n')
                );
                return;
            }

            // Parse first subcommands
            if(command.length > 1) {
                switch(command[1]) {
                    case 'create':
                        if(command.length >= 5) {
                            let user = command[2];
                            let password = command[3];
                            let email = command[4];
                            let race = (command[5] || 0);
                            let sex = (command[6] || 0);
                            let permission = (command[7] || 0);
                            Account.createUser(user, password, email, race, sex, permission);
                        } else {
                            Log.raw('Usage: account create <name> <password> <email> [race:0] [sex:0] [permission:0]');
                            Log.raw('    Race: 0 - Human; 1 - Harné; 2 - Lukhani; 3 - Ka\'mush; 4 - Kelikaar; 5 - Madrani; 6 - Vultani; ');
                            Log.raw('    Sex: 0 - Male; 1 - Female');
                        }
                        break;
                    case 'delete':
                        if(command.length > 2) {
                            let user = command[2];
                            Account.deleteUser(user);
                        } else {
                            Log.raw('Usage: account delete <uuid|name>');
                        }
                        break;
                    case 'uuid':
                        if(command.length > 2) {
                            let user = command[2];
                            printUserUUID(user);;
                        } else {
                            Log.raw('Usage: account uuid <uuid|name>');
                        }
                        break;
                }
            }
        }
    }
]