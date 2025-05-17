const { Log } = baseRequire('server/core/tools');
const Event = baseRequire('server/core/event');

const listeners = {
    'SAVE': (params = 'all') => {},
    'SOCKET_CONNECTED': socket => {
        // TBA
    }
}

module.exports = {
    init() {
        for(let i in listeners) {
            Event.on(i, listeners[i]);
        }

        Log.message(`${Object.keys(listeners).length} event listeners loaded.`, 'INFO');
    }
}