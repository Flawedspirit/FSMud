const readline = require('readline');
const WebSocket = require('ws');
const Packet = require('./packet.js');
const Chat = require('./chat.js');
const ServerTick = require('./serverTick.js');
const { Errors, Log } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');
const Account = baseRequire('server/core/account');
const Event = baseRequire('server/core/event');
const Registry = baseRequire('server/core/registry');

global.line = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>> '
});

// Main server object
let server;

// Event handling
Event.on('PLAYER_CONNECTED', async (data, socket) => {
    const result = await Account.authorizeLogin(data);
    socket.send(result.toJSON());
});

Event.on('PLAYER_DISCONNECTED', async (data) => {
    await Account.logout(data);
});

Event.on('SERVER_READY', () => {
    setInterval(async () => {
        // Load online players into server memory
        ServerTick.getOnlinePlayers();

        // Clear expired bans and mutes
        ServerTick.clearExpiredModActions();
    }, 2000);
});

Event.on('PLAYER_MESSAGE', async (data, socket) => {
    Chat.processMessage(data, socket, server);
});

module.exports = {
    async init() {
        return new Promise((resolve, reject) => {
            server = new WebSocket.Server({
                host: Config.get("network.listen"),
                port: parseInt(Config.get("network.port"))
            });

            server.on('connection', (socket) => {
                Event.call('SOCKET_CONNECTED', socket);

                socket.on('message', async (data) => {
                    try {
                        //const message = Packet.fromJSON(data);
                        const message = Packet.fromJSON(data.toString());
                        Event.call('DATA_RECEIVED', message);

                        switch(message.type) {
                            case 'LOGIN':
                                Event.call('PLAYER_CONNECTED', message, socket);
                                break;
                            case 'LOGOUT':
                                Event.call('PLAYER_DISCONNECTED', message, socket);
                                break;
                            case 'MESSAGE':
                                Event.call('PLAYER_MESSAGE', message, socket);
                                break;
                            default:
                                Log.message(`Unknown packet type: ${message.type}`, 'WARN');
                                socket.send(new Packet('REPLY', { success: false,  message: [`Unknown packet type: ${message.type}`] }));
                        }
                    } catch(err) {
                        Log.message(err, 'ERROR');
                    }
                });

                socket.on('error', (err) => {
                    Log.message(err, 'ERROR');
                    Log.message('*** SERVER OPERATION CANNOT CONTINUE ***', 'ERROR');
                    process.exit(Errors.ErrorLog.SOCKET_ERROR);
                });

                socket.on('close', () => {
                    //Log.message(Lang.getString('server.client_close'), 'INFO');
                });
            });

            Log.message(`Server listening on [c:w]${Config.get("network.listen")}:${Config.get("network.port")}[r]`);
            Event.call('SERVER_READY');

            this.input();
            resolve();
        });
    },

    close() {
        if(server) {
            server.close(() => {
                Log.message('Server going down NOW. Flushing state to database.', 'INFO');
                Event.call('SAVE');
                Log.message('Server has been closed. Good day!', 'INFO');
                process.exit(0);
            });
        } else {
            Log.message('Server is not running or has already closed.', 'WARN');
        }
    },

    input() {
        global.line.prompt();

        global.line.on('line', async (input) => {
            try {
                // Split inputted command into its base command and constituent subcommands
                // Base command is passed to the registry to find command file while
                // full command string is passed to command file for further processing
                const tokens = input.split(' ').filter(token => token.trim() !== '');
                let baseCommand;

                if(tokens.length === 1) {
                    baseCommand = tokens[0];
                } else {
                    baseCommand = `${tokens[0]} ${tokens[1]}`;
                }

                const dbCommand = await Database.get(Config.get('database.names.world_db'), 'command', 'name', baseCommand);

                if(!dbCommand || baseCommand !== dbCommand.name) {
                    Log.message(`The command [c:w]${input}[c:C] does not exist.`, 'INFO');
                    return
                }

                // The command exists and is valid, process here
                // TODO: validate permissions

                const command = Registry.get('commands').find(cmd => cmd.name === tokens[0]);

                if(command && typeof command.execute === 'function') {
                    await command.execute(input);
                } else {
                    Log.message(`The command [c:w]${input}[c:C] does not exist.`, 'INFO');
                }
            } catch(err) {
                Log.message(`Error: ${err.stack}`, 'ERROR');
            }

            global.line.prompt();
        });
    }
}