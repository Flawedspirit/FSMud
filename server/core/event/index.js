const Emitter = require('events');

const emitter = new Emitter();

module.exports = {
    call(name, ...payload) {
        name = name.toUpperCase();
        emitter.emit(name, ...payload);
    },
    on: (name, callback) => emitter.on(name, callback),
    once: (name, callback) => emitter.once(name, callback),
}