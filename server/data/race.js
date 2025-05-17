module.exports = {
    getRaceName(raceID) {
        const races = [
            'human',
            'harné',
            'lukhani',
            'ka\'mush',
            'kelikaar',
            'madrani',
            'vultani'
        ];
        return races[raceID];
    }
}