const readline = require('readline');
const { parse } = require('./color');

const logLevel = {
    'INFO':  { color: 'c:C' },
    'WARN':  { color: 'c:Y' },
    'ERROR': { color: 'c:R' },
    'CHAT':  { color: 'c:G' },
    'MOVE':  { color: 'c:M' },
    'AUTH':  { color: 'c:B' },
}

module.exports = {
    /**
     * Logs a formatted message to the console.
     * @param {string} message - The message to log.
     * @param {string} level - INFO, WARN, ERROR, CHAT, MOVE, ITEM\nDefault is INFO.
     */
    message(message, level = 'INFO') {
        let dt = new Date();
        let s  = dt.getSeconds();
        let m  = dt.getMinutes();
        let h  = dt.getHours();

        if(s < 10) { s = `0${s}` }
        if(m < 10) { m = `0${m}` }
        if(h < 10) { h = `0${h}` }

        let str = parse(`[c:W][${h}:${m}:${s}][r]`);
        str += parse(`[${logLevel[level].color}] [${level}] `);
        str += parse(`${message}[r]`);

        if(readline.cursorTo) {
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
        }

        console.log(str);

        if(global.line && global.line.prompt) global.line.prompt(true);
    },

    /**
     * Logs a raw message to the console.
     * @param {string} message - The message to log.
     * @param {boolean} forceTimestamp - If true, forces the timestamp to be displayed.
     */
    raw(message, forceTimestamp = false) {
        let str = "";

        if (forceTimestamp) {
            let dt = new Date();
            let s  = dt.getSeconds();
            let m  = dt.getMinutes();
            let h  = dt.getHours();

            if(s < 10) { s = `0${s}` }
            if(m < 10) { m = `0${m}` }
            if(h < 10) { h = `0${h}` }

            str += parse(`[c:W][${h}:${m}:${s}][r] `);
        }

        if(readline.cursorTo) {
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
        }

        str += message;
        console.log(str);

        if(global.line && global.line.prompt) global.line.prompt(true);
    }
}