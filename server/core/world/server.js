const readline = require('readline');
const WebSocket = require('ws');
const Packet = require('./packet.js');
const Chat = require('./chat.js');
const Command = require('./commands');
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
let server, socket, mainTick, dbTick;

// Event handling
Event.on('PLAYER_CONNECTED', async (data, socket) => {
    const result = await Account.authorizeLogin(data);
    socket.send(result.toJSON());
});

Event.on('PLAYER_DISCONNECTED', async (data) => {
    await Account.logout(data);
});

Event.on('SERVER_READY', () => {
    const tickRateSeconds = 2;

    mainTick = setInterval(async () => {
        // Update played time of all logged in accounts
        account = await Database.getAllRows(Config.get('database.names.auth_db'), 'account');
        if(account) {
            for(const acct of account) {
                // Update time played
                if(parseInt(acct.online) === 1) {
                    Database.updateRow(Config.get('database.names.auth_db'), 'account', 'UUID', acct.UUID, 'played_time', acct.played_time + tickRateSeconds);
                }
            }
        }

        // Clear expired bans and mutes
        await ServerTick.clearExpiredModActions();
    }, tickRateSeconds * 1000);

    dbTick = setInterval(async () => {
        //console.log('Flushing game state to database.');
        await ServerTick.flushGameState();
    }, 10000);
});

Event.on('PLAYER_MESSAGE', async (data, socket) => {
    Chat.processMessage(data, socket, server);
});

Event.on('SAVE', async () => {
    ServerTick.flushGameState();
});

process.on('SIGINT', async () => {
    // Iterate through all online players and set them offline in the database
    const onlinePlayers = Registry.get('players');
    try {
        if(Object.keys(onlinePlayers).length > 0) {
            for(const [playerID, _] of Object.entries(onlinePlayers)) {
                await Database.updateRow(Config.get('database.names.auth_db'), 'account', 'UUID', playerID, 'online', 0);
                await Database.updateRow(Config.get('database.names.auth_db'), 'account', 'UUID', playerID, 'session_key', '');
            }
        }
    } catch(err) {
        Log.message(`Database update failed: ${err.message}`, 'ERROR');
    }

    // Stop server ticking
    clearInterval(mainTick);
    clearInterval(dbTick);
    Log.message('Stopping server tick.', 'INFO');

    // Clean up event listeners
    if(global.line) {
        global.line.close();
        Log.message('Event listeners stopped.', 'INFO');
    }

    // Close the database connections
    Database.close();

    Log.message('WebSocket connections closed.');
    server.close();

    Log.message('Server has been closed. Good day!', 'INFO');
    process.exit(0);
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
                    // PLACEHOLDER
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
            Log.message('Server going down NOW. Flushing state to database.', 'INFO');
            Event.call('SAVE');
            process.kill(process.pid, 'SIGINT');
        } else {
            Log.message('Server is not running or has already closed.', 'WARN');
        }
    },

    input() {
        global.line.prompt();

        global.line.on('line', async (input) => {
            Command.processCommand(socket, 'console', input);

            global.line.prompt();
        });
    }
}