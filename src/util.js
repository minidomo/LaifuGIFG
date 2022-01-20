'use strict';

const { promisify } = require('util');
const fs = require('fs');

const unlinkAsync = promisify(fs.unlink);

const time = (() => {
    /** @type {Map<string, [number, number]} */
    const timeMap = new Map();

    /**
     *
     * @param {Object} data
     * @param {string} data.label
     * @param {'set'|'get'} data.type
     * @returns {number|undefined}
     */
    const func = data => {
        switch (data.type) {
            case 'set': {
                timeMap.set(data.label, process.hrtime());
                return undefined;
            }
            case 'get': {
                const oldTime = timeMap.get(data.label);
                if (!oldTime) return undefined;
                const curTime = process.hrtime(oldTime);
                const seconds = (curTime[0] * 1e9 + curTime[1]) / 1e9;
                return seconds;
            }
            default: {
                throw new Error(`Provided type is invalid: ${data.type}`);
            }
        }
    };

    return func;
})();

module.exports = {
    /**
     *
     * @param {number} length
     * @param {number} num
     * @returns {string}
     */
    padNumber(length, num) {
        return String(num).padStart(length, '0');
    },
    /**
     *
     * @param {string} dirPath
     * @returns {Promise<void>}
     */
    async clearDirectory(dirPath) {
        const promises = [];
        const files = fs.readdirSync(dirPath, { encoding: 'utf-8', withFileTypes: true });
        files.forEach(file => promises.push(unlinkAsync(`${dirPath}/${file.name}`)));
        await Promise.all(promises);
    },
    time,
    /**
     *
     * @param {string} message
     * @param {import('pino').pino.LogFn} loggerFunc
     */
    logAllLines(message, loggerFunc) {
        message.split(/[\r\n]+/)
            .map(str => str.trim())
            .filter(str => str && str.length > 0)
            .forEach(str => loggerFunc(str));
    },
};
