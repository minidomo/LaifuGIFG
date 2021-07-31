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
 * @param {number} length 
 * @param {string} msg 
 */
const print = (length, msg) => {
    const diff = length - msg.length;
    let spaces = '';
    if (length > 0) {
        spaces = ' '.repeat(diff);
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(msg + spaces);
};

module.exports = {
    pad,
    removePad,
    print,
};