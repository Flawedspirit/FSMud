const { Log } = baseRequire('server/core/tools');
const Command = baseRequire('server/core/command');
const Server = baseRequire('server/core/world/server.js');

module.exports = [
    {
        name: 'server',
        subcommands: [
            'close',
            'memory',
            'version'
        ],
        execute(command) {
            // Parse base command
            if(Command.tokensToArray(command).length === 1) {
                Log.raw(
                    [
                        'Subcommands:',
                        '- close: Gracefully terminate server NOW. Returns exit code 0.',
                        '- memory: Shows server RAM usage.',
                        '- version: Shows server and Node.js version.'
                    ].join('\n')
                );
            }

            // Parse first subcommands
            switch(Command.tokensToArray(command)[1]) {
                case 'close':
                    Server.close();
                    break;
                case 'memory':
                    const memory = (process.memoryUsage()['heapUsed'] / 1000000).toFixed(2);
                    Log.raw(`Server memory used: ${memory} MB`);
                    break;
                case 'version':
                    Log.raw(`FSMUD: v${process.env.npm_package_version}\r\nNode.js: ${process.version}`);
                    break;
            }
        }
    }
]
