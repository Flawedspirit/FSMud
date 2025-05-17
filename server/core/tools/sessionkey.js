module.exports = {
    async newKey() {
        const chars = "0123456789abcdef";
        let result = "";
        for(let i = 0; i < 40; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}