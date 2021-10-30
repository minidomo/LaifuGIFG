const config = require('../config.json');
const fs = require('fs');

const FILE_REGEX = /Image \((\d+(?:\.\d+)?)\) (\d+)\.png/;

/**
 * @typedef {Object} ParsedImageName
 * @property {number} id
 * @property {number} num
 */

/**
 * 
 * @param {string} name 
 * @returns {?ParsedImageName}
 */
const parseImageFileName = (name) => {
    if (FILE_REGEX.test(name)) {
        const [, id1, num1] = FILE_REGEX.exec(name);
        const obj = {
            id: parseFloat(id1),
            num: parseFloat(removePad(num1)),
        };
        return obj;
    }
    return null;
};

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
    if (config.script === 'massBorderFix') {
        return;
    }
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
    parseImageFileName,
    pad,
    removePad,
    print,
    saveConfig,
};