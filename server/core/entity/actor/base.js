const { Color } = baseRequire('server/core/tools');
const Registry = baseRequire('server/core/registry');

class Actor {
    constructor(params = {}) {
        this.id = params.id || null;
        this.name = params.name || null;
        this.race = params.race || 0;
        this.sex = params.sex || 0;
        this.health = params.health || 0;
        this.attributes = params.attributes || {
            strength: 10,
            vitality: 10,
            agility: 10,
            willpower: 10,
            perception: 10
        };
        this.equipped = params.equipped || {
            head: null,
            neck: null,
            chest: null,
            legs: null,
            hands: null,
            boots: null,
            ring1: null,
            ring2: null,
            relic: null,
            mainHand: null,
            offHand: null
        };
        this.mapID = params.mapID || 0;
        this.mapX = params.mapX || 0;
        this.mapY = params.mapY || 0;
    }

    get color() {
        return 'c:w';
    }

    get displayName() {
        return `[c:w]${this.name}[r]`;
    }

    /**
     * Changes the active item in the provided equipment slot.
     * @param {Item} item
     * @param {string} slot
     */
    equipItem(item, slot) {
        if(!this.equipped.slot) {
            return;
        }
    }

    dump() {
        return {
            name: this.name,
            race: this.race,
            sex: this.sex,
            attributes: this.attributes,
            equipped: this.equipped,
            mapID: this.mapID,
            mapX: this.mapX,
            mapY: this.mapY
        };
    }
}