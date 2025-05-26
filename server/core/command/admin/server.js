const { Log } = baseRequire('server/core/tools');
const Packet = baseRequire('server/core/world/packet.js');
const Command = baseRequire('server/core/command');
const Server = baseRequire('server/core/world/server.js');

function reject() {
    return new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: 'That command cannot be used here.' }, Date.now()).toJSON();
}

module.exports = [
    {
        name: 'server',
        subcommands: [
            'close',
            'memory',
            'version'
        ],
        execute(socket, sender = 'console', command) {
            const help = [
                'Subcommands:',
                '- close: Gracefully terminate server NOW. Returns exit code 0.',
                '- memory: Shows server RAM usage.',
                '- version: Shows server and Node.js version.'
            ].join('\n');

            // Parse base command
            if(Command.tokensToArray(command).length === 1) {
                if(sender === 'console') {
                    Log.raw(help);
                } else {
                    const response = new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: help }, Date.now()).toJSON();
                    socket.send(response);
                }
            }

            // Parse first subcommands
            switch(Command.tokensToArray(command)[1]) {
                case 'close':
                    if(sender === 'console') {
                        Server.close();
                    } else {
                        socket.send(reject());
                    }
                    break;
                case 'memory':
                    const memory = (process.memoryUsage()['heapUsed'] / 1000000).toFixed(2);
                    if(sender === 'console') {
                        Log.raw(`Server memory used: ${memory} MB`);
                    } else {
                        const response = new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: `Server memory used: ${memory} MB` }, Date.now()).toJSON();
                        socket.send(response);
                    }
                    break;
                case 'version':
                    if(sender === 'console') {
                        Log.raw(`FSMUD: v${process.env.npm_package_version}\r\nNode.js: ${process.version}`);
                    } else {
                        const response = new Packet('COMMAND_REPLY', {username: 'server', permission: 3, message: `FSMUD: v${process.env.npm_package_version}\r\nNode.js: ${process.version}` }, Date.now()).toJSON();
                        socket.send(response);
                    }
                    break;
            }
        }
    }
]
