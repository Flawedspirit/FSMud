module.exports = {
    async newUUID() {
        return await "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c /4).toString(16)
        );
    },

    /**
     * Returns true if the provided string is a valid UUID
     * Valid format is {00000000-0000-0000-0000-000000000000}
     * @param {string} input - String to check
     * @returns
     */
    async isUUID(input) {
        return (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).test(input);
    }
}