module.exports = [
    {
        name: 'played',
        subcommands: [],
        async execute(sender, command) {
            command = Command.tokensToArray(command);

            if(command.length === 1) {

                return;
            }
        }
    }
]