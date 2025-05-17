const Config = baseRequire('server/core/config');

const colorAlias = {
    // Normal
    'c:k': '[30m',
    'c:r': '[31m',
    'c:g': '[32m',
    'c:y': '[33m',
    'c:b': '[34m',
    'c:m': '[35m',
    'c:c': '[36m',
    'c:w': '[37m',

    // Bright
    'c:K': '[90m',
    'c:R': '[91m',
    'c:G': '[92m',
    'c:Y': '[93m',
    'c:B': '[94m',
    'c:M': '[95m',
    'c:C': '[96m',
    'c:W': '[97m',

    // Background
    'b:k': '[40m',
    'b:r': '[41m',
    'b:g': '[42m',
    'b:y': '[43m',
    'b:b': '[44m',
    'b:m': '[45m',
    'b:c': '[46m',
    'b:w': '[47m',

    // Background Bright
    'b:K': '[100m',
    'b:R': '[101m',
    'b:G': '[102m',
    'b:Y': '[103m',
    'b:B': '[104m',
    'b:M': '[105m',
    'b:C': '[106m',
    'b:W': '[107m',

    // Style
    's:b': '[1m',
    's:u': '[4m',
    's:r': '[7m',

    // Reset
    'r': '[0m'
};

/**
 * Parses the given text and replaces provided color codes with ANSI escape codes.
 * @param {string} text - The text to parse.
 * @returns {string} The parsed text with ANSI escape codes.
 */
const parse = text => {
    if(!text) return "";

    text = text.toString();

    for(let symbol in colorAlias) {
        text = text.replace(new RegExp(`\\[${symbol}\\]`, 'g'), '\u001b' + colorAlias[symbol]);
    }

    return text;
}

module.exports = {
    parse,
};