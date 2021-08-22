const fs = require('fs');

/**
 * 
 * @param {number} number 
 * @param {number} arrLength
 * @returns {string}
 */
const pad = (number, arrLength) => {
    const curdigits = `${number}`.length;
    const totaldigits = `${arrLength}`.length + 1;
    return '0'.repeat(totaldigits - curdigits) + number;
};

/**
 * 
 * @param {string} str
 * @returns {string} 
 */
const removePad = (str) => {
    let index = 0;
    while (index < str.length - 1 && str[index] === '0') {
        index++;
    }
    return str.substr(index);
};

/**
 * 
 * @param {string} msg 
 */
const print = (msg) => {
    // these lines need to be commented out to work for massBorderFix.js
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(msg);
};

/**
 * @param {Object} config 
 */
const saveConfig = (config) => {
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 4), { encoding: 'utf-8' });
};

module.exports = {
    pad,
    removePad,
    print,
    saveConfig,
};