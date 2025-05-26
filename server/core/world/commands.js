const { Log } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');
const Registry = baseRequire('server/core/registry');

module.exports = {
    async init() {
        const adminCommands = baseRequire('server/core/command/admin');
        const playerCommands = baseRequire('server/core/command/player');

        Registry.get('admin_commands').push(...adminCommands);
        Registry.get('player_commands').push(...playerCommands);

        Log.message(`Registered ${Registry.get('admin_commands').length} admin commands.`);
        Log.message(`Registered ${Registry.get('player_commands').length} player commands.`);
    },

    sanitize(input) {
        return input.replace(/(<([^>]+)>)/ig, '');
    },

    async processCommand(socket, sender, input) {
        try {
            // Split inputted command into its base command and constituent subcommands
            // Base command is passed to the registry to find command file while
            // full command string is passed to command file for further processing
            const sanInput = this.sanitize(input);
            const tokens = sanInput.trim().split(' ').filter(token => token != '');

            if(tokens.length === 0) return;

            const baseCommand = tokens[0]; //account
            const subCommand = tokens[1]; //uuid
            let npCommand; // No-prefix command

            // TODO: FIX COMMAND PARSER TO HANDLE COMMANDS OF ARBITRARY LENGTH

            if(sanInput.substring(0, 1) === '/' || sanInput.substring(0, 1) === '.') {
                npCommand = baseCommand.substring(1);
            } else {
                npCommand = baseCommand;
            }

            const fullCommand = [npCommand, subCommand].join(' ').trim();
            const dbCommand = await Database.get(Config.get('database.names.world_db'), 'command', 'name', fullCommand);

            let command;

            if(!dbCommand || fullCommand !== dbCommand.name) {
                Log.message(`The command [c:w]${fullCommand}[c:C] does not exist.`, 'INFO');
                return
            }

            if(sender === 'console') {
                command = Registry.get('admin_commands').find(cmd => cmd.name === baseCommand);

                if(!command) {
                    command = Registry.get('player_commands').find(cmd => cmd.name === baseCommand);
                }
            } else {
                const cmdPrefix = baseCommand.substring(0, 1);
                if(cmdPrefix === '/') {
                    command = Registry.get('player_commands').find(cmd => cmd.name === baseCommand.substring(1));
                } else if(cmdPrefix === '.') {
                    command = Registry.get('admin_commands').find(cmd => cmd.name === baseCommand.substring(1));
                } else {
                    return;
                }
            }

            // The command exists and is valid, process here
            // TODO: validate permissions
            const senderPermission = sender === 'console' ? 3 : Registry.get('players', sender.id).permissions;

            if(senderPermission >= dbCommand.permission) {
                if(command && typeof command.execute === 'function') {
                    await command.execute(socket, sender, sanInput);
                } else {
                    Log.message(`The command [c:w]${fullCommand}[c:C] does not exist.`, 'INFO');
                }
            } else {
                return;
            }
        } catch(err) {
            Log.message(`Error: ${err.stack}`, 'ERROR');
        }
    }
}