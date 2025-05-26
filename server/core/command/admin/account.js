const { Log } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');
const Account = baseRequire('server/core/account');
const Command = baseRequire('server/core/command');
const Packet = baseRequire('server/core/world/packet.js');
const Registry = baseRequire('server/core/registry');

async function printUserUUID(name) {
    try {
        const result = await Database.get(`${Config.get('database.names.auth_db')}`, 'account', 'username', name);

        if(result) {
            return result.UUID;
        }
    } catch(err) {
        Log.message(`Query of database failed: ${err.message}`, 'ERROR');
    }
}

function reject() {
    return new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: 'That command cannot be used here.' }, Date.now()).toJSON();
}

module.exports = [
    {
        name: 'account',
        subcommands: [
            'create',
            'delete',
            'uuid'
        ],
        async execute(socket, sender = 'console', command) {
            const help = [
                'Subcommands:',
                '- create: Creates a new account with provided name, password, and email.',
                '- delete: Deletes a user account from the database. CANNOT BE UNDONE!',
                '- uuid: Returns the UUID of the provided username.'
            ].join('\n');

            // Parse base command
            command = Command.tokensToArray(command);

            if(command.length === 1) {
                console.log(sender);
                if(sender === 'console') {
                    Log.raw('3'); // Console is always permission level 3
                } else {
                    const permission = Registry.get('players', sender).permissions;
                    const response = new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: permission }, Date.now()).toJSON();
                    socket.send(response);
                }
            }

            // Parse first subcommands
            if(command.length > 1) {
                switch(command[1]) {
                    case 'create':
                        if(sender === 'console') {
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
                        } else {
                            socket.send(reject());
                        }
                        break;
                    case 'delete':
                        if(sender === 'console') {
                            if(command.length > 2) {
                                let user = command[2];
                                Account.deleteUser(user);
                            } else {
                                Log.raw('Usage: account delete <uuid|name>');
                            }
                        } else {
                            socket.send(reject());
                        }
                        break;
                    case 'help':
                        if(sender === 'console') {
                            Log.raw(help);
                        } else {
                            const response = new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: help }, Date.now()).toJSON();
                            socket.send(response);
                        }
                        break;
                    case 'uuid':
                        if(sender === 'console') {
                            if(command.length > 2) {
                                let user = command[2];
                                Log.raw(await printUserUUID(user));
                            } else {
                                Log.raw('Usage: account uuid <uuid|name>');
                            }
                        } else {
                            if(command.length > 2) {
                                let user = command[2];
                                const response = new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: await printUserUUID(user) }, Date.now()).toJSON();
                                socket.send(response);
                            } else {
                                const response = new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: 'Usage: account uuid &lt;username&gt;' }, Date.now()).toJSON();
                                socket.send(response);
                            }
                        }
                }
            }
        }
    }
]