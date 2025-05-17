const { Color, Log } = baseRequire('server/core/tools');
const Database = baseRequire('server/core/database');
const Package = baseRequire('package.json');
const Commands = require('./commands');
const Server = require('./server');
const WorldEvents = require('./events');

const logo = [
    Color.parse("[c:c]███████[c:w]┐ [c:c]███████[c:w]┐   [c:c]██[c:w]┐     [c:c]██[c:w]┐ [c:c]██[c:w]┐  [c:c]██[c:w]┐ [c:c]██████[c:w]┐"),
    Color.parse("[c:c]██[c:w]╒════╛ [c:c]██[c:w]╒════╛   [c:c]████[c:w]┐ [c:c]████[c:w]│ [c:c]██[c:w]│  [c:c]██[c:w]│ [c:c]██[c:w]╒══[c:c]██[c:w]┐"),
    Color.parse("[c:c]█████[c:w]┐   [c:c]███████[c:w]┐   [c:c]██[c:w]╒[c:c]████[c:w]╒[c:c]██[c:w]│ [c:c]██[c:w]│  [c:c]██[c:w]│ [c:c]██[c:w]│  [c:c]██[c:w]│"),
    Color.parse("[c:c]██[c:w]╒══╛   [c:w]╘════[c:c]██[c:w]│   [c:c]██[c:w]│╘[c:c]██[c:w]╒╛[c:c]██[c:w]│ [c:c]██[c:w]│  [c:c]██[c:w]│ [c:c]██[c:w]│  [c:c]██[c:w]│"),
    Color.parse("[c:c]██[c:w]│      [c:c]███████[c:w]│   [c:c]██[c:w]│ ╘═╛ [c:c]██[c:w]│ [c:c]███████[c:w]│ [c:c]██████[c:w]╒╛"),
    Color.parse("[c:w]╘═╛      ╘══════╛   ╘═╛     ╘═╛ ╘══════╛ ╘═════╛[r]"),
    Color.parse("[c:w][s:b]Version:[r] " + Package.version + "[r]\n"),
]

module.exports = {
    async init() {
        Log.raw(logo.join('\r\n'));

        await Database.init();
        await Commands.init();
        await WorldEvents.init();
        await Server.init();
    }
}