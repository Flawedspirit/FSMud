const staticConfig = baseRequire('server/env/config.json');

module.exports = {
    get(path) {
        let parts = path.split('.');

        if(!parts.length) return;

        let config = staticConfig;

        for(let key of parts) {
            if(!config[key]) {
                return config;
            }

            config = config[key];
        }

        return config;
    }
}