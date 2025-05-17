module.exports = {
    tokensToArray(command) {
        return command.split(' ').filter(token => token.trim() !== '');
    }
}