class Packet {
    constructor(type, data = {}) {
        this.type = type;
        this.data = data;
        this.timestamp = Date.now();
    }

    toJSON() {
        return JSON.stringify({
            type: this.type,
            data: this.data,
            timestamp: this.timestamp
        });
    }

    static fromJSON(string) {
        try {
            const json = JSON.parse(string);
            return new Packet(json.type, json.data, json.timestamp);
        } catch(err) {
            throw new Error('Invalid JSON string for type Packet');
        }
    }
}

module.exports = Packet;