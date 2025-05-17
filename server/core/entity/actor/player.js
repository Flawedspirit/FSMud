class Player extends Actor {
    constructor(params = {}) {
        super(params);

        this.flags = params.flags || 0;
        this.level = params.level || 1;
        this.xp = params.xp || 0;
        this.money = params.money || 0;
        this.skills = params.skills || {
            cooking: 1,
            herbalism: 1,
            mining: 1
        };
        this.permissions = params.permissions;
    }
}