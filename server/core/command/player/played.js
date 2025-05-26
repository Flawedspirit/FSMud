const { Log } = baseRequire('server/core/tools');
const Packet = baseRequire('server/core/world/packet.js');
const Command = baseRequire('server/core/command');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');

async function getPlayedTime(player) {
    const result = await Database.get(Config.get('database.names.auth_db'), 'account', 'UUID', player);
    const total = result.played_time;
    const playedDays = Math.floor(total / 86400);
    const playedHours = Math.floor((total % 86400) / 3600);
    const playedMin = Math.floor((total % 3600) / 60);
    const playedSec = Math.floor(total % 60);
    return `Played for ${playedDays} days, ${playedHours} hours, ${playedMin} minutes, ${playedSec} seconds`;
}

module.exports = [
    {
        name: 'played',
        subcommands: [],
        async execute(socket, sender = 'console', command) {
            command = Command.tokensToArray(command);

            if(command.length === 1) {
                if(sender === 'console') {
                    Log.raw('Usage: played <username>');
                } else {
                    const response = new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: await getPlayedTime(sender.id) }, Date.now()).toJSON();
                    socket.send(response);
                }
                return;
            } else {

            }
        }
    }
]