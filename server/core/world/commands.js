const { Log } = baseRequire('server/core/tools');
const Registry = baseRequire('server/core/registry');

module.exports = {
    async init() {
        const adminCommands = baseRequire('server/core/command/admin');
        //const playerCommands = baseRequire('server/core/command/player');

        Registry.get('commands').push(...adminCommands);

        Log.message(`Registered ${Registry.get('commands').length} commands.`);
    }
}