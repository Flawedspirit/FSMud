class Config {

    constructor() {
        this.config = null;
    }

    async loadConfig() {
        try {
            const configFile = await fetch('../config/gameconf.json');
            if(!configFile.ok) {
                console.log(`Error loading config file: ${err}`);
            }
            this.config = await configFile.json();
        } catch(err) {
            console.log(`Error loading config file: ${err}`);
        }
    }

    get(path) {
        if(!this.config) {
            console.error('Config not yet loaded!');
            return null;
        }

        let parts = path.split('.');
        let config = this.config;

        for(let key of parts) {
            if(!config[key]) {
                return null;
            }

            config = config[key];
        }

        return config;
    }
}