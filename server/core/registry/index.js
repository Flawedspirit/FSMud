const data = {
    admin_commands: [],
    player_commands: [],
    players: []
};

module.exports = {
    add(collection, key, obj) {
        data[collection][key] = obj;
    },

    remove(collection, key) {
        delete data[collection][key];
    },

    get(collection, key) {
        if(!key) return data[collection];

        return data[collection][key];
    },

    append(collection, data) {
        data[collection] = {
            ...data[collection],
            ...data
        };
    }
}