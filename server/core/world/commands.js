const { Log } = baseRequire('server/core/tools');
const Config = baseRequire('server/core/config');
const Database = baseRequire('server/core/database');
const Registry = baseRequire('server/core/registry');

module.exports = {
    async init() {
        const adminCommands = baseRequire('server/core/command/admin');
        //const playerCommands = baseRequire('server/core/command/player');

        Registry.get('commands').push(...adminCommands);

        Log.message(`Registered ${Registry.get('commands').length} commands.`);
    },

    async processCommand(sender, input) {
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
                await command.execute(sender, input);
            } else {
                Log.message(`The command [c:w]${input}[c:C] does not exist.`, 'INFO');
            }
        } catch(err) {
            Log.message(`Error: ${err.stack}`, 'ERROR');
        }
    }
}